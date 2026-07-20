<div align="center">

# 🚀 AI-Driven Resume Screening & Candidate Ranking System

### Intelligent Recruitment Powered by AI

Automating Resume Screening, Candidate Evaluation, and Hiring Decisions using MERN Stack and Google Gemini AI

![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)
![NodeJS](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?logo=mongodb)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Status](https://img.shields.io/badge/Status-Active-success)

</div>

---

## 📖 Overview

The **AI-Driven Resume Screening & Candidate Ranking System** is a full-stack recruitment platform designed to automate the hiring workflow for HR teams.

Instead of manually reviewing hundreds of resumes, employers can:

✅ Create job postings

✅ Upload resumes in bulk

✅ Receive AI-generated candidate scores

✅ View skill match analysis

✅ Detect potential bias indicators

✅ Rank candidates automatically

✅ Export shortlisted candidates

The platform leverages **Google Gemini AI** to analyze resumes against job requirements and generate explainable candidate rankings.

---

## 🎯 Problem Statement

Recruiters often spend hours manually reviewing resumes, leading to:

- Time-consuming hiring processes
- Human bias in screening
- Difficulty handling large applicant volumes
- Inconsistent candidate evaluation

This project addresses these challenges through AI-powered semantic matching and automated ranking.

---

# 🌟 Features

## 👨‍💼 Employer Portal

- Secure Registration & Login
- JWT Authentication
- Create & Manage Job Posts
- Define Required Skills & Experience
- Upload Multiple Resumes
- View Ranked Candidates
- Shortlist Candidates
- Reject Candidates
- Export CSV Reports

---

## 👨‍🎓 Candidate Portal

- Candidate Registration
- Secure Login
- View Applied Jobs
- Track Application Status
- View AI Match Scores

---

## 🤖 AI Resume Analysis

Google Gemini AI performs:

- Resume Parsing
- Skill Extraction
- Missing Skill Identification
- Experience Analysis
- Match Score Generation
- Score Explanation
- Bias Indicator Detection

---

## 📊 Candidate Ranking Engine

Candidates are ranked based on:

- Skill Match Percentage
- Experience Relevance
- Missing Skills Analysis
- Overall Match Score

```text
Rank #1 → Best Match
Rank #2 → Second Best Match
Rank #3 → Third Best Match
```

Automatic re-ranking occurs whenever new resumes are uploaded.

---

# 🏗️ System Architecture

```text
┌────────────────────┐
│ Employer Browser   │
└──────────┬─────────┘
           │ HTTPS
           ▼
┌────────────────────┐
│ React Frontend     │
│ (SPA)              │
└──────────┬─────────┘
           │ REST API
           ▼
┌────────────────────┐
│ Node.js + Express  │
│ Backend API        │
└───────┬───────┬────┘
        │       │
        ▼       ▼

 ┌───────────┐ ┌──────────────┐
 │ MongoDB   │ │ Gemini API   │
 └───────────┘ └──────────────┘
```

The frontend never directly communicates with Gemini API. All AI processing is securely handled by the backend.

---

# ⚙️ Tech Stack

## Frontend

- React.js
- Tailwind CSS
- React Router v6
- Axios
- Context API

## Backend

- Node.js
- Express.js
- JWT Authentication
- Multer

## Database

- MongoDB
- Mongoose ODM

## AI Layer

- Google Gemini API
- Gemini 1.5 Flash

## Security

- JWT Authentication
- Bcrypt Password Hashing
- Helmet.js
- Role-Based Access Control (RBAC)
- File Validation & Sanitization

---

# 📂 Project Structure

```bash
AI-Resume-Screening-System/
│
├── client/
│   ├── src/
│   ├── pages/
│   ├── components/
│   ├── context/
│   └── layouts/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── models/
│   └── uploads/
│
├── screenshots/
├── docs/
├── README.md
└── .env
```

---

# 🔐 Security Features

### Authentication

- JWT-based Authentication
- Role-based Authorization
- Password Hashing using Bcrypt

### File Upload Protection

- PDF & DOCX Only
- Magic Byte Validation
- UUID-based File Names
- File Size Limit (5 MB)
- Executable File Blocking

### API Security

- Protected Routes
- HTTPS Communication
- Helmet Security Headers
- Environment Variable Protection

---

# 🔄 Workflow

```text
Employer Creates Job
          │
          ▼
Upload Candidate Resumes
          │
          ▼
Resume Text Extraction
          │
          ▼
Gemini AI Analysis
          │
          ▼
Skill Matching & Scoring
          │
          ▼
Candidate Ranking
          │
          ▼
Shortlist / Reject
          │
          ▼
Export CSV Report
```

---

# 📸 Screenshots

## Login Page

![Login](screenshots/login.png)

## Employer Dashboard

![Dashboard](screenshots/dashboard.png)

## Candidate Ranking

![Ranking](screenshots/ranking.png)

## Resume Analysis

![Analysis](screenshots/analysis.png)

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/Harshal10k/AI-Driven-Resume-Screening-and-Candidate-Ranking-System.git
```

---

## Backend Setup

```bash
cd server

npm install

npm run dev
```

---

## Frontend Setup

```bash
cd client

npm install

npm run dev
```

---

## Environment Variables

Create a `.env` file inside the server folder:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_google_gemini_api_key
```

---

# 📈 Core Functionalities

### Authentication Module

- User Registration
- User Login
- JWT Protection
- Password Hashing
- RBAC Authorization

### Job Management

- Create Job Posting
- View Job Details
- Manage Job Status
- List Employer Jobs

### Resume Processing

- Bulk Resume Upload
- PDF Parsing
- DOCX Parsing
- File Validation

### AI Scoring

- Gemini Integration
- Match Score Generation
- Skill Extraction
- Score Explanation
- Bias Detection

### Candidate Management

- Shortlist Candidate
- Reject Candidate
- Filter Candidates
- Export CSV

---

# 🔮 Future Enhancements

- Email Notifications
- Interview Scheduling
- ATS Integration
- Resume Improvement Suggestions
- AI Interview Question Generator
- Analytics Dashboard
- Multi-Language Resume Support
- Advanced Bias Detection

---

# 👨‍💻 Team

### PGCP-AC-011

**Centre for Development of Advanced Computing (C-DAC), Bangalore**

**PG Diploma in Advanced Computing (PG-DAC)**

**Batch: February 2026**

**Project:** AI-Driven Resume Screening & Candidate Ranking System

---

# 🤝 Contributing

Contributions are welcome!

```bash
# Fork Repository

# Create Branch
git checkout -b feature-name

# Commit Changes
git commit -m "Added New Feature"

# Push Changes
git push origin feature-name
```

Create a Pull Request 🚀

---

# ⭐ Support

If you found this project useful:

⭐ Star the Repository

🍴 Fork the Repository

📢 Share with Others

---

<div align="center">

### Made by Team PGCP-AC-011

AI-Driven Resume Screening & Candidate Ranking System

</div>
