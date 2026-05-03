# Full-Stack Invoice Management Application

A complete production-ready Invoice Management Application built with Java Spring Boot and React.

## Features

- **Authentication**: Secure JWT-based signup, login, and protected routes.
- **Dashboard**: High-level overview with revenue charts (Recharts) and dynamic statistics.
- **Customer Management**: Full CRUD capabilities for managing clients and their contact/GST details.
- **Invoice Management**: 
  - Dynamic line items with auto-calculating subtotals, tax, and totals.
  - Custom invoice statuses (PENDING, PAID, UNPAID).
  - Print-friendly invoice details view.
- **Profile Settings**: Update user profile and change password.

## Tech Stack

### Backend
- **Java 17** & **Spring Boot 3.2**
- **Spring Security** & **JWT (jjwt 0.12.x)** for stateless authentication
- **Spring Data JPA** with **MySQL 8** Database
- **Lombok** & **Hibernate Validator**
- **Maven**

### Frontend
- **React 18** (Vite)
- **React Router v6** (Protected and Public Routing)
- **Tailwind CSS** for modern, responsive styling
- **React Hook Form** + **Yup** for form validation
- **Axios** (interceptors configured)
- **Recharts** (Dashboard visualization)
- **Lucide React** (Icons)
- **React Hot Toast** (Notifications)

## Running the Project Locally

### Prerequisites
- Java 17
- Node.js 18+
- MySQL 8 server running locally

### Backend Setup
1. Open the `backend` folder.
2. In `src/main/resources/application.properties`, set your local MySQL credentials:
   ```properties
   DB_URL=jdbc:mysql://localhost:3306/invoice_db?createDatabaseIfNotExist=true
   DB_USERNAME=root
   DB_PASSWORD=yourpassword
   ```
3. Run the backend application using Maven or your IDE:
   `mvn spring-boot:run`
   The backend will start on `http://localhost:8080`.

### Frontend Setup
1. Open the `frontend` folder.
2. Install dependencies:
   `npm install`
3. Create a `.env` file in the `frontend` directory (optional if backend is on 8080):
   `VITE_API_URL=http://localhost:8080/api`
4. Start the development server:
   `npm run dev`
5. Open `http://localhost:5173` in your browser.

## Project Structure
- `backend/`: Spring Boot REST API, structured into controllers, services, repositories, entities, and dtos.
- `frontend/`: React Vite application, utilizing functional components, custom hooks, and context API.
