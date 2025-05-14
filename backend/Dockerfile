# Backend Dockerfile
FROM python:3.10-slim

# system deps, then Python deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev python3-dev redis-server \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /backend

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose the Django dev server port
EXPOSE 8000

# Use runserver (for internal/simple use)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
