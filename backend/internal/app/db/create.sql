CREATE TABLE e_scooters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude TEXT, -- широта
    longitude TEXT, -- долгота
    battery_level INTEGER,
    status TEXT CHECK ( status IN ('free', 'booked', 'in_ride', 'maintenance') )
    -- user_id INTEGER REFERENCES users(id),
);

INSERT INTO e_scooters (latitude, longitude, battery_level, status) VALUES
    ('55.7558', '37.6173', 85, 'free'),
    ('55.7512', '37.6231', 60, 'in_ride'),
    ('55.7489', '37.6105', 20, 'maintenance'),
    ('55.7601', '37.6302', 95, 'free'),
    ('55.7534', '37.6157', 45, 'booked');