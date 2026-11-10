import json, re

with open('scripts/unified_playlist.json', 'r', encoding='utf-8') as f:
    playlist = json.load(f)

# Convert playlist to formatted JS string
js_code = "const MASTER_PLAYLIST = " + json.dumps(playlist, indent=4) + ";"

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

print("Successfully injected MASTER_PLAYLIST into js/navbar.js!")
