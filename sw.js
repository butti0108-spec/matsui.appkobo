/* Wistaria お客様カルテ サービスワーカー
   方針：アプリ本体は常にネットワークから取りに行く（古い版が残らない）。
   通信できない時だけ、最後に開けた画面を出す。それ以外（台帳との通信など）は一切触らない。 */
var CACHE = "matsui-app-v1";
self.addEventListener("install", function(e){ self.skipWaiting(); });
self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(ks){
      return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});
self.addEventListener("fetch", function(e){
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).then(function(r){
        var cp = r.clone();
        caches.open(CACHE).then(function(c){ c.put("index.html", cp); });
        return r;
      }).catch(function(){ return caches.match("index.html"); })
    );
  }
});
