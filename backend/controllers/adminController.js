const { Property, User } = require('../models');

// @desc    Get all properties pending verification
// @route   GET /api/admin/properties/pending
// @access  Private/Admin
exports.getPendingVerifications = async (req, res) => {
  try {
    console.log('🔍 Admin fetching pending verifications...');

    const properties = await Property.find({
      'verification.status': 'pending',
      'documents.0': { $exists: true } // Has at least one document
    })
      .populate('owner', 'firstName lastName email phone userType')
      .sort({ createdAt: -1 })
      .select('title address documents images verification owner createdAt status');

    console.log(`✅ Found ${properties.length} properties pending verification`);

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error('❌ Error fetching pending verifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending verifications',
      error: error.message
    });
  }
};

// @desc    Get all properties (verified, pending, rejected)
// @route   GET /api/admin/properties
// @access  Private/Admin
exports.getAllProperties = async (req, res) => {
  try {
    const { status, verification } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (verification) filter['verification.status'] = verification;

    const properties = await Property.find(filter)
      .populate('owner', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error('❌ Error fetching properties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
      error: error.message
    });
  }
};

// @desc    Verify a property
// @route   PUT /api/admin/properties/:id/verify
// @access  Private/Admin
exports.verifyProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`✅ Admin ${req.user.email} verifying property ${id}`);

    const property = await Property.findByIdAndUpdate(
      id,
      {
        'verification.status': 'verified',
        'verification.verifiedBy': req.user._id,
        'verification.verifiedAt': new Date(),
        'visibility': 'public' // Make it public after verification
      },
      { new: true }
    ).populate('owner', 'firstName lastName email');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // TODO: Send email notification to property owner
    console.log(`📧 Sending verification email to ${property.owner.email}`);

    res.status(200).json({
      success: true,
      message: 'Property verified successfully',
      data: property
    });
  } catch (error) {
    console.error('❌ Error verifying property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify property',
      error: error.message
    });
  }
};

// @desc    Reject a property
// @route   PUT /api/admin/properties/:id/reject
// @access  Private/Admin
exports.rejectProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    console.log(`❌ Admin ${req.user.email} rejecting property ${id}`);

    const property = await Property.findByIdAndUpdate(
      id,
      {
        'verification.status': 'rejected',
        'verification.verifiedBy': req.user._id,
        'verification.verifiedAt': new Date(),
        'verification.rejectionReason': reason,
        'visibility': 'private' // Hide from public
      },
      { new: true }
    ).populate('owner', 'firstName lastName email');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // TODO: Send rejection email to property owner
    console.log(`📧 Sending rejection email to ${property.owner.email}`);

    res.status(200).json({
      success: true,
      message: 'Property rejected',
      data: property
    });
  } catch (error) {
    console.error('❌ Error rejecting property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject property',
      error: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { userType, role, isActive } = req.query;
    
    let filter = {};
    if (userType) filter.userType = userType;
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProperties,
      pendingVerifications,
      verifiedProperties,
      rejectedProperties,
      totalLandlords,
      totalTenants,
      activeProperties
    ] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Property.countDocuments({ 'verification.status': 'pending' }),
      Property.countDocuments({ 'verification.status': 'verified' }),
      Property.countDocuments({ 'verification.status': 'rejected' }),
      User.countDocuments({ userType: 'landlord' }),
      User.countDocuments({ userType: 'tenant' }),
      Property.countDocuments({ status: 'available', visibility: 'public' })
    ]);

    const stats = {
      users: {
        total: totalUsers,
        landlords: totalLandlords,
        tenants: totalTenants
      },
      properties: {
        total: totalProperties,
        active: activeProperties,
        pending: pendingVerifications,
        verified: verifiedProperties,
        rejected: rejectedProperties
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};

// @desc    Update user role (make admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Superadmin only
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be: user, admin, or superadmin'
      });
    }

    // Only superadmin can change roles
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmin can change user roles'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`👑 User ${user.email} role changed to ${role} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: user
    });
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
};
