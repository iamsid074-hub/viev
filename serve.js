const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.webp': 'image/webp'
};

// In-memory cache for ultra-fast YouTube searches
const searchCache = new Map();

async function fetchYouTubeVideos(query, callback) {
  const cleanQ = (query || '').trim() || 'trending india';
  const cached = searchCache.get(cleanQ);
  if (cached && (Date.now() - cached.time < 1000 * 60 * 10)) {
    return callback(null, cached.data);
  }

  try {
    const res = await fetch('https://www.youtube.com/youtubei/v1/search?prettyPrint=false', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        context: {
          client: {
            hl: 'en',
            gl: 'IN',
            clientName: 'WEB',
            clientVersion: '2.20240101.00.00'
          }
        },
        query: cleanQ
      })
    });

    if (!res.ok) throw new Error('Innertube status ' + res.status);
    const data = await res.json();
    const videos = [];

    function extractVideos(obj) {
      if (!obj || typeof obj !== 'object') return;
      if (obj.videoRenderer) {
        const vr = obj.videoRenderer;
        if (vr.videoId && vr.title) {
          const title = vr.title?.runs?.map(r => r.text).join('') || vr.title?.simpleText || 'YouTube Video';
          const channel = vr.ownerText?.runs?.[0]?.text || vr.shortBylineText?.runs?.[0]?.text || 'Channel';
          const avatar = vr.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]?.url || '';
          const pub = vr.publishedTimeText?.simpleText || '';
          const views = vr.shortViewCountText?.simpleText || (vr.viewCountText?.simpleText ? vr.viewCountText.simpleText : '100K views');
          const duration = vr.lengthText?.simpleText || '♪ Video';
          const thumbs = vr.thumbnail?.thumbnails || [];
          const thumb = thumbs.length ? thumbs[thumbs.length - 1].url : `https://img.youtube.com/vi/${vr.videoId}/hqdefault.jpg`;
          const isVerified = Boolean(vr.ownerBadges);

          videos.push({
            id: vr.videoId,
            title,
            channel,
            views,
            pub,
            duration,
            thumb,
            avatar,
            isVerified
          });
        }
      }
      for (const k of Object.keys(obj)) {
        extractVideos(obj[k]);
      }
    }

    extractVideos(data);
    searchCache.set(cleanQ, { time: Date.now(), data: videos });
    callback(null, videos);
  } catch (err) {
    console.error('Innertube fetch error:', err.message);
    callback(err, []);
  }
}

const { exec } = require('child_process');

// In-memory cache for personal feed & search
let myFeedCache = null;
let lastFeedFetch = 0;

function getUserPersonalFeed(forceRefresh, callback) {
  if (typeof forceRefresh === 'function') {
    callback = forceRefresh;
    forceRefresh = false;
  }
  if (!forceRefresh && myFeedCache && (Date.now() - lastFeedFetch < 1000 * 60 * 5)) {
    return callback(null, myFeedCache);
  }
  const scriptPath = path.join(__dirname, 'scripts', 'get_user_feed.py');
  const refreshArg = forceRefresh ? ' --refresh' : '';
  exec(`python "${scriptPath}"${refreshArg}`, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout) => {
    if (err || !stdout || stdout.trim() === '[]') {
      return fetchYouTubeVideos('Samay Raina Indias Got Latent Karan Aujla Lakshay Chaudhary', callback);
    }
    try {
      const videos = JSON.parse(stdout.trim());
      if (Array.isArray(videos) && videos.length > 0) {
        myFeedCache = videos;
        lastFeedFetch = Date.now();
        callback(null, videos);
      } else {
        fetchYouTubeVideos('Samay Raina Indias Got Latent Karan Aujla Lakshay Chaudhary', callback);
      }
    } catch (e) {
      fetchYouTubeVideos('Samay Raina Indias Got Latent Karan Aujla Lakshay Chaudhary', callback);
    }
  });
}

let digiFeedCache = null;
let lastDigiFeedFetch = 0;

function getDigiPersonalFeed(forceRefresh, callback) {
  if (typeof forceRefresh === 'function') {
    callback = forceRefresh;
    forceRefresh = false;
  }
  if (!forceRefresh && digiFeedCache && (Date.now() - lastDigiFeedFetch < 1000 * 60 * 15)) {
    return callback(null, digiFeedCache);
  }

  fetchYouTubeVideos('Ve Haaniyaan Romantic Songs Arijit Singh', (err, fetchedVideos) => {
    const digiFavorites = [
      {
        id: 'BddP6PYo2gs',
        title: 'Ve Kamleya (Full Video) | Arijit Singh, Shreya Ghoshal | Alia, Ranveer',
        channel: 'Sony Music India',
        views: '185M views',
        pub: '1y ago',
        duration: '♪ 4:06',
        thumb: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg',
        avatar: 'https://yt3.ggpht.com/42o3XIW1j5zmzsFeZs3ND4QwaXXrnpK9vqftcEuEdbgNhPbltXRktcSmyJ12-gSRqKch93Ir=s176-c-k-c0x00ffffff-no-rj',
        isVerified: true
      },
      {
        id: 'r1I5NJtIGWA',
        title: "O'Romeo: Ishq Ka Fever (Lyrical) | Shahid K, Triptii D | Arijit Singh",
        channel: 'T-Series',
        views: '45M views',
        pub: '2w ago',
        duration: '♪ 3:30',
        thumb: 'https://i.ytimg.com/vi/r1I5NJtIGWA/hqdefault.jpg',
        avatar: 'https://yt3.ggpht.com/VunTf0NzCeboiPjbesBdnQuxaF3Lja7UGRbBGQAWRJgMSTj9TTLO3pS1X9qPOJGCNnmPrXeY=s176-c-k-c0x00ffffff-no-rj',
        isVerified: true
      },
      {
        id: 'cUmUOb7j3dc',
        title: 'Dhun Song | Saiyaara | Ahaan Panday, Aneet Padda | Arijit Singh',
        channel: 'YRF Music',
        views: '32M views',
        pub: '1mo ago',
        duration: '♪ 4:12',
        thumb: 'https://i.ytimg.com/vi/cUmUOb7j3dc/hqdefault.jpg',
        avatar: 'https://yt3.ggpht.com/ukiLOR2xcRjb4vEfv_DvcTU-5WgGyhwL3w1jQxvTBVdMbBlrtDopxKwg8Scs66C8nFgXu-cl=s176-c-k-c0x00ffffff-no-rj',
        isVerified: true
      },
      {
        id: 'WWXm39leYew',
        title: 'LYRICAL: Kaise Hua | Kabir Singh | Shahid K, Kiara A | Vishal Mishra',
        channel: 'T-Series',
        views: '290M views',
        pub: '5y ago',
        duration: '♪ 3:55',
        thumb: 'https://i.ytimg.com/vi/WWXm39leYew/hqdefault.jpg',
        avatar: 'https://yt3.ggpht.com/VunTf0NzCeboiPjbesBdnQuxaF3Lja7UGRbBGQAWRJgMSTj9TTLO3pS1X9qPOJGCNnmPrXeY=s176-c-k-c0x00ffffff-no-rj',
        isVerified: true
      },
      {
        id: 'LMnJp_dSdnw',
        title: 'DARKHAAST Full Video Song | SHIVAAY | Arijit Singh & Sunidhi Chauhan',
        channel: 'T-Series',
        views: '210M views',
        pub: '7y ago',
        duration: '♪ 6:14',
        thumb: 'https://i.ytimg.com/vi/LMnJp_dSdnw/hqdefault.jpg',
        avatar: 'https://yt3.ggpht.com/VunTf0NzCeboiPjbesBdnQuxaF3Lja7UGRbBGQAWRJgMSTj9TTLO3pS1X9qPOJGCNnmPrXeY=s176-c-k-c0x00ffffff-no-rj',
        isVerified: true
      },
      {
        id: 'W_1taX0Pvh4',
        title: 'PYAAR AATA HAI - Rito Riba & Shreya Ghoshal | Ishaan Khatter & Tara Sutaria',
        channel: 'Play DMF',
        views: '68M views',
        pub: '1y ago',
        duration: '♪ 4:20',
        thumb: 'https://i.ytimg.com/vi/W_1taX0Pvh4/hqdefault.jpg',
        avatar: 'https://yt3.ggpht.com/RpG4CbkasYMbM7IOBbGVnt4LwR31duDssSC2qMMzlEnL01JVbLaAADGzia8Glw2u-oTPe0MY=s176-c-k-c0x00ffffff-no-rj',
        isVerified: true
      },
      {
        id: 'nDjloeIB3Pc',
        title: 'Sitaare | Ikkis | Arijit Singh, Amitabh Bhattacharya',
        channel: 'Sony Music India',
        views: '18M views',
        pub: '3w ago',
        duration: '♪ 3:50',
        thumb: 'https://i.ytimg.com/vi/nDjloeIB3Pc/hqdefault.jpg',
        avatar: 'https://yt3.ggpht.com/42o3XIW1j5zmzsFeZs3ND4QwaXXrnpK9vqftcEuEdbgNhPbltXRktcSmyJ12-gSRqKch93Ir=s176-c-k-c0x00ffffff-no-rj',
        isVerified: true
      }
    ];

    const combined = digiFavorites.concat((fetchedVideos || []).slice(0, 15));
    digiFeedCache = combined;
    lastDigiFeedFetch = Date.now();
    callback(null, combined);
  });
}

// In-memory VIEVS 2.0 AirCast Real-Time Synchronization Session
let activeCastSession = {
  active: false,
  caster: null,
  target: null,
  status: 'idle', // 'idle' | 'invited' | 'accepted' | 'declined' | 'ended'
  inviteId: null,
  lastUpdate: Date.now(),
  video: {
    id: null,
    title: '',
    channel: '',
    avatar: '',
    currentTime: 0,
    duration: 0,
    isPlaying: false
  },
  reaction: null
};

const castSseClients = new Set();

function broadcastCastEvent(eventType, payload) {
  const data = `event: ${eventType}\ndata: ${JSON.stringify(payload || activeCastSession)}\n\n`;
  for (const client of castSseClients) {
    try {
      client.write(data);
    } catch (_) {
      castSseClients.delete(client);
    }
  }
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const forceRefresh = parsedUrl.query.refresh === '1' || parsedUrl.query.reload === '1';

  // 0. VIEVS 2.0 AirCast Real-Time Signaling Endpoints
  if (pathname === '/api/cast/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(`event: init\ndata: ${JSON.stringify(activeCastSession)}\n\n`);
    castSseClients.add(res);

    req.on('close', () => {
      castSseClients.delete(res);
    });
    return;
  }

  if (pathname === '/api/cast/status') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify({ success: true, session: activeCastSession }));
    return;
  }

  if (pathname === '/api/cast/action' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const action = payload.action;

        if (action === 'invite') {
          activeCastSession = {
            active: true,
            caster: payload.caster,
            target: payload.target,
            status: 'invited',
            inviteId: 'cast_' + Date.now(),
            lastUpdate: Date.now(),
            video: payload.video || { id: null, title: '', channel: '', avatar: '', currentTime: 0, duration: 0, isPlaying: false },
            reaction: null
          };
          broadcastCastEvent('invite', activeCastSession);
        } else if (action === 'respond') {
          if (payload.accepted) {
            activeCastSession.status = 'accepted';
            activeCastSession.lastUpdate = Date.now();
            broadcastCastEvent('accepted', activeCastSession);
          } else {
            activeCastSession.status = 'declined';
            activeCastSession.lastUpdate = Date.now();
            broadcastCastEvent('declined', activeCastSession);
            activeCastSession.active = false;
          }
        } else if (action === 'sync') {
          if (activeCastSession.active) {
            activeCastSession.video = Object.assign(activeCastSession.video || {}, payload.video || {});
            activeCastSession.lastUpdate = Date.now();
            broadcastCastEvent('sync', activeCastSession);
          }
        } else if (action === 'reaction') {
          activeCastSession.reaction = payload.reaction;
          broadcastCastEvent('reaction', { reaction: payload.reaction, from: payload.from });
        } else if (action === 'end') {
          activeCastSession.status = 'ended';
          activeCastSession.active = false;
          activeCastSession.lastUpdate = Date.now();
          broadcastCastEvent('ended', activeCastSession);
        }

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ success: true, session: activeCastSession }));
      } catch (err) {
        res.writeHead(400, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 1. User Personal Feed Endpoint (Exact personal account feed: 3011 Digi vs 1711 Virat)
  if (pathname === '/api/youtube/my-feed') {
    const user = parsedUrl.query.user || parsedUrl.query.code || '1711';

    if (user === '3011' || user === '3009' || user === 'digi') {
      getDigiPersonalFeed(forceRefresh, (err, videos) => {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        });
        res.end(JSON.stringify({
          success: !err,
          account: 'DIGI (@avneetsaini7070)',
          email: 'avneetsaini7070@gmail.com',
          avatar: 'song/Screenshot 2026-10-24 224431.png',
          role: 'digi',
          count: videos.length,
          videos
        }));
      });
      return;
    }

    getUserPersonalFeed(forceRefresh, (err, videos) => {
      const page = parseInt(parsedUrl.query.page || '1', 10) || 1;
      const pageSize = 15;
      const total = videos.length;
      let paged = videos.slice((page - 1) * pageSize, page * pageSize);
      if (paged.length === 0 && total > 0) {
        // Rotate so feed is endless
        const start = ((page - 1) * pageSize) % total;
        paged = videos.slice(start, start + pageSize);
        if (paged.length < pageSize) {
          paged = paged.concat(videos.slice(0, pageSize - paged.length));
        }
      }

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      res.end(JSON.stringify({
        success: !err,
        account: 'VIRAT PLAYS (@viratplaystdm)',
        email: 'iamsid074@gmail.com',
        avatar: 'song/virat_plays_avatar.png',
        role: 'user',
        page,
        hasMore: true,
        count: paged.length,
        videos: paged
      }));
    });
    return;
  }

  // 2. YouTube Search / Feed API Endpoint
  if (pathname === '/api/youtube/search' || pathname === '/api/youtube/feed') {
    const query = parsedUrl.query.q || parsedUrl.query.category || '';
    const user = parsedUrl.query.user || parsedUrl.query.code || '1711';

    if (!query || query === 'All' || query === 'Personal') {
      const feedFetcher = (user === '3011' || user === '3009' || user === 'digi')
        ? getDigiPersonalFeed
        : getUserPersonalFeed;

      feedFetcher((err, videos) => {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        });
        res.end(JSON.stringify({
          success: !err,
          query: 'My Feed',
          count: videos.length,
          videos
        }));
      });
      return;
    }

    fetchYouTubeVideos(query, (err, videos) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      res.end(JSON.stringify({
        success: !err,
        query,
        count: videos.length,
        videos
      }));
    });
    return;
  }

  // 2. Static File Serving
  const cleanUrl = decodeURIComponent(pathname);
  let filePath = path.join(__dirname, cleanUrl === '/' ? 'index.html' : cleanUrl);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.stat(filePath, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.code}`);
      }
      return;
    }

    const range = req.headers.range;
    if (range && stats.size > 0) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stats.size,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
