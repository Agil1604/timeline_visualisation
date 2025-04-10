from app import db
from app.models.project import Project, ProjectType

class ProjectGantt(Project):
    __tablename__ = 'project_gantt'
    id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), primary_key=True)
    line_color = db.Column(db.String(7))
    line_width = db.Column(db.Integer)
    
    __mapper_args__ = {
        'polymorphic_identity': ProjectType.GANTT
    }

