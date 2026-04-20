# 🏠  Family Hub 

A comprehensive family management application that enables parents to assign tasks to family members, track progress, and reward children with a points-based system. Built as a graduation project.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Flutter App Setup](#flutter-app-setup)
  - [React App Setup](#react-app-setup)
- [VS Code Tasks (Quick Commands)](#-vs-code-tasks-quick-commands)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)
- [Contributors](#contributors)

---

## 🎯 Overview

This system helps families organize household tasks and motivate children through a gamified rewards system. Parents can create tasks, assign them to family members, and award points upon completion. Children can accumulate points and redeem them for rewards from their wishlist.

### Key Features
- **Multi-Family Auth**: Same email can have multiple family accounts
- **Arabic/RTL Support**: Full internationalization with Arabic and English
- **Budget Module**: Expense tracking, analytics, and budget planning
- **Profile Switching**: Instagram-style multi-profile support

Quick context for AI agents and new contributors: see [AGENTS.md](AGENTS.md) and [PROJECT_CONTEXT.json](PROJECT_CONTEXT.json).

---

## ✨ Features

### Authentication & User Management
- 🔐 User signup and login with JWT authentication
- 👨‍👩‍👧‍👦 Family account management
- 👤 Multiple member types (Parent, Child, etc.)
- 🔑 Password reset via email
- 🛡️ Role-based access control (Parent vs Child permissions)

### Task Management
- ✅ Create, assign, and track tasks
- 📁 Organize tasks by categories
- 📊 View task history and status

### Points & Rewards System
- 💰 Point wallet for each family member
- 📈 Point history tracking
- 🎁 Wishlist management
- 🏆 Redeem points for rewards

### Budget Management
- 💵 Track family expenses by category
- 📊 Budget analytics and spending charts
- 🎯 Set budget goals for expense categories
- 📅 Plan future events and expenses
- 💾 Emergency fund tracking

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | Database |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |
| **Nodemailer** | Email service |
| **date-fns** | Date manipulation & formatting |
| **fl_chart** | Budget analytics charts |
| **intl 0.19.0** | Internationalization & localization |
## 📁 Project Structure

```
auth-implementation/
│
├── backend/                    # Node.js REST API
│   ├── controllers/            # Request handlers
│   │   ├── AuthController.js
│   │   ├── MemberController.js
│   │   ├── TaskController.js
│   │   └── ...
│   ├── models/                 # Mongoose schemas
│   │   ├── MemberModel.js
│   │   ├── FamilyAccountModel.js
│   │   ├── taskModel.js
│   │   └── ...
│   ├── routes/                 # API routes
│   │   ├── authRoutes.js
│   │   ├── memberRoutes.js
│   │   ├── taskRoutes.js
│   │   └── ...
│   ├── Utils/                  # Utility functions
│   │   ├── appError.js
│   │   └── catchAsync.js
│   ├── scripts/                # Database scripts
│   │   ├── fix-membertype-index.js
│   │   └── init-wallets.js
│   ├── app.js                  # Express app configuration
│   ├── server.js               # Server entry point
│   ├── package.json
│   └── .env                    # Environment variables
│
├── flutter_app/                # Flutter Mobile/Desktop App
│   ├── lib/
│   │   ├── main.dart           # App entry point
│   │   ├── core/
│   │   │   ├── features/       # Feature modules
│   │   │   ├── models/         # Data models
│   │   │   ├── routing/        # App navigation
│   │   │   ├── services/       # API services
│   │   │   ├── styling/        # Themes & styles
│   │   │   └── widgets/        # Reusable widgets
│   │   └── pages/              # App screens
│   │       ├── signup_login.dart
│   │       ├── dashboard_screen.dart
│   │       ├── tasks_screen.dart
│   │       ├── rewards_screen.dart
│   │       └── ...
│   ├── assets/                 # Images, fonts, etc.
│   ├── android/                # Android platform
│   ├── ios/                    # iOS platform
│   ├── web/                    # Web platform
│   ├── windows/                # Windows platform
│   ├── linux/                  # Linux platform
│   ├── macos/                  # macOS platform
│   └── pubspec.yaml            # Flutter dependencies
│
├── React_frontend/             # React Web App (In Development)
│   ├── src/
│   ├── public/
│   └── package.json
│

├── .gitignore
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Flutter** (3.5 or higher) - [Install Guide](https://docs.flutter.dev/get-started/install)
- **MongoDB Atlas** account or local MongoDB - [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Git** - [Download](https://git-scm.com/)

### Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file** (`.env`):
   ```env
   PORT=8000
   DB=mongodb+srv://<username>:<db_password>@cluster.mongodb.net/family_app
   DB_PASSWORD=your_database_password
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=90d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```

4. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # OR Production mode
   npm start
   ```

5. **Server will run on:** `http://localhost:8000`

### Flutter App Setup

1. **Navigate to Flutter folder:**
   ```bash
   cd flutter_app
   ```

2. **Get dependencies:**
   ```bash
   flutter pub get
   ```

3. **Run the app:**
   ```bash
   # Run on connected device/emulator
   flutter run
   
   # Run on specific platform
   flutter run -d chrome      # Web
   flutter run -d windows     # Windows
   flutter run -d android     # Android
   ```

### React App Setup

1. **Navigate to React folder:**
   ```bash
   cd React_frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

---

## ⚡ VS Code Tasks (Quick Commands)

This project includes pre-configured VS Code tasks to run common commands quickly without typing them manually.

### How to Use

**Option 1: Keyboard Shortcut**
- Press `Ctrl + Shift + B` → Select a task from the list

**Option 2: Command Palette**
1. Press `Ctrl + Shift + P`
2. Type "Tasks: Run Task"
3. Select the task you want

### Available Tasks

| Task | Description |
|------|-------------|
| **Backend: Start Dev Server (nodemon)** | Runs backend with auto-reload |
| **Backend: Start Production Server** | Runs backend normally |
| **Backend: Install Dependencies** | `npm install` in backend |
| **Flutter: Run App** | Runs Flutter on default device |
| **Flutter: Run on Chrome (Web)** | Runs Flutter in browser |
| **Flutter: Run on Windows** | Runs Flutter desktop app |
| **Flutter: Get Dependencies** | `flutter pub get` |
| **Flutter: Clean & Rebuild** | Cleans and reinstalls Flutter |
| **React: Start Dev Server** | Starts React app |
| **React: Install Dependencies** | `npm install` for React |
| **🚀 Start All (Backend + Flutter)** | Starts both at once! |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/signup` | Register new family account | Public |
| POST | `/api/auth/login` | User login (multi-family support) | Public |
| GET | `/api/auth/families` | Get families by email | Public |
| POST | `/api/auth/setPassword` | Set/Change password | Protected |
| POST | `/api/auth/forgotPassword` | Request password reset | Parent only |
| PATCH | `/api/auth/resetPassword/:token` | Reset password with token | Parent only |

### Family & Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/familyAccounts` | Get all family accounts |
| GET | `/api/members` | Get all members |
| POST | `/api/members` | Create new member |
| GET | `/api/memberTypes` | Get member types |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create new task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/task-categories` | Get task categories |

### Points & Rewards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/point-wallet` | Get point wallet |
| GET | `/api/point-history` | Get point history |
| GET | `/api/wishlist` | Get wishlist items |
| POST | `/api/wishlist` | Add wishlist item |
| POST | `/api/redeem` | Redeem points for reward |

### Budget Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budget/summary` | Get budget summary |
| POST | `/api/budget/expense` | Add expense |
| GET | `/api/budget/expenses` | Get all expenses |
| GET | `/api/budget/analytics` | Get expense analytics |
| POST | `/api/budget/goals` | Set budget goals |
| GET | `/api/budget/future-events` | Get planned events |
| POST | `/api/budget/future-events` | Create future event |

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` folder:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `8000` |
| `DB` | MongoDB connection string | `mongodb+srv://...` |
| `DB_PASSWORD` | Database password | `yourpassword` |
| `JWT_SECRET` | Secret key for JWT | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT expiration time | `90d` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Email address | `your@email.com` |
| `EMAIL_PASS` | Email app password | `app-password` |

---

## 🗄️ Database Schema

### Main Collections

- **FamilyAccount** - Family account with email and password
- **Member** - Family members (parents, children)
- **MemberType** - Types of members (Parent, Child, etc.)
- **Task** - Tasks assigned to members
- **TaskCategory** - Categories for organizing tasks
- **PointWallet** - Points balance for each member
- **PointHistory** - History of point transactions
- **Wishlist** - Items members want to redeem
- **WishlistCategory** - Categories for wishlist items
- **Redeem** - Record of redeemed rewards
- **Budget** - Budget accounts and settings
- **Expense** - Recorded expenses with categories
- **FutureEvent** - Planned expenses and events

---

## 📸 Screenshots

*Add screenshots of your application here*

| Login Screen | Dashboard | Tasks |
|--------------|-----------|-------|
| ![Login](screenshots/login.png) | ![Dashboard](screenshots/dashboard.png) | ![Tasks](screenshots/tasks.png) |

---

## 👥 Contributors

- **Samia Ossairy** - *Full Stack Developer* - [GitHub](https://github.com/SamiaOssairy)
- **Hab1ba8** - *Budget Module & App Fixes* - [GitHub](https://github.com/Hab1ba8)

---

## 📄 License

This project is part of a graduation project and is for educational purposes.

---

## 🙏 Acknowledgments

- Flutter Team for the amazing framework
- Express.js community
- MongoDB for the database solution

---

 