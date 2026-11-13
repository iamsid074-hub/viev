// Vercel Serverless Function: /api/push/status
const storage = require('./storage');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');

  const store = storage.getStore();

  return res.status(200).json({
    success: true,
    subscribers: {
      digi: store.digi.length,
      user: store.user.length,
      total: store.digi.length + store.user.length
    }
  });
};
