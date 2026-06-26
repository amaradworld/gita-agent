/* ─── Push Notifications Utility ─── */
const API = '';

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function subscribeToPush() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;

    const registration = await navigator.serviceWorker.ready;

    // Get VAPID public key from server
    const res = await fetch(`${API}/api/notifications/vapid-public-key`);
    if (!res.ok) return null;
    const { publicKey } = await res.json();

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    // Send subscription to server
    const userId = localStorage.getItem('gita_user_id') || 'anonymous';
    await fetch(`${API}/api/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, subscription: subscription.toJSON() }),
    });

    return subscription;
  } catch (err) {
    console.error('Push subscription failed:', err);
    return null;
  }
}

export async function unsubscribeFromPush() {
  try {
    if (!('serviceWorker' in navigator)) return;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }
  } catch {}
}

export function isSubscribed() {
  return localStorage.getItem('gita_push_enabled') === '1';
}

export function setSubscribed(val) {
  localStorage.setItem('gita_push_enabled', val ? '1' : '0');
}

export async function setupDailyNotifications() {
  const granted = await requestNotificationPermission();
  if (!granted) return false;

  const subscription = await subscribeToPush();
  if (subscription) {
    setSubscribed(true);
    return true;
  }
  return false;
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
