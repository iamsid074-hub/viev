// Vercel Serverless Function: /api/cast/action
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    let payload = req.body || {};
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch (_) {}
    }
    const action = payload.action;

    if (!global.__activeCastSession) {
      global.__activeCastSession = {
        active: false,
        caster: null,
        target: null,
        status: 'idle',
        inviteId: null,
        lastUpdate: Date.now(),
        video: { id: null, title: '', channel: '', avatar: '', currentTime: 0, duration: 0, isPlaying: false },
        reaction: null
      };
    }

    if (action === 'invite') {
      global.__activeCastSession = {
        active: true,
        caster: payload.caster,
        target: payload.target,
        status: 'invited',
        inviteId: 'cast_' + Date.now(),
        lastUpdate: Date.now(),
        video: payload.video || { id: null, title: '', channel: '', avatar: '', currentTime: 0, duration: 0, isPlaying: false },
        reaction: null
      };
    } else if (action === 'respond') {
      if (payload.accepted) {
        global.__activeCastSession.status = 'accepted';
        global.__activeCastSession.lastUpdate = Date.now();
      } else {
        global.__activeCastSession.status = 'declined';
        global.__activeCastSession.active = false;
        global.__activeCastSession.lastUpdate = Date.now();
      }
    } else if (action === 'sync') {
      if (global.__activeCastSession.active) {
        global.__activeCastSession.video = Object.assign(global.__activeCastSession.video || {}, payload.video || {});
        global.__activeCastSession.lastUpdate = Date.now();
      }
    } else if (action === 'reaction') {
      global.__activeCastSession.reaction = payload.reaction;
    } else if (action === 'end') {
      global.__activeCastSession.status = 'ended';
      global.__activeCastSession.active = false;
      global.__activeCastSession.lastUpdate = Date.now();
    }

    return res.status(200).json({ success: true, session: global.__activeCastSession });
  }

  res.status(200).json({ success: true, session: global.__activeCastSession || {} });
};
