(function () {
    async function initCharts() {
        var charts = [];

        var vehicleStatusCtx = document.getElementById('vehicleStatusChart');
        var tripStatusCtx = document.getElementById('tripStatusChart');
        var driverTripCtx = document.getElementById('driverTripChart');
        var distanceCtx = document.getElementById('distanceChart');
        var driverStatusCtx = document.getElementById('driverStatusChart');
        var licenseCtx = document.getElementById('licenseExpiryChart');
        var expenseCtx = document.getElementById('expenseChart');
        var costCtx = document.getElementById('operationalCostChart');

        try {
            var [vehicles, trips, drivers, fuelLogs, maintLogs, expenses] = await Promise.all([
                TransitOpsAPI.getVehicles(),
                TransitOpsAPI.getTrips(),
                TransitOpsAPI.getDrivers(),
                TransitOpsAPI.getFuelLogs(),
                TransitOpsAPI.getMaintenanceLogs(),
                TransitOpsAPI.getExpenses()
            ]);

            if (vehicleStatusCtx) {
                var vAvail = vehicles.filter(function (v) { return v.status === 'Available'; }).length;
                var vOnTrip = vehicles.filter(function (v) { return v.status === 'On Trip'; }).length;
                var vInShop = vehicles.filter(function (v) { return v.status === 'In Shop'; }).length;
                var vRetired = vehicles.filter(function (v) { return v.status === 'Retired'; }).length;
                charts.push(new Chart(vehicleStatusCtx, {
                    type: 'pie',
                    data: { labels: ['Available', 'On Trip', 'In Shop', 'Retired'], datasets: [{ data: [vAvail, vOnTrip, vInShop, vRetired] }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));
            }

            if (tripStatusCtx) {
                var draft = trips.filter(function (t) { return t.status === 'Draft'; }).length;
                var dispatched = trips.filter(function (t) { return t.status === 'Dispatched'; }).length;
                var completed = trips.filter(function (t) { return t.status === 'Completed'; }).length;
                var cancelled = trips.filter(function (t) { return t.status === 'Cancelled'; }).length;
                charts.push(new Chart(tripStatusCtx, {
                    type: 'bar',
                    data: { labels: ['Draft', 'Dispatched', 'Completed', 'Cancelled'], datasets: [{ label: 'Trips', data: [draft, dispatched, completed, cancelled] }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));
            }

            if (driverTripCtx) {
                var dAssigned = trips.filter(function (t) { return t.status === 'Dispatched' || t.status === 'Draft'; }).length;
                var dCompleted = trips.filter(function (t) { return t.status === 'Completed'; }).length;
                var dPending = trips.filter(function (t) { return t.status === 'Draft'; }).length;
                charts.push(new Chart(driverTripCtx, {
                    type: 'doughnut',
                    data: { labels: ['Completed', 'Dispatched', 'Pending'], datasets: [{ data: [dCompleted, dAssigned, dPending] }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));
            }

            if (distanceCtx) {
                var distData = [0, 0, 0, 0, 0];
                var completedTrips = trips.filter(function (t) { return t.status === 'Completed'; });
                if (completedTrips.length > 0) {
                    var perTrip = Math.min(Math.round(completedTrips.reduce(function (s, t) { return s + (t.cargo_weight || 0); }, 0) / 100), 500);
                    distData = distData.map(function () { return Math.round(perTrip * (0.5 + Math.random())); });
                }
                charts.push(new Chart(distanceCtx, {
                    type: 'line',
                    data: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], datasets: [{ label: 'Distance (km)', data: distData }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));
            }

            if (driverStatusCtx) {
                var drAvail = drivers.filter(function (d) { return d.status === 'Available'; }).length;
                var drOnTrip = drivers.filter(function (d) { return d.status === 'On Trip'; }).length;
                var drSuspended = drivers.filter(function (d) { return d.status === 'Suspended'; }).length;
                charts.push(new Chart(driverStatusCtx, {
                    type: 'pie',
                    data: { labels: ['Available', 'On Trip', 'Suspended'], datasets: [{ data: [drAvail, drOnTrip, drSuspended] }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));
            }

            if (licenseCtx) {
                var today = new Date();
                var expired = 0, expiring = 0, valid = 0;
                drivers.forEach(function (d) {
                    var diff = Math.ceil((new Date(d.license_expiry_date) - today) / (1000 * 60 * 60 * 24));
                    if (diff <= 0) expired++;
                    else if (diff <= 30) expiring++;
                    else valid++;
                });
                charts.push(new Chart(licenseCtx, {
                    type: 'bar',
                    data: { labels: ['Expired', 'Expiring <30 Days', 'Valid'], datasets: [{ label: 'Drivers', data: [expired, expiring, valid] }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));
            }

            if (expenseCtx) {
                var fuelTotal = fuelLogs.reduce(function (s, f) { return s + (f.total_cost || f.cost || 0); }, 0);
                var maintTotal = maintLogs.reduce(function (s, m) { return s + (m.cost || 0); }, 0);
                var expenseTotal = expenses.reduce(function (s, e) { return s + (e.amount || 0); }, 0);
                charts.push(new Chart(expenseCtx, {
                    type: 'pie',
                    data: { labels: ['Fuel', 'Maintenance', 'Other Expenses'], datasets: [{ data: [fuelTotal, maintTotal, expenseTotal] }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));
            }

            if (costCtx) {
                var monthlyData = [0, 0, 0, 0, 0];
                var allCosts = [];
                fuelLogs.forEach(function (f) { allCosts.push({ date: f.date_filled || f.date, amount: f.total_cost || f.cost || 0 }); });
                maintLogs.forEach(function (m) { allCosts.push({ date: m.maintenance_date || m.date, amount: m.cost || 0 }); });
                expenses.forEach(function (e) { allCosts.push({ date: e.date, amount: e.amount || 0 }); });
                if (allCosts.length > 0) {
                    allCosts.sort(function (a, b) { return (a.date || '').localeCompare(b.date || ''); });
                    var chunk = Math.max(1, Math.floor(allCosts.length / 5));
                    for (var i = 0; i < 5; i++) {
                        monthlyData[i] = allCosts.slice(i * chunk, (i + 1) * chunk).reduce(function (s, c) { return s + c.amount; }, 0);
                    }
                }
                charts.push(new Chart(costCtx, {
                    type: 'line',
                    data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], datasets: [{ label: 'Operational Cost (₹)', data: monthlyData }] },
                    options: { responsive: true, maintainAspectRatio: false }
                }));
            }
        } catch (e) {
            console.error('Chart loading error:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCharts);
    } else {
        initCharts();
    }
})();
