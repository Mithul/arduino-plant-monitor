CREATE TABLE IF NOT EXISTS moisture (plant_id INTEGER, moisture DECIMAL(2, 2), timestamp DECIMAL(10));
CREATE TABLE IF NOT EXISTS light (light DECIMAL(2, 2), timestamp DECIMAL(10));
CREATE TABLE IF NOT EXISTS plant (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(20) UNIQUE);
CREATE TABLE IF NOT EXISTS plant_sensor_map (plant_id INTEGER, sensor_index INTEGER, timestamp DECIMAL(10), FOREIGN KEY(plant_id) references plant(id));
