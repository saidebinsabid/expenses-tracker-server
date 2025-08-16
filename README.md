# 💰 Personal Expense Tracker

## 🚀 Live Project Link
[![Live Demo](https://img.shields.io/badge/Live%20Demo-%20-%2300C853?style=for-the-badge&logo=appveyor)](https://lustrous-llama-8abf6e.netlify.app/auth/login)  

---

## 📌 Project Overview

**Personal Expense Tracker** is a full-stack MERN application that allows users to add, view, edit, and delete personal expenses. Users can categorize expenses, view total and category-wise breakdowns via charts, filter expenses, and securely authenticate using Firebase. The platform is fully responsive and optimized for desktop, tablet, and mobile devices.

---

## 👤 Authentication

- Users can register and login via **Firebase Authentication**.
- Optionally implement JWT for secure backend API access.

---

## 🖼️ Project Banner

![Expense Tracker Banner](https://github.com/saidebinsabid/expenses-tracker-server/blob/main/website%20image.png)

---

## 🌟 Key Features

1. 📝 **Add, Edit & Delete Expenses**  
2. 🏷️ **Categorize Expenses** (Food, Transport, Shopping, Others)  
3. 📊 **View Total Expenses & Category-Wise Charts** (Pie & Line charts using Recharts)  
4. 🔄 **Filter Expenses by Category** (optional)  
5. 🔐 **Secure Authentication** using Firebase  
6. 💻 **Responsive Design** for Desktop, Tablet & Mobile  
7. ⚡ **Fast & Interactive UI** built with React & Tailwind CSS  
8. 🛠️ **REST API Backend** with Node.js, Express, MongoDB, and JWT  
9. 🚀 **Live Data Fetching & Updating** via Axios and React Hooks  
10. 📂 **Clean Project Structure** for easy maintenance and scalability

---

## 🧩 Frontend Folder Structure

```bash
expense-tracker-frontend/
├─ node_modules/
├─ public/
│  └─ _redirects
├─ src/
│  ├─ assets/
│  ├─ components/
│  │  ├─ ExpenseEditModal.jsx
│  │  ├─ ExpenseLineChart.jsx
│  │  ├─ ExpensePieChart.jsx
│  │  └─ Loading.jsx
│  ├─ firebase/
│  │  └─ firebase.config.js
│  ├─ hooks/
│  │  ├─ useAuth.jsx
│  │  └─ useAxiosSecure.jsx
│  ├─ layouts/
│  │  ├─ AuthLayout.jsx
│  │  └─ DashboardLayout.jsx
│  ├─ pages/
│  │  ├─ DashBoardPages/
│  │  │  ├─ AddExpense.jsx
│  │  │  ├─ DashboardHome.jsx
│  │  │  ├─ ExpenseChart.jsx
│  │  │  └─ ExpenseList.jsx
│  │  ├─ Forbidden.jsx
│  │  ├─ Login.jsx
│  │  └─ Register.jsx
│  ├─ provider/
│  │  ├─ AuthProvider.jsx
│  │  └─ PrivateRoute.jsx
│  ├─ router/
│  │  └─ Routes.jsx
│  ├─ App.css
│  ├─ App.jsx
│  ├─ index.css
│  └─ main.jsx
├─ .env.local
├─ .gitignore
├─ package.json
├─ vite.config.js
└─ README.md
```
---

### 🚀 How to Run Locally

## 💻 Frontend

```bash
# Clone the project
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker

# Install dependencies
npm install

# Create environment file
VITE_apiKey=YOUR_FIREBASE_API_KEY
VITE_authDomain=YOUR_FIREBASE_AUTH_DOMAIN
VITE_projectId=YOUR_FIREBASE_PROJECT_ID
VITE_storageBucket=YOUR_FIREBASE_STORAGE_BUCKET
VITE_messagingSenderId=YOUR_FIREBASE_MESSAGING_SENDER_ID
VITE_appId=YOUR_FIREBASE_APP_ID
VITE_API_URL=http://localhost:3000

# Run the development server
npm run dev
```

---


## 🌐 Backend

```bash
# Clone the project
cd expense-tracker-server
npm install

# Create a .env file:
DB_USER=YOUR_DB_USERNAME
DB_PASS=YOUR_DB_PASSWORD
JWT_SECRET=YOUR_JWT_SECRET

# Start the backend server:
nodemon index.js
```
---
## 🛠 Tech Stack

### 💻 Frontend

- **React** `^19.1.0`
- **React Router** `^7.8.1`
- **Tailwind CSS** 
- **TanStack React Query**
- **Axios**
- **React Hook Form**
- **Firebase**
- **React Icons**
- **Lottie React**
- **SweetAlert2**
- **react-toastify**

---

### 🌐 Backend

- **Node.js**
- **Express.js**
- **MongoDB**
- **dotenv**
- **cookie-parser**
- **jsonwebtoken**
- **CORS**
---

## 🙌 Thank You for Visiting Expense Tracker!

Thank you for exploring Personal Expense Tracker — a simple, interactive, and fully responsive platform for managing personal expenses.

If you have any questions, feedback, or collaboration ideas —
**feel free to reach out!**

📧 **Email:** ssaidebin1@gmail.com
