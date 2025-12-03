package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os" 

	amqp "github.com/rabbitmq/amqp091-go"
)

type WeatherData struct {
	Timestamp   string  `json:"timestamp"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
	WindSpeed   float64 `json:"windSpeed"`
}

// Função auxiliar para ler configuração (Docker ou Local)
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func sendToAPI(data WeatherData) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	// Pega a URL da variável de ambiente ou usa localhost
	apiURL := getEnv("API_URL", "http://localhost:3000/weather")

	resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 || resp.StatusCode == 201 {
		log.Printf("📤 Enviado para API: %s (Status: %d)", apiURL, resp.StatusCode)
		return nil
	} else {
		log.Printf("⚠️ Erro na API: Status %d", resp.StatusCode)
		return nil
	}
}

func main() {
	// Pega a URL do RabbitMQ da variável ou usa localhost
	rabbitURL := getEnv("RABBITMQ_URL", "amqp://admin:admin123@localhost:5672/")

	conn, err := amqp.Dial(rabbitURL)
	failOnError(err, "Falha ao conectar ao RabbitMQ")
	defer conn.Close()

	log.Printf("🔗 Conectado ao RabbitMQ em: %s", rabbitURL)

	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir um canal")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"weather_queue", true, false, false, false, nil,
	)
	failOnError(err, "Falha ao declarar a fila")

	msgs, err := ch.Consume(
		q.Name, "", false, false, false, false, nil,
	)
	failOnError(err, "Falha ao registrar consumidor")

	forever := make(chan struct{})

	go func() {
		for d := range msgs {
			var data WeatherData
			err := json.Unmarshal(d.Body, &data)
			
			if err != nil {
				log.Printf("Erro no JSON: %s", err)
				d.Nack(false, false)
				continue
			}

			log.Printf("✅ Recebido: Temp %.1f°C | Vento: %.1f km/h", data.Temperature, data.WindSpeed)

			err = sendToAPI(data)
			
			if err != nil {
				log.Printf("❌ Falha ao enviar: %s", err)
				d.Nack(false, true) 
			} else {
				d.Ack(false)
			}
		}
	}()

	log.Printf(" [*] Worker Go rodando... Aguardando mensagens.")
	<-forever
}