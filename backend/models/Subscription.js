// Revenue Model Implementation - Phase 1
// backend/models/Subscription.js

const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'business', 'enterprise'],
    default: 'free'
  },
  pricing: {
    monthly: Number,
    yearly: Number,
    currentPrice: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  features: {
    maxListings: {
      type: Number,
      default: 3 // Free plan limit
    },
    featuredListings: {
      type: Number,
      default: 0
    },
    analytics: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    customBranding: {
      type: Boolean,
      default: false
    },
    apiAccess: {
      type: Boolean,
      default: false
    }
  },
  billing: {
    cycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    autoRenew: {
      type: Boolean,
      default: true
    },
    nextBillingDate: Date
  },
  payment: {
    razorpaySubscriptionId: String,
    razorpayCustomerId: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired', 'trial'],
      default: 'trial'
    },
    trialEndsAt: Date,
    lastPaymentDate: Date,
    failedPaymentAttempts: {
      type: Number,
      default: 0
    }
  },
  usage: {
    propertiesListed: {
      type: Number,
      default: 0
    },
    featuredListingsUsed: {
      type: Number,
      default: 0
    },
    apiCallsThisMonth: {
      type: Number,
      default: 0
    }
  },
  history: [{
    action: String, // 'upgraded', 'downgraded', 'cancelled', 'renewed'
    fromPlan: String,
    toPlan: String,
    date: {
      type: Date,
      default: Date.now
    },
    reason: String,
    amount: Number
  }]
}, {
  timestamps: true
});

// Pre-save middleware to set billing dates
subscriptionSchema.pre('save', function(next) {
  if (this.isNew && this.billing.cycle === 'monthly') {
    this.billing.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    this.billing.nextBillingDate = this.billing.endDate;
  } else if (this.isNew && this.billing.cycle === 'yearly') {
    this.billing.endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    this.billing.nextBillingDate = this.billing.endDate;
  }
  next();
});

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.payment.status === 'active' && new Date() < this.billing.endDate;
};

// Method to get remaining listings
subscriptionSchema.methods.getRemainingListings = function() {
  return Math.max(0, this.features.maxListings - this.usage.propertiesListed);
};

// Static method to get plan pricing
subscriptionSchema.statics.getPlanPricing = function() {
  return {
    free: { monthly: 0, yearly: 0, maxListings: 3 },
    pro: { monthly: 999, yearly: 9999, maxListings: 20 },
    business: { monthly: 2999, yearly: 29999, maxListings: 100 },
    enterprise: { monthly: 9999, yearly: 99999, maxListings: -1 } // Unlimited
  };
};

module.exports = mongoose.model('Subscription', subscriptionSchema);