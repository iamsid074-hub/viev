import os, sys, json, time, urllib.request, urllib.parse
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from scripts.arijit_songs_data import SONGS_METADATA

os.makedirs('song/covers', exist_ok=True)
CACHE_FILE = 'scripts/itunes_cache.json'
cache = {}
if os.path.exists(CACHE_FILE):
    try:
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            cache = json.load(f)
    except:
        pass

def fetch_itunes_meta(query):
    if query in cache:
        return cache[query]
    url = 'https://itunes.apple.com/search?' + urllib.parse.urlencode({'term': query, 'entity': 'song', 'limit': 1})
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=6) as res:
            data = json.loads(res.read().decode())
            if data['resultCount'] > 0:
                r = data['results'][0]
                art = r.get('artworkUrl100', '').replace('100x100bb', '600x600bb')
                info = {
                    'title': r.get('trackName'),
                    'artist': r.get('artistName'),
                    'album': r.get('collectionName'),
                    'coverUrl': art,
                    'previewUrl': r.get('previewUrl')
                }
                cache[query] = info
                return info
    except Exception as e:
        pass
    return None

print(f"Fetching artwork & metadata for {len(SONGS_METADATA)} songs...")
for idx, s in enumerate(SONGS_METADATA):
    q = s.get('q', s['title'] + ' ' + s.get('movie', '') + ' Arijit Singh')
    meta = fetch_itunes_meta(q)
    if not meta:
        meta = fetch_itunes_meta(s['title'] + ' Arijit Singh')
    
    cover_path = f"song/covers/{s['title']}.jpg"
    if meta and meta.get('coverUrl') and not os.path.exists(cover_path):
        try:
            urllib.request.urlretrieve(meta['coverUrl'], cover_path)
        except:
            pass

    if (idx + 1) % 15 == 0:
        print(f"Processed {idx + 1}/{len(SONGS_METADATA)}...")
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache, f, indent=2)

with open(CACHE_FILE, 'w', encoding='utf-8') as f:
    json.dump(cache, f, indent=2)

print("Artwork & Metadata fetch complete! Covers saved in song/covers/")
