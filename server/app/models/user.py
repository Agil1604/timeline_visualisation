from app import db
from datetime import datetime, timezone
from sqlalchemy.orm import Mapped

class User(db.Model):
    """
    Модель пользователя для хранения учетных данных и основной информации.

    Attributes:
        email (str): Уникальный email пользователя (первичный ключ).
        password_hash (str): Хэшированный пароль пользователя.
        nickname (str): Уникальное имя пользователя (до 16 символов).
        created_date (datetime): Дата и время создания учетной записи в UTC.
        projects (List[Project]): Список проектов, связанных с пользователем.
    """
    __tablename__ = 'users'
    
    email = db.Column(db.String(254), primary_key=True)
    password_hash = db.Column(db.String(255), nullable=False)
    nickname = db.Column(db.String(16), unique=True, nullable=False)
    created_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    projects = db.relationship(
        'Project', 
        backref='user', 
        cascade='all, delete-orphan', 
        passive_deletes=True
    )

    def set_password(self, password: str) -> None:
        """
        Генерирует хэш пароля и сохраняет его.

        Аргументы:
            password (str): Пароль в открытом виде.
        """
        from app.utils.security import hash_password
        self.password_hash = hash_password(password)

    def check_password(self, password: str) -> bool:
        """
        Проверяет соответствие пароля сохраненному хэшу.

        Args:
            password (str): Пароль в открытом виде для проверки.

        Returns:
            bool: True если пароль совпадает, иначе False.
        """
        from app.utils.security import verify_password
        return verify_password(self.password_hash, password)