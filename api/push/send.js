// Vercel Serverless Function: /api/push/send
const webpush = require('web-push');
const vapid = require('./vapid');
const storage = require('./storage');

webpush.setVapidDetails(
  vapid.mailto,
  vapid.publicKey,
  vapid.privateKey
);

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) {}
  }

  const targetRole = body.targetRole || 'digi';
  const title = body.title || 'Digi Viev ❤️';
  const messageBody = body.body || 'A special update is waiting for you in VIEVS!';
  const icon = body.icon || 'assets/digi.png';
  const badge = body.badge || 'assets/digi.png';
  const data = body.data || { url: './index.html', action: 'open_note' };

  const payload = JSON.stringify({
    title,
    body: messageBody,
    icon,
    badge,
    tag: body.tag || ('viev-push-' + Date.now()),
    data
  });

  const subs = storage.getSubscriptions(targetRole);

  if (!subs || subs.length === 0) {
    return res.status(200).json({
      success: true,
      delivered: 0,
      total: 0,
      message: 'No active device subscriptions found for role: ' + targetRole + '. Phone needs to allow notifications once in VIEVS.'
    });
  }

  let deliveredCount = 0;
  const expiredEndpoints = [];

  const promises = subs.map(async (sub) => {
    try {
      await webpush.sendNotification(sub, payload);
      deliveredCount++;
    } catch (err) {
      console.warn('[Push] Error sending push to endpoint:', sub.endpoint, err.statusCode || err.message);
      // If subscription expired or gone (404 / 410)
      if (err.statusCode === 404 || err.statusCode === 410) {
        expiredEndpoints.push(sub.endpoint);
      }
    }
  });

  await Promise.all(promises);

  // Clean up expired subscriptions
  expiredEndpoints.forEach(ep => storage.removeSubscription(ep));

  return res.status(200).json({
    success: true,
    delivered: deliveredCount,
    total: subs.length,
    message: `Push delivered to ${deliveredCount} device(s)`
  });
};

