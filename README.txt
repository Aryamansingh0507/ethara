# Ethara — Full Stack Task Management App

## About The Project

Ethara is a simple and modern task management application where teams can create projects, assign tasks, track progress, and manage workflow using role-based access.

It is built using the MERN Stack:

* React
* Node.js
* Express.js
* MongoDB

---

#  What This App Does

###  Admin Features

* Create and manage projects
* Hide/show projects for members
* Create and delete tasks
* View dashboard analytics
* Manage all tasks and users

###  Member Features

* View visible projects only
* Create tasks
* Update task status
* Track assigned work
* Search and filter tasks

### Main Features

* JWT Authentication
* Role-based access control
* Task management system
* Dashboard statistics
* Search & filtering
* Responsive UI

---

# 🛠 Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Axios
* React Router

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt

---

# 📁 Folder Structure

```bash
ethara/
│
├── backend/
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   └── taskController.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   └── taskRoutes.js
│   │
│   ├── config/
│   │   └── database.js
│   │
│   ├── server.js
│   └── package.json
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Signup.jsx
│   │       └── Dashboard.jsx
│   │
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

# ⚡ How To Run The Project

## 1️⃣ Clone Repository

```bash
git clone <your-repo-link>
cd ethara
```

---

# 🔹 Backend Setup

## Go to backend folder

```bash
cd backend
```

## Install dependencies

```bash
npm install
```

## Create `.env` file

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
PORT=5000
```

## Start backend server

```bash
npm start
```

Backend runs on:

```bash
http://localhost:5000
```

---

# 🔹 Frontend Setup

## Open new terminal

```bash
cd frontend
```

## Install dependencies

```bash
npm install
```

## Run frontend

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# 🗄 Database

You can use:

* MongoDB Local
* MongoDB Atlas

Example MongoDB URI:

```env
mongodb+srv://username:password@cluster.mongodb.net/ethara
```

---

# 🔐 Authentication Flow

```text
Signup/Login
     ↓
JWT Token Generated
     ↓
Protected Routes Access
```

---

# 📌 API Routes

## Auth Routes

```bash
POST /api/auth/register
POST /api/auth/login
```

## Project Routes

```bash
GET    /api/projects
POST   /api/projects
PATCH  /api/projects/:id/visibility
```

## Task Routes

```bash
GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/:id/status
DELETE /api/tasks/:id
GET    /api/tasks/summary
```

---

# 🎯 Task Status Flow

```text
Todo
  ↓
In Progress
  ↓
Completed
```

---

# 🌐 Deployment

## Backend Deployment (Railway)

1. Push project to GitHub
2. Open Railway
3. Create new project
4. Deploy backend folder
5. Add environment variables

```env
MONGO_URI=
JWT_SECRET=
PORT=5000
```

---

## Frontend Deployment

You can deploy frontend on:

* Vercel
* Netlify

Add backend API URL in frontend.

---



