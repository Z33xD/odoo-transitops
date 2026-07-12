-- ====================================================================
-- TransitOps High-Density Enterprise Seed Dataset (SQLite Compatible)
-- Localized for INR (₹), Indian Logistics Frameworks, and Audit Edge Cases
-- Benchmark Date Context: July 12, 2026
-- ====================================================================

PRAGMA foreign_keys = ON;

-- 1. ROLES
INSERT OR IGNORE INTO roles (id, name, description) VALUES 
(1, 'Fleet Manager', 'Oversees fleet assets, tracking maintenance and scheduling'),
(2, 'Driver', 'Manages dispatches, logs odometers, and confirms materials distribution'),
(3, 'Safety Officer', 'Ensures personnel compliance, reviews scores, and audits credentials'),
(4, 'Financial Analyst', 'Monitors corporate balance sheets, operational costs, and fuel metrics');

-- 2. USERS (Hashed passwords default strictly to 'password')
INSERT OR IGNORE INTO users (id, email, password_hash, name, role_id) VALUES 
(1, 'manager@transitops.com', 'scrypt:32768:8:1$whL42fwRDf8Q1ild$3be40f64a76a1530bd9e40fc4f390e3b11e9c4b052797cb3a0d8c1b3c85a0be75456daae08a5c853365e538186543e2f52b72ee5e462496c7a06fb82bd1e5468', 'Alex Vance', 1),
(2, 'driver@transitops.com', 'scrypt:32768:8:1$whL42fwRDf8Q1ild$3be40f64a76a1530bd9e40fc4f390e3b11e9c4b052797cb3a0d8c1b3c85a0be75456daae08a5c853365e538186543e2f52b72ee5e462496c7a06fb82bd1e5468', 'Alex Kumar', 2),
(3, 'safety@transitops.com', 'scrypt:32768:8:1$whL42fwRDf8Q1ild$3be40f64a76a1530bd9e40fc4f390e3b11e9c4b052797cb3a0d8c1b3c85a0be75456daae08a5c853365e538186543e2f52b72ee5e462496c7a06fb82bd1e5468', 'Elena Rostova', 3),
(4, 'finance@transitops.com', 'scrypt:32768:8:1$whL42fwRDf8Q1ild$3be40f64a76a1530bd9e40fc4f390e3b11e9c4b052797cb3a0d8c1b3c85a0be75456daae08a5c853365e538186543e2f52b72ee5e462496c7a06fb82bd1e5468', 'Marcus Vance', 4);

-- 3. VEHICLES (Varied statuses to populate active filtering panels)
INSERT OR IGNORE INTO vehicles (id, registration_number, name_model, type, max_load_capacity, current_odometer, acquisition_cost, status) VALUES 
(1, 'KA01AB1234', 'Tata Ace Gold', 'Mini Truck', 750.0, 45200.0, 850000.0, 'Available'),
(2, 'KA02CD5678', 'Mahindra Bolero Pik-Up', 'Van', 1250.0, 32150.0, 1150000.0, 'Available'),
(3, 'KA03EF9012', 'Ashok Leyland Boss', 'Truck', 7500.0, 120600.0, 3200000.0, 'On Trip'),
(4, 'MH12QW4556', 'BharatBenz 2823R', 'Heavy Duty Truck', 18000.0, 89400.0, 4800000.0, 'Available'),
(5, 'DL01MG8899', 'Eicher Pro 2049', 'Semi-Truck', 3500.0, 14200.0, 1850000.0, 'In Shop'),
(6, 'KA05NK9921', 'Tata Ultra T.7', 'Truck', 4000.0, 65100.0, 2100000.0, 'Available'),
(7, 'MH02FF3344', 'Mahindra Supro Profit', 'Mini Truck', 900.0, 182000.0, 720000.0, 'Retired'),
(8, 'DL03CC7711', 'Force Shaktiman', 'Heavy Duty Truck', 9000.0, 43100.0, 2900000.0, 'On Trip');

-- 4. DRIVERS (Includes targeted test-cases for Safety compliance warnings)
INSERT OR IGNORE INTO drivers (id, name, license_number, license_category, license_expiry_date, contact_number, safety_score, status) VALUES 
(1, 'Alex Kumar', 'DL12345678901', 'HMV', '2028-12-31', '9876543210', 94.5, 'Available'),
(2, 'Priya Sharma', 'DL98765432102', 'LMV', '2027-08-14', '8765432109', 88.0, 'Available'),
(3, 'Rajesh Nair', 'KL07201500341', 'HMV', '2029-03-20', '9447123456', 91.2, 'On Trip'),
(4, 'David Miller', 'DL04201900883', 'HMV', '2026-05-10', '9910238475', 72.5, 'Available'), -- CRITICAL CASE: Expired License & Low Score (<75)
(5, 'Vikram Singh', 'HR26201200554', 'HMV', '2031-11-05', '9811002233', 96.8, 'Available'),
(6, 'Amit Patel', 'GJ01201800992', 'LMV', '2026-07-01', '9724012345', 68.0, 'Off Duty'),   -- CRITICAL CASE: Impending/Past Expiry relative to July 12, 2026
(7, 'Sanjay Dutt', 'MH01201000452', 'HMV', '2030-01-15', '9820123456', 82.0, 'On Trip'),
(8, 'Arjun Rao', 'AP03202100673', 'HMV', '2027-04-18', '8686012345', 55.0, 'Suspended'); -- CRITICAL CASE: Explicitly Suspended

-- 5. TRIPS (Operational History: Completed, Dispatched/Active, and Draft states)
INSERT OR IGNORE INTO trips (id, source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, actual_distance, odometer_start, odometer_end, fuel_consumed, revenue, status) VALUES 
(1, 'Bengaluru Warehouse', 'Chennai Port', 1, 1, 680.0, 350.0, 355.0, 44845.0, 45200.0, 42.0, 45000.0, 'Completed'),
(2, 'Mumbai Hub', 'Pune Distribution Center', 2, 2, 1100.0, 150.0, 148.0, 32002.0, 32150.0, 16.5, 22000.0, 'Completed'),
(3, 'Bengaluru Warehouse', 'Hyderabad Center', 3, 3, 6800.0, 570.0, NULL, 120600.0, NULL, NULL, 98000.0, 'Dispatched'),
(4, 'Delhi Distribution Center', 'Jaipur Hub', 4, 5, 14500.0, 270.0, 272.0, 89128.0, 89400.0, 95.0, 130000.0, 'Completed'),
(5, 'Chennai Port', 'Bengaluru Warehouse', 6, 2, 3800.0, 350.0, 350.0, 64750.0, 65100.0, 78.0, 52000.0, 'Completed'),
(6, 'Mumbai Hub', 'Delhi Distribution Center', 8, 7, 8500.0, 1420.0, NULL, 43100.0, NULL, NULL, 280000.0, 'Dispatched'),
(7, 'Delhi Distribution Center', 'Chandigarh Hub', 5, 4, 3000.0, 250.0, NULL, 14200.0, NULL, NULL, 0.0, 'Draft'),
(8, 'Bengaluru Warehouse', 'Mumbai Hub', 4, 1, 16000.0, 980.0, NULL, 89400.0, NULL, NULL, 210000.0, 'Draft');

-- 6. MAINTENANCE LOGS (Wires Open tasks for our custom closure action verification)
INSERT OR IGNORE INTO maintenance_logs (id, vehicle_id, description, start_date, end_date, cost, status) VALUES 
(1, 1, 'Routine Oil Change & Air Filter Replacement', '2026-01-10', '2026-01-10', 4500.0, 'Closed'),
(2, 3, 'Brake System Inspection & Brake Pad Replacement', '2026-03-04', '2026-03-05', 18500.0, 'Closed'),
(3, 5, 'Engine Diagnostics & Turbocharger Overhaul', '2026-07-02', NULL, 45000.0, 'Open'), -- Active test case inside Eicher Pro
(4, 6, 'Tire Rotation & Wheel Alignment Alignment Calibration', '2026-05-18', '2026-05-18', 8800.0, 'Closed'),
(5, 4, 'HVAC Repair & Cabin Filter Replacement', '2026-02-20', '2026-02-21', 12000.0, 'Closed'),
(6, 2, 'Suspension Bushing Upgrades & Shock Absorber Tuning', '2026-07-10', NULL, 16000.0, 'Open');

-- 7. FUEL LOGS (Hydrates financial dashboards with massive cost metrics)
INSERT OR IGNORE INTO fuel_logs (id, vehicle_id, litres, cost, date, trip_id) VALUES 
(1, 1, 42.0, 4284.0, '2026-06-15', 1),   -- 42 Litres @ ~₹102/L
(2, 2, 16.5, 1551.0, '2026-06-18', 2),   -- Diesel pricing configurations
(3, 4, 95.0, 9690.0, '2026-06-22', 4),
(4, 6, 78.0, 7956.0, '2026-07-01', 5),
(5, 3, 120.0, 12240.0, '2026-07-05', 3), -- Pre-fill log on active route
(6, 4, 110.0, 11220.0, '2026-05-10', NULL),-- Standard standalone fuel purchase
(7, 8, 210.0, 21420.0, '2026-07-11', 6);

-- 8. GENERAL EXPENSES (Maps directly to our standardized ledger items)
INSERT OR IGNORE INTO expenses (id, vehicle_id, trip_id, description, amount, date, category) VALUES 
(1, 1, 1, 'Highway Toll Fee', 2450.0, '2026-06-15', 'Toll'),
(2, 2, 2, 'State Transit Tax', 1200.0, '2026-06-18', 'Tax'),
(3, 4, 4, 'Driver Overnight Allowance', 3500.0, '2026-06-22', 'Personnel'),
(4, 6, 5, 'Highway Toll Fee', 2450.0, '2026-07-01', 'Toll'),
(5, 5, NULL, 'Emergency Roadside Assistance', 7500.0, '2026-07-03', 'Maintenance'),
(6, 3, 3, 'Driver Overnight Allowance', 4000.0, '2026-07-06', 'Personnel'),
(7, 8, 6, 'State Transit Tax', 5500.0, '2026-07-11', 'Tax');

-- 9. VEHICLE COMPLIANCE DOCUMENTS (Triggers dynamic Safety panel items)
INSERT OR IGNORE INTO vehicle_documents (id, vehicle_id, document_type, file_path, expiry_date) VALUES 
(1, 1, 'National Permit Insurance', '/uploads/docs/ka01_ins.pdf', '2027-03-15'),
(2, 2, 'Fitness Certificate', '/uploads/docs/ka02_fit.pdf', '2026-11-20'),
(3, 3, 'Pollution Under Control (PUC)', '/uploads/docs/ka03_puc.pdf', '2026-09-05'),
(4, 4, 'National Permit Insurance', '/uploads/docs/mh12_ins.pdf', '2026-04-01'), -- CRITICAL CASE: Expired document
(5, 5, 'Fitness Certificate', '/uploads/docs/dl01_fit.pdf', '2027-01-10'),
(6, 6, 'Pollution Under Control (PUC)', '/uploads/docs/ka05_puc.pdf', '2026-06-30'); -- CRITICAL CASE: Expired document