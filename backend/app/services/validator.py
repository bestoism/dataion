import pandas as pd
from typing import List, Dict, Any
from app.schemas.contract import DataContract

def validate_dataframe(df: pd.DataFrame, contract: DataContract) -> Dict[str, Any]:
    """
    Memvalidasi DataFrame pandas berdasarkan DataContract.
    """
    errors = []
    
    # 1. Cek Kolom Wajib (Missing Columns)
    dataset_columns = df.columns.tolist()
    
    for col_def in contract.columns:
        if col_def.required and col_def.name not in dataset_columns:
            errors.append(f"Missing required column: '{col_def.name}'")
            
    # Jika sudah ada error kolom hilang, stop dulu supaya tidak crash di bawah
    if errors:
        return {"valid": False, "errors": errors}

    # 2. Cek Tipe Data (Sederhana)
    # Kita cek apakah kolom numeric benar-benar numeric
    for col_def in contract.columns:
        if col_def.name in dataset_columns:
            # Ambil data kolom tersebut
            col_data = df[col_def.name]
            
            # Validasi Int/Float
            if col_def.dtype in ["int", "float"]:
                # Coba cek apakah numeric (mengabaikan kosong/NaN sejenak)
                if not pd.api.types.is_numeric_dtype(col_data):
                    errors.append(f"Column '{col_def.name}' expected {col_def.dtype}, but found non-numeric data.")

    # Kesimpulan
    if errors:
        return {"valid": False, "errors": errors}
    
    return {"valid": True, "message": "Data conforms to the contract."}