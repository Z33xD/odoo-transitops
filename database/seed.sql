-- Seed data for TransitOps

-- Roles
INSERT OR IGNORE INTO roles (name, description) VALUES 
('Fleet Manager', 'Oversees fleet assets and operations'),
('Driver', 'Manages trips and deliveries'),
('Safety Officer', 'Ensures compliance and safety'),
('Financial Analyst', 'Reviews expenses and analytics');

-- Users (hashed passwords — all passwords are 'password')
INSERT OR IGNORE INTO users (email, password_hash, name, role_id) VALUES 
('manager@transitops.com', 'scrypt:32768:8:1$whL42fwRDf8Q1ild$3be40f64a76a1530bd9e40fc4f390e3b11e9c4b052797cb3a0d8c1b3c85a0be75456daae08a5c853365e538186543e2f52b72ee5e462496c7a06fb82bd1e5468', 'Alex Vance', 1),
('driver@transitops.com', 'scrypt:32768:8:1$whL42fwRDf8Q1ild$3be40f64a76a1530bd9e40fc4f390e3b11e9c4b052797cb3a0d8c1b3c85a0be75456daae08a5c853365e538186543e2f52b72ee5e462496c7a06fb82bd1e5468', 'Alex Kumar', 2),
('safety@transitops.com', 'scrypt:32768:8:1$whL42fwRDf8Q1ild$3be40f64a76a1530bd9e40fc4f390e3b11e9c4b052797cb3a0d8c1b3c85a0be75456daae08a5c853365e538186543e2f52b72ee5e462496c7a06fb82bd1e5468', 'Elena Rostova', 3),
('finance@transitops.com', 'scrypt:32768:8:1$whL42fwRDf8Q1ild$3be40f64a76a1530bd9e40fc4f390e3b11e9c4b052797cb3a0d8c1b3c85a0be75456daae08a5c853365e538186543e2f52b72ee5e462496c7a06fb82bd1e5468', 'Marcus Vance', 4);

-- Vehicles
INSERT OR IGNORE INTO vehicles (registration_number, name_model, type, max_load_capacity, current_odometer, acquisition_cost, status) VALUES 
('KA01AB1234', 'Tata Ace', 'Mini Truck', 750.0, 45000, 850000, 'Available'),
('KA02CD5678', 'Mahindra Bolero', 'Van', 500.0, 32000, 1200000, 'Available'),
('KA03EF9012', 'Ashok Leyland', 'Truck', 5000.0, 120000, 3500000, 'Available');

-- Drivers
INSERT OR IGNORE INTO drivers (name, license_number, license_category, license_expiry_date, contact_number, safety_score, status) VALUES 
('Alex Kumar', 'DL123456789', 'HMV', '2027-12-31', '9876543210', 95.5, 'Available'),
('Priya Sharma', 'DL987654321', 'LMV', '2026-06-15', '8765432109', 88.0, 'Available');

-- Sample Trip, Maintenance, Fuel, etc. (see the file I wrote)