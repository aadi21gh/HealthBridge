# 🚀 HealthBridge Deployment Guide

This guide walks you through deploying HealthBridge as a live, publicly accessible website.

---

## ⚡ Method 1: Render.com (Recommended — 100% Free & Fastest)

Render allows you to deploy the **entire full-stack application** (React frontend + Express backend API) as a single web service with **zero configuration** thanks to the included `render.yaml` Blueprint.

### Step 1: Push Your Code to GitHub
Ensure all your latest changes are pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure production static serving and deployment blueprint"
git push origin main
```

### Step 2: Ensure MongoDB Atlas Allows Cloud Connections
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Go to **Network Access** under Security.
3. Check if IP Access List contains `0.0.0.0/0` (Allow Access from Anywhere).
   - If not, click **Add IP Address** ➔ Select **Allow Access from Anywhere** ➔ Click **Confirm**.
   *(This allows Render's dynamic cloud IP addresses to connect to your database).*

### Step 3: Deploy on Render via Blueprint
1. Go to [dashboard.render.com](https://dashboard.render.com/) and sign in with GitHub.
2. Click **New +** in the top navigation and select **Blueprint**.
3. Connect your GitHub repository (`HealthBridge`).
4. Render will automatically detect `render.yaml` and configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**: Auto-populates `MONGODB_URI` and generates secure JWT secrets.
5. Click **Apply**.
6. Render will build your Vite frontend, start the backend server, and provide you with a live URL (e.g., `https://healthbridge.onrender.com`).

---

## 🚂 Method 2: Railway.app (Alternative 1-Click PaaS)

1. Go to [railway.app](https://railway.app/) and sign in with GitHub.
2. Click **New Project** ➔ **Deploy from GitHub repo**.
3. Select your `HealthBridge` repository.
4. Click **Add Variables** and set:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: `<your-mongodb-atlas-uri>`
   - `JWT_ACCESS_SECRET`: `<any-random-64-character-string>`
   - `JWT_REFRESH_SECRET`: `<any-random-64-character-string>`
   - `COOKIE_SECRET`: `<any-random-64-character-string>`
5. Under **Settings** ➔ **Networking**, click **Generate Domain**.
6. Railway will build and serve your website at your generated `.up.railway.app` URL.

---

## 🌐 Method 3: Split Deployment (Vercel Frontend + Render Backend)

If you prefer hosting the React frontend on Vercel's global CDN:

### Backend (Render Web Service):
1. In Render, create a **Web Service** pointing to your repo.
2. Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add environment variables (`MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET`, `CLIENT_URL=https://your-vercel-domain.vercel.app`).

### Frontend (Vercel):
1. Go to [vercel.com](https://vercel.com/) and import your `HealthBridge` repository.
2. Framework Preset: **Vite**
3. Root Directory: `client`
4. Environment Variables:
   - `VITE_API_URL`: `https://your-render-backend.onrender.com/api`
5. Click **Deploy**.

---

## 🐳 Method 4: Docker Compose (VPS / Self-Hosted)

If you have a Linux VPS (DigitalOcean, AWS EC2, Hetzner, etc.):

1. Clone the repo on your server:
   ```bash
   git clone https://github.com/aadi21gh/HealthBridge.git
   cd HealthBridge
   ```
2. Build and start with Docker Compose:
   ```bash
   docker-compose up -d --build
   ```
3. Your application is live at `http://your-server-ip`!

---

## 🧪 Verifying Your Live Website

Once your deployment is finished:
1. Visit your live domain (e.g. `https://healthbridge.onrender.com`).
2. Verify the **Landing Page** loads with styles and icons.
3. Test **1-Click Demo Login** on the login page:
   - **Patient Login**: Click `Arjun Kumar (Patient)` to access the longitudinal health timeline.
   - **Doctor Login**: Click `Dr. Rajesh Sharma (Doctor)` to access clinical charts and consent approvals.
4. Visit `/kiosk` to test the multilingual touch and voice intake terminal.
5. Visit `/health` to verify API health status (`{"status":"ok", ...}`).
