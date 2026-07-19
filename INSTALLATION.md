# Installation & Setup Guide

Welcome to the **Travel Agency Management System** developer setup guide. This document provides step-by-step instructions on how to install, configure, and run the project locally for development and production.

---

## 💻 System Requirements

Before you begin, ensure you have the following installed on your machine:
- **Node.js**: v16.0.0 or higher (v18+ recommended)
- **npm**: v7.0.0 or higher
- **Git**: v2.0.0 or higher
- **MongoDB**: A free MongoDB Atlas cluster or a local MongoDB server.

---

## 🛠️ 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/Abdinasirmoha/Travel-Agency.git
cd travel-agency-system
```

---

## 📦 2. Install Dependencies

This project is a monorepo consisting of three separate Node.js applications: Backend, Client (Frontend), and Admin (Dashboard).

Open your terminal and install dependencies for all three environments:

**Backend:**
```bash
cd Backend
npm install
cd ..
```

**Client Website:**
```bash
cd Client
npm install
cd ..
```

**Admin Dashboard:**
```bash
cd Admin
npm install
cd ..
```

---

## ⚙️ 3. Configure Environment Variables

The project requires specific environment variables to connect to the database and payment gateways. 

### Backend Configuration
Navigate to the `Backend` folder and create a `.env` file:

```bash
cd Backend
touch .env
```

Paste the following into your `Backend/.env` file and replace the placeholders with your actual keys:

```env
# Server
PORT=5001

# Database
MONGODB_URI=mongodb+srv://<your_db_user>:<your_db_password>@cluster.mongodb.net/travel_agency?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (Nodemailer SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
FROM_EMAIL="EliteTravel Pro" <your_email@gmail.com>

# WaafiPay (Mobile Money) Configuration
WAAFIPAY_MERCHANT_UID=M0910291
WAAFIPAY_API_USER_ID=1000416
WAAFIPAY_API_KEY=API-675418888AHX
WAAFIPAY_API_URL=https://api.waafipay.net/asm

# Stripe Configuration (Credit Cards)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

### Client Configuration
Navigate to the `Client` folder and create a `.env` file:

```bash
cd ../Client
touch .env
```

Paste the following:

```env
VITE_API_URL=http://localhost:5001/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_public_key
```

### Admin Configuration
Navigate to the `Admin` folder and create a `.env` file:

```bash
cd ../Admin
touch .env
```

Paste the following:

```env
VITE_API_URL=http://localhost:5001/api
```

---

## 🚀 4. Running the Project Locally

You need to run the Backend, Client, and Admin applications simultaneously in three separate terminal windows.

### Terminal 1: Run Backend
```bash
cd Backend
npm run dev
```
*The server will start on `http://localhost:5001`*

### Terminal 2: Run Client Website
```bash
cd Client
npm run dev
```
*The client website will start on `http://localhost:5173`*

### Terminal 3: Run Admin Dashboard
```bash
cd Admin
npm run dev
```
*The admin dashboard will start on `http://localhost:5174`*

---

## 🏗️ 5. Build for Production

To deploy the frontend applications to a production environment (like Vercel, Netlify, or Nginx), you need to compile them.

**Build Client:**
```bash
cd Client
npm run build
```
*This generates a `dist/` folder containing the optimized production build.*

**Build Admin:**
```bash
cd Admin
npm run build
```

**Backend Production Run:**
```bash
cd Backend
npm start
```
*(Ensure `npm start` runs `node server.js` instead of `nodemon`)*

---

## 🚨 Common Errors & Troubleshooting

| Error | Cause | Solution |
|---|---|---|
| `MongoParseError: Invalid scheme` | Incorrect MongoDB URI format. | Ensure your `.env` string starts with `mongodb+srv://` and contains no invalid spaces. |
| `Cannot find module 'cors'` | Dependencies not installed. | Run `npm install` inside the Backend folder. |
| `EADDRINUSE: address already in use :::5001` | Another app is using port 5001. | Kill the process running on port 5001 or change the `PORT` in your `.env`. |
| WaafiPay: `AbortError` or `Timeout` | Payment prompt expired. | Ensure you enter your PIN on your mobile phone within 60 seconds of clicking 'Pay'. |
| Stripe Elements not rendering | Missing Publishable Key. | Ensure `VITE_STRIPE_PUBLISHABLE_KEY` is correctly set in `Client/.env`. |

---

## 📁 Project Folder Structure

A quick glance at the internal architecture:

```text
Travel-Agency/
├── Admin/                     # React Admin Panel
│   ├── src/
│   │   ├── components/        # Reusable dashboard widgets
│   │   ├── pages/             # Dashboard, Invoices, Customers
│   │   └── context/           # Admin Authentication State
├── Client/                    # React Customer Website
│   ├── src/
│   │   ├── components/        # Navbar, Footer, Cards
│   │   ├── Pages/             # Home, About, Tourism, Invoices
│   │   └── context/           # Customer Authentication State
└── Backend/                   # Node.js Server
    ├── src/
    │   ├── controllers/       # Route logic
    │   ├── models/            # Mongoose DB Schemas
    │   ├── routes/            # Express endpoints (api.js, waafipay.js)
    │   └── utils/             # Helpers (mailer.js, etc.)
    └── .env                   # Secrets
```
