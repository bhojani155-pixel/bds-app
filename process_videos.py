import os
import random
import shutil
import subprocess

# 1. फोल्डर पाथ
input_folder = "my_original_videos"  # ओरिजिनल वीडियो वाला फोल्डर
music_folder = "background_music"  # म्यूज़िक फाइलों वाला फोल्डर
output_folder = "compressed_videos"  # आउटपुट फोल्डर

# 🧹 पुरानी फाइलों को ऑटोमैटिक डिलीट/साफ करने का लॉजिक
if os.path.exists(output_folder):
    shutil.rmtree(output_folder)  # पुराना सारा कचरा साफ़ कर देगा
os.makedirs(output_folder, exist_ok=True)

# ⚙️ सेटिंग्स
bg_volume = "0.3"  # 30% म्यूज़िक वॉल्यूम
crf_value = "32"  # MB साइज़ बहुत छोटा करने के लिए (28 से बेहतर)

# 2. बैकग्राउंड म्यूज़िक लिस्ट
music_files = [
    os.path.join(music_folder, f)
    for f in os.listdir(music_folder)
    if f.lower().endswith((".mp3", ".wav", ".m4a", ".aac"))
]

if not music_files:
    print(
        "❌ एरर: 'background_music' फोल्डर में कोई गाना/ऑडियो फाइल नहीं मिली!"
    )
    exit()

# 3. सभी वीडियो लिस्ट
video_files = [
    f
    for f in os.listdir(input_folder)
    if f.lower().endswith((".mp4", ".mov", ".avi", ".mkv"))
]

print(
    f"🧹 'compressed_videos' फ़ोल्डर साफ़ कर दिया गया है।\n🎬 कुल {len(video_files)} वीडियो नए सिरे से 1.mp4, 2.mp4 नाम से बनने शुरू हो रहे हैं...\n"
)

# 4. प्रोसेसिंग और नंबरिंग शुरू
for index, filename in enumerate(video_files, start=1):
    in_path = os.path.join(input_folder, filename)

    # 🔢 1.mp4, 2.mp4, 3.mp4 नामकरण
    out_filename = f"{index}.mp4"
    out_path = os.path.join(output_folder, out_filename)

    # 🎲 रैंडम गाना चुनना
    selected_music = random.choice(music_files)
    music_name = os.path.basename(selected_music)

    print(
        f"[{index}/{len(video_files)}] Processing: {filename} ➔ {out_filename} (Music: {music_name})"
    )

    # FFmpeg कमांड: बहुत कम MB + 1.mp4 नंबरिंग + धीमा म्यूज़िक
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        in_path,
        "-stream_loop",
        "-1",
        "-i",
        selected_music,
        "-c:v",
        "libx264",
        "-crf",
        crf_value,
        "-preset",
        "fast",
        "-filter:a",
        f"volume={bg_volume}",
        "-c:a",
        "aac",
        "-b:a",
        "96k",
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-shortest",
        out_path,
    ]

    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

print(
    "\n🎉 काम पूरा हो गया! पुराना कचरा साफ़ करके सारे वीडियो 1.mp4, 2.mp4... नाम से तैयार हैं!"
)