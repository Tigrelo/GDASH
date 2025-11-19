import pika
import requests
import json
import time
from datetime import datetime

# --- Configurações ---
# Como estamos rodando localmente (fora do container), usamos localhost
RABBIT_HOST = 'localhost'
RABBIT_USER = 'admin'
RABBIT_PASS = 'admin123'
QUEUE_NAME = 'weather_queue'

# Coordenadas de Belo Horizonte
API_URL = "https://api.open-meteo.com/v1/forecast?latitude=-19.92&longitude=-43.94&current=temperature_2m,relative_humidity_2m,wind_speed_10m"

def get_weather():
    try:
        response = requests.get(API_URL)
        if response.status_code == 200:
            data = response.json()
            # Vamos extrair e montar um JSON mais limpo
            current = data.get('current', {})
            payload = {
                "timestamp": datetime.now().isoformat(),
                "latitude": data.get('latitude'),
                "longitude": data.get('longitude'),
                "temperature": current.get('temperature_2m'),
                "humidity": current.get('relative_humidity_2m'),
                "wind_speed": current.get('wind_speed_10m')
            }
            return payload
        else:
            print("Erro ao acessar API de clima")
            return None
    except Exception as e:
        print(f"Erro de conexão: {e}")
        return None

def send_to_queue(data):
    credentials = pika.PlainCredentials(RABBIT_USER, RABBIT_PASS)
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=RABBIT_HOST, credentials=credentials)
    )
    channel = connection.channel()

    # Criar a fila se ela não existir
    channel.queue_declare(queue=QUEUE_NAME, durable=True)

    message = json.dumps(data)
    
    channel.basic_publish(
        exchange='',
        routing_key=QUEUE_NAME,
        body=message,
        properties=pika.BasicProperties(
            delivery_mode=2,  # Torna a mensagem persistente
        )
    )
    print(f" [x] Enviado para a fila: {message}")
    connection.close()

if __name__ == "__main__":
    print("🚀 Coletor de Clima Iniciado (Ctrl+C para parar)")
    while True:
        weather_data = get_weather()
        if weather_data:
            send_to_queue(weather_data)
        
        # Espera 10 segundos antes da próxima coleta
        time.sleep(10)