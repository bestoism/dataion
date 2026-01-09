from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Menggunakan SQLite untuk sekarang. Nanti tinggal ganti URL ini kalau mau ke PostgreSQL
SQLALCHEMY_DATABASE_URL = "sqlite:///./dataion.db"

# Create Engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Session Local untuk interaksi database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base Class untuk model
Base = declarative_base()

# Dependency Injection untuk FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()