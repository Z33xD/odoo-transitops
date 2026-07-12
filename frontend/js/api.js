// --- API Gateway Abstraction Layer ---
window.TransitOpsAPI = {
    saveState: function() {
        localStorage.setItem('transitops_state', JSON.stringify(window.mockState));
    },
    getVehicles: function() {
        return Promise.resolve(window.mockState.vehicles);
    },
    getDrivers: function() {
        return Promise.resolve(window.mockState.drivers);
    },
    getTrips: function() {
        return Promise.resolve(window.mockState.trips);
    },
    getMaintenanceLogs: function() {
        return Promise.resolve(window.mockState.maintenance_logs);
    },
    dispatchTrip: function(source, destination, vehicleId, driverId, cargoWeight) {
        const vehicle = window.mockState.vehicles.find(v => v.id === vehicleId);
        const driver = window.mockState.drivers.find(d => d.id === driverId);

        if (!vehicle || !driver) {
            return Promise.reject(new Error("Invalid vehicle or driver selection."));
        }
        if (vehicle.status === 'In Shop' || vehicle.status === 'Retired') {
            return Promise.reject(new Error(`Vehicle ${vehicle.registration_number} is currently In Shop or Retired.`));
        }
        if (driver.status === 'Suspended' || driver.status === 'Off Duty') {
            return Promise.reject(new Error(`Driver ${driver.name} is currently Off Duty or Suspended.`));
        }
        if (cargoWeight > vehicle.max_load_capacity) {
            return Promise.reject(new Error(`Overweight Alert: Cargo Weight (${cargoWeight.toLocaleString()} lbs) exceeds max load capacity (${vehicle.max_load_capacity.toLocaleString()} lbs) for vehicle ${vehicle.registration_number}.`));
        }

        const newTrip = {
            id: window.mockState.trips.length + 101,
            source: source,
            destination: destination,
            vehicle_id: vehicleId,
            driver_id: driverId,
            cargo_weight: cargoWeight,
            planned_distance: Math.round(100 + Math.random() * 800),
            status: 'Dispatched'
        };

        vehicle.status = 'On Trip';
        driver.status = 'On Trip';
        window.mockState.trips.push(newTrip);
        
        this.saveState();
        return Promise.resolve(newTrip);
    },
    logMaintenance: function(vehicleId, reason) {
        const vehicle = window.mockState.vehicles.find(v => v.id === vehicleId);
        if (!vehicle) {
            return Promise.reject(new Error("Invalid vehicle selected."));
        }

        vehicle.status = 'In Shop';
        const todayStr = new Date().toISOString().split('T')[0];
        const newLog = {
            id: window.mockState.maintenance_logs.length + 1,
            vehicle_id: vehicleId,
            reason: reason,
            date: todayStr
        };

        window.mockState.maintenance_logs.push(newLog);
        
        this.saveState();
        return Promise.resolve(newLog);
    },
    completeTrip: function(tripId) {
        const trip = window.mockState.trips.find(t => t.id === tripId);
        if (!trip) {
            return Promise.reject(new Error("Trip record not found."));
        }

        trip.status = 'Completed';
        const vehicle = window.mockState.vehicles.find(v => v.id === trip.vehicle_id);
        const driver = window.mockState.drivers.find(d => d.id === trip.driver_id);

        if (vehicle) vehicle.status = 'Available';
        if (driver) driver.status = 'Available';

        this.saveState();
        return Promise.resolve(trip);
    },
    authenticate: function(email) {
        const user = window.mockState.users[email];
        if (user) {
            return Promise.resolve(user);
        }
        return Promise.reject(new Error("Invalid corporate credentials."));
    }
};
