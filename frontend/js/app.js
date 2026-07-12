// --- Reusable Global MPA Controller ---

// Toast Notifications Helper
window.showToast = function(message, type = 'info') {
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
};

// Check if user has an active session for the expected dashboard role
window.checkSession = function(expectedRole) {
    const sessionStr = localStorage.getItem('transitops_session');
    if (!sessionStr) {
        showToast('Unauthorized access. Redirecting...', 'danger');
        setTimeout(() => {
            const path = window.location.pathname;
            const isDashboard = path.includes('/dashboards/');
            window.location.href = isDashboard ? '../index.html' : 'index.html';
        }, 1000);
        return null;
    }
    const session = JSON.parse(sessionStr);
    if (expectedRole && session.role !== expectedRole) {
        showToast('Role mismatch. Routing to proper workspace...', 'danger');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
        return null;
    }
    return session;
};

// Initialize persistent navbar components and theme togglers
window.initCommonLayout = function() {
    // 1. Theme Configuration
    const savedTheme = localStorage.getItem('transitops-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        // Reset listener
        const clonedBtn = themeBtn.cloneNode(true);
        themeBtn.replaceWith(clonedBtn);
        clonedBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('transitops-theme', newTheme);
            showToast(`Switched to ${newTheme} mode`, 'success');
        });
    }

    // 2. Logout Control Setup
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        // Reset listener
        const clonedLogoutBtn = logoutBtn.cloneNode(true);
        logoutBtn.replaceWith(clonedLogoutBtn);
        clonedLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem('transitops_session');
            showToast('Logging out...', 'info');
            setTimeout(() => {
                const path = window.location.pathname;
                const isDashboard = path.includes('/dashboards/');
                window.location.href = isDashboard ? '../index.html' : 'index.html';
            }, 800);
        });
    }

    // 3. User Badge details
    const sessionStr = localStorage.getItem('transitops_session');
    let session = { role: 'Guest', name: 'User' };
    if (sessionStr) {
        session = JSON.parse(sessionStr);
        document.body.setAttribute('data-role', session.role);
    }

    // 4. Restructure Sidebar Element Ordering
    const sidebar = document.getElementById('persistent-navbar');
    if (sidebar) {
        sidebar.style.position = 'relative';

        // TOP RIGHT: Position the Theme Toggle button as a flat absolute utility icon
        const activeThemeBtn = document.getElementById('theme-toggle');
        if (activeThemeBtn) {
            activeThemeBtn.style.position = 'absolute';
            activeThemeBtn.style.top = '16px';
            activeThemeBtn.style.right = '16px';
            activeThemeBtn.style.margin = '0';
            sidebar.appendChild(activeThemeBtn);
        }

        // Extract the Logout Button before removing its parent container
        const activeLogoutBtn = document.getElementById('logout-button');
        if (activeLogoutBtn) {
            activeLogoutBtn.style.width = '100%';
        }

        // Remove old nav-actions container to clean up layouts
        const oldNavActions = sidebar.querySelector('.nav-actions');
        if (oldNavActions) {
            oldNavActions.remove();
        }

        // TOP BODY: Position Clock Ticker followed immediately by Calendar Widget
        let clockContainer = document.getElementById('sidebar-clock-container');
        if (!clockContainer) {
            clockContainer = document.createElement('div');
            clockContainer.id = 'sidebar-clock-container';
            clockContainer.className = 'sidebar-calendar-header';
            clockContainer.style.marginTop = '24px';
            clockContainer.innerHTML = `
                <div class="sidebar-calendar-time" id="sidebar-clock">12:00:00</div>
                <div class="sidebar-calendar-date" id="sidebar-date-display">12 Jul 2026</div>
            `;
            sidebar.appendChild(clockContainer);
        }

        // TOP BODY (Cont.): Calendar Widget container
        let calWidget = document.getElementById('sidebar-calendar-widget');
        if (!calWidget) {
            calWidget = document.createElement('div');
            calWidget.id = 'sidebar-calendar-widget';
            sidebar.appendChild(calWidget);
        }

        // BOTTOM BODY: User profile and Logout action button pushed strictly to bottom
        let bottomGroup = document.getElementById('sidebar-bottom-group');
        if (!bottomGroup) {
            bottomGroup = document.createElement('div');
            bottomGroup.id = 'sidebar-bottom-group';
            bottomGroup.style.marginTop = 'auto';
            bottomGroup.style.display = 'flex';
            bottomGroup.style.flexDirection = 'column';
            bottomGroup.style.gap = '8px';

            const userBadge = document.createElement('div');
            userBadge.id = 'user-role-badge';
            userBadge.className = 'role-badge';
            userBadge.innerText = `${session.role}: ${session.name}`;
            bottomGroup.appendChild(userBadge);

            if (activeLogoutBtn) {
                bottomGroup.appendChild(activeLogoutBtn);
            }

            sidebar.appendChild(bottomGroup);
        }

        // 5. Initialize Stateful Calendar
        window.initSidebarCalendar();
    }
};

window.initSidebarCalendar = function() {
    const widget = document.getElementById('sidebar-calendar-widget');
    if (!widget) return;

    widget.innerHTML = `
        <div class="calendar-controls" style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; margin-bottom: 8px;">
            <button id="cal-prev-year" class="logout-btn" style="padding: 2px 6px; font-size: 0.65rem; min-width: auto;" title="Prev Year">◀◀</button>
            <button id="cal-prev-month" class="logout-btn" style="padding: 2px 6px; font-size: 0.65rem; min-width: auto;" title="Prev Month">◀</button>
            <span id="cal-month-year" style="margin: 0; font-weight: 700; font-size: 0.72rem; color: var(--text-primary); text-transform: uppercase; text-align: center; flex-grow: 1;">JULY 2026</span>
            <button id="cal-next-month" class="logout-btn" style="padding: 2px 6px; font-size: 0.65rem; min-width: auto;" title="Next Month">▶</button>
            <button id="cal-next-year" class="logout-btn" style="padding: 2px 6px; font-size: 0.65rem; min-width: auto;" title="Next Year">▶▶</button>
        </div>
        
        <!-- Month 1 Layout Block -->
        <div class="month-container" style="margin-bottom: 16px;">
            <div id="month-name-1" class="sidebar-calendar-month-name" style="margin-bottom: 4px; font-weight:700; color:var(--text-primary);">July 2026</div>
            <div class="sidebar-calendar-grid" id="calendar-days-grid-1">
                <div class="sidebar-calendar-day-header">Su</div>
                <div class="sidebar-calendar-day-header">Mo</div>
                <div class="sidebar-calendar-day-header">Tu</div>
                <div class="sidebar-calendar-day-header">We</div>
                <div class="sidebar-calendar-day-header">Th</div>
                <div class="sidebar-calendar-day-header">Fr</div>
                <div class="sidebar-calendar-day-header">Sa</div>
            </div>
        </div>

        <!-- Month 2 Layout Block -->
        <div class="month-container">
            <div id="month-name-2" class="sidebar-calendar-month-name" style="margin-bottom: 4px; font-weight:700; color:var(--text-primary);">August 2026</div>
            <div class="sidebar-calendar-grid" id="calendar-days-grid-2">
                <div class="sidebar-calendar-day-header">Su</div>
                <div class="sidebar-calendar-day-header">Mo</div>
                <div class="sidebar-calendar-day-header">Tu</div>
                <div class="sidebar-calendar-day-header">We</div>
                <div class="sidebar-calendar-day-header">Th</div>
                <div class="sidebar-calendar-day-header">Fr</div>
                <div class="sidebar-calendar-day-header">Sa</div>
            </div>
        </div>
    `;

    // Clock Display Updates
    function updateClock() {
        const clockEl = document.getElementById('sidebar-clock');
        const dateEl = document.getElementById('sidebar-date-display');
        if (!clockEl || !dateEl) return;

        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockEl.innerText = `${hours}:${minutes}:${seconds}`;

        const day = now.getDate();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        dateEl.innerText = `${day} ${month} ${year}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Stateful Calendar Navigation parameters
    let currentMonth = 6; // July
    let currentYear = 2026;
    let eventDict = {};
    let activeTooltip = null;

    const monthsLong = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    function renderMonthGrid(gridId, monthLabelId, year, month) {
        const grid = document.getElementById(gridId);
        const monthLabel = document.getElementById(monthLabelId);
        if (!grid || !monthLabel) return;

        // Clear existing cells (keeping headers only)
        const headers = grid.querySelectorAll('.sidebar-calendar-day-header');
        grid.innerHTML = '';
        headers.forEach(h => grid.appendChild(h));

        monthLabel.innerText = `${monthsLong[month]} ${year}`;

        // Get day details
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();

        // 1. Initial Empty Spacer Cells
        for (let i = 0; i < firstDay; i++) {
            const cell = document.createElement('div');
            cell.className = 'sidebar-calendar-day empty';
            grid.appendChild(cell);
        }

        // 2. Day Value Cells
        for (let day = 1; day <= totalDays; day++) {
            const cell = document.createElement('div');
            cell.className = 'sidebar-calendar-day';
            cell.innerText = day;

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            cell.dataset.date = dateStr;

            const dayEvents = eventDict[dateStr];
            if (dayEvents && dayEvents.length > 0) {
                // Determine highest importance severity
                let hasDanger = false;
                let hasWarning = false;
                let hasInfo = false;
                let hasPast = false;

                dayEvents.forEach(ev => {
                    if (ev.severity === 'danger') hasDanger = true;
                    else if (ev.severity === 'warning') hasWarning = true;
                    else if (ev.severity === 'info') hasInfo = true;
                    else if (ev.severity === 'past') hasPast = true;
                });

                if (hasDanger) {
                    cell.classList.add('event-danger');
                } else if (hasWarning) {
                    cell.classList.add('event-warning');
                } else if (hasInfo) {
                    cell.classList.add('event-info');
                } else if (hasPast) {
                    cell.classList.add('event-past');
                }

                cell.addEventListener('mouseenter', () => {
                    if (activeTooltip) activeTooltip.remove();

                    activeTooltip = document.createElement('div');
                    activeTooltip.className = 'calendar-tooltip';

                    const dateObj = new Date(dateStr);
                    const formattedDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

                    let itemsHtml = '';
                    dayEvents.forEach(ev => {
                        let itemClass = '';
                        if (ev.type === 'maintenance') itemClass = ' type-maintenance';
                        else if (ev.type === 'compliance') itemClass = ' type-compliance';

                        itemsHtml += `<div class="calendar-tooltip-item${itemClass}">${ev.text}</div>`;
                    });

                    activeTooltip.innerHTML = `
                        <h4>Schedule — ${formattedDate}</h4>
                        ${itemsHtml}
                    `;

                    document.body.appendChild(activeTooltip);

                    const rect = cell.getBoundingClientRect();
                    activeTooltip.style.left = `${rect.right + 10}px`;
                    activeTooltip.style.top = `${rect.top + window.scrollY - 10}px`;
                });

                cell.addEventListener('mouseleave', () => {
                    if (activeTooltip) {
                        activeTooltip.remove();
                        activeTooltip = null;
                    }
                });
            }

            grid.appendChild(cell);
        }

        // 3. Trailing Padding Cells to Prevent Layout Shifts (Anti-Jitter Rule)
        // Every month grid MUST have exactly 42 cell slots (excluding headers)
        const renderedCellsCount = firstDay + totalDays;
        const remainingCells = 42 - renderedCellsCount;
        for (let i = 0; i < remainingCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'sidebar-calendar-day empty';
            grid.appendChild(cell);
        }
    }

    function renderStackedMonths() {
        // Render current viewed month (Month 1)
        renderMonthGrid('calendar-days-grid-1', 'month-name-1', currentYear, currentMonth);

        // Calculate and render successive month (Month 2)
        let nextMonth = currentMonth + 1;
        let nextYear = currentYear;
        if (nextMonth > 11) {
            nextMonth = 0;
            nextYear++;
        }
        renderMonthGrid('calendar-days-grid-2', 'month-name-2', nextYear, nextMonth);

        // Update overall controls display indicator
        const monthYearLabel = document.getElementById('cal-month-year');
        if (monthYearLabel) {
            monthYearLabel.innerText = `${monthsLong[currentMonth].substring(0, 3)} - ${monthsLong[nextMonth].substring(0, 3)} ${currentYear}`;
        }
    }

    // Bind Navigation Button Handlers
    document.getElementById('cal-prev-year').addEventListener('click', () => {
        currentYear--;
        renderStackedMonths();
    });
    document.getElementById('cal-prev-month').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderStackedMonths();
    });
    document.getElementById('cal-next-month').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderStackedMonths();
    });
    document.getElementById('cal-next-year').addEventListener('click', () => {
        currentYear++;
        renderStackedMonths();
    });

    // Asynchronous database loader and aggregator
    Promise.all([
        window.TransitOpsAPI.getTrips().catch(() => []),
        window.TransitOpsAPI.getMaintenanceLogs().catch(() => []),
        window.TransitOpsAPI.getVehicleDocuments().catch(() => []),
        window.TransitOpsAPI.getDrivers().catch(() => [])
    ]).then(([trips, logs, docs, drivers]) => {
        const baseline = new Date('2026-07-12');

        // 1. Trips
        trips.forEach(t => {
            if (t.created_at) {
                const dateKey = t.created_at.split('T')[0].split(' ')[0];
                if (!eventDict[dateKey]) eventDict[dateKey] = [];
                const isPast = t.status === 'Completed';
                eventDict[dateKey].push({
                    type: 'trip',
                    status: t.status,
                    severity: isPast ? 'past' : 'info',
                    text: `Dispatch: ${t.source} to ${t.destination} [${t.status}]`
                });
            }
        });

        // 2. Maintenance Logs
        logs.forEach(l => {
            if (l.start_date) {
                const dateKey = l.start_date.split('T')[0];
                if (!eventDict[dateKey]) eventDict[dateKey] = [];
                const isPast = l.status === 'Closed';
                eventDict[dateKey].push({
                    type: 'maintenance',
                    status: l.status || 'Open',
                    severity: isPast ? 'past' : 'info',
                    text: `Shop Service: Vehicle #${l.vehicle_id} - ${l.description} [${l.status || 'Open'}]`
                });
            }
        });

        // 3. Vehicle Compliance Documents
        docs.forEach(d => {
            if (d.expiry_date) {
                const dateKey = d.expiry_date.split('T')[0];
                if (!eventDict[dateKey]) eventDict[dateKey] = [];
                
                const expiry = new Date(d.expiry_date);
                const diffTime = expiry - baseline;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let sev = 'info';
                if (diffDays <= 0) {
                    sev = 'danger';
                } else if (diffDays <= 60) {
                    sev = 'warning';
                }

                eventDict[dateKey].push({
                    type: 'compliance',
                    severity: sev,
                    text: `Expiry Warning: ${d.document_type} due [${sev === 'danger' ? 'EXPIRED' : 'EXPIRING'}]`
                });
            }
        });

        // 4. Drivers (License Expiration & Score Warnings)
        drivers.forEach(d => {
            if (d.license_expiry_date) {
                const dateKey = d.license_expiry_date.split('T')[0];
                if (!eventDict[dateKey]) eventDict[dateKey] = [];
                
                const expiry = new Date(d.license_expiry_date);
                const diffTime = expiry - baseline;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let sev = 'info';
                if (diffDays <= 0 || d.status === 'Suspended') {
                    sev = 'danger';
                } else if (diffDays <= 60 || d.safety_score < 75) {
                    sev = 'warning';
                }

                eventDict[dateKey].push({
                    type: 'compliance',
                    severity: sev,
                    text: `Driver Alert: ${d.name} CDL [${sev === 'danger' ? 'RED WARNING' : 'YELLOW WARNING'}]`
                });
            }
        });

        // Trigger layout build
        renderStackedMonths();
    }).catch(err => {
        console.error('Failed to load operational calendar data:', err);
    });
};

// Helper function to generate standardized lifecycle status badges
window.getStatusPillHTML = function(status) {
    const normalized = status.toLowerCase().replace(/\s+/g, '');
    return `<span class="status-pill status-${normalized}">${status}</span>`;
};

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const isDashboard = path.includes('/dashboards/');
    if (isDashboard) {
        window.initCommonLayout();
    } else {
        // We are on index.html (login page), bootstrap theme configurations only
        const savedTheme = localStorage.getItem('transitops-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
});
