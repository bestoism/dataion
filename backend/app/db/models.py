from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.sql import func
from app.db.database import Base
from sqlalchemy import ForeignKey 
from sqlalchemy.orm import relationship # 

class Project(Base):
    __tablename__ = "projects"   

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    target_column = Column(String) # <--- TAMBAHAN BARU
    
    schema_definition = Column(JSON, default=[])
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    filename = Column(String)
    file_path = Column(String) # Lokasi file di folder server
    row_count = Column(Integer)
    is_valid = Column(Integer) # 1 = Valid, 0 = Invalid (pakai Integer biar simple di SQLite)
    
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relasi agar bisa dipanggil dari project
    project = relationship("Project", back_populates="datasets")

# Update Class Project agar tahu dia punya banyak dataset
Project.datasets = relationship("Dataset", back_populates="project")