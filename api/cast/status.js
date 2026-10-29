// Vercel Serverless Function: /api/cast/status
let defaultSession = {
  active: false,
  caster: null,
  target: null,
  status: 'idle',
  inviteId: null,
  lastUpdate: Date.now(),
  video: { id: null, title: '', channel: '', avatar: '', currentTime: 0, duration: 0, isPlaying: false },
  reaction: null
};

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({ success: true, session: global.__activeCastSession || defaultSession });
};
