package test

import (
	db2 "github.com/qwsnxnjene/courier-transport/backend/internal/app/db"
	"github.com/qwsnxnjene/courier-transport/backend/internal/app/handlers"
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
