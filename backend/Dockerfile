# Orchestration agent — API core (spec §5.1). Minimal scaffold: health/readiness
# probes that verify Neo4j + Postgres wiring. Not the static console image.
FROM python:3.11-slim

WORKDIR /app

# Install deps first so the layer caches across app-code changes.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
