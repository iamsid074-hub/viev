// Vercel Serverless Function: /api/youtube/my-feed
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300');

  const user = req.query?.user || req.query?.code || '1711';
  const isDigi = (user === '3009' || user === '3011' || user === 'digi');

  try {
    const data = require('../../js/youtube-data.js');
  } catch (e) {}

  res.status(200).json({
    success: true,
    account: isDigi ? 'DIGI (@avneetsaini7070)' : 'VIRAT PLAYS (@viratplaystdm)',
    role: isDigi ? 'digi' : 'user',
    user
  });
};
