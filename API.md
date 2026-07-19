# Travel Agency Management System - API Documentation

This document outlines the RESTful API endpoints available in the backend system. This API serves both the Client Website and the Admin Dashboard.

## 📌 Base Information
- **Base URL:** `http://localhost:5001/api`
- **Content-Type:** `application/json`

---

## 🔒 Authentication

The API uses **JSON Web Tokens (JWT)** for securing protected routes.
When accessing protected routes, you must include the token in the `Authorization` header.

```http
Authorization: Bearer <your_jwt_token_here>
```

---

## 📥 Request & Response Format
All API requests with a body must send JSON. 
All API responses will return JSON.

**Success Response Format:**
```json
{
  "success": true,
  "data": { ... } // or an array [...]
}
```

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error description here"
}
```

---

## 📡 HTTP Status Codes
- `200 OK` - The request was successful.
- `201 Created` - A new resource was successfully created.
- `400 Bad Request` - Invalid input or missing parameters.
- `401 Unauthorized` - Missing or invalid JWT token.
- `403 Forbidden` - User does not have permission (e.g., Admin only).
- `404 Not Found` - The requested resource does not exist.
- `500 Internal Server Error` - Server encountered an unexpected condition.

---

## 1. Authentication Endpoints

### 🟢 Customer Login
- **HTTP Method:** `POST`
- **Endpoint:** `/customers/login`
- **Description:** Authenticates a customer and returns a JWT token for client portal access.
- **Request Body:**
  ```json
  {
    "email": "customer@example.com",
    "password": "securepassword123"
  }
  ```
- **Sample Response:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "customer": {
      "_id": "60d5ecb8b392...",
      "name": "John Doe",
      "email": "customer@example.com"
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: `{"message": "Invalid email or password"}`
  - `400 Bad Request`: `{"message": "Email and password are required"}`

### 🟢 Admin Login
- **HTTP Method:** `POST`
- **Endpoint:** `/auth/login`
- **Description:** Authenticates an admin staff member for dashboard access.
- **Request Body:**
  ```json
  {
    "email": "admin@elitetravel.com",
    "password": "Admin123"
  }
  ```
- **Sample Response:**
  ```json
  {
    "token": "eyJhbGciOiJI...",
    "user": {
      "_id": "60d5...",
      "name": "Admin Manager",
      "role": "Admin"
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: `{"message": "Invalid email or password"}`
  - `404 Not Found`: `{"message": "Admin user not found"}`

---

## 2. Users (Customers)

### 🟢 Get All Customers
- **HTTP Method:** `GET`
- **Endpoint:** `/customers`
- **Description:** Fetches a list of all registered customers. Admin privileges required.
- **Request Body:** `None`
- **Sample Response:**
  ```json
  [
    {
      "_id": "60d5ecb8b392...",
      "name": "John Doe",
      "email": "customer@example.com",
      "phone": "252615123456"
    }
  ]
  ```
- **Error Responses:**
  - `401 Unauthorized`: `{"message": "Not authorized, token failed"}`

### 🟢 Register New Customer
- **HTTP Method:** `POST`
- **Endpoint:** `/customers`
- **Description:** Registers a new client account.
- **Request Body:**
  ```json
  {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "252615987654",
    "password": "strongpassword123"
  }
  ```
- **Sample Response:**
  ```json
  {
    "_id": "60d5ecb8b...",
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"message": "Customer already exists"}`
  - `500 Internal Server Error`: `{"message": "Error creating customer"}`

---

## 3. Visa Services

### 🟢 Submit Visa Application
- **HTTP Method:** `POST`
- **Endpoint:** `/visa-applications`
- **Description:** Submits a new visa application for a customer.
- **Request Body:**
  ```json
  {
    "customer": "60d5ecb8b392...",
    "country": "Turkey",
    "type": "Tourist",
    "passportNo": "A12345678"
  }
  ```
- **Sample Response:**
  ```json
  {
    "_id": "61f5ec...",
    "customer": "60d5ecb8b392...",
    "status": "Pending",
    "country": "Turkey"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"message": "Please fill all required fields"}`

### 🟢 Update Visa Status
- **HTTP Method:** `PUT`
- **Endpoint:** `/visa-applications/:id`
- **Description:** Updates the processing status of a specific visa application (Admin Only).
- **Request Body:**
  ```json
  {
    "status": "Approved"
  }
  ```
- **Sample Response:**
  ```json
  {
    "_id": "61f5ec...",
    "status": "Approved"
  }
  ```
- **Error Responses:**
  - `404 Not Found`: `{"message": "Visa application not found"}`

---

## 4. Flights

### 🟢 Get All Flights
- **HTTP Method:** `GET`
- **Endpoint:** `/flights`
- **Description:** Fetches all available upcoming flights.
- **Request Body:** `None`
- **Sample Response:**
  ```json
  [
    {
      "_id": "62a5ec...",
      "airline": "Qatar Airways",
      "route": "Mogadishu - Doha",
      "price": 850
    }
  ]
  ```
- **Error Responses:**
  - `500 Internal Server Error`: `{"message": "Server Error"}`

---

## 5. Tour Packages

### 🟢 Get All Tour Packages
- **HTTP Method:** `GET`
- **Endpoint:** `/tour-packages`
- **Description:** Fetches all available holiday and tour packages.
- **Request Body:** `None`
- **Sample Response:**
  ```json
  [
    {
      "_id": "63b5ec...",
      "title": "Hajj Package 2024",
      "destination": "Mecca, Saudi Arabia",
      "price": 4500
    }
  ]
  ```
- **Error Responses:**
  - `500 Internal Server Error`: `{"message": "Server Error"}`

### 🟢 Create Tour Booking
- **HTTP Method:** `POST`
- **Endpoint:** `/tour-bookings`
- **Description:** Books a specific tour package for a customer.
- **Request Body:**
  ```json
  {
    "customer": "60d5ecb...",
    "packageId": "63b5ec...",
    "travelers": 2
  }
  ```
- **Sample Response:**
  ```json
  {
    "_id": "64c5ec...",
    "status": "Booked",
    "totalAmount": 9000
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"message": "Invalid package details"}`

---

## 6. Bookings (Tickets/Invoices)

### 🟢 Create Flight Ticket
- **HTTP Method:** `POST`
- **Endpoint:** `/tickets`
- **Description:** Creates a new flight ticket booking record.
- **Request Body:**
  ```json
  {
    "customer": "60d5ec...",
    "passengerName": "John Doe",
    "flightDetails": "60d5eca...",
    "isOnline": true
  }
  ```
- **Sample Response:**
  ```json
  {
    "_id": "65d5ec...",
    "passengerName": "John Doe",
    "status": "Confirmed"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"message": "Passenger name is required"}`

### 🟢 Get All Invoices
- **HTTP Method:** `GET`
- **Endpoint:** `/invoices`
- **Description:** Fetches billing invoices. Can be filtered by customer ID.
- **Request Body:** `None`
- **Sample Response:**
  ```json
  [
    {
      "invoiceNumber": "INV-178229",
      "totalAmount": 1200.00,
      "amountPaid": 400.00,
      "status": "Partially Paid"
    }
  ]
  ```
- **Error Responses:**
  - `500 Internal Server Error`: `{"message": "Failed to fetch invoices"}`

---

## 7. Payments

### 🟢 Process Mobile Money Payment (WaafiPay)
- **HTTP Method:** `POST`
- **Endpoint:** `/payments`
- **Description:** Initiates an EVC Plus/Zaad payment. Auto-syncs invoice upon success.
- **Request Body:**
  ```json
  {
    "invoice": "60d5ec...",
    "amountPaid": 400,
    "paymentMethod": "Mobile Money",
    "payerAccountNo": "252615123456"
  }
  ```
- **Sample Response:**
  ```json
  {
    "_id": "66e5ec...",
    "status": "Completed",
    "amountPaid": 400,
    "receiptNumber": "RCT-99212"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"message": "Incorrect PIN entered. Please try again."}`
  - `500 Internal Server Error`: `{"message": "The payment request timed out."}`

### 🟢 Create Stripe Payment Intent
- **HTTP Method:** `POST`
- **Endpoint:** `/stripe/create-payment-intent`
- **Description:** Generates a secure client secret for processing Credit Card payments via Stripe Elements.
- **Request Body:**
  ```json
  {
    "amount": 500
  }
  ```
- **Sample Response:**
  ```json
  {
    "clientSecret": "pi_3MtwBwLkdIwHu7ix28a3tqPc_secret_xY..."
  }
  ```
- **Error Responses:**
  - `500 Internal Server Error`: `{"message": "Failed to initialize Stripe payment"}`

---

## 8. Dashboard

### 🟢 Get Dashboard Stats
- **HTTP Method:** `GET`
- **Endpoint:** `/dashboard-stats`
- **Description:** Returns aggregated real-time analytics for the admin charts.
- **Request Body:** `None`
- **Sample Response:**
  ```json
  {
    "totalRevenue": 45000,
    "pendingVisas": 12,
    "upcomingFlights": 5,
    "recentTransactions": []
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: `{"message": "Not authorized, token failed"}`

---

## 9. Settings

### 🟢 Get System Configuration
- **HTTP Method:** `GET`
- **Endpoint:** `/settings`
- **Description:** Fetches public system settings such as contact emails and supported currencies.
- **Request Body:** `None`
- **Sample Response:**
  ```json
  {
    "currency": "USD",
    "supportEmail": "support@elitetravel.com"
  }
  ```
- **Error Responses:**
  - `500 Internal Server Error`: `{"message": "Failed to fetch settings"}`

### 🟢 Update System Settings
- **HTTP Method:** `PUT`
- **Endpoint:** `/settings`
- **Description:** Modifies global system configurations (Admin Only).
- **Request Body:**
  ```json
  {
    "supportEmail": "newsupport@elitetravel.com"
  }
  ```
- **Sample Response:**
  ```json
  {
    "message": "Settings updated successfully"
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: `{"message": "Admin privileges required"}`
