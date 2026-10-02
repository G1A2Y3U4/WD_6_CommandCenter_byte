# 🚀 Command Center — Real-Time Multiplayer Kanban Board

A real-time collaborative Kanban task management application built with **React.js, Node.js, Express.js, MySQL, and Socket.IO**.

The application allows authenticated users to create, edit, delete, and move tasks between Kanban columns. Changes are synchronized instantly across multiple connected browsers without requiring a page refresh.

---

## 📌 Project Overview

**Command Center** is a multiplayer task management board designed to demonstrate real-time communication between multiple clients.

Users can:

- Register and create an account
- Login securely using JWT authentication
- Access a protected Kanban dashboard
- Create tasks
- Edit tasks
- Delete tasks
- Drag and drop tasks between columns
- View real-time changes made by other connected users
- Refresh the application while retaining task data through MySQL persistence

The project uses **Socket.IO** to broadcast task changes to all connected clients in real time.

---

## ✨ Features

### 🔐 Authentication

- User registration
- User login
- Password hashing using bcrypt
- JWT-based authentication
- Protected dashboard route
- Protected task API endpoints
- Logout functionality

### 📋 Kanban Board

The board contains three task columns:

- **To Do**
- **In Progress**
- **Done**

### 📝 Task Management

Authenticated users can:

- Create tasks
- View tasks
- Edit task details
- Delete tasks
- Change task status
- Drag and drop tasks between columns

### ⚡ Real-Time Synchronization

Socket.IO provides real-time communication between connected clients.

When one user:

- Creates a task
- Updates a task
- Moves a task
- Deletes a task

the change is immediately broadcast to other connected browsers.

No manual page refresh is required.

### 💾 Database Persistence

MySQL stores:

- User accounts
- Hashed passwords
- Kanban tasks
- Task status
- Task assignment information
- Task timestamps

When the application is refreshed, tasks are loaded again from the database.

### 📱 Responsive Interface

The frontend is built with React and provides an interactive Kanban interface suitable for desktop and browser-based use.

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Vite
- React Router DOM
- Axios
- Socket.IO Client
- DnD Kit

## Backend

- Node.js
- Express.js
- Socket.IO
- JWT
- bcrypt
- MySQL2
- CORS
- dotenv

## Database

- MySQL

## Development Tools

- Visual Studio Code
- Git
- GitHub
- MySQL Workbench
- Thunder Client / Postman

---

# 🏗️ Project Architecture

```text
Command Center
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── KanbanBoard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── api.js
│   │   ├── socket.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   └── taskController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── protectedRoutes.js
│   │   └── taskRoutes.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── screenshot/
│   ├── 1_Register page.png
│   ├── 2_Loginpage.png
│   └── 3_Dashboard.png
│
├── .gitignore
└── README.md
