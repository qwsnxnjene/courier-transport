package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"github.com/golang-jwt/jwt"
	"net/http"
	"os"
)

// SignInHandler обрабатывает POST-запросы по адресу /api/auth/login
func SignInHandler(rw http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		rw.WriteHeader(http.StatusBadRequest)
		return
	}
	rw.Header().Set("Content-Type", "application/json; charset=UTF-8")

	var p struct {
		Password string `json:"password"`
	}

	err := json.NewDecoder(r.Body).Decode(&p)
	if err != nil {
		rw.WriteHeader(http.StatusBadRequest)
		rw.Write([]byte(fmt.Sprintf(`{"error":"ошибка десериализации %v"}`, err)))
		return
	}
	defer r.Body.Close()

	var ans string
	if p.Password == os.Getenv("COURIER_PASSWORD") {
		secret := []byte(os.Getenv("COURIER_PASSWORD"))

		hash := sha256.Sum256(secret)

		claims := jwt.MapClaims{
			"hash": hex.EncodeToString(hash[:]),
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
		ans = `{"error":"Неверный пароль"}`
	}
	rw.Write([]byte(ans))
}
