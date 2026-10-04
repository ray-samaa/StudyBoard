# استخدم صورة Python
FROM python:3.11-slim

# اضبط working directory
WORKDIR /app

# انسخ requirements.txt
COPY backend/requirements.txt .

# نزّل المكتبات
RUN pip install --no-cache-dir -r requirements.txt

# انسخ باقي الكود
COPY . .

# شغّل FastAPI باستخدام Uvicorn
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port $PORT"]

