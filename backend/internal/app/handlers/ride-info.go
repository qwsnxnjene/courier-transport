package handlers

import (
	"database/sql"
	"encoding/json"
	"github.com/qwsnxnjene/courier-transport/backend/internal/app/db"
	"net/http"
)

func RideInfoHandler(rw http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		rw.WriteHeader(http.StatusBadRequest)
		rw.Write([]byte(`{"error":"Неверный метод запроса"}`))
		return
	}
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	query := r.URL.Query()
	login := query.Get("login")
	if login == "" {
		rw.WriteHeader(http.StatusBadRequest)
		rw.Write([]byte(`{"error":"Пустой логин"}`))
		return
	}

	q := `SELECT id FROM users WHERE login=:login`
	row := db.Database.QueryRow(q, sql.Named("login", login))
	var id int
	err := row.Scan(&id)
	if err != nil {
		rw.WriteHeader(http.StatusBadRequest)
		rw.Write([]byte(`{"error":"Данный пользователь не найден"}`))
		return
	}

	q = `SELECT (start, end, transport_type, total) FROM rides WHERE user_id=:id`
	rows, err := db.Database.Query(q, sql.Named("id", id))
	if err != nil {
		rw.WriteHeader(http.StatusBadRequest)
		rw.Write([]byte(`{"error":"Ошибка работы с БД"}`))
		return
	}
	defer rows.Close()

	type Ride struct {
		Start string `json:"start"`
		End   string `json:"end"`
		Total int    `json:"total"`
		Type  string `json:"type"`
	}
	var rides []Ride
	for rows.Next() {
		var ride Ride
		err = rows.Scan(&ride.Start, &ride.End, &ride.Type, &ride.Total)
		if err != nil {
			rw.WriteHeader(http.StatusBadRequest)
			rw.Write([]byte(`{"error":"Ошибка работы с БД"}`))
			return
		}
		rides = append(rides, ride)
	}

	jsonData, err := json.Marshal(rides)
	if err != nil {
		rw.WriteHeader(http.StatusBadRequest)
		rw.Write([]byte(`{"error":"Ошибка маршализации данных"}`))
		return
	}
	rw.Write(jsonData)
	rw.WriteHeader(http.StatusOK)
}
