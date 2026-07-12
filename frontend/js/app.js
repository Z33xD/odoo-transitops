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
    // Theme Engine Setup
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

    // Logout Control Setup
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('transitops_session');
            showToast('Logging out...', 'info');
            setTimeout(() => {
                const path = window.location.pathname;
                const isDashboard = path.includes('/dashboards/');
                window.location.href = isDashboard ? '../index.html' : 'index.html';
            }, 800);
        });
    }

    // Populate Dynamic Badge details
    const sessionStr = localStorage.getItem('transitops_session');
    if (sessionStr) {
        const session = JSON.parse(sessionStr);
        const badge = document.getElementById('user-role-badge');
        if (badge) {
            badge.innerText = `${session.role}: ${session.name}`;
        }
        document.body.setAttribute('data-role', session.role);
    }
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
