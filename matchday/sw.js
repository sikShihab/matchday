self.addEventListener("install", e=>{console.log("Service Worker installed");});
self.addEventListener("activate", e=>{console.log("Service Worker activated");});
self.addEventListener("fetch", e=>{ /* caching can be added */ });
