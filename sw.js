/* Sureler Oyun Bahçesi · çevrimdışı çalışma (yalnız GitHub Pages sürümü)
   - Sayfa: önce ağ, yoksa kayıtlı kopya
   - Veri ve kod dosyaları (sürüm ekli adresler): önce kayıtlı kopya, yoksa ağ
   - Yazı tipleri ve Firebase kütüphanesi: kayıtlı kopya varsa o, arkada tazelenir
   - Ses dosyaları (mp3) tarayıcının kendi önbelleğine bırakılır (kısmi isteklerle çalıştıkları için)
   - Firestore bağlantılarına hiç dokunulmaz */
const SURUM = "sob-v1";
const KABUK = ["./", "./index.html", "./bulut-ayar.js?v=4", "./bulut.js?v=4", "./manifest.json", "./simge.svg", "./data/tecvid_kurallar.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SURUM).then(c => c.addAll(KABUK)).then(() => self.skipWaiting()).catch(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== SURUM).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});

const DIS = ["fonts.googleapis.com", "fonts.gstatic.com", "www.gstatic.com"];

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  const ayni = u.origin === self.location.origin;
  if (!ayni && !DIS.includes(u.hostname)) return;          // Firestore vb. dokunma
  if (/\.mp3$/i.test(u.pathname) || r.headers.has("range")) return;

  if (r.mode === "navigate") {                             // sayfa: önce ağ
    e.respondWith(fetch(r).then(y => { const k = y.clone(); caches.open(SURUM).then(c => c.put("./index.html", k)); return y; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  if (!ayni) {                                             // yazı tipleri, Firebase kütüphanesi
    e.respondWith(caches.match(r).then(v => {
      const ag = fetch(r).then(y => { caches.open(SURUM).then(c => c.put(r, y.clone())); return y; }).catch(() => v);
      return v || ag;
    }));
    return;
  }
  e.respondWith(caches.match(r).then(v => v || fetch(r).then(y => {   // sürüm ekli veri ve kod: önce kayıtlı kopya
    if (y.ok) { const k = y.clone(); caches.open(SURUM).then(c => c.put(r, k)); }
    return y;
  })));
});
