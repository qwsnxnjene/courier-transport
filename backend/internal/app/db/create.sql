CREATE TABLE e_scooters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude TEXT, -- широта
    longitude TEXT, -- долгота
    battery_level INTEGER,
    status TEXT CHECK ( status IN ('free', 'booked', 'in_ride', 'maintenance') )
    -- user_id INTEGER REFERENCES users(id),
);