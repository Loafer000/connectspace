# Admin System Setup Guide

## Overview
Complete admin dashboard system for ConnectSpace with property verification, user management, and role-based access control.

---

## 1. Admin Login Process

### Step 1: Create First Admin User

**Option A: Via MongoDB Directly (One-time setup)**

Open MongoDB Compass or Mongo Shell and run:

```javascript
db.users.updateOne(
  { email: "admin@connectspace.com" },
  { 
    $set: { role: "superadmin" }
  }
)
```

**Option B: Via Backend API (After first admin exists)**

```bash
# Only superadmin can make other admins
PUT /api/admin/users/:userId/role
Authorization: Bearer <superadmin_token>

{
  "role": "admin"
}
```

### Step 2: Admin Login

Admins login the SAME way as regular users:

```javascript
POST /api/auth/login

{
  "email": "admin@connectspace.com",
  "password": "your_password"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "email": "admin@connectspace.com",
    "role": "superadmin",  // ← This determines admin access
    "firstName": "Admin",
    "lastName": "User"
  }
}
```

### Step 3: Frontend Admin Check

```javascript
// Check if logged-in user is admin
const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

// Show admin dashboard only to admins
{isAdmin && <AdminDashboard />}
```

---

## 2. Admin API Endpoints

All admin endpoints require:
- `Authorization: Bearer <token>`
- User must have `role: 'admin'` or `role: 'superadmin'`

### Dashboard Stats
```
GET /api/admin/stats

Response:
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "landlords": 45,
      "tenants": 105
    },
    "properties": {
      "total": 80,
      "active": 60,
      "pending": 12,
      "verified": 58,
      "rejected": 10
    }
  }
}
```

### Pending Verifications
```
GET /api/admin/properties/pending

Response:
{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "prop123",
      "title": "Modern Office Space",
      "owner": {
        "_id": "user456",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+91 9876543210"
      },
      "documents": [
        {
          "name": "ownership_deed.pdf",
          "url": "https://cloudinary.com/...",
          "publicId": "xyz"
        }
      ],
      "verification": {
        "status": "pending"
      },
      "createdAt": "2025-10-11T..."
    }
  ]
}
```

### Verify Property
```
PUT /api/admin/properties/:id/verify

Response:
{
  "success": true,
  "message": "Property verified successfully",
  "data": {
    "_id": "prop123",
    "verification": {
      "status": "verified",
      "verifiedBy": "admin789",
      "verifiedAt": "2025-10-11T..."
    },
    "visibility": "public"  // Now visible to all users
  }
}
```

### Reject Property
```
PUT /api/admin/properties/:id/reject

Body:
{
  "reason": "Incomplete ownership documents"
}

Response:
{
  "success": true,
  "message": "Property rejected",
  "data": {
    "_id": "prop123",
    "verification": {
      "status": "rejected",
      "verifiedBy": "admin789",
      "verifiedAt": "2025-10-11T...",
      "rejectionReason": "Incomplete ownership documents"
    },
    "visibility": "private"  // Hidden from public
  }
}
```

### Get All Users
```
GET /api/admin/users?userType=landlord&isActive=true

Response:
{
  "success": true,
  "count": 45,
  "data": [
    {
      "_id": "user456",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "userType": "landlord",
      "role": "user",
      "isActive": true,
      "createdAt": "2025-01-15T..."
    }
  ]
}
```

### Make User Admin (Superadmin Only)
```
PUT /api/admin/users/:id/role

Body:
{
  "role": "admin"
}

Response:
{
  "success": true,
  "message": "User role updated to admin"
}
```

---

## 3. Property Verification Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ Landlord Creates Property                                    │
│ ✓ Fills all details                                         │
│ ✓ Uploads images to Cloudinary                             │
│ ✓ Uploads verification documents (PDF, images)              │
│ Status: verification.status = "pending"                      │
│ Visibility: "draft" (not visible to public)                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Admin Reviews Property                                       │
│ 1. Views property details                                    │
│ 2. Checks owner information                                  │
│ 3. Downloads & reviews documents:                            │
│    - Ownership Deed                                          │
│    - NOC Certificate                                         │
│    - Property Tax Receipt                                    │
│ 4. Verifies images are legitimate                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
            ┌──────────────┴──────────────┐
            ↓                             ↓
┌─────────────────────────┐  ┌─────────────────────────┐
│ APPROVE                 │  │ REJECT                  │
│ PUT /api/admin/         │  │ PUT /api/admin/         │
│   properties/:id/verify │  │   properties/:id/reject │
│                         │  │                         │
│ ✓ Status: "verified"    │  │ ✗ Status: "rejected"    │
│ ✓ Visibility: "public"  │  │ ✗ Visibility: "private" │
│ ✓ Shows ✅ badge        │  │ ✗ Reason stored         │
│ ✓ Email sent to owner   │  │ ✗ Email sent to owner   │
└─────────────────────────┘  └─────────────────────────┘
            ↓                             ↓
┌─────────────────────────┐  ┌─────────────────────────┐
│ Property Goes Live      │  │ Property Hidden         │
│ - Visible in search     │  │ - Not searchable        │
│ - Shows verified badge  │  │ - Owner sees rejection  │
│ - Users can book        │  │ - Can resubmit          │
└─────────────────────────┘  └─────────────────────────┘
```

---

## 4. Frontend Admin Dashboard

Create `frontend/src/pages/AdminDashboard.js`:

```jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStats();
    fetchPendingProperties();
  }, []);

  const fetchStats = async () => {
    const res = await fetch('http://localhost:5000/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setStats(data.data);
  };

  const fetchPendingProperties = async () => {
    const res = await fetch('http://localhost:5000/api/admin/properties/pending', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setPendingProperties(data.data);
  };

  const handleVerify = async (propertyId) => {
    const res = await fetch(`http://localhost:5000/api/admin/properties/${propertyId}/verify`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (data.success) {
      toast.success('Property verified successfully!');
      fetchPendingProperties(); // Refresh list
    }
  };

  const handleReject = async (propertyId, reason) => {
    const res = await fetch(`http://localhost:5000/api/admin/properties/${propertyId}/reject`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (data.success) {
      toast.success('Property rejected');
      fetchPendingProperties();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value={stats.users.total} color="blue" />
          <StatCard title="Total Properties" value={stats.properties.total} color="green" />
          <StatCard title="Pending Review" value={stats.properties.pending} color="yellow" />
          <StatCard title="Verified" value={stats.properties.verified} color="emerald" />
        </div>
      )}

      {/* Pending Verifications */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Pending Verifications ({pendingProperties.length})
        </h2>

        <div className="space-y-4">
          {pendingProperties.map(property => (
            <PropertyCard 
              key={property._id}
              property={property}
              onVerify={handleVerify}
              onReject={handleReject}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-6`}>
    <h3 className="text-sm text-gray-600 mb-2">{title}</h3>
    <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
  </div>
);

const PropertyCard = ({ property, onVerify, onReject }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{property.title}</h3>
          <p className="text-sm text-gray-600">
            {property.address?.city}, {property.address?.state}
          </p>
        </div>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
          Pending
        </span>
      </div>

      {/* Owner Info */}
      <div className="bg-gray-50 rounded p-4 mb-4">
        <h4 className="font-medium mb-2">Owner Information</h4>
        <p className="text-sm">
          <strong>Name:</strong> {property.owner.firstName} {property.owner.lastName}
        </p>
        <p className="text-sm">
          <strong>Email:</strong> {property.owner.email}
        </p>
        <p className="text-sm">
          <strong>Phone:</strong> {property.owner.phone}
        </p>
      </div>

      {/* Documents */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Verification Documents</h4>
        {property.documents.map((doc, idx) => (
          <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-2">
            <span className="text-sm">{doc.name}</span>
            <a 
              href={doc.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 text-sm hover:underline"
            >
              View
            </a>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onVerify(property._id)}
          className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          ✅ Verify Property
        </button>
        <button
          onClick={() => setShowRejectModal(true)}
          className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
        >
          ❌ Reject
        </button>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject Property</h3>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows="4"
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-gray-200 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onReject(property._id, rejectionReason);
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 bg-red-600 text-white py-2 rounded"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
```

---

## 5. Add Admin Route to App

`frontend/src/App.js`:

```jsx
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <Routes>
      {/* Existing routes */}
      <Route path="/" element={<Home />} />
      <Route path="/properties" element={<Properties />} />
      
      {/* Admin Route - Protected */}
      {isAdmin && (
        <Route path="/admin" element={<AdminDashboard />} />
      )}
    </Routes>
  );
}
```

---

## 6. Show Admin Link in Navbar

```jsx
{isAdmin && (
  <Link to="/admin" className="text-white hover:text-gray-200">
    🛡️ Admin Dashboard
  </Link>
)}
```

---

## 7. Verified Badge Display

Show verified badge on property cards:

```jsx
const PropertyCard = ({ property }) => {
  const isVerified = property.verification?.status === 'verified';

  return (
    <div className="property-card">
      <h3>{property.title}</h3>
      {isVerified && (
        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
          ✅ Verified
        </span>
      )}
    </div>
  );
};
```

---

## 8. Quick Setup Checklist

- [ ] Add `role` field to User model
- [ ] Create admin controller (`adminController.js`)
- [ ] Create admin routes (`routes/admin.js`)
- [ ] Mount admin routes in `routes/index.js`
- [ ] Create first superadmin in MongoDB
- [ ] Create `AdminDashboard.js` component
- [ ] Add admin route to App.js
- [ ] Add admin link to Navbar
- [ ] Test admin login
- [ ] Test property verification
- [ ] Add verified badge to property cards

---

## 9. Environment Variables

Add to `.env`:

```bash
# Admin
ADMIN_EMAIL=admin@connectspace.com
FIRST_SUPERADMIN_EMAIL=your.email@example.com
```

---

## 10. Testing

```bash
# 1. Create first admin
# In MongoDB:
db.users.updateOne(
  { email: "your.email@example.com" },
  { $set: { role: "superadmin" } }
)

# 2. Login as admin
POST /api/auth/login
{ "email": "your.email@example.com", "password": "your_password" }

# 3. Access admin dashboard
GET /api/admin/stats

# 4. Verify a property
PUT /api/admin/properties/:id/verify
```

---

## Summary

**Admin Roles:**
- `user` - Regular users (default)
- `admin` - Can verify properties, view all users
- `superadmin` - Can do everything + make other admins

**Admin Powers:**
- View all properties (pending, verified, rejected)
- Verify/reject properties
- View all users
- View dashboard statistics
- Make other users admin (superadmin only)

**Verification Workflow:**
1. Landlord uploads property + documents
2. Property status: `pending`, visibility: `draft`
3. Admin reviews in dashboard
4. Admin approves → Status: `verified`, visibility: `public`, shows ✅ badge
5. Admin rejects → Status: `rejected`, visibility: `private`, landlord notified

**Security:**
- All admin routes protected with `authenticate` + `isAdmin` middleware
- Frontend checks `user.role` before showing admin features
- Documents only accessible to admins
- Audit trail (verifiedBy, verifiedAt) stored

🎉 Complete admin system ready!
