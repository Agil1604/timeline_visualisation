from app import db
from app.models.project import Project, ProjectType
from enum import Enum

class ProjectGantt(Project):
    __tablename__ = 'project_gantt'
    id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), primary_key=True)
    tasks = db.relationship(
        'GanttTask', 
        backref='project', 
        cascade="all, delete-orphan",
        lazy='select'
    )    

    __mapper_args__ = {
        'polymorphic_identity': ProjectType.GANTT
    }

class GanttTask(db.Model):
    __tablename__ = 'gantt_task'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    name = db.Column(db.Text)
    description = db.Column(db.Text)
    start_date = db.Column(db.Date)
    finish_date = db.Column(db.Date)
    progress = db.Column(db.Integer)
    is_critical = db.Column(db.Boolean)
    project_id = db.Column(
        db.Integer, 
        db.ForeignKey('project_gantt.id', ondelete="CASCADE"),
        nullable=False
    )    
    outgoing_connections = db.relationship(
        'GanttConnection',
        foreign_keys='GanttConnection.source_task_id',
        backref='source_task',
        cascade='all, delete-orphan',
        lazy='dynamic'
    )

class GanttConnectionType(Enum):
    """
    ENUM для представления различных видов связей в диаграмме Ганта.

    Values:
        FS: Finish-to-Start.
        SS: Start-to-Start.
        FF: Finish-to-Finish.
        SF: Start-to-Finish.
    """
    FS = "fs"
    SS = "ss"
    FF = "ff"
    SF = "sf"

class GanttConnection(db.Model):
    __tablename__ = 'gantt_connection'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    source_task_id = db.Column(db.Integer, db.ForeignKey('gantt_task.id', ondelete="CASCADE"), nullable=False)
    target_task_id = db.Column(db.Integer, db.ForeignKey('gantt_task.id', ondelete="CASCADE"), nullable=False)
    type = db.Column(db.Enum(GanttConnectionType), nullable=False)