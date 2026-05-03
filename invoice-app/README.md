# Invoice Management Application

A full-stack Invoice Management Application built with Java Spring Boot and React.

## Features

- **Authentication** — JWT-based signup, login, and protected routes
- **Dashboard** — Revenue charts, stats (total invoices, revenue, pending amount, customer count)
- **Invoice Management**
  - Create, edit, delete invoices
  - Dynamic line items with name, quantity, price, and tax %
  - Auto-calculated subtotal, tax, and total
  - Status management: PENDING / UNPAID / PAID
  - Search by invoice number or customer name
  - Filter by status
  - Print-friendly invoice view
- **Customer Management** — Full CRUD with search, GST number support
- **User Profile** — Update profile info and change password

## Tech Stack

### Backend
- Java 17 + Spring Boot 3.2
- Spring Security + JWT (jjwt 0.12.x)
- Spring Data JPA + MySQL 8
- Lombok, Hibernate Validator, Maven

### Frontend
- React 18 (Vite)
- React Router v6
- Tailwind CSS
- React Hook Form + Yup
- Axios with JWT interceptors
- Recharts (dashboard charts)
- Lucide React + React Hot Toast

## Getting Started

> For full platform-specific instructions (Windows, Linux, macOS), see [INSTALLATION.md](INSTALLATION.md).

### Prerequisites
- Java 17 (`brew install openjdk@17` on macOS)
- Maven 3.6+ (`brew install maven`)
- Node.js 18+ (`brew install node`)
- MySQL 8 running locally (`brew install mysql`)

### First-time setup
Start MySQL, then install all dependencies in one command:
```bash
brew services start mysql   # start MySQL (macOS)
make setup                  # install frontend & backend dependencies
```

### Start the app
```bash
make dev
```
This starts **both** the backend and frontend together:
- Backend API → **http://localhost:8080/api**
- Frontend app → **http://localhost:5173**

Press `Ctrl+C` to stop both.

### Individual servers (optional)
```bash
make backend    # backend only
make frontend   # frontend only
```

### Environment Variables (optional overrides)

| Variable | Default | Description |
|---|---|---|
| `DB_USERNAME` | `root` | MySQL username |
| `DB_PASSWORD` | `root` | MySQL password |
| `JWT_SECRET` | hardcoded default | Change in production |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed frontend origin |
| `PORT` | `8080` | Backend port |

## Project Structure

```
invoice-app/
├── backend/                  # Spring Boot REST API
│   └── src/main/java/com/invoicepro/
│       ├── controller/       # REST endpoints
│       ├── service/          # Business logic
│       ├── repository/       # JPA repositories
│       ├── entity/           # JPA entities
│       ├── dto/              # Request/Response DTOs
│       ├── security/         # JWT filter, auth config
│       └── exception/        # Global error handling
└── frontend/                 # React + Vite SPA
    └── src/
        ├── pages/            # Login, Signup, Invoices, Customers, Profile, Dashboard
        ├── components/       # Reusable UI components
        ├── api/              # Axios API layer
        ├── context/          # Auth context
        ├── hooks/            # useAuth, useDebounce
        └── routes/           # PrivateRoute, PublicRoute
```
