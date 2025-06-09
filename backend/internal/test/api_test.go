package test

import (
	"bytes"
	"database/sql"
	"encoding/json"
	db2 "github.com/qwsnxnjene/courier-transport/backend/internal/app/db"
	"github.com/qwsnxnjene/courier-transport/backend/internal/app/handlers"
	_ "modernc.org/sqlite"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestTransportHandler(t *testing.T) {
	_, err := db2.OpenSql()
	if err != nil {
		t.Fatalf("failed to open database: %v", err)
	}

	req := httptest.NewRequest("GET", "/api/transport", nil)

	responseRecorder := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.FreeScootersHandler)
	handler.ServeHTTP(responseRecorder, req)

	if status := responseRecorder.Code; status != http.StatusOK {
		t.Errorf("expected status code: %d, got %d", http.StatusOK, status)
	}
}

func TestSignupHandler(t *testing.T) {
	_, err := db2.OpenSql()
	if err != nil {
		t.Fatalf("failed to open database: %v", err)
	}

	type RequestForm struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}
	formData := RequestForm{
		Login:    "user@example6.com",
		Password: "securepassword123",
	}

	jsonBody, _ := json.Marshal(formData)

	req := httptest.NewRequest("POST", "/api/signup", bytes.NewBuffer(jsonBody))
	responseRecorder := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.SignUpHandler)
	handler.ServeHTTP(responseRecorder, req)
	if status := responseRecorder.Code; status != http.StatusCreated {
		t.Errorf("expected status code: %d, got %d", http.StatusCreated, status)
		t.Errorf("%v", responseRecorder.Body)
	}

	req = httptest.NewRequest("POST", "/api/signup", bytes.NewBuffer(jsonBody))
	responseRecorder = httptest.NewRecorder()
	handler.ServeHTTP(responseRecorder, req)
	if status := responseRecorder.Code; status != http.StatusInternalServerError {
		t.Errorf("expected status code: %d, got %d", http.StatusInternalServerError, status)
		t.Errorf("%v", responseRecorder.Body)
	}
}

func TestSignupHandlerInvalid(t *testing.T) {
	_, err := db2.OpenSql()
	if err != nil {
		t.Fatalf("failed to open database: %v", err)
	}

	type RequestForm struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}

	formData := RequestForm{
		Login:    "us",
		Password: "securepassword123",
	}
	jsonBody, _ := json.Marshal(formData)
	req := httptest.NewRequest("POST", "/api/signup", bytes.NewBuffer(jsonBody))
	responseRecorder := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.SignUpHandler)
	handler.ServeHTTP(responseRecorder, req)
	if status := responseRecorder.Code; status != http.StatusBadRequest {
		t.Errorf("expected status code: %d, got %d", http.StatusBadRequest, status)
		t.Errorf("%v", responseRecorder.Body)
	}

	formData = RequestForm{
		Login:    "user@example6.com",
		Password: "1234567",
	}
	req = httptest.NewRequest("POST", "/api/signup", bytes.NewBuffer(jsonBody))
	handler = http.HandlerFunc(handlers.SignUpHandler)
	handler.ServeHTTP(responseRecorder, req)
	if status := responseRecorder.Code; status != http.StatusBadRequest {
		t.Errorf("expected status code: %d, got %d", http.StatusBadRequest, status)
		t.Errorf("%v", responseRecorder.Body)
	}
}

func TestLoginHandler(t *testing.T) {
	_, err := db2.OpenSql()
	if err != nil {
		t.Fatalf("failed to open database: %v", err)
	}

	type RequestForm struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}

	formData := RequestForm{
		Login:    "testData13",
		Password: "securepassword123",
	}
	jsonBody, _ := json.Marshal(formData)
	req := httptest.NewRequest("POST", "/api/signup", bytes.NewBuffer(jsonBody))
	responseRecorder := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.SignUpHandler)
	handler.ServeHTTP(responseRecorder, req)
	if status := responseRecorder.Code; status != http.StatusCreated {
		t.Errorf("expected status code: %d, got %d", http.StatusCreated, status)
	}

	formData = RequestForm{
		Login:    "testData13",
		Password: "securepassword123",
	}
	jsonBody, _ = json.Marshal(formData)
	req = httptest.NewRequest("POST", "/api/login", bytes.NewBuffer(jsonBody))
	responseRecorder = httptest.NewRecorder()

	handler = http.HandlerFunc(handlers.SignInHandler)
	handler.ServeHTTP(responseRecorder, req)
	if status := responseRecorder.Code; status != http.StatusOK {
		t.Errorf("expected status code: %d, got %d", http.StatusOK, status)
		t.Errorf("%v\n", responseRecorder.Body)
	}

	formData = RequestForm{
		Login:    "testData13",
		Password: "secure123",
	}
	jsonBody, _ = json.Marshal(formData)
	req = httptest.NewRequest("POST", "/api/login", bytes.NewBuffer(jsonBody))
	responseRecorder = httptest.NewRecorder()
	handler = http.HandlerFunc(handlers.SignInHandler)
	handler.ServeHTTP(responseRecorder, req)
	if status := responseRecorder.Code; status != http.StatusBadRequest {
		t.Errorf("expected status code: %d, got %d", http.StatusBadRequest, status)
		t.Errorf("%v\n", responseRecorder.Body)
	}

	formData = RequestForm{
		Login:    "Handlerhandler",
		Password: "securepassword123",
	}
	jsonBody, _ = json.Marshal(formData)
	req = httptest.NewRequest("POST", "/api/login", bytes.NewBuffer(jsonBody))
	responseRecorder = httptest.NewRecorder()
	handler = http.HandlerFunc(handlers.SignInHandler)
	handler.ServeHTTP(responseRecorder, req)
	if status := responseRecorder.Code; status != http.StatusBadRequest {
		t.Errorf("expected status code: %d, got %d", http.StatusBadRequest, status)
		t.Errorf("%v\n", responseRecorder.Body)
	}
}

func TestProfileInfoHandler(t *testing.T) {
	_, err := db2.OpenSql()
	if err != nil {
		t.Fatalf("failed to open database: %v", err)
	}

	type RequestForm struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}

	getToken := func(login, password string) string {
		// Регистрация
		form := RequestForm{Login: login, Password: password}
		jsonBody, _ := json.Marshal(form)
		req := httptest.NewRequest("POST", "/api/signup", bytes.NewBuffer(jsonBody))
		w := httptest.NewRecorder()
		handlers.SignUpHandler(w, req)
		if w.Code != http.StatusCreated {
			t.Fatalf("SignUpHandler failed for %s: got status %s, want %d", login, w.Body, http.StatusCreated)
		}

		// Вход
		req = httptest.NewRequest("POST", "/api/login", bytes.NewBuffer(jsonBody))
		w = httptest.NewRecorder()
		handlers.SignInHandler(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("SignInHandler failed for %s: got status %d, want %d", login, w.Code, http.StatusOK)
		}

		// Извлекаем токен
		var res struct {
			Token string `json:"token"`
		}
		err := json.Unmarshal(w.Body.Bytes(), &res)
		if err != nil {
			t.Fatalf("failed to unmarshal login response for %s: %v", login, err)
		}
		return res.Token
	}

	// Успешное получение данных
	t.Run("Successful retrieval", func(t *testing.T) {
		login := "testuser_successs1332243"
		password := "securepassword212345"
		token := getToken(login, password)

		_, err := db2.Database.Exec(`
			INSERT INTO profile_data (name, rating, status, transport_preferences, passport, driver_license, 
				total_rentals, current_balance, e_scooters, bikes, e_bikes)
			VALUES (:name, :rating, :status, :prefs, :passport, :license, :rentals, :balance, :escooters, :bikes, :ebikes)`,
			sql.Named("name", login),
			sql.Named("rating", 5),
			sql.Named("status", "active"),
			sql.Named("prefs", `["bike", "scooter"]`),
			sql.Named("passport", "Подтвержден"),
			sql.Named("license", "ABC123"),
			sql.Named("rentals", 10),
			sql.Named("balance", 100),
			sql.Named("escooters", 2),
			sql.Named("bikes", 3),
			sql.Named("ebikes", 1),
		)
		if err != nil {
			t.Fatalf("failed to insert profile data: %v", err)
		}

		req := httptest.NewRequest("GET", "/api/profile", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		handlers.ProfileInfoHandler(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
		}

		var profileData struct {
			Name                 string   `json:"name"`
			Rating               int      `json:"rating"`
			Status               string   `json:"status"`
			TransportPreferences []string `json:"transportPreferences"`
			Documents            struct {
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
			} `json:"rentalStats"`
		}
		err = json.Unmarshal(w.Body.Bytes(), &profileData)
		if err != nil {
			t.Errorf("failed to unmarshal response: %v", err)
		}

		if profileData.Name != login {
			t.Errorf("expected name %s, got %s", login, profileData.Name)
		}
	})

	// Попытка доступа без токена
	t.Run("Unauthorized - no token", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/profile", nil)
		w := httptest.NewRecorder()
		handlers.ProfileInfoHandler(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected status %d, got %d", http.StatusUnauthorized, w.Code)
		}
	})

	// Попытка доступа с неверным токеном
	t.Run("Unauthorized - invalid token", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/profile", nil)
		req.Header.Set("Authorization", "Bearer invalidtoken")
		w := httptest.NewRecorder()
		handlers.ProfileInfoHandler(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected status %d, got %d", http.StatusUnauthorized, w.Code)
		}
	})

	// Пользователь с данным логином не найден
	t.Run("User not found", func(t *testing.T) {
		login := "testuser_notfound"
		password := "securepassword123"
		token := getToken(login, password)

		req := httptest.NewRequest("GET", "/api/profile", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		handlers.ProfileInfoHandler(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("expected status %d, got %d", http.StatusNotFound, w.Code)
		}
	})

	// Попытка передать неверный json
	t.Run("Database error - invalid JSON", func(t *testing.T) {
		login := "testuser_error"
		password := "securepassword123"
		token := getToken(login, password)

		_, err := db2.Database.Exec(`
			INSERT INTO profile_data (name, rating, status, transport_preferences, passport, driver_license, 
				total_rentals, current_balance, e_scooters, bikes, e_bikes)
			VALUES (:name, :rating, :status, :prefs, :passport, :license, :rentals, :balance, :escooters, :bikes, :ebikes)`,
			sql.Named("name", login),
			sql.Named("rating", 5),
			sql.Named("status", "active"),
			sql.Named("prefs", "invalid json"), // Invalid JSON to trigger unmarshal error
			sql.Named("passport", "Подтвержден"),
			sql.Named("license", "ABC123"),
			sql.Named("rentals", 10),
			sql.Named("balance", 100),
			sql.Named("escooters", 2),
			sql.Named("bikes", 3),
			sql.Named("ebikes", 1),
		)
		if err != nil {
			t.Fatalf("failed to insert profile data: %v", err)
		}

		req := httptest.NewRequest("GET", "/api/profile", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		handlers.ProfileInfoHandler(w, req)

		if w.Code != http.StatusInternalServerError {
			t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
		}
	})
}

func TestAddRideHandler(t *testing.T) {
	_, err := db2.OpenSql()
	if err != nil {
		t.Fatalf("failed to open database: %v", err)
	}

	type RequestForm struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}

	getToken := func(login, password string) string {
		// Регистрация
		form := RequestForm{Login: login, Password: password}
		jsonBody, _ := json.Marshal(form)
		req := httptest.NewRequest("POST", "/api/signup", bytes.NewBuffer(jsonBody))
		w := httptest.NewRecorder()
		handlers.SignUpHandler(w, req)
		if w.Code != http.StatusCreated {
			t.Fatalf("SignUpHandler failed for %s: got status %d, want %d", login, w.Code, http.StatusCreated)
		}

		// Вход
		req = httptest.NewRequest("POST", "/api/login", bytes.NewBuffer(jsonBody))
		w = httptest.NewRecorder()
		handlers.SignInHandler(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("SignInHandler failed for %s: got status %d, want %d", login, w.Code, http.StatusOK)
		}

		// Извлекаем токен
		var res struct {
			Token string `json:"token"`
		}
		err := json.Unmarshal(w.Body.Bytes(), &res)
		if err != nil {
			t.Fatalf("failed to unmarshal login response for %s: %v", login, err)
		}
		return res.Token
	}

	// Успешное добавление информации о поездке
	t.Run("Successful ride addition", func(t *testing.T) {
		login := "testuser_successз20шы"
		password := "securepassword123"
		token := getToken(login, password)

		ride := struct {
			UserID      int    `json:"user_id"`
			TransportID int    `json:"transport_id"`
			StartTime   string `json:"start_time"`
			EndTime     string `json:"end_time"`
			Total       int    `json:"total"`
		}{
			UserID:      1, // предполагаем, что айди пользователя = 1
			TransportID: 1,
			StartTime:   "2023-01-01T00:00:00Z",
			EndTime:     "2023-01-01T01:00:00Z",
			Total:       10,
		}
		jsonBody, _ := json.Marshal(ride)
		req := httptest.NewRequest("POST", "/api/addride", bytes.NewBuffer(jsonBody))
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		handlers.AddRideHandler(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
		}
	})

	// Неверный метод запроса
	t.Run("Invalid request method", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/rides", nil)
		w := httptest.NewRecorder()
		handlers.AddRideHandler(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
		if w.Body.String() != `{"error":"Неверный метод запроса"}` {
			t.Errorf("expected error message 'Неверный метод запроса', got %s", w.Body.String())
		}
	})

	// Неверное тело запроса
	t.Run("Invalid request body", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/api/rides", bytes.NewBuffer([]byte("invalid json")))
		w := httptest.NewRecorder()
		handlers.AddRideHandler(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})

	// Попытка добавить информацию о поездке на несуществующем транспорте
	t.Run("Missing transport record", func(t *testing.T) {
		login := "testuser_missing"
		password := "securepassword123"
		token := getToken(login, password)

		ride := struct {
			UserID      int    `json:"user_id"`
			TransportID int    `json:"transport_id"`
			StartTime   string `json:"start_time"`
			EndTime     string `json:"end_time"`
			Total       int    `json:"total"`
		}{
			UserID:      1,
			TransportID: 999, // ID транспорта, которого нет в БД
			StartTime:   "2023-01-01T00:00:00Z",
			EndTime:     "2023-01-01T01:00:00Z",
			Total:       10,
		}
		jsonBody, _ := json.Marshal(ride)
		req := httptest.NewRequest("POST", "/api/rides", bytes.NewBuffer(jsonBody))
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		handlers.AddRideHandler(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})

	// Попытка дважды добавить информацию об одной поездке
	t.Run("Database error during insertion", func(t *testing.T) {
		login := "testuser1_error"
		password := "securepassword123"
		token := getToken(login, password)

		// Create ride request
		ride := struct {
			UserID      int    `json:"user_id"`
			TransportID int    `json:"transport_id"`
			StartTime   string `json:"start_time"`
			EndTime     string `json:"end_time"`
			Total       int    `json:"total"`
		}{
			UserID:      1,
			TransportID: 2,
			StartTime:   "2023-01-01T00:00:00Z",
			EndTime:     "2023-01-01T01:00:00Z",
			Total:       10,
		}
		jsonBody, _ := json.Marshal(ride)
		req := httptest.NewRequest("POST", "/api/rides", bytes.NewBuffer(jsonBody))
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()

		handlers.AddRideHandler(w, req)
		if w.Code != http.StatusOK {
			t.Errorf("expected first insertion status %d, got %d", http.StatusOK, w.Code)
		}

		w = httptest.NewRecorder()
		req = httptest.NewRequest("POST", "/api/rides", bytes.NewBuffer(jsonBody))
		req.Header.Set("Authorization", "Bearer "+token)
		handlers.AddRideHandler(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})
}

func TestRideInfoHandler(t *testing.T) {
	_, err := db2.OpenSql()
	if err != nil {
		t.Fatalf("failed to open database: %v", err)
	}

	insertTestUser := func(login string) int {
		var id int
		err := db2.Database.QueryRow(
			`INSERT INTO users (login, password_hash) VALUES (:login, "passw213w") RETURNING id`,
			sql.Named("login", login),
		).Scan(&id)
		if err != nil {
			t.Fatalf("failed to insert test user: %v", err)
		}
		return id
	}

	insertTestRides := func(userID int) {
		_, err := db2.Database.Exec(
			`INSERT INTO rides (user_id, start, end, transport_type, total) 
			 VALUES (:user_id, :start, :end, :type, :total)`,
			sql.Named("user_id", userID),
			sql.Named("start", "2023-01-01T00:00:00Z"),
			sql.Named("end", "2023-01-01T01:00:00Z"),
			sql.Named("type", "e-bike"),
			sql.Named("total", 10),
		)
		if err != nil {
			t.Fatalf("failed to insert test ride: %v", err)
		}
		_, err = db2.Database.Exec(
			`INSERT INTO rides (user_id, start, end, transport_type, total) 
			 VALUES (:user_id, :start, :end, :type, :total)`,
			sql.Named("user_id", userID),
			sql.Named("start", "2023-01-02T00:00:00Z"),
			sql.Named("end", "2023-01-02T01:00:00Z"),
			sql.Named("type", "scooter"),
			sql.Named("total", 15),
		)
		if err != nil {
			t.Fatalf("failed to insert test ride: %v", err)
		}
	}

	deleteTestData := func(userID int) {
		_, err := db2.Database.Exec("DELETE FROM rides WHERE user_id = :user_id", sql.Named("user_id", userID))
		if err != nil {
			t.Logf("failed to delete test rides: %v", err)
		}
		_, err = db2.Database.Exec("DELETE FROM users WHERE id = :id", sql.Named("id", userID))
		if err != nil {
			t.Logf("failed to delete test user: %v", err)
		}
	}

	// Неверный метод запроса
	t.Run("Invalid Method", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/ride-info", nil)
		w := httptest.NewRecorder()
		handlers.RideInfoHandler(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
		if w.Body.String() != `{"error":"Неверный метод запроса"}` {
			t.Errorf("expected 'Неверный метод запроса', got %s", w.Body.String())
		}
	})

	// Пустой логин
	t.Run("Missing Login", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/ride-info", nil)
		w := httptest.NewRecorder()
		handlers.RideInfoHandler(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
		if w.Body.String() != `{"error":"Пустой логин"}` {
			t.Errorf("expected 'Пустой логин', got %s", w.Body.String())
		}
	})

	// Пользователь не найден
	t.Run("User Not Found", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/ride-info?login=nonexistent", nil)
		w := httptest.NewRecorder()
		handlers.RideInfoHandler(w, req)
		if w.Code != http.StatusBadRequest {
			t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
		if w.Body.String() != `{"error":"Данный пользователь не найден"}` {
			t.Errorf("expected 'Данный пользователь не найден', got %s", w.Body.String())
		}
	})

	// Успешное получение информации о поездках пользователя
	t.Run("Successful Retrieval", func(t *testing.T) {
		login := "testuser"
		userID := insertTestUser(login)
		insertTestRides(userID)
		defer deleteTestData(userID)

		req := httptest.NewRequest(http.MethodGet, "/api/ride-info?login="+login, nil)
		w := httptest.NewRecorder()
		handlers.RideInfoHandler(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
		}

		var rides []struct {
			Start string `json:"start"`
			End   string `json:"end"`
			Type  string `json:"type"`
			Total int    `json:"total"`
		}
		err := json.Unmarshal(w.Body.Bytes(), &rides)
		if err != nil {
			t.Errorf("failed to unmarshal response: %v", err)
		}
		if len(rides) != 2 {
			t.Errorf("expected 2 rides, got %d", len(rides))
		}
		// Verify ride details
		expected := []struct {
			Start string
			End   string
			Type  string
			Total int
		}{
			{"2023-01-01T00:00:00Z", "2023-01-01T01:00:00Z", "e-bike", 10},
			{"2023-01-02T00:00:00Z", "2023-01-02T01:00:00Z", "scooter", 15},
		}
		for i, ride := range rides {
			if ride.Start != expected[i].Start || ride.End != expected[i].End ||
				ride.Type != expected[i].Type || ride.Total != expected[i].Total {
				t.Errorf("ride %d mismatch: got %+v, want %+v", i, ride, expected[i])
			}
		}
	})

	// У пользователя нет поездок
	t.Run("No Rides for User", func(t *testing.T) {
		login := "testuser_norides"
		userID := insertTestUser(login)
		defer deleteTestData(userID)

		req := httptest.NewRequest(http.MethodGet, "/api/ride-info?login="+login, nil)
		w := httptest.NewRecorder()
		handlers.RideInfoHandler(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
		}

		var rides []struct{}
		err := json.Unmarshal(w.Body.Bytes(), &rides)
		if err != nil {
			t.Errorf("failed to unmarshal response: %v", err)
		}
		if len(rides) != 0 {
			t.Errorf("expected 0 rides, got %d", len(rides))
		}
	})
}
