from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List # <--- WAJIB ADA

# Import Schema & Models
from app.db import models, database
from app.schemas.contract import ProjectCreate, ProjectResponse, DataContract, ColumnDefinition # <--- ColumnDefinition WAJIB ADA
from app.services import validator, crud, ml_engine

import pandas as pd
import io
import os
import shutil
import uuid

# Init Database
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="DATAION API",
    description="Backend service for DATAION Data Platform",
    version="1.0.0"
)

# Setup CORS (Agar Frontend bisa akses PUT/DELETE)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], # Pastikan ini bintang (*) agar PUT dan DELETE diizinkan
    allow_headers=["*"],
)

# Folder Uploads
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# DB Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"status": "active", "system": "DATAION Backend"}

# --- PROJECT ENDPOINTS ---

@app.post("/projects/", response_model=ProjectResponse)
def create_new_project(project: ProjectCreate, db: Session = Depends(get_db)):
    return crud.create_project(db=db, project=project)

@app.get("/projects/", response_model=List[ProjectResponse])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_projects(db, skip=skip, limit=limit)

@app.get("/projects/{project_id}", response_model=ProjectResponse)
def read_project(project_id: int, db: Session = Depends(get_db)):
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

# === ENDPOINT BARU (UPDATE & DELETE) ===

@app.put("/projects/{project_id}/schema", response_model=ProjectResponse)
def update_schema(project_id: int, new_schema: List[ColumnDefinition], db: Session = Depends(get_db)):
    """Mengupdate definisi schema project"""
    # Convert Pydantic list ke list of dicts agar bisa disimpan di JSON DB
    schema_json = [col.dict() for col in new_schema]
    
    updated_project = crud.update_project_schema(db, project_id, schema_json)
    if not updated_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated_project

@app.delete("/projects/{project_id}")
def delete_existing_project(project_id: int, db: Session = Depends(get_db)):
    """Menghapus project dan dataset history-nya"""
    success = crud.delete_project(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"status": "success", "message": "Project deleted"}

# =======================================

@app.get("/projects/{project_id}/datasets")
def get_project_datasets(project_id: int, db: Session = Depends(get_db)):
    return db.query(models.Dataset).filter(models.Dataset.project_id == project_id).order_by(models.Dataset.upload_date.desc()).all()

# --- VALIDATION & TRAINING ---

@app.post("/data/validate/{project_id}")
async def validate_data(project_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # 1. Cek Project
    db_project = crud.get_project(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # 2. Simpan File
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    # 3. Validasi
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read CSV: {str(e)}")
    
    contract_obj = DataContract(
        project_name=db_project.name,
        version="v1",
        columns=[ColumnDefinition(**col) for col in db_project.schema_definition]
    )
    result = validator.validate_dataframe(df, contract_obj)

    # 4. Catat History
    new_dataset = models.Dataset(
        project_id=project_id,
        filename=file.filename,
        file_path=file_path,
        row_count=len(df),
        is_valid=1 if result["valid"] else 0
    )
    db.add(new_dataset)
    db.commit()
    
    return {
        "project": db_project.name,
        "filename": file.filename,
        "valid": result["valid"],
        "details": result,
        "dataset_id": new_dataset.id
    }

@app.post("/models/train/{project_id}")
async def train_model(project_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    db_project = crud.get_project(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read CSV: {str(e)}")

    # Validasi dulu sebelum training
    contract_obj = DataContract(
        project_name=db_project.name,
        version="v1",
        columns=[ColumnDefinition(**col) for col in db_project.schema_definition]
    )
    validation_result = validator.validate_dataframe(df, contract_obj)
    
    if not validation_result["valid"]:
        raise HTTPException(status_code=400, detail=f"Data validation failed. Cannot train model.")

    # AutoML
    try:
        training_result = ml_engine.train_automl(df, target_col=db_project.target_column)
        return {
            "status": "success",
            "project": db_project.name,
            "target": db_project.target_column,
            "metrics": training_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")