# Timeline Visualisation

## О проекте

Данный проект является веб-приложением для визуализации временных интервалов. 

## Запуск
Для запуска данного веб-приложения выполните следующее:

### 1. Настройка окружения

Создайте файлы окружения:

Образец заполнения `server/.env`:
```
DB_USER=docker            # Пользаватель базы данных
DB_PASSWORD=docker        # Пароль от базы данных
DB_HOST=localhost         # (добавить описание)
DB_PORT=5432              # Порт на котором запущена база данных
DB_NAME=DB                # Название базы данных
SECRET_KEY=b9c61b9...     # Секретный ключ для генерации токенов доступа (исправить на правильное описание)
JWT_SECRET_KEY=7tA7B06... # Секретный ключ для генерации токенов доступа (исправить на правильное описание)
```

Образец заполнения `client/.env`:
```
REACT_APP_API_URL=http://server.path.com базовый адрес сервера запросов к базе данных
```

### 2. Установка зависимостей
```bash
# Сервер
cd server && pip install -r requirements.txt

# Клиент
cd ../client && npm install
```

### 3. Запуск PostgreSQL в Docker
```bash
docker run -d --name timeline-db \
  -e POSTGRES_USER=docker \
  -e POSTGRES_PASSWORD=docker \
  -e POSTGRES_DB=DB \
  -p 5432:5432 \
  postgres:latest
```
### 4. Запуск сервера
```bash
cd server && python3 run.py
```

### 5. Запуск клиента
```bash
cd client && npm start
```

## О себе

Проект выполнен студентом БПИ233 [Амировым Агилем](https://t.me/amirovagil) в рамках работы над курсовым проектом
