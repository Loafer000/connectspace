# Document Verification System

## Overview
The verification documents are linked to properties through the Property model in MongoDB. Each property has an `owner` field that references the User who created it.

---

## Document Ownership Structure

```
User (Landlord)
    ↓ creates
Property
    ↓ contains
Documents[] (verification docs)
```

### In MongoDB:

```javascript
Property {
  _id: "property123",
  title: "Modern Office Space",
  owner: "user456",  // ← Links to User._id (Landlord)
  documents: [
    {
      name: "ownership_deed.pdf",
      url: "https://cloudinary.com/...",
      publicId: "properties/documents/xyz",
      type: "ownership-proof"
    },
    {
      name: "noc_certificate.pdf",
      url: "https://cloudinary.com/...",
      publicId: "properties/documents/abc",
      type: "noc"
    }
  ],
  createdAt: "2025-10-11T...",
  updatedAt: "2025-10-11T..."
}
```

### In Cloudinary:

Documents are stored in: `properties/documents/{publicId}`

Example structure:
```
connectspace_cloud/
  └── properties/
      ├── documents/               ← Verification documents
      │   ├── property123_deed.pdf
      │   ├── property123_noc.pdf
      │   └── property456_tax.pdf
      └── images/                  ← Property images
          ├── property123_front.jpg
          └── property123_living.jpg
```

---

## How to Identify Document Ownership

### 1. **Property-Document Link:**
Each document belongs to a specific property:
- When admin views Property ID `property123`
- They see documents array belonging to that property
- `property123` belongs to User ID `user456`

### 2. **Query to Get All Documents by Landlord:**

```javascript
// Backend API
const properties = await Property.find({ owner: userId })
  .populate('owner', 'firstName lastName email phone');

// Returns all properties with documents created by that user
properties.forEach(property => {
  console.log(`Property: ${property.title}`);
  console.log(`Owner: ${property.owner.firstName} ${property.owner.lastName}`);
  console.log(`Documents:`, property.documents);
});
```

### 3. **Admin Dashboard Example:**

```
┌────────────────────────────────────────────────────────┐
│ Property: Modern Office in Andheri                     │
│ Owner: John Doe (john@example.com)                     │
│ Phone: +91 9876543210                                  │
├────────────────────────────────────────────────────────┤
│ Verification Documents:                                 │
│   ✓ Ownership Deed (2.3 MB) - View                    │
│   ✓ NOC Certificate (1.1 MB) - View                   │
│   ✓ Property Tax Receipt (890 KB) - View              │
├────────────────────────────────────────────────────────┤
│ Status: Pending Verification                           │
│ Actions: [Approve] [Reject] [Request More Docs]       │
└────────────────────────────────────────────────────────┘
```

---

## Document Access Control

### Current Implementation:

**Frontend:**
- Documents section hidden from property listing pages
- Only visible during property creation
- No public display of document URLs

**Backend:**
- Documents stored in MongoDB linked to property
- Property has `owner` field linking to User
- `isAdmin` middleware created for admin-only routes

### To Implement (Future):

**1. Admin-Only Document Routes:**

```javascript
// backend/routes/property.js
const { authenticate, isAdmin } = require('../middleware/auth');

// Get documents for a specific property (admin only)
router.get(
  '/properties/:id/documents',
  authenticate,
  isAdmin,
  async (req, res) => {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'firstName lastName email phone')
      .select('documents owner title');
    
    res.json({
      success: true,
      data: {
        property: property.title,
        owner: property.owner,
        documents: property.documents
      }
    });
  }
);

// Get all pending verifications (admin only)
router.get(
  '/admin/pending-verifications',
  authenticate,
  isAdmin,
  async (req, res) => {
    const properties = await Property.find({
      'documents.0': { $exists: true }, // Has at least 1 document
      verificationStatus: 'pending'
    }).populate('owner', 'firstName lastName email phone');
    
    res.json({
      success: true,
      data: properties
    });
  }
);
```

**2. Admin Dashboard (Frontend):**

Create `frontend/src/pages/AdminDashboard.js`:
```jsx
const AdminDashboard = () => {
  const [pendingProperties, setPendingProperties] = useState([]);
  
  useEffect(() => {
    // Fetch pending verifications
    fetch('/api/admin/pending-verifications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => setPendingProperties(data.data));
  }, []);
  
  return (
    <div>
      <h1>Document Verification Queue</h1>
      {pendingProperties.map(property => (
        <PropertyVerificationCard 
          key={property._id}
          property={property}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ))}
    </div>
  );
};
```

---

## Security Best Practices

### 1. **Cloudinary Signed URLs (Future Enhancement):**
```javascript
// Generate temporary signed URL (expires in 1 hour)
const cloudinary = require('cloudinary').v2;

const getSignedDocumentUrl = (publicId) => {
  return cloudinary.url(publicId, {
    sign_url: true,
    type: 'authenticated',
    expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  });
};
```

### 2. **Document Watermarking:**
```javascript
// Add admin watermark to documents
const watermarkedUrl = cloudinary.url(publicId, {
  overlay: {
    text: 'ADMIN COPY - CONFIDENTIAL',
    font_family: 'Arial',
    font_size: 40,
    gravity: 'center'
  }
});
```

### 3. **Audit Logging:**
```javascript
// Log who accessed documents
const DocumentAccessLog = new Schema({
  propertyId: ObjectId,
  documentId: ObjectId,
  accessedBy: ObjectId, // Admin user
  accessedAt: Date,
  ipAddress: String,
  action: String // 'viewed', 'downloaded', 'approved'
});
```

---

## Environment Variables Needed

Add to `.env`:
```bash
# Admin Configuration
ADMIN_EMAIL=admin@connectspace.com  # Fallback admin email
ADMIN_ROLE=admin                     # Role name for admin users

# Cloudinary (already configured)
CLOUDINARY_CLOUD_NAME=dljvt4fkw
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Summary

**Current State:**
✅ Documents upload to Cloudinary
✅ Documents linked to properties in MongoDB
✅ Properties linked to owners (landlords)
✅ `isAdmin` middleware created
✅ Frontend hides documents from public

**To Complete:**
⚠️ Add `role` field to User model
⚠️ Create admin dashboard
⚠️ Add admin-only document routes
⚠️ Implement document approval workflow

**Document Ownership Chain:**
```
User ID → Property ID → Documents[]
```

When admin reviews documents, they see:
1. Property details
2. Owner information (name, email, phone)
3. All verification documents
4. Approve/Reject buttons

This ensures each document is traceable to its owner! 🔒
