from pydantic import BaseModel
from typing import List, Optional

# Definisi untuk satu kolom
class ColumnDefinition(BaseModel):
    name: str
    dtype: str  # Contoh: "int", "float", "object" (string)
    required: bool = True

# Definisi untuk satu Schema (Kontrak) penuh
class DataContract(BaseModel):
    project_name: str
    version: str
    columns: List[ColumnDefinition]
    
    class Config:
        schema_extra = {
            "example": {
                "project_name": "Credit Scoring Model",
                "version": "v1.0",
                "columns": [
                    {"name": "age", "dtype": "int", "required": True},
                    {"name": "income", "dtype": "float", "required": True},
                    {"name": "loan_status", "dtype": "object", "required": False}
                ]
            }
        }
        
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    # User langsung kirim list kolom saat bikin project
    schema_definition: List[ColumnDefinition]

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    schema_definition: List[ColumnDefinition]
    
    class Config:
        orm_mode = True