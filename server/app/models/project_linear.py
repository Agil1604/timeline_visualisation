from app import db
from app.models.project import Project, ProjectType
from sqlalchemy.orm import Mapped

class ProjectLinear(Project):
    """Представляет класс для линейного проекта.

    Inherits from the base Project model and adds specific attributes for linear timeline visualization.
    Each linear project can have multiple milestones associated with it.

    Attributes:
        id (int): Уникальный идентификатор проекта.
        line_width (int): Толщина линии (в пикселях), на которой отображаются шарики (дефолтное значение 2).
        balls_size (int): Диаметр шаров (в пикселях) (дефолтное значение 60).
        milestones (List[Milestone]): Список всех шаров данного проекта.
    """
    __tablename__ = 'project_linear'
    id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), primary_key=True)
    line_width = db.Column(db.Integer, default=2)
    balls_size = db.Column(db.Integer, default=60)
    
    __mapper_args__ = {
        'polymorphic_identity': ProjectType.LINEAR
    }
    
    milestones = db.relationship(
        'Milestone', 
        backref='project', 
        cascade="all, delete-orphan",
        lazy='select'
    )    

class Milestone(db.Model):
    """Представляет собой экземпляр временной отметки в линейном проекте.

    Attributes:
        id (int): Уникальный идентификатор временной отметки.
        year (int): Дата отметки (уникальна в рамках одного проекта).
        description (Optional[str]): Описание отметки.
        color (str): Цвет отметки (в формате #RRGGBB).
        project_id (int): id проекта (внешний ключ).

    """
    __tablename__ = 'milestones'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    year = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text)
    color = db.Column(db.String(7), nullable=False)
    
    project_id = db.Column(
        db.Integer, 
        db.ForeignKey('project_linear.id', ondelete="CASCADE"),
        nullable=False
    )
    
    __table_args__ = (
        db.UniqueConstraint('project_id', 'year', name='_project_year_uc'),
    )