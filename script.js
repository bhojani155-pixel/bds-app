document.addEventListener("DOMContentLoaded", () => {

    const cloudName = "gkbhojani"; // Cloudinary Cloud Name

    // 🌐 भाषा डिक्शनरी
    const appLanguageData = {
        hindi: {
            btnFavoritesText: "❤️ पसंदीदा",
            btnLoveText: "❤️ लव",
            btnSadText: "💔 सैड",
            btnMotivationText: "🚀 मोटिवेशन",

            btnFavoritesPhoto: "❤️ पसंदीदा",
            btnLovePhoto: "❤️ लव",
            btnSadPhoto: "💔 सैड",
            btnMotivationPhoto: "🚀 मोटिवेशन",

            btnFavoritesVideo: "❤️ पसंदीदा",
            btnLoveVideo: "❤️ लव",
            btnSadVideo: "💔 सैड",
            btnMotivationVideo: "🚀 मोटिवेशन",

            tabText: "📝 टेक्स्ट",
            tabPhotos: "📸 फोटो",
            tabVideos: "🎥 रील्स",

            emptyFav: "<div style='color:#aaa; text-align:center; padding:50px; grid-column: span 4;'>आपने अभी तक कुछ भी लाइक नहीं किया है! ❤️</div>",
            noPhoto: "<div style='color:#aaa; text-align:center; padding:50px;'>कोई फोटो नहीं मिली!</div>",
            noVideo: "<div style='color:#aaa; text-align:center; padding:50px;'>कोई वीडियो नहीं मिला!</div>"
        },
        gujarati: {
            btnFavoritesText: "❤️ મનપસંદ",
            btnLoveText: "❤️ પ્રેમ",
            btnSadText: "💔 ઉદાસ",
            btnMotivationText: "🚀 પ્રેરણાત્મક",

            btnFavoritesPhoto: "❤️ મનપसંદ",
            btnLovePhoto: "❤️ પ્રેમ",
            btnSadPhoto: "💔 ઉદાસ",
            btnMotivationPhoto: "🚀 પ્રેરણાત્મક",

            btnFavoritesVideo: "❤️ મનપसંદ",
            btnLoveVideo: "❤️ પ્રેમ",
            btnSadVideo: "💔 ઉદાસ",
            btnMotivationVideo: "🚀 પ્રેરણાત્મક",

            tabText: "📝 લખાણ",
            tabPhotos: "📸 ફોટો",
            tabVideos: "🎥 રીલ્સ",

            emptyFav: "<div style='color:#aaa; text-align:center; padding:50px; grid-column: span 4;'>તમે હજુ સુધી કંઈપણ લાઈક કર્યું નથી! ❤️</div>",
            noPhoto: "<div style='color:#aaa; text-align:center; padding:50px;'>કોઈ ફોટો મળ્યો નથી!</div>",
            noVideo: "<div style='color:#aaa; text-align:center; padding:50px;'>કોઈ વિડિયો મળ્યો નથી!</div>"
        }
    };

    // Service Worker रजिस्टर
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log("App ready for install!"))
            .catch(err => console.error("SW Registration failed:", err));
    }

    // Tabs
    const tabs = {
        text: document.getElementById("tabText"),
        photos: document.getElementById("tabPhotos"),
        videos: document.getElementById("tabVideos")
    };

    // Sections
    const sections = {
        text: document.getElementById("textSection"),
        photos: document.getElementById("photoSection"),
        videos: document.getElementById("videoSection")
    };

    // Containers / buttons
    const galleryContainer = document.getElementById("autoGallery") || document.getElementById("galleryContainer");
    const reelsContainer = document.getElementById("reelsContainer");
    const txtContainer = document.getElementById("textStatusContainer");
    const darkModeBtn = document.getElementById("darkModeBtn");
    const appShareBtn = document.getElementById("appShareBtn");

    // State
    let currentAppLang = localStorage.getItem("user_app_lang") || "hindi";
    let currentTab = localStorage.getItem("bds_current_tab") || "videos";
    let currentCategory = "love";
    let videoObserver = null;
    let lightboxInstance = null;

    // Data States
    let allVideosData = [];
    let allPhotosData = [];
    let displayedVideoCount = 10; 
    let isFetchingMore = false;

    // Category label helper
    function getCategoryLabel(category, lang) {
        const categoryLabels = {
            hindi: { love: "लव / शायरी", sad: "सैड / शायरी", motivation: "मोटिवेशन / सुविचार", favorites: "पसंदीदा स्टेटस" },
            gujarati: { love: "પ્રેમ / શાયરી", sad: "ઉદાસ / શાયરી", motivation: "પ્રેરણાત્મક / સુવાક્ય", favorites: "મનપસંદ સ્ટેટસ" }
        };
        return (categoryLabels[lang] && categoryLabels[lang][category]) || category;
    }

    // 👤 यूजर प्रोफाइल सेटअप
    const savedName = localStorage.getItem('bds_user_name');
    const icon = document.getElementById('user-initial');
    
    if(savedName && icon) {
        icon.innerText = savedName.charAt(0).toUpperCase();
    } else if (icon) {
        icon.innerText = "👤"; 
    }

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
        if (event.target == modal) { 
            window.closeProfile(); 
        }
    };

    // 🔆 Dark mode init
    if (localStorage.getItem("appDarkMode") === "enabled") {
        document.body.classList.add("dark-mode");
    }

    if (darkModeBtn) {
        darkModeBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            localStorage.setItem(
                "appDarkMode",
                document.body.classList.contains("dark-mode") ? "enabled" : "disabled"
            );
        });
    }

    // 📲 App share (WhatsApp)
    if (appShareBtn) {
        appShareBtn.addEventListener("click", () => {
            const appUrl = window.location.origin + window.location.pathname;
            let shareMessage = currentAppLang === "gujarati" 
                ? "શાનદાર સ્ટેટસ અને વિડીયો માટે અત્યારે જ જુઓ Bhojani Digital Seva એપ! 👇" 
                : "शानदार स्टेटस और वीडियो के लिए अभी देखें Bhojani Digital Seva ऐप! 👇";

            shareContent("Bhojani Digital Seva", shareMessage, appUrl);
        });
    }

    // 🔙 Back button (popstate)
    window.addEventListener("popstate", () => {
        if (document.body.classList.contains("fullscreen-active")) {
            switchTab(currentTab);
        }
        if (lightboxInstance) {
            lightboxInstance.close();
        }
    });

    // 🌐 Language toggle (global)
    window.toggleLanguage = function (lang) {
        currentAppLang = lang;
        localStorage.setItem("user_app_lang", lang);

        const btnHindi = document.getElementById("btnLangHindi");
        const btnGujarati = document.getElementById("btnLangGujarati");

        if (btnHindi) btnHindi.classList.remove("active");
        if (btnGujarati) btnGujarati.classList.remove("active");

        if (lang === "hindi" && btnHindi) {
            btnHindi.classList.add("active");
        } else if (lang === "gujarati" && btnGujarati) {
            btnGujarati.classList.add("active");
        }

        updateAppLanguageUI();
        refreshContent();
    };

    function updateAppLanguageUI() {
        const data = appLanguageData[currentAppLang];
        if (!data) return;

        Object.keys(data).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.innerText = data[id];
            }
        });

        if (tabs.text) tabs.text.innerText = data.tabText;
        if (tabs.photos) tabs.photos.innerText = data.tabPhotos;
        if (tabs.videos) tabs.videos.innerText = data.tabVideos;
    }

    // 🎥 Video intersection observer (fullscreen reels)
    function setupVideoObserver() {
        if (!document.body.classList.contains("fullscreen-active")) {
            if (videoObserver) videoObserver.disconnect();
            return;
        }
        if (videoObserver) videoObserver.disconnect();

        videoObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    const video = entry.target.querySelector("video");
                    if (!video) return;

                    if (entry.isIntersecting) {
                        document.querySelectorAll(".fullscreen-video").forEach(v => {
                            if (v !== video) {
                                v.pause();
                                v.muted = true;
                                v.currentTime = 0;
                            }
                        });
                        video.muted = false;
                        video.play().catch(() => {
                            video.muted = true;
                            video.play();
                        });
                    } else {
                        video.pause();
                        video.muted = true;
                        video.currentTime = 0;
                    }
                });
            },
            { threshold: 0.6 }
        );

        document.querySelectorAll(".reels-container-fullscreen .reel-wrapper").forEach(wrapper => {
            videoObserver.observe(wrapper);
        });
    }

    // 📜 Infinite scroll loop for reels (फुलस्क्रीन रील्स में अंत में पहुँचने पर वापस ऊपर लूप होना)
    function setupInfiniteScrollLoop() {
        if (!reelsContainer) return;
        let touchStartY = 0;
        let touchEndY = 0;

        reelsContainer.addEventListener("touchstart", e => { touchStartY = e.changedTouches[0].screenY; }, { passive: true });

        reelsContainer.addEventListener("touchend", e => {
            touchEndY = e.changedTouches[0].screenY;
            if (!document.body.classList.contains("fullscreen-active")) return;

            const totalScrollHeight = reelsContainer.scrollHeight;
            const currentScrollTop = reelsContainer.scrollTop;
            const containerHeight = reelsContainer.clientHeight;

            const isAtBottom = currentScrollTop + containerHeight >= totalScrollHeight - 50;
            const isSwipeUp = touchStartY - touchEndY > 50;

            if (isAtBottom && isSwipeUp) {
                // अगर सारे वीडियो खत्म हो गए हैं, तो पहले वीडियो पर वापस लूप कर दो
                const firstVideoCard = reelsContainer.firstElementChild;
                if (firstVideoCard) {
                    setTimeout(() => { firstVideoCard.scrollIntoView({ behavior: "smooth" }); }, 100);
                }
            }
        }, { passive: true });

        // फुलस्क्रीन रील्स में स्क्रॉल करते वक्त जैसे ही 8वें-9वें वीडियो के पास पहुँचें, अगले वीडियो लोड कर लो
        reelsContainer.addEventListener("scroll", () => {
            if (document.body.classList.contains("fullscreen-active")) {
                const scrollTop = reelsContainer.scrollTop;
                const scrollHeight = reelsContainer.scrollHeight;
                const clientHeight = reelsContainer.clientHeight;

                if (scrollTop + clientHeight >= scrollHeight - 400) {
                    if (displayedVideoCount < allVideosData.length && !isFetchingMore) {
                        isFetchingMore = true;
                        displayedVideoCount += 10; // 10 और वीडियो जोड़ो ताकि रुकना न पड़े
                        appendMoreVideos();
                        setTimeout(() => { isFetchingMore = false; }, 500);
                    }
                }
            }
        });
    }

    // 🔘 Category chips show/hide
    function toggleCategoryButtons(show) {
        document.querySelectorAll(".category-chips").forEach(chipContainer => {
            chipContainer.style.display = show ? "flex" : "none";
        });
    }

    // 🧭 Tab switch
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

    // Tabs click events
    if (tabs.text) tabs.text.addEventListener("click", () => { currentCategory = "love"; switchTab("text"); });
    if (tabs.photos) tabs.photos.addEventListener("click", () => { currentCategory = "love"; switchTab("photos"); });
    if (tabs.videos) tabs.videos.addEventListener("click", () => { currentCategory = "love"; switchTab("videos"); });

    // 📸 1. Cloudinary से फोटो लोड करने का फंक्शन (सारे फोटो लोड ताकि लाइटबॉक्स में 15 के बाद 16वां फोटो आसानी से खुले)
    async function loadPhotosFromCloudinary(category) {
        if (!galleryContainer) return;
        galleryContainer.innerHTML = "<p style='color:#aaa; text-align:center; padding:30px; grid-column: span 4;'>फोटो लोड हो रहे हैं...</p>";

        const tag = `${currentAppLang}-${category}`; 
        const url = `https://res.cloudinary.com/${cloudName}/image/list/${tag}.json`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Cloudinary Error or Tag Not Found");
            
            const data = await response.json();
            allPhotosData = data.resources || [];

            renderPhotoGridAll();
        } catch (error) {
            console.error("फोटो लोड करने में गड़बड़ हुई:", error);
            galleryContainer.innerHTML = appLanguageData[currentAppLang].noPhoto;
        }
    }

    function renderPhotoGridAll() {
        if (!galleryContainer) return;
        galleryContainer.innerHTML = '';

        if (allPhotosData.length > 0) {
            allPhotosData.forEach(image => {
                const imgUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v${image.version}/${image.public_id}.${image.format}`;
                const photoId = `${currentAppLang}-${currentCategory}-photo-${image.public_id}`;

                const itemDiv = document.createElement("div");
                itemDiv.className = "gallery-item";

                const aTag = document.createElement("a");
                aTag.href = imgUrl;
                aTag.classList.add("gallery-link");
                aTag.setAttribute("data-img-id", photoId);

                const img = document.createElement("img");
                img.src = imgUrl;
                img.loading = "lazy"; // लेज़ी लोडिंग से वेबसाइट भारी नहीं होगी

                const watermark = document.createElement("div");
                watermark.className = "bds-watermark";
                watermark.innerText = "BDS";

                aTag.appendChild(img);
                itemDiv.appendChild(aTag);
                itemDiv.appendChild(watermark);
                galleryContainer.appendChild(itemDiv);
            });

            setupPhotoLightbox();
        } else {
            galleryContainer.innerHTML = appLanguageData[currentAppLang].noPhoto;
        }
    }

    // 📸 फोटो लाइटबॉक्स (SimpleLightbox - 15 के बाद 16वां और लूप के साथ)
    function setupPhotoLightbox() {
        if (typeof SimpleLightbox === "undefined") return;

        if (lightboxInstance) {
            lightboxInstance.destroy();
            lightboxInstance = null;
        }

        const links = document.querySelectorAll(".gallery-link");
        if (!links.length) return;

        lightboxInstance = new SimpleLightbox(".gallery-link", {
            loop: true, // आखिरी फोटो से पहला फोटो अपने आप आ जाएगा
            nextOnImageClick: true,
            closeOnOverlayClick: true,
            showCaptions: false
        });

        function renderActions() {
            setTimeout(() => {
                const old = document.querySelector(".sl-custom-actions");
                if (old) old.remove();

                const img = document.querySelector(".sl-image img");
                if (!img || !img.src) return;

                const currentLink = Array.from(links).find(
                    l => l.getAttribute("href") === img.getAttribute("src")
                );

                let imgId = currentLink ? currentLink.getAttribute("data-img-id") : "";

                const box = document.createElement("div");
                box.className = "sl-custom-actions";

                const savedLikes = JSON.parse(localStorage.getItem("bds_favorites")) || [];
                const isLiked = savedLikes.includes(imgId);

                box.innerHTML = `
                    <button class="sl-custom-like-btn" style="background:${isLiked ? "#fff" : "rgba(0,0,0,0.7)"}; color:${isLiked ? "#ff2b55" : "#fff"}; border:none; padding:10px 15px; border-radius:20px; font-weight:bold; cursor:pointer;">
                        ${isLiked ? "❤️ लाइक" : "🤍 लाइक"}
                    </button>
                    <button class="sl-custom-share-btn">💬 शेयर</button>
                    <button class="sl-custom-download-btn">💾 डाउनलोड</button>
                    <button class="sl-custom-close-btn">↩️ बैक</button>
                `;

                const photoLikeBtn = box.querySelector(".sl-custom-like-btn");
                photoLikeBtn.onclick = () => {
                    let favoriteItems = JSON.parse(localStorage.getItem("bds_favorites")) || [];

                    if (favoriteItems.includes(imgId)) {
                        favoriteItems = favoriteItems.filter(id => id !== imgId);
                        photoLikeBtn.innerHTML = "🤍 लाइक";
                        photoLikeBtn.style.color = "#fff";
                        photoLikeBtn.style.background = "rgba(0,0,0,0.7)";
                    } else {
                        favoriteItems.push(imgId);
                        photoLikeBtn.innerHTML = "❤️ लाइक";
                        photoLikeBtn.style.color = "#ff2b55";
                        photoLikeBtn.style.background = "#fff";
                    }
                    localStorage.setItem("bds_favorites", JSON.stringify(favoriteItems));
                };

                box.querySelector(".sl-custom-share-btn").onclick = () => {
                    let shareMessage = currentAppLang === "gujarati" ? "શાનદાર ફોટો જુઓ:" : "शानदार फोटो देखें:";
                    shareContent("Bhojani Digital Seva", shareMessage, img.src);
                };

                box.querySelector(".sl-custom-download-btn").onclick = () => {
                    const a = document.createElement("a");
                    a.href = img.src;
                    a.download = "bds_status.jpg";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                };

                box.querySelector(".sl-custom-close-btn").onclick = () => { lightboxInstance.close(); };

                document.body.appendChild(box);
            }, 80);
        }

        lightboxInstance.on("show.simplelightbox", () => { history.pushState({ fullscreen: true }, ""); renderActions(); });
        lightboxInstance.on("changed.simplelightbox", renderActions);
        lightboxInstance.on("close.simplelightbox", () => {
            const old = document.querySelector(".sl-custom-actions");
            if (old) old.remove();
        });
    }

    // 🎥 2. Cloudinary से वीडियो लोड करने का फंक्शन
    async function loadVideosFromCloudinary(category) {
        if (!reelsContainer) return;
        reelsContainer.innerHTML = "<p style='color:#aaa; text-align:center; padding:30px;'>वीडियो लोड हो रहे हैं...</p>";

        const tag = `${currentAppLang}-${category}`; 
        const url = `https://res.cloudinary.com/${cloudName}/video/list/${tag}.json`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Cloudinary Error or Tag Not Found");

            const data = await response.json();
            allVideosData = data.resources || [];
            displayedVideoCount = 10; // शुरुआती लिमिट 10 वीडियो

            renderVideoGrid();
        } catch (error) {
            console.error("वीडियो लोड करने में गड़बड़ हुई:", error);
            reelsContainer.innerHTML = appLanguageData[currentAppLang].noVideo;
        }
    }

    function createVideoElementItem(videoItem) {
        const videoUrl = `https://res.cloudinary.com/${cloudName}/video/upload/v${videoItem.version}/${videoItem.public_id}.${videoItem.format}`;
        const videoId = `${currentAppLang}-${currentCategory}-video-${videoItem.public_id}`;

        const wrapper = document.createElement("div");
        wrapper.className = document.body.classList.contains("fullscreen-active") ? "reel-wrapper" : "reel-wrapper grid-video-item";

        const video = document.createElement("video");
        video.src = videoUrl;
        video.className = document.body.classList.contains("fullscreen-active") ? "fullscreen-video" : "preview-video";
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;
        video.setAttribute("data-video-id", videoId);

        const watermark = document.createElement("div");
        watermark.className = "bds-watermark";
        const categoryLabelText = getCategoryLabel(currentCategory, currentAppLang);

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

                document.querySelectorAll("#reelsContainer .reel-wrapper").forEach(w => {
                    w.classList.remove("grid-video-item");
                });
                document.querySelectorAll("video").forEach(v => {
                    v.pause();
                    v.className = "fullscreen-video";
                    v.muted = true;
                });

                video.className = "fullscreen-video";
                video.muted = false;
                video.play().catch(() => {
                    video.muted = true;
                    video.play();
                });

                setupVideoObserver();
                wrapper.scrollIntoView({ behavior: "instant" });
            } else {
                if (video.paused) {
                    video.muted = false;
                    video.play();
                } else {
                    video.pause();
                }
            }
        };

        video.addEventListener('dblclick', () => {
            const heart = document.createElement('div');
            heart.innerHTML = '❤️';
            heart.className = 'double-tap-heart heart-animated';
            wrapper.appendChild(heart);

            const likeBtn = wrapper.querySelector('.fullscreen-like-btn');
            if (likeBtn && !likeBtn.classList.contains('liked')) {
                likeBtn.click(); 
            }
            setTimeout(() => { heart.remove(); }, 800);
        });

        const actionsDiv = document.createElement("div");
        actionsDiv.className = document.body.classList.contains("fullscreen-active") ? "reel-actions" : "reel-actions hidden-actions";
        
        const fullscreenLikeBtn = document.createElement("button");
        let savedLikes = JSON.parse(localStorage.getItem("bds_favorites")) || [];
        const isAlreadyLiked = savedLikes.includes(videoId);

        fullscreenLikeBtn.className = `action-btn fullscreen-like-btn ${isAlreadyLiked ? "liked" : ""}`;
        fullscreenLikeBtn.innerHTML = isAlreadyLiked ? "❤️" : "🤍";

        fullscreenLikeBtn.onclick = e => {
            e.stopPropagation();
            handleLike(videoId, fullscreenLikeBtn); 
        };

        const shareBtn = document.createElement("button");
        shareBtn.className = "action-btn whatsapp-btn";
        shareBtn.innerHTML = "💬";
        shareBtn.onclick = e => {
            e.stopPropagation();
            let shareMessage = currentAppLang === "gujarati" ? "શાનદાર વિડીયો જુઓ:" : "शानदार वीडियो देखें:";
            shareContent("Bhojani Digital Seva", shareMessage, video.src);
        };

        const downloadBtn = document.createElement("button");
        downloadBtn.className = "action-btn";
        downloadBtn.innerHTML = "💾";
        downloadBtn.onclick = e => {
            e.stopPropagation();
            const a = document.createElement("a");
            a.href = videoUrl;
            a.download = `bds_video.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };

        const closeBtn = document.createElement("button");
        closeBtn.className = "action-btn close-reel-btn";
        closeBtn.innerHTML = "↩️<span>बैक</span>";
        closeBtn.onclick = e => {
            e.stopPropagation();
            history.back();
        };

        actionsDiv.appendChild(fullscreenLikeBtn);
        actionsDiv.appendChild(shareBtn);
        actionsDiv.appendChild(downloadBtn);
        actionsDiv.appendChild(closeBtn);

        wrapper.appendChild(video);
        wrapper.appendChild(watermark);
        wrapper.appendChild(actionsDiv);

        return wrapper;
    }

    function renderVideoGrid() {
        if (!reelsContainer) return;
        reelsContainer.innerHTML = '';

        if (allVideosData.length > 0) {
            const videosToDisplay = allVideosData.slice(0, displayedVideoCount);
            videosToDisplay.forEach(videoItem => {
                const wrapper = createVideoElementItem(videoItem);
                reelsContainer.appendChild(wrapper);
            });
        } else {
            reelsContainer.innerHTML = appLanguageData[currentAppLang].noVideo;
        }
    }

    // फुलस्क्रीन मोड में नीचे स्क्रॉल करने पर अगले वीडियो आटोमेटिक जोड़ने के लिए
    function appendMoreVideos() {
        if (!reelsContainer) return;
        const currentCount = reelsContainer.children.length;
        const videosToDisplay = allVideosData.slice(currentCount, displayedVideoCount);

        videosToDisplay.forEach(videoItem => {
            const wrapper = createVideoElementItem(videoItem);
            reelsContainer.appendChild(wrapper);
        });

        setupVideoObserver();
    }

    // 📜 ग्रिड व्यू और नॉर्मल स्क्रॉल के लिए इनफिनिट स्क्रॉल
    window.addEventListener("scroll", () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 300) {
            if (isFetchingMore) return;

            if (!document.body.classList.contains("fullscreen-active")) {
                if (currentTab === "videos" && displayedVideoCount < allVideosData.length) {
                    isFetchingMore = true;
                    displayedVideoCount += 10; 
                    renderVideoGrid();
                    setTimeout(() => { isFetchingMore = false; }, 500);
                }
            }
        }
    });

    // 📋 टेक्स्ट स्टेटस लोडर
    function loadTextStatus(category) {
        if (!txtContainer) return;
        txtContainer.innerHTML = "";

        let currentDataSource = currentAppLang === "hindi" 
            ? (typeof hindiStatusData !== "undefined" ? hindiStatusData : null)
            : (typeof gujaratiStatusData !== "undefined" ? gujaratiStatusData : null);

        if (!currentDataSource) {
            txtContainer.innerHTML = "डेटा लोड नहीं हो पाया।";
            return;
        }

        const list = currentDataSource[category];
        if (!list || list.length === 0) {
            txtContainer.innerHTML = currentAppLang === "gujarati" ? "કોઈ સ્ટેટસ નથી મળ્યું." : "कोई स्टेटस नहीं मिला।";
            return;
        }

        list.forEach((statusText, i) => {
            const textId = `${currentAppLang}-${category}-text-${i}`;
            const card = document.createElement("div");
            card.className = "text-status-card";
            const p = document.createElement("p");
            p.innerText = statusText;

            const actionDiv = document.createElement("div");
            actionDiv.style = "position:absolute; bottom:10px; right:15px; display:flex; gap:10px; align-items:center;";

            const likeBtn = document.createElement("button");
            likeBtn.style = "padding:5px 10px; font-size:14px; background:none; border:none; cursor:pointer;";
            let savedLikes = JSON.parse(localStorage.getItem("bds_favorites")) || [];
            likeBtn.innerHTML = savedLikes.includes(textId) ? "❤️" : "🤍";

            likeBtn.onclick = () => {
                let favoriteItems = JSON.parse(localStorage.getItem("bds_favorites")) || [];
                if (favoriteItems.includes(textId)) {
                    favoriteItems = favoriteItems.filter(id => id !== textId);
                    likeBtn.innerHTML = "🤍";
                } else {
                    favoriteItems.push(textId);
                    likeBtn.innerHTML = "❤️";
                }
                localStorage.setItem("bds_favorites", JSON.stringify(favoriteItems));
            };

            const copyBtn = document.createElement("button");
            copyBtn.innerHTML = "📋 कॉपी";
            copyBtn.onclick = () => { copyAppText(statusText, copyBtn); };

            const shareBtn = document.createElement("button");
            shareBtn.innerHTML = "💬 शेयर";
            shareBtn.style = "padding:5px 12px; font-size:12px; background:#25D366; color:white; border:none; border-radius:5px;";
            shareBtn.onclick = () => { shareAppText("Bhojani Digital Seva", statusText); };

            actionDiv.appendChild(likeBtn);
            actionDiv.appendChild(copyBtn);
            actionDiv.appendChild(shareBtn);

            card.appendChild(p);
            card.appendChild(actionDiv);
            txtContainer.appendChild(card);
        });
    }

    function copyAppText(text, btnElement) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand("copy"); 
            const originalText = btnElement.innerText;
            btnElement.innerText = "✅ कॉपीड!";
            setTimeout(() => { btnElement.innerText = originalText; }, 2000);
        } catch (err) {
            console.error("Copy failed:", err);
        }
        document.body.removeChild(textArea);
    }

    async function shareAppText(title, text) {
        if (navigator.share) {
            try { await navigator.share({ title: title, text: text }); } 
            catch (err) { window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank"); }
        } else {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
        }
    }

    // 🔄 3. कंटेंट रिफ्रेश
    function refreshContent() {
        if (galleryContainer) galleryContainer.innerHTML = "";
        if (reelsContainer) reelsContainer.innerHTML = "";
        if (txtContainer) txtContainer.innerHTML = "";
        if (reelsContainer) reelsContainer.className = "reels-container video-grid-layout";

        if (currentCategory === "favorites") {
            const noFav = appLanguageData[currentAppLang].emptyFav;
            if (currentTab === "photos" && galleryContainer) galleryContainer.innerHTML = noFav;
            if (currentTab === "videos" && reelsContainer) reelsContainer.innerHTML = noFav;
            if (currentTab === "text" && txtContainer) txtContainer.innerHTML = noFav;
            return;
        }

        if (currentTab === "photos") {
            loadPhotosFromCloudinary(currentCategory);
        } else if (currentTab === "videos") {
            loadVideosFromCloudinary(currentCategory);
        } else if (currentTab === "text") {
            loadTextStatus(currentCategory);
        }
    }

    function handleLike(itemId, buttonElement) {
        let favoriteItems = JSON.parse(localStorage.getItem("bds_favorites")) || [];
        if (favoriteItems.includes(itemId)) {
            favoriteItems = favoriteItems.filter(id => id !== itemId);
            buttonElement.classList.remove("liked");
            buttonElement.innerHTML = "🤍";
        } else {
            favoriteItems.push(itemId);
            buttonElement.classList.add("liked");
            buttonElement.innerHTML = "❤️";
        }
        localStorage.setItem("bds_favorites", JSON.stringify(favoriteItems));
    }

    // 🔘 Category Buttons Click
    document.querySelectorAll(".btn-category, .category-buttons button").forEach(btn => {
        btn.addEventListener("click", e => {
            const btnId = e.currentTarget.id.toLowerCase();
            
            if (btnId.includes("love")) {
                currentCategory = "love";
            } else if (btnId.includes("sad")) {
                currentCategory = "sad";
            } else if (btnId.includes("motivation")) {
                currentCategory = "motivation";
            } else if (btnId.includes("fav")) {
                currentCategory = "favorites";
            } else {
                currentCategory = e.currentTarget.getAttribute("data-cat") || "love";
            }
            
            refreshContent();
        });
    });

    // Setup Init
    setupInfiniteScrollLoop();
    toggleLanguage(currentAppLang);
    switchTab(currentTab);
});

// 📡 ऑनलाइन / ऑफलाइन अलर्ट
window.addEventListener('offline', () => alert("अरे! इंटरनेट कनेक्शन चेक करें।"));
window.addEventListener('online', () => alert("वापस ऑनलाइन! अब आप डेटा देख सकते हैं।"));

// 🚀 ग्लोबल शेयर फंक्शन
async function shareContent(title, text, url = null) {
    const shareData = { title, text, url };
    if (navigator.share) {
        try { await navigator.share(shareData); } 
        catch (err) { window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + (url ? " " + url : ""))}`, "_blank"); }
    } else {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + (url ? " " + url : ""))}`, "_blank");
    }
}