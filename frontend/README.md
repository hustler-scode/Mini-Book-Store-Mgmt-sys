# Mini Book Store & Library Management System - Frontend

A modern, responsive React single-page application built with **Vite** and **Lucide Icons** connecting directly to the Node.js / Express backend.

---

## Implemented Views & Core Features

### 1. Dashboard
- **Live Metrics**: Total Unique Titles, Available vs Total Physical Copies, Active Take-Home Loans, In-Library Readers, Pending Donations, and Outstanding Fines.
- **Overdue Alerts**: Real-time warning banners for overdue loans and desk overdue sessions with one-click resolution.
- **Feature Quick Launch**: Direct shortcuts to all library workflows.

### 2. Feature 1: Book Receiving (Donations)
- **Submit Request Form**: Donors/staff submit book details, author, category, condition, and quantity.
- **Staff Approval**: One-click approval automatically creates the Book and creates the required physical `BookCopy` records with `status = 'Available'`.
- **Rejection**: Rejection dialog with remarks and optional record removal.

### 3. Feature 2: Book Addition Through Purchasing
- **Supplier Directory**: Register publishers, bookstores, and distributors with full contact info.
- **Purchase Orders**: Multi-item purchase orders with live total cost calculation.
- **Receipt Confirmation**: "Confirm Receipt" button verifies delivery and **automatically increases library inventory** with new book copies.

### 4. Feature 3: Book Lending (Take-Home Borrowing)
- **Borrow Modal**: Select physical copies from available stock with real-time availability validation (prevents duplicate simultaneous lending).
- **Active Loans Table**: Real-time status and due date countdown.
- **Overdue Loans Tracker**: Dedicated overdue tab highlighting past-due books.
- **Return Book**: Reshelves copy back to `Available` and **automatically computes and issues fines** ($1.00/day) if returned late.

### 5. Feature 4: In-Library Book Use
- **Desk Checkout**: Check out copies to visitors for reading inside the facility (sets copy status to `In_Library_Use`).
- **Real-Time Desk Overdue Tracking**: Automatically flags sessions past their expected desk return time with `Desk_Overdue` badges.
- **Desk Return**: Return books to shelves with staff remarks and resets copy status to `Available`.

### 6. Books Catalog & Physical Inventory
- Search by title, author, or ISBN; filter by category.
- **Expandable Copies Accordion**: Inspect every physical copy's barcode, condition, source type (`Donation` vs `Purchase`), and live availability.
- **Add Physical Copies**: Generate extra copies for any existing title.

### 7. Fines Registry
- Filter by `Unpaid` vs `Paid`.
- Summary of total outstanding vs settled collections.
- **Settle Fine**: Record payment method and remarks.

### 8. Authentication & JWT
- Sign in / Register modal with role indicators (`Admin`, `Staff`, `Member`, `Visitor`).
- Quick-fill buttons for pre-seeded test accounts.
- Direct link to backend **Swagger API** docs.

---

## How to Run the Frontend

1. Ensure the backend server is running on `http://localhost:5000`:
   ```bash
   cd backend
   npm run dev
   ```

2. In a separate terminal, start the React development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser at:
   👉 **http://localhost:3000**
