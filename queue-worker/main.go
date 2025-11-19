package main

import (
	"encoding/json"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

// WeatherData define a estrutura do JSON que vem do Python
type WeatherData struct {
	Timestamp   string  `json:"timestamp"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
	WindSpeed   float64 `json:"wind_speed"`
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func main() {
	// 1. Conectar ao RabbitMQ (localhost pois estamos rodando fora do docker agora)
	conn, err := amqp.Dial("amqp://admin:admin123@localhost:5672/")
	failOnError(err, "Falha ao conectar ao RabbitMQ")
	defer conn.Close()

	// 2. Abrir canal
	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir um canal")
	defer ch.Close()

	// 3. Declarar a fila (garantir que ela existe)
	q, err := ch.QueueDeclare(
		"weather_queue", // nome
		true,            // durable
		false,           // delete when unused
		false,           // exclusive
		false,           // no-wait
		nil,             // arguments
	)
	failOnError(err, "Falha ao declarar a fila")

	// 4. Consumir mensagens
	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack (false = vamos confirmar manualmente)
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Falha ao registrar consumidor")

	// 5. Loop de leitura
	forever := make(chan struct{})

	go func() {
		for d := range msgs {
			// Desserializar JSON (Parse)
			var data WeatherData
			err := json.Unmarshal(d.Body, &data)
			
			if err != nil {
				log.Printf("Erro ao ler JSON: %s", err)
				d.Nack(false, false) // Rejeita se o JSON estiver quebrado
				continue
			}

			// MOSTRAR NO TERMINAL (AQUI ESTÁ A MÁGICA)
			log.Printf("✅ [Go Worker] Recebido: Temp: %.1f°C | Umid: %.1f%% | Vento: %.1f km/h", 
				data.Temperature, data.Humidity, data.WindSpeed)

			// Simular processamento
			time.Sleep(500 * time.Millisecond) 

			// Confirmar recebimento (Ack)
			d.Ack(false)
		}
	}()

	log.Printf(" [*] Aguardando mensagens. Para sair pressione CTRL+C")
	<-forever
}