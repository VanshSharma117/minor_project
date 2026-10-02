# EduPilot AI — Production Deployment Guide

EduPilot AI is a full-stack campus mentorship platform built with:
- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Socket.IO Client
- **Backend:** Node.js, Express, Socket.IO Server, JWT Authentication, Google Gemini AI
- **Architecture:** Client-Server decoupled architecture supporting separate frontend (e.g., InfinityFree / Netlify / Vercel) and backend (e.g., Render / Railway / AWS).

---

## Architecture Overview

```
[ Frontend: InfinityFree / Vercel / Static Host ]
                 │
                 │ HTTPS REST API (${VITE_API_URL}/api)
                 │ WSS WebSockets (${VITE_SOCKET_URL})
                 ▼
[ Backend: Render / Cloud Node.js Server (Express + Socket.IO) ]
                 │
                 ├── In-Memory Campus Database (Users, Mentorships, Logs)
                 └── Google Gemini AI API (@google/genai)
```

> **Important Database Notice:**
> The current version utilizes an in-memory campus database seeded with initial students, faculty, and departments.
> Data will reset to its seed state whenever the backend restarts. This is lightweight, zero-configuration, and ideal for college project demonstrations, evaluations, and viva presentations. A persistent database (e.g., PostgreSQL or MongoDB) can be integrated in subsequent phases.

---

## 1. Running Locally for Development

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Local Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=edupilot_campus_secret_key_2026
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 3: Start Local Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Building the Project

To compile and bundle the React frontend into production-ready static assets:

```bash
npm run build
```
This generates the optimized production files inside the `dist/` directory, including `dist/.htaccess` for Apache server routing.

---

## 3. Deploying Backend to Render.com

Render provides free Node.js hosting with native WebSocket and Express support.

### Step 1: Create a New Web Service
1. Log in to [Render](https://render.com).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository containing the EduPilot AI code.

### Step 2: Configure Service Settings
- **Name:** `edupilot-backend` (or your choice)
- **Region:** Closest to your target users (e.g., Singapore, Frankfurt, Oregon)
- **Branch:** `main`
- **Root Directory:** *(leave blank / root)*
- **Runtime:** `Node`
- **Build Command:**
  ```bash
  npm install && npm run build
  ```
- **Start Command:**
  ```bash
  npm start
  ```
  *(Runs `tsx server.ts` configured in `package.json`).*

### Step 3: Set Environment Variables on Render
Under **Environment Variables** in Render, add:

| Key | Example Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production mode |
| `PORT` | `3000` | Server listening port |
| `JWT_SECRET` | `super-secret-random-32-char-string` | Signs JWT session tokens |
| `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API Key |
| `FRONTEND_URL` | `https://your-domain.infinityfreeapp.com` | Allowed CORS origin for frontend |

Click **Create Web Service**. Render will deploy the backend and give you a URL like:
```
https://edupilot-backend.onrender.com
```

### Step 4: Verify Backend Health
Visit your backend health endpoint in a browser:
```
https://edupilot-backend.onrender.com/api/health
```
It should return:
```json
{"status":"healthy","app":"EduPilot AI","campus":"Internal College Mentoring System"}
```

---

## 4. Deploying Frontend to InfinityFree (or Apache Shared Hosting)

InfinityFree hosts static HTML, CSS, JavaScript, and Apache `.htaccess` files.

### Step 1: Configure Frontend URLs Before Building
In your local environment, create or update `.env` (or set environment variables in your terminal) with your live backend URL from Render:

```env
VITE_API_URL=https://edupilot-backend.onrender.com
VITE_SOCKET_URL=https://edupilot-backend.onrender.com
```

### Step 2: Build the Production Bundle
Run:
```bash
npm run build
```
Vite will bake the `VITE_API_URL` and `VITE_SOCKET_URL` into the compiled JavaScript inside `dist/`.

### Step 3: Upload to InfinityFree
1. Log in to your **InfinityFree Control Panel**.
2. Open the **Online File Manager** (or connect via FTP using FileZilla).
3. Navigate into your website's **`htdocs/`** directory.
4. Upload all files and folders located **inside the `dist/` folder** directly into `htdocs/`:
   - `htdocs/index.html`
   - `htdocs/.htaccess` *(ensures React Router deep links work on Apache)*
   - `htdocs/assets/` *(contains JavaScript and CSS bundles)*
   - `htdocs/404.html`

> **Note:** The included `.htaccess` file contains:
> ```apache
> RewriteEngine On
> RewriteCond %{REQUEST_FILENAME} !-f
> RewriteCond %{REQUEST_FILENAME} !-d
> RewriteRule . /index.html [L]
> ```
> This prevents 404 errors when visitors open or refresh URLs like `/login`, `/student/dashboard`, or `/admin/users`.

---

## 5. Testing the Full-Stack Deployment

1. Visit your InfinityFree frontend domain (e.g. `https://edupilot.infinityfreeapp.com`).
2. Log in using pre-configured campus demo accounts:
   - **Student:** `student@edupilot.local` / `Student@123`
   - **Faculty:** `faculty@edupilot.local` / `Faculty@123`
   - **Admin:** `admin@edupilot.local` / `Admin@123`
3. Test Real-time Chat, AI Mentor Advisor, and Admin User Governance.

---

## 6. Summary of Key Files Configured

- `vite.config.ts`: Configured with root domain base path `base: '/'`.
- `public/.htaccess`: Configured for Apache SPA URL rewriting.
- `server.ts`: Express with CORS for `FRONTEND_URL`, health check, and production static fallback.
- `server/socket.ts`: Socket.IO with CORS origin validation and real-time room dispatch.
- `src/services/api.ts`: API service with configurable `VITE_API_URL`.
- `src/services/socket.ts`: Real-time socket client with configurable `VITE_SOCKET_URL`.
- `package.json`: Production start script `"start": "tsx server.ts"` with `tsx` in `dependencies`.
- `.env.example`: Standardized environment variable template.
