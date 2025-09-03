from app.models.user import User
from app import db
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

class UserService:
    """Сервис для управления пользователями приложения: регистрация, аутентификация, обновление и удаление профиля.
    
    Обеспечивает взаимодействие между бизнес-логикой и моделью данных пользователей.
    """

    @staticmethod
    def register_user(email: str, password: str, nickname: str) -> User:
        """Регистрация нового пользователя.
        
        Args:
            email (str): email пользоветеля.
            password (str): Пароль пользователя (в базе данных хранится хэшированная версия).
            nickname (str): Уникальное имя пользователя.
            
        Returns:
            User: Созданный объект пользователя.
            
        Raises:
            ValueError: Если пользователь с таким email или именем пользователя уже существует.
        """
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
    def login_user(email: str, password: str) -> User:
        """Аутентификация пользователя.
        
        Args:
            email (str): email пользоветеля.
            password (str): Пароль пользоветеля.
            
        Returns:
            User: Объект пользователя при успешной аутентификации и None иначе.
        """
        user = User.query.get(email)
        if not user or not user.check_password(password):
            return None
        return user

    @staticmethod
    def change_password(user: User, old_password: str, new_password: str) -> User:
        """Смена пароля пользователя.
        
        Args:
            user (User): Объект пользователя, пароль которого надо сменить.
            old_password (str): Текущий пароль пользователя.
            new_password (str): Новый пароль пользователя.
            
        Returns:
            User: Обновленный объект пользователя.
            
        Raises:
            ValueError: Если верификация старого пароля не проходит.
        """
        if not user.check_password(old_password):
            raise ValueError('Invalid current password')
        user.set_password(new_password)
        try:
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            raise ValueError('Password update failed')
        return user
    
    @staticmethod
    def get_user(email: str) -> User:
        """Получение объекта пользователя.
        
        Args:
            email (str): email пользователя.
            
        Returns:
            User: Объект пользоваетеля.
            
        Raises:
            ValueError: Если пользователя с таким email не существует.
        """
        user = User.query.get(email)
        if not user:
            raise ValueError("User not found")
        return user

    @staticmethod
    def delete_user(email: str) -> User:       
        """Удаление аккаунта пользователя.
        
        Args:
            email (str): email пользователя.
            
        Returns:
            User: Удаленный объект пользователя.
            
        Raises:
            ValueError: Если пользователя с таким email не существует.
        """ 
        user = User.query.get(email)
        if user is None:
            raise ValueError("User with this email doesn't exist")

        try:
            db.session.delete(user)
            db.session.commit()
            return user
        except SQLAlchemyError as e:
            db.session.rollback()
            error_info = str(e.orig)
            print(error_info)
            raise ValueError(error_info)