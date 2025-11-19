package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	

	amqp "github.com/rabbitmq/amqp091-go"
)

// URL da API NestJS (rodando localmente)
const API_URL = "http://localhost:3000/weather"

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

// Função para enviar os dados para o NestJS
func sendToAPI(data WeatherData) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	// Criar o request POST
	resp, err := http.Post(API_URL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 || resp.StatusCode == 201 {
		log.Printf("📤 Enviado para API com sucesso! (Status: %d)", resp.StatusCode)
		return nil
	} else {
		log.Printf("⚠️ Erro na API: Status %d", resp.StatusCode)
		return  nil // Retornamos nil para não travar a fila, mas idealmente trataríamos o erro
	}
}

func main() {
	// Conectar ao RabbitMQ
	conn, err := amqp.Dial("amqp://admin:admin123@localhost:5672/")
	failOnError(err, "Falha ao conectar ao RabbitMQ")
	defer conn.Close()

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

			log.Printf("✅ Recebido da Fila: Temp %.1f°C", data.Temperature)

			// ENVIAR PARA A API NESTJS
			err = sendToAPI(data)
			
			if err != nil {
				log.Printf("❌ Falha ao enviar para API: %s", err)
				// Se a API estiver fora, devolvemos a mensagem para a fila (Nack com requeue)
				// time.Sleep(5 * time.Second) // Espera um pouco para não flodar
				d.Nack(false, true) 
			} else {
				// Sucesso: Confirmamos a mensagem
				d.Ack(false)
			}
		}
	}()

	log.Printf(" [*] Worker Go rodando... Aguardando mensagens.")
	<-forever
}