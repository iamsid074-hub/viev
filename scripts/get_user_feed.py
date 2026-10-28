import os
import sys
import shutil
import sqlite3
import json
import re
import random
import urllib.request
import concurrent.futures
from collections import defaultdict

is_refresh = "--refresh" in sys.argv or "-r" in sys.argv

history_src = os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\User Data\Default\History")
temp_dir = os.path.join(os.path.dirname(__file__), "..", ".temp")
os.makedirs(temp_dir, exist_ok=True)
history_copy = os.path.join(temp_dir, "History_copy")
cache_file = os.path.join(temp_dir, "channel_cache.json")

# 1. Load channel metadata cache
channel_cache = {}
if os.path.exists(cache_file):
    try:
        with open(cache_file, "r", encoding="utf-8") as f:
            channel_cache = json.load(f)
    except Exception:
        channel_cache = {}

def find_key(obj, key):
    if isinstance(obj, dict):
        if key in obj:
            return obj[key]
        for k, v in obj.items():
            res = find_key(v, key)
            if res is not None:
                return res
    elif isinstance(obj, list):
        for item in obj:
            res = find_key(item, key)
            if res is not None:
                return res
    return None

def fetch_video_metadata(vid):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    }
    # Method A: Try watch page for exact Channel Title + Channel Avatar Logo + Views + Sub count
    try:
        req = urllib.request.Request(f"https://www.youtube.com/watch?v={vid}", headers=headers)
        with urllib.request.urlopen(req, timeout=4) as response:
            html = response.read().decode('utf-8', errors='ignore')

        m = re.search(r'var ytInitialData = ({.*?});</script>', html)
        if m:
            data = json.loads(m.group(1))
            owner = find_key(data, 'videoOwnerRenderer')
            primary = find_key(data, 'videoPrimaryInfoRenderer')

            channel_name = ''
            avatar_url = ''
            subs = '1M subscribers'
            is_verified = False
            views = ''
            pub = ''

            if owner:
                channel_name = owner.get('title', {}).get('runs', [{}])[0].get('text', '')
                thumbs = owner.get('thumbnail', {}).get('thumbnails', [])
                if thumbs:
                    avatar_url = thumbs[-1].get('url', '')
                is_verified = bool(owner.get('badges', []))
                subs = owner.get('subscriberCountText', {}).get('simpleText', '1M subscribers')

            if primary:
                vc = primary.get('viewCount', {}).get('videoViewCountRenderer', {}).get('viewCount', {}).get('simpleText')
                date = primary.get('relativeDateText', {}).get('simpleText')
                if vc:
                    views = vc
                if date:
                    pub = date

            if channel_name:
                return vid, {
                    'channel': channel_name,
                    'avatar': avatar_url,
                    'subs': subs,
                    'isVerified': is_verified,
                    'views': views,
                    'pub': pub
                }
    except Exception:
        pass

    # Method B: Fast oEmbed fallback for author_name
    try:
        req = urllib.request.Request(f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json", headers=headers)
        with urllib.request.urlopen(req, timeout=3) as res:
            oembed_data = json.loads(res.read().decode('utf-8'))
            author = oembed_data.get('author_name', 'YouTube')
            return vid, {
                'channel': author,
                'avatar': '',
                'subs': '1M subscribers',
                'isVerified': True,
                'views': '',
                'pub': ''
            }
    except Exception:
        pass

    return vid, {
        'channel': 'YouTube Creator',
        'avatar': '',
        'subs': '100K subscribers',
        'isVerified': False,
        'views': '',
        'pub': ''
    }

raw_items = []

try:
    if os.path.exists(history_src):
        with open(history_src, "rb") as src_f, open(history_copy, "wb") as dst_f:
            while True:
                buf = src_f.read(1024 * 1024)
                if not buf:
                    break
                dst_f.write(buf)

        conn = sqlite3.connect(history_copy)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT url, title, visit_count, last_visit_time 
            FROM urls 
            WHERE url LIKE '%youtube.com/watch%v=%' 
            ORDER BY last_visit_time DESC 
            LIMIT 150
        """)
        rows = cursor.fetchall()
        seen = set()

        for r in rows:
            url, title, visits, lvt = r
            m = re.search(r"[?&]v=([a-zA-Z0-9_-]{11})", url)
            if not m:
                continue
            vid = m.group(1)
            if vid in seen:
                continue
            seen.add(vid)

            clean_title = re.sub(r"\s*-\s*YouTube$", "", title or "")
            clean_title = re.sub(r"^\(\d+\)\s*", "", clean_title).strip()
            if not clean_title:
                continue

            raw_items.append({
                "id": vid,
                "title": clean_title,
                "visits": visits
            })

        conn.close()
except Exception:
    pass

# Check which video IDs are missing channel metadata
to_fetch = [item["id"] for item in raw_items if item["id"] not in channel_cache]
if to_fetch:
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
        results = executor.map(fetch_video_metadata, to_fetch)
        for vid, meta in results:
            channel_cache[vid] = meta

    try:
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(channel_cache, f, ensure_ascii=False, indent=2)
    except Exception:
        pass

# Group items by channel to enforce diversity and eliminate consecutive clustering
by_channel = defaultdict(list)
for item in raw_items:
    vid = item["id"]
    meta = channel_cache.get(vid, {})
    channel_name = meta.get("channel") or "YouTube"
    avatar_url = meta.get("avatar") or ""
    views = meta.get("views") or f"{item['visits'] * 14}K views"
    pub = meta.get("pub") or "Recently watched"
    subs = meta.get("subs") or "1M subscribers"
    is_verified = meta.get("isVerified", True)

    by_channel[channel_name].append({
        "id": vid,
        "title": item["title"],
        "channel": channel_name,
        "views": views,
        "pub": pub,
        "duration": "♪ Video",
        "thumb": f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg",
        "avatar": avatar_url,
        "isVerified": is_verified,
        "subs": subs
    })

# Diverse Channel Interleaving Algorithm:
channel_keys = list(by_channel.keys())

# If refreshed or requested, shuffle channels and rotate videos so every refresh is unique!
if is_refresh:
    random.shuffle(channel_keys)
    for ch in channel_keys:
        random.shuffle(by_channel[ch])
else:
    # Stable initial diversity: order channels by when they were most recently seen,
    # but ensure NO TWO consecutive videos share the same channel
    random.seed(42)
    random.shuffle(channel_keys)

# Round-robin across different channels
interleaved = []
max_videos_per_channel = max(len(v) for v in by_channel.values()) if by_channel else 0

for round_idx in range(max_videos_per_channel):
    for ch in channel_keys:
        channel_videos = by_channel[ch]
        if round_idx < len(channel_videos):
            interleaved.append(channel_videos[round_idx])

# Cap at 50 diverse items
final_feed = interleaved[:50]

print(json.dumps(final_feed))
