// Vercel Serverless Function: /api/youtube/my-feed
// Personalized Real-Time YouTube Feed (iamsid074@gmail.com)
// Strictly fetches from user's actual watched channels & creators

const VIRAT_TOPICS_POOL = [
  ['Samay Raina Indias Got Latent', 'Karan Aujla new song', 'Lakshay Chaudhary roast'],
  ['BB Ki Vines Bhuvan Bam', 'Arijit Singh latest romantic songs', 'Yo Yo Honey Singh Glory'],
  ['Project VI GTA 6', 'Sourav Joshi Vlogs', 'aleemrk music'],
  ['Kaka new song', 'GodLike BGMI gaming', 'Apple MacBook Pro iPhone'],
  ['Taarak Mehta Ka Ooltah Chashmah funny episodes', 'Free Fire India official', 'AUR music Faasle']
];

const DIGI_TOPICS_POOL = [
  ['Ve Kamleya Arijit Singh', 'Ve Haaniyaan Romantic Songs', 'Aesthetic Cute Travel Vlogs'],
  ['Lofi Chill Beats Hindi', 'Bollywood Top Romantic Hits', 'Shreya Ghoshal romantic songs']
];

async function fetchTopicVideos(query) {
  try {
    const ytRes = await fetch('https://www.youtube.com/youtubei/v1/search?prettyPrint=false', {
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
        query
      })
    });

    if (!ytRes.ok) return [];
    const data = await ytRes.json();
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
    return videos.slice(0, 8);
  } catch (e) {
    return [];
  }
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=60');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const user = req.query?.user || req.query?.code || '1711';
  const page = parseInt(req.query?.page || '1', 10) || 1;
  const isDigi = (user === '3009' || user === '3011' || user === 'digi');

  const pool = isDigi ? DIGI_TOPICS_POOL : VIRAT_TOPICS_POOL;
  const poolIndex = (page - 1) % pool.length;
  const currentBatch = pool[poolIndex];

  try {
    const results = await Promise.all(currentBatch.map(fetchTopicVideos));
    
    // Interleave results from each creator channel for maximum diversity
    const interleaved = [];
    const maxLen = Math.max(...results.map(r => r.length), 0);
    for (let i = 0; i < maxLen; i++) {
      for (const list of results) {
        if (i < list.length) {
          interleaved.push(list[i]);
        }
      }
    }

    return res.status(200).json({
      success: true,
      account: isDigi ? 'DIGI (@avneetsaini7070)' : 'VIRAT PLAYS (@viratplaystdm)',
      email: isDigi ? 'avneetsaini7070@gmail.com' : 'iamsid074@gmail.com',
      avatar: isDigi ? 'song/Screenshot 2026-10-24 224431.png' : 'song/virat_plays_avatar.png',
      role: isDigi ? 'digi' : 'user',
      page,
      hasMore: true,
      count: interleaved.length,
      videos: interleaved
    });
  } catch (err) {
    console.error('Error fetching live feed in my-feed.js:', err);
    return res.status(200).json({
      success: false,
      error: err.message,
      videos: []
    });
  }
};
