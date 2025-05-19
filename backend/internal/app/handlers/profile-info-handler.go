package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/golang-jwt/jwt"
	"github.com/qwsnxnjene/courier-transport/backend/internal/app/db"
	"log"
	"net/http"
	"os"
	"strings"
)

// GetLoginFromToken проверяет корректность и валидность JWT-токена, и извлекает из него логин пользователя
func GetLoginFromToken(r *http.Request, secret string) (string, error) {
	// Получение заголовка Authorization
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return "", fmt.Errorf("токен отсутствует")
	}

	// Проверка формата Bearer
	const bearerPrefix = "Bearer "
	if !strings.HasPrefix(authHeader, bearerPrefix) {
		return "", fmt.Errorf("неверный формат токена")
	}
	tokenString := strings.TrimPrefix(authHeader, bearerPrefix)

	// Парсинг токена
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Проверка метода подписи
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("неожиданный метод подписи: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return "", fmt.Errorf("ошибка парсинга токена: %v", err)
	}

	// Проверка валидности токена
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Извлечение логина
		login, ok := claims["login"].(string)
		if !ok {
			return "", fmt.Errorf("логин не найден в токене")
		}
		return login, nil
	}

	return "", fmt.Errorf("токен недействителен")
}

func ProfileInfoHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Получение логина из токена
	login, err := GetLoginFromToken(r, os.Getenv("COURIER_PASSWORD"))
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%v"}`, err), http.StatusUnauthorized)
		return
	}

	// Запрос данных пользователя из базы (пример)
	var userData struct {
		Login       string   `json:"name"`
		Rating      int      `json:"rating"`
		Status      string   `json:"status"`
		Preferences []string `json:"transportPreferences"`
		Documents   struct {
			Passport      string `json:"passport"`
			DriverLicense string `json:"driverLicense"`
		} `json:"documents"`
		RentalStats struct {
			TotalRentals   int `json:"totalRentals"`
			CurrentBalance int `json:"currentBalance"`
			VehicleStats   struct {
				E_scooter int `json:"e-scooter"`
				Bike      int `json:"bike"`
				E_bike    int `json:"e-bike"`
			} `json:"vehicleStats"`
		}
	}

	var prefJSON string
	err = db.Database.QueryRow(`SELECT name, rating, status, transport_preferences, passport, driver_license,
       					total_rentals, current_balance, e_scooters, bikes, e_bikes
						FROM profile_data WHERE name = :login`, sql.Named("login", login)).
		Scan(&userData.Login, &userData.Rating, &userData.Status, &prefJSON,
			&userData.Documents.Passport, &userData.Documents.DriverLicense,
			&userData.RentalStats.TotalRentals, &userData.RentalStats.CurrentBalance,
			&userData.RentalStats.VehicleStats.E_scooter, &userData.RentalStats.VehicleStats.Bike,
			&userData.RentalStats.VehicleStats.E_bike)
	if errors.Is(err, sql.ErrNoRows) {
		http.Error(w, `{"error":"Пользователь не найден"}`, http.StatusNotFound)
		return
	} else if err != nil {
		log.Printf("Ошибка базы данных: %v", err)
		http.Error(w, `{"error":"Внутренняя ошибка сервера"}`, http.StatusInternalServerError)
		return
	}

	if prefJSON != "" {
		err = json.Unmarshal([]byte(prefJSON), &userData.Preferences)
		if err != nil {
			log.Printf("Ошибка десериализации предпочтений: %v", err)
			http.Error(w, `{"error":"Внутренняя ошибка сервера"}`, http.StatusInternalServerError)
			return
		}
	}

	// Отправка ответа
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(userData)
}
