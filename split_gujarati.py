import os
from moviepy import VideoFileClip

# गुजराती वीडियो का सही पाथ
video_path = r"C:\Users\gopal\Videos\New folder\gujarati suvihar.mp4"

# गुजराती क्लिप्स के लिए फोल्डर
output_dir = r"C:\Users\gopal\OneDrive\Desktop\daily-status\split_clips_gujarati"
os.makedirs(output_dir, exist_ok=True)

print("--- 🎬 कटिंग और कंप्रेशन एक साथ शुरू हो रहा है... ---")

# वीडियो लोड करें
clip = VideoFileClip(video_path)
fps = clip.fps 
total_frames = int(clip.duration * fps) 

num_clips = 187  # अपनी जरूरत के हिसाब से नंबर रख लें
frames_per_clip = total_frames // num_clips  

print(f"कुल समय: {clip.duration:.3f} सेकंड")
print(f"कुल फ्रेम्स: {total_frames}")
print(f"कुल क्लिप्स बनेंगी: {num_clips}")

# फ्रेम-टू-फ्रेम काटना और साथ में कंप्रेस करना
for i in range(num_clips):
    start_frame = i * frames_per_clip
    end_frame = (i + 1) * frames_per_clip if i < num_clips - 1 else total_frames
    
    subclip = clip.subclipped(start_frame / fps, end_frame / fps)
    output_file = os.path.join(output_dir, f"gujarati_clip_{i+1}.mp4")
    
    # यहाँ bitrate="1000k" जोड़ने से वीडियो साथ ही कंप्रेस होकर सेव होगी
    subclip.write_videofile(
        output_file, 
        codec="libx264", 
        audio_codec="aac", 
        bitrate="1000k", 
        fps=fps,
        logger=None
    )
    print(f"✅ क्लिप {i+1}/{num_clips} कटकर कंप्रेस हो गई!")

clip.close()
print("\n🎉 शानदार! सभी क्लिप्स कट भी गईं और साथ में कंप्रेस भी हो गईं!")