window.TransitOpsAPI = {
    async request(method, url, body) {
        const opts = { method, headers: { 'Content-Type': 'application/json' } };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(url, opts);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
    },

    authenticate(email, password) {
        return this.request('POST', '/api/auth/login', { email, password });
    },

    getVehicles() {
        return this.request('GET', '/api/vehicles/');
    },

    getDrivers() {
        return this.request('GET', '/api/drivers/');
    },

    getTrips() {
        return this.request('GET', '/api/trips/');
    },

    getMaintenanceLogs() {
        return this.request('GET', '/api/maintenance-logs/');
    },

    getFuelLogs() {
        return this.request('GET', '/api/fuel-logs/');
    },

    getExpenses() {
        return this.request('GET', '/api/expenses/');
    },

    dispatchTrip(source, destination, vehicleId, driverId, cargoWeight) {
        return this.request('POST', '/api/trips/dispatch', {
            source, destination, vehicle_id: vehicleId, driver_id: driverId, cargo_weight: cargoWeight
        });
    },

    completeTrip(tripId) {
        return this.request('POST', `/api/trips/${tripId}/complete`);
    },

    logMaintenance(vehicleId, description) {
        const today = new Date().toISOString().split('T')[0];
        return this.request('POST', '/api/maintenance-logs/log', {
            vehicle_id: vehicleId, description, start_date: today
        });
    }
};
