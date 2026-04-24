# AI-HRMS: AI-Powered Human Resource Management System

A next-generation HRMS that leverages artificial intelligence to streamline and automate HR operations for modern workplaces.

## Features

### Core HRMS Functionality
- **Employee Management** - Complete employee data management with search and filtering
- **Department Management** - Organize company structure with department CRUD
- **Attendance Tracking** - Daily check-in/check-out with hours calculation
- **Leave Management** - Request, approve, and reject leave requests
- **Payroll Processing** - Salary computation with allowances, deductions, and tax
- **Performance Reviews** - Track ratings, goals, strengths, and improvements

### AI-Powered Features
- **AI Resume Screening** - Automated candidate evaluation scoring skills match, experience, education, and resume quality
- **Batch Screening** - Screen multiple candidates simultaneously
- **Smart Scoring** - 0-100 scoring with detailed strengths/weaknesses analysis

### Multi-Role Access System
| Role | Access Level |
|------|-------------|
| **Management Admin** | Full system access, company-wide dashboards, all CRUD operations |
| **Senior Manager** | Department oversight, performance reviews, leave approvals |
| **HR Recruiter** | Employee management, recruitment, payroll, AI screening |
| **Employee** | Personal dashboard, attendance, leave requests, own records |

### Personalized Dashboards
- **Admin Dashboard** - Company-wide KPIs, charts, employee growth, payroll summary
- **Manager Dashboard** - Department performance, attendance overview
- **HR Dashboard** - Recruitment pipeline, open positions, applications
- **Employee Dashboard** - Personal attendance, leave status, performance rating, salary

## Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - ORM with full model relationships
- **SQLite** (dev) / **PostgreSQL** (prod) - Database
- **JWT Authentication** - Secure token-based auth
- **Pydantic** - Data validation and serialization

### Frontend
- **React 18** with **TypeScript** - Type-safe UI development
- **Tailwind CSS 4** - Modern utility-first styling
- **Recharts** - Data visualization (charts, graphs)
- **Lucide React** - Beautiful icon system
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 20+
- npm 10+

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hrms.com | admin123 |
| Senior Manager | manager@hrms.com | manager123 |
| HR Recruiter | hr@hrms.com | hr123 |
| Employee | john@hrms.com | emp123 |

## Architecture

```
ai-hrms/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/     # Route handlers
│   │   │   └── deps.py        # Auth dependencies
│   │   ├── core/
│   │   │   ├── config.py      # App settings
│   │   │   ├── database.py    # DB connection
│   │   │   └── security.py    # JWT & hashing
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # AI screening logic
│   │   ├── seed.py            # Demo data seeder
│   │   └── main.py            # FastAPI app entry
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/        # Layout, Sidebar
│   │   ├── context/           # Auth context
│   │   ├── pages/             # All page components
│   │   ├── services/          # API client
│   │   └── types/             # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Scalability

- **Database**: SQLite for development, easily switchable to PostgreSQL for production
- **Backend**: FastAPI's async support handles concurrent requests efficiently
- **Frontend**: Code-split routes, lazy loading ready
- **Auth**: JWT tokens with role-based access control
- **Architecture**: Clean separation of concerns with modular API endpoints
