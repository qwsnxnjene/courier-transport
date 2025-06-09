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

//curl -X POST -H "Content-Type: application/json" -d '{"login":"user123","password":"password123"}' http://localhost:3031/api/auth/signup

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
	r.HandleFunc("/api/auth/signup", handlers.SignUpHandler)
	r.HandleFunc("/api/profile", handlers.ProfileInfoHandler)
	r.HandleFunc("/api/addride", handlers.AddRideHandler)
	r.HandleFunc("/api/rides", handlers.RideInfoHandler).Methods("GET")

	allowedOrigins := ghandlers.AllowedOrigins([]string{"http://localhost:3000"})
	allowedMethods := ghandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	allowedHeaders := ghandlers.AllowedHeaders([]string{"Content-Type", "Authorization"})

	err = http.ListenAndServe(":3031", ghandlers.CORS(allowedOrigins, allowedMethods, allowedHeaders)(r))
	if err != nil {
		log.Fatal(fmt.Errorf("main: %w", err).Error())
	}
}
