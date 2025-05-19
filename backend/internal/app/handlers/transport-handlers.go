package handlers

import (
	"encoding/json"
	db2 "github.com/qwsnxnjene/courier-transport/backend/internal/app/db"
	"log"
	_ "modernc.org/sqlite"
	"net/http"
)

type Scooter struct {
	Type         string  `json:"type"`
	Latitude     float64 `json:"latitude"`
	Longitude    float64 `json:"longitude"`
	BatteryLevel int     `json:"batteryLevel"`
	Price        int     `json:"price"`
}

// FreeScootersHandler обрабатывает запрос по пути /api/transport
func FreeScootersHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET")

	var result []Scooter

	if db2.Database == nil {
		log.Print("[internal/app/handlers/transport-handlers.go]: Database not initialized\n")
		http.Error(w, "Внутренняя ошибка сервера: база данных не инициализирована", http.StatusInternalServerError)
		return
	}

	query := `SELECT type, latitude, longitude, battery_level, price FROM transport WHERE status LIKE 'free'`
	rows, err := db2.Database.Query(query)
	if err != nil {
		log.Printf("[internal/app/handlers/transport-handlers.go]: %v", err)
		http.Error(w, "Внутренняя ошибка сервера: база данных не инициализирована", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var scooter Scooter

		err = rows.Scan(&scooter.Type, &scooter.Latitude, &scooter.Longitude, &scooter.BatteryLevel, &scooter.Price)
		if err != nil {
			log.Printf("[internal/app/handlers/transport-handlers.go]: %v", err)
			json.NewEncoder(w).Encode([]Scooter{})
			http.Error(w, "Внутренняя ошибка сервера: база данных не инициализирована", http.StatusInternalServerError)
			return
		}
		result = append(result, scooter)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
