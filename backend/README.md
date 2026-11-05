# Mini Book Store & Library Management System - Backend

A complete Node.js / Express backend with PostgreSQL (via Sequelize ORM), JWT authentication, automatic Swagger documentation generation, and full implementations for all four library features.

---

## Key Features Implemented

### 1. Book Receiving (Donations)
- **Submit Donation Request**: Record donor name, email, phone, book title, author, category, condition, and quantity.
- **Staff Approval**: Approving a request automatically:
  - Finds or creates the `Book` record.
  - Automatically generates `quantity` physical copies in the `BookCopy` table with `source_type = 'Donation'` and `status = 'Available'`.
  - Sets approval timestamp, remarks, and approving staff ID.
- **Rejection / Removal**: Staff can reject requests with remarks, or delete the record completely.

### 2. Book Addition Through Purchasing
- **Supplier Management**: Register and manage suppliers (name, contact person, phone, email, address).
- **Purchase Orders**: Record purchase date, ordered items (title, author, ISBN, category, quantity, unit price) and automatically calculate `total_cost`.
- **Automatic Inventory Incrementation**: Confirming receipt (`/api/purchases/:id/receive`) automatically creates the books and adds the physical copies to inventory with `source_type = 'Purchase'` and `condition = 'New'`.

### 3. Book Lending (Take-Home Borrowing)
- **Availability & Concurrency Check**: Strict verification ensuring the copy is in `Available` status before lending. Prevents lending the same physical copy to multiple borrowers simultaneously.
- **Borrow & Due Dates**: Tracks loan period and expected return date.
- **Return Processing & Overdue Fines**:
  - Automatically calculates overdue days upon return.
  - Generates a record in `BookFine` if returned past the due date.
  - Reverts physical copy status back to `Available`.
- **Fines Tracking**: Search unpaid fines and record payments (`/api/fines/:id/pay`).

### 4. In-Library Book Use
- **Desk Check-Out**: Record member/visitor details, physical copy, checkout time, and expected return time (sets copy status to `In_Library_Use`).
- **Desk Return**: Mark the book returned to its shelf (sets copy status back to `Available`).
- **Desk Overdue Tracking**: Dedicated endpoint (`/api/in-library/overdue`) automatically flags sessions past their expected desk return time as `Desk_Overdue`.

---

## Swagger Automatic Documentation

Whenever you add a new controller or route file:
1. Simply add your route in `src/routes/` with standard route definitions (e.g. `router.get('/api/my-feature', ...)`).
2. The dynamic loader in `swagger.js` scans the `src/routes/` directory automatically upon server startup (`npm run dev` or `npm start`).
3. Your new endpoint is **immediately discovered and displayed on the interactive Swagger UI** at:
   ```
   http://localhost:5000/api-docs
   ```
   and raw OpenAPI JSON at:
   ```
   http://localhost:5000/api-docs.json
   ```

---

## Authentication & Permissive Mode

- **JWT Authentication** is fully wired with password hashing via `bcryptjs`.
- **Endpoints Are Currently Unrestricted**: Per your requirement, the `authenticateToken` middleware runs in permissive mode—if a JWT Bearer token is provided in the `Authorization` header, it identifies the user, but if no token is provided, requests are **not blocked**, so you can test all endpoints freely in Swagger UI without needing to log in first!

---

## Database Configuration

The database configuration is managed in `.env` (sample provided in `.env.example`):

### PostgreSQL (Default)
```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=minibookstore
DB_USER=postgres
DB_PASSWORD=your_password
```

### Instant Local SQLite Mode
If your local PostgreSQL service is offline or you want instant zero-setup local testing:
```env
DB_DIALECT=sqlite
```

---

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Review `backend/.env` with your PostgreSQL credentials.

### 3. Seed Sample Data (All 12 Tables)
Populate realistic sample records across all 12 tables (Roles, Users, Categories, Books, Book Copies, Donations, Suppliers, Purchases, Loans, Fines, and In-Library Sessions):
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open Swagger Documentation
Open your browser and navigate to:
```
http://localhost:5000/api-docs
```

### 6. Run Verification Tests
```bash
node test-api.js
```

---

## Seeded Sample Accounts & Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | System Admin | `admin@library.com` | `AdminPassword123!` |
| **Staff** | Sarah Jenkins | `sarah.librarian@library.com` | `StaffPassword123!` |
| **Staff** | Michael Chang | `michael.desk@library.com` | `StaffPassword123!` |
| **Member** | Alice Johnson | `alice.johnson@gmail.com` | `MemberPassword123!` |
| **Member** | David Smith | `david.smith@yahoo.com` | `MemberPassword123!` |
| **Visitor** | Emily Davis | `emily.visitor@outlook.com` | `VisitorPassword123!` |


