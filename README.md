# Travel Agency Management System

![Travel Agency Banner](https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1920&auto=format&fit=crop)

## 📖 Project Overview

The **Travel Agency Management System** is a comprehensive, full-stack web application designed to streamline the operations of a modern travel agency. It provides an intuitive client-facing website for customers to explore and book travel services, alongside a powerful admin dashboard for agency staff to manage bookings, visas, flights, payments, and customer relationships. 

Built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and styled with Tailwind CSS, this system is scalable, secure, and production-ready. The **backend API is fully hosted on Render**, ensuring high availability, while all system data is securely managed and hosted in the cloud using **MongoDB Atlas**.

---

## ✨ Features

### Client Portal
- **User Registration & Authentication**: Secure JWT-based login and signup.
- **Service Browsing**: Explore Flight Tickets, Visa Services, and Tour Packages.
- **Online Payments**: Integrated payment gateways (Stripe & Mobile Money/WaafiPay) for instant invoice settlement.
- **Customer Dashboard**: View booking history, track visa status, and manage invoices.
- **Email Notifications**: Automated updates on booking status and payment confirmations.

### Admin Dashboard
- **Customer Management**: Full CRM capabilities to manage client profiles and histories.
- **Booking Management**: Process and track flights, visas, tours, and cargo shipments.
- **Financial Module**: Generate invoices, track partial/full payments, and view revenue analytics.
- **Service Configuration**: Update tour packages, pricing, and availability dynamically.
- **Advanced Analytics**: Interactive dashboard with real-time statistics and charts.

---

## 💻 Technologies Used

| Category | Technology |
|---|---|
| **Frontend (Client)** | React.js, Tailwind CSS, Lucide React, Vite |
| **Frontend (Admin)** | React.js, Tailwind CSS, Recharts, Vite |
| **Backend** | Node.js, Express.js, Mongoose |
| **Database** | MongoDB Atlas |
| **Authentication** | JSON Web Tokens (JWT), bcrypt |
| **Payments** | Stripe API, WaafiPay (EVC Plus / Mobile Money) |
| **Email Service** | Nodemailer (SMTP) |

---

## 📂 Project Structure

```text
Travel-Agency/
├── Admin/                # React Admin Dashboard (Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Dashboard views
│   │   └── context/      # Admin Auth & Global State
├── Client/               # React Client Website (Vite)
│   ├── src/
│   │   ├── components/   # Client UI components
│   │   ├── Pages/        # Public and protected client pages
│   │   └── context/      # Customer Auth State
└── Backend/              # Node.js + Express API
    ├── src/
    │   ├── models/       # Mongoose Schemas (Customer, Invoice, Payment, etc.)
    │   ├── routes/       # Express API routes
    │   ├── controllers/  # Business logic
    │   └── middleware/   # JWT verification & Error handling
    └── .env              # Backend Environment Variables
```

---

## 📸 Screenshots

| Client Homepage | Admin Dashboard |
| :---: | :---: |
| ![Homepage Placeholder](https://via.placeholder.com/600x350.png?text=Client+Homepage) | ![Dashboard Placeholder](https://via.placeholder.com/600x350.png?text=Admin+Dashboard) |
| **Client Invoice & Payments** | **Visa Management** |
| ![Invoices Placeholder](https://via.placeholder.com/600x350.png?text=My+Invoices) | ![Visas Placeholder](https://via.placeholder.com/600x350.png?text=Visa+Management) |

---

## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables to your `Backend/.env` file:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/dbname
JWT_SECRET=your_super_secret_jwt_key

# SMTP Configuration (For Email Notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL="Travel Agency" <your_email@gmail.com>

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_...
WAAFIPAY_MERCHANT_UID=M...
WAAFIPAY_API_USER_ID=...
WAAFIPAY_API_KEY=API-...
WAAFIPAY_API_URL=https://api.waafipay.net/asm
```

---

## 🚀 Installation

For detailed instructions on setting up the database, configuring environment variables, and installing dependencies, please refer to the dedicated installation guide:

👉 **[Read INSTALLATION.md](./INSTALLATION.md#%EF%B8%8F-1-clone-the-repository)**

---

## 🏃‍♂️ Running the Project

To run the full stack (Backend, Client, Admin) locally or build it for production, follow the execution steps outlined here:

👉 **[Read INSTALLATION.md](./INSTALLATION.md#-4-running-the-project-locally)**

---

## 🔗 API Documentation

The backend provides a comprehensive RESTful API for both the Client and Admin portals. For full details on available endpoints, request bodies, and authentication headers, please view the API documentation:

👉 **[Read API.md](./API.md)**

---

## 🔮 Future Improvements

- [ ] Multi-language and localized currency support.
- [ ] Integration with global GDS (Global Distribution System) for live flight fetching.
- [ ] AI-powered travel itinerary generator.
- [ ] Automated SMS notifications via Twilio.
- [ ] Customer mobile application (React Native).

---

## 👨‍💻 Author

Developed as a comprehensive Travel Agency Management System. 
Designed for scalability, premium user experience, and robust business management.
