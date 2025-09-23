const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Request title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Request content is required'],
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: ['co-founder', 'technical', 'marketing', 'funding', 'legal', 'mentorship', 'partnership', 'hiring', 'other'],
    required: [true, 'Category is required']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  budget: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  location: {
    city: String,
    remote: {
      type: Boolean,
      default: true
    }
  },
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Reply cannot exceed 1000 characters']
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  upvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for upvote count
requestSchema.virtual('upvoteCount').get(function() {
  return this.upvotes.length;
});

// Virtual for reply count
requestSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Virtual for public reply count
requestSchema.virtual('publicReplyCount').get(function() {
  return this.replies.filter(reply => !reply.isPrivate).length;
});

// Index for better query performance
requestSchema.index({ author: 1 });
requestSchema.index({ category: 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ tags: 1 });
requestSchema.index({ createdAt: -1 });
requestSchema.index({ 'upvotes.user': 1 });
requestSchema.index({ expiresAt: 1 });

// Method to check if user upvoted the request
requestSchema.methods.isUpvotedBy = function(userId) {
  return this.upvotes.some(upvote => upvote.user.toString() === userId.toString());
};

// Method to check if request is expired
requestSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

module.exports = mongoose.model('Request', requestSchema);