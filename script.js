document.addEventListener("DOMContentLoaded", () => {
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

            btnFavoritesPhoto: "❤️ મનપસંદ",
            btnLovePhoto: "❤️ પ્રેમ",
            btnSadPhoto: "💔 ઉદાસ",
            btnMotivationPhoto: "🚀 પ્રેરણાત્મક",

            btnFavoritesVideo: "❤️ મનપસંદ",
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
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(() => console.log("App ready for install!"));
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
    const galleryContainer = document.getElementById("autoGallery");
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

    // Category label helper
    function getCategoryLabel(category, lang) {
        const categoryLabels = {
            hindi: {
                love: "लव / शायरी",
                sad: "सैड / शायरी",
                motivation: "मोटिवेशन / सुविचार",
                favorites: "पसंदीदा स्टेटस"
            },
            gujarati: {
                love: "પ્રેમ / શાયરી",
                sad: "ઉદાસ / શાયરી",
                motivation: "પ્રેરણાત્મક / સુવાક્ય",
                favorites: "મનપસંદ સ્ટેટસ"
            }
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

    // प्रोफाइल खोलने का फंक्शन
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

    // प्रोफाइल बंद करने का फंक्शन
    window.closeProfile = function() {
        document.getElementById("profileModal").style.display = "none";
    };

    // नाम सेव करने का फंक्शन
    window.saveName = function() {
        const nameInput = document.getElementById('userNameInput').value;
        if (nameInput) {
            localStorage.setItem('bds_user_name', nameInput);
            document.getElementById('user-initial').innerText = nameInput.charAt(0).toUpperCase();
            document.getElementById('displayName').innerText = "नमस्ते, " + nameInput;
            window.closeProfile();
        }
    };

    // बाहर क्लिक करने पर मॉडल बंद करना
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

    // 🔙 Back button (popstate) for fullscreen / lightbox
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

    // UI text change according to language
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

    // 📜 Infinite scroll loop for reels
    function setupInfiniteScrollLoop() {
        if (!reelsContainer) return;

        let touchStartY = 0;
        let touchEndY = 0;

        reelsContainer.addEventListener(
            "touchstart",
            e => {
                touchStartY = e.changedTouches[0].screenY;
            },
            { passive: true }
        );

        reelsContainer.addEventListener(
            "touchend",
            e => {
                touchEndY = e.changedTouches[0].screenY;
                if (!document.body.classList.contains("fullscreen-active")) return;

                const totalScrollHeight = reelsContainer.scrollHeight;
                const currentScrollTop = reelsContainer.scrollTop;
                const containerHeight = reelsContainer.clientHeight;

                const isAtBottom = currentScrollTop + containerHeight >= totalScrollHeight - 50;
                const isSwipeUp = touchStartY - touchEndY > 50;

                if (isAtBottom && isSwipeUp) {
                    const firstVideoCard = reelsContainer.firstElementChild;
                    if (firstVideoCard) {
                        setTimeout(() => {
                            firstVideoCard.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                    }
                }
            },
            { passive: true }
        );
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

        document.querySelectorAll("video").forEach(v => {
            v.pause();
            v.muted = true;
        });

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

    // 📸 फोटो गैलरी लोड (15 per batch + load more + loop)
    function loadPhotos(index, category, loadedCount = 0) {
        if (index === 1) {
            const oldWrapper = document.querySelector(".load-more-wrapper-photo");
            if (oldWrapper) oldWrapper.remove();
        }

        const imgUrl = `images/${currentAppLang}/${category}/${index}.jpg`;

        fetch(imgUrl, { method: "HEAD" }).then(res => {
            if (res.ok && currentCategory === category && currentTab === "photos") {
                const itemDiv = document.createElement("div");
                itemDiv.className = "gallery-item";

                const aTag = document.createElement("a");
                aTag.href = imgUrl;
                aTag.classList.add("gallery-link");
                aTag.setAttribute("data-img-id", `${currentAppLang}-${category}-photo-${index}`);

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

                loadedCount++;

                if (loadedCount >= 15) {
                    const nextImgUrl = `images/${currentAppLang}/${category}/${index + 1}.jpg`;
                    fetch(nextImgUrl, { method: "HEAD" }).then(nextRes => {
                        const oldWrapper = document.querySelector(".load-more-wrapper-photo");
                        if (oldWrapper) oldWrapper.remove();
                        
                        const oldSentinel = document.querySelector(".photo-sentinel");
                        if (oldSentinel) oldSentinel.remove();

                        if (nextRes.ok && currentCategory === category && currentTab === "photos") {
                            const sentinel = document.createElement("div");
                            sentinel.className = "photo-sentinel";
                            galleryContainer.after(sentinel);

                            const observer = new IntersectionObserver((entries) => {
                                if (entries[0].isIntersecting) {
                                    observer.unobserve(sentinel);
                                    sentinel.remove();
                                    loadPhotos(index + 1, category, 0);
                                }
                            }, { threshold: 0.1 });

                            observer.observe(sentinel);
                        } else {
                            const loopBtn = document.createElement("button");
                            loopBtn.className = "load-more-btn";
                            loopBtn.innerText = currentAppLang === "gujarati" ? "પાછાંથી જુઓ" : "फिर से शुरू करें";

                            loopBtn.onclick = (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const firstPhoto = galleryContainer.firstElementChild;
                                if (firstPhoto) firstPhoto.scrollIntoView({ behavior: "smooth" });
                            };
                            
                            const wrapperDiv = document.createElement("div");
                            wrapperDiv.className = "load-more-wrapper load-more-wrapper-photo";
                            wrapperDiv.appendChild(loopBtn);
                            galleryContainer.after(wrapperDiv);
                        }
                        
                        setupPhotoLightbox();
                    });
                } else {
                    loadPhotos(index + 1, category, loadedCount);
                }
            } else {
                if (index === 1 && galleryContainer.children.length === 0) {
                    galleryContainer.innerHTML = appLanguageData[currentAppLang].noPhoto;
                } else if (index > 1) {
                    setupPhotoLightbox();
                }
            }
        });
    }

    // 📸 फोटो लाइटबॉक्स (SimpleLightbox)
    function setupPhotoLightbox() {
        if (typeof SimpleLightbox === "undefined") return;

        if (lightboxInstance) {
            lightboxInstance.destroy();
            lightboxInstance = null;
        }

        const links = document.querySelectorAll(".gallery-link");
        if (!links.length) return;

        lightboxInstance = new SimpleLightbox(".gallery-link", {
            loop: true,
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

                let imgId = "";
                if (currentLink) {
                    imgId = currentLink.getAttribute("data-img-id") || "";
                }

                if (!imgId) {
                    const urlParts = img.src.split("/");
                    const filename = urlParts[urlParts.length - 1].replace(".jpg", "");
                    const catName = urlParts[urlParts.length - 2];
                    const langName = urlParts[urlParts.length - 3];
                    imgId = `${langName}-${catName}-photo-${filename}`;
                }

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
                        if (currentCategory === "favorites" && currentLink) {
                            currentLink.closest(".gallery-item")?.remove();
                            lightboxInstance.close();
                        }
                    } else {
                        favoriteItems.push(imgId);
                        photoLikeBtn.innerHTML = "❤️ लाइक";
                        photoLikeBtn.style.color = "#ff2b55";
                        photoLikeBtn.style.background = "#fff";
                    }

                    localStorage.setItem("bds_favorites", JSON.stringify(favoriteItems));
                };

                box.querySelector(".sl-custom-share-btn").onclick = () => {
                    let shareMessage = currentAppLang === "gujarati" 
                        ? "શાનદાર ફોટો જુઓ:" 
                        : "शानदार फोटो देखें:";
                    
                    shareContent("Bhojani Digital Seva", shareMessage, img.src);
                };

                box.querySelector(".sl-custom-download-btn").onclick = () => {
                    const a = document.createElement("a");
                    a.href = img.src;
                    a.download = "photo.jpg";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                };

                box.querySelector(".sl-custom-close-btn").onclick = () => {
                    lightboxInstance.close();
                };

                document.body.appendChild(box);
            }, 80);
        }

        lightboxInstance.on("show.simplelightbox", () => {
            history.pushState({ fullscreen: true }, "");
            renderActions();
        });

        lightboxInstance.on("changed.simplelightbox", renderActions);

        lightboxInstance.on("close.simplelightbox", () => {
            const old = document.querySelector(".sl-custom-actions");
            if (old) old.remove();
        });
    }

    // ❤️ सिंगल फोटो लोड (Favorites)
    function loadSinglePhotoForFavorites(index, category, lang, photoId) {
        const imgUrl = `images/${lang}/${category}/${index}.jpg`;
        const itemDiv = document.createElement("div");
        itemDiv.className = "gallery-item";

        const aTag = document.createElement("a");
        aTag.href = imgUrl;
        aTag.classList.add("gallery-link");
        aTag.setAttribute("data-img-id", photoId);

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

        setupPhotoLightbox();
    }

    // 🎥 सारे वीडियो लोड (category-wise, 10 per batch + load more + loop)
    function loadAllCategoryVideos(startIndex, category, loadedCount = 0) {
        const videoId = `${currentAppLang}-${category}-video-${startIndex}`;
        const videoUrl = `videos/${currentAppLang}/${category}/${startIndex}.mp4`;

        fetch(videoUrl, { method: "HEAD" }).then(res => {
            if (res.ok && currentCategory === category && currentTab === "videos") {
                const wrapper = document.createElement("div");
                wrapper.className = "reel-wrapper grid-video-item";

                const video = document.createElement("video");
                video.src = videoUrl;
                video.className = "preview-video";
                video.preload = "metadata";
                video.muted = true;
                video.playsInline = true;
                video.setAttribute("data-video-id", videoId);

                const watermark = document.createElement("div");
                watermark.className = "bds-watermark";
                const categoryLabelText = getCategoryLabel(category, currentAppLang);

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

                video.addEventListener('dblclick', (e) => {
                    const heart = document.createElement('div');
                    heart.innerHTML = '❤️';
                    heart.className = 'double-tap-heart heart-animated';
                    wrapper.appendChild(heart);

                    const likeBtn = wrapper.querySelector('.fullscreen-like-btn');
                    if (!likeBtn.classList.contains('liked')) {
                        likeBtn.click(); 
                    }
                    setTimeout(() => { heart.remove(); }, 800);
                });

                const actionsDiv = document.createElement("div");
                actionsDiv.className = "reel-actions hidden-actions";
                
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
                    let shareMessage = currentAppLang === "gujarati" 
                        ? "શાનદાર વિડીયો જુઓ:" 
                        : "शानदार वीडियो देखें:";
                    shareContent("Bhojani Digital Seva", shareMessage, video.src);
                };

                const downloadBtn = document.createElement("button");
                downloadBtn.className = "action-btn";
                downloadBtn.innerHTML = "💾";
                downloadBtn.onclick = e => {
                    e.stopPropagation();
                    const a = document.createElement("a");
                    a.href = videoUrl;
                    a.download = `${category}-${startIndex}.mp4`;
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
                reelsContainer.appendChild(wrapper);

                loadedCount++;

                if (loadedCount >= 10) {
                    const nextVideoUrl = `videos/${currentAppLang}/${category}/${startIndex + 1}.mp4`;
                    fetch(nextVideoUrl, { method: "HEAD" }).then(nextRes => {
                        if (nextRes.ok && currentCategory === category && currentTab === "videos") {
                            const sentinel = document.createElement("div");
                            sentinel.className = "scroll-sentinel";
                            reelsContainer.after(sentinel);

                            const observer = new IntersectionObserver((entries) => {
                                if (entries[0].isIntersecting) {
                                    observer.unobserve(sentinel);
                                    sentinel.remove(); 
                                    loadAllCategoryVideos(startIndex + 1, category, 0);
                                }
                            }, { threshold: 0.1 }); 

                            observer.observe(sentinel);
                        } else {
                            const loopBtn = document.createElement("button");
                            loopBtn.className = "load-more-btn";
                            loopBtn.innerText = currentAppLang === "gujarati" ? "પાછાંથી જુઓ" : "फिर से शुरू करें";
                            loopBtn.onclick = () => {
                                const firstVideo = reelsContainer.firstElementChild;
                                if (firstVideo) firstVideo.scrollIntoView({ behavior: "smooth" });
                            };
                            const wrapperDiv = document.createElement("div");
                            wrapperDiv.className = "load-more-wrapper";
                            wrapperDiv.appendChild(loopBtn);
                            reelsContainer.after(wrapperDiv);
                        }
                    });
                } else {
                    loadAllCategoryVideos(startIndex + 1, category, loadedCount);
                }
            } else {
                if (reelsContainer.children.length === 0) {
                    reelsContainer.innerHTML = appLanguageData[currentAppLang].noVideo;
                }
            }
        });
    }

    // ❤️ सिंगल वीडियो लोड (Favorites)
    function loadSingleVideoForFavorites(index, category, lang, videoId) {
        const videoUrl = `videos/${lang}/${category}/${index}.mp4`;
        const wrapper = document.createElement("div");
        wrapper.className = "reel-wrapper grid-video-item";

        const video = document.createElement("video");
        video.src = videoUrl;
        video.className = "preview-video";
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;
        video.setAttribute("data-video-id", videoId);

        const watermark = document.createElement("div");
        watermark.className = "bds-watermark";
        watermark.innerText = "BDS";

        video.onclick = () => {
            if (!document.body.classList.contains("fullscreen-active")) {
                history.pushState({ fullscreen: true }, "");
                document.body.classList.add("fullscreen-active");
                sections.videos.classList.add("fullscreen-active");
                reelsContainer.className = "reels-container reels-container-fullscreen";
                toggleCategoryButtons(false);

                document.querySelectorAll("#reelsContainer .reel-wrapper").forEach(w => w.classList.remove("grid-video-item"));
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

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "reel-actions hidden-actions";

        const fullscreenLikeBtn = document.createElement("button");
        fullscreenLikeBtn.className = "action-btn fullscreen-like-btn liked";
        fullscreenLikeBtn.innerHTML = "❤️";

        fullscreenLikeBtn.onclick = e => {
            e.stopPropagation();
            handleLike(videoId, fullscreenLikeBtn);
            wrapper.remove();

            if (reelsContainer.children.length === 0) {
                reelsContainer.innerHTML = appLanguageData[currentAppLang].emptyFav;
            }
        };

        const shareBtn = document.createElement("button");
        shareBtn.className = "action-btn whatsapp-btn";
        shareBtn.innerHTML = "💬";
        shareBtn.onclick = e => {
            e.stopPropagation();
            let shareMessage = currentAppLang === "gujarati" 
                ? "શાનદાર વિડીયો જુઓ:" 
                : "शानदार वीडियो देखें:";
            shareContent("Bhojani Digital Seva", shareMessage, video.src);
        };

        const downloadBtn = document.createElement("button");
        downloadBtn.className = "action-btn";
        downloadBtn.innerHTML = "💾";
        downloadBtn.onclick = e => {
            e.stopPropagation();
            const a = document.createElement("a");
            a.href = videoUrl;
            a.download = `${category}-${index}.mp4`;
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
        reelsContainer.appendChild(wrapper);
    }

    // 📋 ग्लोबल कॉपी फंक्शन
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

    // 💬 ग्लोबल शेयर फंक्शन
    async function shareAppText(title, text) {
        if (navigator.share) {
            try {
                await navigator.share({ title: title, text: text });
            } catch (err) {
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
            }
        } else {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
        }
    }

    // 📋 टेक्स्ट स्टेटस (20 per batch + load more + loop)
    function loadTextStatus(category, startIndex = 0, loadedCount = 0) {
        if (!txtContainer) return;
        if (category === "favorites") return;

        if (startIndex === 0) {
            txtContainer.innerHTML = "";
            const oldWrapper = document.querySelector(".load-more-wrapper-text");
            if (oldWrapper) oldWrapper.remove();
        }

        let currentDataSource = null;
        if (currentAppLang === "hindi") {
            currentDataSource = typeof hindiStatusData !== "undefined" ? hindiStatusData : null;
        } else {
            currentDataSource = typeof gujaratiStatusData !== "undefined" ? gujaratiStatusData : null;
        }

        if (!currentDataSource) {
            txtContainer.innerHTML = "डेटा लोड नहीं हो पाया।";
            return;
        }

        const list = currentDataSource[category];
        if (!list || list.length === 0) {
            txtContainer.innerHTML = currentAppLang === "gujarati" ? "કોઈ સ્ટેટસ નથી મળ્યું." : "कोई स्टेटस नहीं मिला।";
            return;
        }

        for (let i = startIndex; i < list.length && loadedCount < 20; i++) {
            const statusText = list[i];
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
                    if (currentCategory === "favorites" || category === "favorites") {
                        card.remove();
                    }
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
            loadedCount++;
            startIndex = i + 1;
        }

        if (startIndex < list.length) {
            const loadMoreBtn = document.createElement("button");
            loadMoreBtn.className = "load-more-btn";
            loadMoreBtn.innerText = currentAppLang === "gujarati" ? "વધુ લખાણ જુઓ" : "और टेक्स्ट देखें";

            loadMoreBtn.onclick = () => {
                const parent = loadMoreBtn.parentElement;
                if (parent && parent.classList.contains("load-more-wrapper-text")) {
                    parent.remove();
                } else {
                    loadMoreBtn.remove();
                }
                loadTextStatus(category, startIndex, 0);
            };

            const wrapperDiv = document.createElement("div");
            wrapperDiv.className = "load-more-wrapper load-more-wrapper-text";
            wrapperDiv.appendChild(loadMoreBtn);
            txtContainer.appendChild(wrapperDiv); 
        } else {
            const loopBtn = document.createElement("button");
            loopBtn.className = "load-more-btn";
            loopBtn.innerText = currentAppLang === "gujarati" ? "પાછાંથી વાંચો" : "फिर से शुरू करें";

            loopBtn.onclick = () => {
                const firstCard = txtContainer.firstElementChild;
                if (firstCard) firstCard.scrollIntoView({ behavior: "smooth" });
            };

            const wrapperDiv = document.createElement("div");
            wrapperDiv.className = "load-more-wrapper load-more-wrapper-text";
            wrapperDiv.appendChild(loopBtn);
            txtContainer.appendChild(wrapperDiv); 
        }
    }

    // ❤️ सिंगल टेक्स्ट लोड (Favorites)
    function loadSingleTextForFavorites(index, category, lang, textId) {
        if (!txtContainer) return;

        let dataSource = null;
        if (lang === "hindi") {
            dataSource = typeof hindiStatusData !== "undefined" ? hindiStatusData : null;
        } else {
            dataSource = typeof gujaratiStatusData !== "undefined" ? gujaratiStatusData : null;
        }
        if (!dataSource) return;

        const list = dataSource[category];
        if (!list || typeof list[index] === "undefined") return;

        const statusText = list[index];
        const card = document.createElement("div");
        card.className = "text-status-card";

        const p = document.createElement("p");
        p.innerText = statusText;

        const actionDiv = document.createElement("div");
        actionDiv.style = "position:absolute; bottom:10px; right:15px; display:flex; gap:10px; align-items:center;";

        const likeBtn = document.createElement("button");
        likeBtn.style = "padding:5px 10px; font-size:14px; background:none; border:none; cursor:pointer;";
        likeBtn.innerHTML = "❤️"; 

        likeBtn.onclick = () => {
            let favoriteItems = JSON.parse(localStorage.getItem("bds_favorites")) || [];
            if (favoriteItems.includes(textId)) {
                favoriteItems = favoriteItems.filter(id => id !== textId);
                localStorage.setItem("bds_favorites", JSON.stringify(favoriteItems));
                card.remove();
            }
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
    }

    // 🔄 कंटेंट रिफ्रेश (tab + category + language)
    function refreshContent() {
        if (galleryContainer) galleryContainer.innerHTML = "";
        if (reelsContainer) reelsContainer.innerHTML = "";
        if (txtContainer) txtContainer.innerHTML = "";
        if (reelsContainer) reelsContainer.className = "reels-container video-grid-layout";

        const oldVideoWrapper = document.querySelector(".load-more-wrapper-video");
        if (oldVideoWrapper) oldVideoWrapper.remove();

        const oldPhotoWrapper = document.querySelector(".load-more-wrapper-photo");
        if (oldPhotoWrapper) oldPhotoWrapper.remove();

        const oldTextWrapper = document.querySelector(".load-more-wrapper-text");
        if (oldTextWrapper) oldTextWrapper.remove();

        if (currentCategory === "favorites") {
            const savedLikes = JSON.parse(localStorage.getItem("bds_favorites")) || [];
            let hasItemsInCurrentTab = false;

            if (savedLikes.length > 0) {
                savedLikes.forEach(itemId => {
                    const parts = itemId.split("-");
                    if (parts.length < 4) return;

                    const lang = parts[0];
                    const cat = parts[1];
                    const type = parts[2];
                    const idx = parseInt(parts[3], 10);

                    if (lang !== currentAppLang) return;

                    if (currentTab === "videos" && type === "video") {
                        loadSingleVideoForFavorites(idx, cat, lang, itemId);
                        hasItemsInCurrentTab = true;
                    } else if (currentTab === "photos" && type === "photo") {
                        loadSinglePhotoForFavorites(idx, cat, lang, itemId);
                        hasItemsInCurrentTab = true;
                    } else if (currentTab === "text" && type === "text") {
                        loadSingleTextForFavorites(idx, cat, lang, itemId);
                        hasItemsInCurrentTab = true;
                    }
                });
            }

            if (!hasItemsInCurrentTab) {
                const noFav = appLanguageData[currentAppLang].emptyFav;
                if (currentTab === "photos" && galleryContainer) galleryContainer.innerHTML = noFav;
                if (currentTab === "videos" && reelsContainer) reelsContainer.innerHTML = noFav;
                if (currentTab === "text" && txtContainer) txtContainer.innerHTML = noFav;
            }
            return;
        }

        if (currentTab === "photos") {
            loadPhotos(1, currentCategory);
        } else if (currentTab === "videos") {
            loadAllCategoryVideos(1, currentCategory);
        } else if (currentTab === "text") {
            loadTextStatus(currentCategory, 0, 0);
        }
    }

    // Category buttons click
    document.querySelectorAll(".btn-category").forEach(btn => {
        btn.addEventListener("click", e => {
            currentCategory = e.target.getAttribute("data-cat") || e.target.id.replace("btn", "").toLowerCase();
            refreshContent();
        });
    });

    // Initial setup calls
    setupInfiniteScrollLoop();
    toggleLanguage(currentAppLang);
    switchTab(currentTab);

    // ❤️ Common handleLike helper
    function handleLike(itemId, buttonElement) {
        let favoriteItems = JSON.parse(localStorage.getItem("bds_favorites")) || [];

        if (favoriteItems.includes(itemId)) {
            favoriteItems = favoriteItems.filter(id => id !== itemId);
            buttonElement.classList.remove("liked");
        } else {
            favoriteItems.push(itemId);
            buttonElement.classList.add("liked");
        }
        localStorage.setItem("bds_favorites", JSON.stringify(favoriteItems));
    }
}); // DOMContentLoaded का बंद ब्रैकेट

// 📡 इंटरनेट कनेक्शन अलर्ट
window.addEventListener('offline', () => {
    alert("अरे! इंटरनेट कनेक्शन चेक करें।");
});

window.addEventListener('online', () => {
    alert("वापस ऑनलाइन! अब आप डेटा देख सकते हैं।");
});

// 🚀 ग्लोबल शेयर फंक्शन
async function shareContent(title, text, url = null) {
    const shareData = {
        title: title,
        text: text,
        url: url
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + (url ? " " + url : ""))}`, "_blank");
        }
    } else {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + (url ? " " + url : ""))}`, "_blank");
    }
}