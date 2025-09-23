const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Plan = require('../models/Plan');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

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

// @desc    Create payment intent
// @route   POST /api/plans/create-payment-intent
// @access  Private
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { planId } = req.body;

    const plan = await Plan.findById(planId);
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

      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(req.user.id, {
        stripeCustomerId: customer.id
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan.price * 100, // Convert to cents
      currency: plan.currency.toLowerCase(),
      customer: customer.id,
      metadata: {
        planId: plan._id.toString(),
        userId: req.user.id,
        planName: plan.name
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating payment intent'
    });
  }
});

// @desc    Confirm payment and update user plan
// @route   POST /api/plans/confirm-payment
// @access  Private
router.post('/confirm-payment', protect, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    const planId = paymentIntent.metadata.planId;
    const plan = await Plan.findById(planId);

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
        status: 'pending' // Set to pending for admin approval
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

    const plan = await Plan.findById(planId);
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

module.exports = router;