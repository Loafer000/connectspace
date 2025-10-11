const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const {
  getPendingVerifications,
  getAllProperties,
  verifyProperty,
  rejectProperty,
  getAllUsers,
  getDashboardStats,
  updateUserRole
} = require('../controllers/adminController');

// All routes require authentication + admin role
router.use(authenticate);
router.use(isAdmin);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Property management
router.get('/properties', getAllProperties);
router.get('/properties/pending', getPendingVerifications);
router.put('/properties/:id/verify', verifyProperty);
router.put('/properties/:id/reject', rejectProperty);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole); // Superadmin only

module.exports = router;
