const express = require('express');
const Event = require('../models/Event');
const { protect, requirePlan } = require('../middleware/auth');
const { validateEvent, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all events
// @route   GET /api/events
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { city, category, upcoming } = req.query;

    let query = { isPublic: true, status: 'published' };

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .populate('organizer', 'name startup city avatar')
      .populate('attendees.user', 'name avatar')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting events'
    });
  }
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name startup city avatar')
      .populate('attendees.user', 'name startup avatar');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting event'
    });
  }
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Premium+)
router.post('/', protect, requirePlan('Premium'), validateEvent, handleValidationErrors, async (req, res) => {
  try {
    const {
      title,
      description,
      city,
      date,
      time,
      maxAttendees,
      image,
      tags,
      category,
      price,
      venue
    } = req.body;

    const event = await Event.create({
      title,
      description,
      organizer: req.user.id,
      city,
      date,
      time,
      maxAttendees,
      image,
      tags: tags || [],
      category: category || 'networking',
      price: price || 0,
      venue
    });

    // Automatically add organizer as attendee
    event.attendees.push({ user: req.user.id });
    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name startup city avatar');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: populatedEvent
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating event'
    });
  }
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
router.put('/:id', protect, validateEvent, handleValidationErrors, async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    const {
      title,
      description,
      city,
      date,
      time,
      maxAttendees,
      image,
      tags,
      category,
      price,
      venue
    } = req.body;

    event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        city,
        date,
        time,
        maxAttendees,
        image,
        tags,
        category,
        price,
        venue
      },
      { new: true, runValidators: true }
    ).populate('organizer', 'name startup city avatar');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating event'
    });
  }
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting event'
    });
  }
});

// @desc    Join/Leave event
// @route   PUT /api/events/:id/join
// @access  Private
router.put('/:id/join', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is full
    if (event.isFull()) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    // Check if user is already attending
    const isAttending = event.isAttendedBy(req.user.id);

    if (isAttending) {
      // Leave event
      event.attendees = event.attendees.filter(
        attendee => attendee.user.toString() !== req.user.id
      );
    } else {
      // Join event
      event.attendees.push({ user: req.user.id });
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: isAttending ? 'Left event successfully' : 'Joined event successfully',
      attending: !isAttending,
      attendeeCount: event.attendeeCount
    });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error joining event'
    });
  }
});

// @desc    Get user's events
// @route   GET /api/events/my/events
// @access  Private
router.get('/my/events', protect, async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    let query = {};

    if (type === 'organized') {
      query.organizer = req.user.id;
    } else if (type === 'attending') {
      query['attendees.user'] = req.user.id;
    } else {
      query.$or = [
        { organizer: req.user.id },
        { 'attendees.user': req.user.id }
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'name startup city avatar')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user events'
    });
  }
});

// @desc    Search events
// @route   GET /api/events/search
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { q, city, category, date, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isPublic: true, status: 'published' };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    const events = await Event.find(query)
      .populate('organizer', 'name startup city avatar')
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      events
    });
  } catch (error) {
    console.error('Search events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching events'
    });
  }
});

module.exports = router;