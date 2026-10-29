// Vercel Serverless Function: /api/youtube/search
// Direct Real-Time YouTube Live Feed & Search Engine (Innertube API)

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=60');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query?.q || req.query?.query || req.query?.category || 'trending india';
  const cleanQ = (query || '').trim() || 'trending india';

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
        query: cleanQ
      })
    });

    if (!ytRes.ok) {
      throw new Error(`YouTube Innertube status ${ytRes.status}`);
    }

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

    return res.status(200).json({
      success: true,
      query: cleanQ,
      isLive: true,
      count: videos.length,
      videos
    });
  } catch (err) {
    console.error('Error fetching live YouTube search:', err);
    return res.status(200).json({
      success: false,
      error: err.message,
      query: cleanQ,
      videos: []
    });
  }
};
