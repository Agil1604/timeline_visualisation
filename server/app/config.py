import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

def get_database_uri() -> str:
    """Формирует URI для подключения к PostgreSQL."""
    required_vars = [
        "DB_USER",
        "DB_PASSWORD",
        "DB_HOST",
        "DB_PORT",
        "DB_NAME",
    ]
    
    missing = [var for var in required_vars if not os.getenv(var)]
    if missing:
        raise ValueError(f"Не заданы переменные для подключения к БД: {', '.join(missing)}")
    
    db_user = os.getenv("DB_USER")
    db_pass = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")
    
    return f"postgresql+psycopg2://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"

class Config:
    """
    Класс конфигурации для Flask-приложения. \n

    Значения всех атрибутов берутся из конфигурационного файла .env. При отсутствии какого-то из параметров вызывается ошибка. \n

    Для корректной работы в .env файле должны присутствовать следующие переменные: \n
        JWT_SECRET_KEY
        SECRET_KEY
        DB_USER
        DB_PASSWORD
        DB_HOST
        DB_PORT
        DB_NAME

    Attributes:
        SQLALCHEMY_DATABASE_URI (str): URI для подключения к базе данных.
        SQLALCHEMY_TRACK_MODIFICATIONS (bool): Флаг отслеживания модификаций объектов.

        BCRYPT_LOG_ROUNDS (int): Количество раундов хеширования паролей bcrypt.
        JWT_ACCESS_TOKEN_EXPIRES (timedelta): Время жизни access токена.
        JWT_REFRESH_TOKEN_EXPIRES (timedelta): Время жизни refresh токена.
        JWT_SECRET_KEY (str): Секретный ключ для подписи JWT токенов.
        SECRET_KEY (str): секретный ключ приложения.

    Raises:
        ValueError: Если какая-то из необоходимых переменных окружения не задана.
    """
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    BCRYPT_LOG_ROUNDS = 12
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)

    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    if not JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY не задан! Проверьте .env файл.")
    
    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY не задан в переменных окружения!")