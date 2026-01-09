from fastapi import FastAPI
from app.schemas.contract import DataContract

app = FastAPI(
    title="DATAION API",
    description="Backend service for DATAION Data Platform",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"status": "active", "system": "DATAION Backend"}

@app.post("/schema/test")
def test_schema(contract: DataContract):
    """
    Endpoint sementara untuk tes validasi format kontrak data.
    Kirim JSON sesuai format, API akan mereturnnya kembali jika valid.
    """
    return {
        "message": "Schema valid",
        "received_contract": contract
    }