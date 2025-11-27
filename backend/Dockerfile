FROM python:3.14-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["sh", "-c", "gunicorn -w 4 -b 0.0.0.0:${PORT:-8080} run:app"]
