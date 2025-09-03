from app import db
from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from sqlalchemy.orm import Mapped

class ProjectType(Enum):
    """
    ENUM для представления различных видов проектов.

    Values:
        LINEAR_DATES: Для линейной временной шкалы, основанной на датах.
        LINEAR_YEARS: Для линейной временной шкалы, основанной на годах.
        CHRONOLOGY: Для вертикальных хронологий.
        GANTT: Для диаграммы Ганта.
        OTHER: Для остальных видов.
    """
    LINEAR_DATES = "linear_dates"
    LINEAR_YEARS = "linear_years"
    CHRONOLOGY = "chronology"
    GANTT = "gantt"
    OTHER = "other"

class Project(db.Model):
    """
    Базовая модель для проектов пользователя.

    Attributes:
        id (int): Уникальный идентификатор проекта.
        owner (str): email владельца проекта.
        type (ProjectType): Тип проекта.
        title (str): Название проекта.
        description (Optional[str]): Описание проекта.
        created_date (datetime): Дата создания проекта.
        last_modified_date (datetime): Дата последнего обновления проекта.
    """
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    owner = db.Column(db.String(254), db.ForeignKey('users.email', ondelete='CASCADE'), nullable=False)
    type = db.Column(db.Enum(ProjectType), nullable=False)
    title = db.Column(db.String(30), nullable=False)
    description = db.Column(db.String(250))
    created_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    last_modified_date = db.Column(db.DateTime, 
                                   default=lambda: datetime.now(timezone.utc),
                                   onupdate=lambda: datetime.now(timezone.utc))
    
    __mapper_args__ = {
        'polymorphic_identity': ProjectType.OTHER,
        'polymorphic_on': type
    }