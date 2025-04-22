package db

import (
	_ "modernc.org/sqlite"
	"os"
	"path"
)

var dbPath string

func CreateDatabase() {
	dbPath = path.Join(".", "courier.db")

	_, err := os.Stat(dbPath)
	var install bool

	if err != nil {
		install = true
	}

	if install {
		//CreateTable(dbPath)
	}

	//_, err = OpenSql()
	//if err != nil {
	//	log.Fatal(err)
	//}
}

//func CreateTable(path string) error {
//	db, err := sql.Open("sqlite", path)
//
//	if err != nil {
//		return fmt.Errorf("[db.CreateTable]: can't open database: %w", err)
//	}
//	createQuery, _ := os.Open("create.sql")
//
//	_, err = db.Exec(createQuery)
//	if err != nil {
//		return fmt.Errorf("[db.CreateTable]: can't create table: %w", err)
//	}
//	return nil
//}
