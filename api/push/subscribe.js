// Vercel Serverless Function: /api/push/subscribe
const vapid = require('./vapid');
const storage = require('./storage');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Return public key on GET
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      publicKey: vapid.publicKey
    });
  }

  if (req.method === 'POST') {
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (_) {}
    }

    const { role, subscription } = body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Invalid push subscription object'
      });
    }

    storage.addSubscription(role || 'digi', subscription);
    const store = storage.getStore();

    return res.status(200).json({
      success: true,
      message: 'Subscription saved successfully',
      subscribersCount: {
        digi: store.digi.length,
        user: store.user.length
      }
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
};
