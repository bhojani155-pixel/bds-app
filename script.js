// ==========================================
// 🌐 1. ग्लोबल हेल्पर्स एवं भाषा फंक्शंस
// ==========================================

// भाषा पता करने का सेफ फंक्शन
function getAppLanguage() {
    const gujBtn = document.getElementById("btnLangGujarati");
    if (gujBtn && gujBtn.classList.contains("active")) return "gujarati";

    if (typeof window.currentAppLang !== "undefined" && window.currentAppLang) return window.currentAppLang;

    const savedLang = localStorage.getItem("user_app_lang") || localStorage.getItem("appLang");
    if (savedLang) return savedLang.toLowerCase();

    return "hindi";
}
window.getAppLanguage = getAppLanguage;

// OneSignal Init + Language Tag Setup
window.OneSignalDeferred = window.OneSignalDeferred || [];
OneSignalDeferred.push(async function(OneSignal) {
  await OneSignal.init({
    appId: "9278cc17-9628-42ef-ace6-cbef8e03f779",
  });

  // 🏷️ यूज़र की भाषा पता करके OneSignal में Tag सेट करना
  const lang = getAppLanguage();
  await OneSignal.User.addTag("user_lang", lang);
});

// 🗓️ तारीख से सीड बनाना और डेली शफल
function getDailySeed() {
    const today = new Date();
    return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

function seededRandom(seed) {
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function shuffleArrayDaily(array) {
    if (!array || array.length === 0) return [];
    const seed = getDailySeed();
    const random = seededRandom(seed);
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ==========================================
// 👤 2. प्रोफाइल सेटिंग्स एवं लाइव प्रीव्यू फ़ंक्शंस
// ==========================================

function previewPhoto(event) {
    const file = event ? event.target.files[0] : null;
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = document.getElementById('avatarImage');
            if (img) img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}
window.previewPhoto = previewPhoto;

function saveUserProfile() {
    const nameEl = document.getElementById('inputName');
    const phoneEl = document.getElementById('inputPhone');
    const taglineEl = document.getElementById('inputTagline');
    const avatarEl = document.getElementById('avatarImage');

    const name = nameEl ? nameEl.value : '';
    const phone = phoneEl ? phoneEl.value : '';
    const tagline = taglineEl ? taglineEl.value : '';
    const photo = avatarEl ? avatarEl.src : '';

    if (!name.trim()) {
        alert("कृपया अपना नाम लिखें / કૃપા કરીને નામ લખો");
        return;
    }

    const profileData = { name, phone, tagline, photo };
    localStorage.setItem('bds_user_profile', JSON.stringify(profileData));

    alert("✅ प्रोफाइल सफलतापूर्वक सेव हो गई!");
    closeProfileModal();
}
window.saveUserProfile = saveUserProfile;

function loadUserProfile() {
    const saved = localStorage.getItem('bds_user_profile');
    if (saved) {
        try {
            const profile = JSON.parse(saved);
            if (document.getElementById('inputName')) document.getElementById('inputName').value = profile.name || '';
            if (document.getElementById('inputPhone')) document.getElementById('inputPhone').value = profile.phone || '';
            if (document.getElementById('inputTagline')) document.getElementById('inputTagline').value = profile.tagline || '';
            if (profile.photo && document.getElementById('avatarImage')) {
                document.getElementById('avatarImage').src = profile.photo;
            }
        } catch (e) { console.error("Error loading profile", e); }
    }
}

function updateModalLanguage() {
    const userLang = getAppLanguage();
    const isGujarati = userLang === 'gujarati';

    const setTxt = (id, txt) => {
        const el = document.getElementById(id);
        if (el) el.innerText = txt;
    };

    if (isGujarati) {
        setTxt('modalTitle', 'તમારી પ્રોફાઇલ સેટ કરો 👤');
        setTxt('modalSubTitle', 'આ માહિતી તમારા દરેક સ્ટેટસ પર દેખાશે');
        setTxt('uploadBadgeBtn', '📷 ફોટો પસંદ કરો');
        setTxt('lblInputName', 'પૂરું નામ');
        setTxt('lblInputPhone', 'મોબાઇલ નંબર');
        setTxt('lblInputTagline', 'હોદ્દો / ઓળખ (Designation)');
        setTxt('saveProfileBtn', 'સેવ કરો 🚀');
    } else {
        setTxt('modalTitle', 'आपकी प्रोफाइल सेट करें 👤');
        setTxt('modalSubTitle', 'यह जानकारी आपके हर स्टेटस पर दिखाई देगी');
        setTxt('uploadBadgeBtn', '📷 फोटो चुनें');
        setTxt('lblInputName', 'पूरा नाम');
        setTxt('lblInputPhone', 'मोबाइल नंबर');
        setTxt('lblInputTagline', 'पद / पहचान (Designation)');
        setTxt('saveProfileBtn', 'सेव करें 🚀');
    }
}

function openProfileModal() {
    updateModalLanguage();
    loadUserProfile();
    const modal = document.getElementById('profileModal');
    if (modal) modal.classList.add('active');
}
window.openProfileModal = openProfileModal;

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.classList.remove('active');
}
window.closeProfileModal = closeProfileModal;

// ==========================================
// 🎨 3. फोटो के TOP (ऊपर) पर प्रोफाइल प्रिंट करने का 100% सटीक कोड
// ==========================================

// 🔹 राउंडेड ग्लास कार्ड बनाने का हेल्पर फंक्शन
function drawCanvasCard(ctx, x, y, width, height, radius, fillStyle, strokeStyle) {
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(x, y, width, height, radius);
    } else {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
    }
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, Math.floor(height * 0.02));
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
    ctx.restore();
}

function createProfileStitchedBlob(imageUrl, profile) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;

        img.onload = async () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;

                // 1. मुख्य फोटो ड्रा करें
                ctx.drawImage(img, 0, 0);

                // 2. प्रोफाइल कार्ड (यदि यूजर का नाम सेव है)
                if (profile && profile.name) {
                    // 📐 TOP POSITION: कार्ड को फोटो के ऊपरी हिस्से (Top 3.5% margin) पर सेट किया गया है
                    const cardHeight = Math.floor(canvas.height * 0.11); 
                    const marginX = Math.floor(canvas.width * 0.035);    
                    const marginTop = Math.floor(canvas.height * 0.035); 

                    const cardWidth = canvas.width - (marginX * 2);
                    const cardX = marginX;
                    const cardY = marginTop; // 👈 हमेशा फोटो के ऊपर
                    const borderRadius = Math.floor(cardHeight * 0.22);

                    // 🌙 ट्रांसपेरेंट डार्क ग्लास बैकग्राउंड कार्ड
                    drawCanvasCard(
                        ctx,
                        cardX,
                        cardY,
                        cardWidth,
                        cardHeight,
                        borderRadius,
                        'rgba(0, 0, 0, 0.82)',
                        'rgba(255, 255, 255, 0.25)'
                    );

                    let textXOffset = cardX + cardHeight * 0.35;

                    // 🖼️ गोल प्रोफाइल फोटो
                    if (profile.photo) {
                        try {
                            const avatarImg = new Image();
                            avatarImg.crossOrigin = 'anonymous';
                            avatarImg.src = profile.photo;

                            await new Promise(res => { 
                                avatarImg.onload = res; 
                                avatarImg.onerror = res; 
                            });

                            if (avatarImg.complete && avatarImg.naturalWidth > 0) {
                                const avatarSize = cardHeight * 0.80; 
                                const avatarX = cardX + cardHeight * 0.12;
                                const avatarY = cardY + (cardHeight - avatarSize) / 2;

                                ctx.save();
                                ctx.beginPath();
                                ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
                                ctx.closePath();
                                ctx.clip();
                                ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
                                ctx.restore();

                                // नीली बॉर्डर
                                ctx.lineWidth = Math.max(2, Math.floor(cardHeight * 0.035));
                                ctx.strokeStyle = '#00a2ff';
                                ctx.beginPath();
                                ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
                                ctx.stroke();

                                textXOffset = avatarX + avatarSize + cardHeight * 0.18;
                            }
                        } catch (e) { console.log('Avatar stitch error:', e); }
                    }

                    // ✍️ नाम और पद
                    ctx.textAlign = 'left';
                    ctx.fillStyle = '#ffffff';
                    ctx.font = `bold ${Math.floor(cardHeight * 0.32)}px sans-serif`;

                    if (profile.tagline) {
                        ctx.fillText(profile.name, textXOffset, cardY + cardHeight * 0.44);
                        ctx.fillStyle = '#cccccc';
                        ctx.font = `${Math.floor(cardHeight * 0.22)}px sans-serif`;
                        ctx.fillText(profile.tagline, textXOffset, cardY + cardHeight * 0.76);
                    } else {
                        ctx.fillText(profile.name, textXOffset, cardY + cardHeight * 0.60);
                    }

                    // 🚀 BDS ब्रांड लोगो
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
                    ctx.font = `900 ${Math.floor(cardHeight * 0.36)}px sans-serif`;
                    ctx.textAlign = 'right';
                    ctx.fillText('BDS', cardX + cardWidth - cardHeight * 0.25, cardY + cardHeight * 0.60);
                }

                canvas.toBlob(blob => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas conversion failed'));
                }, 'image/jpeg', 0.95);
            } catch (err) {
                reject(err);
            }
        };

        img.onerror = err => reject(err);
    });
}

// 🌐 स्मार्ट ऐप लिंक
const isLocal = window.location.hostname === "localhost" || 
                window.location.hostname === "127.0.0.1" || 
                window.location.protocol === "file:";

const YOUR_APP_URL = isLocal 
    ? "https://bds-app-olive.vercel.app/" 
    : (window.location.origin + window.location.pathname);

// 📤 स्मार्ट शेयर फ़ंक्शन
async function shareMediaContent(type, mediaUrlOrText) {
    const userLang = typeof getAppLanguage === 'function' ? getAppLanguage() : 'hindi';
    const appTitle = "Bhojani Daily Status";

    let shareMsg = userLang === "gujarati" 
        ? "આવા બીજા શાનદાર સ્ટેટસ જોવા માટે જુઓ:" 
        : "ऐसे और शानदार स्टेटस देखने के लिए देखें:";

    const captionText = `✨ *${appTitle}* ✨\n${shareMsg}\n👉 ${YOUR_APP_URL}`;

    // 1. केवल टेक्स्ट स्टेटस शेयर
    if (type === 'text') {
        const fullText = `"${mediaUrlOrText}"\n\n${captionText}`;
        if (navigator.share) {
            try {
                await navigator.share({ title: appTitle, text: fullText });
            } catch (err) {
                if (err.name !== 'AbortError') window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`, '_blank');
            }
        } else {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`, '_blank');
        }
        return;
    }

    // 2. फोटो और वीडियो शेयर
    try {
        let file;
        const fileName = `bds_status_${Date.now()}.${type === 'photo' ? 'jpg' : 'mp4'}`;

        if (type === 'photo') {
            const savedProfile = localStorage.getItem('bds_user_profile');
            const profile = savedProfile ? JSON.parse(savedProfile) : null;
            const imageBlob = await createProfileStitchedBlob(mediaUrlOrText, profile);
            file = new File([imageBlob], fileName, { type: 'image/jpeg' });
        } else {
            const response = await fetch(mediaUrlOrText);
            const blob = await response.blob();
            file = new File([blob], fileName, { type: 'video/mp4' });
        }

        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(captionText);
            }
        } catch (clipErr) {
            console.log('Clipboard copy skipped');
        }

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: appTitle,
                text: captionText
            });
        } else {
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(file);
            downloadLink.download = fileName;
            downloadLink.click();
            alert('✅ फोटो गैलरी में सेव हो गई है और ऐप लिंक कॉपी हो गया है!');
        }
    } catch (err) {
        console.error('Sharing Error:', err);
        if (err.name !== 'AbortError') {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(captionText + "\n" + mediaUrlOrText)}`, '_blank');
        }
    }
}
window.shareMediaContent = shareMediaContent;
// 🚀 4. मुख्य ऐप लॉजिक (DOM CONTENT LOADED)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const cloudName = "dailystatus-bds";

    // 🌐 सभी भाषा डेटा (प्रोफाइल, शेयर और रेट बटन को भी यहाँ जोड़ दिया गया है)
    const appLanguageData = {
        hindi: {
            profileText: "👤 प्रोफाइल",
            appShareBtn: "🔗 शेयर",
            appRateBtn: "⭐ रेट करें",
            btnFavoritesText: "❤️ पसंदीदा", btnLoveText: "❤️ लव", btnSadText: "💔 सैड", btnMotivationText: "🚀 मोटिवेशन", btnBhaktiText: "🙏 भक्ति",
            btnFavoritesPhoto: "❤️ पसंदीदा", btnLovePhoto: "❤️ लव", btnSadPhoto: "💔 सैड", btnMotivationPhoto: "🚀 मोटिवेशन", btnBhaktiPhoto: "🙏 भक्ति",
            btnFavoritesVideo: "❤️ पसंदीदा", btnLoveVideo: "❤️ लव", btnSadVideo: "💔 सैड", btnMotivationVideo: "🚀 मोटिवेशन", btnBhaktiVideo: "🙏 भक्ति",
            tabText: "📝 टेक्स्ट", tabPhotos: "📸 फोटो", tabVideos: "🎥 रील्स",
            emptyFav: "<div style='color:#aaa; text-align:center; padding:50px; grid-column: span 4;'>आपने अभी तक कुछ भी लाइक नहीं किया है! ❤️</div>",
            noPhoto: "<div style='color:#aaa; text-align:center; padding:50px; grid-column: span 4;'>कोई फोटो नहीं मिली!</div>",
            noVideo: "<div style='color:#aaa; text-align:center; padding:50px; grid-column: span 4;'>कोई वीडियो नहीं मिला!</div>"
        },
        gujarati: {
            profileText: "👤 પ્રોફાઇલ",
            appShareBtn: "🔗 શેર કરો",
            appRateBtn: "⭐ રેટ કરો",
            btnFavoritesText: "❤️ મનપસંદ", btnLoveText: "❤️ પ્રેમ", btnSadText: "💔 ઉદાસ", btnMotivationText: "🚀 પ્રેરણાત્મક", btnBhaktiText: "🙏 ભક્તિ",
            btnFavoritesPhoto: "❤️ મનપસંદ", btnLovePhoto: "❤️ પ્રેમ", btnSadPhoto: "💔 ઉદાસ", btnMotivationPhoto: "🚀 પ્રેરણાત્મક", btnBhaktiPhoto: "🙏 ભક્તિ",
            btnFavoritesVideo: "❤️ મનપસંદ", btnLoveVideo: "❤️ પ્રેમ", btnSadVideo: "💔 ઉદાસ", btnMotivationVideo: "🚀 પ્રેરણાત્મક", btnBhaktiVideo: "🙏 ભક્તિ",
            tabText: "📝 લખાણ", tabPhotos: "📸 ફોટો", tabVideos: "🎥 રીલ્સ",
            emptyFav: "<div style='color:#aaa; text-align:center; padding:50px; grid-column: span 4;'>તમે હજુ સુધી કંઈપણ લાઈક કર્યું નથી! ❤️</div>",
            noPhoto: "<div style='color:#aaa; text-align:center; padding:50px; grid-column: span 4;'>કોઈ ફોટો મળ્યો નથી!</div>",
            noVideo: "<div style='color:#aaa; text-align:center; padding:50px; grid-column: span 4;'>કોઈ વિડિયો મળ્યો નથી!</div>"
        }
    };

    const tabs = { text: document.getElementById("tabText"), photos: document.getElementById("tabPhotos"), videos: document.getElementById("tabVideos") };
    const sections = { text: document.getElementById("textSection"), photos: document.getElementById("photoSection"), videos: document.getElementById("videoSection") };

    const galleryContainer = document.getElementById("autoGallery") || document.getElementById("galleryContainer");
    const reelsContainer = document.getElementById("reelsContainer");
    const txtContainer = document.getElementById("textStatusContainer");
    const darkModeBtn = document.getElementById("darkModeBtn");

    let currentAppLang = localStorage.getItem("user_app_lang") || "hindi";
    window.currentAppLang = currentAppLang;

    let currentTab = localStorage.getItem("bds_current_tab") || "videos";
    let currentCategory = "bhakti";
    let videoObserver = null;

    let cloudResources = [];
    let loadIndex = 0;
    let lazyLoadObserver = null;

    let currentTextSourceList = [];
    let textLoadIndex = 0;
    const textsPerLoad = 25;
    const photoItemsPerLoad = 25;
    let currentLightboxIndex = 0;

    const avatarInputEl = document.getElementById('avatarInput');
    if (avatarInputEl) {
        avatarInputEl.addEventListener('change', previewPhoto);
    }

    function getFavorites() {
        const favs = JSON.parse(localStorage.getItem("bds_favorites")) || [];
        return favs.map(item => typeof item === 'string' ? { id: item, url: '', type: 'unknown' } : item);
    }

    function isFavorite(itemId) {
        return getFavorites().some(fav => fav.id === itemId);
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
            hindi: { love: "लव / शायरी", sad: "सैड / शायरी", motivation: "मोटिवेशन / सुविचार", bhakti: "भक्ति / आराधना", favorites: "पसंदीदा स्टेटस" },
            gujarati: { love: "પ્રેમ / શાયરી", sad: "ઉદાસ / શાયરી", motivation: "પ્રેરણાત્મક / સુવાક્ય", bhakti: "ભક્તિ / આરાધના", favorites: "મનપસંદ સ્ટેટસ" }
        };
        return (categoryLabels[lang] && categoryLabels[lang][category]) || category;
    }

    if (localStorage.getItem("appDarkMode") === "enabled") document.body.classList.add("dark-mode");
    if (darkModeBtn) {
        darkModeBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            localStorage.setItem("appDarkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
        });
    }

    window.addEventListener("popstate", () => {
        closeCustomLightbox();
        if (document.body.classList.contains("fullscreen-active")) switchTab(currentTab);
    });

    // 🌐 भाषा बदलने का मुख्य फ़ंक्शन (एकदम क्लीन)
    window.toggleLanguage = function (lang) {
        currentAppLang = lang;
        window.currentAppLang = lang;
        localStorage.setItem("user_app_lang", lang);

        const btnHindi = document.getElementById("btnLangHindi");
        const btnGujarati = document.getElementById("btnLangGujarati");

        if (btnHindi) btnHindi.classList.toggle("active", lang === "hindi");
        if (btnGujarati) btnGujarati.classList.toggle("active", lang === "gujarati");

        updateAppLanguageUI();
        if (typeof refreshContent === "function") refreshContent();

        // 🏷️ OneSignal में तुरंत भाषा का Tag अपडेट करने के लिए:
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        OneSignalDeferred.push(function(OneSignal) {
            OneSignal.User.addTag("user_lang", lang);
        });
    };

    // 🎨 UI अपडेट करने का फ़ंक्शन (हेडर और बटनों के साथ)
    function updateAppLanguageUI() {
        const data = appLanguageData[currentAppLang];
        if (!data) return;

        // ID से सभी बटनों का टेक्स्ट बदलें
        Object.keys(data).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = data[id];
        });

        // प्रोफाइल बटन क्लास से अपडेट करें
        const profileBtn = document.querySelector('.profile-btn');
        if (profileBtn && data.profileText) {
            profileBtn.innerText = data.profileText;
        }

        if (tabs.text) tabs.text.innerText = data.tabText;
        if (tabs.photos) tabs.photos.innerText = data.tabPhotos;
        if (tabs.videos) tabs.videos.innerText = data.tabVideos;
    }

    // शुरुआती UI भाषा लोड करें
    updateAppLanguageUI();

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

    async function loadPhotosFromCloudinary(category) {
        if (!galleryContainer) return;
        closeCustomLightbox();
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
            cloudResources = shuffleArrayDaily(data.resources || []);
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

    function loadFavoritePhotos() {
        closeCustomLightbox();
        const favs = getFavorites().filter(f => f.type === 'photo' && f.id.startsWith(`${currentAppLang}-`));
        galleryContainer.innerHTML = '';
        if (favs.length === 0) {
            galleryContainer.innerHTML = appLanguageData[currentAppLang].emptyFav;
            return;
        }
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

            aTag.appendChild(img);
            itemDiv.appendChild(aTag); 
            galleryContainer.appendChild(itemDiv);
        });
    }

    function renderPhotosBatch() {
        const batch = cloudResources.slice(loadIndex, loadIndex + photoItemsPerLoad);
        if (batch.length === 0) return;

        removeSentinel();
        const startIndex = loadIndex;

        batch.forEach((image, i) => {
            const globalIndex = startIndex + i;
            const imgUrl = image.customUrl || `https://res.cloudinary.com/${cloudName}/image/upload/v${image.version}/${image.public_id}.${image.format}`;
            const photoId = image.customUrl ? image.public_id : `${currentAppLang}-${currentCategory}-photo-${image.public_id}`;

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

            aTag.appendChild(img);
            itemDiv.appendChild(aTag);
            galleryContainer.appendChild(itemDiv);
        });

        loadIndex += photoItemsPerLoad;
        if (loadIndex < cloudResources.length) {
            addSentinel(galleryContainer, renderPhotosBatch);
        }
    }

    function openCustomLightbox(index) {
        currentLightboxIndex = index;
        let modal = document.getElementById("custom-lightbox-modal");

        if (!modal) {
            modal = document.createElement("div");
            modal.id = "custom-lightbox-modal";
            modal.style.cssText = `
                position: fixed !important; top: 0 !important; left: 0 !important;
                width: 100vw !important; height: 100vh !important;
                background: rgba(0, 0, 0, 0.92) !important; backdrop-filter: blur(10px) !important;
                z-index: 999999 !important; display: flex !important;
                flex-direction: column !important; justify-content: center !important;
                align-items: center !important; box-sizing: border-box !important;
            `;

           modal.innerHTML = `
    <button id="lb-prev-btn" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); background: rgba(0, 0, 0, 0.35); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: #fff; border: 1px solid rgba(255, 255, 255, 0.3); font-size: 22px; width: 50px; height: 50px; border-radius: 50%; cursor: pointer; z-index: 1000000; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">❮</button>
    <img id="custom-lightbox-img" src="" alt="Photo" style="max-width: 95%; max-height: 78vh; object-fit: contain; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.6);">
    <button id="lb-next-btn" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: rgba(0, 0, 0, 0.35); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: #fff; border: 1px solid rgba(255, 255, 255, 0.3); font-size: 22px; width: 50px; height: 50px; border-radius: 50%; cursor: pointer; z-index: 1000000; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">❯</button>
    <div id="lightbox-actions" style="margin-top: 18px; display: flex; gap: 12px; z-index: 1000000;"></div>
`;
document.body.appendChild(modal);

modal.querySelector("#lb-prev-btn").onclick = (e) => { e.stopPropagation(); changeLightboxPhoto(-1); };
modal.querySelector("#lb-next-btn").onclick = (e) => { e.stopPropagation(); changeLightboxPhoto(1); };
            let touchStartX = 0;
            modal.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
            modal.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const distance = touchStartX - touchEndX;
                if (distance > 40) changeLightboxPhoto(1);
                else if (distance < -40) changeLightboxPhoto(-1);
            }, { passive: true });
        }

        modal.style.display = "flex";
        history.pushState({ lightbox: true }, "");
        updateCustomLightboxView();
    }

    function changeLightboxPhoto(direction) {
        const nextIndex = currentLightboxIndex + direction;
        if (nextIndex >= 0 && nextIndex < cloudResources.length) {
            currentLightboxIndex = nextIndex;
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
            <button id="lb-like-btn" style="padding: 10px 20px; border-radius: 25px; border: none; font-weight: bold; cursor: pointer; background: ${isLiked ? '#d63353' : 'rgba(173, 211, 211, 0.2)'}; color: #fff; backdrop-filter: blur(10px); box-shadow: 0 4px 5px rgba(0,0,0,0.3);">${isLiked ? "❤️ लाइक" : "🤍 लाइक"}</button>
            <button id="lb-share-btn" style="padding: 10px 20px; border-radius: 25px; border: none; font-weight: bold; cursor: pointer; background: linear-gradient(135deg, #11998e, #38ef7d); color: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">💬 शेयर</button>
            <button id="lb-close-btn" style="padding: 10px 20px; border-radius: 25px; border: none; font-weight: bold; cursor: pointer; background: linear-gradient(135deg, #8a2387, #d94e96f1); color: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">↩️ बैक</button>
        `;

        document.getElementById("lb-like-btn").onclick = () => {
            toggleFavoriteItem({ id: photoId, url: imgUrl, type: 'photo' });
            updateCustomLightboxView();
            if (currentCategory === "favorites") loadFavoritePhotos();
        };

        document.getElementById("lb-share-btn").onclick = () => { shareMediaContent('photo', imgUrl); };
        document.getElementById("lb-close-btn").onclick = closeCustomLightbox;
    }

    function closeCustomLightbox() {
        const modal = document.getElementById("custom-lightbox-modal");
        if (modal) modal.style.display = "none";
    }

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
            cloudResources = shuffleArrayDaily(data.resources || []);
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
        favs.forEach(fav => { renderSingleVideoElement(fav.url, fav.id, "favorites"); });
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
                document.querySelectorAll("video").forEach(v => { v.pause(); v.className = "fullscreen-video"; v.muted = true; });

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
        shareBtn.onclick = e => { e.stopPropagation(); shareMediaContent('video', videoUrl); };

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

        batch.forEach(item => { renderSingleTextCard(item.text, item.id); });

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
            navigator.clipboard.writeText(statusText);
            const originalText = copyBtn.innerText;
            copyBtn.innerText = "✅ कॉपीड!";
            setTimeout(() => { copyBtn.innerText = originalText; }, 2000);
        };

        const shareBtn = document.createElement("button");
        shareBtn.innerHTML = "💬 शेयर";
        shareBtn.style = "padding:5px 12px; font-size:12px; background:#25D366; color:white; border:none; border-radius:5px;";
        shareBtn.onclick = () => { shareMediaContent('text', statusText); };

        actionDiv.appendChild(likeBtn); actionDiv.appendChild(copyBtn); actionDiv.appendChild(shareBtn);
        card.appendChild(p); card.appendChild(actionDiv); txtContainer.appendChild(card);
    }

    function refreshContent() {
        removeSentinel();
        closeCustomLightbox();
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
            if (btnId.includes("bhakti")) currentCategory = "bhakti";
            else if (btnId.includes("sad")) currentCategory = "sad";
            else if (btnId.includes("motivation")) currentCategory = "motivation";
            else if (btnId.includes("fav")) currentCategory = "favorites";
            else if (btnId.includes("love")) currentCategory = "love";
            else currentCategory = e.currentTarget.getAttribute("data-cat") || "bhakti";
            refreshContent();
        });
    });

    const topHeaderShareBtn = document.getElementById("appShareBtn") || document.getElementById("app-share-btn");
    if (topHeaderShareBtn) {
        topHeaderShareBtn.onclick = (e) => {
            e.preventDefault();
            const userLang = getAppLanguage();
            let shareMessage = userLang === "gujarati" 
                ? "શાનદાર સ્ટેટસ માટે જુઓ Bhojani Digital Seva એપ! 👇" 
                : "शानदार स्टेटस के लिए देखें Bhojani Digital Seva ऐप! 👇";
            shareMediaContent('text', shareMessage);
        };
    }

    toggleLanguage(currentAppLang);
    switchTab(currentTab);
});
// 🔄 यूनिवर्सल थीम टॉगल फंक्शन
function toggleTheme() {
    // 1. body पर क्लास स्विच करें
    const isLightNow = document.body.classList.toggle('light-mode');
    
    // अगर आपकी पुरानी CSS 'dark-mode' इस्तेमाल करती है, तो उसे भी हैंडल करें
    if (isLightNow) {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('userTheme', 'light');
    } else {
        document.body.classList.add('dark-mode');
        localStorage.setItem('userTheme', 'dark');
    }

    // 2. बटन का टेक्स्ट/आइकन बदलें
    updateThemeButtonUI(isLightNow);
}

// बटन का टेक्स्ट अपडेट करने का फ़ंक्शन
function updateThemeButtonUI(isLight) {
    // आपकी ऐप में बटन की जो भी क्लास/ID हो, यह सबको ढूँढ लेगा
    const btn = document.querySelector('.btn-dark-toggle') || 
                document.querySelector('.theme-btn') || 
                document.getElementById('themeBtn');

    if (btn) {
        btn.innerHTML = isLight ? '🌙 Dark' : '☀️ Light';
    }
}
//play stor reting//
function rateApp() {
    // अपनी Play Store की लिंक यहाँ डालें (जब ऐप प्ले स्टोर पर लाइव हो जाए)
    // अभी के लिए यह आपकी वेबसाइट / प्ले स्टोर का लिंक ओपन करेगा
    const playStoreUrl = "https://play.google.com/store/apps/details?id=com.bhojani.dailystatus"; 
    
    // अगर मोबाइल ऐप में चल रहा है या वेब में, सीधे लिंक खोलेगा
    window.open(playStoreUrl, "_blank");
}
// 🚀 पेज लोड होते ही थीम और बटन सेट करें
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('userTheme');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        updateThemeButtonUI(true);
    } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        updateThemeButtonUI(false);
    }

    // किसी भी डार्क/लाइट बटन पर अपने-आप क्लिक इवेंट जोड़ें
    const btn = document.querySelector('.btn-dark-toggle') || 
                document.querySelector('.theme-btn') || 
                document.getElementById('themeBtn');
                
    if (btn) {
        btn.onclick = toggleTheme;
    }
});

// ==========================================
// 📲 5. सर्विस वर्कर (PWA Offline)
// ==========================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then((registration) => {
            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        if (confirm('नया अपडेट उपलब्ध है! ऐप को अपडेट करने के लिए OK दबाएं।')) {
                            window.location.reload();
                        }
                    }
                };
            };
        }).catch(err => console.error("SW Registration failed:", err));
    });
}

window.addEventListener('offline', () => alert("अरे! इंटरनेट कनेक्शन चेक करें।"));
window.addEventListener('online', () => alert("वापस ऑनलाइन! अब आप डेटा देख सकते हैं।"));