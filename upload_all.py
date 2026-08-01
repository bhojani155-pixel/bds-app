import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

# 1. .env फ़ाइल से API Keys सुरक्षित रूप से लोड करें
load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

# 📁 कंप्यूटर में मेन फ़ोल्डर का पाथ (जहाँ images और videos दोनों हैं)
BASE_DIR = r"C:\daily-status" 


def upload_media_files(base_path):
    print("=" * 70)
    print("🚀 Master Uploader: फोटो और वीडियो ऑटो-अपलोड शुरू हो रहा है...")
    print("=" * 70)

    if not os.path.exists(base_path):
        print(f"❌ फ़ोल्डर नहीं मिला: {base_path}")
        return

    IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".webp")
    VIDEO_EXTS = (".mp4", ".mov", ".avi", ".mkv", ".webm")

    for root, dirs, files in os.walk(base_path):
        rel_path = os.path.relpath(root, base_path)

        # 🛑 अगर फाइल मेन रूट (C:\daily-status) में ही रखी है, तो उसे स्किप कर दें
        if rel_path == ".":
            continue

        # केवल इमेजेस और वीडियोज़ फ़िल्टर करें
        valid_files = [
            f for f in files 
            if f.lower().endswith(IMAGE_EXTS) or f.lower().endswith(VIDEO_EXTS)
        ]

        if not valid_files:
            continue

        # 🎯 सुरक्षित सॉर्टिंग: नंबर वाली फाइलें पहले (1,2..), नाम वाली फाइलें बाद में
        valid_files.sort(
            key=lambda x: (
                0, int(os.path.splitext(x)[0])
            ) if os.path.splitext(x)[0].isdigit() else (1, x)
        )

        # 'images' या 'videos' को Cloudinary पाथ से हटाकर डायरेक्ट "hindi/bhakti" या "gujarati/love" बनाना
        path_parts = rel_path.split(os.sep)

        # अगर पहला फोल्डर 'images' या 'videos' है तो उसे Cloudinary पाथ से हटा दें
        if path_parts[0].lower() in ['images', 'videos']:
            cloudinary_folder = "/".join(path_parts[1:]) if len(path_parts) > 1 else ""
        else:
            cloudinary_folder = rel_path.replace("\\", "/")

        if cloudinary_folder == ".":
            cloudinary_folder = ""

        # 🏷️ ऑटो टैग्स तैयार करना
        folder_tags = [tag for tag in cloudinary_folder.split("/") if tag]

        # 🎯 मुख्य सुधार: अगर 2 या उससे ज़्यादा फ़ोल्डर हैं (उदा. 'gujarati' और 'love'), 
        # तो 'gujarati-love' जैसा कंबाइंड (डैश वाला) टैग भी जोड़ें
        if len(folder_tags) >= 2:
            combined_tag = "-".join(folder_tags) # 'gujarati-love' बनेगा
            folder_tags.append(combined_tag)

        print("\n" + "-" * 70)
        print(f"📂 Cloudinary फ़ोल्डर: [{cloudinary_folder or 'Main Root'}]")
        print(f"🏷️  टैग्स: {folder_tags}")
        print(f"📦 कुल फ़ाइलें: {len(valid_files)}")
        print("-" * 70)

        for file in valid_files:
            local_file_path = os.path.join(root, file)
            filename_clean = os.path.splitext(file)[0]
            ext = os.path.splitext(file)[1].lower()

            # रिसोर्स टाइप तय करना (video / image)
            resource_type = "video" if ext in VIDEO_EXTS else "image"

            try:
                print(f"⏳ [{resource_type.upper()}] टैग और अपलोड अपडेट हो रहा है: {file} ...")
                response = cloudinary.uploader.upload(
                    local_file_path,
                    folder=cloudinary_folder,
                    public_id=filename_clean,
                    tags=folder_tags,
                    resource_type=resource_type,
                    overwrite=True,
                    invalidate=True,
                )
                print(f"✅ सफलता! ➔ {cloudinary_folder}/{filename_clean}")
            except Exception as e:
                print(f"❌ एरर ({file}): {e}")

    print("\n🎉 सभी फोटो और वीडियो सफलता से अपलोड और सही टैग्स के साथ अपडेट हो चुके हैं!")


if __name__ == "__main__":
    upload_media_files(BASE_DIR)