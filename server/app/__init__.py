from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from app.config import Config
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_class: object = Config) -> Flask:
    """
    Фабрика для создания и конфигурации экземпляров Flask-приложения

    Args:
        config_class (object): Конфигурационный класс приложения, содержайший поля необходимые для настройки приложения.
    
    Returns:
        Flask: Готовое Flask-приложение.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost"}})

    from app.routes.auth import auth_bp
    from app.routes.project import project_bp
    from app.routes.user import user_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(project_bp, url_prefix='/api/projects')

    with app.app_context():
        db.create_all()

    return app
