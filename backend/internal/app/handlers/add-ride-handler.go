package handlers

import (
	"database/sql"
	"encoding/json"
	"github.com/qwsnxnjene/courier-transport/backend/internal/app/db"
	"net/http"

	_ "modernc.org/sqlite"
)

func AddRideHandler(rw http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		rw.WriteHeader(http.StatusBadRequest)
		rw.Write([]byte(`{"error":"Неверный метод запроса"}`))
		return
	}
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	var ride struct {
		UserID      int    `json:"user_id"`
		TransportID int    `json:"transport_id"`
		StartTime   string `json:"start_time"`
		EndTime     string `json:"end_time"`
		Total       int    `json:"total"`
	}

	err := json.NewDecoder(r.Body).Decode(&ride)
	if err != nil {
		rw.WriteHeader(http.StatusBadRequest)
		rw.Write([]byte(err.Error()))
		return
	}
	defer r.Body.Close()

	query := `SELECT type FROM transport WHERE id = :transport`
	typeTransport := "e-bike"
	row := db.Database.QueryRow(query, sql.Named("transport", ride.TransportID))
	err = row.Scan(&typeTransport)

	if err != nil {
		rw.WriteHeader(http.StatusBadRequest)
		rw.Write([]byte(err.Error()))
		return
	}

	query = `INSERT INTO rides (user_id, transport_id, start, end, transport_type, total) 
				VALUES (:user_id, :transport, :start, :end, :transport_type, :total)`
	_, err = db.Database.Exec(query, sql.Named("user_id", ride.UserID),
		sql.Named("transport", ride.TransportID),
		sql.Named("start", ride.StartTime),
		sql.Named("end", ride.EndTime),
		sql.Named("transport_type", typeTransport),
		sql.Named("total", ride.Total))
	if err != nil {
		rw.WriteHeader(http.StatusBadRequest)
		rw.Write([]byte(err.Error()))
		return
	}

	rw.WriteHeader(http.StatusOK)
}
