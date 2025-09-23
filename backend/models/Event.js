const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City name cannot exceed 50 characters']
  },
  venue: {
    name: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  },
  duration: {
    type: Number, // in minutes
    default: 120
  },
  maxAttendees: {
    type: Number,
    required: [true, 'Maximum attendees is required'],
    min: [1, 'Maximum attendees must be at least 1'],
    max: [1000, 'Maximum attendees cannot exceed 1000']
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['attending', 'maybe', 'not_attending'],
      default: 'attending'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  image: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid image URL']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  category: {
    type: String,
    enum: ['networking', 'workshop', 'conference', 'meetup', 'pitch', 'social', 'other'],
    default: 'networking'
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'published'
  },
  requirements: {
    minPlan: {
      type: String,
      enum: ['Basic', 'Premium', 'Enterprise'],
      default: 'Basic'
    },
    approvalRequired: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function() {
  return this.attendees.filter(a => a.status === 'attending').length;
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  return this.maxAttendees - this.attendeeCount;
});

// Virtual for event status
eventSchema.virtual('eventStatus').get(function() {
  const now = new Date();
  const eventDateTime = new Date(this.date);
  
  if (this.status === 'cancelled') return 'cancelled';
  if (eventDateTime < now) return 'completed';
  if (eventDateTime.toDateString() === now.toDateString()) return 'today';
  return 'upcoming';
});

// Index for better query performance
eventSchema.index({ date: 1 });
eventSchema.index({ city: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ 'attendees.user': 1 });

// Method to check if user is attending
eventSchema.methods.isAttendedBy = function(userId) {
  return this.attendees.some(attendee => 
    attendee.user.toString() === userId.toString() && 
    attendee.status === 'attending'
  );
};

// Method to check if event is full
eventSchema.methods.isFull = function() {
  return this.attendeeCount >= this.maxAttendees;
};

module.exports = mongoose.model('Event', eventSchema);