const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    unique: true,
    enum: ['Basic', 'Premium', 'Enterprise']
  },
  price: {
    type: Number,
    required: [true, 'Plan price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  interval: {
    type: String,
    enum: ['month', 'year'],
    default: 'month'
  },
  description: {
    type: String,
    required: [true, 'Plan description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  features: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    included: {
      type: Boolean,
      default: true
    }
  }],
  limits: {
    connections: {
      type: Number,
      default: -1 // -1 means unlimited
    },
    events: {
      type: Number,
      default: -1
    },
    requests: {
      type: Number,
      default: -1
    },
    messages: {
      type: Number,
      default: -1
    }
  },
  stripeProductId: {
    type: String,
    required: true
  },
  stripePriceId: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
planSchema.index({ name: 1 });
planSchema.index({ price: 1 });
planSchema.index({ isActive: 1 });
planSchema.index({ order: 1 });

module.exports = mongoose.model('Plan', planSchema);