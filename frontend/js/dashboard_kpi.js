(function () {
    function init() {
        if (document.getElementById('totalVehicles')) populateFleetKPIs();
        if (document.getElementById('assignedTrips')) {
            try {
                var s = JSON.parse(localStorage.getItem('transitops_session'));
                if (s) populateDriverKPIs(s);
            } catch (_) {}
        }
        if (document.getElementById('totalDrivers')) populateSafetyKPIs();
        if (document.getElementById('operationalCost')) populateFinanceKPIs();
    }

    async function populateFleetKPIs() {
        try {
            var vehicles = await TransitOpsAPI.getVehicles();
            var trips = await TransitOpsAPI.getTrips();
            var total = vehicles.length;
            var available = vehicles.filter(function (v) { return v.status === 'Available'; }).length;
            var onTrip = vehicles.filter(function (v) { return v.status === 'On Trip'; }).length;
            var activeTrips = trips.filter(function (t) { return t.status === 'Dispatched'; }).length;
            var utilization = total > 0 ? Math.round((onTrip / total) * 100) : 0;

            document.getElementById('totalVehicles').innerText = total;
            document.getElementById('availableVehicles').innerText = available;
            document.getElementById('activeTrips').innerText = activeTrips;
            document.getElementById('fleetUtilization').innerText = utilization + '%';
        } catch (e) { console.error('KPI Fleet error:', e); }
    }

    async function populateDriverKPIs(session) {
        try {
            var trips = await TransitOpsAPI.getTrips();
            var drivers = await TransitOpsAPI.getDrivers();
            var myTrips = trips.filter(function (t) { return t.driver_id === session.driverId; });
            var assigned = myTrips.filter(function (t) { return t.status === 'Dispatched' || t.status === 'Draft'; }).length;
            var completed = myTrips.filter(function (t) { return t.status === 'Completed'; }).length;
            var driver = drivers.find(function (d) { return d.id === session.driverId; });

            document.getElementById('assignedTrips').innerText = assigned;
            document.getElementById('completedTrips').innerText = completed;
            if (driver) document.getElementById('driverSafetyScore').innerText = driver.safety_score;

            var activeTrip = trips.find(function (t) {
                return t.driver_id === session.driverId && (t.status === 'Dispatched' || t.status === 'Draft');
            });
            if (activeTrip) {
                var vehicles = await TransitOpsAPI.getVehicles();
                var v = vehicles.find(function (x) { return x.id === activeTrip.vehicle_id; });
                document.getElementById('currentVehicle').innerText = v ? v.registration_number : '-';
            }
        } catch (e) { console.error('KPI Driver error:', e); }
    }

    async function populateSafetyKPIs() {
        try {
            var drivers = await TransitOpsAPI.getDrivers();
            var total = drivers.length;
            var available = drivers.filter(function (d) { return d.status === 'Available'; }).length;
            var avgScore = total > 0 ? Math.round(drivers.reduce(function (s, d) { return s + d.safety_score; }, 0) / total) : 0;

            var today = new Date();
            var expiring = drivers.filter(function (d) {
                var diff = Math.ceil((new Date(d.license_expiry_date) - today) / (1000 * 60 * 60 * 24));
                return diff > 0 && diff <= 60;
            }).length;

            document.getElementById('totalDrivers').innerText = total;
            document.getElementById('availableDrivers').innerText = available;
            document.getElementById('expiringLicenses').innerText = expiring;
            document.getElementById('averageSafetyScore').innerText = avgScore;
        } catch (e) { console.error('KPI Safety error:', e); }
    }

    async function populateFinanceKPIs() {
        try {
            var expenses = await TransitOpsAPI.getExpenses();
            var fuelLogs = await TransitOpsAPI.getFuelLogs();
            var maintLogs = await TransitOpsAPI.getMaintenanceLogs();
            var trips = await TransitOpsAPI.getTrips();

            var totalExpenses = expenses.reduce(function (s, e) { return s + e.amount; }, 0);
            var totalFuel = fuelLogs.reduce(function (s, f) { return s + f.cost; }, 0);
            var totalMaint = maintLogs.reduce(function (s, m) { return s + (m.cost || 0); }, 0);
            var opCost = totalExpenses + totalFuel + totalMaint;
            var totalRevenue = trips.reduce(function (s, t) { return s + (t.revenue || 0); }, 0);
            var roi = opCost > 0 ? Math.round(((totalRevenue - opCost) / opCost) * 100) : 0;

            document.getElementById('operationalCost').innerText = '\u20B9' + opCost.toLocaleString();
            document.getElementById('fuelCost').innerText = '\u20B9' + totalFuel.toLocaleString();
            document.getElementById('maintenanceCost').innerText = '\u20B9' + totalMaint.toLocaleString();
            document.getElementById('vehicleROI').innerText = roi + '%';
        } catch (e) { console.error('KPI Finance error:', e); }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
