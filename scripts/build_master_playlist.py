import json, os, re, sys

sys.path.insert(0, '.')
from scripts.arijit_songs_data import SONGS_METADATA

# Load old tracks map by normalized title
with open('scripts/old_tracks.json', 'r', encoding='utf-8') as f:
    old_tracks = json.load(f)

old_by_norm = {}
for ot in old_tracks:
    norm = re.sub(r'[^a-zA-Z0-9]', '', ot['title'].lower())
    old_by_norm[norm] = ot

# Master playlist list
unified_playlist = []
seen_titles = set()

# Process the 84 screenshot songs
screenshot_count = 0
for s in SONGS_METADATA:
    # Stop before the extra 8 appended in SONGS_METADATA if we want exact screenshot order first
    # SONGS_METADATA has 92 items (first 84 are the screenshot unique songs)
    title = s['title']
    norm = re.sub(r'[^a-zA-Z0-9]', '', title.lower())
    if norm in seen_titles:
        continue
    seen_titles.add(norm)
    
    safe_name = title.replace('?', '').replace('/', '-').replace(':', ' -')
    
    # Check if this song was in old_tracks
    old_match = old_by_norm.get(norm)
    
    # Audio source: prefer old_match if exists, or existing_src, or .m4a/.mp3
    src = None
    if old_match and os.path.exists(old_match['src']):
        src = old_match['src']
    elif s.get('existing_src') and os.path.exists(s['existing_src']):
        src = s['existing_src']
    elif os.path.exists(f"song/{safe_name}.m4a"):
        src = f"song/{safe_name}.m4a"
    elif os.path.exists(f"song/{safe_name}.mp3"):
        src = f"song/{safe_name}.mp3"
    elif os.path.exists(f"song/{title}.m4a"):
        src = f"song/{title}.m4a"
    elif os.path.exists(f"song/{title}.mp3"):
        src = f"song/{title}.mp3"
    else:
        src = f"song/{safe_name}.m4a"

    # Cover source: prefer official downloaded 600x600 cover
    cover = None
    if os.path.exists(f"song/covers/{safe_name}.jpg"):
        cover = f"song/covers/{safe_name}.jpg"
    elif os.path.exists(f"song/covers/{title}.jpg"):
        cover = f"song/covers/{title}.jpg"
    elif old_match and os.path.exists(old_match['cover']):
        cover = old_match['cover']
    elif s.get('cover') and os.path.exists(s['cover']):
        cover = s['cover']
    else:
        cover = "song/virat_plays_avatar.png"

    # Color & Glow
    color = (old_match.get('color') if old_match else None) or s.get('color') or '#ff7043'
    glow = (old_match.get('glow') if old_match else None) or s.get('glow') or color
    glowSoft = (old_match.get('glowSoft') if old_match else None) or s.get('glowSoft') or 'rgba(255, 112, 67, 0.40)'

    track_obj = {
        "title": title,
        "artist": s.get("artist", "Arijit Singh"),
        "album": s.get("movie", "Arijit Singh Collection"),
        "bpm": s.get("bpm", 86),
        "src": src,
        "cover": cover,
        "color": color,
        "glow": glow,
        "glowSoft": glowSoft
    }

    # Video if available
    video = (old_match.get('video') if old_match else None) or s.get('video')
    if video and os.path.exists(video):
        track_obj["video"] = video

    # LRC file if available
    lrc = (old_match.get('lrcFile') if old_match else None) or s.get('lrc')
    if lrc and os.path.exists(lrc):
        track_obj["lrcFile"] = lrc

    # Pre-parsed lyrics if available
    if old_match and old_match.get('lyrics'):
        track_obj["lyrics"] = old_match['lyrics']

    unified_playlist.append(track_obj)
    screenshot_count += 1

print(f"Added {screenshot_count} unique songs from metadata (screenshot order).")

# Now append any existing tracks from old_tracks that haven't been added yet (e.g. OLED video tracks Kesariya, etc.)
added_legacy = 0
for ot in old_tracks:
    norm = re.sub(r'[^a-zA-Z0-9]', '', ot['title'].lower())
    if norm not in seen_titles:
        seen_titles.add(norm)
        unified_playlist.append(ot)
        added_legacy += 1

print(f"Added {added_legacy} remaining tracks from old playlist (including OLED video loops & legacy favorites).")
print(f"Total Unified Playlist length: {len(unified_playlist)}")

# Validate every track's audio and cover existence
missing_audio = []
for t in unified_playlist:
    if not os.path.exists(t['src']):
        missing_audio.append((t['title'], t['src']))

print(f"Missing audio count: {len(missing_audio)}")
if missing_audio:
    print("Missing audio details:", missing_audio)

# Write to json file
with open('scripts/unified_playlist.json', 'w', encoding='utf-8') as f:
    json.dump(unified_playlist, f, indent=2)
print("Saved to scripts/unified_playlist.json")
