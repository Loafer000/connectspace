# ✅ Cloudinary Setup Checklist

Print this and check off each step as you complete it!

---

## 🔵 STEP 1: Create Cloudinary Account (2 mins)

- [ ] Go to https://cloudinary.com/
- [ ] Click "Sign Up Free"
- [ ] Choose signup method:
  - [ ] Email (fill form)
  - [ ] Google account (fastest!)
  - [ ] GitHub account
- [ ] Verify email (check inbox)
- [ ] Log in to Cloudinary Dashboard

**✅ Done when**: You can see the Cloudinary Dashboard

---

## 🔵 STEP 2: Get Your Cloud Name (1 min)

- [ ] You're on the Dashboard page
- [ ] Look for "Account Details" box
- [ ] Find line that says "Cloud name: _______"
- [ ] Copy your cloud name
- [ ] Write it here: `_________________________`

**Example cloud names**: 
- `democloud123`
- `mycompany`
- `john-doe-projects`

**✅ Done when**: You've written down your cloud name above

---

## 🔵 STEP 3: Create Upload Preset (3 mins)

- [ ] Click **Settings** (gear icon) in left sidebar
- [ ] Click **Upload** tab at top
- [ ] Scroll down to "Upload presets" section
- [ ] Click **"Add upload preset"** (blue button)
- [ ] Fill in the form:

### Form Fields:
```
┌────────────────────────────────────────┐
│ Preset name: connectspace_properties   │ ← Type exactly this!
│                                        │
│ Signing Mode: Unsigned                 │ ← Important! Must be "Unsigned"
│                                        │
│ Folder: properties                     │ ← Optional but recommended
│                                        │
│ Allowed formats:                       │
│ jpg, png, webp, jpeg, mp4, webm       │ ← For images and videos
└────────────────────────────────────────┘
```

- [ ] Scroll to bottom
- [ ] Click **"Save"** button
- [ ] See success message

**✅ Done when**: You see "Upload preset created successfully"

---

## 🔵 STEP 4: Update Your Code (2 mins)

### Open File:
```
d:\connectspace\frontend\src\components\Property\AddPropertyModal.js
```

### Find Lines 137-139 (Search for "YOUR_CLOUD_NAME"):

**Before:**
```javascript
const cloudinaryUrl = file.type.startsWith('video/')
  ? 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/video/upload'
  : 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload';
```

**After** (replace YOUR_CLOUD_NAME with the cloud name you wrote in Step 2):
```javascript
const cloudinaryUrl = file.type.startsWith('video/')
  ? 'https://api.cloudinary.com/v1_1/YOUR_ACTUAL_CLOUD_NAME_HERE/video/upload'
  : 'https://api.cloudinary.com/v1_1/YOUR_ACTUAL_CLOUD_NAME_HERE/image/upload';
```

**Example** (if your cloud name is "democloud123"):
```javascript
const cloudinaryUrl = file.type.startsWith('video/')
  ? 'https://api.cloudinary.com/v1_1/democloud123/video/upload'
  : 'https://api.cloudinary.com/v1_1/democloud123/image/upload';
```

### Checklist:
- [ ] Found lines 137-139 in AddPropertyModal.js
- [ ] Replaced BOTH occurrences of YOUR_CLOUD_NAME
- [ ] Saved file (Ctrl+S)

**✅ Done when**: File is saved with your cloud name

---

## 🔵 STEP 5: Commit & Push (1 min)

Open PowerShell/Terminal in `d:\connectspace`:

```powershell
git add .
git commit -m "Config: Add Cloudinary cloud name"
git push
```

- [ ] Ran git add
- [ ] Ran git commit
- [ ] Ran git push
- [ ] No errors shown

**✅ Done when**: Changes pushed to GitHub successfully

---

## 🔵 STEP 6: Wait for Deployment (2-3 mins)

- [ ] Go to Vercel Dashboard: https://vercel.com/dashboard
- [ ] Find your project
- [ ] Wait for green "Ready" status
- [ ] Click "Visit" to see deployed site

**✅ Done when**: Vercel shows "Ready" status

---

## 🔵 STEP 7: Test Upload! (2 mins)

On your website:

- [ ] Click "List Property" (or owner dashboard)
- [ ] Fill out Step 1 (Basic Info)
- [ ] Fill out Step 2 (Specifications)
- [ ] Go to Step 3 (Images & Videos)
- [ ] Click "Choose Files"
- [ ] Select 1-2 test images
- [ ] See upload progress
- [ ] See image previews appear
- [ ] Continue to Step 4 & 5
- [ ] Submit property

**✅ Done when**: You see image previews in Step 3

---

## 🔵 STEP 8: Verify in Cloudinary (1 min)

Go back to Cloudinary:

- [ ] Click **"Media Library"** in left sidebar
- [ ] Look for "properties" folder
- [ ] Click on folder
- [ ] See your uploaded images!

**✅ Done when**: Images are visible in Cloudinary Media Library

---

## 🎉 COMPLETE!

All steps checked? Congratulations! 🚀

Your image upload is now fully working with Cloudinary!

---

## 📝 My Configuration (Save This!)

```
Cloud Name:     _________________________
Upload Preset:  connectspace_properties
Folder:         properties
Setup Date:     _________________________
```

---

## 🆘 If Something Goes Wrong

### Error: "Upload failed"
- [ ] Double-check cloud name is correct (no typos!)
- [ ] Verify preset name is exactly: `connectspace_properties`
- [ ] Make sure preset is "Unsigned"

### Error: "Invalid preset"
- [ ] Go to Cloudinary Settings → Upload
- [ ] Find your preset
- [ ] Edit it and verify "Signing Mode = Unsigned"
- [ ] Save again

### Images not uploading
- [ ] Open browser DevTools (F12)
- [ ] Go to Console tab
- [ ] Look for red error messages
- [ ] Check Network tab to see if request is being sent

### Need detailed help?
📖 See: `CLOUDINARY_VISUAL_GUIDE.md` for step-by-step screenshots descriptions

---

**Total Time**: ~10 minutes  
**Difficulty**: Easy ⭐⭐☆☆☆  
**Cost**: FREE
