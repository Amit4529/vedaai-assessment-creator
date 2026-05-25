# 🚀 VedaAI Assessment Creator - Deployment Guide

This guide explains how to deploy the **VedaAI Assessment Creator** to production using **Render** (for the backend and AI queue processor) and **Vercel** (for the Next.js frontend).

---

## 📋 Table of Contents
1. [Prerequisites & Collected Credentials](#1-prerequisites--collected-credentials)
2. [Step 1: Push Code to GitHub](#step-1-push-code-to-github)
3. [Step 2: Deploy Backend to Render](#step-2-deploy-backend-to-render)
4. [Step 3: Deploy Frontend to Vercel](#step-3-deploy-frontend-to-vercel)
5. [Step 4: Update CORS & Connect Services](#step-4-update-cors--connect-services)

---

## 1. Prerequisites & Collected Credentials

We have already configured the codebase to support production deployment seamlessly. The credentials you collected are set up correctly:

*   **Google Gemini API Key:** `AIzaSyDXyS5IBuJULRkI2xSD2pUv6sbCNdK7bac` (Configured)
*   **Redis Cloud:**
    *   **Host:** `slope-bat-halcyon-32640.db.redis.io`
    *   **Port:** `13736`
    *   **Password:** `dRGxtIAB4OPTVDfRsK4m7bBgP6qwPdLE`
*   **MongoDB Atlas URI:** `mongodb+srv://itsamit310_db_user:<db_password>@cluster0.nz2cv6d.mongodb.net/?appName=Cluster0`
    > ⚠️ **IMPORTANT**: You must replace `<db_password>` with the actual database user password you set in your MongoDB Atlas Dashboard (under **Database Access**).

---

## Step 1: Push Code to GitHub

Since your system terminal did not have `git` configured in the environment path, you can use VS Code's built-in Git GUI or run these standard commands in your git-enabled terminal:

1.  **Initialize Git & Add Files:**
    ```bash
    git init
    git add .
    git commit -m "Initialize project for production deployment"
    ```
2.  **Rename branch & Add Remote:**
    ```bash
    git branch -M main
    git remote add origin https://github.com/Amit4529/vedaai-assessment-creator.git
    ```
3.  **Push to GitHub:**
    ```bash
    git push -u origin main
    ```

---

## Step 2: Deploy Backend to Render

[Render](https://render.com/) is perfect for Node/TypeScript web services. It will host the Express backend, run the background BullMQ queue processor, and handle WebSockets automatically.

1.  Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2.  Connect your GitHub account and select the `vedaai-assessment-creator` repository.
3.  Configure the service with these settings:
    *   **Name:** `vedaai-backend`
    *   **Region:** Select the region closest to you
    *   **Root Directory:** `backend`
    *   **Language:** `Node`
    *   **Build Command:** `npm install && npm run build`
    *   **Start Command:** `npm start`
    *   **Instance Type:** Free (or Starter if you expect heavy queue jobs)
4.  Click **Advanced** -> **Add Environment Variable** and enter:
    | Key | Value | Notes |
    | :--- | :--- | :--- |
    | `NODE_ENV` | `production` | Enables production mode optimizations |
    | `PORT` | `10000` | Render standard port (managed automatically) |
    | `MONGODB_URI` | `mongodb+srv://itsamit310_db_user:<YOUR_ACTUAL_PASSWORD>@cluster0.nz2cv6d.mongodb.net/?appName=Cluster0` | Replace `<YOUR_ACTUAL_PASSWORD>`! |
    | `REDIS_HOST` | `slope-bat-halcyon-32640.db.redis.io` | |
    | `REDIS_PORT` | `13736` | |
    | `REDIS_PASSWORD` | `dRGxtIAB4OPTVDfRsK4m7bBgP6qwPdLE` | |
    | `REDIS_TLS` | `false` | Port `13736` uses standard non-TLS connection |
    | `GEMINI_API_KEY` | `AIzaSyDXyS5IBuJULRkI2xSD2pUv6sbCNdK7bac` | Google AI Studio Key |
    | `FRONTEND_URL` | `https://vedaai-assessment-creator.vercel.app` | Enter your Vercel frontend URL once deployed |
5.  Click **Create Web Service**.

---

## Step 3: Deploy Frontend to Vercel

[Vercel](https://vercel.com/) is the premium hosting choice for Next.js applications.

1.  Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** -> **Project**.
2.  Import the `vedaai-assessment-creator` repository.
3.  Configure the project settings:
    *   **Framework Preset:** `Next.js`
    *   **Root Directory:** `frontend`
4.  Open the **Environment Variables** section and add:
    *   `NEXT_PUBLIC_API_URL` = `https://vedaai-backend.onrender.com` (Replace this with the **actual live Render URL** generated in Step 2)
    *   `NEXT_PUBLIC_WS_URL` = `wss://vedaai-backend.onrender.com/ws` (Use `wss://` for secure WebSockets in production, replacing the domain with your Render domain)
5.  Click **Deploy**.

---

## Step 4: Update CORS & Connect Services

Once both deployments are successful:
1.  Verify the URL of your Next.js application on Vercel (e.g., `https://vedaai-assessment-creator.vercel.app`).
2.  If the URL differs, go to your **Render Web Service Dashboard** -> **Environment** page and update `FRONTEND_URL` to match your exact Vercel address. This ensures CORS allows safe API requests and WebSockets to connect perfectly.
3.  Save the environment variables and let Render redeploy automatically.

🎉 **Congratulations! Your AI Assessment Creator is fully live in production!**
