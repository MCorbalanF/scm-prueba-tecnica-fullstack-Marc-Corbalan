FROM python:3.13-slim

WORKDIR /app

# Dependencias del sistema (opcional pero recomendable)
RUN apt-get update && apt-get install -y build-essential

# Copiamos requirements
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copiamos código
COPY . .

# Variables de entorno (preparadas para futuro)
# ENV DATABASE_URL=sqlite+aiosqlite:///./app.db
# ENV JWT_SECRET=change_me

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]