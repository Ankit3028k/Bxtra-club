const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Post = require('../models/Post');
const Event = require('../models/Event');
const Request = require('../models/Request');
const { adminProtect } = require('../middleware/auth');
const { validateLogin, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Generate JWT Token for admin
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register a new admin
// @route   POST /api/admin/register
// @access  Public (Should be protected in production)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if admin already exists
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create new admin
    admin = new Admin({
      name,
      email,
      password,
      role,
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Check password
    const isPasswordMatch = await admin.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id);

    // Set cookie
    const cookieOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res.status(200)
       .cookie('adminToken', token, cookieOptions)
       .json({
         success: true,
         message: 'Admin login successful',
         token,
         admin: {
           id: admin._id,
           name: admin.name,
           email: admin.email,
           role: admin.role,
           permissions: admin.permissions
         }
       });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
});

// @desc    Admin logout
// @route   POST /api/admin/logout
// @access  Private
router.post('/logout', (req, res) => {
  res.cookie('adminToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Admin logged out successfully'
  });
});

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private
router.get('/stats', adminProtect, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingUsers = await User.countDocuments({ status: 'pending' });
    const approvedUsers = await User.countDocuments({ status: 'approved' });
    const totalPosts = await Post.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalRequests = await Request.countDocuments();

    // Get user growth data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get plan distribution
    const planStats = await User.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);

    // Get city distribution (top 10)
    const cityStats = await User.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          pending: pendingUsers,
          approved: approvedUsers,
          newThisMonth: newUsers
        },
        content: {
          posts: totalPosts,
          events: totalEvents,
          requests: totalRequests
        },
        planDistribution: planStats,
        topCities: cityStats
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting admin stats'
    });
  }
});

// @desc    Get pending users
// @route   GET /api/admin/users/pending
// @access  Private
router.get('/users/pending', adminProtect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const pendingUsers = await User.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      count: pendingUsers.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users: pendingUsers
    });
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting pending users'
    });
  }
});

// @desc    Approve user
// @route   PUT /api/admin/users/:id/approve
// @access  Private
router.put('/users/:id/approve', adminProtect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'User is not pending approval'
      });
    }

    user.status = 'approved';
    await user.save();

    // TODO: Send approval email to user

    res.status(200).json({
      success: true,
      message: 'User approved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving user'
    });
  }
});

// @desc    Reject user
// @route   PUT /api/admin/users/:id/reject
// @access  Private
router.put('/users/:id/reject', adminProtect, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'User is not pending approval'
      });
    }

    user.status = 'rejected';
    await user.save();

    // TODO: Send rejection email to user with reason

    res.status(200).json({
      success: true,
      message: 'User rejected successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting user'
    });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private
router.get('/users', adminProtect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status, plan, city, search } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (plan) {
      query.plan = plan;
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { startup: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting users'
    });
  }
});

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private
router.get('/users/:id', adminProtect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('connections', 'name startup city')
      .populate('connectionRequests.from', 'name startup');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's posts, events, and requests count
    const postsCount = await Post.countDocuments({ author: user._id });
    const eventsCount = await Event.countDocuments({ organizer: user._id });
    const requestsCount = await Request.countDocuments({ author: user._id });

    res.status(200).json({
      success: true,
      user,
      stats: {
        posts: postsCount,
        events: eventsCount,
        requests: requestsCount
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user details'
    });
  }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private
router.put('/users/:id', adminProtect, async (req, res) => {
  try {
    const { status, plan } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status, plan },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user'
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private
router.delete('/users/:id', adminProtect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user's content
    await Post.deleteMany({ author: user._id });
    await Event.deleteMany({ organizer: user._id });
    await Request.deleteMany({ author: user._id });

    // Remove user from other users' connections
    await User.updateMany(
      { connections: user._id },
      { $pull: { connections: user._id } }
    );

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User and associated content deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
});

// @desc    Get all posts for moderation
// @route   GET /api/admin/posts
// @access  Private
router.get('/posts', adminProtect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'name startup email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      posts
    });
  } catch (error) {
    console.error('Get admin posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting posts'
    });
  }
});

// @desc    Delete post
// @route   DELETE /api/admin/posts/:id
// @access  Private
router.delete('/posts/:id', adminProtect, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting post'
    });
  }
});

module.exports = router;