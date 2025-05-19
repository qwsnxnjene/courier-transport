package main

import (
	"fmt"
	ghandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	db2 "github.com/qwsnxnjene/courier-transport/backend/internal/app/db"
	"github.com/qwsnxnjene/courier-transport/backend/internal/app/handlers"
	"log"
	"net/http"
)

func main() {
	_, err := db2.OpenSql()
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}

	if db2.Database == nil {
		log.Fatal("Database is nil after OpenSql")
	}

	r := mux.NewRouter()

	r.HandleFunc("/api/transport", handlers.FreeScootersHandler)
	r.HandleFunc("/api/auth/login", handlers.SignInHandler)

	allowedOrigins := ghandlers.AllowedOrigins([]string{"http://localhost:3000"})
	allowedMethods := ghandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	allowedHeaders := ghandlers.AllowedHeaders([]string{"Content-Type", "Authorization"})

	err = http.ListenAndServe(":3031", ghandlers.CORS(allowedOrigins, allowedMethods, allowedHeaders)(r))
	if err != nil {
		log.Fatal(fmt.Errorf("main: %w", err).Error())
	}
}
