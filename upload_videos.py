import os
import cloudinary
import cloudinary.api
import cloudinary.uploader
from dotenv import load_dotenv

# 1. .env से क्रैडेंशियल्स लोड करें
load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


def smart_bulk_upload(main_folder_path):
    print(
        "--- 🚀 स्मार्ट अपलोड शुरू (ऑटो-फ़ोल्डर + स्मार्ट स्किप सिस्टम) ---"
    )

    if not os.path.exists(main_folder_path):
        print(f"❌ फ़ोल्डर नहीं मिला: {main_folder_path}")
        return

    # पूरे फ़ोल्डर और उसके अंदर के सब-फ़ोल्डर्स में घूमना
    for root, dirs, files in os.walk(main_folder_path):
        for file in files:
            ext = os.path.splitext(file)[1].lower()

            # 1. फोटो है या वीडियो? पहचानें
            if ext in [".jpg", ".jpeg", ".png", ".webp"]:
                resource_type = "image"
            elif ext in [".mp4", ".mov", ".avi", ".mkv"]:
                resource_type = "video"
            else:
                continue  # अगर कोई और फाइल है तो छोड़ दें

            local_file_path = os.path.join(root, file)
            file_size_bytes = os.path.getsize(local_file_path)

            # 2. 🪄 ऑटो-फ़ोल्डर जादू (कंप्यूटर के फ़ोल्डर स्ट्रक्चर को Cloudinary का पाथ बनाना)
            rel_folder = os.path.relpath(root, main_folder_path)
            if rel_folder == ".":
                cloudinary_folder = ""
            else:
                cloudinary_folder = rel_folder.replace("\\", "/")  # Windows path fix

            filename_without_ext = os.path.splitext(file)[0]

            # Cloudinary में इसका पूरा नाम/पाथ क्या होगा
            if cloudinary_folder:
                public_id = f"{cloudinary_folder}/{filename_without_ext}"
                auto_tag = cloudinary_folder.replace("/", "-")
            else:
                public_id = filename_without_ext
                auto_tag = "general"

            # 3. 🧠 स्मार्ट स्किप: क्या फाइल पहले से Cloudinary पर सेम साइज़ की है?
            try:
                existing_info = cloudinary.api.resource(
                    public_id, resource_type=resource_type
                )
                # अगर फाइल मिल गई और उसका साइज भी बिल्कुल बराबर है:
                if existing_info.get("bytes") == file_size_bytes:
                    print(
                        f"⏩ [SKIP] {file} पहले से ही Cloudinary पर सुरक्षित है (दोबारा अपलोड नहीं होगा)।"
                    )
                    continue
                else:
                    print(
                        f"🔄 [UPDATE] {file} में बदलाव मिला है, नया वाला अपलोड किया जा रहा है..."
                    )
            except Exception:
                # अगर Cloudinary पर फाइल नहीं मिली, तो यह नई फाइल है
                print(
                    f"\n[NEW UPLOAD]: {file} ➔ फ़ोल्डर: [{cloudinary_folder or 'Main'}]"
                )

            # 4. अपलोडिंग
            try:
                response = cloudinary.uploader.upload(
                    local_file_path,
                    folder=cloudinary_folder,
                    public_id=filename_without_ext,
                    tags=[auto_tag],
                    resource_type=resource_type,
                    overwrite=True,
                )
                print(f"✅ सफलता! लिंक: {response['secure_url']}")
            except Exception as e:
                print(f"❌ एरर {file} में: {e}")

    print("\n🎉 सारा काम पूरा हो गया! सभी फ़ोल्डर, वीडियो और फोटो सिंक हो चुके हैं।")


# 📁 आपके कंप्यूटर का मुख्य फ़ोल्डर
# अगर आपको "videos" फ़ोल्डर अपलोड करना है तो यहाँ "videos" लिखें, अगर "compressed_videos" करना है तो वो लिखें
TARGET_MAIN_FOLDER = "videos"

smart_bulk_upload(TARGET_MAIN_FOLDER)