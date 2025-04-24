package handlers

import (
	"encoding/json"
	db2 "github.com/qwsnxnjene/courier-transport/backend/internal/app/db"
	"log"
	"net/http"
)

type Scooter struct {
	Latitude     float64 `json:"latitude"`
	Longitude    float64 `json:"longitude"`
	BatteryLevel int     `json:"batteryLevel"`
}

// FreeScootersHandler обрабатывает запрос по пути /api/transport
func FreeScootersHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET")

	var result []Scooter

	if db2.Database == nil {
		log.Print("[internal/app/handlers/handlers.go]: Database not initialized\n")
		return
	}

	query := `SELECT latitude, longitude, batteryLevel FROM e_scooters WHERE status LIKE 'free'`
	rows, err := db2.Database.Query(query)
	if err != nil {
		log.Printf("[internal/app/handlers/handlers.go]: %v", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var scooter Scooter

		err = rows.Scan(&scooter.Latitude, &scooter.Longitude, &scooter.BatteryLevel)
		if err != nil {
			log.Printf("[internal/app/handlers/handlers.go]: %v", err)
			json.NewEncoder(w).Encode([]Scooter{})
			return
		}
		result = append(result, scooter)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
