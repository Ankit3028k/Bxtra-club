const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Plan = require('../models/Plan');
const User = require('../models/User');
const { protect, allowPendingPayment } = require('../middleware/auth');
// const asyncHandler = require('../middleware/async'); // Assuming you create this file

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

const router = express.Router();

// @desc    Get all plans
// @route   GET /api/plans
// @access  Public
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true })
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      plans
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting plans'
    });
  }
});

// @desc    Get single plan
// @route   GET /api/plans/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.status(200).json({
      success: true,
      plan
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting plan'
    });
  }
});

// @desc    Create Razorpay order
// @route   POST /api/plans/create-payment-intent
// @access  Private
router.post('/create-payment-intent', allowPendingPayment, async (req, res) => {
  try {
    const { planId } = req.body;

    // Find plan by name, case-insensitively
    const plan = await Plan.findOne({ name: { $regex: new RegExp(`^${planId}$`, 'i') } });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: plan.price * 100, // in smallest currency unit
      currency: plan.currency.toUpperCase(), // Razorpay expects uppercase
      receipt: `receipt_${new Date().getTime()}`,
      payment_capture: 1 // auto capture
    });

    res.status(200).json({
      success: true,
      orderId: order.id,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating order'
    });
  }
});

// @desc    Confirm payment and update user plan
// @route   POST /api/plans/confirm-payment
// @access  Private
router.post('/confirm-payment', protect, async (req, res) => {
  try {
    const { paymentId, orderId, signature, planId } = req.body;

    // Verify the payment signature
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)
                                   .update(orderId + "|" + paymentId)
                                   .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    const plan = await Plan.findOne({ name: { $regex: new RegExp(`^${planId}`, 'i') } });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Update user plan and subscription status
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        plan: plan.name,
        subscriptionStatus: 'active',
        status: 'approved' // Set to approved after successful payment
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Payment successful! Your account is now pending approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        status: user.status,
        subscriptionStatus: user.subscriptionStatus
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error confirming payment'
    });
  }
});

// @desc    Create subscription
// @route   POST /api/plans/create-subscription
// @access  Private
router.post('/create-subscription', protect, async (req, res) => {
  try {
    const { planId, paymentMethodId } = req.body;

    const plan = await Plan.findOne({ name: { $regex: new RegExp(`^${planId}`, 'i') } });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Create or retrieve Stripe customer
    let customer;
    if (req.user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(req.user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: {
          userId: req.user.id
        }
      });

      await User.findByIdAndUpdate(req.user.id, {
        stripeCustomerId: customer.id
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id
    });

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: plan.stripePriceId }],
      default_payment_method: paymentMethodId,
      metadata: {
        userId: req.user.id,
        planId: plan._id.toString()
      }
    });

    // Update user with subscription info
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        plan: plan.name,
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        status: 'pending'
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Subscription created successfully!',
      subscription: {
        id: subscription.id,
        status: subscription.status
      },
      user: {
        id: user._id,
        plan: user.plan,
        status: user.status,
        subscriptionStatus: user.subscriptionStatus
      }
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating subscription'
    });
  }
});

// @desc    Cancel subscription
// @route   DELETE /api/plans/subscription
// @access  Private
router.delete('/subscription', protect, async (req, res) => {
  try {
    if (!req.user.subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(
      req.user.subscriptionId,
      { cancel_at_period_end: true }
    );

    // Update user subscription status
    await User.findByIdAndUpdate(req.user.id, {
      subscriptionStatus: 'cancelled'
    });

    res.status(200).json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: subscription.current_period_end
      }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling subscription'
    });
  }
});

// @desc    Get user's subscription info
// @route   GET /api/plans/subscription
// @access  Private
router.get('/subscription', protect, async (req, res) => {
  try {
    if (!req.user.subscriptionId) {
      return res.status(200).json({
        success: true,
        subscription: null,
        message: 'No active subscription'
      });
    }

    const subscription = await stripe.subscriptions.retrieve(req.user.subscriptionId);

    res.status(200).json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting subscription'
    });
  }
});

// @desc    Skip plan selection (choose free plan)
// @route   POST /api/plans/skip
// @access  Private
router.post('/skip', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // If user already has a plan, return error
    if (user.plan && user.plan.toLowerCase() !== 'free') {
      return res.status(400).json({
        success: false,
        message: 'User already has a plan selected'
      });
    }

    // Update user to Free plan and set subscriptionStatus to active.
    // Also update status to 'approved' if it was 'pending' for the free plan selection.
    user.plan = 'Free';
    user.subscriptionStatus = 'active';
    
    // Bypass approval requirement for initial plan selection
    // if (user.status === 'pending') {
    //   user.status = 'approved';
    // }
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Free plan selected successfully',
      user: {
        id: user._id,
        plan: user.plan,
        name: user.name,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus
      }
    });
  } catch (error) {
    console.error('Skip plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error skipping plan selection'
    });
  }
});

module.exports = router;