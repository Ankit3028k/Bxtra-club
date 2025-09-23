const express = require('express');
const Perk = require('../models/Perk');
const { protect, requirePlan } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all perks
// @route   GET /api/perks
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { 
      isActive: true,
      eligiblePlans: { $in: [req.user.plan] }
    };

    if (category) {
      query.category = category;
    }

    const perks = await Perk.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Perk.countDocuments(query);

    res.status(200).json({
      success: true,
      count: perks.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      perks
    });
  } catch (error) {
    console.error('Get perks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting perks'
    });
  }
});

// @desc    Get single perk
// @route   GET /api/perks/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const perk = await Perk.findById(req.params.id);

    if (!perk) {
      return res.status(404).json({
        success: false,
        message: 'Perk not found'
      });
    }

    // Check if user's plan is eligible
    if (!perk.eligiblePlans.includes(req.user.plan)) {
      return res.status(403).json({
        success: false,
        message: 'Your plan is not eligible for this perk',
        requiredPlans: perk.eligiblePlans
      });
    }

    res.status(200).json({
      success: true,
      perk
    });
  } catch (error) {
    console.error('Get perk error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting perk'
    });
  }
});

// @desc    Claim perk (track usage)
// @route   POST /api/perks/:id/claim
// @access  Private
router.post('/:id/claim', protect, async (req, res) => {
  try {
    const perk = await Perk.findById(req.params.id);

    if (!perk) {
      return res.status(404).json({
        success: false,
        message: 'Perk not found'
      });
    }

    // Check if user's plan is eligible
    if (!perk.eligiblePlans.includes(req.user.plan)) {
      return res.status(403).json({
        success: false,
        message: 'Your plan is not eligible for this perk',
        requiredPlans: perk.eligiblePlans
      });
    }

    // Check if perk is available
    if (!perk.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This perk is no longer available'
      });
    }

    // Increment usage count
    perk.usageCount += 1;
    await perk.save();

    res.status(200).json({
      success: true,
      message: 'Perk claimed successfully',
      perk: {
        id: perk._id,
        name: perk.name,
        company: perk.company,
        link: perk.link,
        code: perk.code,
        instructions: perk.instructions
      }
    });
  } catch (error) {
    console.error('Claim perk error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error claiming perk'
    });
  }
});

// @desc    Get perk categories
// @route   GET /api/perks/categories
// @access  Private
router.get('/categories', protect, async (req, res) => {
  try {
    const categories = await Perk.distinct('category', { 
      isActive: true,
      eligiblePlans: { $in: [req.user.plan] }
    });

    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting categories'
    });
  }
});

// @desc    Search perks
// @route   GET /api/perks/search
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { q, category, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = { 
      isActive: true,
      eligiblePlans: { $in: [req.user.plan] }
    };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    if (category) {
      query.category = category;
    }

    const perks = await Perk.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Perk.countDocuments(query);

    res.status(200).json({
      success: true,
      count: perks.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      perks
    });
  } catch (error) {
    console.error('Search perks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching perks'
    });
  }
});

module.exports = router;