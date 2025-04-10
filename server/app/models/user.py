from app import db
from sqlalchemy.orm import validates
from email_validator import validate_email, EmailNotValidError
from datetime import datetime, timezone
import re

class User(db.Model):
    __tablename__ = 'users'
    
    email = db.Column(db.String(254), primary_key=True)
    password_hash = db.Column(db.String(128), nullable=False)
    nickname = db.Column(db.String(16), unique=True, nullable=False)
    created_date = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    projects = db.relationship(
        'Project', 
        backref='users', 
        cascade='all, delete-orphan', 
        passive_deletes=True
    )

    @validates('email')
    def validate_email(self, key, email):
        try:
            emailinfo = validate_email(email, check_deliverability=True)
            normalized_email = emailinfo.normalized
            if len(normalized_email) > 254:
                raise ValueError('Email is too long')
            return normalized_email

        except EmailNotValidError as e:
            raise ValueError(str(e)) from e

    @validates('nickname')
    def validate_nickname(self, key, nickname):
        nickname_stripped = nickname.strip()
        if len(nickname_stripped) == 0:
            raise ValueError('Nickname cannot be empty')
        
        if len(nickname_stripped) > 16:
            raise ValueError('Nickname too long')
        
        if ' ' in nickname_stripped:
            raise ValueError('Nickname cannot contain spaces')
    
        if not re.match(r'^[a-zA-Z0-9_-]+$', nickname_stripped):
            raise ValueError("Nickname can only contain letters, numbers, '_', and '-'")
 
        return nickname_stripped

    def set_password(self, password):
        from app.utils.security import hash_password
        self.password_hash = hash_password(password)

    def check_password(self, password):
        from app.utils.security import verify_password
        return verify_password(self.password_hash, password)