package handlers

import (
	"encoding/json"
	"fmt"
	"github.com/qwsnxnjene/courier-transport/backend/internal/app/db"
	"net/http"
	"os"
	"strings"
	"github.com/golang-jwt/jwt/v5" // проверь номер версии у себя!
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
	secret := os.Getenv("JWT_SECRET_KEY")
	login, err := GetLoginFromToken(r, secret)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte(fmt.Sprintf(`{"error":"%v"}`, err)))
		return
	}

	var profile struct {
		Name            string  `json:"Name"`
		Rating          float64 `json:"Rating"`
		Status          string  `json:"Status"`
		Transport       string  `json:"Transport"`
		Passport        string  `json:"Passport"`
		DriverLicense   string  `json:"DriverLicense"`
		TotalRentals    int     `json:"TotalRentals"`
		CurrentBalance  float64 `json:"CurrentBalance"`
		EScooters       int     `json:"EScooters"`
		Bikes           int     `json:"Bikes"`
		EBikes          int     `json:"EBikes"`
	}

	err = db.Database.QueryRow(`
		SELECT name, rating, status, transport_preferences, passport, driver_license,
		       total_rentals, current_balance, e_scooters, bikes, e_bikes
		FROM profile_data WHERE name = ?
	`, login).Scan(
		&profile.Name,
		&profile.Rating,
		&profile.Status,
		&profile.Transport,
		&profile.Passport,
		&profile.DriverLicense,
		&profile.TotalRentals,
		&profile.CurrentBalance,
		&profile.EScooters,
		&profile.Bikes,
		&profile.EBikes,
	)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(`{"error":"Профиль не найден"}`))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}