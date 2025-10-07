# Render Deployment Guide for ConnectSpace Backend

## 🚀 Deployment Steps

### 1. Environment Variables (Required)
Set these in Render Dashboard → Service → Environment:

```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/connectspace?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-here
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Optional - if using email services
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Optional - if using Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional - if using Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

### 2. Service Configuration
- **Runtime**: Node
- **Root Directory**: `backend`
- **Build Command**: `npm ci`
- **Start Command**: `npm start`
- **Auto-Deploy**: Yes (connected to GitHub)

### 3. Database Setup
- Use MongoDB Atlas (recommended)
- Get connection string from MongoDB Atlas
- Whitelist Render's IP addresses (0.0.0.0/0 for simplicity)

### 4. Health Check Endpoint
Backend includes `/api/health` endpoint for Render health checks.

## 📋 Pre-deployment Checklist
- [ ] MongoDB Atlas database created
- [ ] All environment variables configured
- [ ] CORS origins include Vercel frontend URL
- [ ] Health check endpoint working
- [ ] Dependencies up to date (npm audit clean)

## 🔧 Troubleshooting
- Check Render logs for startup errors
- Verify MongoDB connection string
- Ensure all required environment variables are set
- Check CORS configuration for frontend domain