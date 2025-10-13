# 🔄 Environment Configuration Guide

## 📁 Environment Files Explained:

### `.env` (Production - Vercel)
- Used by: **Vercel deployment**
- Points to: **Render backend** (https://connectspace-abgg.onrender.com/api)
- OTP: **Not visible** (Render logs don't show console output)

### `.env.local` (Development - Local Testing)
- Used by: **Local npm start**
- Points to: **Local backend** (http://localhost:5000/api)
- OTP: **Visible in backend terminal** ✅

---

## 🎯 How to See OTP Codes:

### ❌ **What WON'T Work:**
Using Vercel frontend → Can't see OTP (Render doesn't show console logs)

### ✅ **What WORKS:**

#### **Option 1: Run Everything Locally** (Recommended for OTP testing)

1. **Start Backend:**
   ```powershell
   cd backend
   npm start
   ```
   Watch this terminal for OTP codes! 👀

2. **Start Frontend:**
   ```powershell
   cd frontend
   npm start
   ```
   Opens at http://localhost:3000

3. **Test OTP:**
   - Fill property form → Step 6
   - Enter phone number
   - Click "Send OTP"
   - **Check backend terminal** for OTP message
   - Copy OTP from console
   - Enter and verify ✅

---

#### **Option 2: Use Render Backend with Real SMS** (Production setup)

If you want to use Vercel frontend with Render backend:

1. **Add Twilio to Render:**
   - Sign up at https://www.twilio.com/ (free $15 credit)
   - In Render dashboard → Your backend service → Environment
   - Add these variables:
     ```
     TWILIO_ACCOUNT_SID=your_account_sid
     TWILIO_AUTH_TOKEN=your_auth_token
     TWILIO_PHONE_NUMBER=+1234567890
     ```
   - Redeploy backend

2. **Test from Vercel:**
   - Use your Vercel deployed app
   - Enter YOUR real phone number
   - Receive REAL SMS with OTP
   - No need to check console! ✅

---

## 🔀 Switching Between Environments:

### **For Local OTP Testing:**
```powershell
# Backend (Terminal 1)
cd backend
npm start

# Frontend (Terminal 2)  
cd frontend
npm start
# Automatically uses .env.local → connects to localhost:5000
```

### **For Production (Vercel):**
```powershell
# Just git push - Vercel uses .env (points to Render)
git add .
git commit -m "your changes"
git push origin main
```

---

## 📊 Environment Priority:

React loads environment files in this order:
1. `.env.local` ← **Highest priority** (local development)
2. `.env` ← Used if .env.local doesn't exist

So:
- `npm start` locally → Uses `.env.local` → localhost:5000
- Vercel deployment → Uses `.env` → Render backend
- **No conflicts!** ✅

---

## 🧪 Quick Test Commands:

### Local OTP Testing:
```powershell
# Terminal 1 (Backend - Watch for OTP here!)
cd backend
npm start

# Terminal 2 (Frontend)
cd frontend
npm start

# Open: http://localhost:3000
```

### Verify Environment:
```powershell
# Check what API URL frontend will use:
cd frontend
echo $env:REACT_APP_API_URL  # Should be empty (will use .env.local)
npm start
# Open browser console → Look for: 🌐 API Configuration - Base URL: http://localhost:5000/api
```

---

## 🎯 Summary:

| Scenario | Frontend | Backend | See OTP? |
|----------|----------|---------|----------|
| **Vercel → Render** | Vercel | Render | ❌ No (needs Twilio) |
| **Local → Local** | localhost:3000 | localhost:5000 | ✅ Yes (console) |
| **Local → Render** | localhost:3000 | Render | ❌ No (needs Twilio) |

**For OTP testing without Twilio:** Must run both frontend & backend locally!

---

## 💡 Pro Tip:

Add `.env.local` to `.gitignore` (already there) so it doesn't get committed. This way:
- ✅ You can test locally with localhost
- ✅ Vercel always uses production Render backend
- ✅ No conflicts between environments!

---

## 🚀 Start Testing Now:

```powershell
# Terminal 1
cd D:\connectspace\backend
npm start

# Terminal 2  
cd D:\connectspace\frontend
npm start

# Open browser: http://localhost:3000
# Add property → Step 6 → Send OTP
# Check Terminal 1 for OTP code! 👀
```

**The `.env.local` file is already created and ready to use!** 🎉
