from app import db
from app.models.project import Project, ProjectType

class ProjectLinear(Project):
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
    __tablename__ = 'milestones'

    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer, nullable=False, unique=True)
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
