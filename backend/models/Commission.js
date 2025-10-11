// Revenue Model Implementation - Commission System
// backend/models/Commission.js

const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  // Reference to the transaction
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Commission Details
  type: {
    type: String,
    enum: [
      'booking-commission', // One-time booking commission
      'monthly-commission', // Recurring monthly commission
      'renewal-commission', // Lease renewal commission
      'service-commission', // Service marketplace commission
      'featured-listing', // Featured listing payment
      'subscription-fee', // Subscription payment
      'transaction-fee' // Payment processing fee
    ],
    required: true
  },
  
  // Financial Details
  baseAmount: {
    type: Number,
    required: true // The amount on which commission is calculated
  },
  commissionRate: {
    type: Number,
    required: true, // Percentage (e.g., 2.5 for 2.5%)
    min: 0,
    max: 100
  },
  commissionAmount: {
    type: Number,
    required: true // Calculated commission amount
  },
  
  // Payment Gateway Fees
  paymentGatewayFee: {
    type: Number,
    default: 0
  },
  netCommission: {
    type: Number,
    required: true // Commission after deducting gateway fees
  },

  // Status & Timing
  status: {
    type: String,
    enum: ['pending', 'collected', 'failed', 'refunded', 'disputed'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  collectedAt: Date,
  
  // Payment Details
  razorpayPaymentId: String,
  razorpayOrderId: String,
  transactionId: String,
  
  // Agent Commission (if applicable)
  agentCommission: {
    rate: {
      type: Number,
      default: 0
    },
    amount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'withheld'],
      default: 'pending'
    }
  },

  // Recurring Commission (for monthly rent)
  recurringDetails: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    },
    nextDueDate: Date,
    maxOccurrences: Number, // -1 for unlimited
    occurrenceCount: {
      type: Number,
      default: 0
    }
  },

  // Dispute & Refund
  dispute: {
    isDisputed: {
      type: Boolean,
      default: false
    },
    reason: String,
    disputedAt: Date,
    resolvedAt: Date,
    resolution: String
  },

  // Metadata
  metadata: {
    propertyTitle: String,
    propertyLocation: String,
    leaseStartDate: Date,
    leaseEndDate: Date,
    monthlyRent: Number
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
commissionSchema.index({ landlord: 1, status: 1 });
commissionSchema.index({ agent: 1, status: 1 });
commissionSchema.index({ type: 1, dueDate: 1 });
commissionSchema.index({ 'recurringDetails.nextDueDate': 1 });

// Pre-save middleware to calculate amounts
commissionSchema.pre('save', function(next) {
  if (this.isModified('baseAmount') || this.isModified('commissionRate')) {
    this.commissionAmount = (this.baseAmount * this.commissionRate) / 100;
    this.netCommission = this.commissionAmount - (this.paymentGatewayFee || 0);
  }
  
  // Calculate agent commission if applicable
  if (this.agent && this.agentCommission.rate > 0) {
    this.agentCommission.amount = (this.commissionAmount * this.agentCommission.rate) / 100;
  }
  
  next();
});

// Method to mark as collected
commissionSchema.methods.markAsCollected = function(paymentDetails = {}) {
  this.status = 'collected';
  this.collectedAt = new Date();
  this.razorpayPaymentId = paymentDetails.paymentId;
  this.razorpayOrderId = paymentDetails.orderId;
  this.transactionId = paymentDetails.transactionId;
  
  // If recurring, set next due date
  if (this.recurringDetails.isRecurring) {
    this.recurringDetails.occurrenceCount += 1;
    
    if (this.recurringDetails.maxOccurrences === -1 || 
        this.recurringDetails.occurrenceCount < this.recurringDetails.maxOccurrences) {
      
      const nextDate = new Date(this.recurringDetails.nextDueDate);
      if (this.recurringDetails.frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else if (this.recurringDetails.frequency === 'quarterly') {
        nextDate.setMonth(nextDate.getMonth() + 3);
      } else if (this.recurringDetails.frequency === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
      
      this.recurringDetails.nextDueDate = nextDate;
    }
  }
  
  return this.save();
};

// Static method to calculate commission rates based on plan/property type
commissionSchema.statics.getCommissionRates = function() {
  return {
    'booking-commission': {
      residential: 2.0, // 2% of first month rent
      commercial: 3.0,  // 3% of first month rent
      luxury: 1.5       // 1.5% for luxury properties
    },
    'monthly-commission': {
      residential: 1.0, // 1% of monthly rent
      commercial: 1.5,  // 1.5% of monthly rent
      luxury: 0.5       // 0.5% for luxury properties
    },
    'service-commission': {
      maintenance: 10.0, // 10% of service cost
      cleaning: 15.0,    // 15% of service cost
      legal: 20.0        // 20% of legal service cost
    },
    'transaction-fee': 1.0 // 1% payment processing fee
  };
};

// Static method to create recurring commission schedule
commissionSchema.statics.createRecurringCommissions = async function(bookingId, leaseDurationMonths) {
  const booking = await mongoose.model('Booking').findById(bookingId)
    .populate('property landlord tenant');
  
  if (!booking) throw new Error('Booking not found');
  
  const commissions = [];
  const rates = this.getCommissionRates();
  const monthlyRent = booking.financial.monthlyRent;
  const commissionRate = rates['monthly-commission'][booking.property.category] || 1.0;
  
  for (let month = 1; month <= leaseDurationMonths; month++) {
    const dueDate = new Date(booking.dates.moveInDate);
    dueDate.setMonth(dueDate.getMonth() + month);
    
    commissions.push({
      booking: bookingId,
      property: booking.property._id,
      landlord: booking.landlord._id,
      tenant: booking.tenant._id,
      type: 'monthly-commission',
      baseAmount: monthlyRent,
      commissionRate,
      dueDate,
      recurringDetails: {
        isRecurring: true,
        frequency: 'monthly',
        nextDueDate: dueDate,
        maxOccurrences: leaseDurationMonths,
        occurrenceCount: 0
      },
      metadata: {
        propertyTitle: booking.property.title,
        propertyLocation: `${booking.property.address.area}, ${booking.property.address.city}`,
        leaseStartDate: booking.dates.moveInDate,
        leaseEndDate: booking.dates.moveOutDate,
        monthlyRent
      }
    });
  }
  
  return this.insertMany(commissions);
};

module.exports = mongoose.model('Commission', commissionSchema);