const CACHE_NAME = "bds-v1";

// 1. सभी ज़रूरी फाइलों के सही रिलेटिव पाथ (./)
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./hindi-text.js",
  "./gujarati-text.js"
];

// 2. फ़ाइलों को कैश (Cache) में सेव करना
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // नया सर्विस वर्कर तुरंत लागू करें
});

// 3. जब भी आप CACHE_NAME (जैसे bds-v1 से bds-v2) बदलें, पुराना कैश अपने आप डिलीट हो जाएगा
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
    })
  );
  self.clients.claim();
});

// 4. फ़ाइलों को हैंडल करना (Cloudinary के डेटा को हमेशा ताज़ा रखना)
self.addEventListener("fetch", (e) => {
  // अगर रिक्वेस्ट Cloudinary की है, तो उसे हमेशा सीधे इंटरनेट से मँगवाएँ
  if (e.request.url.includes("cloudinary.com")) {
    e.respondWith(fetch(e.request));
    return;
  }

  // ऐप की अपनी लोकल फाइलों के लिए (Cache First)
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});