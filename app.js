// --- Mock State Data Layer ---
const state = {
    users: {
        'manager@transitops.com': {
            name: 'Alex Vance',
            role: 'Fleet Manager',
        },
        'driver@transitops.com': {
            name: 'James Miller',
            role: 'Driver',
            driverId: 1
        },
        'safety@transitops.com': {
            name: 'Elena Rostova',
            role: 'Safety Officer',
        },
        'finance@transitops.com': {
            name: 'Marcus Vance',
            role: 'Financial Analyst',
        }
    },
    vehicles: [
        { id: 1, registration_number: 'TX-9021', name_model: 'Peterbilt 579', type: 'Semi-Truck', max_load_capacity: 45000, current_odometer: 124500, acquisition_cost: 154000, status: 'Available' },
        { id: 2, registration_number: 'CA-5491', name_model: 'Freightliner Cascadia', type: 'Semi-Truck', max_load_capacity: 40000, current_odometer: 89000, acquisition_cost: 145000, status: 'On Trip' },
        { id: 3, registration_number: 'NY-1024', name_model: 'Volvo VNL 860', type: 'Heavy Duty Truck', max_load_capacity: 42000, current_odometer: 215400, acquisition_cost: 162000, status: 'In Shop' },
        { id: 4, registration_number: 'FL-3389', name_model: 'Kenworth T680', type: 'Heavy Duty Truck', max_load_capacity: 44000, current_odometer: 450200, acquisition_cost: 135000, status: 'Retired' }
    ],
    drivers: [
        { id: 1, name: 'James Miller', license_number: 'CDL-882910', license_category: 'Class A CDL', license_expiry_date: '2027-11-15', contact_number: '+1-555-0101', safety_score: 95, status: 'On Trip' },
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

// --- Global Active Session & Theme Variables ---
let currentSession = {
    user: null,
    role: null,
    driverId: null
};

// --- Theme Management ---
function initTheme() {
    const savedTheme = localStorage.getItem('transitops-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('transitops-theme', newTheme);
            showToast(`Switched to ${newTheme} mode`, 'success');
        });
    }
}

// --- Toast Alerts ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// --- Click-to-Fill Credentials Helper ---
window.quickFill = function(email) {
    document.getElementById('auth-email').value = email;
    document.getElementById('auth-password').value = 'password';
    showToast('Credentials filled. Click Sign In.', 'info');
};

// --- Core Auth Router ---
function initAuth() {
    const form = document.getElementById('auth-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value.trim().toLowerCase();
        const password = document.getElementById('auth-password').value;

        if (!password) {
            showToast('Password is required', 'danger');
            return;
        }

        const authenticatedUser = state.users[email];
        if (authenticatedUser) {
            currentSession.user = authenticatedUser.name;
            currentSession.role = authenticatedUser.role;
            currentSession.driverId = authenticatedUser.driverId || null;

            // Update UI State
            document.body.setAttribute('data-role', authenticatedUser.role);
            const badge = document.getElementById('user-role-badge');
            badge.innerText = `${authenticatedUser.role}: ${authenticatedUser.name}`;
            
            // Toggle view visibility
            document.getElementById('auth-overlay').classList.add('hidden');
            document.getElementById('persistent-navbar').classList.remove('hidden');
            document.getElementById('workspace-container').classList.remove('hidden');

            showToast(`Welcome back, ${authenticatedUser.name}!`, 'success');
            renderActiveWorkspace();
        } else {
            showToast('Invalid corporate credentials.', 'danger');
        }
    });

    const logoutBtn = document.getElementById('logout-button');
    logoutBtn.addEventListener('click', () => {
        currentSession = { user: null, role: null, driverId: null };
        document.body.removeAttribute('data-role');
        document.getElementById('auth-overlay').classList.remove('hidden');
        document.getElementById('persistent-navbar').classList.add('hidden');
        document.getElementById('workspace-container').classList.add('hidden');
        
        // Hide all views
        document.querySelectorAll('.workspace-view').forEach(view => view.classList.add('hidden'));
        
        // Clear login fields
        document.getElementById('auth-email').value = '';
        document.getElementById('auth-password').value = '';
        
        showToast('Logged out successfully', 'info');
    });
}

// --- Dynamic Workspace Router ---
function renderActiveWorkspace() {
    // Hide all views first
    document.querySelectorAll('.workspace-view').forEach(view => view.classList.add('hidden'));

    switch (currentSession.role) {
        case 'Fleet Manager':
            setupFleetManagerWorkspace();
            break;
        case 'Driver':
            setupDriverWorkspace();
            break;
        case 'Safety Officer':
            setupSafetyOfficerWorkspace();
            break;
        case 'Financial Analyst':
            setupFinancialAnalystWorkspace();
            break;
        default:
            showToast('Undefined session role access.', 'danger');
    }
}

// --- Helper Functions to Generate Table Status badges ---
function getStatusPillHTML(status) {
    const normalized = status.toLowerCase().replace(/\s+/g, '');
    return `<span class="status-pill status-${normalized}">${status}</span>`;
}

// --- // --- 1. Fleet Manager Controller ---
function setupFleetManagerWorkspace() {
    const view = document.getElementById('view-fleet-manager');
    view.classList.remove('hidden');

    // Stats calculations
    const totalVehicles = state.vehicles.length;
    const inShopVehicles = state.vehicles.filter(v => v.status === 'In Shop').length;
    const availableVehicles = state.vehicles.filter(v => v.status === 'Available').length;

    document.getElementById('fm-stat-fleet').innerText = totalVehicles;
    document.getElementById('fm-stat-shop').innerText = inShopVehicles;
    document.getElementById('fm-stat-available').innerText = availableVehicles;

    // Load maintenance vehicle select options
    const maintVehicleSelect = document.getElementById('maintenance-vehicle');
    maintVehicleSelect.innerHTML = '<option value="">Select vehicle...</option>';
    state.vehicles.forEach(v => {
        if (v.status !== 'Retired') {
            maintVehicleSelect.innerHTML += `
                <option value="${v.id}">
                    ${v.registration_number} - ${v.name_model} [${v.status}]
                </option>`;
        }
    });

    // Populate maintenance logs registry table
    const maintTableBody = document.getElementById('fleet-maintenance-table-body');
    maintTableBody.innerHTML = '';
    
    const sortedLogs = [...state.maintenance_logs].reverse();
    sortedLogs.forEach(log => {
        const vehicle = state.vehicles.find(v => v.id === log.vehicle_id);
        maintTableBody.innerHTML += `
            <tr>
                <td><strong>${vehicle ? vehicle.registration_number : 'N/A'}</strong></td>
                <td>${log.reason}</td>
                <td>${log.date}</td>
            </tr>`;
    });

    // Populate vehicle registry table
    const vehicleTableBody = document.getElementById('fleet-vehicles-table-body');
    vehicleTableBody.innerHTML = '';
    state.vehicles.forEach(v => {
        vehicleTableBody.innerHTML += `
            <tr>
                <td><strong>${v.registration_number}</strong></td>
                <td>${v.name_model}</td>
                <td>${v.max_load_capacity.toLocaleString()} lbs</td>
                <td>${v.current_odometer.toLocaleString()} mi</td>
                <td>${getStatusPillHTML(v.status)}</td>
            </tr>`;
    });

    // Event listener for Maintenance form submit
    const maintForm = document.getElementById('maintenance-form');
    maintForm.replaceWith(maintForm.cloneNode(true)); // Reset listener
    document.getElementById('maintenance-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const vehicleId = parseInt(document.getElementById('maintenance-vehicle').value);
        const reason = document.getElementById('maintenance-reason').value.trim();

        const vehicle = state.vehicles.find(v => v.id === vehicleId);

        if (!vehicle) {
            showToast('Invalid vehicle selection.', 'danger');
            return;
        }

        // Apply 'In Shop' status cascade
        vehicle.status = 'In Shop';
        
        // Log maintenance entry
        const todayStr = new Date().toISOString().split('T')[0];
        const newLog = {
            id: state.maintenance_logs.length + 1,
            vehicle_id: vehicle.id,
            reason: reason,
            date: todayStr
        };
        state.maintenance_logs.push(newLog);

        showToast(`Vehicle ${vehicle.registration_number} is now In Shop for maintenance!`, 'success');
        setupFleetManagerWorkspace(); // Refresh display
        document.getElementById('maintenance-form').reset();
    });
}

function renderFMRegistryTrips() {
    const tripsTableBody = document.getElementById('fleet-trips-table-body');
    tripsTableBody.innerHTML = '';
    
    // Sort dispatches descending by ID so new ones show at the top
    const sortedTrips = [...state.trips].reverse();
    sortedTrips.forEach(t => {
        tripsTableBody.innerHTML += `
            <tr>
                <td>
                    <div style="font-weight:600; font-size:0.85rem; color:var(--text-primary);">${t.source} → ${t.destination}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">Trip ID: #${t.id}</div>
                </td>
                <td style="font-size:0.85rem;">${t.cargo_weight.toLocaleString()} lbs</td>
                <td>${getStatusPillHTML(t.status)}</td>
            </tr>`;
    });
}

// --- 2. Driver Controller ---
function setupDriverWorkspace() {
    const view = document.getElementById('view-driver');
    view.classList.remove('hidden');

    const driverId = currentSession.driverId;
    const driverRecord = state.drivers.find(d => d.id === driverId);
    
    document.getElementById('driver-welcome-subtitle').innerText = `Welcome, ${currentSession.user} | Active Driver & Dispatcher`;

    // Dropdowns for Dispatch Plan Form
    const vehicleSelect = document.getElementById('dispatch-vehicle');
    const driverSelect = document.getElementById('dispatch-driver');

    vehicleSelect.innerHTML = '<option value="">Select vehicle...</option>';
    driverSelect.innerHTML = '<option value="">Select driver...</option>';

    // Load available vehicles (excluding In Shop, Retired)
    state.vehicles.forEach(v => {
        if (v.status !== 'In Shop' && v.status !== 'Retired') {
            const isAssigned = v.status === 'On Trip';
            vehicleSelect.innerHTML += `
                <option value="${v.id}" ${isAssigned ? 'disabled' : ''}>
                    ${v.registration_number} - ${v.name_model} (${v.max_load_capacity.toLocaleString()} lbs) [${v.status}]
                </option>`;
        }
    });

    // Load available drivers (excluding Suspended, Off Duty)
    state.drivers.forEach(d => {
        if (d.status !== 'Suspended' && d.status !== 'Off Duty') {
            const isAssigned = d.status === 'On Trip';
            driverSelect.innerHTML += `
                <option value="${d.id}" ${isAssigned ? 'disabled' : ''}>
                    ${d.name} (Score: ${d.safety_score}) [${d.status}]
                </option>`;
        }
    });

    // Render registry list (Trips Registry table)
    renderFMRegistryTrips();

    // Event listener for Dispatch form submit
    const dispatchForm = document.getElementById('dispatch-form');
    dispatchForm.replaceWith(dispatchForm.cloneNode(true)); // Reset listener
    document.getElementById('dispatch-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const vehicleId = parseInt(document.getElementById('dispatch-vehicle').value);
        const driverIdOpt = parseInt(document.getElementById('dispatch-driver').value);
        const source = document.getElementById('dispatch-source').value.trim();
        const destination = document.getElementById('dispatch-destination').value.trim();
        const weight = parseInt(document.getElementById('dispatch-weight').value);

        const vehicle = state.vehicles.find(v => v.id === vehicleId);
        const driver = state.drivers.find(d => d.id === driverIdOpt);

        // Strict dispatch validations (Business rule hooks)
        if (!vehicle || !driver) {
            showToast('Invalid asset selections.', 'danger');
            return;
        }

        if (vehicle.status === 'In Shop' || vehicle.status === 'Retired') {
            showToast(`Vehicle ${vehicle.registration_number} is not in service!`, 'danger');
            return;
        }

        if (driver.status === 'Suspended' || driver.status === 'Off Duty') {
            showToast(`Driver ${driver.name} is not available!`, 'danger');
            return;
        }

        if (weight > vehicle.max_load_capacity) {
            showToast(`Overweight Alert: Cargo Weight (${weight.toLocaleString()} lbs) exceeds max vehicle capacity (${vehicle.max_load_capacity.toLocaleString()} lbs)! Dispatch rejected.`, 'danger');
            return;
        }

        // Apply new trip state and transit operations update
        const newTrip = {
            id: state.trips.length + 101,
            source: source,
            destination: destination,
            cargo_weight: weight,
            planned_distance: Math.round(100 + Math.random() * 800),
            status: 'Dispatched',
            vehicle_id: vehicle.id,
            driver_id: driver.id
        };

        vehicle.status = 'On Trip';
        driver.status = 'On Trip';
        state.trips.push(newTrip);

        showToast(`Route ${newTrip.id} Dispatched successfully!`, 'success');
        setupDriverWorkspace(); // Refresh display
        document.getElementById('dispatch-form').reset();
    });

    // Populate active trip assignment for the driver if logged in as James Miller
    const tripContainer = document.getElementById('driver-trip-container');
    const activeTrip = state.trips.find(t => t.driver_id === driverId && (t.status === 'Dispatched' || t.status === 'Draft'));

    if (activeTrip) {
        const vehicle = state.vehicles.find(v => v.id === activeTrip.vehicle_id);
        tripContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="padding: 16px; border-radius: var(--border-radius-sm); background: var(--primary-light); border: 1px solid var(--border-color);">
                    <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 4px;">Route Assignment</div>
                    <div style="font-size: 1.4rem; font-weight: 800; font-family: var(--font-heading);">${activeTrip.source} &rarr; ${activeTrip.destination}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Trip Tracker Reference: #${activeTrip.id}</div>
                </div>

                <div class="stats-bar" style="grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 0;">
                    <div class="stat-card glass-panel" style="padding: 12px;">
                        <span class="stat-label" style="font-size: 0.75rem;">Vehicle Assigned</span>
                        <span style="font-size: 1.1rem; font-weight: 700;">${vehicle?.registration_number || 'N/A'}</span>
                        <span class="stat-desc" style="font-size: 0.7rem;">${vehicle?.name_model || ''}</span>
                    </div>
                    <div class="stat-card glass-panel" style="padding: 12px;">
                        <span class="stat-label" style="font-size: 0.75rem;">Load Weight</span>
                        <span style="font-size: 1.1rem; font-weight: 700;">${activeTrip.cargo_weight.toLocaleString()} lbs</span>
                        <span class="stat-desc" style="font-size: 0.7rem;">Limit: ${vehicle?.max_load_capacity.toLocaleString() || 0} lbs</span>
                    </div>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 8px;">
                    <div>
                        <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-secondary);">Trip Status:</span>
                        ${getStatusPillHTML(activeTrip.status)}
                    </div>
                    
                    <div>
                        ${activeTrip.status === 'Dispatched' ? `
                            <button id="driver-complete-btn" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.85rem;">
                                Mark Completed
                            </button>
                        ` : `
                            <span style="font-size:0.85rem; color:var(--color-success); font-weight:600;">Trip completed</span>
                        `}
                    </div>
                </div>
            </div>`;

        const completeBtn = document.getElementById('driver-complete-btn');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => {
                activeTrip.status = 'Completed';
                
                // Release vehicle and driver statuses
                if (vehicle) vehicle.status = 'Available';
                if (driverRecord) driverRecord.status = 'Available';

                showToast(`Trip #${activeTrip.id} marked as completed!`, 'success');
                setupDriverWorkspace(); // Reload view
            });
        }
    } else {
        tripContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 16px;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h4 style="font-weight: 600; margin-bottom: 4px;">No Assigned Trips</h4>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">Your queue is currently empty. Contact the dispatch manager for a new route.</p>
            </div>`;
    }
}

// --- 3. Safety Officer Workspace ---
function setupSafetyOfficerWorkspace() {
    const view = document.getElementById('view-safety-officer');
    view.classList.remove('hidden');

    const alertsContainer = document.getElementById('safety-alerts-container');
    alertsContainer.innerHTML = '';

    // Safety checks logic
    const today = new Date();
    const alertList = [];

    state.drivers.forEach(d => {
        // Expiration check
        const expiryDate = new Date(d.license_expiry_date);
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (d.status === 'Suspended') {
            alertList.push({
                type: 'danger',
                title: 'Driver Suspended Alert',
                desc: `${d.name}'s transport certification is flagged as SUSPENDED.`
            });
        }

        if (d.safety_score < 75) {
            alertList.push({
                type: 'warning',
                title: 'Low Driving Safety Score',
                desc: `${d.name} safety ranking at ${d.safety_score}% requires driver compliance coaching.`
            });
        }

        if (diffDays <= 0) {
            alertList.push({
                type: 'danger',
                title: 'License Expired',
                desc: `${d.name}'s License (${d.license_number}) expired on ${d.license_expiry_date}!`
            });
        } else if (diffDays <= 60) {
            alertList.push({
                type: 'warning',
                title: 'License Renewal Warning',
                desc: `${d.name}'s license will expire in ${diffDays} days (${d.license_expiry_date}).`
            });
        }
    });

    if (alertList.length > 0) {
        alertList.forEach(a => {
            const iconClass = a.type === 'danger' ? 'alert-danger' : 'alert-warning';
            alertsContainer.innerHTML += `
                <div class="compliance-item">
                    <div class="compliance-details">
                        <div class="compliance-icon ${iconClass}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px; height:18px;">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            </svg>
                        </div>
                        <div class="compliance-info">
                            <h4>${a.title}</h4>
                            <p>${a.desc}</p>
                        </div>
                    </div>
                </div>`;
        });
    } else {
        alertsContainer.innerHTML = `
            <div style="text-align:center; padding:32px; color:var(--text-muted);">
                <h4>All Drivers Compliant</h4>
                <p style="font-size:0.8rem; margin-top:4px;">No active alerts or expiration issues detected.</p>
            </div>`;
    }

    // Driver compliance directory
    const tableBody = document.getElementById('safety-drivers-table-body');
    tableBody.innerHTML = '';
    state.drivers.forEach(d => {
        let scoreClass = 'safety-score-high';
        if (d.safety_score < 75) scoreClass = 'safety-score-low';
        else if (d.safety_score < 90) scoreClass = 'safety-score-medium';

        tableBody.innerHTML += `
            <tr>
                <td><strong>${d.name}</strong></td>
                <td><code style="font-family: monospace; font-size:0.85rem;">${d.license_number}</code></td>
                <td>${d.license_expiry_date}</td>
                <td>
                    <span class="safety-score-pill ${scoreClass}">${d.safety_score}%</span>
                </td>
                <td>${getStatusPillHTML(d.status)}</td>
            </tr>`;
    });
}

// --- 4. Financial Analyst Controller ---
function setupFinancialAnalystWorkspace() {
    const view = document.getElementById('view-financial-analyst');
    view.classList.remove('hidden');

    // Total metrics calculations
    const totalAssetVal = state.vehicles.reduce((sum, v) => sum + v.acquisition_cost, 0);
    const totalCargoWeight = state.trips.reduce((sum, t) => sum + t.cargo_weight, 0);
    
    let totalOdometer = 0;
    state.vehicles.forEach(v => totalOdometer += v.current_odometer);
    const avgOdometer = Math.round(totalOdometer / state.vehicles.length);

    // Apply counters
    document.getElementById('fin-stat-total-value').innerText = `$${totalAssetVal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('fin-stat-total-weight').innerText = `${totalCargoWeight.toLocaleString()} lbs`;
    document.getElementById('fin-stat-avg-odometer').innerText = `${avgOdometer.toLocaleString()} mi`;

    // Capacity Efficiency Panel Details
    document.getElementById('fin-active-routes-count').innerText = `${state.trips.filter(t => t.status === 'Dispatched').length} paths mapped`;
    
    const completedTrips = state.trips.filter(t => t.status === 'Completed');
    const avgCargo = completedTrips.length > 0
        ? Math.round(completedTrips.reduce((sum, t) => sum + t.cargo_weight, 0) / completedTrips.length)
        : 0;
    document.getElementById('fin-avg-cargo-weight').innerText = `${avgCargo.toLocaleString()} lbs average`;

    // Render Asset Valuation list
    const assetsBody = document.getElementById('fin-assets-table-body');
    assetsBody.innerHTML = '';
    state.vehicles.forEach(v => {
        assetsBody.innerHTML += `
            <tr>
                <td><strong>${v.registration_number}</strong></td>
                <td>${v.name_model}</td>
                <td style="font-family: monospace;">$${v.acquisition_cost.toLocaleString()}</td>
                <td>${v.current_odometer.toLocaleString()} mi</td>
                <td>${getStatusPillHTML(v.status)}</td>
            </tr>`;
    });
}

// --- Bootstrap SPA Lifecycle ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAuth();
});
