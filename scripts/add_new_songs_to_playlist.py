import os, sys, json, re
from PIL import Image

# Palette generator from artwork image
def get_dominant_color(img_path):
    if not os.path.exists(img_path):
        return "#ec4899"
    try:
        img = Image.open(img_path).convert("RGB")
        img = img.resize((50, 50))
        # Get palette with most frequent saturated colors
        colors = img.getcolors(maxcolors=2500)
        # Sort by vibrancy (saturation * value * count)
        best_color = None
        best_score = -1
        for count, (r, g, b) in colors:
            # avoid pure dark or pure white
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
    except Exception as e:
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

with open('scripts/new_songs_itunes.json', 'r', encoding='utf-8') as f:
    itunes_data = json.load(f)

with open('scripts/unified_playlist.json', 'r', encoding='utf-8') as f:
    unified_playlist = json.load(f)

existing_norms = {re.sub(r'[^a-z0-9]', '', t['title'].lower()): t for t in unified_playlist}

# List of the 46 songs in exact order as from the screenshots
ordered_titles = [
    'Ve Maahi',
    'Ae Dil Hai Mushkil Title Track',
    'The Breakup Song',
    'Channa Mereya',
    'Heeriye (feat. Arijit Singh)',
    'Agar Tum Saath Ho',
    'Tu Hai Champion',
    'Nashe Si Chadh Gayi',
    'Anuvanuvuu',
    'Chaleya',
    'Phir Aur Kya Chahiye',
    'Tujhe Kitna Chahne Lage',
    'Apna Bana Le',
    'Tere Hawaale',
    'Main Dhoondne Ko Zamaane Mein',
    'Lambiyaan Si Judaiyaan',
    'Ishq Mubarak',
    'Fitoor',
    'Gazab Ka Hain Yeh Din',
    'Love Me Thoda Aur',
    'Meri Aashiqui',
    'Chal Wahan Jaate Hain',
    'Intezaar',
    'Ik Vaari Aa',
    'Janam Janam',
    'Gerua',
    'Kaala Jaadu',
    'Enna Sona',
    'Akhiyaan Milavanga',
    'Naam Na Jana Pakhi (Male Version)',
    'Naam Na Jana Pakhi (Duet Version)',
    'Bismillah Title Track',
    'Salamat',
    'Khamoshiyan',
    'Tu Har Lamha',
    'Darkhaast',
    'Bojhena Shey Bojhena (Male Version)',
    'Mon Majhi Re',
    'Soch Liya',
    'Muskurahat',
    'Tu Hain Toh Main Hoon',
    'Mohabbat Barsa De',
    'Ashbo Phire',
    'Chahun Main Ya Naa',
    'Hum Mar Jayenge',
    'Kasturi'
]

bpm_map = {
    'Ve Maahi': 82, 'Ae Dil Hai Mushkil Title Track': 88, 'The Breakup Song': 128, 'Channa Mereya': 76,
    'Heeriye (feat. Arijit Singh)': 84, 'Agar Tum Saath Ho': 80, 'Tu Hai Champion': 118,
    'Nashe Si Chadh Gayi': 120, 'Anuvanuvuu': 86, 'Chaleya': 124, 'Phir Aur Kya Chahiye': 88,
    'Tujhe Kitna Chahne Lage': 80, 'Apna Bana Le': 86, 'Tere Hawaale': 82, 'Main Dhoondne Ko Zamaane Mein': 78,
    'Lambiyaan Si Judaiyaan': 82, 'Ishq Mubarak': 80, 'Fitoor': 86, 'Gazab Ka Hain Yeh Din': 90,
    'Love Me Thoda Aur': 94, 'Meri Aashiqui': 76, 'Chal Wahan Jaate Hain': 88, 'Intezaar': 82,
    'Ik Vaari Aa': 122, 'Janam Janam': 86, 'Gerua': 88, 'Kaala Jaadu': 116, 'Enna Sona': 82,
    'Akhiyaan Milavanga': 86, 'Naam Na Jana Pakhi (Male Version)': 80, 'Naam Na Jana Pakhi (Duet Version)': 80,
    'Bismillah Title Track': 112, 'Salamat': 84, 'Khamoshiyan': 78, 'Tu Har Lamha': 80,
    'Darkhaast': 90, 'Bojhena Shey Bojhena (Male Version)': 78, 'Mon Majhi Re': 84, 'Soch Liya': 84,
    'Muskurahat': 80, 'Tu Hain Toh Main Hoon': 88, 'Mohabbat Barsa De': 86, 'Ashbo Phire': 84,
    'Chahun Main Ya Naa': 82, 'Hum Mar Jayenge': 80, 'Kasturi': 84
}

new_added_count = 0
for title in ordered_titles:
    n = re.sub(r'[^a-z0-9]', '', title.lower())
    if n in existing_norms:
        print(f"Skipping already present: {title}")
        continue

    meta = itunes_data.get(title, {})
    album = meta.get('album', '')
    artist = meta.get('artistName', 'Arijit Singh')
    # Format artist cleanly with bullet
    clean_artist = artist.replace('&', '•').replace(',', ' •')

    safe_name = title.replace('?', '').replace('/', '-').replace(':', ' -')
    cover_path = f"song/covers/{safe_name}.jpg"
    
    # Audio path
    src_path = f"song/{safe_name}.m4a"
    if not os.path.exists(src_path):
        if os.path.exists(f"song/{safe_name}.mp3"):
            src_path = f"song/{safe_name}.mp3"
        elif os.path.exists(f"song/{title}.m4a"):
            src_path = f"song/{title}.m4a"
        elif os.path.exists(f"song/{title}.mp3"):
            src_path = f"song/{title}.mp3"
        else:
            # check any file starting with safe_name
            for f in os.listdir('song'):
                if f.startswith(safe_name) and f.endswith(('.m4a', '.mp3', '.webm', '.opus', '.mp4')):
                    src_path = f"song/{f}"
                    break

    color = get_dominant_color(cover_path)
    glow = color
    glowSoft = hex_to_rgba(color, 0.40)
    bpm = bpm_map.get(title, 84)

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
    new_added_count += 1
    print(f"+ ADDED: {title} ({album}) | {color}")

print(f"\nSuccessfully created {new_added_count} new track objects! Total playlist tracks: {len(unified_playlist)}")

with open('scripts/unified_playlist.json', 'w', encoding='utf-8') as f:
    json.dump(unified_playlist, f, indent=4)

# Now inject into js/navbar.js
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

print("SUCCESS: Injected updated MASTER_PLAYLIST with all new songs into js/navbar.js!")
