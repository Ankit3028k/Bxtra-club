const mongoose = require('mongoose');

const perkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Perk name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Perk description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  logo: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid logo URL']
  },
  category: {
    type: String,
    enum: ['cloud', 'tools', 'marketing', 'legal', 'finance', 'design', 'development', 'other'],
    required: [true, 'Category is required']
  },
  value: {
    amount: {
      type: Number,
      min: [0, 'Value cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    description: String // e.g., "$5,000 in credits", "90% off first year"
  },
  eligiblePlans: [{
    type: String,
    enum: ['Basic', 'Premium', 'Enterprise']
  }],
  link: {
    type: String,
    required: [true, 'Perk link is required'],
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  code: {
    type: String,
    trim: true,
    uppercase: true
  },
  instructions: {
    type: String,
    maxlength: [1000, 'Instructions cannot exceed 1000 characters']
  },
  expiresAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  maxUsage: {
    type: Number,
    default: -1 // -1 means unlimited
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for availability
perkSchema.virtual('isAvailable').get(function() {
  if (!this.isActive) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  if (this.maxUsage > 0 && this.usageCount >= this.maxUsage) return false;
  return true;
});

// Index for better query performance
perkSchema.index({ category: 1 });
perkSchema.index({ eligiblePlans: 1 });
perkSchema.index({ isActive: 1 });
perkSchema.index({ tags: 1 });

module.exports = mongoose.model('Perk', perkSchema);