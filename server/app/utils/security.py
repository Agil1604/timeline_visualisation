from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def hash_password(password: str) -> str:
    """Генерирует хеш пароля с использованием bcrypt.

    Args:
        password (str): Пароль в виде чистой строки для хеширования.

    Returns:
        str: Хешированный пароль в виде строки (включает соль и хеш).
    
    Example:
        >>> hashed = hash_password('my_secure_password')
    """
    return bcrypt.generate_password_hash(password).decode('utf-8')

def verify_password(hashed_password: str, password: str) -> bool:
    """Проверяет соответствие пароля его хешированной версии.

    Args:
        hashed_password (str): Хешированный пароль из базы данных.
        password (str): Чистый пароль для проверки.

    Returns:
        bool: True если пароль совпадает с хешем, иначе False.
    
    Example:
        >>> hashed = hash_password('secret')
        >>> verify_password(hashed, 'secret')
        True
        >>> verify_password(hashed, 'wrong')
        False
    """
    return bcrypt.check_password_hash(hashed_password, password)