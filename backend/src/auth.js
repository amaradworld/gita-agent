// ============================================================
// GITA GYAN — AUTHENTICATION (JWT + Email OTP)
// ============================================================

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
  findUserByEmail,
  findUserById,
  createUser,
  createOtp,
  verifyOtp,
} from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'gita-gyan-dev-secret-change-in-production';
const JWT_EXPIRES_IN = '30d';

export function generateToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Auth middleware — extracts userId from Bearer token
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.userId = payload.sub;
  next();
}

// Optional auth — extracts userId if token present, but doesn't require it
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const payload = verifyToken(authHeader.slice(7));
    if (payload) req.userId = payload.sub;
  }
  next();
}

// Generate 6-digit OTP
function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

// ─── SEND OTP (simulated — logs to console in dev) ───────
async function sendOtp(email, otp) {
  // In production, integrate with email service (Resend, SendGrid, etc.)
  console.log(`[AUTH] OTP for ${email}: ${otp}`);
  // TODO: Replace with real email sending
  return true;
}

// ─── SIGNUP ──────────────────────────────────────────────
export async function signup(email, password, displayName) {
  if (!email || !password) {
    throw new Error('Email and password required');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  // Check if user exists
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error('Email already registered');
  }

  // Hash password
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

  // Create user
  const user = await createUser({
    email,
    passwordHash,
    displayName: displayName || email.split('@')[0],
  });

  // Generate and send OTP
  const otp = generateOtp();
  await createOtp(user.id, otp, 'verify_email');
  await sendOtp(email, otp);

  // Generate token
  const token = generateToken(user.id);

  return {
    user: { id: user.id, email: user.email, displayName: user.display_name },
    token,
    message: 'Account created. Check email for verification code.',
  };
}

// ─── LOGIN ───────────────────────────────────────────────
export async function login(email, password) {
  if (!email || !password) {
    throw new Error('Email and password required');
  }

  const user = await findUserByEmail(email);
  if (!user || !user.password_hash) {
    throw new Error('Invalid email or password');
  }

  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  if (user.password_hash !== passwordHash) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      isPremium: user.is_premium,
      language: user.language,
    },
    token,
  };
}

// ─── REQUEST OTP (for passwordless login) ────────────────
export async function requestOtp(email) {
  const user = await findUserByEmail(email);
  if (!user) {
    // Don't reveal if user exists
    return { message: 'If an account exists, an OTP has been sent.' };
  }

  const otp = generateOtp();
  await createOtp(user.id, otp, 'login');
  await sendOtp(email, otp);

  return { message: 'If an account exists, an OTP has been sent.' };
}

// ─── VERIFY OTP & LOGIN ─────────────────────────────────
export async function verifyOtpLogin(email, otp) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid OTP');
  }

  const valid = await verifyOtp(user.id, otp, 'login');
  if (!valid) {
    throw new Error('Invalid or expired OTP');
  }

  const token = generateToken(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      isPremium: user.is_premium,
      language: user.language,
    },
    token,
  };
}

// ─── GET CURRENT USER ───────────────────────────────────
export async function getCurrentUser(userId) {
  const user = await findUserById(userId);
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    language: user.language,
    isPremium: user.is_premium,
    premiumExpiresAt: user.premium_expires_at,
    createdAt: user.created_at,
  };
}
