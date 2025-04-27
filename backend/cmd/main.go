package main

import (
	"fmt"
	"github.com/gorilla/mux"
	db2 "github.com/qwsnxnjene/courier-transport/backend/internal/app/db"
	"github.com/qwsnxnjene/courier-transport/backend/internal/app/handlers"
	"log"
	"net/http"
)

func main() {
	r := mux.NewRouter()

	_, err := db2.OpenSql()
	if err != nil {
		log.Fatal(err)
	}

	r.HandleFunc("/api/transport", handlers.FreeScootersHandler)
	r.HandleFunc("/api/auth/login", handlers.SignInHandler)

	err = http.ListenAndServe(":3031", r)
	if err != nil {
		log.Fatal(fmt.Errorf("main: %w", err).Error())
	}
}
