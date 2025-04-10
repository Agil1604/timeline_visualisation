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
    if missing != []:
        raise ValueError(f"Не заданы переменные для БД: {', '.join(missing)}")
    
    db_user = os.getenv("DB_USER")
    db_pass = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")
    
    return f"postgresql+psycopg2://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"

class Config:
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    BCRYPT_LOG_ROUNDS = 12
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)

    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY не задан в переменных окружения!")
    
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    if not JWT_SECRET_KEY:
        raise RuntimeError("JWT_SECRET_KEY не задан! Проверьте .env файл.")