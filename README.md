# Mini Book Store & Library Management System

A full-stack Mini Book Store & Library Management System built with **Node.js, Express, PostgreSQL / SQLite (Sequelize ORM), Swagger API docs, JWT Authentication**, and a modern **React + Vite** frontend.

---

## Architecture Overview

```
Mini-Book-Store-Mgmt-sys/
├── backend/
│   ├── src/
│   │   ├── config/          # Sequelize DB config & automatic Postgres DB provisioner
│   │   ├── models/          # 12 Sequelize models & default associations
│   │   ├── seeders/         # Comprehensive sample data seeder for all 12 tables
│   │   ├── middlewares/     # JWT authentication (permissive mode) & error handling
│   │   ├── controllers/     # Business logic for all 4 core features & CRUD
│   │   └── routes/          # Express route definitions
│   ├── nodemon.json         # Nodemon configuration (ignores swagger-output.json)
│   ├── swagger.js           # Automatic Swagger API generator
│   ├── swagger-output.json  # Auto-generated OpenAPI 3.0 specification
│   ├── test-api.js          # Full end-to-end integration test suite
│   ├── .env.example         # Environment template
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/      # Dashboard, Donations, Purchasing, Lending, In-Library,
    │   │                    # BooksCatalog, Fines, AuthModal, Navbar
    │   ├── api.js           # Centralized API service
    │   ├── App.jsx          # Core layout & notifications
    │   ├── index.css        # Responsive, modern styling
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js       # Vite config with backend API proxy
    └── package.json
```

---

## 4 Core System Features

1. **Book Receiving (Donations)**:
   - Community donation request submission.
   - Staff review & approval: Approving automatically creates the Book and generates physical `BookCopy` records (`status = Available`).
   - Staff rejection with remarks or purge.

2. **Book Addition Through Purchasing**:
   - Supplier registration and management.
   - Purchase orders with multi-item entry, quantity, unit price, and auto-calculated total cost.
   - Confirming receipt automatically updates library inventory with new physical copies.

3. **Book Lending (Take-Home Borrowing)**:
   - Check out physical copies to members with strict availability checks (preventing lending the same physical copy to multiple borrowers simultaneously).
   - Return processing with automatic overdue calculation and fine generation ($1.00/day).
   - Fines management with payment settlement.

4. **In-Library Book Use (Reading Inside Library)**:
   - Desk checkout for visitors/members with expected return duration (sets copy status to `In_Library_Use`).
   - Real-time desk overdue tracking (`Desk_Overdue` status).
   - Desk return resets physical copy status back to `Available`.

---

## Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Start development server
npm run dev
```
- Swagger API Docs: **http://localhost:5000/api-docs**
- Raw OpenAPI JSON: **http://localhost:5000/api-docs.json**

### 2. Frontend Setup
```bash
cd frontend
npm install
# Start React development server
npm run dev
```
- Web Application: **http://localhost:3000**

---

## Seeded Sample Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@library.com` | `AdminPassword123!` |
| **Staff** | `sarah.librarian@library.com` | `StaffPassword123!` |
| **Staff** | `michael.desk@library.com` | `StaffPassword123!` |
| **Member** | `alice.johnson@gmail.com` | `MemberPassword123!` |
| **Visitor** | `emily.visitor@outlook.com` | `VisitorPassword123!` |
