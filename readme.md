# odoo-transitops - Smart Transport Operations Platform

A centralized transport operations platform built to streamline fleet management, driver operations, trip dispatching, vehicle maintenance, fuel tracking, and operational analytics. TransitOps replaces manual spreadsheets and logbooks with a modern web application that improves operational efficiency through automation and real-time insights.

> Developed as part of an 8-hour hackathon.

---

## Features

### Authentication & Role-Based Access
- Secure login system
- Role-Based Access Control (RBAC)
- Protected routes for authenticated users

### Vehicle Management
- Register and manage fleet vehicles
- Unique vehicle registration validation
- Track vehicle status:
  - Available
  - On Trip
  - In Shop
  - Retired

### Driver Management
- Driver profile management
- License validity tracking
- Safety score monitoring
- Driver status management

### Trip Management
- Create and manage transport trips
- Assign available vehicles and drivers
- Cargo capacity validation
- Trip lifecycle:
  - Draft
  - Dispatched
  - Completed
  - Cancelled

### Maintenance Management
- Create maintenance records
- Automatically update vehicle availability
- Prevent vehicles under maintenance from being assigned

### Fuel & Expense Tracking
- Record fuel logs
- Record maintenance and toll expenses
- Automatically calculate operational costs

### Dashboard & Analytics
- Fleet utilization
- Active vehicles
- Vehicles under maintenance
- Driver availability
- Fuel efficiency
- Operational cost analysis
- Vehicle ROI

### PDF Report Export
- Generate downloadable PDF reports containing trip details, fleet performance, fuel consumption, maintenance history, and operational expenses for easy sharing and record-keeping.
  
### Email reminders for expiring licenses
- Automatically notify administrators when a driver's license is nearing its expiry date, helping ensure compliance and uninterrupted operations.
  
### Advanced search and filters
- Quickly locate vehicles, drivers, or trips using filters such as status, vehicle type, region, date, or registration number for efficient data management.

### Interactive analytics dashboard
- Visualize key fleet metrics through interactive charts and graphs, including fleet utilization, fuel efficiency, operational costs, trip statistics, and vehicle ROI.
  
---

## 📁 Project Structure

```
TransitOps/
│
├── models/
├── views/
├── controllers/
├── static/
│   ├── css/
│   ├── js/
│   └── images/
├── templates/
├── reports/
├── security/
├── data/
├── README.md
└── requirements.txt
```

---

## Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (ES6)
- Bootstrap 5
- Chart.js

### Backend
- Python

### Database
- PostgreSQL

### Authentication
- Role-Based Access Control (RBAC)

### Reports
- QWeb Reports
- CSV Export

### Version Control
- Git
- GitHub

---

## Database Entities

- Users
- Roles
- Vehicles
- Drivers
- Trips
- Maintenance Logs
- Fuel Logs
- Expenses

---

## Business Rules

- Vehicle registration number must be unique.
- Vehicles marked **In Shop** or **Retired** cannot be dispatched.
- Drivers with expired licenses or suspended status cannot be assigned.
- A driver or vehicle already on a trip cannot be assigned again.
- Cargo weight cannot exceed vehicle capacity.
- Dispatching a trip automatically changes vehicle and driver status to **On Trip**.
- Completing a trip restores both statuses to **Available**.
- Creating a maintenance record automatically changes vehicle status to **In Shop**.

---

## Dashboard Metrics

- Active Vehicles
- Available Vehicles
- Vehicles in Maintenance
- Active Trips
- Pending Trips
- Drivers On Duty
- Fleet Utilization
- Fuel Efficiency
- Operational Cost
- Vehicle ROI

---

## License

This project was developed for educational and hackathon purposes.