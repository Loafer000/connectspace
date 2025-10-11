# 🚀 Quick Start: Setting Up Image Upload (5 Steps)

**Total Time:** 10 minutes | **Cost:** FREE

---

## Step 1️⃣: Create Cloudinary Account (2 min)

1. Go to: **https://cloudinary.com/**
2. Click **"Sign Up Free"**
3. Use Google/GitHub (fastest) or email
4. Verify email

✅ **Done!** You should see the Dashboard.

---

## Step 2️⃣: Copy Your Cloud Name (30 sec)

On the Dashboard, look for:

```
┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Cloud name: demo123   ┃  👈 COPY THIS!
┗━━━━━━━━━━━━━━━━━━━━━━━┛
```

📝 Write it down or save it somewhere!

---

## Step 3️⃣: Create Upload Preset (2 min)

1. Click **Settings** ⚙️ (left sidebar)
2. Click **Upload** tab (top)
3. Scroll to **"Upload presets"**
4. Click **"Add upload preset"**
5. Fill in:
   - **Preset name:** `connectspace_properties`
   - **Signing Mode:** `Unsigned` ⚠️ Important!
   - **Folder:** `properties`
6. Click **Save**

✅ **Done!** Preset created.

---

## Step 4️⃣: Update Your Code (1 min)

Open file: `frontend/src/components/Property/AddPropertyModal.js`

**Find this** (around line 137-139):
```javascript
'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/video/upload'
'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload'
```

**Replace with** (use your cloud name from Step 2):
```javascript
'https://api.cloudinary.com/v1_1/demo123/video/upload'
'https://api.cloudinary.com/v1_1/demo123/image/upload'
```

Save the file (Ctrl+S)

---

## Step 5️⃣: Deploy & Test (5 min)

### Push to GitHub:
```bash
cd d:\connectspace
git add .
git commit -m "Add Cloudinary cloud name"
git push
```

### Wait for Vercel:
- Go to https://vercel.com/dashboard
- Wait for green "Ready" ✅ (2-3 min)

### Test Upload:
1. Go to your website
2. Click "List Property"
3. Go through Steps 1 & 2
4. On **Step 3**, upload images
5. See preview! 🎉

---

## ✅ Success!

If you can:
- ✅ Upload images
- ✅ See previews
- ✅ See images on property page

**You're done!** 🚀

---

## 🆘 Need Help?

### Common Issues:

**"Upload failed"**
- Check cloud name (no typos!)
- Preset must be "Unsigned"

**"Invalid preset"**
- Preset name must be exactly: `connectspace_properties`

**Still stuck?**
📖 Read detailed guide: `CLOUDINARY_VISUAL_GUIDE.md`
📋 Use checklist: `CLOUDINARY_CHECKLIST.md`

---

## 📚 What You Get

With this setup, you can now:
- ✅ Upload property images
- ✅ Upload property videos
- ✅ Store unlimited properties
- ✅ Fast image loading (CDN)
- ✅ Free up to 25GB storage

All for **FREE**! 🎉

---

**Setup difficulty:** ⭐⭐☆☆☆ Easy  
**Maintenance:** None (automatic)  
**Future cost:** Free tier is plenty for most apps!
