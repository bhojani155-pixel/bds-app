document.addEventListener("DOMContentLoaded", () => {

    const cloudName = "gkbhojani"; // Cloudinary Cloud Name

  // 🌐 भाषा डिक्शनरी
    const appLanguageData = {
        hindi: {
            btnFavoritesText: "❤️ पसंदीदा", btnLoveText: "❤️ लव", btnSadText: "💔 सैड", btnMotivationText: "🚀 मोटिवेशन", btnBhaktiText: "🙏 भक्ति",
            btnFavoritesPhoto: "❤️ पसंदीदा", btnLovePhoto: "❤️ लव", btnSadPhoto: "💔 सैड", btnMotivationPhoto: "🚀 मोटिवेशन", btnBhaktiPhoto: "🙏 भक्ति",
            btnFavoritesVideo: "❤️ पसंदीदा", btnLoveVideo: "❤️ लव", btnSadVideo: "💔 सैड", btnMotivationVideo: "🚀 मोटिवेशन", btnBhaktiVideo: "🙏 भक्ति",
            tabText: "📝 टेक्स्ट", tabPhotos: "📸 फोटो", tabVideos: "🎥 रील्स",
            emptyFav: "<div style='color:#aaa; text-align:center; padding:50px; grid-column: span 4;'>आपने अभी तक कुछ भी लाइक नहीं किया है! ❤️</div>",
            noPhoto: "<div style='color:#aaa; text-align:center; padding:50px; grid-column: span 4;'>कोई फोटो नहीं मिली!</div>",
            noVideo: "<div style='color:#aaa; text-align:center; padding:50px; grid-column: span 4;'>कोई वीडियो नहीं मिला!</div>"
        },
        gujarati: {
            btnFavoritesText: "❤️ મનપસંદ", btnLoveText: "❤️ પ્રેમ", btnSadText: "💔 ઉદાસ", btnMotivationText: "🚀 પ્રેરણાત્મક", btnBhaktiText: "🙏 ભક્તિ",
            btnFavoritesPhoto: "❤️ મનપસંદ", btnLovePhoto: "❤️ પ્રેમ", btnSadPhoto: "💔 ઉદાસ", btnMotivationPhoto: "🚀 પ્રેરણાત્મક", btnBhaktiPhoto: "🙏 ભક્તિ",
            btnFavoritesVideo: "❤️ મનપસંદ", btnLoveVideo: "❤️ પ્રેમ", btnSadVideo: "💔 ઉદાસ", btnMotivationVideo: "🚀 પ્રેરણાત્મક", btnBhaktiVideo: "🙏 ભક્તિ",
            tabText: "📝 લખાણ", tabPhotos: "📸 ફોટો", tabVideos: "🎥 રીલ્સ",
            emptyFav: "<div style='color:#aaa; text-align:center; padding:50px; grid-column: span 4;'>તમે હજુ સુધી કંઈપણ લાઈક કર્યું નથી! ❤️</div>",
            noPhoto: "<div style='color:#aaa; text-align:center; padding:50px; grid-column: span 4;'>કોઈ ફોટો મળ્યો નથી!</div>",
            noVideo: "<div style='color:#aaa; text-align:center; padding:50px; grid-column: span 4;'>કોઈ વિડિયો મળ્યો નથી!</div>"
        }
    };

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(err => console.error("SW Error:", err));
    }

    const tabs = { text: document.getElementById("tabText"), photos: document.getElementById("tabPhotos"), videos: document.getElementById("tabVideos") };
    const sections = { text: document.getElementById("textSection"), photos: document.getElementById("photoSection"), videos: document.getElementById("videoSection") };

    const galleryContainer = document.getElementById("autoGallery") || document.getElementById("galleryContainer");
    const reelsContainer = document.getElementById("reelsContainer");
    const txtContainer = document.getElementById("textStatusContainer");
    const darkModeBtn = document.getElementById("darkModeBtn");
    const appShareBtn = document.getElementById("appShareBtn");

    let currentAppLang = localStorage.getItem("user_app_lang") || "hindi";
    let currentTab = localStorage.getItem("bds_current_tab") || "videos";
    let currentCategory = "love";
    let videoObserver = null;
    let lightboxInstance = null;

    let cloudResources = [];
    let loadIndex = 0;
    let lazyLoadObserver = null;

    // Text status pagination variables (25 items per load)
    let currentTextSourceList = [];
    let textLoadIndex = 0;
    const textsPerLoad = 25;

    // Helper: Get robust favorites storage (object-based to prevent black boxes)
    function getFavorites() {
        const favs = JSON.parse(localStorage.getItem("bds_favorites")) || [];
        return favs.map(item => {
            if (typeof item === 'string') {
                return { id: item, url: '', type: 'unknown' };
            }
            return item;
        });
    }

    function isFavorite(itemId) {
        const favs = getFavorites();
        return favs.some(fav => fav.id === itemId);
    }

    function toggleFavoriteItem(itemObj) {
        let favs = getFavorites();
        const index = favs.findIndex(fav => fav.id === itemObj.id);
        if (index > -1) {
            favs.splice(index, 1);
            localStorage.setItem("bds_favorites", JSON.stringify(favs));
            return false;
        } else {
            favs.push(itemObj);
            localStorage.setItem("bds_favorites", JSON.stringify(favs));
            return true;
        }
    }

   function getCategoryLabel(category, lang) {
        const categoryLabels = {
            hindi: { 
                love: "लव / शायरी", 
                sad: "सैड / शायरी", 
                motivation: "मोटिवेशन / सुविचार", 
                bhakti: "भक्ति / आराधना", 
                favorites: "पसंदीदा स्टेटस" 
            },
            gujarati: { 
                love: "પ્રેમ / શાયરી", 
                sad: "ઉદાસ / શાયરી", 
                motivation: "પ્રેરણાત્મક / સુવાક્ય", 
                bhakti: "ભક્તિ / આરાધના", 
                favorites: "મનપસંદ સ્ટેટસ" 
            }
        };
        return (categoryLabels[lang] && categoryLabels[lang][category]) || category;
    }

    // 👤 यूजर प्रोफाइल सेटअप
    const savedName = localStorage.getItem('bds_user_name');
    const icon = document.getElementById('user-initial');
    if(icon) icon.innerText = savedName ? savedName.charAt(0).toUpperCase() : "👤"; 

    window.openProfile = function() {
        const modal = document.getElementById("profileModal");
        if (modal) {
            modal.style.display = "block";
            const name = localStorage.getItem("bds_user_name");
            if(name) {
                document.getElementById("displayName").innerText = "नमस्ते, " + name;
                document.getElementById("userNameInput").value = name; 
            }
        }
    };

    window.closeProfile = function() {
        const modal = document.getElementById("profileModal");
        if (modal) modal.style.display = "none";
    };

    window.saveName = function() {
        const nameInput = document.getElementById('userNameInput').value;
        if (nameInput) {
            localStorage.setItem('bds_user_name', nameInput);
            if (icon) icon.innerText = nameInput.charAt(0).toUpperCase();
            const disp = document.getElementById('displayName');
            if (disp) disp.innerText = "नमस्ते, " + nameInput;
            window.closeProfile();
        }
    };

    window.onclick = function(event) {
        const modal = document.getElementById("profileModal");
        if (event.target == modal) window.closeProfile(); 
    };

    if (localStorage.getItem("appDarkMode") === "enabled") document.body.classList.add("dark-mode");
    if (darkModeBtn) {
        darkModeBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            localStorage.setItem("appDarkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
        });
    }

    window.addEventListener("popstate", () => {
        if (document.body.classList.contains("fullscreen-active")) switchTab(currentTab);
        if (lightboxInstance) lightboxInstance.close();
    });

    window.toggleLanguage = function (lang) {
        currentAppLang = lang;
        localStorage.setItem("user_app_lang", lang);
        const btnHindi = document.getElementById("btnLangHindi");
        const btnGujarati = document.getElementById("btnLangGujarati");
        if (btnHindi) btnHindi.classList.remove("active");
        if (btnGujarati) btnGujarati.classList.remove("active");
        if (lang === "hindi" && btnHindi) btnHindi.classList.add("active");
        else if (lang === "gujarati" && btnGujarati) btnGujarati.classList.add("active");
        updateAppLanguageUI();
        refreshContent();
    };

    function updateAppLanguageUI() {
        const data = appLanguageData[currentAppLang];
        if (!data) return;
        Object.keys(data).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = data[id];
        });
        if (tabs.text) tabs.text.innerText = data.tabText;
        if (tabs.photos) tabs.photos.innerText = data.tabPhotos;
        if (tabs.videos) tabs.videos.innerText = data.tabVideos;
    }

    function setupVideoObserver() {
        if (!document.body.classList.contains("fullscreen-active")) {
            if (videoObserver) videoObserver.disconnect();
            return;
        }
        if (videoObserver) videoObserver.disconnect();
        videoObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const video = entry.target.querySelector("video");
                if (!video) return;
                if (entry.isIntersecting) {
                    document.querySelectorAll(".fullscreen-video").forEach(v => {
                        if (v !== video) { v.pause(); v.muted = true; v.currentTime = 0; }
                    });
                    video.muted = false;
                    video.play().catch(() => { video.muted = true; video.play(); });
                } else {
                    video.pause(); video.muted = true; video.currentTime = 0;
                }
            });
        }, { threshold: 0.6 });
        document.querySelectorAll(".reels-container-fullscreen .reel-wrapper").forEach(wrapper => {
            videoObserver.observe(wrapper);
        });
    }

    function toggleCategoryButtons(show) {
        document.querySelectorAll(".category-chips").forEach(chip => { chip.style.display = show ? "flex" : "none"; });
    }

    function switchTab(targetTab) {
        currentTab = targetTab;
        localStorage.setItem("bds_current_tab", targetTab);
        document.querySelectorAll("video").forEach(v => { v.pause(); v.muted = true; });
        document.body.classList.remove("fullscreen-active");
        if (sections.videos) sections.videos.classList.remove("fullscreen-active");
        if (reelsContainer) reelsContainer.className = "reels-container video-grid-layout";
        toggleCategoryButtons(true);

        Object.keys(sections).forEach(key => {
            if (!sections[key]) return;
            if (key === targetTab) {
                sections[key].classList.remove("hidden");
                if (tabs[key]) tabs[key].classList.add("active");
            } else {
                sections[key].classList.add("hidden");
                if (tabs[key]) tabs[key].classList.remove("active");
            }
        });
        refreshContent();
    }

    if (tabs.text) tabs.text.addEventListener("click", () => { if(currentCategory === "favorites") currentCategory = "love"; switchTab("text"); });
    if (tabs.photos) tabs.photos.addEventListener("click", () => { if(currentCategory === "favorites") currentCategory = "love"; switchTab("photos"); });
    if (tabs.videos) tabs.videos.addEventListener("click", () => { if(currentCategory === "favorites") currentCategory = "love"; switchTab("videos"); });

    function removeSentinel() {
        const sentinel = document.getElementById("scroll-sentinel");
        if (sentinel) sentinel.remove();
        if (lazyLoadObserver) lazyLoadObserver.disconnect();
    }

    function addSentinel(container, loadCallback) {
        const sentinel = document.createElement("div");
        sentinel.id = "scroll-sentinel";
        sentinel.style.width = "100%";
        sentinel.style.height = "20px";
        sentinel.style.gridColumn = "1 / -1";
        container.appendChild(sentinel);

        lazyLoadObserver = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) { loadCallback(); }
        }, { rootMargin: "150px" });

        lazyLoadObserver.observe(sentinel);
    }

   // 🧹 लाइटबॉक्स को पूरी तरह साफ़ करने वाला हेल्पर फंक्शन
    function destroyLightbox() {
        if (lightboxInstance) {
            try {
                lightboxInstance.destroy();
            } catch (e) {
                console.log("Lightbox cleanup:", e);
            }
            lightboxInstance = null;
        }
        // बचे हुए HTML एलिमेंट्स को साफ़ करें
        document.querySelectorAll(".sl-custom-actions, .sl-overlay, .sl-wrapper").forEach(el => el.remove());
    }
// 📸 Custom Lightbox Variables
    let currentLightboxIndex = 0;
    const photoItemsPerLoad = 25;

    // 1. फोटो लोड करने का फंक्शन
    async function loadPhotosFromCloudinary(category) {
        if (!galleryContainer) return;

        closeCustomLightbox(); // पुरानी कैटेगरी के लाइटबॉक्स को साफ़ करें
        galleryContainer.innerHTML = "<p style='color:#aaa; text-align:center; padding:30px; grid-column: span 4;'>फोटो लोड हो रहे हैं...</p>";

        if (category === "favorites") {
            loadFavoritePhotos();
            return;
        }

        const tag = `${currentAppLang}-${category}`;
        const url = `https://res.cloudinary.com/${cloudName}/image/list/${tag}.json`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Cloudinary Error");
            const data = await response.json();
            
            cloudResources = data.resources || [];
            loadIndex = 0;
            galleryContainer.innerHTML = '';

            if (cloudResources.length > 0) {
                renderPhotosBatch();
            } else {
                galleryContainer.innerHTML = appLanguageData[currentAppLang].noPhoto;
            }
        } catch (error) {
            console.error("Error:", error);
            galleryContainer.innerHTML = appLanguageData[currentAppLang].noPhoto;
        }
    }

    // 2. पसंदीदा (Favorites) लोड करना
    function loadFavoritePhotos() {
        closeCustomLightbox();
        const favs = getFavorites().filter(f => f.type === 'photo' && f.id.startsWith(`${currentAppLang}-`));
        
        galleryContainer.innerHTML = '';
        if (favs.length === 0) {
            galleryContainer.innerHTML = appLanguageData[currentAppLang].emptyFav;
            return;
        }

        // फेवरेट के लिए रिसोर्स सेट करें
        cloudResources = favs.map(f => ({ public_id: f.id, format: '', customUrl: f.url }));

        favs.forEach((fav, idx) => {
            const itemDiv = document.createElement("div");
            itemDiv.className = "gallery-item";

            const aTag = document.createElement("a");
            aTag.href = "javascript:void(0)";
            aTag.onclick = () => openCustomLightbox(idx);

            const img = document.createElement("img");
            img.src = fav.url;
            img.loading = "lazy";

            const watermark = document.createElement("div");
            watermark.className = "bds-watermark";
            watermark.innerText = "BDS";

            aTag.appendChild(img);
            itemDiv.appendChild(aTag); 
            itemDiv.appendChild(watermark);
            galleryContainer.appendChild(itemDiv);
        });
    }

    // 3. 25-25 फोटो बैच रेंडर करना
    function renderPhotosBatch() {
        const batch = cloudResources.slice(loadIndex, loadIndex + photoItemsPerLoad);
        if (batch.length === 0) return;

        removeSentinel();

        const startIndex = loadIndex;

        batch.forEach((image, i) => {
            const globalIndex = startIndex + i;
            const imgUrl = image.customUrl || `https://res.cloudinary.com/${cloudName}/image/upload/v${image.version}/${image.public_id}.${image.format}`;
            const photoId = image.customUrl ? image.public_id : `${currentAppLang}-${currentCategory}-photo-${image.public_id}`;

            // ऑब्जेक्ट में आईडी और यूआरएल सुरक्षित करें
            image.fullUrl = imgUrl;
            image.uniqueId = photoId;

            const itemDiv = document.createElement("div");
            itemDiv.className = "gallery-item";

            const aTag = document.createElement("a");
            aTag.href = "javascript:void(0)";
            aTag.onclick = () => openCustomLightbox(globalIndex);

            const img = document.createElement("img");
            img.src = imgUrl;
            img.loading = "lazy";

            const watermark = document.createElement("div");
            watermark.className = "bds-watermark";
            watermark.innerText = "BDS";

            aTag.appendChild(img);
            itemDiv.appendChild(aTag);
            itemDiv.appendChild(watermark);
            galleryContainer.appendChild(itemDiv);
        });

        loadIndex += photoItemsPerLoad;

        if (loadIndex < cloudResources.length) {
            addSentinel(galleryContainer, renderPhotosBatch);
        }
    }

  // 🛠️ कस्टम लाइटबॉक्स फंक्शंस (इनलाइन स्टाइल - बिना CSS फाइल के 100% फुलस्क्रीन)
    function openCustomLightbox(index) {
        currentLightboxIndex = index;
        
        let modal = document.getElementById("custom-lightbox-modal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "custom-lightbox-modal";
            
            // 💡 फुलस्क्रीन पॉप-अप की पक्की गारंटी (डायरेक्ट JS स्टाइल)
            modal.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: rgba(0, 0, 0, 0.95) !important;
                z-index: 999999 !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
                align-items: center !important;
                box-sizing: border-box !important;
            `;

            modal.innerHTML = `
                <button id="lb-prev-btn" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); background: rgba(255, 255, 255, 0.2); color: #fff; border: none; font-size: 26px; width: 48px; height: 48px; border-radius: 50%; cursor: pointer; z-index: 1000000; user-select: none; display: flex; align-items: center; justify-content: center;">❮</button>
                <img id="custom-lightbox-img" src="" alt="Photo" style="max-width: 90%; max-height: 75vh; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                <button id="lb-next-btn" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: rgba(255, 255, 255, 0.2); color: #fff; border: none; font-size: 26px; width: 48px; height: 48px; border-radius: 50%; cursor: pointer; z-index: 1000000; user-select: none; display: flex; align-items: center; justify-content: center;">❯</button>
                <div id="lightbox-actions" style="margin-top: 15px; display: flex; gap: 12px; z-index: 1000000;"></div>
            `;
            document.body.appendChild(modal);

            modal.querySelector("#lb-prev-btn").onclick = (e) => { e.stopPropagation(); changeLightboxPhoto(-1); };
            modal.querySelector("#lb-next-btn").onclick = (e) => { e.stopPropagation(); changeLightboxPhoto(1); };
        }

        modal.style.display = "flex";
        history.pushState({ fullscreen: true }, "");
        updateCustomLightboxView();
    }

    function changeLightboxPhoto(direction) {
        const nextIndex = currentLightboxIndex + direction;

        if (nextIndex >= 0 && nextIndex < cloudResources.length) {
            currentLightboxIndex = nextIndex;
            
            // 💡 ऑटो-लोड: 23-24वें फोटो पर पहुँचते ही अगला बैच जोड़ें
            if (currentLightboxIndex >= loadIndex - 2 && loadIndex < cloudResources.length) {
                renderPhotosBatch();
            }
            
            updateCustomLightboxView();
        }
    }

    function updateCustomLightboxView() {
        const item = cloudResources[currentLightboxIndex];
        if (!item) return;

        const imgEl = document.getElementById("custom-lightbox-img");
        const actionsEl = document.getElementById("lightbox-actions");
        
        const imgUrl = item.fullUrl || item.customUrl;
        const photoId = item.uniqueId || item.public_id;

        imgEl.src = imgUrl;

        const isLiked = isFavorite(photoId);

        actionsEl.innerHTML = `
            <button id="lb-like-btn" style="padding: 10px 18px; border-radius: 20px; border: none; font-weight: bold; cursor: pointer; background:${isLiked ? "#fff" : "rgba(255,255,255,0.2)"}; color:${isLiked ? "#ff2b55" : "#fff"};">
                ${isLiked ? "❤️ लाइक" : "🤍 लाइक"}
            </button>
            <button id="lb-share-btn" style="padding: 10px 18px; border-radius: 20px; border: none; font-weight: bold; cursor: pointer; background:rgba(255,255,255,0.2); color:#fff;">💬 शेयर</button>
            <button id="lb-close-btn" style="padding: 10px 18px; border-radius: 20px; border: none; font-weight: bold; cursor: pointer; background:rgba(255,255,255,0.2); color:#fff;">↩️ बैक</button>
        `;

       document.getElementById("lb-like-btn").onclick = () => {
            const added = toggleFavoriteItem({ id: photoId, url: imgUrl, type: 'photo' });
            updateCustomLightboxView();
            if (currentCategory === "favorites") loadFavoritePhotos();
        };

        document.getElementById("lb-share-btn").onclick = () => {
            shareMediaContent('photo', imgUrl);
        };

        document.getElementById("lb-close-btn").onclick = closeCustomLightbox;
    }

    function closeCustomLightbox() {
        const modal = document.getElementById("custom-lightbox-modal");
        if (modal) {
            modal.style.display = "none";
        }
    }

    // 🎥 2. Cloudinary Videos (Fixed full screen sizing for subsequent batches > 10)
    async function loadVideosFromCloudinary(category) {
        if (!reelsContainer) return;
        reelsContainer.innerHTML = "<p style='color:#aaa; text-align:center; padding:30px; grid-column: span 4;'>वीडियो लोड हो रहे हैं...</p>";

        if (category === "favorites") {
            loadFavoriteVideos();
            return;
        }

        const tag = `${currentAppLang}-${category}`;
        const url = `https://res.cloudinary.com/${cloudName}/video/list/${tag}.json`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Cloudinary Error");

            const data = await response.json();
            cloudResources = data.resources || [];
            loadIndex = 0;
            reelsContainer.innerHTML = '';

            if (cloudResources.length > 0) {
                renderVideosBatch();
            } else {
                reelsContainer.innerHTML = appLanguageData[currentAppLang].noVideo;
            }
        } catch (error) {
            console.error("Error:", error);
            reelsContainer.innerHTML = appLanguageData[currentAppLang].noVideo;
        }
    }

    function loadFavoriteVideos() {
        const favs = getFavorites().filter(f => f.type === 'video' && f.id.startsWith(`${currentAppLang}-`));

        reelsContainer.innerHTML = '';
        if (favs.length === 0) {
            reelsContainer.innerHTML = appLanguageData[currentAppLang].emptyFav;
            return;
        }

        favs.forEach(fav => {
            renderSingleVideoElement(fav.url, fav.id, "favorites");
        });
        setupVideoObserver();
    }

    function renderVideosBatch() {
        const batch = cloudResources.slice(loadIndex, loadIndex + 10);
        if (batch.length === 0) return;

        removeSentinel();

        batch.forEach(videoItem => {
            const videoUrl = `https://res.cloudinary.com/${cloudName}/video/upload/v${videoItem.version}/${videoItem.public_id}.${videoItem.format}`;
            const videoId = `${currentAppLang}-${currentCategory}-video-${videoItem.public_id}`;
            renderSingleVideoElement(videoUrl, videoId, currentCategory);
        });

        loadIndex += 10;
        if (loadIndex < cloudResources.length) {
            addSentinel(reelsContainer, renderVideosBatch);
        }
        
        if (document.body.classList.contains("fullscreen-active")) {
            setupVideoObserver();
        }
    }

    function renderSingleVideoElement(videoUrl, videoId, categoryType) {
        const isFullscreen = document.body.classList.contains("fullscreen-active");
        const wrapper = document.createElement("div");
        wrapper.className = isFullscreen ? "reel-wrapper" : "reel-wrapper grid-video-item";

        const video = document.createElement("video");
        video.src = videoUrl;
        video.className = isFullscreen ? "fullscreen-video" : "preview-video";
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;
        video.setAttribute("data-video-id", videoId);

        const watermark = document.createElement("div");
        watermark.className = "bds-watermark";
        const categoryLabelText = getCategoryLabel(categoryType, currentAppLang);

        watermark.innerHTML = `
            <div class="news-badge-top"><span>${categoryLabelText}</span></div>
            <div class="news-badge-bottom">Bhojani Digital Seva</div>
            <span class="grid-watermark-text">BDS</span>
        `;

        video.onclick = () => {
            if (!document.body.classList.contains("fullscreen-active")) {
                history.pushState({ fullscreen: true }, "");
                document.body.classList.add("fullscreen-active");
                sections.videos.classList.add("fullscreen-active");
                reelsContainer.className = "reels-container reels-container-fullscreen";
                toggleCategoryButtons(false);

                document.querySelectorAll("#reelsContainer .reel-wrapper").forEach(w => w.classList.remove("grid-video-item"));
                document.querySelectorAll("video").forEach(v => {
                    v.pause(); v.className = "fullscreen-video"; v.muted = true;
                });

                video.className = "fullscreen-video";
                video.muted = false;
                video.play().catch(() => { video.muted = true; video.play(); });

                setupVideoObserver();
                wrapper.scrollIntoView({ behavior: "instant" });
            } else {
                if (video.paused) { video.muted = false; video.play(); } 
                else { video.pause(); }
            }
        };

        video.addEventListener('dblclick', () => {
            const heart = document.createElement('div');
            heart.innerHTML = '❤️';
            heart.className = 'double-tap-heart heart-animated';
            wrapper.appendChild(heart);

            const likeBtn = wrapper.querySelector('.fullscreen-like-btn');
            if (likeBtn && !likeBtn.classList.contains('liked')) likeBtn.click(); 
            setTimeout(() => { heart.remove(); }, 800);
        });

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "reel-actions hidden-actions";
        
        const fullscreenLikeBtn = document.createElement("button");
        const isAlreadyLiked = isFavorite(videoId);

        fullscreenLikeBtn.className = `action-btn fullscreen-like-btn ${isAlreadyLiked ? "liked" : ""}`;
        fullscreenLikeBtn.innerHTML = isAlreadyLiked ? "❤️" : "🤍";

        fullscreenLikeBtn.onclick = e => { 
            e.stopPropagation(); 
            const added = toggleFavoriteItem({ id: videoId, url: videoUrl, type: 'video' });
            fullscreenLikeBtn.innerHTML = added ? "❤️" : "🤍";
            added ? fullscreenLikeBtn.classList.add("liked") : fullscreenLikeBtn.classList.remove("liked");
            if(currentCategory === "favorites") loadFavoriteVideos();
        };

        const shareBtn = document.createElement("button");
        shareBtn.className = "action-btn whatsapp-btn";
        shareBtn.innerHTML = "💬";
        shareBtn.onclick = e => { 
            e.stopPropagation(); 
            shareMediaContent('video', videoUrl); // 👈 वीडियो फाइल + ब्रांडिंग शेयर करने के लिए
        };

        const closeBtn = document.createElement("button");
        closeBtn.className = "action-btn close-reel-btn";
        closeBtn.innerHTML = "↩️<span>बैक</span>";
        closeBtn.onclick = e => { e.stopPropagation(); history.back(); };

        actionsDiv.appendChild(fullscreenLikeBtn);
        actionsDiv.appendChild(shareBtn);
        actionsDiv.appendChild(closeBtn);

        wrapper.appendChild(video);
        wrapper.appendChild(watermark);
        wrapper.appendChild(actionsDiv);
        reelsContainer.appendChild(wrapper);
    }

    // 📋 3. Text Status Loader (Paged with 25 items per batch on scroll)
    function loadTextStatus(category) {
        if (!txtContainer) return;
        txtContainer.innerHTML = "";

        if (category === "favorites") {
            loadFavoriteTexts();
            return;
        }

        let currentDataSource = currentAppLang === "hindi" 
            ? (typeof hindiStatusData !== "undefined" ? hindiStatusData : null)
            : (typeof gujaratiStatusData !== "undefined" ? gujaratiStatusData : null);

        if (!currentDataSource) return;
        const list = currentDataSource[category];
        if (!list || list.length === 0) return;

        currentTextSourceList = list.map((statusText, i) => ({
            id: `${currentAppLang}-${category}-text-${i}`,
            text: statusText
        }));
        textLoadIndex = 0;
        renderTextBatch();
    }

    function loadFavoriteTexts() {
        const favs = getFavorites().filter(f => f.type === 'text' && f.id.startsWith(`${currentAppLang}-`));

        txtContainer.innerHTML = '';
        if (favs.length === 0) {
            txtContainer.innerHTML = appLanguageData[currentAppLang].emptyFav;
            return;
        }

        currentTextSourceList = favs;
        textLoadIndex = 0;
        renderTextBatch();
    }

    function renderTextBatch() {
        removeSentinel();
        const batch = currentTextSourceList.slice(textLoadIndex, textLoadIndex + textsPerLoad);
        if (batch.length === 0) return;

        batch.forEach(item => {
            renderSingleTextCard(item.text, item.id);
        });

        textLoadIndex += textsPerLoad;
        if (textLoadIndex < currentTextSourceList.length) {
            addSentinel(txtContainer, renderTextBatch);
        }
    }

    function renderSingleTextCard(statusText, textId) {
        const card = document.createElement("div");
        card.className = "text-status-card";
        const p = document.createElement("p");
        p.innerText = statusText;

        const actionDiv = document.createElement("div");
        actionDiv.style = "position:absolute; bottom:10px; right:15px; display:flex; gap:10px; align-items:center;";

        const likeBtn = document.createElement("button");
        likeBtn.style = "padding:5px 10px; font-size:14px; background:none; border:none; cursor:pointer;";
        const isAlreadyLiked = isFavorite(textId);
        likeBtn.innerHTML = isAlreadyLiked ? "❤️" : "🤍";

        likeBtn.onclick = () => {
            const added = toggleFavoriteItem({ id: textId, text: statusText, type: 'text' });
            likeBtn.innerHTML = added ? "❤️" : "🤍";
            if(currentCategory === "favorites") loadFavoriteTexts();
        };

        const copyBtn = document.createElement("button");
        copyBtn.innerHTML = "📋 कॉपी";
        copyBtn.onclick = () => {
            const textArea = document.createElement("textarea"); textArea.value = statusText;
            document.body.appendChild(textArea); textArea.select(); document.execCommand("copy"); document.body.removeChild(textArea);
            const originalText = copyBtn.innerText; copyBtn.innerText = "✅ कॉपीड!";
            setTimeout(() => { copyBtn.innerText = originalText; }, 2000);
        };

        const shareBtn = document.createElement("button");
        shareBtn.innerHTML = "💬 शेयर";
        shareBtn.style = "padding:5px 12px; font-size:12px; background:#25D366; color:white; border:none; border-radius:5px;";
        shareBtn.onclick = () => { 
            shareMediaContent('text', statusText); // 👈 टेक्स्ट शायरी + ब्रांड नाम + ऐप लिंक शेयर करने के लिए
        };
        actionDiv.appendChild(likeBtn); actionDiv.appendChild(copyBtn); actionDiv.appendChild(shareBtn);
        card.appendChild(p); card.appendChild(actionDiv); txtContainer.appendChild(card);
    }

    // 🔄 4. कंटेंट रिफ्रेश
    function refreshContent() {
        removeSentinel();
        destroyLightbox(); // 💡 कैटेगरी या टैब बदलते ही लाइटबॉक्स की पूरी सफाई
        if (galleryContainer) galleryContainer.innerHTML = "";
        if (reelsContainer) reelsContainer.innerHTML = "";
        if (txtContainer) txtContainer.innerHTML = "";
        if (reelsContainer) reelsContainer.className = "reels-container video-grid-layout";

        if (currentTab === "photos") loadPhotosFromCloudinary(currentCategory);
        else if (currentTab === "videos") loadVideosFromCloudinary(currentCategory);
        else if (currentTab === "text") loadTextStatus(currentCategory);
    }
   document.querySelectorAll(".btn-category, .category-buttons button").forEach(btn => {
    btn.addEventListener("click", e => {
        const btnId = e.currentTarget.id.toLowerCase();
        if (btnId.includes("love")) currentCategory = "love";
        else if (btnId.includes("sad")) currentCategory = "sad";
        else if (btnId.includes("motivation")) currentCategory = "motivation";
        else if (btnId.includes("fav")) currentCategory = "favorites";
        else if (btnId.includes("bhakti")) currentCategory = "bhakti"; // यह लाइन जोड़ दें
        else currentCategory = e.currentTarget.getAttribute("data-cat") || "love";
        refreshContent();
    });
});

    toggleLanguage(currentAppLang);
    switchTab(currentTab);
});

window.addEventListener('offline', () => alert("अरे! इंटरनेट कनेक्शन चेक करें।"));
window.addEventListener('online', () => alert("वापस ऑनलाइन! अब आप डेटा देख सकते हैं।"));

// 🌐 1. एक्टिव भाषा (हिंदी/गुजराती) सीधे स्क्रीन/बटन से पता करने का सबसे सेफ फंक्शन
function getAppLanguage() {
    // 💡 सबसे पहले HTML में देखें कि क्या गुजराती बटन active है
    const gujBtn = document.getElementById("btnLangGujarati");
    if (gujBtn && gujBtn.classList.contains("active")) {
        return "gujarati";
    }

    // 💡 दूसरा बैकअप: अगर ग्लोबल वेरिएबल मौजूद हो
    if (typeof currentAppLang !== "undefined" && currentAppLang) return currentAppLang;
    if (typeof currentLang !== "undefined" && currentLang) return currentLang;
    if (typeof currentLanguage !== "undefined" && currentLanguage) return currentLanguage;

    // 💡 तीसरा बैकअप: LocalStorage
    const savedLang = localStorage.getItem("appLang") || localStorage.getItem("lang") || localStorage.getItem("language");
    if (savedLang) return savedLang.toLowerCase();

    return "hindi"; // डिफ़ॉल्ट हिंदी
}

// 📤 2. ऑल-इन-वन स्मार्ट शेयर फंक्शन (FIXED)
async function shareMediaContent(type, mediaUrlOrText) {
    const appUrl = window.location.origin + window.location.pathname; // आपकी ऐप का लिंक
    const userLang = getAppLanguage(); // 👈 यहाँ से ऑटोमेटिक सही भाषा मिलेगी

    // 🏷️ ब्रांड नाम और संदेश
    const appTitle = "Bhojani Daily Status";
    let shareMsg = userLang === "gujarati" 
        ? "આવા બીજા શાનદાર સ્ટેટસ જોવા માટે જુઓ:" 
        : "ऐसे और शानदार स्टेटस देखने के लिए ऐप देखें:";

    // ✨ सुंदर फ़ॉर्मेट वाला कैप्शन
    const captionText = `✨ *${appTitle}* ✨\n${shareMsg}\n👉 ${appUrl}`;

    // 📝 TEXT / App Share
    if (type === 'text') {
        const fullText = `"${mediaUrlOrText}"\n\n${captionText}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: appTitle,
                    text: fullText
                    // ❌ url: appUrl यहाँ से हटा दिया गया है ताकि 2 बार लिंक न आए!
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`, '_blank');
                }
            }
        } else {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`, '_blank');
        }
        return;
    }
    // 📸 PHOTO या VIDEO Share
    if (navigator.share) {
        try {
            const response = await fetch(mediaUrlOrText);
            const blob = await response.blob();
            
            const ext = type === 'photo' ? 'jpg' : 'mp4';
            const mimeType = type === 'photo' ? 'image/jpeg' : 'video/mp4';
            const fileName = `bds_status_${Date.now()}.${ext}`;

            const file = new File([blob], fileName, { type: mimeType });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: appTitle,
                    text: captionText
                });
            } else {
                await navigator.share({
                    title: appTitle,
                    text: `${captionText}\n\n${mediaUrlOrText}`,
                    url: appUrl
                });
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(captionText + "\n" + mediaUrlOrText)}`, '_blank');
            }
        }
    } else {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(captionText + "\n" + mediaUrlOrText)}`, '_blank');
    }
}

// 📲 3. हेडर वाले "🔗 ऐप शेयर" बटन का लॉजिक
document.addEventListener("DOMContentLoaded", () => {
    const topHeaderShareBtn = document.getElementById("appShareBtn") || document.getElementById("app-share-btn");

    if (topHeaderShareBtn) {
        topHeaderShareBtn.onclick = (e) => {
            e.preventDefault();

            // 💡 तुरंत पता करें कि अभी कौन सी भाषा चुनी हुई है
            const userLang = getAppLanguage();

            let shareMessage = userLang === "gujarati" 
                ? "શાનદાર સ્ટેટસ માટે જુઓ Bhojani Digital Seva એપ! 👇" 
                : "शानदार स्टेटस के लिए देखें Bhojani Digital Seva ऐप! 👇";

            if (typeof shareMediaContent === "function") {
                shareMediaContent('text', shareMessage);
            }
        };
    }
});
// Service Worker Registration and Auto-Update Check
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
            console.log('ServiceWorker registered: ', registration.scope);

            // जब भी कोई नया अपडेट उपलब्ध हो
            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // नया अपडेट मिल गया है, पेज को ऑटोमैटिक रीफ्रेश कर सकते हैं या नोटिफिकेशन दिखा सकते हैं
                            console.log('New content is available; please refresh.');
                            if (confirm('नया अपडेट उपलब्ध है! ऐप को अपडेट करने के लिए OK दबाएं।')) {
                                window.location.reload();
                            }
                        }
                    }
                };
            };
        }).catch((error) => {
            console.log('ServiceWorker registration failed: ', error);
        });
    });
}