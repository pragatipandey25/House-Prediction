<div align="center">

# 🚀 AI-Driven Resume Screening & Candidate Ranking System

### Intelligent Recruitment Powered by AI

Automating Resume Screening, Candidate Evaluation, and Hiring Decisions using MERN Stack and Google Gemini AI

![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose_9-880000?logo=mongoose&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_2.0_Flash-4285F4?logo=googlegemini&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?logo=recharts&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Status](https://img.shields.io/badge/Status-Active-success)

</div>

---

## 📖 Overview

The **AI-Driven Resume Screening & Candidate Ranking System** is a full-stack recruitment platform designed to automate the hiring workflow for HR teams, employers, and administrators.

Instead of manually reviewing hundreds of resumes, employers can:

✅ Create & manage job postings with detailed requirements

✅ Upload resumes in bulk (PDF/DOCX with integrity validation)

✅ Receive AI-generated candidate scores across 11 dimensions

✅ View detailed skill match analysis with missing skill detection

✅ Detect potential bias indicators and ATS optimization suggestions

✅ Rank candidates automatically using a comprehensive scoring engine

✅ Shortlist, reject, and manage candidates

✅ Export shortlisted candidates as CSV reports

✅ Access an analytics dashboard with visual charts

The platform leverages **Google Gemini 2.0 Flash AI** to deeply analyze resumes against job requirements and generate explainable candidate rankings with confidence scoring.

---

## 🎯 Problem Statement

Recruiters often spend hours manually reviewing resumes, leading to:

- Time-consuming hiring processes
- Human bias in screening decisions
- Difficulty handling large applicant volumes
- Inconsistent candidate evaluation criteria
- Lack of explainable hiring recommendations

This project addresses these challenges through AI-powered semantic matching, multi-dimensional scoring, and automated ranking with transparent reasoning.

---

# 🌟 Features

## 👨‍💼 Employer Portal

- Secure Registration & Login
- JWT Authentication with Role-Based Access Control
- Create & Manage Job Posts (edit, close, reopen)
- Define Required Skills, Preferred Skills, Experience & Education
- Upload Multiple Resumes (with magic byte validation)
- View Ranked Candidates with AI Analysis
- Shortlist & Reject Candidates
- Export CSV Reports
- View Detailed Analysis with 11 Scoring Dimensions

---

## 👨‍🎓 Candidate Portal

- Candidate Registration & Secure Login
- Upload & Manage Resumes
- Browse Available Jobs
- Apply to Jobs
- View Application Status (Pending, Shortlisted, Rejected)
- Track AI Match Scores on Applications

---

## 🛡️ Admin Portal

- System Overview Dashboard with Analytics
- View All Users (employers, candidates, admins)
- Manage All Jobs Across System
- View All Applications with AI Scores
- Delete Users
- Bar Chart Visualization (Jobs Per Employer)
- Recent Activity Tracking

---

## 🤖 AI Resume Analysis

Google Gemini 2.0 Flash performs deep multi-dimensional analysis:

| Dimension              | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| 📄 Resume Score        | Overall resume quality, completeness & formatting    |
| 🤖 ATS Score           | Resume optimization for Applicant Tracking Systems   |
| 🛠️ Skill Match         | Technical skills alignment with job requirements     |
| 💬 Communication       | Resume clarity, structure & language quality         |
| 💼 Experience Match    | Relevance of work experience to job responsibilities |
| 🎓 Education Match     | Educational background relevance to the role         |
| 📜 Certification Score | Value & relevance of listed certifications           |
| 👑 Leadership Score    | Evidence of leadership, initiative & mentoring       |
| 🏗️ Project Quality     | Complexity & relevance of listed projects            |
| 🧠 Problem Solving     | Analytical thinking & technical challenges           |
| 🤝 Soft Skills Match   | Teamwork, communication & adaptability evidence      |

Additional AI outputs:

- **Confidence Score** — How confident the AI is in its assessment
- **Missing Skills** — Important skills the candidate lacks for the role
- **Strengths & Weaknesses** — Top 3-5 strengths and 2-3 weaknesses
- **Recommendations** — Actionable suggestions for the candidate
- **Improvement Suggestions** — Resume-specific improvement tips
- **ATS Suggestions** — Optimization tips for better parsing
- **Ranking Reason** — Explainable justification for the ranking
- **Recommendation** — "Highly Recommended", "Recommended", "Moderate", or "Not Recommended"

Built-in retry mechanism with exponential backoff (3 retries) ensures reliability.

---

## 📊 Candidate Ranking Engine

Candidates are ranked based on a weighted composite of all 11 scoring dimensions:

```text
Scoring Guidelines:
  90-100: Exceptional — exceeds requirements significantly
  75-89:  Strong — meets and partially exceeds requirements
  50-74:  Adequate — meets minimum requirements
  25-49:  Below Average — partially meets requirements
  0-24:   Poor — does not meet requirements

Rank #1 🥇 → Best Match (Highest Overall Score)
Rank #2 🥈 → Second Best Match
Rank #3 🥉 → Third Best Match
```

Automatic re-ranking occurs whenever new resumes are uploaded and analyzed.

---

# 🏗️ System Architecture

```text
┌─────────────────────────────────────┐
│         Browser (React SPA)         │
│  ┌─────────┐ ┌──────────┐          │
│  │Employer │ │Candidate │          │
│  │ Portal  │ │  Portal  │  Admin   │
│  └────┬────┘ └────┬─────┘  Portal  │
│       │           │         │       │
└───────┼───────────┼─────────┼───────┘
        │           │         │
        ▼           ▼         ▼
┌─────────────────────────────────────┐
│     REST API (Node.js + Express 5)  │
│  ┌──────────┐ ┌──────────────────┐  │
│  │ Auth     │ │ Security Stack   │  │
│  │ JWT/RBAC │ │ Helmet · CORS    │  │
│  └──────────┘ │ Rate Limiter     │  │
│               │ Sanitizer · HPP  │  │
│               └──────────────────┘  │
└───────┬───────────────────┬─────────┘
        │                   │
        ▼                   ▼
┌──────────────┐  ┌──────────────────┐
│   MongoDB    │  │  Google Gemini   │
│  (Mongoose)  │  │  2.0 Flash API   │
└──────────────┘  └──────────────────┘
```

The frontend never communicates directly with the Gemini API. All AI processing is securely handled by the backend with retry logic and error handling.

---

# ⚙️ Tech Stack

## Frontend

- **React 19** — UI library
- **Vite 8** — Build tool & dev server
- **Tailwind CSS v4** — Utility-first styling
- **React Router v6** — Client-side routing
- **Axios** — HTTP client
- **Context API** — State management
- **Recharts** — Analytics charts & graphs
- **React Toastify** — Notification toasts

## Backend

- **Node.js** — Runtime environment
- **Express 5** — Web framework
- **JWT** — Authentication tokens
- **Bcrypt** — Password hashing
- **Multer** — File upload handling
- **Mammoth** — DOCX text extraction
- **pdfjs-dist** — PDF text extraction
- **express-rate-limit** — Rate limiting
- **express-validator** — Request validation
- **Helmet** — Security headers
- **hpp** — HTTP parameter pollution protection

## Database

- **MongoDB** — NoSQL database
- **Mongoose 9** — ODM with schemas & validation

## AI Layer

- **Google Gemini API**
- **Gemini 2.0 Flash** — Fast, efficient model
- **Prompt Versioning** (v3.0)
- **Retry Logic** — Exponential backoff (3 retries)
- **Response Parsing** — Robust JSON extraction from AI output

## Security

- JWT Authentication with Role-Based Access Control (RBAC)
- Bcrypt Password Hashing (salt rounds: 10)
- Helmet Security Headers
- CORS with whitelisted origins
- Rate Limiting (100 req/15min API, 10 req/15min auth)
- Custom Request Sanitization (NoSQL injection + XSS prevention)
- Express 5 compatible — `Object.defineProperty()` reassignment
- HTTP Parameter Pollution Protection (hpp)
- Body Size Limiting (10kb)
- File Upload Protection:
  - PDF & DOCX only (MIME type + extension check)
  - Magic Byte Validation (file integrity verification)
  - UUID-based File Names (prevents overwrites)
  - File Size Limit (5 MB)
  - Executable File Blocking
- Environment Variable Protection

---

# 📂 Project Structure

```bash
AI-Resume-Screening-System/
│
├── frontend/                          # React + Vite frontend
│   ├── public/                        # Static assets
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   │   ├── FilterBar.jsx
│   │   │   ├── JobCard.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RankingCard.jsx
│   │   │   ├── RankingTable.jsx
│   │   │   ├── ScoreCard.jsx
│   │   │   └── SkeletonLoader.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx     # Analytics with Recharts
│   │   │   ├── AnalysisDetail.jsx
│   │   │   ├── BrowseJobs.jsx
│   │   │   ├── CandidateDashboard.jsx
│   │   │   ├── CreateJob.jsx
│   │   │   ├── EditJob.jsx
│   │   │   ├── EmployerDashboard.jsx
│   │   │   ├── JobAnalysis.jsx
│   │   │   ├── JobDetail.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyApplications.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ResumeUpload.jsx
│   │   │   └── ViewJobs.jsx
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   └── services/
│   │       ├── adminService.js
│   │       ├── analysisService.js
│   │       ├── api.js
│   │       ├── applicationService.js
│   │       ├── authService.js
│   │       ├── dashboardService.js
│   │       ├── jobService.js
│   │       └── resumeService.js
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── package.json
│
├── backend/                           # Node.js + Express API
│   ├── config/
│   │   └── db.js                      # MongoDB connection
│   ├── controllers/
│   │   ├── analysisController.js
│   │   ├── applicationController.js
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── jobController.js
│   │   └── resumeController.js
│   ├── middleware/
│   │   ├── authMiddleware.js          # JWT verification + RBAC
│   │   ├── errorMiddleware.js
│   │   ├── sanitizeMiddleware.js      # NoSQL + XSS prevention
│   │   ├── uploadMiddleware.js        # Multer + magic byte validation
│   │   └── validateRequest.js         # express-validator
│   ├── models/
│   │   ├── Application.js
│   │   ├── Job.js
│   │   ├── Ranking.js
│   │   ├── Resume.js
│   │   └── User.js                    # Roles: employer, candidate, admin
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── analysisRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── jobRoutes.js
│   │   └── resumeRoutes.js
│   ├── services/
│   │   ├── aiService.js              # Gemini 2.0 Flash integration
│   │   ├── rankingService.js
│   │   └── resumeParser.js           # PDF & DOCX parsing
│   ├── utils/
│   │   ├── analyticsEngine.js
│   │   └── rankingEngine.js
│   ├── uploads/                       # Resume file storage
│   ├── server.js                      # Entry point with security stack
│   └── package.json
│
├── screenshots/
├── docs/
├── README.md
└── .env
```

---

# 🔐 Security Features

### Authentication & Authorization

- JWT-based Authentication with configurable expiry
- Role-Based Access Control (RBAC) — `employer`, `candidate`, `admin`
- Password Hashing using Bcrypt (salt rounds: 10)
- Rate-limited auth routes (10 requests per 15 minutes)

### File Upload Protection

- PDF & DOCX Only — MIME type + extension verification
- Magic Byte Validation — Reads file header bytes to verify actual format
- Extension-Actual Content Matching — Prevents disguised executables
- UUID-based File Names — Prevents overwrite attacks
- File Size Limit — 5 MB cap
- Invalid File Cleanup — Automatically removes failed uploads

### API Security

- **Helmet.js** — Secure HTTP headers
- **CORS** — Whitelisted origins only
- **Rate Limiting** — 100 requests per 15 minutes per IP
- **Custom Sanitizer** — Strips MongoDB operators (`$`) and prevents NoSQL injection
- **Express 5 Compatible** — Uses `Object.defineProperty()` to handle read-only request properties
- **hpp** — HTTP Parameter Pollution protection
- **Body Size Limit** — 10kb max for JSON/URL-encoded bodies
- **express-validator** — Input validation on all routes
- Environment Variable Protection — No secrets in source code

---

# 🔄 Workflow

```text
                    ┌──────────────┐
                    │  User Signs  │
                    │     Up       │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ Role Select  │
                    └──┬───────┬───┘
                       │       │
              ┌────────▼──┐ ┌──▼─────────┐
              │  Employer  │ │  Candidate  │
              └─────┬─────┘ └──────┬──────┘
                    │              │
        ┌───────────▼──────┐      │
        │  Create Job Post │      │
        └───────────┬──────┘      │
                    │              │
        ┌───────────▼──────┐      │
        │ Upload Resumes   │      │
        └───────────┬──────┘      │
                    │              │
        ┌───────────▼──────┐      │
        │  AI Analysis     │      │
        │  (Gemini 2.0)    │      │
        └───────────┬──────┘      │
                    │              │
        ┌───────────▼──────┐      │
        │ Skill Matching & │      │
        │  Scoring (11D)   │      │
        └───────────┬──────┘      │
                    │              │
        ┌───────────▼──────┐      │
        │    Ranking       │      │
        └───────────┬──────┘      │
                    │              │
        ┌───────────▼──────┐      │
        │ Shortlist/Reject │◄─────┤ Apply to Jobs
        └───────────┬──────┘      │
                    │              │
        ┌───────────▼──────┐      │
        │ Export CSV      │      │
        │ Report          │      │
        └──────────────────┘      │
                                  │
                    ┌─────────────▼───┐
                    │  Admin Dashboard│
                    │  (Analytics)    │
                    └─────────────────┘
```

---

# 🚀 Installation

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Google Gemini API Key

## Clone Repository

```bash
git clone https://github.com/pragatipandey454/AI-Driven-Resume-Screening-and-Candidate-Ranking-System.git
cd AI-Driven-Resume-Screening-and-Candidate-Ranking-System
```

---

## Backend Setup

```bash
cd backend

npm install

npm run dev
```

The server will start on `http://localhost:5000` (or your configured PORT).

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

The frontend will start on `http://localhost:5173`.

---

## Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret_key

GEMINI_API_KEY=your_google_gemini_api_key
```

---

## Default Admin Account

On first run, the system automatically seeds a default admin account:

| Field        | Value                        |
| ------------ | ---------------------------- |
| **Email**    | `pragatipandey454@gmail.com` |
| **Password** | `Admin@123`                  |
| **Role**     | `admin`                      |

> ⚠️ **Security Note:** Change the default admin password immediately after first login.

---

# 📈 Core Functionalities

### Authentication Module

- User Registration (employer, candidate)
- User Login with JWT token generation
- JWT Protection middleware
- Password Hashing with Bcrypt
- RBAC Authorization (employer, candidate, admin)

### Job Management

- Create Job Posting (title, description, skills, experience, education, salary)
- Edit Job Posting
- View Job Details
- Manage Job Status (active/closed)
- List Employer Jobs
- Browse All Jobs (candidate view)

### Resume Processing

- Resume Upload (employer uploads for candidates, candidate uploads own)
- PDF Text Extraction using pdfjs-dist
- DOCX Text Extraction using mammoth
- File Validation (MIME type, extension, magic bytes)
- Magic Byte Integrity Verification

### AI Scoring (11 Dimensions)

- Gemini 2.0 Flash Integration
- Multi-dimensional Match Score Generation
- Skill Extraction & Gap Analysis
- Score Explanation & Ranking Reason
- Recommendation Generation
- ATS Optimization Suggestions
- Confidence Scoring
- Automatic Retry with Exponential Backoff

### Candidate Management

- View Ranked Candidates
- Shortlist Candidate
- Reject Candidate
- Filter Candidates by Status
- Export CSV Report
- View AI Analysis Detail

### Admin Dashboard

- System Overview with Stats Cards (users, jobs, applications, admins)
- Bar Chart Visualization (Jobs Per Employer using Recharts)
- User Management (view, filter, delete)
- Job Management (view all jobs system-wide)
- Application Management (view with AI scores)
- Recent Activity Tracking

---

# 🔮 Future Enhancements

- Email Notifications (application received, shortlisted, rejected)
- Interview Scheduling with Calendar Integration
- ATS (Applicant Tracking System) Integration API
- Resume Improvement Suggestions with AI feedback
- AI Interview Question Generator based on job requirements
- Multi-Language Resume Support (Hindi, Spanish, French, etc.)
- Advanced Bias Detection & Fairness Metrics
- Bulk Candidate CSV Import
- PDF Report Generation for Hiring Summaries
- WebSocket-based Real-time Analysis Progress

---

# 🤝 Contributing

Contributions are welcome! Here's how you can help:

```bash
# Fork the Repository

# Create Feature Branch
git checkout -b feature/your-feature-name

# Commit Changes
git commit -m "feat: Add your feature description"

# Push to Branch
git push origin feature/your-feature-name
```

Then create a Pull Request with a clear description of your changes.

---

# ⭐ Support

If you found this project useful:

⭐ **Star** the Repository

🍴 **Fork** the Repository

📢 **Share** with Others

---

<div align="center">

### Built with ❤️ by Pragati Pandey

**AI-Driven Resume Screening & Candidate Ranking System**

Empowering Smarter Hiring Decisions with AI 🚀

</div>
