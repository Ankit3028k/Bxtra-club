const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Plan = require('../models/Plan');

// General authentication middleware
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. User not found.'
        });
      }

      // Update last active
      user.updateLastActive();

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Admin authentication middleware
exports.adminProtect = async (req, res, next) => {
  try {
    let token;

    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.adminToken) {
      token = req.cookies.adminToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Admin access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get admin from token
      const admin = await Admin.findById(decoded.id).select('-password');
      
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin token is not valid. Admin not found.'
        });
      }

      req.admin = admin;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Admin token is not valid.'
      });
    }
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in admin authentication'
    });
  }
};

// Middleware to require a certain subscription plan
exports.requirePlan = (requiredPlanName) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // Admins can bypass plan checks
      if (user.role === 'admin' || user.role === 'super_admin') {
        return next();
      }

      const userPlanName = user.plan || 'Free';

      const [userPlan, requiredPlan] = await Promise.all([
        Plan.findOne({ name: { $regex: new RegExp(`^${userPlanName}$`, 'i') } }),
        Plan.findOne({ name: { $regex: new RegExp(`^${requiredPlanName}$`, 'i') } })
      ]);

      if (!userPlan) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Your plan could not be determined.'
        });
      }

      if (!requiredPlan) {
        return res.status(500).json({
          success: false,
          message: 'Server error: Required plan for this action is not configured.'
        });
      }

      if (userPlan.order >= requiredPlan.order) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Access denied. This feature requires a ${requiredPlan.name} plan or higher.`
      });
    } catch (error) {
      console.error('Require plan middleware error:', error);
      res.status(500).json({ success: false, message: 'Server error in plan authorization' });
    }
  };
};

// Middleware that allows pending users for payment routes
exports.allowPendingPayment = async (req, res, next) => {
  try {
    let token;

    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. User not found.'
        });
      }

      // Check if user is pending
      if (user.status !== 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Account is not pending.'
        });
      }

      // Update last active
      user.updateLastActive();

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false, 
        message: 'Token is not valid.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};