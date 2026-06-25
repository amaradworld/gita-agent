// ============================================================
// GITA GYAN — PUSH NOTIFICATION ROUTES
// ============================================================

import express from 'express';
const router = express.Router();
import { requireAuth } from '../auth.js';
import { savePushSubscription, getAllPushSubscriptions } from '../db.js';

let webPush = null;
try {
  webPush = (await import('web-push')).default;
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webPush.setVapidDetails(
      'mailto:notifications@gitagyan.app',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  }
} catch {
  console.log('[NOTIFICATIONS] web-push not available, notifications disabled');
}

// ─── SUBSCRIBE ───────────────────────────────────────────
router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    const { endpoint, p256dh, auth } = req.body;
    if (!endpoint || !p256dh || !auth) {
      return res.status(400).json({ error: 'Invalid subscription' });
    }
    await savePushSubscription(req.userId, { endpoint, p256dh, auth });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

// ─── SEND DAILY VERSE NOTIFICATION (cron-triggered) ──────
router.post('/send-daily', async (req, res) => {
  // This would be called by a cron job (e.g., Vercel Cron, GitHub Actions)
  // In production, use a proper queue system
  if (!webPush) {
    return res.json({ message: 'Notifications not configured' });
  }

  try {
    const subscriptions = await getAllPushSubscriptions();
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);

    const verses = [
      { chapter: 2, verse: 47, text: 'You have the right to perform your prescribed duty, but you are not entitled to the fruits of action.' },
      { chapter: 4, verse: 7, text: 'Whenever there is a decline in righteousness, I manifest myself.' },
      { chapter: 18, verse: 66, text: 'Abandon all varieties of dharma and surrender unto Me. I shall deliver you from all sinful reactions.' },
    ];

    const verse = verses[dayOfYear % verses.length];
    const title = '📿 Daily Gita Verse';
    const body = `Ch. ${verse.chapter}, V. ${verse.verse}: "${verse.text}"`;

    let sent = 0;
    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title, body, icon: '/icon-192.png', badge: '/badge-72.png' })
        );
        sent++;
      } catch (err) {
        // Subscription expired or invalid — remove it
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Could delete from DB here
        }
      }
    }

    res.json({ sent, total: subscriptions.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

// ─── GET VAPID PUBLIC KEY ────────────────────────────────
router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || null });
});

export default router;