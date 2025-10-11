# 📸 Cloudinary Setup for ConnectSpace

## Overview
ConnectSpace uses Cloudinary to store property images and videos. This guide will help you set up Cloudinary for the project.

## Step 1: Create Cloudinary Account
1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email

## Step 2: Get Your Credentials
After logging in:
1. Go to **Dashboard**
2. Find these details:
   - **Cloud Name**: `your_cloud_name`
   - **API Key**: `your_api_key`
   - **API Secret**: `your_api_secret`

## Step 3: Create Upload Preset
1. Go to **Settings** → **Upload**
2. Scroll to **Upload Presets**
3. Click **Add upload preset**
4. Configure:
   - **Preset name**: `connectspace_properties`
   - **Signing Mode**: `Unsigned` (for client-side uploads)
   - **Folder**: `properties`
   - **Allowed formats**: `jpg, png, webp, mp4, webm`
5. Click **Save**

## Step 4: Update Frontend Code
In `frontend/src/components/Property/AddPropertyModal.js`:

Replace line ~133 with your cloud name:
```javascript
const cloudinaryUrl = file.type.startsWith('video/')
  ? 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/video/upload'
  : 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload';
```

**Replace `YOUR_CLOUD_NAME` with your actual Cloudinary cloud name**

## Step 5: Environment Variables (Optional for Backend)
If you want to use Cloudinary from backend:

Create/update `backend/.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Storage Structure
- **Images**: Stored in `/properties` folder
- **Documents** (Admin only): Stored in `/documents` folder
- **MongoDB**: Stores only the Cloudinary URLs, not the actual files

## Free Tier Limits
- Storage: 25 GB
- Bandwidth: 25 GB/month
- Transformations: 25,000/month

This is more than enough for initial development!

## Security Note
⚠️ **For production**, switch to **Signed uploads** to prevent unauthorized uploads. This requires backend API implementation.

---

## Quick Reference
- **Dashboard**: [https://cloudinary.com/console](https://cloudinary.com/console)
- **Docs**: [https://cloudinary.com/documentation](https://cloudinary.com/documentation)
- **Support**: [https://support.cloudinary.com](https://support.cloudinary.com)
