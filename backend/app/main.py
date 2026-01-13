from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse 
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

# Import Schema & Models
from app.db import models, database
from app.schemas.contract import ProjectCreate, ProjectResponse, DataContract, ColumnDefinition
from app.services import validator, crud, ml_engine

import pandas as pd
import io
import os
import shutil
import uuid

import numpy as np
from fastapi.responses import FileResponse 

# Init Database
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="DATAION API",
    description="Backend service for DATAION Data Platform",
    version="1.0.0"
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
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

# === UPDATE & DELETE PROJECT ===

@app.put("/projects/{project_id}/schema", response_model=ProjectResponse)
def update_schema(project_id: int, new_schema: List[ColumnDefinition], db: Session = Depends(get_db)):
    schema_json = [col.dict() for col in new_schema]
    updated_project = crud.update_project_schema(db, project_id, schema_json)
    if not updated_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated_project

@app.delete("/projects/{project_id}")
def delete_existing_project(project_id: int, db: Session = Depends(get_db)):
    success = crud.delete_project(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"status": "success", "message": "Project deleted"}

# =======================================

@app.get("/projects/{project_id}/datasets")
def get_project_datasets(project_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Dataset)
        .filter(models.Dataset.project_id == project_id)
        .order_by(models.Dataset.upload_date.desc())
        .all()
    )

# --- VALIDATION ---

@app.post("/data/validate/{project_id}")
async def validate_data(project_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    db_project = crud.get_project(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

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

# --- TRAIN MODEL (UPDATED SESUAI PERMINTAAN) ---

@app.post("/models/train/{project_id}")
async def train_model(project_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    db_project = crud.get_project(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")

    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read CSV: {str(e)}")

    contract_obj = DataContract(
        project_name=db_project.name,
        version="v1",
        columns=[ColumnDefinition(**col) for col in db_project.schema_definition]
    )

    validation_result = validator.validate_dataframe(df, contract_obj)
    if not validation_result["valid"]:
        raise HTTPException(status_code=400, detail="Data validation failed. Cannot train model.")

    try:
        # Gunakan nama unik: model_projectID
        prefix = f"model_project_{project_id}"
        training_result = ml_engine.train_automl(
            df,
            target_col=db_project.target_column,
            filename_prefix=prefix
        )

        return {
            "status": "success",
            "project": db_project.name,
            "metrics": training_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

# --- DATASET STATS (EDA) ---

@app.get("/datasets/{dataset_id}/stats")
def get_dataset_stats(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    project = crud.get_project(db, dataset.project_id)
    
    try:
        df = pd.read_csv(dataset.file_path)
    except Exception:
        raise HTTPException(status_code=500, detail="File lost")

    total_rows = len(df)
    target_col = project.target_column
    
    # --- HITUNG KORELASI (BARU) ---
    correlations = {}
    if target_col in df.columns:
        # Buat copy sementara untuk hitung korelasi
        df_corr = df.copy()
        # Convert kolom kategori ke angka agar bisa dihitung korelasinya (Label Encoding sederhana)
        for col in df_corr.select_dtypes(include=['object']).columns:
            df_corr[col] = pd.factorize(df_corr[col])[0]
        
        # Hitung korelasi terhadap target
        corr_matrix = df_corr.corr()
        if target_col in corr_matrix:
            target_corr = corr_matrix[target_col].drop(target_col).fillna(0).to_dict()
            # Ambil nilai absolut untuk melihat kekuatan hubungan
            correlations = {k: round(v, 3) for k, v in target_corr.items()}

    # --- HITUNG STATISTIK PER KOLOM ---
    stats = []
    for col in df.columns:
        col_type = str(df[col].dtype)
        missing_count = int(df[col].isnull().sum())
        
        col_stat = {
            "name": col,
            "type": col_type,
            "missing": missing_count,
            "missing_pct": round((missing_count / total_rows) * 100, 1),
            "unique": int(df[col].nunique()),
            "correlation": correlations.get(col, 0), # Ambil korelasi yang dihitung tadi
            "sample": df[col].dropna().head(3).tolist()
        }

        if pd.api.types.is_numeric_dtype(df[col]):
            col_stat["mean"] = round(float(df[col].mean()), 2)
            col_stat["std"] = round(float(df[col].std()), 2) # Tambah Standar Deviasi
            col_stat["median"] = float(df[col].median()) # Tambah Median
            col_stat["min"] = float(df[col].min())
            col_stat["max"] = float(df[col].max())
        else:
            col_stat["distribution"] = df[col].value_counts().head(3).to_dict()

        stats.append(col_stat)

    return {
        "filename": dataset.filename,
        "total_rows": total_rows,
        "total_cols": len(df.columns),
        "target_column": target_col,
        "columns": stats
    }

# --- TRAIN FROM HISTORY ---

@app.post("/models/train-existing/{dataset_id}")
def train_model_from_history(dataset_id: int, model_type: str = "rf", db: Session = Depends(get_db)):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    project = crud.get_project(db, dataset.project_id)

    try:
        df = pd.read_csv(dataset.file_path)
    except Exception:
        raise HTTPException(status_code=500, detail="File lost from server")

    try:
        prefix = f"model_project_{project.id}"
        # Kirim parameter model_type
        training_result = ml_engine.train_automl(
            df, 
            target_col=project.target_column, 
            filename_prefix=prefix,
            model_type=model_type
        )
        return {
            "status": "success",
            "project": project.name,
            "metrics": training_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


@app.get("/models/download/{filename}")
def download_model(filename: str):
    # Pastikan path sesuai dengan tempat ml_engine menyimpan file
    file_path = os.path.join("models", filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Model file not found on server")
    
    return FileResponse(file_path, media_type='application/octet-stream', filename=filename)

class CleaningRequest(BaseModel):
    action: str  # 'drop_na', 'fill_mean', 'convert_numeric'
    columns: List[str]

@app.post("/datasets/{dataset_id}/clean")
def clean_dataset(dataset_id: int, req: CleaningRequest, db: Session = Depends(get_db)):
    # 1. Ambil dataset asal
    old_dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if not old_dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        df = pd.read_csv(old_dataset.file_path)
    except Exception:
        raise HTTPException(status_code=500, detail="Original file lost")

    # 2. Eksekusi Logic Cleaning
    if req.action == "drop_na":
        df = df.dropna(subset=req.columns)
    
    elif req.action == "fill_mean":
        for col in req.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                df[col] = df[col].fillna(df[col].mean())
    
    elif req.action == "convert_numeric":
        for col in req.columns:
            # errors='coerce' akan mengubah spasi/karakter aneh menjadi NaN (angka kosong)
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # 3. Simpan sebagai file baru (Versioning)
    clean_filename = f"cleaned_{uuid.uuid4().hex[:6]}_{old_dataset.filename}"
    clean_path = os.path.join(UPLOAD_DIR, clean_filename)
    df.to_csv(clean_path, index=False)

    # 4. Catat ke Database sebagai dataset baru
    new_ds = models.Dataset(
        project_id=old_dataset.project_id,
        filename=clean_filename,
        file_path=clean_path,
        row_count=len(df),
        is_valid=1 # Setelah dibersihkan harusnya valid
    )
    db.add(new_ds)
    db.commit()
    db.refresh(new_ds)

    return {
        "status": "success", 
        "message": f"Applied {req.action} on {len(req.columns)} columns",
        "new_dataset_id": new_ds.id
    }
    
    
class PredictionRequest(BaseModel):
    data: dict # Berisi input dari user sesuai schema

@app.post("/projects/{project_id}/predict")
def predict_data(project_id: int, req: PredictionRequest, db: Session = Depends(get_db)):
    # 1. Cari model artifact
    model_filename = f"model_project_{project_id}.joblib"
    model_path = os.path.join("models", model_filename)
    
    if not os.path.exists(model_path):
        raise HTTPException(status_code=404, detail="Model artifact not found. Please train the model first.")
    
    # 2. Load Artifact
    artifact = joblib.load(model_path)
    model = artifact["model"]
    train_features = artifact["features"]
    target_mapping = artifact["target_mapping"]

    # 3. Preprocessing Input Data
    # Ubah input dict ke DataFrame
    df_input = pd.DataFrame([req.data])

    # Samakan proses dummies seperti saat training
    df_encoded = pd.get_dummies(df_input)

    # --- ALIGNMENT LOGIC (SANGAT PENTING) ---
    # Tambahkan kolom yang hilang dengan nilai 0 (karena dummies)
    # Buang kolom yang tidak ada saat training
    for col in train_features:
        if col not in df_encoded.columns:
            df_encoded[col] = 0
            
    # Pastikan urutan kolom SAMA PERSIS dengan saat training
    df_encoded = df_encoded[train_features]

    # 4. Predict
    try:
        prediction = model.predict(df_encoded)[0]
        probabilities = model.predict_proba(df_encoded)[0] # Ambil probabilitas tiap kelas
        
        # Mapping hasil
        result_label = target_mapping.get(int(prediction), str(prediction))
        
        # Buat list probabilitas yang cantik
        prob_details = {}
        for idx, prob in enumerate(probabilities):
            label = target_mapping.get(idx, f"Class {idx}")
            prob_details[label] = round(float(prob) * 100, 2)

        return {
            "prediction": result_label,
            "confidence": round(float(max(probabilities)) * 100, 2),
            "all_probabilities": prob_details
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")