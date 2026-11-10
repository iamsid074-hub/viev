import os, sys, time, json
import yt_dlp
sys.path.insert(0, '.')
from scripts.arijit_songs_data import SONGS_METADATA

ydl_opts = {
    'format': 'ba[ext=m4a]/ba/b',
    'outtmpl': 'song/%(title)s.%(ext)s',
    'quiet': True,
    'no_warnings': True,
    'noplaylist': True
}

downloaded_log = 'scripts/downloaded_songs.json'
downloaded = {}
if os.path.exists(downloaded_log):
    try:
        with open(downloaded_log, 'r', encoding='utf-8') as f:
            downloaded = json.load(f)
    except:
        pass

print(f"Starting audio download check for {len(SONGS_METADATA)} songs...")

for idx, s in enumerate(SONGS_METADATA):
    title = s['title']
    safe_name = title.replace('?', '').replace('/', '-').replace(':', ' -')
    target_m4a = f"song/{safe_name}.m4a"
    target_mp3 = f"song/{safe_name}.mp3"
    
    # Check if existing source exists
    if s.get('existing_src') and os.path.exists(s['existing_src']):
        downloaded[title] = s['existing_src']
        continue
    
    if os.path.exists(target_m4a):
        downloaded[title] = target_m4a
        continue
    if os.path.exists(target_mp3):
        downloaded[title] = target_mp3
        continue

    q = s.get('q', title + ' ' + s.get('movie', '') + ' Arijit Singh audio')
    print(f"[{idx+1}/{len(SONGS_METADATA)}] Downloading: {title}...")
    
    ydl_opts['outtmpl'] = f"song/{safe_name}.%(ext)s"
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([f"ytsearch1:{q}"])
            if os.path.exists(target_m4a):
                downloaded[title] = target_m4a
                print(f"  -> SUCCESS: {target_m4a}")
            elif os.path.exists(target_mp3):
                downloaded[title] = target_mp3
                print(f"  -> SUCCESS: {target_mp3}")
            else:
                # Find whatever extension was saved
                for f in os.listdir('song'):
                    if f.startswith(safe_name) and f.endswith(('.m4a', '.mp3', '.webm', '.opus')):
                        downloaded[title] = f"song/{f}"
                        print(f"  -> SUCCESS: song/{f}")
                        break
    except Exception as e:
        print(f"  -> Error downloading {title}: {e}")

    with open(downloaded_log, 'w', encoding='utf-8') as f:
        json.dump(downloaded, f, indent=2)
    time.sleep(1)

print("Audio download loop completed!")
