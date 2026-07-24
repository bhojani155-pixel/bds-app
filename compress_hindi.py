import os
from moviepy import VideoFileClip

# हिंदी कटी हुई क्लिप्स का फोल्डर
input_dir = r"C:\Users\gopal\OneDrive\Desktop\daily-status\split_clips"

# कंप्रेस होने के बाद हिंदी क्लिप्स इस नए फोल्डर में जाएंगी
output_dir = r"C:\Users\gopal\OneDrive\Desktop\daily-status\compressed_clips_hindi"
os.makedirs(output_dir, exist_ok=True)

print("--- 🚀 हिंदी क्लिप्स का कंप्रेशन शुरू हो रहा है... ---")

files = [f for f in os.listdir(input_dir) if f.endswith(".mp4")]
total_files = len(files)
print(f"कुल {total_files} हिंदी वीडियो फाइलें मिली हैं।")

for index, filename in enumerate(files, start=1):
    input_path = os.path.join(input_dir, filename)
    output_path = os.path.join(output_dir, filename)
    
    print(f"[{index}/{total_files}] हिंदी: {filename} कंप्रेस हो रही है...")
    
    try:
        clip = VideoFileClip(input_path)
        clip.write_videofile(
            output_path,
            codec="libx264",
            audio_codec="aac",
            bitrate="800k",
            fps=clip.fps,
            logger=None
        )
        clip.close()
        print(f"✅ {filename} कम्पलीट!")
    except Exception as e:
        print(f"❌ एरर आया {filename} में: {e}")

print("\n🎉 बधाई हो गोपाल भाई! हिंदी की सभी क्लिप्स कंप्रेस होकर तैयार हो चुकी हैं!")