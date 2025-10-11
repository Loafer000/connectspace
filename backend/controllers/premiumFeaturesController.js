// Featured Listings & Promotions System
// backend/controllers/premiumFeaturesController.js

const Property = require('../models/Property');
const Subscription = require('../models/Subscription');
const Commission = require('../models/Commission');

// Promote property to featured
const promoteProperty = async (req, res) => {
  try {
    const { propertyId, promotionType, duration } = req.body;
    const userId = req.user._id;
    
    // Check user's subscription and limits
    const subscription = await Subscription.findOne({ user: userId });
    if (!subscription || !subscription.isActive()) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required for promotions'
      });
    }
    
    const property = await Property.findById(propertyId);
    if (!property || property.owner.toString() !== userId.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Property not found or unauthorized'
      });
    }
    
    // Promotion pricing
    const promotionPricing = {
      'featured': { daily: 50, weekly: 299, monthly: 999 },
      'urgent': { daily: 149, weekly: 799 },
      'premium-gallery': { monthly: 199 },
      'local-boost': { monthly: 399 }
    };
    
    const pricing = promotionPricing[promotionType];
    if (!pricing || !pricing[duration]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid promotion type or duration'
      });
    }
    
    const amount = pricing[duration];
    const durationDays = duration === 'daily' ? 1 : duration === 'weekly' ? 7 : 30;
    
    // Create promotion record
    const promotion = {
      type: promotionType,
      startDate: new Date(),
      endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      amount,
      status: 'active'
    };
    
    // Update property
    if (!property.featured) property.featured = {};
    if (!property.featured.promotions) property.featured.promotions = [];
    
    property.featured.isFeatured = true;
    property.featured.promotionLevel = promotionType;
    property.featured.promotions.push(promotion);
    
    await property.save();
    
    // Create commission record for promotion payment
    const commission = new Commission({
      booking: null, // No booking for promotions
      property: propertyId,
      landlord: userId,
      tenant: userId, // Same as landlord for promotions
      type: 'featured-listing',
      baseAmount: amount,
      commissionRate: 100, // Full amount as commission
      dueDate: new Date(),
      metadata: {
        propertyTitle: property.title,
        promotionType,
        duration
      }
    });
    
    await commission.save();
    
    res.json({
      success: true,
      message: 'Property promoted successfully',
      data: {
        property: {
          id: property._id,
          title: property.title,
          featured: property.featured
        },
        commission: {
          id: commission._id,
          amount: commission.commissionAmount,
          dueDate: commission.dueDate
        }
      }
    });
    
  } catch (error) {
    console.error('Promote property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to promote property',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get premium features pricing
const getPremiumPricing = async (req, res) => {
  try {
    const pricing = {
      subscriptions: {
        free: {
          monthly: 0,
          yearly: 0,
          features: {
            maxListings: 3,
            basicSearch: true,
            standardSupport: true,
            mobileApp: true
          }
        },
        pro: {
          monthly: 999,
          yearly: 9999,
          savings: 1989, // 2 months free
          features: {
            maxListings: 20,
            featuredListings: 2,
            advancedAnalytics: true,
            prioritySupport: true,
            customBranding: false,
            apiAccess: false,
            leadGeneration: true
          }
        },
        business: {
          monthly: 2999,
          yearly: 29999,
          savings: 5989, // 2 months free
          features: {
            maxListings: 100,
            featuredListings: 10,
            advancedAnalytics: true,
            prioritySupport: true,
            customBranding: true,
            apiAccess: true,
            leadGeneration: true,
            bulkUpload: true,
            dedicatedManager: false
          }
        },
        enterprise: {
          monthly: 9999,
          yearly: 99999,
          savings: 19989, // 2 months free
          features: {
            maxListings: -1, // Unlimited
            featuredListings: -1, // Unlimited
            advancedAnalytics: true,
            prioritySupport: true,
            customBranding: true,
            apiAccess: true,
            leadGeneration: true,
            bulkUpload: true,
            dedicatedManager: true,
            whiteLabel: true
          }
        }
      },
      promotions: {
        featured: {
          daily: 50,
          weekly: 299,
          monthly: 999,
          description: 'Top placement in search results',
          benefits: ['Top search placement', '3x more views', 'Featured badge']
        },
        urgent: {
          daily: 149,
          weekly: 799,
          description: 'Urgent property badge',
          benefits: ['Urgent badge', 'Red highlighting', 'Priority in listings']
        },
        premiumGallery: {
          monthly: 199,
          description: 'Enhanced photo display',
          benefits: ['High-resolution images', 'Virtual tour support', 'Photo slider']
        },
        localBoost: {
          monthly: 399,
          description: 'Area-specific prominence',
          benefits: ['Local area priority', 'Neighborhood spotlight', 'Location-based boost']
        }
      },
      services: {
        verification: {
          basic: 500,
          premium: 1500,
          comprehensive: 2500,
          description: 'Background and document verification'
        },
        photography: {
          basic: 2999,
          professional: 5999,
          virtual: 9999,
          description: 'Professional property photography'
        },
        legal: {
          consultation: 1999,
          agreement: 4999,
          fullService: 9999,
          description: 'Legal services for property rental'
        }
      }
    };
    
    res.json({
      success: true,
      message: 'Premium pricing retrieved successfully',
      data: pricing
    });
    
  } catch (error) {
    console.error('Get premium pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pricing',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user's revenue dashboard
const getRevenueDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeRange = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    // Get commissions data
    const commissions = await Commission.find({
      landlord: userId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('property', 'title address');
    
    // Calculate metrics
    const totalRevenue = commissions.reduce((sum, comm) => sum + comm.netCommission, 0);
    const totalCommissions = commissions.length;
    const avgCommission = totalCommissions > 0 ? totalRevenue / totalCommissions : 0;
    
    // Revenue by type
    const revenueByType = commissions.reduce((acc, comm) => {
      acc[comm.type] = (acc[comm.type] || 0) + comm.netCommission;
      return acc;
    }, {});
    
    // Monthly breakdown
    const monthlyRevenue = {};
    commissions.forEach(comm => {
      const month = comm.createdAt.toISOString().substring(0, 7); // YYYY-MM
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + comm.netCommission;
    });
    
    // Top performing properties
    const propertyRevenue = {};
    commissions.forEach(comm => {
      if (comm.property) {
        const propId = comm.property._id.toString();
        if (!propertyRevenue[propId]) {
          propertyRevenue[propId] = {
            property: comm.property,
            revenue: 0,
            commissionCount: 0
          };
        }
        propertyRevenue[propId].revenue += comm.netCommission;
        propertyRevenue[propId].commissionCount += 1;
      }
    });
    
    const topProperties = Object.values(propertyRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    res.json({
      success: true,
      message: 'Revenue dashboard data retrieved successfully',
      data: {
        summary: {
          totalRevenue,
          totalCommissions,
          avgCommission,
          timeRange
        },
        revenueByType,
        monthlyRevenue,
        topProperties,
        recentCommissions: commissions.slice(-10).reverse()
      }
    });
    
  } catch (error) {
    console.error('Get revenue dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve revenue dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  promoteProperty,
  getPremiumPricing,
  getRevenueDashboard
};