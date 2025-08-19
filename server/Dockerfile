FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt
COPY . /app

RUN adduser --disabled-password --gecos '' myuser
USER myuser
EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "run:app"]