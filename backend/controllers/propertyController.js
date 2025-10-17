const { Property } = require('../models');

// Get all properties with filters
exports.getProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      area,
      propertyType,
      minRent,
      maxRent,
      bedrooms,
      amenities,
      sort = '-createdAt'
    } = req.query;

    console.log('🔍 Getting properties with query params:', req.query);

    // Build filter object
    const filters = {
      status: 'available',
      visibility: 'public',
      isDeleted: false
    };

    if (city) filters['address.city'] = new RegExp(city, 'i');
    if (area) filters['address.area'] = new RegExp(area, 'i');
    if (propertyType) filters.propertyType = propertyType;
    if (bedrooms) filters['specifications.bedrooms'] = parseInt(bedrooms, 10);

    if (minRent || maxRent) {
      filters['rental.monthlyRent'] = {};
      if (minRent) filters['rental.monthlyRent'].$gte = parseInt(minRent, 10);
      if (maxRent) filters['rental.monthlyRent'].$lte = parseInt(maxRent, 10);
    }

    console.log('📋 Applied filters:', JSON.stringify(filters, null, 2));

    // Calculate pagination
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Execute query
    const properties = await Property.find(filters)
      .populate('owner', 'firstName lastName phone email profilePicture')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Get total count for pagination
    const total = await Property.countDocuments(filters);
    
    // Also get count of ALL properties in database (for debugging)
    const allPropertiesCount = await Property.countDocuments({});
    const allNonDeleted = await Property.countDocuments({ isDeleted: { $ne: true } });

    console.log('📊 Database stats:', {
      totalPropertiesInDB: allPropertiesCount,
      nonDeletedProperties: allNonDeleted,
      filteredResults: total,
      returnedProperties: properties.length
    });

    res.json({
      success: true,
      message: 'Properties retrieved successfully',
      data: {
        properties,
        pagination: {
          currentPage: parseInt(page, 10),
          totalPages: Math.ceil(total / parseInt(limit, 10)),
          totalProperties: total,
          hasNextPage: skip + properties.length < total,
          hasPrevPage: parseInt(page, 10) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve properties',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get single property by ID
exports.getPropertyById = async (req, res) => {
  try {
    console.log('🏠 ========== GET PROPERTY BY ID START ==========');
    const { id } = req.params;
    console.log('📍 Requested property ID:', id);

    // Validate MongoDB ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('❌ Invalid MongoDB ObjectId format:', id);
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID format'
      });
    }

    console.log('⏳ Querying MongoDB...');
    const property = await Property.findById(id)
      .populate('owner', 'firstName lastName phone email profilePicture documentVerified')
      .populate({
        path: 'analytics.viewHistory.user',
        select: 'firstName lastName'
      });

    console.log('📦 MongoDB query result:', property ? 'Property found' : 'Property NOT found');

    if (!property || property.isDeleted) {
      console.log('⚠️ Property not found or deleted. Deleted status:', property?.isDeleted);
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    console.log('✅ Property retrieved successfully:');
    console.log(`   Title: ${property.title}`);
    console.log(`   City: ${property.address?.city}`);
    console.log(`   Status: ${property.status}`);
    console.log(`   Visibility: ${property.visibility}`);
    console.log(`   Images count: ${property.images?.length || 0}`);
    console.log(`   Owner: ${property.owner?.firstName} ${property.owner?.lastName}`);

    // Increment view count (if user is provided in auth)
    if (req.user) {
      console.log('👤 Logged in user viewing:', req.user._id);
      await property.incrementViews(req.user._id, 'direct');
    } else {
      console.log('👻 Anonymous user viewing property');
      property.analytics.views += 1;
      property.analytics.lastViewed = new Date();
      await property.save();
    }

    console.log('🏠 ========== GET PROPERTY BY ID END ==========\n');

    res.json({
      success: true,
      message: 'Property retrieved successfully',
      data: { property }
    });
  } catch (error) {
    console.error('❌ Get property error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve property',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create new property (requires authentication)
exports.createProperty = async (req, res) => {
  try {
    console.log('🏠 Creating property with data:', JSON.stringify(req.body, null, 2));
    console.log('👤 User creating property:', req.user._id, req.user.firstName, req.user.lastName);

    const propertyData = {
      ...req.body,
      owner: req.user._id
    };

    console.log('📝 Final property data before save:', JSON.stringify(propertyData, null, 2));

    // Validate required fields
    const requiredFields = ['title', 'description', 'propertyType', 'category', 'address'];
    const missingFields = requiredFields.filter(field => !propertyData[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }

    // Create property
    const property = new Property(propertyData);
    
    console.log('💾 Attempting to save property to MongoDB...');
    const savedProperty = await property.save();
    console.log('✅ Property saved successfully with ID:', savedProperty._id);

    // Populate owner data for response
    await savedProperty.populate('owner', 'firstName lastName phone email');

    console.log('🎉 Property creation complete, sending response');

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: { property: savedProperty }
    });
  } catch (error) {
    console.error('❌ Create property error:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      validation: error.errors
    });

    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
        error: process.env.NODE_ENV === 'development' ? error.message : 'Validation error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create property',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update property (owner only)
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const property = await Property.findById(id);

    if (!property || property.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if user owns the property
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }

    // Update property
    Object.keys(updates).forEach((key) => {
      property[key] = updates[key];
    });

    await property.save();

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: { property }
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete property (soft delete, owner only)
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);

    if (!property || property.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if user owns the property
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }

    // Soft delete
    property.isDeleted = true;
    property.deletedAt = new Date();
    property.status = 'inactive';
    await property.save();

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Find nearby properties
exports.findNearbyProperties = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    const properties = await Property.findNearby(
      parseFloat(longitude),
      parseFloat(latitude),
      parseInt(maxDistance, 10)
    ).populate('owner', 'firstName lastName profilePicture');

    res.json({
      success: true,
      message: 'Nearby properties found',
      data: {
        properties,
        searchCenter: { longitude: parseFloat(longitude), latitude: parseFloat(latitude) },
        maxDistance: parseInt(maxDistance, 10)
      }
    });
  } catch (error) {
    console.error('Find nearby properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find nearby properties',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Search properties with text search
exports.searchProperties = async (req, res) => {
  try {
    console.log('🔍 ========== SEARCH REQUEST START ==========');
    console.log('📥 Query params received:', req.query);
    
    const {
      q, // Search query
      city,
      area,
      propertyType,
      minRent,
      maxRent,
      bedrooms,
      amenities,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    console.log('🎯 Search term (q):', q);

    // Build text search filter
    const filters = {
      isDeleted: false
      // Accept both 'public' and 'draft' visibility for search
      // Default visibility is 'draft' when property is created
    };

    console.log('🔧 Base filters:', filters);

    // Enhanced text search across multiple fields
    if (q) {
      const searchRegex = new RegExp(q, 'i');
      console.log('🔎 Creating search regex for:', q);
      
      // Simple and clear search - search in all relevant fields
      filters.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { 'address.city': searchRegex },
        { 'address.area': searchRegex },
        { 'address.state': searchRegex },
        { 'address.landmark': searchRegex },
        { 'address.street': searchRegex },
        { propertyType: searchRegex }
      ];
      
      console.log('📋 Search will match against fields:', [
        'title', 'description', 'address.city', 'address.area', 
        'address.state', 'address.landmark', 'address.street', 
        'propertyType'
      ]);
    }

    if (area) {
      console.log('📍 Area filter:', area);
      filters['address.area'] = new RegExp(area, 'i');
    }
    if (propertyType) {
      console.log('🏠 Property type filter:', propertyType);
      filters.propertyType = propertyType;
    }
    if (bedrooms) {
      console.log('🛏️ Bedrooms filter:', bedrooms);
      filters['specifications.bedrooms'] = parseInt(bedrooms, 10);
    }

    // Price range filter
    if (minRent || maxRent) {
      filters['rental.monthlyRent'] = {};
      if (minRent) {
        filters['rental.monthlyRent'].$gte = parseInt(minRent, 10);
        console.log('💰 Min rent:', minRent);
      }
      if (maxRent) {
        filters['rental.monthlyRent'].$lte = parseInt(maxRent, 10);
        console.log('💰 Max rent:', maxRent);
      }
    }

    // Amenities filter
    if (amenities) {
      const amenityArray = Array.isArray(amenities) ? amenities : [amenities];
      console.log('✨ Amenities filter:', amenityArray);
      filters['specifications.amenities'] = { $in: amenityArray };
    }

    console.log('🎯 Final MongoDB query filters:', JSON.stringify(filters, null, 2));

    // Calculate pagination
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Execute search query
    console.log('⏳ Executing MongoDB query...');
    const properties = await Property.find(filters)
      .populate('owner', 'firstName lastName phone email profilePicture')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit, 10));

    console.log(`✅ Query executed. Found ${properties.length} properties`);
    
    if (properties.length > 0) {
      console.log('📦 Sample property data:');
      properties.slice(0, 2).forEach((prop, idx) => {
        console.log(`   [${idx + 1}] ${prop.title}`);
        console.log(`       City: ${prop.address?.city}`);
        console.log(`       Area: ${prop.address?.area}`);
        console.log(`       Visibility: ${prop.visibility}`);
        console.log(`       Status: ${prop.status}`);
      });
    } else {
      console.log('⚠️ No properties found matching the criteria');
      
      // Debug: Check if ANY properties exist in DB
      const totalInDB = await Property.countDocuments({});
      console.log(`📊 Total properties in database: ${totalInDB}`);
      
      const publicProperties = await Property.countDocuments({ visibility: 'public' });
      console.log(`📊 Public properties: ${publicProperties}`);
      
      const availableProperties = await Property.countDocuments({ 
        status: 'available', 
        visibility: 'public' 
      });
      console.log(`📊 Available & public properties: ${availableProperties}`);
    }

    // Get total count for pagination
    const total = await Property.countDocuments(filters);

    console.log('🔍 ========== SEARCH REQUEST END ==========\n');

    res.json({
      success: true,
      message: `Found ${total} properties`,
      data: {
        properties,
        searchQuery: q,
        filters: {
          city, area, propertyType, minRent, maxRent, bedrooms, amenities
        },
        pagination: {
          currentPage: parseInt(page, 10),
          totalPages: Math.ceil(total / parseInt(limit, 10)),
          totalProperties: total,
          hasNextPage: skip + properties.length < total,
          hasPrevPage: parseInt(page, 10) > 1
        }
      }
    });
  } catch (error) {
    console.error('❌ Search properties error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to search properties',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get featured properties
exports.getFeaturedProperties = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const properties = await Property.find({
      'featured.isFeatured': true,
      'featured.featuredUntil': { $gt: new Date() },
      status: 'available',
      visibility: 'public',
      isDeleted: false
    })
      .populate('owner', 'firstName lastName profilePicture')
      .sort('-featured.promotionLevel -qualityScore -createdAt')
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      message: 'Featured properties retrieved successfully',
      data: { properties }
    });
  } catch (error) {
    console.error('Get featured properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve featured properties',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get properties by owner (requires authentication)
exports.getOwnerProperties = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filters = {
      owner: req.user._id,
      isDeleted: false
    };

    if (status) {
      filters.status = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const properties = await Property.find(filters)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit, 10));

    const total = await Property.countDocuments(filters);

    res.json({
      success: true,
      message: 'Owner properties retrieved successfully',
      data: {
        properties,
        pagination: {
          currentPage: parseInt(page, 10),
          totalPages: Math.ceil(total / parseInt(limit, 10)),
          totalProperties: total
        }
      }
    });
  } catch (error) {
    console.error('Get owner properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve properties',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
