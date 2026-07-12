// --- LocalStorage State Hydration Layer ---
const SEED_DATA = {
    users: {
        'manager@transitops.com': {
            name: 'Alex Vance',
            role: 'Fleet Manager'
        },
        'driver@transitops.com': {
            name: 'Alex Kumar',
            role: 'Driver',
            driverId: 1
        },
        'safety@transitops.com': {
            name: 'Elena Rostova',
            role: 'Safety Officer'
        },
        'finance@transitops.com': {
            name: 'Marcus Vance',
            role: 'Financial Analyst'
        }
    },
    vehicles: [
        { id: 1, registration_number: 'TX-9021', name_model: 'Peterbilt 579', type: 'Semi-Truck', max_load_capacity: 45000, current_odometer: 124500, acquisition_cost: 154000, status: 'Available' },
        { id: 2, registration_number: 'CA-5491', name_model: 'Freightliner Cascadia', type: 'Semi-Truck', max_load_capacity: 40000, current_odometer: 89000, acquisition_cost: 145000, status: 'On Trip' },
        { id: 3, registration_number: 'NY-1024', name_model: 'Volvo VNL 860', type: 'Heavy Duty Truck', max_load_capacity: 42000, current_odometer: 215400, acquisition_cost: 162000, status: 'In Shop' },
        { id: 4, registration_number: 'FL-3389', name_model: 'Kenworth T680', type: 'Heavy Duty Truck', max_load_capacity: 44000, current_odometer: 450200, acquisition_cost: 135000, status: 'Retired' }
    ],
    drivers: [
        { id: 1, name: 'Alex Kumar', license_number: 'CDL-882910', license_category: 'Class A CDL', license_expiry_date: '2027-11-15', contact_number: '+1-555-0101', safety_score: 95, status: 'On Trip' },
        { id: 2, name: 'Sarah Jenkins', license_number: 'CDL-119482', license_category: 'Class A CDL', license_expiry_date: '2026-08-30', contact_number: '+1-555-0102', safety_score: 98, status: 'Available' },
        { id: 3, name: 'Robert Carter', license_number: 'CDL-334720', license_category: 'Class A CDL', license_expiry_date: '2026-07-01', contact_number: '+1-555-0103', safety_score: 72, status: 'Off Duty' },
        { id: 4, name: 'Marcus Vance', license_number: 'CDL-904811', license_category: 'Class B CDL', license_expiry_date: '2028-03-22', contact_number: '+1-555-0104', safety_score: 64, status: 'Suspended' }
    ],
    trips: [
        { id: 101, source: 'Houston, TX', destination: 'Dallas, TX', vehicle_id: 2, driver_id: 1, cargo_weight: 32000, planned_distance: 240, status: 'Dispatched' },
        { id: 102, source: 'Chicago, IL', destination: 'Atlanta, GA', vehicle_id: 1, driver_id: 2, cargo_weight: 18000, planned_distance: 720, status: 'Completed' }
    ],
    maintenance_logs: [
        { id: 1, vehicle_id: 3, reason: 'Engine tune-up and oil change', date: '2026-07-10' }
    ]
};

function hydrateState() {
    const existing = localStorage.getItem('transitops_state');
    if (!existing) {
        localStorage.setItem('transitops_state', JSON.stringify(SEED_DATA));
        window.mockState = JSON.parse(JSON.stringify(SEED_DATA));
    } else {
        window.mockState = JSON.parse(existing);
    }
}

hydrateState();
