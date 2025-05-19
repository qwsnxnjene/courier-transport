package handlers

import (
	"encoding/json"
	"fmt"
	"github.com/qwsnxnjene/courier-transport/backend/internal/app/db"
	"golang.org/x/crypto/bcrypt"
	"log"
	_ "modernc.org/sqlite"
	"net/http"
)

// SignUpHandler обрабатывает регистрацию нового пользователя
func SignUpHandler(rw http.ResponseWriter, r *http.Request) {
	// Проверка метода запроса
	if r.Method != http.MethodPost {
		rw.WriteHeader(http.StatusBadRequest)
		rw.Write([]byte(`{"error":"Неверный метод запроса"}`))
		return
	}
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	// Структура для входных данных
	var p struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}

	// Десериализация JSON
	err := json.NewDecoder(r.Body).Decode(&p)
	if err != nil {
		rw.WriteHeader(http.StatusBadRequest)
		rw.Write([]byte(fmt.Sprintf(`{"error":"Ошибка десериализации: %v"}`, err)))
		return
	}
	defer r.Body.Close()

	// Валидация данных
	if len(p.Login) < 3 {
		rw.WriteHeader(http.StatusBadRequest)
		rw.Write([]byte(`{"error":"Логин должен быть не короче 3 символов"}`))
		return
	}
	if len(p.Password) < 8 {
		rw.WriteHeader(http.StatusBadRequest)
		rw.Write([]byte(`{"error":"Пароль должен быть не короче 8 символов"}`))
		return
	}

	// Хэширование пароля
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(p.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Ошибка хэширования пароля: %v", err)
		rw.WriteHeader(http.StatusInternalServerError)
		rw.Write([]byte(`{"error":"Внутренняя ошибка сервера"}`))
		return
	}

	// Вставка пользователя в базу данных
	_, err = db.Database.Exec("INSERT INTO users (login, password_hash) VALUES (?, ?)", p.Login, string(hashedPassword))
	if err != nil {
		if err.Error() == "UNIQUE constraint failed: users.login" {
			rw.WriteHeader(http.StatusConflict)
			rw.Write([]byte(`{"error":"Логин уже занят"}`))
		} else {
			log.Printf("Ошибка базы данных: %v", err)
			rw.WriteHeader(http.StatusInternalServerError)
			rw.Write([]byte(`{"error":"Внутренняя ошибка сервера"}`))
		}
		return
	}

	rw.WriteHeader(http.StatusCreated)
	rw.Write([]byte(`{"message":"Пользователь успешно зарегистрирован"}`))
}
