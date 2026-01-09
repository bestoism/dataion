from sqlalchemy.orm import Session
from app.db import models
from app.schemas.contract import ProjectCreate
from sqlalchemy import func

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
    return db.query(models.Project).offset(skip).limit(limit).all()

# --- FUNGSI UPDATE & DELETE (Pastikan ini ada) ---

def update_project_schema(db: Session, project_id: int, new_schema: list):
    db_project = get_project(db, project_id)
    if db_project:
        # Update kolom JSON schema
        db_project.schema_definition = new_schema
        # Update timestamp
        db_project.updated_at = func.now()
        
        db.commit()
        db.refresh(db_project)
    return db_project

def delete_project(db: Session, project_id: int):
    db_project = get_project(db, project_id)
    if db_project:
        # Hapus dataset terkait dulu (manual cascade untuk safety di SQLite)
        db.query(models.Dataset).filter(models.Dataset.project_id == project_id).delete()
        
        # Hapus project
        db.delete(db_project)
        db.commit()
        return True
    return False