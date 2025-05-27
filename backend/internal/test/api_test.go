package test

import (
	"bytes"
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
