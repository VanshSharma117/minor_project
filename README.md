# 🎓 EduPilot AI — Campus Mentoring Platform

> **Find a Mentor. Get Guidance. Grow.**  
> A college-internal hybrid AI + faculty mentoring platform connecting students, faculty advisors, and institutional administration.

---

## 🌟 Key Features

- **Role-Aware Portal:** Dedicated workspaces for **Students**, **Faculty Mentors**, and **Campus Administration**.
- **Faculty Directory & Smart Matching:** Search and filter faculty by expertise, department, and mentoring areas with real-time match scoring breakdown.
- **Mentorship Request & Token Workflow:** Tokenized mentorship request process with automated capacity validation and administrative oversight.
- **AI Mentoring Advisor:** Intelligent academic and career advisor providing roadmaps, skill assessment, and seamless faculty escalation.
- **Real-Time Collaboration:** Socket.IO powered messaging, task deliverables management, milestones tracking, and appointment scheduling.
- **Governance & Verification:** Institutional identity validation for students and faculty with audit logging and campus analytics.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/edupilot-ai.git
cd edupilot-ai

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📦 How to Push this Project to GitHub

Follow these simple steps in your terminal:

### Step 1: Create a New GitHub Repository
1. Go to [github.com/new](https://github.com/new).
2. Enter repository name: `edupilot-ai` (choose **Public** or **Private**).
3. Do **not** initialize with README or .gitignore (they already exist in this project).
4. Click **Create repository**.

### Step 2: Push your code
In your terminal in this project directory, run:

```bash
# Add your GitHub repository as remote origin
git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/edupilot-ai.git

# Ensure default branch is main
git branch -M main

# Push the code to GitHub
git push -u origin main
```

---

## 🌐 How to Make this Website Live

Because EduPilot AI is a **full-stack application** (React frontend + Express Node.js backend with WebSockets and API endpoints), static hosts like standard GitHub Pages cannot run the server backend.

Here are the **best free options** to make the full application live on the web:

### Option 1: Render (Recommended — Free & Easiest)
1. Sign in to [Render.com](https://render.com) using your GitHub account.
2. Click **New +** → **Web Service**.
3. Select your GitHub repository (`edupilot-ai`).
4. Set the following settings:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node server.ts` (or `npm start`)
5. Click **Deploy Web Service**.
6. Render gives you a free live URL (e.g., `https://edupilot-ai.onrender.com`).

---

### Option 2: Railway
1. Sign in to [Railway.app](https://railway.app) with your GitHub account.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select `edupilot-ai`.
4. Railway will automatically detect Node.js, run the build, and publish your live app with a public domain.

---

### Option 3: GitHub Pages (Frontend Static Demo)
If you only want to showcase the static frontend UI on `github.io`:
1. In `vite.config.ts`, set `base: '/edupilot-ai/'`.
2. Build the static site:
   ```bash
   npm run build
   ```
3. Deploy the `dist` folder to GitHub Pages using the `gh-pages` package:
   ```bash
   npx gh-pages -d dist
   ```

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
|---|---|---|
| 🎓 **Student** | `student@edupilot.local` | `Student@123` |
| 👨‍🏫 **Faculty** | `faculty@edupilot.local` | `Faculty@123` |
| 🛡 **Admin** | `admin@edupilot.local` | `Admin@123` |

---

## 🛠 Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend:** Node.js, Express, Socket.IO, JWT, bcryptjs
- **Database/Storage:** Campus in-memory state with seed datasets & audit logging
- **AI Engine:** Google Gemini Flash API via `@google/genai`
