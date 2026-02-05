# Vercel Deployment Guide - Cascade Forum Frontend

This guide covers deploying the Cascade Forum frontend to Vercel using Vercel's default domain.

## 📋 Prerequisites

- GitHub account
- Code pushed to GitHub repository
- Vercel account (free tier works)
- Backend API URL (your EC2 instance or domain)

## 🚀 Step 1: Prepare Your Code

### 1.1 Push Code to GitHub

If you haven't already:

```bash
# Initialize git (if not done)
cd C:\Users\USER\Desktop\draft
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub, then:
git remote add origin https://github.com/Abhigyan-hub/cascade-forum.git
git branch -M main
git push -u origin main
```

### 1.2 Verify Frontend Structure

Make sure:
- `frontend/package.json` exists
- `frontend/vite.config.ts` exists
- `frontend/vercel.json` exists
- `frontend/.env.example` exists

## 🌐 Step 2: Deploy to Vercel

### 2.1 Sign Up / Sign In to Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Log In"**
3. Sign in with GitHub (recommended)

### 2.2 Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository: `Abhigyan-hub/cascade-forum`
3. Vercel will detect it's a Vite project

### 2.3 Configure Project Settings

**Root Directory:**
- Click **"Edit"** next to Root Directory
- Select **"frontend"** (or enter `frontend`)

**Framework Preset:**
- Should auto-detect: **Vite**
- If not, select **"Vite"**

**Build Command:**
- Should be: `npm run build` (auto-filled)
- If not, enter: `npm run build`

**Output Directory:**
- Should be: `dist` (auto-filled)
- If not, enter: `dist`

**Install Command:**
- Should be: `npm install` (auto-filled)

### 2.4 Set Environment Variables

**Before deploying, add environment variables:**

1. Click **"Environment Variables"** section
2. Add the following variables:

   **Variable 1:**
   - **Name**: `VITE_API_URL`
   - **Value**: `http://YOUR_EC2_PUBLIC_IP:8000` (for now, we'll update this)
   - **Environment**: Production, Preview, Development (select all)

   **Variable 2:**
   - **Name**: `VITE_RAZORPAY_KEY_ID`
   - **Value**: `rzp_live_SBii1mLJMvEUzM` (your Razorpay key)
   - **Environment**: Production, Preview, Development (select all)

3. Click **"Add"** for each variable

**⚠️ Important:** 
- For now, use your EC2 public IP: `http://16.171.149.246:8000`
- Once you have a domain with SSL, change to: `https://api.yourdomain.com`

### 2.5 Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (2-5 minutes)
3. You'll see: **"Congratulations! Your project has been deployed"**

### 2.6 Get Your Vercel URL

After deployment:
- Your site will be at: `https://cascade-forum-xxxxx.vercel.app`
- Or: `https://cascade-forum.vercel.app` (if you set a project name)
- **Copy this URL** - you'll need it for backend CORS configuration

## 🔧 Step 3: Update Backend CORS

### 3.1 Update Backend .env on EC2

SSH into your EC2 instance:

```bash
ssh -i your-key.pem ubuntu@16.171.149.246
```

Edit the `.env` file:

```bash
nano /opt/cascade-forum/backend/.env
```

Update the `CORS_ORIGINS` line:

```env
# Replace with your actual Vercel URL
CORS_ORIGINS=https://cascade-forum-xxxxx.vercel.app,https://cascade-forum.vercel.app
```

**If you have multiple URLs, separate with commas:**
```env
CORS_ORIGINS=https://cascade-forum-xxxxx.vercel.app,https://cascade-forum.vercel.app,http://localhost:5173
```

Save and exit (`Ctrl+X`, `Y`, `Enter`)

### 3.2 Restart Backend Service

```bash
sudo systemctl restart cascade-forum
sudo systemctl status cascade-forum
```

## 🧪 Step 4: Test Your Deployment

### 4.1 Test Frontend

1. Visit your Vercel URL: `https://cascade-forum-xxxxx.vercel.app`
2. You should see the login page
3. Try registering a new account
4. Try logging in

### 4.2 Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for any errors
4. Common issues:
   - CORS errors → Backend CORS not configured correctly
   - 404 errors → API URL incorrect
   - Network errors → Backend not accessible

### 4.3 Test API Connection

In browser console, try:

```javascript
fetch('http://16.171.149.246:8000/health')
  .then(r => r.json())
  .then(console.log)
```

Should return: `{status: "healthy"}`

## 🔒 Step 5: Update for HTTPS (Important!)

### 5.1 Current Issue

- Vercel frontend: `https://...` (HTTPS)
- Your backend: `http://16.171.149.246:8000` (HTTP)

**Mixed content warning:** Browsers block HTTP requests from HTTPS pages.

### 5.2 Solutions

**Option A: Use HTTP for now (Development only)**
- Not recommended for production
- Will show security warnings

**Option B: Set up SSL on EC2 (Recommended)**
- Follow **Step 7** in `AWS_DEPLOYMENT.md`
- Get a domain name (free from Freenom, or buy one)
- Set up Let's Encrypt SSL
- Update `VITE_API_URL` to `https://your-domain.com`

**Option C: Use Vercel's API Proxy (Quick Fix)**
- Create `vercel.json` with rewrites (see below)

### 5.3 Quick Fix: Vercel API Proxy

Update `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "http://16.171.149.246:8000/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Then update `frontend/src/lib/api.ts`:

```typescript
// Change from:
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// To:
const API_URL = import.meta.env.VITE_API_URL || ''
// This will use relative URLs, which Vercel will proxy
```

**Then redeploy on Vercel.**

## 📝 Step 6: Environment Variables Reference

### Development (Local)

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
VITE_RAZORPAY_KEY_ID=rzp_live_SBii1mLJMvEUzM
```

### Production (Vercel)

In Vercel dashboard → Settings → Environment Variables:

```env
VITE_API_URL=https://api.yourdomain.com
# OR for now (without domain):
VITE_API_URL=http://16.171.149.246:8000
VITE_RAZORPAY_KEY_ID=rzp_live_SBii1mLJMvEUzM
```

## 🔄 Step 7: Update Deployment

### 7.1 Automatic Deployments

- Every push to `main` branch = automatic deployment
- Vercel creates preview deployments for pull requests

### 7.2 Manual Redeploy

1. Go to Vercel dashboard
2. Click on your project
3. Go to **"Deployments"** tab
4. Click **"Redeploy"** on latest deployment
5. Or push a new commit to trigger deployment

### 7.3 Update Environment Variables

1. Go to Vercel dashboard → Your project
2. **Settings** → **Environment Variables**
3. Edit or add variables
4. **Redeploy** for changes to take effect

## 🐛 Troubleshooting

### Build Fails

**Error: "Cannot find module"**
```bash
# Make sure all dependencies are in package.json
cd frontend
npm install
npm run build
```

**Error: "Route generation failed"**
```bash
# Generate route tree
npx @tanstack/router-cli generate
```

### CORS Errors

**Error: "Access to fetch blocked by CORS policy"**

1. Check backend CORS configuration
2. Verify `CORS_ORIGINS` includes your Vercel URL
3. Restart backend service
4. Check backend logs: `sudo journalctl -u cascade-forum -f`

### API Connection Errors

**Error: "Failed to fetch" or "Network error"**

1. Verify backend is running: `curl http://16.171.149.246:8000/health`
2. Check security group allows port 8000 (for testing)
3. Verify `VITE_API_URL` in Vercel environment variables
4. Check browser console for specific error

### Mixed Content Warnings

**Warning: "Mixed Content"**

- Frontend is HTTPS, backend is HTTP
- Solution: Set up SSL on EC2 (see AWS_DEPLOYMENT.md Step 7)
- Or use Vercel API proxy (see Step 5.3 above)

## 📊 Step 8: Custom Domain (Optional - Later)

When you're ready for a custom domain:

1. **Buy a domain** (Namecheap, GoDaddy, etc.)
2. **In Vercel:**
   - Go to project → Settings → Domains
   - Add your domain
   - Follow DNS configuration instructions
3. **Update environment variables:**
   - `VITE_API_URL`: Change to your backend domain
4. **Update backend CORS:**
   - Add your custom domain to `CORS_ORIGINS`

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Root directory set to `frontend`
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Vercel URL obtained
- [ ] Backend CORS updated
- [ ] Backend service restarted
- [ ] Frontend accessible
- [ ] Login/Register working
- [ ] API calls successful

## 🎯 Quick Reference

**Vercel Dashboard:** https://vercel.com/dashboard

**Your Deployment URL:** `https://cascade-forum-xxxxx.vercel.app`

**Update Environment Variables:**
1. Vercel Dashboard → Your Project → Settings → Environment Variables

**Redeploy:**
1. Push to GitHub (automatic)
2. Or: Vercel Dashboard → Deployments → Redeploy

**View Logs:**
1. Vercel Dashboard → Your Project → Deployments → Click deployment → Logs

---

**Next Steps:**
1. ✅ Deploy frontend to Vercel (you just did this!)
2. ⏭️ Set up SSL on EC2 backend (for HTTPS)
3. ⏭️ Get a custom domain (optional)
4. ⏭️ Update API URL to use domain instead of IP
