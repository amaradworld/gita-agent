// ============================================================
// GITA GYAN — AUTH ROUTES
// ============================================================

import express from 'express';
const router = express.Router();
import { requireAuth, signup, login, requestOtp, verifyOtpLogin, getCurrentUser } from '../auth.js';
import { updateUser } from '../db.js';

// ─── SIGNUP ──────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    const result = await signup(email, password, displayName);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── LOGIN ───────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── REQUEST OTP (passwordless) ──────────────────────────
router.post('/request-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await requestOtp(email);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── VERIFY OTP ──────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyOtpLogin(email, otp);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── GET CURRENT USER ───────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await getCurrentUser(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ─── UPDATE PROFILE ──────────────────────────────────────
router.put('/me', requireAuth, async (req, res) => {
  try {
    const { displayName, language } = req.body;
    const updates = {};
    if (displayName) updates.display_name = displayName.slice(0, 100);
    if (language) updates.language = language;
    const user = await updateUser(req.userId, updates);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;