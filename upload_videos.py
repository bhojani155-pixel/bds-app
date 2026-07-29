import os
import cloudinary
import cloudinary.api
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

# 📁 आपके लोकल फ़ोल्डर का नाम (जिसके अंदर gujarati, hindi आदि हैं)
TARGET_MAIN_FOLDER = "videos"  # या जो भी आपके कंप्यूटर के फ़ोल्डर का सही नाम हो


def upload_videos_direct_to_app_path(main_folder_path):
    print("--- 🚀 ऐप के सही फ़ोल्डर पाथ में वीडियो अपलोड शुरू ---")

    if not os.path.exists(main_folder_path):
        print(f"❌ फ़ोल्डर नहीं मिला: {main_folder_path}")
        return

    ALLOWED_EXTENSIONS = (".mp4", ".mov", ".avi", ".mkv", ".webm")

    for root, dirs, files in os.walk(main_folder_path):
        video_files = [
            f
            for f in files
            if os.path.splitext(f)[1].lower() in ALLOWED_EXTENSIONS
        ]
        if not video_files:
            continue

        # फ़ाइलों को 1, 2, 3 नंबर के क्रम से सॉर्ट करना
        video_files.sort(
            key=lambda x: int(os.path.splitext(x)[0])
            if os.path.splitext(x)[0].isdigit()
            else x
        )

        # 🎯 मुख्य सुधार: 'videos' नाम को Cloudinary पाथ से हटा दिया है
        # अब यह डायरेक्ट "gujarati/motivation" जैसा फ़ोल्डर बनाएगा
        rel_folder = os.path.relpath(root, main_folder_path)

        if rel_folder == ".":
            cloudinary_folder = ""
        else:
            cloudinary_folder = rel_folder.replace("\\", "/")

        # ऑटो टैग्स तैयार करना (जैसे: ['gujarati', 'motivation'])
        folder_parts = (
            cloudinary_folder.split("/") if cloudinary_folder else []
        )

        print("\n" + "=" * 65)
        print(
            f"📂 Cloudinary फ़ोल्डर: [{cloudinary_folder or 'Main Root'}]"
        )
        print(f"🏷️  टैग्स: {folder_parts}")
        print(f"🎥 कुल वीडियो: {len(video_files)}")
        print("=" * 65)

        for file in video_files:
            local_file_path = os.path.join(root, file)
            filename_clean = os.path.splitext(file)[0]

            try:
                print(f"⏳ अपलोड हो रहा है: {file} ...")
                response = cloudinary.uploader.upload(
                    local_file_path,
                    folder=cloudinary_folder,  # डायरेक्ट gujarati/motivation
                    public_id=filename_clean,
                    tags=folder_parts,
                    resource_type="video",
                    overwrite=True,
                    invalidate=True,
                )
                print(
                    f"✅ सफलता! {file} ➔ {cloudinary_folder}/{filename_clean}"
                )
            except Exception as e:
                print(f"❌ एरर {file} में: {e}")

    print("\n🎉 वीडियो सही पाथ पर अपलोड हो चुके हैं! अब ऐप चेक करें।")


if __name__ == "__main__":
    upload_videos_direct_to_app_path(TARGET_MAIN_FOLDER)