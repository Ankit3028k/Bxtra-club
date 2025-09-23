const { body, validationResult } = require('express-validator');

// Handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
exports.validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('startup')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Startup name must be between 2 and 100 characters'),
  body('role')
    .isIn(['CEO', 'CTO', 'CFO', 'Co-Founder', 'Founder', 'Other'])
    .withMessage('Please select a valid role'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters')
];

// User login validation
exports.validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Post validation
exports.validatePost = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Post content must be between 1 and 2000 characters'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Please enter a valid image URL'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag must be 30 characters or less')
];

// Event validation
exports.validateEvent = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Event title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Event description must be between 10 and 2000 characters'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('date')
    .isISO8601()
    .withMessage('Please enter a valid date')
    /*.custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    })*/,
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please enter time in HH:MM format'),
  body('maxAttendees')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Maximum attendees must be between 1 and 1000')
];

// Request validation
exports.validateRequest = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Request title must be between 5 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Request content must be between 10 and 2000 characters'),
  body('category')
    .isIn(['co-founder', 'technical', 'marketing', 'funding', 'legal', 'mentorship', 'partnership', 'hiring', 'other'])
    .withMessage('Please select a valid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

// Comment validation
exports.validateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
];

// Profile update validation
exports.validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Please enter a valid website URL'),
  body('linkedin')
    .optional()
    .isURL()
    .withMessage('Please enter a valid LinkedIn URL'),
  body('twitter')
    .optional()
    .isURL()
    .withMessage('Please enter a valid Twitter URL')
];