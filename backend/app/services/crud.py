from sqlalchemy.orm import Session
from app.db import models
from app.schemas.contract import ProjectCreate

def create_project(db: Session, project: ProjectCreate):
    schema_json = [col.dict() for col in project.schema_definition]
    
    db_project = models.Project(
        name=project.name,
        description=project.description,
        target_column=project.target_column,
        schema_definition=schema_json
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def get_projects(db: Session, skip: int = 0, limit: int = 100):
    """Mengambil daftar semua project"""
    return db.query(models.Project).offset(skip).limit(limit).all()