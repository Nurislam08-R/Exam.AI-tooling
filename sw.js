const CACHE_NAME = 'smartbudget-v1'
const PRECACHE = [ '/', '/index.html', '/manifest.json', '/sw.js', '/src/main.jsx' ]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim())
})

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  // Cache-first for same-origin navigations and assets
  if(url.origin === self.location.origin){
    event.respondWith(
      caches.match(event.request).then(r => r || fetch(event.request).then(resp => {
        return caches.open(CACHE_NAME).then(cache=>{ cache.put(event.request, resp.clone()); return resp })
      })).catch(()=> caches.match('/index.html'))
    )
  }
})
