import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

# 1. .env फ़ाइल लोड करें
load_dotenv()

# 2. क्लाउडिनरी कॉन्फ़िगरेशन (.env से सुरक्षित रूप से पढ़ें)
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


def start_bulk_photo_upload(base_path):
    print("--- 🚀 फोटो अपलोडिंग शुरू हो रही है... ---")

    if not os.path.exists(base_path):
        print(f"❌ फ़ोल्डर नहीं मिला: {base_path}")
        return

    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                local_file_path = os.path.join(root, file)

                # सीधा फिक्स नाम दे दिया ताकि कोई एरर न आए
                cloudinary_folder = "hindi/bhakti"
                auto_tag = "hindi-bhakti"

                print(f"\n[अपलोड हो रहा है]: {file}")
                print(f" ➔ क्लाउडिनरी फोल्डर: {cloudinary_folder}")
                print(f" ➔ ऑटो-टैग: {auto_tag}")

                try:
                    response = cloudinary.uploader.upload(
                        local_file_path,
                        folder=cloudinary_folder,
                        tags=[auto_tag],  # ऑटोमैटिक टैग लग जाएगा
                        resource_type="image",  # फ़ोटो के रूप में अपलोड
                    )
                    print(
                        f"✅ सफलता! फ़ोटो लिंक: {response['secure_url']}"
                    )
                except Exception as e:
                    print(f"❌ एरर {file} में: {e}")

    print("\n🎉 सभी फोटो सफलता से अपलोड और टैग हो चुके हैं!")


# 3. आपके कंप्यूटर में हिंदी भक्ति फ़ोटो फ़ोल्डर का रास्ता
MAIN_PHOTOS_FOLDER = "C://Users//gopal//OneDrive//Desktop//daily-status//images//hindi//bhakti"

start_bulk_photo_upload(MAIN_PHOTOS_FOLDER)