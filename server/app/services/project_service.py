from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from typing import Optional, Dict, Type, Callable
from datetime import datetime, timezone

from app import db

from app.models.project import Project, ProjectType
from app.models.project_linear import ProjectLinear
from app.models.project_chronology import ProjectChronology
from app.models.project_gantt import ProjectGantt

from app.handlers.linear_update_handler import linear_update_handler
from app.handlers.gantt_update_handler import gantt_update_handler
from app.handlers.chronology_update_handler import chronology_update_handler

class ProjectService:
    """Сервис для управления проектами: создание, получение, обновление и удаление.
    
    Обеспечивает взаимодействие между бизнес-логикой и моделью данных проекта.
    """
    _project_classes: Dict[ProjectType, Type[Project]] = {
        ProjectType.LINEAR_YEARS: ProjectLinear,
        ProjectType.LINEAR_DATES: ProjectLinear,
        ProjectType.CHRONOLOGY: ProjectChronology,
        ProjectType.GANTT: ProjectGantt,
    }

    _update_handlers: Dict[ProjectType, Callable[[int, Dict], Dict]] = {
        ProjectType.LINEAR_YEARS: linear_update_handler,
        ProjectType.GANTT: gantt_update_handler,
        ProjectType.CHRONOLOGY: chronology_update_handler
    }
    @classmethod
    def _check_ownership(cls, project: Project, current_user: str) -> None:
        """Проверяет, является ли пользователь владельцем проекта."""
        if project.owner != current_user:
            raise PermissionError("You don't own this project")

    @classmethod
    def _get_project_class(cls, project_type: ProjectType) -> Type[Project]:
        """Получает класс проекта по типу."""
        project_class = cls._project_classes.get(project_type)
        if not project_class:
            raise ValueError(f"Недопустимый тип проекта: {project_type}.")
        return project_class

    @classmethod
    def _get_update_handler(cls, project_type: ProjectType) -> Callable:
        """Получает обработчик обновления по типу проекта."""
        handler = cls._update_handlers.get(project_type)
        if not handler:
            raise ValueError(f"Обработчик для типа {project_type} не найден.")
        return handler

    @staticmethod
    def create_project(current_user: str, project_type: ProjectType, title: str, description: str) -> Project:
        """Создает новый проект указанного типа.

        Args:
            current_user (str): email владельца проекта.
            project_type (ProjectType): Тип проекта.
            title (str): Название проекта.
            description (str): Описание проекта.

        Returns:
            Project: Созданный объект проекта.

        Raises:
            ValueError: При указании недопустимого типа проекта.
            SQLAlchemyError: При ошибке БД.
        """
        project_class = ProjectService._get_project_class(project_type)
        
        project = project_class(
            owner=current_user,
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
            raise SQLAlchemyError("Ошибка при создании проекта.")
        
    @staticmethod
    def get_user_projects(current_user: str) -> list[Project]:
        """Получает все проекты, принадлежащие указанному пользователю.

        Args:
            current_user (str): email владельца проекта.

        Returns:
            list[Project]: Список проектов пользователя.

        Raises:
            SQLAlchemyError: При ошибке БД.
        """
        try:
            projects = Project.query.filter_by(owner=current_user).all()
            return projects
        except SQLAlchemyError as e:
            raise SQLAlchemyError("Ошибка при получении проектов пользователя.")

    @staticmethod
    def get_project(project_id: int) -> Project:
        """Получает проект по его идентификатору.

        Args:
            project_id (int): id проекта.

        Returns:
            Project: Найденный объект проекта.

        Raises:
            ValueError: Если проект с указанным project_id не найден
        """
        project = Project.query.get(project_id)
        if not project:
            raise ValueError("Project not found")
        return project
    
    @staticmethod
    def delete_project(project_id: int, current_user: str) -> None:
        """Удаляет проект с проверкой прав доступа.

        Args:
            project_id (int): id проекта.
            current_user (str): email владельца проекта.

        Raises:
            ValueError: Если проект не найден или произошла ошибка БД
            PermissionError: Если пользователь не является владельцем проекта
        """
        project = ProjectService.get_project(project_id)
        ProjectService._check_ownership(project, current_user)

        try:
            db.session.delete(project)
            db.session.commit()
        except IntegrityError as e:
            db.session.rollback()
            raise ValueError(str(e.orig))
    
    @staticmethod    
    def update_project_metadata(
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
        project = ProjectService.get_project(project_id)
        ProjectService._check_ownership(project, current_user)

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
        
    @staticmethod
    def update_project(project_id: int, current_user: str, data: Dict) -> Dict:
        """Обновляет данные проекта.

        Args:
            project_id (int): id проекта.
            current_user (str): email владельца проекта.
            data (Dict): Данные, которые необходимо обновить.

        Returns:
            Dict: Результат обновления.

        Raises:
            ValueError: Если проект не найден.
            PermissionError: Если пользователь не является владельцем.
            IntegrityError: При возникновении ошибок целостности данных.
        """
        project = ProjectService.get_project(project_id)
        ProjectService._check_ownership(project, current_user)

        try:
            handler = ProjectService._get_update_handler(project.type)
            result = handler(project_id, data)
            project.last_modified_date = datetime.now(timezone.utc)

            db.session.commit()
            return result
        except Exception as e:
            db.session.rollback()
            raise e