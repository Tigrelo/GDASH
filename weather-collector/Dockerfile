FROM python:3.10-slim
WORKDIR /app

RUN pip install requests pika schedule
COPY . .

CMD ["python", "-u", "main.py"]