CREATE TABLE transport (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT CHECK ( type IN ('e-scooter', 'bike', 'e-bike')),
    latitude TEXT, -- широта
    longitude TEXT, -- долгота
    battery_level INTEGER,
    status TEXT CHECK ( status IN ('free', 'booked', 'in_ride', 'maintenance') ),
    price INTEGER
    -- user_id INTEGER REFERENCES users(id),
);

INSERT INTO transport (type, latitude, longitude, battery_level, status, price) VALUES
    ('e-scooter', '55.796127', '49.106414', 85, 'free', 5),
    ('bike', '55.788659', '49.122140', 60, 'in_ride', 3),
    ('e-bike', '55.781234', '49.115789', 20, 'maintenance', 4),
    ('e-scooter', '55.790543', '49.130987', 95, 'free', 5),
    ('bike', '55.794321', '49.110456', 45, 'booked', 3);

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

CREATE TABLE profile_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    rating INTEGER,
    status TEXT CHECK ( status IN ('active', 'retired') ),
    transport_preferences TEXT,
    passport TEXT CHECK ( passport IN ('Подтвержден', 'Не подтвержден', 'Не привязан') ),
    driver_license TEXT,
    total_rentals INTEGER,
    current_balance INTEGER,
    e_scooters INTEGER,
    bikes INTEGER,
    e_bikes INTEGER
)