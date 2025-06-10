package handlers

import (
"encoding/json"
"github.com/qwsnxnjene/courier-transport/backend/internal/app/db"
"log"
"net/http"
_ "modernc.org/sqlite"
)

type AddRideInput struct {
UserID      int    `json:"user_id"`
TransportID int    `json:"transport_id"`
StartTime   string `json:"start_time"`
EndTime     string `json:"end_time"`
Total       int    `json:"total"`
}

func AddRideHandler(rw http.ResponseWriter, r *http.Request) {
rw.Header().Set("Access-Control-Allow-Origin", "*")
rw.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
rw.Header().Set("Access-Control-Allow-Headers", "Content-Type")

if r.Method == http.MethodOptions {
    rw.WriteHeader(http.StatusOK)
    return
}
if r.Method != http.MethodPost {
    http.Error(rw, "Неверный метод запроса", http.StatusBadRequest)
    return
}

rw.Header().Set("Content-Type", "application/json; charset=UTF-8")
var ride AddRideInput
if err := json.NewDecoder(r.Body).Decode(&ride); err != nil {
    http.Error(rw, `{"error":"Ошибка чтения данных"}`, http.StatusBadRequest)
    return
}
defer r.Body.Close()

// Берем тип транспорта
var transportType string
err := db.Database.QueryRow(
    "SELECT type FROM transport WHERE id = ?",
    ride.TransportID,
).Scan(&transportType)
if err != nil {
    http.Error(rw, `{"error":"Не найден транспорт с таким id"}`, http.StatusBadRequest)
    return
}

// Вставка новой поездки
_, err = db.Database.Exec(
    `INSERT INTO rides (user_id, transport_id, start, end, transport_type, total)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ride.UserID, ride.TransportID, ride.StartTime, ride.EndTime, transportType, ride.Total,
)
if err != nil {
    log.Println("Ошибка вставки ride:", err)
    http.Error(rw, `{"error":"Ошибка сохранения поездки"}`, http.StatusInternalServerError)
    return
}

rw.WriteHeader(http.StatusOK)
rw.Write([]byte(`{"result":"ok"}`))
}