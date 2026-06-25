// ============================================================
// GITA GYAN — PAYMENT ROUTES (Razorpay)
// ============================================================

import express from 'express';
const router = express.Router();
import crypto from 'crypto';
import { requireAuth } from '../auth.js';
import {
  createPayment,
  capturePayment,
  getUserPayments,
} from '../db.js';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://gita-agent.vercel.app';

// ─── PLANS ───────────────────────────────────────────────

const PLANS = {
  premium_monthly: {
    id: 'premium_monthly',
    name: 'Gita Gyan Premium (Monthly)',
    amount: 14900, // ₹149 in paise
    currency: 'INR',
    interval: 'monthly',
    description: 'Unlimited AI chat, learning paths, meditation, journal',
  },
  premium_yearly: {
    id: 'premium_yearly',
    name: 'Gita Gyan Premium (Yearly)',
    amount: 149900, // ₹1,499 in paise
    currency: 'INR',
    interval: 'yearly',
    description: 'Unlimited AI chat, learning paths, meditation, journal — save 17%',
  },
  family_monthly: {
    id: 'family_monthly',
    name: 'Gita Gyan Family (Monthly)',
    amount: 29900, // ₹299 in paise
    currency: 'INR',
    interval: 'monthly',
    description: 'Up to 5 family members, all premium features',
  },
};

// ─── GET PLANS ───────────────────────────────────────────
router.get('/plans', (req, res) => {
  res.json({ plans: Object.values(PLANS) });
});

// ─── CREATE ORDER ────────────────────────────────────────
router.post('/create-order', requireAuth, async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // If Razorpay configured, create real order
    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
      const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: plan.amount,
          currency: plan.currency,
          receipt: `gita_${req.userId.slice(0, 8)}_${Date.now()}`,
          notes: { userId: req.userId, planId },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('Razorpay order error:', err);
        return res.status(500).json({ error: 'Failed to create payment order' });
      }

      const order = await response.json();

      // Save payment record
      await createPayment(req.userId, {
        razorpayOrderId: order.id,
        amount: plan.amount,
        plan: planId,
      });

      return res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: RAZORPAY_KEY_ID,
        plan,
      });
    }

    // Demo mode — simulate order creation
    const demoOrderId = `order_demo_${Date.now()}`;
    await createPayment(req.userId, {
      razorpayOrderId: demoOrderId,
      amount: plan.amount,
      plan: planId,
    });

    res.json({
      orderId: demoOrderId,
      amount: plan.amount,
      currency: plan.currency,
      keyId: 'demo_key',
      plan,
      demo: true,
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// ─── VERIFY PAYMENT ─────────────────────────────────────
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (RAZORPAY_KEY_SECRET && razorpaySignature) {
      // Verify signature
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSig = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSig !== razorpaySignature) {
        return res.status(400).json({ error: 'Invalid payment signature' });
      }
    }

    // Capture payment
    const payment = await capturePayment(razorpayOrderId, {
      razorpayPaymentId,
      status: 'captured',
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      success: true,
      message: 'Payment verified! Premium activated.',
      plan: payment.plan,
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// ─── RAZORPAY WEBHOOK ───────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body.toString();

    if (RAZORPAY_KEY_SECRET && signature) {
      const expectedSig = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSig !== signature) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    const event = JSON.parse(body);

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      await capturePayment(orderId, {
        razorpayPaymentId: payment.id,
        status: 'captured',
      });
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ─── PAYMENT HISTORY ────────────────────────────────────
router.get('/history', requireAuth, async (req, res) => {
  try {
    const payments = await getUserPayments(req.userId);
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get payment history' });
  }
});

// ─── CHECK PREMIUM STATUS ───────────────────────────────
router.get('/status', requireAuth, async (req, res) => {
  try {
    const { findUserById } = await import('../db.js');
    const user = await findUserById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date();
    const isPremium = user.is_premium && user.premium_expires_at && new Date(user.premium_expires_at) > now;

    res.json({
      isPremium,
      expiresAt: user.premium_expires_at,
      plan: user.razorpay_subscription_id ? 'active' : null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check premium status' });
  }
});

export default router;
