from app.models.project import Project, ProjectType
from app.models.project_linear import ProjectLinear
from app.models.project_gantt import ProjectGantt
from app import db
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from typing import Optional

class ProjectService:
    @staticmethod
    def create_project(owner: str, project_type: ProjectType, title: str, description: str) -> Project:
        if project_type == ProjectType.LINEAR:
            project = ProjectLinear(
                owner=owner,
                type=project_type,
                title=title,
                description=description
            )
        elif project_type == ProjectType.GANTT:
            project = ProjectGantt(
                owner=owner,
                type=project_type,
                title=title,
                description=description
            )
        else: 
            raise ValueError("Недопустимый тип проекта")

        try:
            db.session.add(project)
            db.session.commit()
            return project
        except SQLAlchemyError as e:
            db.session.rollback()
            raise ValueError("Ошибка при создании проекта")
        
    @staticmethod
    def get_user_projects(owner: str) -> list[Project]:
        projects = Project.query.filter_by(owner=owner).all()
        return projects
    
    @staticmethod
    def get_project(id: int):
        project = Project.query.get(id)
        if not project:
            raise ValueError("Project not found")
        return project
    
    @staticmethod
    def delete_project(id: int, email: str) -> None:
        project = ProjectService.get_project(id)
        if project.owner != email:
            raise PermissionError("You don't own this project")

        try:
            db.session.delete(project)
            db.session.commit()
        except IntegrityError as e:
            db.session.rollback()
            error_info = str(e.orig)
            raise ValueError(error_info)
    
    @staticmethod    
    def update_project(
        project_id: int,
        current_user: str,
        new_title: Optional[str] = None,
        new_description: Optional[str] = None
    ) -> Project:
        project = Project.query.get(project_id)
        
        if not project:
            raise ValueError("Project not found")
            
        if project.owner != current_user:
            raise PermissionError("You don't own this project")

        if new_title:
            project.title = new_title
        if new_description is not None:
            project.description = new_description

        try:
            db.session.commit()
            return project
        except SQLAlchemyError:
            db.session.rollback()
            raise IntegrityError("Database error")