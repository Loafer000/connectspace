const express = require('express');
const { query } = require('express-validator');

const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

// @desc    Test property routes
// @route   GET /api/properties/test
// @access  Public
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Property routes working!',
    availableRoutes: [
      'GET    /api/properties',
      'GET    /api/properties/:id',
      'POST   /api/properties',
      'PUT    /api/properties/:id',
      'DELETE /api/properties/:id'
    ]
  });
});

// @desc    Test property creation
// @route   POST /api/properties/test-create
// @access  Private
router.post('/test-create', authenticate, async (req, res) => {
  try {
    const Property = require('../models/Property');
    
    const testProperty = new Property({
      title: 'Test Property',
      description: 'This is a test property created by the test endpoint',
      propertyType: 'office',
      category: 'commercial',
      owner: req.user._id,
      address: {
        street: '123 Test Street',
        area: 'Test Area',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        country: 'India'
      },
      rental: {
        monthlyRent: 50000,
        securityDeposit: 100000,
        maintenanceCharges: 5000
      },
      specifications: {
        totalArea: 1000,
        builtUpArea: 800,
        floorNumber: 2,
        totalFloors: 5,
        bedrooms: 3,
        bathrooms: 2,
        amenities: ['parking', 'wifi']
      },
      visibility: 'public',
      status: 'available'
    });

    const saved = await testProperty.save();
    
    res.json({
      success: true,
      message: 'Test property created successfully',
      propertyId: saved._id,
      data: saved
    });
  } catch (error) {
    console.error('Test create error:', error);
    res.status(500).json({
      success: false,
      message: 'Test property creation failed',
      error: error.message
    });
  }
});

// Step 4 Implementation - Property routes

// Public routes
router.get('/search', propertyController.searchProperties);  // Must come BEFORE /:id
router.get('/featured', propertyController.getFeaturedProperties);
router.get(
  '/nearby',
  [
    query('longitude').isFloat().withMessage('Valid longitude is required'),
    query('latitude').isFloat().withMessage('Valid latitude is required')
  ],
  validateRequest,
  propertyController.findNearbyProperties
);
router.get('/', optionalAuth, propertyController.getProperties);
router.get('/:id', optionalAuth, propertyController.getPropertyById);

// Protected routes
router.post('/', authenticate, propertyController.createProperty);
router.put('/:id', authenticate, propertyController.updateProperty);
router.delete('/:id', authenticate, propertyController.deleteProperty);
router.get('/my/properties', authenticate, propertyController.getOwnerProperties);

module.exports = router;
