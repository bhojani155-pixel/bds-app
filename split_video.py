import os
from moviepy import VideoFileClip

# अपनी वीडियो का सही पाथ
video_path = r"C:\Users\gopal\Videos\New folder\hindi suvihar .mp4"

# जहाँ कटी हुई क्लिप्स सेव होंगी
output_dir = r"C:\Users\gopal\OneDrive\Desktop\daily-status\split_clips"
os.makedirs(output_dir, exist_ok=True)

print("--- 🎬 बिल्कुल परफेक्ट फ्रेम-टू-फ्रेम कटिंग शुरू हो रही है... ---")

# वीडियो लोड करें
clip = VideoFileClip(video_path)
fps = clip.fps  # वीडियो की फ्रेम रेट (जैसे 30 या 25 fps)
total_frames = int(clip.duration * fps) # वीडियो के कुल फ्रेम्स
num_clips = 188
frames_per_clip = total_frames // num_clips  # हर क्लिप में आने वाले पूरे-पूरे फ्रेम

print(f"कुल फ्रेम्स: {total_frames}")
print(f"हर क्लिप में पूरे फ्रेम होंगे: {frames_per_clip}")

# 188 हिस्सों में फ्रेम-टू-फ्रेम काटना
for i in range(num_clips):
    start_frame = i * frames_per_clip
    # आखिरी क्लिप में बाकी बचे सारे फ्रेम आ जाएंगे ताकि कोई हिस्सा छूटे न
    end_frame = (i + 1) * frames_per_clip if i < num_clips - 1 else total_frames
    
    # फ्रेम को सेकंड में बदलकर बिल्कुल सटीक क्लिप बनाना
    subclip = clip.subclipped(start_frame / fps, end_frame / fps)
    output_file = os.path.join(output_dir, f"clip_{i+1}.mp4")
    
    subclip.write_videofile(
        output_file, 
        codec="libx264", 
        audio_codec="aac", 
        fps=fps,
        logger=None
    )
    print(f"✅ क्लिप {i+1}/{num_clips} तैयार हो गई!")

clip.close()
print("\n🎉 बधाई हो गोपाल भाई! सभी 188 क्लिप्स अब बिना किसी फ्लैश या ओवरलैप के बिल्कुल मक्खन जैसी साफ़ कटी हैं!")