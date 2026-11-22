import os, sys, json, time, re
from concurrent.futures import ThreadPoolExecutor, as_completed
import yt_dlp

with open('scripts/new_songs_itunes.json', 'r', encoding='utf-8') as f:
    songs_data = json.load(f)

queries = {
    'Ve Maahi': 'Ve Maahi Kesari Arijit Singh audio',
    'Ae Dil Hai Mushkil Title Track': 'Ae Dil Hai Mushkil Title Track Arijit Singh audio',
    'The Breakup Song': 'The Breakup Song Ae Dil Hai Mushkil Arijit Singh audio',
    'Channa Mereya': 'Channa Mereya Arijit Singh audio',
    'Heeriye (feat. Arijit Singh)': 'Heeriye Jasleen Royal Arijit Singh audio',
    'Agar Tum Saath Ho': 'Agar Tum Saath Ho Tamasha Arijit Singh audio',
    'Tu Hai Champion': 'Tu Hai Champion Chandu Champion Arijit Singh audio',
    'Nashe Si Chadh Gayi': 'Nashe Si Chadh Gayi Befikre Arijit Singh audio',
    'Anuvanuvuu': 'Anuvanuvuu Om Bheem Bush Arijit Singh audio',
    'Chaleya': 'Chaleya Jawan Arijit Singh audio',
    'Phir Aur Kya Chahiye': 'Phir Aur Kya Chahiye Zara Hatke Zara Bachke Arijit Singh audio',
    'Tujhe Kitna Chahne Lage': 'Tujhe Kitna Chahne Lage Kabir Singh Arijit Singh audio',
    'Apna Bana Le': 'Apna Bana Le Bhediya Arijit Singh audio',
    'Tere Hawaale': 'Tere Hawaale Laal Singh Chaddha Arijit Singh audio',
    'Main Dhoondne Ko Zamaane Mein': 'Main Dhoondne Ko Zamaane Mein Heartless Arijit Singh audio',
    'Lambiyaan Si Judaiyaan': 'Lambiyaan Si Judaiyaan Raabta Arijit Singh audio',
    'Ishq Mubarak': 'Ishq Mubarak Tum Bin 2 Arijit Singh audio',
    'Fitoor': 'Fitoor Shamshera Arijit Singh audio',
    'Gazab Ka Hain Yeh Din': 'Gazab Ka Hain Yeh Din Sanam Re Arijit Singh audio',
    'Love Me Thoda Aur': 'Love Me Thoda Aur Yaariyan Arijit Singh audio',
    'Meri Aashiqui': 'Meri Aashiqui Aashiqui 2 Arijit Singh audio',
    'Chal Wahan Jaate Hain': 'Chal Wahan Jaate Hain Arijit Singh audio',
    'Intezaar': 'Intezaar Arijit Singh Mithoon audio',
    'Ik Vaari Aa': 'Ik Vaari Aa Raabta Arijit Singh audio',
    'Janam Janam': 'Janam Janam Dilwale Arijit Singh audio',
    'Gerua': 'Gerua Dilwale Arijit Singh audio',
    'Kaala Jaadu': 'Kaala Jaadu Freddy Arijit Singh audio',
    'Enna Sona': 'Enna Sona OK Jaanu Arijit Singh audio',
    'Akhiyaan Milavanga': 'Akhiyaan Milavanga Commando 3 Arijit Singh audio',
    'Naam Na Jana Pakhi (Male Version)': 'Naam Na Jana Pakhi Male Version Arijit Singh audio',
    'Naam Na Jana Pakhi (Duet Version)': 'Naam Na Jana Pakhi Duet Arijit Singh Shreya Ghoshal audio',
    'Bismillah Title Track': 'Bismillah Title Track Arijit Singh audio',
    'Salamat': 'Salamat Sarbjit Arijit Singh audio',
    'Khamoshiyan': 'Khamoshiyan Title Track Arijit Singh audio',
    'Tu Har Lamha': 'Tu Har Lamha Khamoshiyan Arijit Singh audio',
    'Darkhaast': 'Darkhaast Shivaay Arijit Singh audio',
    'Bojhena Shey Bojhena (Male Version)': 'Bojhena Shey Bojhena Male Version Arijit Singh audio',
    'Mon Majhi Re': 'Mon Majhi Re Boss Arijit Singh audio',
    'Soch Liya': 'Soch Liya Radhe Shyam Arijit Singh audio',
    'Muskurahat': 'Muskurahat Gangubai Kathiawadi Arijit Singh audio',
    'Tu Hain Toh Main Hoon': 'Tu Hain Toh Main Hoon Sky Force Arijit Singh audio',
    'Mohabbat Barsa De': 'Mohabbat Barsa De Creature 3D Arijit Singh audio',
    'Ashbo Phire': 'Ashbo Phire Bagha Jatin Arijit Singh audio',
    'Chahun Main Ya Naa': 'Chahun Main Ya Naa Aashiqui 2 audio',
    'Hum Mar Jayenge': 'Hum Mar Jayenge Aashiqui 2 audio',
    'Kasturi': 'Kasturi Amar Prem Ki Prem Kahani Arijit Singh audio'
}

progress_file = 'scripts/downloaded_new_songs.json'
downloaded = {}
if os.path.exists(progress_file):
    try:
        with open(progress_file, 'r', encoding='utf-8') as f:
            downloaded = json.load(f)
    except:
        pass

def download_single_song(title):
    safe_name = title.replace('?', '').replace('/', '-').replace(':', ' -')
    target_m4a = f"song/{safe_name}.m4a"
    target_mp3 = f"song/{safe_name}.mp3"
    
    if os.path.exists(target_m4a):
        return title, target_m4a, True
    if os.path.exists(target_mp3):
        return title, target_mp3, True
    
    q = queries.get(title, f"{title} Arijit Singh audio")
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

print(f"Starting parallel download for {len(queries)} songs with 4 workers...")
with ThreadPoolExecutor(max_workers=4) as executor:
    futures = {executor.submit(download_single_song, t): t for t in queries}
    for future in as_completed(futures):
        t = futures[future]
        try:
            title, path, ok = future.result()
            if ok:
                downloaded[title] = path
                print(f"[OK] {title} -> {path}")
            else:
                print(f"[FAIL] {title} -> {path}")
        except Exception as e:
            print(f"[ERROR] {t} -> {e}")

with open(progress_file, 'w', encoding='utf-8') as f:
    json.dump(downloaded, f, indent=2)

print(f"All downloads finished! Total succeeded: {len(downloaded)}/{len(queries)}")
