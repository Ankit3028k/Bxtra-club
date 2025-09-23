const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  startup: {
    type: String,
    required: [true, 'Startup name is required'],
    trim: true,
    maxlength: [100, 'Startup name cannot exceed 100 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['CEO', 'CTO', 'CFO', 'Co-Founder', 'Founder', 'Other']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City name cannot exceed 50 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  plan: {
    type: String,
    enum: ['Basic', 'Premium', 'Enterprise'],
    default: 'Basic'
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  website: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  linkedin: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid LinkedIn URL']
  },
  twitter: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid Twitter URL']
  },
  profileCompletion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  subscriptionId: {
    type: String,
    default: null
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'past_due'],
    default: 'inactive'
  },
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  connectionRequests: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }, {
    default: []
  }],
  lastActive: {
    type: Date,
    default: Date.now
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for connection count
userSchema.virtual('connectionCount').get(function() {
  return this.connections ? this.connections.length : 0;
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ status: 1 });
userSchema.index({ city: 1 });
userSchema.index({ plan: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('User', userSchema);