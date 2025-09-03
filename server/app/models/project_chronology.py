from app import db
from app.models.project import Project, ProjectType
from enum import Enum

class ProjectChronologyType(Enum):
    """
    ENUM для представления различных представлений одного и того же проекта.

    Values:
        LEFT_SIDED: .
        CENTERED: .
    """
    LEFT_SIDED = "type1"
    CENTERED = "type2"

class ProjectChronology(Project):
    """Представляет класс для хронологии.

    """
    __tablename__ = 'project_chronology'
    id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), primary_key=True)
    chronology_type = db.Column(db.Enum(ProjectChronologyType), nullable=False, default=ProjectChronologyType.LEFT_SIDED)

    __mapper_args__ = {
        'polymorphic_identity': ProjectType.CHRONOLOGY
    }

    milestones = db.relationship(
        'ChronologyMilestone', 
        backref='project', 
        cascade="all, delete-orphan",
        lazy='select'
    )    

class ChronologyMilestone(db.Model):
    """
    
    """
    __tablename__ = 'chronology_milestone'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    year = db.Column(db.Integer, nullable=False)
    order = db.Column(db.Integer, nullable=False)
    title = db.Column(db.Text)
    description = db.Column(db.Text)
    
    project_id = db.Column(
        db.Integer, 
        db.ForeignKey('project_chronology.id', ondelete="CASCADE"),
        nullable=False
    )