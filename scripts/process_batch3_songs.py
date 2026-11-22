import os, sys, json, time, re, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image
import yt_dlp

os.makedirs('song/covers', exist_ok=True)

songs_list = [
    ('Ajeeb-O-Gareeb', 'Azaad', 'Arijit Singh • Amit Trivedi • Hansika Pareek', 'Ajeeb-O-Gareeb Azaad Arijit Singh audio', 116),
    ('Hum Aapke Bina', 'Sikandar', 'Pritam • Arijit Singh', 'Hum Aapke Bina Sikandar Arijit Singh audio', 86),
    ('Khulne Do', 'Chhapaak', 'Arijit Singh', 'Khulne Do Chhapaak Arijit Singh audio', 78),
    ('Moh Na Laage', 'Dukaan', 'Shreyas Puranik • Arijit Singh', 'Moh Na Laage Dukaan Arijit Singh audio', 82),
    ('Main Hoon Saath Tere', 'Shaadi Mein Zaroor Aana', 'Arijit Singh', 'Main Hoon Saath Tere Shaadi Mein Zaroor Aana audio', 84),
    ('Ilahi', 'Yeh Jawaani Hai Deewani', 'Pritam • Arijit Singh', 'Ilahi Yeh Jawaani Hai Deewani audio', 128),
    ('Zamaana Lage', 'Metro... In Dino', 'Pritam • Arijit Singh • Shashwat Singh', 'Zamaana Lage Metro In Dino audio', 88),
    ('Pal Bhar (Chaahunga Reprise)', 'Half Girlfriend', 'Mithoon • Arijit Singh', 'Pal Bhar Chaahunga Reprise Half Girlfriend audio', 80),
    ('Raat Akeli Thi', 'Merry Christmas', 'Pritam • Arijit Singh • Antara Mitra', 'Raat Akeli Thi Merry Christmas audio', 86),
    ('Tera Hoke Rahoon', 'Behen Hogi Teri', 'Arijit Singh', 'Tera Hoke Rahoon Behen Hogi Teri audio', 84),
    ('Tere Sang Ishq Hua', 'Yodha', 'Tanishk Bagchi • Arijit Singh • Neeti Mohan', 'Tere Sang Ishq Hua Yodha audio', 90),
    ('Dhun', 'Saiyaara', 'Mithoon • Arijit Singh', 'Dhun Saiyaara Mithoon Arijit Singh audio', 82),
    ('Haareya', 'Meri Pyaari Bindu', 'Sachin-Jigar • Arijit Singh', 'Haareya Meri Pyaari Bindu audio', 96),
    ('Teri Khushboo (Male)', 'Mr. X', 'Jeet Gannguli • Arijit Singh', 'Teri Khushboo Male Mr X audio', 80),
    ('Bandeya', 'Dil Juunglee', 'Shaarib Toshi • Arijit Singh', 'Bandeya Dil Juunglee Arijit Singh audio', 84),
    ('Neki Ki Raah', 'Traffic', 'Mithoon • Arijit Singh', 'Neki Ki Raah Traffic Mithoon audio', 78),
    ('Valam', 'Made in China', 'Sachin-Jigar • Arijit Singh', 'Valam Made in China audio', 88),
    ('Aavan Jaavan', 'WAR 2', 'Pritam • Arijit Singh • Nikhita Gandhi', 'Aavan Jaavan War 2 Arijit Singh audio', 118),
    ('Tainu Khabar Nahi', 'Munjya', 'Sachin-Jigar • Arijit Singh', 'Tainu Khabar Nahi Munjya audio', 88),
    ('Baaton Ko Teri', 'All Is Well', 'Arijit Singh', 'Baaton Ko Teri All Is Well audio', 82),
    ('Dil Cheez Tujhe Dedi', 'Airlift', 'Ankit Tiwari • Arijit Singh', 'Dil Cheez Tujhe Dedi Airlift audio', 124),
    ('Shanivaar Raati', 'Main Tera Hero', 'Arijit Singh • Shalmali Kholgade', 'Shanivaar Raati Main Tera Hero audio', 130),
    ('Laal Ishq', 'Goliyon Ki Raasleela Ram-Leela', 'Sanjay Leela Bhansali • Arijit Singh', 'Laal Ishq Ram Leela audio', 74),
    ('Chal Ghar Chalen', 'Malang', 'Mithoon • Arijit Singh', 'Chal Ghar Chalen Malang audio', 84),
    ('Tu Mil Jaaye', 'KING', 'Sachin-Jigar • Ed Sheeran • Arijit Singh', 'Tu Mil Jaaye King Arijit Singh audio', 92)
]

print("--- 1. Fetching iTunes Metadata & High-Res Covers ---")
itunes_cache = {}
for title, album, artist, q, bpm in songs_list:
    safe_title = title.replace('?', '').replace('/', '-').replace(':', ' -')
    cover_dest = f'song/covers/{safe_title}.jpg'
    
    itunes_q = f"{title} {album} Arijit Singh"
    url = 'https://itunes.apple.com/search?' + urllib.parse.urlencode({'term': itunes_q, 'entity': 'song', 'limit': 1})
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as res:
            data = json.loads(res.read().decode())
            if data['resultCount'] > 0:
                r = data['results'][0]
                art = r.get('artworkUrl100', '').replace('100x100bb', '600x600bb')
                itunes_cache[title] = {
                    'album': r.get('collectionName', album),
                    'artist': r.get('artistName', artist),
                    'coverUrl': art
                }
                if art and not os.path.exists(cover_dest):
                    urllib.request.urlretrieve(art, cover_dest)
                    print(f"  [COVER OK] {title}")
            else:
                itunes_cache[title] = {'album': album, 'artist': artist, 'coverUrl': None}
    except Exception as e:
        print(f"  [ITUNES ERR] {title}: {e}")
        itunes_cache[title] = {'album': album, 'artist': artist, 'coverUrl': None}

print("\n--- 2. Downloading Audio in Parallel (4 workers) ---")
def download_song(item):
    title, album, artist, q, bpm = item
    safe_name = title.replace('?', '').replace('/', '-').replace(':', ' -')
    target_m4a = f"song/{safe_name}.m4a"
    target_mp3 = f"song/{safe_name}.mp3"
    
    if os.path.exists(target_m4a):
        return title, target_m4a, True
    if os.path.exists(target_mp3):
        return title, target_mp3, True
    
    opts = {
        'format': 'ba[ext=m4a]/ba/b',
        'outtmpl': f"song/{safe_name}.%(ext)s",
        'quiet': True,
        'no_warnings': True,
        'noplaylist': True
    }
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            ydl.download([f"ytsearch1:{q}"])
            if os.path.exists(target_m4a):
                return title, target_m4a, True
            elif os.path.exists(target_mp3):
                return title, target_mp3, True
            else:
                for f in os.listdir('song'):
                    if f.startswith(safe_name) and f.endswith(('.m4a', '.mp3', '.webm', '.opus')):
                        return title, f"song/{f}", True
    except Exception as e:
        return title, str(e), False

downloaded_audio = {}
with ThreadPoolExecutor(max_workers=4) as executor:
    futures = {executor.submit(download_song, item): item[0] for item in songs_list}
    for future in as_completed(futures):
        t = futures[future]
        try:
            title, path, ok = future.result()
            if ok:
                downloaded_audio[title] = path
                print(f"  [AUDIO OK] {title} -> {path}")
            else:
                print(f"  [AUDIO FAIL] {title} -> {path}")
        except Exception as e:
            print(f"  [AUDIO ERR] {t} -> {e}")

print("\n--- 3. Extracting Ambient Palettes & Building Tracks ---")
def get_dominant_color(img_path):
    if not os.path.exists(img_path):
        return "#ec4899"
    try:
        img = Image.open(img_path).convert("RGB")
        img = img.resize((50, 50))
        colors = img.getcolors(maxcolors=2500)
        best_color = None
        best_score = -1
        for count, (r, g, b) in colors:
            brightness = (r + g + b) / 3
            if brightness < 40 or brightness > 230:
                continue
            max_c = max(r, g, b)
            min_c = min(r, g, b)
            sat = (max_c - min_c) / (max_c + 1e-5)
            score = sat * count * (1 if brightness > 60 else 0.5)
            if score > best_score:
                best_score = score
                best_color = (r, g, b)
        if best_color:
            return f"#{best_color[0]:02x}{best_color[1]:02x}{best_color[2]:02x}"
    except:
        pass
    return "#3b82f6"

def hex_to_rgba(hex_code, alpha=0.4):
    hex_code = hex_code.lstrip('#')
    try:
        r = int(hex_code[0:2], 16)
        g = int(hex_code[2:4], 16)
        b = int(hex_code[4:6], 16)
        return f"rgba({r}, {g}, {b}, {alpha:.2f})"
    except:
        return f"rgba(255, 112, 67, {alpha:.2f})"

with open('scripts/unified_playlist.json', 'r', encoding='utf-8') as f:
    unified_playlist = json.load(f)

existing_norms = {re.sub(r'[^a-z0-9]', '', t['title'].lower()): t for t in unified_playlist}

new_tracks_count = 0
for title, default_album, default_artist, q, bpm in songs_list:
    n = re.sub(r'[^a-z0-9]', '', title.lower())
    if n in existing_norms:
        continue
    
    meta = itunes_cache.get(title, {})
    album = meta.get('album') or default_album
    raw_artist = meta.get('artist') or default_artist
    clean_artist = raw_artist.replace('&', '•').replace(',', ' •')

    safe_name = title.replace('?', '').replace('/', '-').replace(':', ' -')
    cover_path = f"song/covers/{safe_name}.jpg"
    
    src_path = downloaded_audio.get(title, f"song/{safe_name}.m4a")
    if not os.path.exists(src_path):
        for ext in ('.m4a', '.mp3', '.webm'):
            if os.path.exists(f"song/{safe_name}{ext}"):
                src_path = f"song/{safe_name}{ext}"
                break

    color = get_dominant_color(cover_path)
    glow = color
    glowSoft = hex_to_rgba(color, 0.40)

    track_obj = {
        "title": title,
        "artist": clean_artist,
        "album": album,
        "bpm": bpm,
        "src": src_path,
        "cover": cover_path,
        "color": color,
        "glow": glow,
        "glowSoft": glowSoft
    }
    unified_playlist.append(track_obj)
    existing_norms[n] = track_obj
    new_tracks_count += 1
    print(f"  + Added: {title} ({album}) | {color}")

print(f"\n--- 4. Saving & Injecting into js/navbar.js ---")
print(f"Total songs in unified playlist now: {len(unified_playlist)}")
with open('scripts/unified_playlist.json', 'w', encoding='utf-8') as f:
    json.dump(unified_playlist, f, indent=4)

js_code = "const MASTER_PLAYLIST = " + json.dumps(unified_playlist, indent=4) + ";"
with open('js/navbar.js', 'r', encoding='utf-8') as f:
    nav_text = f.read()

pattern = re.compile(r'const MASTER_PLAYLIST = \[[\s\S]*?\];\s*\n\s*// Dynamic active playlist')
match = pattern.search(nav_text)
if not match:
    print("ERROR: Regex did not match MASTER_PLAYLIST block in navbar.js!")
    exit(1)

start, end = match.span()
replacement = js_code + "\n\n  // Dynamic active playlist"
new_nav_text = nav_text[:start] + replacement + nav_text[end:]

with open('js/navbar.js', 'w', encoding='utf-8') as f:
    f.write(new_nav_text)

print("SUCCESS: Injected updated MASTER_PLAYLIST into js/navbar.js!")
