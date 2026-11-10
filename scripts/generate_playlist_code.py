import os, sys, json
sys.path.insert(0, '.')
from scripts.arijit_songs_data import SONGS_METADATA

js_playlist = []
seen_titles = set()

for s in SONGS_METADATA:
    title = s['title']
    if title in seen_titles:
        continue
    seen_titles.add(title)
    
    safe_name = title.replace('?', '').replace('/', '-').replace(':', ' -')
    
    # 1. Determine Cover
    cover_candidate = f"song/covers/{safe_name}.jpg"
    if os.path.exists(cover_path := f"song/covers/{title}.jpg"):
        cover = cover_path
    elif os.path.exists(cover_candidate):
        cover = cover_candidate
    elif s.get('cover') and os.path.exists(s['cover']):
        cover = s['cover']
    elif os.path.exists(f"song/{title}.jpg"):
        cover = f"song/{title}.jpg"
    else:
        cover = "song/virat_plays_avatar.png"

    # 2. Determine Audio Source
    if s.get('existing_src') and os.path.exists(s['existing_src']):
        src = s['existing_src']
    elif os.path.exists(f"song/{safe_name}.m4a"):
        src = f"song/{safe_name}.m4a"
    elif os.path.exists(f"song/{safe_name}.mp3"):
        src = f"song/{safe_name}.mp3"
    else:
        # Expected target path
        src = f"song/{safe_name}.m4a"

    # 3. Video (OLED)
    video = s.get('video')
    
    # 4. LRC
    lrc = s.get('lrc')

    item = {
        "title": title,
        "artist": s["artist"],
        "album": s.get("movie", "Arijit Singh Collection"),
        "bpm": s.get("bpm", 86),
        "src": src,
        "cover": cover,
        "color": s.get("color", "#ff7043"),
        "glow": s.get("glow", s.get("color", "#ff7043")),
        "glowSoft": s.get("glowSoft", "rgba(255, 112, 67, 0.40)")
    }
    if video:
        item["video"] = video
    if lrc:
        item["lrcFile"] = lrc

    js_playlist.append(item)

print(f"Generated {len(js_playlist)} clean master playlist tracks.")

with open('scripts/playlist_dump.json', 'w', encoding='utf-8') as f:
    json.dump(js_playlist, f, indent=2)
