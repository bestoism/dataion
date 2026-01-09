from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class Project(Base):
    __tablename__ = "projects"   

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    target_column = Column(String) # <--- TAMBAHAN BARU
    
    schema_definition = Column(JSON, default=[])
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())