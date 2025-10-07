# Vercel Deployment Guide for ConnectSpace Frontend

## 🚀 Deployment Steps

### 1. Environment Variables (Required)
Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

### 2. Build Configuration
- **Framework Preset**: Create React App
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm ci`

### 3. Domain Configuration
- **Production Domain**: Will be auto-generated (connectspace-xxx.vercel.app)
- **Custom Domain**: Add your domain in Vercel dashboard if needed

### 4. Automatic Deployments
- Connected to GitHub repository
- Auto-deploys on push to main branch
- Preview deployments for pull requests

## 📋 Pre-deployment Checklist
- [ ] Environment variables configured
- [ ] API endpoints point to production backend
- [ ] Build process tested locally
- [ ] CORS configured in backend for Vercel domain

## 🔧 Troubleshooting
- Check build logs for any dependency issues
- Ensure all environment variables are set
- Verify API URL format (include /api if needed)
- Check network requests in browser dev tools