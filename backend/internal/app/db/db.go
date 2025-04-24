package db

import (
	"database/sql"
	"fmt"
	"log"
	_ "modernc.org/sqlite"
	"os"
	"path"
	"path/filepath"
)

var dbPath string
var Database *sql.DB

// CreateDatabase получает путь к файлу с базой данных и, если необходимо, создаёт таблицу
func CreateDatabase() error {
	dbPath = path.Join("..", "internal", "app", "db", "courier.db")

	_, err := os.Stat(dbPath)
	var install bool

	if err != nil {
		install = true
	}

	if install {
		err := CreateTable(dbPath)
		if err != nil {
			return fmt.Errorf("[internal.app.db.CreateDatabase]: %w", err)
		}
	}

	return nil
}

// CreateTable создаёт таблицу в файле, указанном в path
// возвращает nil при успешном создании таблицы, иначе ошибку
func CreateTable(pathDb string) error {
	db, err := sql.Open("sqlite", pathDb)

	if err != nil {
		return fmt.Errorf("[internal.app.db.CreateTable]: %w", err)
	}

	sqlPath := filepath.Join("..", "internal", "app", "db", "create.sql")
	createQuery, err := os.ReadFile(sqlPath)
	if err != nil {
		return fmt.Errorf("[internal.app.db.CreateTable]: %w", err)
	}

	query := string(createQuery)

	_, err = db.Exec(query)
	if err != nil {
		return fmt.Errorf("[internal.app.db.CreateTable]: %w", err)
	}

	log.Printf("[internal.app.db.CreateTable] Created database table: %s", pathDb)
	return nil
}

// OpenSql возвращает таблицу для работы с ней
func OpenSql() (*sql.DB, error) {
	err := CreateDatabase()
	if err != nil {
		return nil, fmt.Errorf("[internal.app.db.OpenSql]: %w", err)
	}

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("[internal.app.db.OpenSql]: %w", err)
	}

	Database = db

	return db, nil
}
