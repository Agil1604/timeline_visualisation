from app.models.project import Project, ProjectType
from app.models.project_linear import ProjectLinear
from app.models.project_gantt import ProjectGantt
from app import db
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from typing import Optional, Dict, Type

_project_classes: Dict[ProjectType, Type[Project]] = {
    ProjectType.LINEAR: ProjectLinear,
    ProjectType.GANTT: ProjectGantt,
}

class ProjectService:
    """Сервис для управления проектами: создание, получение, обновление и удаление.
    
    Обеспечивает взаимодействие между бизнес-логикой и моделью данных проекта.
    """

    @staticmethod
    def create_project(owner: str, project_type: ProjectType, title: str, description: str) -> Project:
        """Создает новый проект указанного типа.

        Args:
            owner (str): email владельца проекта.
            project_type (ProjectType): Тип проекта.
            title (str): Название проекта.
            description (str): Описание проекта.

        Returns:
            Project: Созданный объект проекта.

        Raises:
            ValueError: При указании недопустимого типа проекта или ошибке БД.
        """
        project_class = _project_classes.get(project_type)
        if not project_class:
            raise ValueError(f"Недопустимый тип проекта: {project_type}")
        
        project = project_class(
            owner=owner,
            type=project_type,
            title=title,
            description=description
        )
        
        try:
            db.session.add(project)
            db.session.commit()
            return project
        except SQLAlchemyError as e:
            db.session.rollback()
            raise ValueError("Ошибка при создании проекта")
        
    @staticmethod
    def get_user_projects(owner: str) -> list[Project]:
        """Получает все проекты, принадлежащие указанному пользователю.

        Args:
            owner (str): email владельца проекта.

        Returns:
            list[Project]: Список проектов пользователя.
        """
        projects = Project.query.filter_by(owner=owner).all()
        return projects
    
    @staticmethod
    def get_project(id: int) -> Project:
        """Получает проект по его идентификатору.

        Args:
            id (int): id проекта.

        Returns:
            Project: Найденный объект проекта.

        Raises:
            ValueError: Если проект с указанным id не найден
        """
        project = Project.query.get(id)
        if not project:
            raise ValueError("Project not found")
        return project
    
    @staticmethod
    def delete_project(id: int, email: str) -> None:
        """Удаляет проект с проверкой прав доступа.

        Args:
            id (int): id проекта.
            email (str): email владельца проекта.

        Raises:
            ValueError: Если проект не найден или произошла ошибка БД
            PermissionError: Если пользователь не является владельцем проекта
        """
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
        """Обновляет метаданные проекта (название и описание).

        Args:
            project_id (int): id проекта.
            current_user (str): email владельца проекта.
            new_title (str): Новое название проекта (если требуется обновление).
            new_description (str): Новое описание проекта (если требуется обновление).

        Returns:
            Project: Обновленный объект проекта.

        Raises:
            ValueError: Если проект не найден.
            PermissionError: Если пользователь не является владельцем.
            IntegrityError: При возникновении ошибок целостности данных.
        """
        project = Project.query.get(project_id)
        
        if not project:
            raise ValueError("Project not found")
            
        if project.owner != current_user:
            raise PermissionError("You don't own this project")

        if new_title:
            project.title = new_title
        if new_description:
            project.description = new_description

        try:
            db.session.commit()
            return project
        except SQLAlchemyError:
            db.session.rollback()
            raise IntegrityError("Database error")