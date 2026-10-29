// Vercel Serverless Function: /api/cast/events
// Provides Server-Sent Events (SSE) streaming or latest status fallback
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const session = global.__activeCastSession || {
    active: false,
    caster: null,
    target: null,
    status: 'idle',
    inviteId: null,
    lastUpdate: Date.now(),
    video: { id: null, title: '', channel: '', avatar: '', currentTime: 0, duration: 0, isPlaying: false }
  };

  res.write(`event: init\ndata: ${JSON.stringify(session)}\n\n`);

  // In serverless environments, keep open briefly or finish
  const timer = setTimeout(() => {
    try { res.end(); } catch (_) {}
  }, 25000);

  req.on('close', () => {
    clearTimeout(timer);
  });
};
