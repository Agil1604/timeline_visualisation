from app import db
from datetime import datetime, timezone
from enum import Enum

class ProjectType(Enum):
    LINEAR = "linear"
    GANTT = "gantt"
    OTHER = "other"


class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    owner = db.Column(db.String(254), db.ForeignKey('users.email', ondelete='CASCADE'), nullable=False)
    type = db.Column(db.Enum(ProjectType), nullable=False)
    title = db.Column(db.String(30), nullable=False)
    description = db.Column(db.String(250))
    created_date = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    last_modified_date = db.Column(db.DateTime, 
                                   default=datetime.now(timezone.utc),
                                   onupdate=datetime.now(timezone.utc))
    
    __mapper_args__ = {
        'polymorphic_identity': ProjectType.OTHER,
        'polymorphic_on': type
    }