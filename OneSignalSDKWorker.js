window.OneSignalDeferred = window.OneSignalDeferred || [];
OneSignalDeferred.push(async function(OneSignal) {
  await OneSignal.init({
    appId: "9278cc17-9628-42ef-ace6-cbef8e03f779",
    // 👇 यह लाइन ज़रूर जोड़ें
    serviceWorkerPath: "OneSignalSDKWorker.js",
  });
});