package main

import (
	"fmt"
	"github.com/gorilla/mux"
	"log"
	"net/http"
)

func main() {
	r := mux.NewRouter()

	err := http.ListenAndServe(":3031", r)
	if err != nil {
		log.Fatal(fmt.Errorf("main: %w", err).Error())
	}
}
