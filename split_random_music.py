import os
import random
import subprocess

# 📁 फ़ोल्डर पाथ
BIG_VIDEOS_FOLDER = "big_videos"
MUSIC_FOLDER = "bg_music"
OUTPUT_MAIN_FOLDER = "output_clips"

# 🎬 आपके तीनों वीडियो और उनकी क्लिप्स की संख्या
VIDEO_CONFIG = [
    {"file": "video1.mp4", "clips": 80},  # पहला वीडियो -> 80 क्लिप्स
    {"file": "video2.mp4", "clips": 80},  # दूसरा वीडियो -> 80 क्लिप्स
    {"file": "video3.mp4", "clips": 36},  # तीसरा वीडियो -> 36 क्लिप्स
]


def get_video_duration(video_path):
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        video_path,
    ]
    result = subprocess.run(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT
    )
    return float(result.stdout)


def process_all_videos():
    if not os.path.exists(BIG_VIDEOS_FOLDER) or not os.path.exists(
        MUSIC_FOLDER
    ):
        print(f"❌ '{BIG_VIDEOS_FOLDER}' या '{MUSIC_FOLDER}' फ़ोल्डर नहीं मिला!")
        return

    music_files = [
        os.path.join(MUSIC_FOLDER, f)
        for f in os.listdir(MUSIC_FOLDER)
        if f.lower().endswith((".mp3", ".wav", ".m4a"))
    ]

    if not music_files:
        print("❌ 'bg_music' फ़ोल्डर में कोई MP3 गाना नहीं मिला!")
        return

    print(f"🎵 कुल {len(music_files)} गाने मिले हैं।\n")

    for item in VIDEO_CONFIG:
        video_filename = item["file"]
        target_clips = item["clips"]
        video_path = os.path.join(BIG_VIDEOS_FOLDER, video_filename)

        if not os.path.exists(video_path):
            print(
                f"⚠️ चेतावनी: '{video_filename}' नहीं मिला! इसे स्किप किया जा रहा है।\n"
            )
            continue

        video_name = os.path.splitext(video_filename)[0]
        out_dir = os.path.join(OUTPUT_MAIN_FOLDER, video_name)
        os.makedirs(out_dir, exist_ok=True)

        total_duration = get_video_duration(video_path)
        clip_length = total_duration / target_clips

        print("=" * 60)
        print(f"▶️ शुरू किया जा रहा है: {video_filename}")
        print(f"   ⏱️ कुल समय: {total_duration:.1f}s")
        print(
            f"   🎯 कुल क्लिप्स बनेंगी: {target_clips} (हर क्लिप: {clip_length:.2f}s)"
        )
        print("=" * 60)

        start_time = 0.0
        count = 1

        while count <= target_clips and start_time < total_duration:
            output_filename = os.path.join(out_dir, f"{count}.mp4")

            selected_music = random.choice(music_files)
            music_name = os.path.basename(selected_music)

            # 🎯 सही FFmpeg कमांड: -ss को -i (वीडियो) से पहले रखा है
            cmd = [
                "ffmpeg",
                "-y",
                "-ss",
                str(start_time),  # 👈 यह अब वीडियो को आगे बढ़ाएगा!
                "-i",
                video_path,
                "-t",
                str(clip_length),
                "-stream_loop",
                "-1",
                "-i",
                selected_music,
                "-map",
                "0:v:0",
                "-map",
                "1:a:0",
                "-c:v",
                "libx264",
                "-crf",
                "28",
                "-preset",
                "faster",
                "-vf",
                "scale=-2:1280",
                "-c:a",
                "aac",
                "-b:a",
                "128k",
                "-shortest",
                output_filename,
            ]

            subprocess.run(
                cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
            )
            print(
                f"  ✅ [{video_name}] Clip {count}/{target_clips} (समय: {start_time:.1f}s से {start_time + clip_length:.1f}s) ➔ {count}.mp4"
            )

            start_time += clip_length
            count += 1

        print(f"\n🎉 {video_filename} की सभी क्लिप्स सही से कट गईं!\n")

    print(
        "🏆 काम पूरा हो गया है! अब अलग-अलग सीन वाली क्लिप्स ही बनी हैं।"
    )


process_all_videos()