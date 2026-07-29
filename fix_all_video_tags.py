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


def bulk_fix_video_tags():
    print("--- 🚀 स्मार्ट बल्क टैगिंग शुरू (Rate Limit Saver) ---")

    # आपकी ऐप की सभी मुख्य कैटेगिरी वाले फ़ोल्डर्स
    target_folders = [
        "gujarati/bhakti",
        "gujarati/love",
        "gujarati/motivation",
        "gujarati/sad",
        "hindi/bhakti",
        "hindi/love",
        "hindi/motivation",
        "hindi/sad",
    ]

    for folder in target_folders:
        folder_parts = folder.split("/")
        tag1 = folder_parts[0]  # जैसे: gujarati
        tag2 = folder_parts[1]  # जैसे: bhakti
        combined_tag = f"{tag1}-{tag2}"  # जैसे: gujarati-bhakti

        print(f"\n📂 फ़ोल्डर स्कैन हो रहा है: [{folder}]")

        try:
            # फ़ोल्डर के सभी वीडियो को एक साथ ढूँढना
            search_res = (
                cloudinary.Search()
                .expression(f"folder:{folder} AND resource_type:video")
                .max_results(500)
                .execute()
            )
            resources = search_res.get("resources", [])

            if not resources:
                print("  ⏩ कोई वीडियो नहीं मिला।")
                continue

            public_ids = [r["public_id"] for r in resources]
            print(
                f"  🎥 {len(public_ids)} वीडियो मिले। टैग्स 1 झटके में लग रहे हैं..."
            )

            # 🎯 जादू: 1 ही API रिक्वेस्ट में 500 वीडियो पर टैग लगाना!
            cloudinary.uploader.add_tag(
                tag1, public_ids, resource_type="video"
            )
            cloudinary.uploader.add_tag(
                tag2, public_ids, resource_type="video"
            )
            cloudinary.uploader.add_tag(
                combined_tag, public_ids, resource_type="video"
            )

            print(
                f"  ✅ [सफलता] सभी {len(public_ids)} वीडियो पर तीनों टैग्स ({tag1}, {tag2}, {combined_tag}) लग गए!"
            )

        except Exception as e:
            print(f"  ❌ एरर इस फ़ोल्डर में [{folder}]: {e}")

    print("\n" + "=" * 65)
    print("🎉 सभी फ़ोल्डर्स के वीडियो में बल्क टैगिंग पूरी हो चुकी है!")
    print("=" * 65)


if __name__ == "__main__":
    bulk_fix_video_tags()