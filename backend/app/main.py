from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # <--- IMPORT INI
from app.schemas.contract import DataContract
from app.services.validator import validate_dataframe
import pandas as pd
import io

app = FastAPI(
    title="DATAION API",
    description="Backend service for DATAION Data Platform",
    version="1.0.0"
)

# ### BARU: SETTING CORS ###
# Ini mengizinkan frontend (atau Swagger UI) untuk mengakses API tanpa diblokir
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Mengizinkan semua origin (untuk development aman)
    allow_credentials=True,
    allow_methods=["*"],  # Mengizinkan semua method (GET, POST, dll)
    allow_headers=["*"],  # Mengizinkan semua header
)
# ##########################

# --- MOCK DATABASE (Sementara) ---
active_contract = DataContract(
    project_name="Demo Project",
    version="v1",
    columns=[
        {"name": "age", "dtype": "int", "required": True},
        {"name": "salary", "dtype": "float", "required": True},
        {"name": "city", "dtype": "object", "required": False}
    ]
)

@app.get("/")
def read_root():
    return {"status": "active", "system": "DATAION Backend"}

@app.get("/schema/current")
def get_current_schema():
    return active_contract

@app.post("/data/validate")
async def validate_data(file: UploadFile = File(...)):
    # 1. Cek ekstensi file
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    # 2. Baca file menjadi Pandas DataFrame
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read CSV file: {str(e)}")
    
    # 3. Jalankan Validasi Logic
    result = validate_dataframe(df, active_contract)
    
    return {
        "filename": file.filename,
        "total_rows": len(df),
        "validation_result": result
    }