from app.models.user import User
from app import db
from sqlalchemy.exc import IntegrityError

class UserService:
    @staticmethod
    def register_user(email, password, nickname):
        user = User(email=email, nickname=nickname)
        user.set_password(password)
        
        try:
            db.session.add(user)
            db.session.commit()
            return user
        except IntegrityError as e:
            db.session.rollback()
            error_info = str(e.orig)
            if 'email' in error_info:
                raise ValueError('Email already exists')
            elif 'nickname' in error_info:
                raise ValueError('Nickname already exists')
            raise ValueError('Registration failed')

    @staticmethod
    def login_user(email, password):
        user = User.query.get(email)
        if not user or not user.check_password(password):
            return None
        return user

    @staticmethod
    def change_password(user, old_password, new_password):
        if not user.check_password(old_password):
            raise ValueError('Invalid current password')
        user.set_password(new_password)
        db.session.commit()
        return user
    
    @staticmethod
    def get_user(email):
        user = User.query.get(email)
        if not user:
            raise ValueError("User not found")
        return user

    @staticmethod
    def delete_user(email):
        user = User.query.get(email)
        if user == None:
            raise ValueError("User with this email doesn't exist")

        try:
            db.session.delete(user)
            db.session.commit()
        except IntegrityError as e:
            db.session.rollback()
            error_info = str(e.orig)
            print(error_info)
            raise ValueError(error_info)
        return user

    