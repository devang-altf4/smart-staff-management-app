# Smart Staff Management System

A mobile app for managing staff attendance, salary, and payments.

## Tech Stack
- **Frontend**: React Native (Expo)
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas

## User Roles
- **Owner** — Full system control (create shop, add staff, manage salaries)
- **Manager** — Limited permissions (attendance, staff view, payments - as allowed by owner)
- **Employee** — View attendance/salary history, request salary

---

## Setup Instructions

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

The server starts on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npx expo start
```

> **Important**: Update the API URL in `frontend/src/services/api.js`:
> - Android Emulator: `http://10.0.2.2:5000/api`
> - iOS Simulator: `http://localhost:5000/api`
> - Physical Device: `http://YOUR_COMPUTER_IP:5000/api`

---

## API Endpoints

### Auth
- `POST /api/auth/register` — Register owner + shop
- `POST /api/auth/login` — Login (all roles)

### Staff (Owner/Manager)
- `POST /api/staff` — Add staff (owner only)
- `GET /api/staff` — List all staff
- `GET /api/staff/:id` — Get staff detail
- `PUT /api/staff/:id` — Update staff (owner only)
- `DELETE /api/staff/:id` — Delete staff (owner only)

### Attendance
- `POST /api/attendance` — Mark single attendance
- `POST /api/attendance/bulk` — Bulk mark for a day
- `GET /api/attendance/user/:userId` — Get user attendance (query: month, year)
- `GET /api/attendance/date/:date` — Get all attendance for a date

### Salary
- `POST /api/salary/request` — Employee creates salary request
- `GET /api/salary/requests` — Owner gets all requests
- `GET /api/salary/my-requests` — Employee gets own requests
- `PUT /api/salary/request/:id` — Owner approves/rejects (can change amount)
- `POST /api/salary/payment` — Record cash payment
- `GET /api/salary/history/:userId` — Payment history
- `GET /api/salary/summary/:userId` — Salary summary (earned, paid, balance)

---

## App Screens

| Screen | Role | Description |
|--------|------|-------------|
| Login | All | Phone + password login |
| Register | Owner | Register owner + create shop |
| Owner Dashboard | Owner | Stats + menu navigation |
| Add Staff | Owner | Add employee/manager with permissions |
| Staff List | Owner/Manager | View all staff members |
| Staff Detail | Owner/Manager | Individual staff info + salary summary |
| Attendance | Owner/Manager | Mark daily attendance (present/absent) |
| Salary Requests | Owner | Approve/reject/edit salary requests |
| Salary History | Owner/Manager | View payment records per staff |
| Record Payment | Owner/Manager | Record cash salary payment |
| Employee Dashboard | Employee | Salary overview + attendance stats |
| My Attendance | Employee | View own attendance history |
| My Salary History | Employee | View payment records |
| Request Salary | Employee | Send salary request |
| My Requests | Employee | View status of requests |

---

## Salary Calculation

```
Daily Salary = Monthly Salary / 30
Earned Salary = Daily Salary × Present Days
Balance = Total Earned − Total Paid
```

Positive balance = company owes the employee  
Negative balance = employee was overpaid
