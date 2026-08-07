
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

const CACHE_NAME = 'bhojani-status-v1.7';

// 1. सभी ज़रूरी फाइलों के पाथ
const ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./hindi-text.js",
    "./gujarati-text.js",
    "./manifest.json",
    "./icon1.png",
    "./icon2.png"
];

// 2. सेफ़ इन्स्टॉल: अगर कोई 1 फ़ाइल न मिले, तब भी सर्विस वर्कर क्रैश नहीं होगा
self.addEventListener("install", (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.allSettled(
                ASSETS.map((url) => 
                    cache.add(url).catch((err) => console.log("Missing file skipped:", url))
                )
            );
        })
    );
});

// 3. पुराना कैश अपने आप डिलीट करें
self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 4. फ़ाइलों को हैंडल करना (Cloudinary हमेशा लाइव इंटरनेट से)
self.addEventListener("fetch", (e) => {
    if (e.request.url.includes("cloudinary.com")) {
        e.respondWith(fetch(e.request));
        return;
    }

    e.respondWith(
        caches.match(e.request).then((res) => res || fetch(e.request))
    );
});