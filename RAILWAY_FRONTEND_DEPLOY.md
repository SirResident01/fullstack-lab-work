# 🚀 Railway Frontend Deployment Guide

## 📋 Prerequisites

- Backend deployed and running at: `https://fullstack-lab-work-123.up.railway.app`
- Railway account
- Git repository connected to Railway

## 🔧 Step-by-Step Deployment

### 1. Connect Repository to Railway

1. Go to [Railway Dashboard](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: `fullstack-lab-work`
5. Railway will automatically detect it's a Next.js project

### 2. Configure Build Settings

Railway should auto-detect, but verify these settings:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Root Directory:** (leave empty or set to project root)

### 3. Set Environment Variables

In Railway Dashboard → Your Frontend Service → Variables, add:

**Required Variables:**

| Key | Value | Description |
|-----|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://fullstack-lab-work-123.up.railway.app` | Backend API URL |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | (auto-set by Railway) | Server port |

**How to add:**
1. Go to your Frontend Service in Railway
2. Click **"Variables"** tab
3. Click **"New Variable"**
4. Add each variable above
5. Click **"Save"**

### 4. Configure Backend CORS

⚠️ **IMPORTANT:** Update your backend CORS settings to allow your frontend domain.

After Railway deploys your frontend, you'll get a URL like:
`https://your-frontend-name.up.railway.app`

**Update Backend CORS:**

In your backend service on Railway → Variables, update:

| Key | Value |
|-----|-------|
| `CORS_ORIGINS` | `https://your-frontend-name.up.railway.app,http://localhost:3000` |

Or update `app/main.py` in backend:
```python
cors_origins = [
    "https://your-frontend-name.up.railway.app",
    "http://localhost:3000",  # for local development
]
```

### 5. Deploy

1. Railway will automatically deploy when you push to your main branch
2. Or click **"Deploy"** button in Railway dashboard
3. Wait for build to complete (usually 2-5 minutes)

### 6. Verify Deployment

1. Check Railway logs for successful build
2. Visit your frontend URL (provided by Railway)
3. Test API connection:
   - Open browser console
   - Check for API requests to backend
   - Verify no CORS errors

## 🔍 Troubleshooting

### Build Fails

**Error: "Command failed"**
- Check Node.js version (should be >= 18)
- Verify `package.json` has correct scripts
- Check Railway logs for specific error

**Error: "Module not found"**
- Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

### API Connection Issues

**CORS Errors:**
- Verify `CORS_ORIGINS` in backend includes frontend URL
- Check backend logs for CORS errors
- Ensure `NEXT_PUBLIC_API_URL` is set correctly

**404 on API calls:**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running and accessible
- Test backend URL directly in browser

### Port Issues

**"Application failed to respond"**
- Railway automatically sets `PORT` variable
- Verify `package.json` start script uses `${PORT:-3000}`
- Check Railway logs for port binding errors

## 📝 Environment Variables Reference

### Frontend Variables (Railway)

```bash
NEXT_PUBLIC_API_URL=https://fullstack-lab-work-123.up.railway.app
NODE_ENV=production
PORT=3000  # Auto-set by Railway
```

### Backend Variables (Railway)

```bash
DATABASE_URL=${{ Postgres.DATABASE_URL }}
CORS_ORIGINS=https://your-frontend-name.up.railway.app,http://localhost:3000
PORT=8000  # Auto-set by Railway
```

## ✅ Verification Checklist

- [ ] Frontend builds successfully
- [ ] Frontend URL is accessible
- [ ] Backend URL is accessible
- [ ] `NEXT_PUBLIC_API_URL` is set correctly
- [ ] Backend CORS includes frontend domain
- [ ] API calls work from frontend
- [ ] No console errors in browser
- [ ] Authentication works
- [ ] Data loads correctly

## 🔗 Useful Links

- [Railway Documentation](https://docs.railway.app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Environment Variables in Next.js](https://nextjs.org/docs/basic-features/environment-variables)

