const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validateProfileUpdate, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('connections', 'name startup city avatar')
      .populate('connectionRequests.from', 'name startup avatar');

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting profile'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
router.put('/profile', protect, validateProfileUpdate, handleValidationErrors, async (req, res) => {
  try {
    const {
      name,
      bio,
      website,
      linkedin,
      twitter,
      avatar,
      city,
      startup
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        bio,
        website,
        linkedin,
        twitter,
        avatar,
        city,
        startup
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// @desc    Get suggested connections
// @route   GET /api/user/suggestions
// @access  Private
router.get('/suggestions', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const limit = parseInt(req.query.limit) || 10;

    // Find users in the same city or with similar roles, excluding current connections
    const suggestions = await User.find({
      _id: { 
        $ne: req.user.id,
        $nin: currentUser.connections
      },
      status: 'approved',
      $or: [
        { city: currentUser.city },
        { role: currentUser.role }
      ]
    })
    .select('name startup role city avatar connectionCount')
    .limit(limit);

    res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting suggestions'
    });
  }
});

// @desc    Send connection request
// @route   POST /api/user/connect/:id
// @access  Private
router.post('/connect/:id', protect, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot connect to yourself'
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentUser = await User.findById(req.user.id);

    // Check if already connected
    if (currentUser.connections.includes(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Already connected to this user'
      });
    }

    // Check if request already sent
    const existingRequest = targetUser.connectionRequests.find(
      req => req.from.toString() === currentUser._id.toString()
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Connection request already sent'
      });
    }

    // Add connection request
    targetUser.connectionRequests.push({
      from: currentUser._id,
      status: 'pending'
    });

    await targetUser.save();

    res.status(200).json({
      success: true,
      message: 'Connection request sent successfully'
    });
  } catch (error) {
    console.error('Send connection request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending connection request'
    });
  }
});

// @desc    Accept connection request
// @route   PUT /api/user/connect/:id/accept
// @access  Private
router.put('/connect/:id/accept', protect, async (req, res) => {
  try {
    const fromUserId = req.params.id;
    const currentUser = await User.findById(req.user.id);

    // Find the connection request
    const requestIndex = currentUser.connectionRequests.findIndex(
      req => req.from.toString() === fromUserId && req.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }

    // Update request status
    currentUser.connectionRequests[requestIndex].status = 'accepted';

    // Add to connections for both users
    currentUser.connections.push(fromUserId);
    
    const fromUser = await User.findById(fromUserId);
    fromUser.connections.push(req.user.id);

    await currentUser.save();
    await fromUser.save();

    res.status(200).json({
      success: true,
      message: 'Connection request accepted'
    });
  } catch (error) {
    console.error('Accept connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error accepting connection'
    });
  }
});

// @desc    Reject connection request
// @route   PUT /api/user/connect/:id/reject
// @access  Private
router.put('/connect/:id/reject', protect, async (req, res) => {
  try {
    const fromUserId = req.params.id;
    const currentUser = await User.findById(req.user.id);

    // Find and update the connection request
    const requestIndex = currentUser.connectionRequests.findIndex(
      req => req.from.toString() === fromUserId && req.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Connection request not found'
      });
    }

    currentUser.connectionRequests[requestIndex].status = 'rejected';
    await currentUser.save();

    res.status(200).json({
      success: true,
      message: 'Connection request rejected'
    });
  } catch (error) {
    console.error('Reject connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting connection'
    });
  }
});

// @desc    Get user connections
// @route   GET /api/user/connections
// @access  Private
router.get('/connections', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('connections', 'name startup role city avatar connectionCount');

    res.status(200).json({
      success: true,
      count: user.connections.length,
      connections: user.connections
    });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting connections'
    });
  }
});

// @desc    Remove connection
// @route   DELETE /api/user/connections/:id
// @access  Private
router.delete('/connections/:id', protect, async (req, res) => {
  try {
    const connectionId = req.params.id;
    const currentUser = await User.findById(req.user.id);

    if (!currentUser.connections.includes(connectionId)) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    // Remove from both users' connections
    currentUser.connections = currentUser.connections.filter(
      conn => conn.toString() !== connectionId
    );

    const otherUser = await User.findById(connectionId);
    otherUser.connections = otherUser.connections.filter(
      conn => conn.toString() !== req.user.id
    );

    await currentUser.save();
    await otherUser.save();

    res.status(200).json({
      success: true,
      message: 'Connection removed successfully'
    });
  } catch (error) {
    console.error('Remove connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing connection'
    });
  }
});

// @desc    Search users
// @route   GET /api/user/search
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { q, city, role, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { 
      _id: { $ne: req.user.id },
      status: 'approved'
    };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { startup: { $regex: q, $options: 'i' } }
      ];
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('name startup role city avatar connectionCount')
      .sort({ connectionCount: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching users'
    });
  }
});

// @desc    Get user by ID
// @route   GET /api/user/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-email -password')
      .populate('connections', 'name startup city avatar');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current user is connected to this user
    const currentUser = await User.findById(req.user.id);
    const isConnected = currentUser.connections.includes(user._id);
    
    // Check if there's a pending connection request
    const hasPendingRequest = user.connectionRequests.some(
      req => req.from.toString() === currentUser._id.toString() && req.status === 'pending'
    );

    res.status(200).json({
      success: true,
      user,
      relationship: {
        isConnected,
        hasPendingRequest
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user'
    });
  }
});

module.exports = router;