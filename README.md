<div align="center">

<img src="https://img.shields.io/badge/LPU_Touch-College_Management-6366f1?style=for-the-badge&logo=graduation-cap&logoColor=white" />

# 🎓 LPU Touch
### Full-Stack College Management System

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?style=flat-square&logo=jenkins&logoColor=white)](https://jenkins.io)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

*A modern, feature-rich college management portal for students and faculty.*

</div>

---

## 📸 Screenshots

| Login Page | Student Dashboard | Assessments |
|---|---|---|
| Two-panel design with animated feature list | Hero banner + animated stat cards | MCQ & Coding test cards with status badges |

| Coding Test (Monaco Editor) | Teacher Portal | Attendance |
|---|---|---|
| VS Code–style editor with language picker | Create & manage tests + attendance | Donut charts per subject |

---

## ✨ Features

### 👨‍🎓 Student Portal
- **Dashboard** — Live attendance %, subjects enrolled, recent materials, discipline notices
- **Attendance** — Subject-wise breakdown with interactive donut charts
- **Assessments** — View & attempt MCQ and Coding tests assigned by teachers
- **Study Materials** — Download files shared by faculty
- **Discipline Notices** — View any issued reports
- **Timetable** — Weekly class schedule

### 👨‍🏫 Teacher Portal
- **Dashboard** — Overview of students, files, discipline reports
- **Attendance** — Mark present/absent for each class session
- **Assessments** — Create MCQ quizzes and Coding Challenges with:
  - Duration, total marks, availability window (start/end date)
  - Per-question marks, options, correct answer
  - Coding: memory limit, time limit, blacklisted & whitelisted keywords, hidden test cases
- **Students** — View enrolled students
- **Discipline** — Issue disciplinary reports to students
- **Study Files** — Upload and share PDF/docs with students
- **Admin Portal** *(admin teachers only)* — Manage subjects, assign students, create timetable

### 🧑‍💻 Coding Test Editor
- **Monaco Editor** (same engine as VS Code)
- Language picker: **Python 3, JavaScript, C++, Java, C**
- **IntelliSense autocomplete** with whitelisted keyword suggestions
- Real-time **blacklist violation** warnings
- Starter boilerplate per language

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, TailwindCSS v4, Framer Motion, Recharts |
| **Backend** | Node.js 20, Express.js |
| **Database** | MongoDB 7.0, Mongoose |
| **Auth** | JWT (JSON Web Tokens), bcrypt |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) |
| **File Uploads** | Multer |
| **Containerisation** | Docker, Docker Compose, Nginx |
| **CI/CD** | Jenkins (Declarative Pipeline) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 20
- MongoDB running locally
- npm ≥ 9

### 1. Clone the repo

```bash
git clone https://github.com/AyushAgrawal2004/Lpu-Touch.git
cd Lpu-Touch
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env       # fill in your values
npm install
npm run dev                # starts on http://localhost:5555
```

**`.env` variables:**

```env
MONGO_URI=mongodb://127.0.0.1:27017/college_management
PORT=5555
JWT_SECRET=your_super_secret_key_here
```

### 3. Seed the database (sample data)

```bash
cd backend
node seeder.js
```

This creates:

| Role | Email | Password |
|---|---|---|
| Student | alice@lpu.edu | password123 |
| Student | bob@lpu.edu | password123 |
| Student | charlie@lpu.edu | password123 |
| Teacher | jane@lpu.edu | password123 |
| Admin Teacher | admin@lpu.edu | password123 |

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev                # starts on http://localhost:5173
```

---

## 🐳 Running with Docker

All three services (MongoDB, Backend, Frontend/Nginx) are orchestrated via Docker Compose.

```bash
# From the project root
export JWT_SECRET=your_secret_here

docker compose up --build
```

| Service | URL |
|---|---|
| 🌐 Frontend | http://localhost |
| ⚙️ Backend API | http://localhost:5556 |

> **Note:** The frontend is served by Nginx on port 80. The backend API is mapped to port 5556 on the host to avoid conflicts with a local dev server on 5555.

### Docker architecture

```
┌─────────────────────────────────────┐
│         lputouch_net (bridge)        │
│                                     │
│  ┌──────────┐    ┌──────────────┐   │
│  │  mongo   │◄───│   backend    │   │
│  │ :27017   │    │  Node/Express│   │
│  └──────────┘    │    :5555     │   │
│                  └──────┬───────┘   │
│                         │           │
│                  ┌──────▼───────┐   │
│                  │   frontend   │   │
│                  │  Nginx :80   │   │
│                  └──────────────┘   │
└─────────────────────────────────────┘
        ↑                ↑
     (internal)    host: :80, :5556
```

---

## 🔄 CI/CD — Jenkins Pipeline

The `Jenkinsfile` at the project root defines a full declarative pipeline:

```
Checkout → Install (parallel) → Tests (parallel) → Docker Build → Push → Deploy
```

| Stage | Description |
|---|---|
| **Checkout** | Pulls configured branch from Git |
| **Install** | `npm ci` (backend) + `npm install` (frontend) in parallel |
| **Tests** | Backend unit tests + frontend Vite build verification |
| **Docker Build** | Builds `backend` and `frontend` images tagged with `BUILD_NUMBER` |
| **Push** | Pushes both images to DockerHub |
| **Deploy** | SSH into production, pulls new images, runs `docker compose up -d` |

### Jenkins credentials required

| ID | Type | Purpose |
|---|---|---|
| `dockerhub-credentials` | Username/Password | DockerHub login |
| `lputouch-jwt-secret` | Secret Text | JWT secret for production |
| `lputouch-prod-server` | SSH Private Key | Access to production server |

---

## 📁 Project Structure

```
Lpu-Touch/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # auth, student, teacher, test, admin, timetable
│   ├── middleware/       # JWT protect, authorize, multer upload
│   ├── models/          # User, Student, Teacher, Subject, Attendance,
│   │                    # Test, TestAttempt, SharedFile, DisciplineReport, Timetable
│   ├── routes/          # auth, student, teacher, test, admin, timetable
│   ├── seeder.js        # Sample data seed script
│   ├── server.js        # Express app entry point
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Layout, Sidebar
│   │   ├── pages/
│   │   │   ├── student/ # DashboardHome, Attendance, Tests, TakeTest,
│   │   │   │            # Discipline, Files
│   │   │   ├── teacher/ # DashboardHome, Attendance, TestsList, CreateTest,
│   │   │   │            # Discipline, Files, Students, AdminPanel
│   │   │   └── shared/  # TimetableView
│   │   ├── services/    # axios API client + endpoints
│   │   └── store/       # Zustand auth store
│   ├── nginx.conf       # SPA routing + gzip + asset caching
│   └── Dockerfile
│
├── docker-compose.yml   # Full stack orchestration
├── Jenkinsfile          # CI/CD pipeline
└── .gitignore
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/register` | Public |
| GET | `/api/auth/me` | Private |

### Student
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/student/dashboard` | Stats overview |
| GET | `/api/student/attendance` | Subject-wise attendance |
| GET | `/api/student/tests` | All assigned tests with attempt status |
| GET | `/api/student/tests/:id` | Test details + current attempt |
| POST | `/api/student/tests/:id/start` | Begin a test attempt |
| POST | `/api/student/tests/:id/submit` | Submit answers (auto-grades MCQ) |
| GET | `/api/student/discipline` | Discipline notices |
| GET | `/api/student/files` | Shared study materials |

### Teacher
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/teacher/dashboard` | Stats overview |
| GET/POST | `/api/teacher/test` | List / create tests |
| DELETE | `/api/teacher/test/:id` | Delete a test |
| POST | `/api/teacher/attendance` | Mark attendance |
| POST | `/api/teacher/discipline` | Issue discipline report |
| POST | `/api/teacher/files` | Upload study file |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push and open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by **Ayush Agrawal**

⭐ Star this repo if you found it helpful!

</div>
