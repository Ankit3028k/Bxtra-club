const express = require('express');
const Request = require('../models/Request');
const { protect } = require('../middleware/auth');
const { validateRequest, validateComment, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all requests
// @route   GET /api/requests
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { category, status, urgency } = req.query;

    let query = { isPublic: true, expiresAt: { $gt: new Date() } };

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (urgency) {
      query.urgency = urgency;
    }

    const requests = await Request.find(query)
      .populate('author', 'name startup city avatar')
      .populate('replies.user', 'name avatar')
      .sort({ urgency: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Request.countDocuments(query);

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      requests
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting requests'
    });
  }
});

// @desc    Get single request
// @route   GET /api/requests/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('author', 'name startup city avatar')
      .populate('replies.user', 'name startup avatar');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.status(200).json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting request'
    });
  }
});

// @desc    Create new request
// @route   POST /api/requests
// @access  Private
router.post('/', protect, validateRequest, handleValidationErrors, async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      tags,
      urgency,
      budget,
      location
    } = req.body;

    const request = await Request.create({
      author: req.user.id,
      title,
      content,
      category,
      tags: tags || [],
      urgency: urgency || 'medium',
      budget,
      location
    });

    const populatedRequest = await Request.findById(request._id)
      .populate('author', 'name startup city avatar');

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      request: populatedRequest
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating request'
    });
  }
});

// @desc    Update request
// @route   PUT /api/requests/:id
// @access  Private
router.put('/:id', protect, validateRequest, handleValidationErrors, async (req, res) => {
  try {
    let request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if user owns the request
    if (request.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }

    const {
      title,
      content,
      category,
      tags,
      urgency,
      budget,
      location,
      status
    } = req.body;

    request = await Request.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        category,
        tags,
        urgency,
        budget,
        location,
        status
      },
      { new: true, runValidators: true }
    ).populate('author', 'name startup city avatar');

    res.status(200).json({
      success: true,
      message: 'Request updated successfully',
      request
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating request'
    });
  }
});

// @desc    Delete request
// @route   DELETE /api/requests/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if user owns the request
    if (request.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this request'
      });
    }

    await Request.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting request'
    });
  }
});

// @desc    Upvote/Remove upvote from request
// @route   PUT /api/requests/:id/upvote
// @access  Private
router.put('/:id/upvote', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const isUpvoted = request.isUpvotedBy(req.user.id);

    if (isUpvoted) {
      // Remove upvote
      request.upvotes = request.upvotes.filter(
        upvote => upvote.user.toString() !== req.user.id
      );
    } else {
      // Add upvote
      request.upvotes.push({ user: req.user.id });
    }

    await request.save();

    res.status(200).json({
      success: true,
      message: isUpvoted ? 'Upvote removed' : 'Request upvoted',
      upvoted: !isUpvoted,
      upvoteCount: request.upvoteCount
    });
  } catch (error) {
    console.error('Upvote request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error upvoting request'
    });
  }
});

// @desc    Add reply to request
// @route   POST /api/requests/:id/replies
// @access  Private
router.post('/:id/replies', protect, validateComment, handleValidationErrors, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const { content, isPrivate } = req.body;

    request.replies.push({
      user: req.user.id,
      content,
      isPrivate: isPrivate || false
    });

    await request.save();

    const updatedRequest = await Request.findById(req.params.id)
      .populate('replies.user', 'name avatar');

    const newReply = updatedRequest.replies[updatedRequest.replies.length - 1];

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      reply: newReply,
      replyCount: request.replyCount
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding reply'
    });
  }
});

// @desc    Delete reply
// @route   DELETE /api/requests/:id/replies/:replyId
// @access  Private
router.delete('/:id/replies/:replyId', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const reply = request.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }

    // Check if user owns the reply or the request
    if (reply.user.toString() !== req.user.id && request.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this reply'
      });
    }

    reply.remove();
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Reply deleted successfully',
      replyCount: request.replyCount
    });
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting reply'
    });
  }
});

// @desc    Get user's requests
// @route   GET /api/requests/my/requests
// @access  Private
router.get('/my/requests', protect, async (req, res) => {
  try {
    const requests = await Request.find({ author: req.user.id })
      .populate('author', 'name startup city avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user requests'
    });
  }
});

// @desc    Search requests
// @route   GET /api/requests/search
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { q, category, urgency, city, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isPublic: true, expiresAt: { $gt: new Date() } };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (urgency) {
      query.urgency = urgency;
    }

    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    const requests = await Request.find(query)
      .populate('author', 'name startup city avatar')
      .sort({ urgency: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Request.countDocuments(query);

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      requests
    });
  } catch (error) {
    console.error('Search requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching requests'
    });
  }
});

module.exports = router;