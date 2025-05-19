package handlers

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/golang-jwt/jwt"
	"github.com/qwsnxnjene/courier-transport/backend/internal/app/db"
	"golang.org/x/crypto/bcrypt"
	"log"
	_ "modernc.org/sqlite"

	"net/http"
	"os"
)

func authenticateUser(login, password string) (bool, error) {
	var storedHash string
	err := db.Database.QueryRow("SELECT password_hash FROM users WHERE login = ?", login).Scan(&storedHash)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil // Пользователь не найден
	} else if err != nil {
		return false, err // Ошибка базы данных
	}
	err = bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(password))
	if err != nil {
		return false, nil // Пароль не совпадает
	}
	return true, nil
}

// SignInHandler обрабатывает POST-запросы по адресу /api/auth/login
func SignInHandler(rw http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		rw.WriteHeader(http.StatusBadRequest)
		return
	}
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	var p struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}

	err := json.NewDecoder(r.Body).Decode(&p)
	if err != nil {
		rw.WriteHeader(http.StatusBadRequest)
		rw.Write([]byte(fmt.Sprintf(`{"error":"ошибка десериализации %v"}`, err)))
		return
	}
	defer r.Body.Close()

	success, err := authenticateUser(p.Login, p.Password)
	if err != nil {
		log.Printf("Ошибка базы данных: %v", err)
		rw.WriteHeader(http.StatusInternalServerError)
		rw.Write([]byte(`{"error":"Внутренняя ошибка сервера"}`))
		return
	}

	var ans string
	if success {
		secret := []byte(os.Getenv("COURIER_PASSWORD"))

		hash := sha256.Sum256(secret)

		claims := jwt.MapClaims{
			"hash":  hex.EncodeToString(hash[:]),
			"login": p.Login,
		}

		jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		signedToken, err := jwtToken.SignedString(secret)
		if err != nil {
			rw.WriteHeader(http.StatusBadRequest)
			rw.Write([]byte(fmt.Errorf("failed to sign jwt: %s", err).Error()))
			return
		}

		ans = fmt.Sprintf(`{"token":"%v"}`, signedToken)
		rw.WriteHeader(http.StatusOK)
		fmt.Println(signedToken)
	} else {
		rw.WriteHeader(http.StatusBadRequest)
		ans = `{"error":"Неверный пароль или логин"}`
	}
	rw.Write([]byte(ans))
}
