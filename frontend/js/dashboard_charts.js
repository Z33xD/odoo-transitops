console.log("Dashboard charts loaded");

const vehicleStatusCtx = document.getElementById("vehicleStatusChart");

if (vehicleStatusCtx) {
    new Chart(vehicleStatusCtx, {
        type: "pie",
        data: {
            labels: [
                "Available",
                "On Trip",
                "In Shop",
                "Retired"
            ],
            datasets: [{
                data: [3, 0, 0, 0]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
    }
    });
}
const tripStatusCtx = document.getElementById("tripStatusChart");

if (tripStatusCtx) {
    new Chart(tripStatusCtx, {
        type: "bar",
        data: {
            labels: [
                "Draft",
                "Dispatched",
                "Completed",
                "Cancelled"
            ],
            datasets: [{
                label: "Trips",
                data: [0, 0, 0, 0]
            }]
        },
        options: {
        responsive: true,
        maintainAspectRatio: false
    }
    });
}
const driverTripCtx = document.getElementById("driverTripChart");

if (driverTripCtx) {
    new Chart(driverTripCtx, {
        type: "doughnut",
        data: {
            labels: [
                "Completed",
                "Assigned",
                "Pending"
            ],
            datasets: [{
                data: [0, 0, 0]
            }]
        },
        options: {
        responsive: true,
        maintainAspectRatio: false
    }
    });
}
const distanceCtx = document.getElementById("distanceChart");

if (distanceCtx) {
    new Chart(distanceCtx, {
        type: "line",
        data: {
            labels: [
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri"
            ],
            datasets: [{
                label: "Distance (km)",
                data: [0, 0, 0, 0, 0]
            }]
        },
        options: {
        responsive: true,
        maintainAspectRatio: false
    }
    });
}
const driverStatusCtx = document.getElementById("driverStatusChart");

if (driverStatusCtx) {
    new Chart(driverStatusCtx, {
        type: "pie",
        data: {
            labels: [
                "Available",
                "On Trip",
                "Suspended"
            ],
            datasets: [{
                data: [2, 0, 0]
            }]
        },
        options: {
        responsive: true,
        maintainAspectRatio: false
    }
    });
}
const licenseCtx = document.getElementById("licenseExpiryChart");

if (licenseCtx) {
    new Chart(licenseCtx, {
        type: "bar",
        data: {
            labels: [
                "Expired",
                "Expiring <30 Days",
                "Valid"
            ],
            datasets: [{
                label: "Drivers",
                data: [0, 0, 2]
            }]
        },
        options: {
        responsive: true,
        maintainAspectRatio: false
    }
    });
}
const expenseCtx = document.getElementById("expenseChart");

if (expenseCtx) {
    new Chart(expenseCtx, {
        type: "pie",
        data: {
            labels: [
                "Fuel",
                "Maintenance",
                "Toll"
            ],
            datasets: [{
                data: [0, 0, 0]
            }]
        },
        options: {
        responsive: true,
        maintainAspectRatio: false
    }
    });
}
const costCtx = document.getElementById("operationalCostChart");

if (costCtx) {
    new Chart(costCtx, {
        type: "line",
        data: {
            labels: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May"
            ],
            datasets: [{
                label: "Operational Cost (₹)",
                data: [0, 0, 0, 0, 0]
            }]
        },
        options: {
        responsive: true,
        maintainAspectRatio: false
    }
    });
}