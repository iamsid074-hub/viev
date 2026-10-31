// Vercel Serverless Function: /api/youtube/search
// Direct Real-Time YouTube Live Feed & Search Engine (Innertube API)
// Features In-Memory Cache (0ms), Strict 3.5s Timeout, and Robust Fallback

const searchCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const FALLBACK_CATALOG = [
  { id: '0uR45roIGA4', title: 'Jab Saiyaan | Full Video | Gangubai Kathiawadi | Alia Bhatt | Shreya Ghoshal', channel: 'Saregama Music', views: '112M views', duration: '♪ Video', thumb: 'https://i.ytimg.com/vi/0uR45roIGA4/hqdefault.jpg', isVerified: true },
  { id: 'QXJyMpxd210', title: 'Ve Kamleya | Rocky Aur Rani Kii Prem Kahaani | Arijit Singh, Shreya Ghoshal', channel: 'Saregama Music', views: '322M views', duration: '♪ Video', thumb: 'https://i.ytimg.com/vi/QXJyMpxd210/hqdefault.jpg', isVerified: true },
  { id: 'E_SbwSe15y0', title: 'Ve Haaniyaan - Official Video | Ravi Dubey & Sargun Mehta | Danny', channel: 'Dreamiyata Myusic', views: '396M views', duration: '♪ Video', thumb: 'https://i.ytimg.com/vi/E_SbwSe15y0/hqdefault.jpg', isVerified: true },
  { id: 'ElZfdU54Cp8', title: 'Apna Bana Le - Bhediya | Varun Dhawan, Kriti Sanon | Sachin-Jigar, Arijit Singh', channel: 'Zee Music Company', views: '520M views', duration: '♪ Video', thumb: 'https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg', isVerified: true },
  { id: 'RLzC55ai0eo', title: 'Heeriye (Official Video) Jasleen Royal ft. Arijit Singh', channel: 'Jasleen Royal', views: '480M views', duration: '♪ Video', thumb: 'https://i.ytimg.com/vi/RLzC55ai0eo/hqdefault.jpg', isVerified: true },
  { id: 'BddP6PYo2gs', title: 'Kesariya - Brahmāstra | Ranbir Kapoor, Alia Bhatt | Pritam, Arijit Singh', channel: 'Sony Music India', views: '640M views', duration: '♪ Video', thumb: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg', isVerified: true },
  { id: 'Etkd-07gnxM', title: 'Dunki: O Maahi (Full Video) | Shah Rukh Khan | Pritam, Arijit Singh', channel: 'T-Series', views: '315M views', duration: '♪ Video', thumb: 'https://i.ytimg.com/vi/Etkd-07gnxM/hqdefault.jpg', isVerified: true },
  { id: 'iAIBF2ngbWY', title: 'ANIMAL: Pehle Bhi Main (Full Video) | Ranbir Kapoor | Vishal Mishra', channel: 'T-Series', views: '462M views', duration: '♪ Video', thumb: 'https://i.ytimg.com/vi/iAIBF2ngbWY/hqdefault.jpg', isVerified: true },
  { id: 'Umqb9KENgmk', title: '\"Tum Hi Ho\" Aashiqui 2 Full Song | Aditya Roy Kapur | Arijit Singh', channel: 'T-Series', views: '890M views', duration: '♪ Video', thumb: 'https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg', isVerified: true },
  { id: 'gvyUuxdRdR4', title: 'Raataan Lambiyan – Official Video | Shershaah | Sidharth – Kiara', channel: 'Sony Music India', views: '920M views', duration: '♪ Video', thumb: 'https://i.ytimg.com/vi/gvyUuxdRdR4/hqdefault.jpg', isVerified: true },
  { id: 'WZzvUS-NaH0', title: 'Jetha ने चुरा लिया Bapuji की Plate से Jalebi Fafda ! | TMKOC', channel: 'Taarak Mehta Ka Ooltah Chashmah Movies', views: '10.9M views', duration: '♪ Video', thumb: 'https://i.ytimg.com/vi/WZzvUS-NaH0/hqdefault.jpg', isVerified: true },
  { id: 'Rx0kf6jxJaI', title: 'Jethalal ne Phoda Iyer ke Piche Bomb! | TMKOC Full Movie', channel: 'Taarak Mehta Ka Ooltah Chashmah', views: '13.3M views', duration: '♪ Video', thumb: 'https://i.ytimg.com/vi/Rx0kf6jxJaI/hqdefault.jpg', isVerified: true },
  { id: 'Z4aMdO8K0XE', title: 'INDIA’S GOT LATENT S2 EP8 ft. MC Stan, Tanmay Bhat, Samay Raina', channel: 'Samay Raina', views: '48.3M views', duration: '♪ Video', thumb: 'https://i.ytimg.com/vi/Z4aMdO8K0XE/hqdefault.jpg', isVerified: true },
  { id: 'GsOBaZh6cZo', title: 'So Swaezy | Yo Yo Honey Singh | Hommie Dilliwaala | Full Song', channel: 'Yo Yo Honey Singh', views: '26M views', duration: '♪ Video', thumb: 'https://i.ytimg.com/vi/GsOBaZh6cZo/hqdefault.jpg', isVerified: true },
  { id: '1K_6VwXDAUg', title: 'GURU RANDHAWA - SO WHAT ft. ANJINI DHAWAN', channel: 'Saregama Music', views: '9.6M views', duration: '♪ Video', thumb: 'https://i.ytimg.com/vi/1K_6VwXDAUg/hqdefault.jpg', isVerified: true }
];

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=120, s-maxage=300');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query?.q || req.query?.query || req.query?.category || 'trending india';
  const cleanQ = (query || '').trim() || 'trending india';
  const cacheKey = cleanQ.toLowerCase();

  // 1. Fast in-memory cache check (0ms response)
  const cached = searchCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS) && cached.videos.length > 0) {
    return res.status(200).json({
      success: true,
      query: cleanQ,
      isLive: true,
      cached: true,
      count: cached.videos.length,
      videos: cached.videos
    });
  }

  try {
    // 2. Strict 3.5s timeout on Innertube call to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const ytRes = await fetch('https://www.youtube.com/youtubei/v1/search?prettyPrint=false', {
      method: 'POST',
      signal: controller.signal,
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

    clearTimeout(timeoutId);

    if (!ytRes.ok) {
      throw new Error(`YouTube Innertube status ${ytRes.status}`);
    }

    const data = await ytRes.json();
    const videos = [];

    function extractVideos(obj) {
      if (!obj || typeof obj !== 'object') return;
      if (obj.videoRenderer || obj.compactVideoRenderer) {
        const vr = obj.videoRenderer || obj.compactVideoRenderer;
        if (vr.videoId && (vr.title || vr.headline)) {
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

    if (videos.length > 0) {
      // Save in cache
      searchCache.set(cacheKey, { timestamp: Date.now(), videos });
      return res.status(200).json({
        success: true,
        query: cleanQ,
        isLive: true,
        count: videos.length,
        videos
      });
    }

    throw new Error('No videos returned from live search');
  } catch (err) {
    console.warn(`Live search fallback for "${cleanQ}":`, err.message);

    // Filter fallback catalog by search query keywords
    const words = cleanQ.toLowerCase().split(/\s+/).filter(Boolean);
    let matched = FALLBACK_CATALOG.filter(v => {
      const txt = `${v.title} ${v.channel}`.toLowerCase();
      return words.some(w => txt.includes(w));
    });

    if (matched.length === 0) {
      matched = FALLBACK_CATALOG;
    }

    return res.status(200).json({
      success: true,
      fallback: true,
      query: cleanQ,
      count: matched.length,
      videos: matched
    });
  }
};
