from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from app.db import models, database
from app.schemas.contract import ProjectCreate, ProjectResponse, DataContract, ColumnDefinition
from app.services import validator, crud
import pandas as pd
import io

# Init Database Tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="DATAION API",
    description="Backend service for DATAION Data Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency untuk dapat koneksi DB per request
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
    """Membuat project baru dengan definisi schema"""
    return crud.create_project(db=db, project=project)

@app.get("/projects/{project_id}", response_model=ProjectResponse)
def read_project(project_id: int, db: Session = Depends(get_db)):
    """Melihat detail project dan schemanya"""
    db_project = crud.get_project(db, project_id=project_id)
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

# --- VALIDATION ENDPOINT (UPDATED) ---

@app.post("/data/validate/{project_id}")
async def validate_data(
    project_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    """
    Validasi CSV berdasarkan Schema milik Project ID tertentu.
    """
    # 1. Ambil Schema dari Database
    db_project = crud.get_project(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Konversi schema dari DB (JSON) kembali ke format DataContract agar bisa dipakai validator
    # Kita butuh object DataContract untuh helper validator
    contract_obj = DataContract(
        project_name=db_project.name,
        version="v1", # Versi dummy dulu
        columns=[ColumnDefinition(**col) for col in db_project.schema_definition]
    )

    # 2. Cek File CSV
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read CSV file: {str(e)}")
    
    # 3. Validasi
    result = validator.validate_dataframe(df, contract_obj)
    
    return {
        "project": db_project.name,
        "filename": file.filename,
        "valid": result["valid"],
        "details": result
    }