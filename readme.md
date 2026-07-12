# TransitOps Enterprise Fleet & Operations Control Center

TransitOps is an engineering-grade, secure real-time logistics and fleet management control center. Built using a disciplined, component-driven architecture, the platform operates on a 100% live-connected infrastructure synchronizing a vanilla frontend with a Python/Flask and SQLite backend via asynchronous network operations. 

---

## System Architecture & Core Engineering

*   **Live Asynchronous Pipeline:** Bypasses localStorage or client-side caching for core application logic. All data tables and state metrics communicate directly with Python/Flask backend routes via asynchronous fetch operations.
*   **Anti-Jitter Layout Engine:** Implements rigid CSS Grid boundaries and fixed 6-week matrix constraints on calendar objects to eliminate vertical layout shifting entirely during state updates.
*   **Input Hardening:** Front-facing forms enforce data normalization using explicit inline keypress filters and native HTML5 validation constraints to guarantee data integrity before database insertion.
*   **Rupee Localization:** All financial display matrices, ledgers, and analytical aggregate cards are localized using the Indian Rupee (₹ / INR) currency framework.
*   **System Anchor Date:** All chronological analysis and compliance validations evaluate data parameters against a system benchmark date of July 12, 2026.

---

## Main Portal Features & User Roles

### 1. Unified Left-Pane Command Deck (Sidebar Navigation)

*   **Dual-Month Stack:** Renders two successive operational months simultaneously, stacked vertically within a fixed 250px container pane.
*   **Stateful Navigation:** Interactive controls increment or decrement both stacked grids in unison across past and future years.
*   **Cross-Table Event Tooltips:** Aggregates database event rows across multiple tables concurrently using Promise.all(). Hovering over highlighted days renders absolute-positioned diagnostic cards detailing dispatches, shop services, and document expirations without view clipping.
*   **Layout Hierarchy:** Fixes the dark mode configuration utility to the top right corner, real-time system clock at the top body, and pushes user session details strictly to the bottom edge via flex layouts.

### 2. Fleet Manager Portal

*   **Dynamic Maintenance Synchronization:** Features an automated service closure system. Completing a repair issues an HTTP PUT payload to the backend, marking the log as closed while simultaneously reverting the vehicle's asset status flag from 'In Shop' back to 'Available'.
*   **Availability Enforcement Engine:** The maintenance log entry form dynamically queries the asset status property, filtering the selection to display only vehicles flagged as 'Available'. Assets on active trips or already in the shop are programmatically excluded.

### 3. Driver Portal & Trip Manifests

*   **Live Handshake Deliveries:** Integrates an explicit material delivery confirmation workflow button next to active dispatches. Triggering this completes the route lifecycle, automatically cascading both the driver and truck states back to 'Available' in the database.
*   **Streamlined Ledger Tables:** Focuses strictly on high-variance trip logs, material weights, and dispatch configurations, omitting non-functional panels or dead metric containers.

### 4. Safety & Compliance Room

*   **Multi-Option Auditing Resolution:** Clicking the resolution element on a license expiry alert launches a modal presenting two distinct enforcement actions:
    *   *Renew License:* Reveals an inline date selector, firing a PUT request to update the driver's profile in the database.
    *   *Remove Driver:* Issues an atomic HTTP DELETE request to permanently purge non-compliant personnel from live records.
*   **Fleet Document Compliance Grid:** Maps directly to the vehicle documents table, running string parsing to evaluate expiration dates against the benchmark system clock, generating high-visibility compliance tags.
*   **Vector Compliance Gauge:** A native HTML/SVG graphic calculating personnel validity percentages dynamically from active backend arrays.

### 5. Financial Operations Workspace

*   **Aggregated Overhead Analytics:** Displays high-variance financial summary calculations compiling real-time database vectors:
    *   Total Cumulative Operating Overhead = Sum of Fuel Logs + Sum of Maintenance Costs + Sum of General Expenses
    *   Average Fuel Efficiency = Total Calculated Distance / Total Liters Consumed per vehicle
*   **Purged Interfaces:** Focuses exclusively on numeric data streams and responsive monetary ledgers, removing all stagnant dummy graphics.

---

## Installation & Environment Setup

Follow these steps to initialize the relational database and populate it with the production-seeded enterprise dataset:

```bash
# Clone the repository and navigate to the project root
git clone https://github.com/Z33xD/odoo-transitops.git
cd odoo-transitops

# Clear lingering runtime database instances if present
rm -f database/transitops.db

# Rebuild the relational schema layout
sqlite3 database/transitops.db < database/schema.sql

# Load the high-density Indian logistics dataset seeds into the database
sqlite3 database/transitops.db < database/seed.sql

# Setup Environment
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt 
python3 backend/app.py

# Start the server
python3 -m http.server 5000

# Go To Localhost

http://localhost:5000
```