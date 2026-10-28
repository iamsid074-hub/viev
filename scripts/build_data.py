import json
import subprocess

virat_videos = json.loads(subprocess.check_output(['python', 'scripts/get_user_feed.py']).decode('utf-8'))

digi_videos = [
  {
    "id": "BddP6PYo2gs",
    "title": "Ve Kamleya (Full Video) | Arijit Singh, Shreya Ghoshal | Alia, Ranveer",
    "channel": "Sony Music India",
    "views": "185M views",
    "pub": "1y ago",
    "duration": "♪ 4:06",
    "thumb": "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg",
    "avatar": "https://yt3.ggpht.com/42o3XIW1j5zmzsFeZs3ND4QwaXXrnpK9vqftcEuEdbgNhPbltXRktcSmyJ12-gSRqKch93Ir=s176-c-k-c0x00ffffff-no-rj",
    "isVerified": True
  },
  {
    "id": "r1I5NJtIGWA",
    "title": "O'Romeo: Ishq Ka Fever (Lyrical) | Shahid K, Triptii D | Arijit Singh",
    "channel": "T-Series",
    "views": "45M views",
    "pub": "2w ago",
    "duration": "♪ 3:30",
    "thumb": "https://i.ytimg.com/vi/r1I5NJtIGWA/hqdefault.jpg",
    "avatar": "https://yt3.ggpht.com/VunTf0NzCeboiPjbesBdnQuxaF3Lja7UGRbBGQAWRJgMSTj9TTLO3pS1X9qPOJGCNnmPrXeY=s176-c-k-c0x00ffffff-no-rj",
    "isVerified": True
  },
  {
    "id": "cUmUOb7j3dc",
    "title": "Dhun Song | Saiyaara | Ahaan Panday, Aneet Padda | Arijit Singh",
    "channel": "YRF Music",
    "views": "32M views",
    "pub": "1mo ago",
    "duration": "♪ 4:12",
    "thumb": "https://i.ytimg.com/vi/cUmUOb7j3dc/hqdefault.jpg",
    "avatar": "https://yt3.ggpht.com/ukiLOR2xcRjb4vEfv_DvcTU-5WgGyhwL3w1jQxvTBVdMbBlrtDopxKwg8Scs66C8nFgXu-cl=s176-c-k-c0x00ffffff-no-rj",
    "isVerified": True
  },
  {
    "id": "WWXm39leYew",
    "title": "LYRICAL: Kaise Hua | Kabir Singh | Shahid K, Kiara A | Vishal Mishra",
    "channel": "T-Series",
    "views": "290M views",
    "pub": "5y ago",
    "duration": "♪ 3:55",
    "thumb": "https://i.ytimg.com/vi/WWXm39leYew/hqdefault.jpg",
    "avatar": "https://yt3.ggpht.com/VunTf0NzCeboiPjbesBdnQuxaF3Lja7UGRbBGQAWRJgMSTj9TTLO3pS1X9qPOJGCNnmPrXeY=s176-c-k-c0x00ffffff-no-rj",
    "isVerified": True
  },
  {
    "id": "LMnJp_dSdnw",
    "title": "DARKHAAST Full Video Song | SHIVAAY | Arijit Singh & Sunidhi Chauhan",
    "channel": "T-Series",
    "views": "210M views",
    "pub": "7y ago",
    "duration": "♪ 6:14",
    "thumb": "https://i.ytimg.com/vi/LMnJp_dSdnw/hqdefault.jpg",
    "avatar": "https://yt3.ggpht.com/VunTf0NzCeboiPjbesBdnQuxaF3Lja7UGRbBGQAWRJgMSTj9TTLO3pS1X9qPOJGCNnmPrXeY=s176-c-k-c0x00ffffff-no-rj",
    "isVerified": True
  },
  {
    "id": "W_1taX0Pvh4",
    "title": "PYAAR AATA HAI - Rito Riba & Shreya Ghoshal | Ishaan Khatter & Tara Sutaria",
    "channel": "Play DMF",
    "views": "68M views",
    "pub": "1y ago",
    "duration": "♪ 4:20",
    "thumb": "https://i.ytimg.com/vi/W_1taX0Pvh4/hqdefault.jpg",
    "avatar": "https://yt3.ggpht.com/RpG4CbkasYMbM7IOBbGVnt4LwR31duDssSC2qMMzlEnL01JVbLaAADGzia8Glw2u-oTPe0MY=s176-c-k-c0x00ffffff-no-rj",
    "isVerified": True
  },
  {
    "id": "nDjloeIB3Pc",
    "title": "Sitaare | Ikkis | Arijit Singh, Amitabh Bhattacharya",
    "channel": "Sony Music India",
    "views": "18M views",
    "pub": "3w ago",
    "duration": "♪ 3:50",
    "thumb": "https://i.ytimg.com/vi/nDjloeIB3Pc/hqdefault.jpg",
    "avatar": "https://yt3.ggpht.com/42o3XIW1j5zmzsFeZs3ND4QwaXXrnpK9vqftcEuEdbgNhPbltXRktcSmyJ12-gSRqKch93Ir=s176-c-k-c0x00ffffff-no-rj",
    "isVerified": True
  }
]

js_content = f"""/* =========================================================
   OFFLINE & ZERO-FAIL YOUTUBE FEEDS DATABASE
   Works 100% on Phone / Vercel / GitHub Pages / PWA Shortcut
   ========================================================= */

window.VIRAT_YOUTUBE_FEED = {json.dumps(virat_videos, ensure_ascii=False, indent=2)};

window.DIGI_YOUTUBE_FEED = {json.dumps(digi_videos, ensure_ascii=False, indent=2)};

window.getClientSideYouTubeFeed = function(query, userCode) {{
  const isDigi = (userCode === '3009' || userCode === '3011' || userCode === 'digi');
  const baseFeed = isDigi ? window.DIGI_YOUTUBE_FEED : window.VIRAT_YOUTUBE_FEED;

  if (!query || query === 'All' || query === 'Trending Songs & Vlogs India') {{
    return [...baseFeed];
  }}

  const q = query.toLowerCase().trim();
  const matched = baseFeed.filter(v => {{
    const title = (v.title || '').toLowerCase();
    const ch = (v.channel || '').toLowerCase();
    return q.split(' ').some(word => word.length > 2 && (title.includes(word) || ch.includes(word)));
  }});

  if (matched.length >= 3) {{
    return matched;
  }}

  const unique = new Set(matched.map(m => m.id));
  const fallbackList = [...matched];
  for (const item of baseFeed) {{
    if (!unique.has(item.id)) {{
      fallbackList.push(item);
      unique.add(item.id);
    }}
  }}
  return fallbackList;
}};
"""

with open('js/youtube-data.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Successfully written js/youtube-data.js")
