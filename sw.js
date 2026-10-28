/* Sureler Oyun Bahçesi · çevrimdışı çalışma (yalnız GitHub Pages sürümü)
   - Sayfa: önce ağ, yoksa kayıtlı kopya
   - Sürüm ekli (?v=) veri ve kod: önce kayıtlı kopya, yoksa ağ; yeni sürüm kaydedilince eskisi silinir
   - Sürüm eki olmayan kendi dosyalarımız: önce ağ, yoksa kayıtlı kopya
   - Yazı tipleri ve Firebase kütüphanesi: kayıtlı kopya varsa o, arkada tazelenir
   - Ses dosyaları (mp3) tarayıcının kendi önbelleğine bırakılır (kısmi isteklerle çalıştıkları için)
   - Firestore ve reCAPTCHA bağlantılarına hiç dokunulmaz
   - Yalnız başarılı yanıtlar kaydedilir */
const SURUM = "sob-4c86da36";
const KABUK = ["./", "./index.html", "./bulut-ayar.js?v=dc657c3c", "./bulut.js?v=17d08092", "./manifest.json", "./simge.svg", "./data/tecvid_kurallar.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SURUM).then(c => c.addAll(KABUK)).then(() => self.skipWaiting()).catch(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== SURUM).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});

const DIS = ["fonts.googleapis.com", "fonts.gstatic.com", "www.gstatic.com"];
const iyi = y => y && (y.ok || y.type === "opaque");

/* Aynı dosyanın eski ?v= kopyalarını silip yenisini kaydeder (önbellek büyümesin) */
function kaydet(r, y) {
  const u = new URL(r.url);
  return caches.open(SURUM).then(c => c.keys().then(L => Promise.all(L.filter(q => {
    const a = new URL(q.url);
    return a.origin === u.origin && a.pathname === u.pathname && a.search !== u.search;
  }).map(q => c.delete(q)))).then(() => c.put(r, y)));
}

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  const ayni = u.origin === self.location.origin;
  if (!ayni && !DIS.includes(u.hostname)) return;          // Firestore vb. dokunma
  if (u.hostname === "www.gstatic.com" && !u.pathname.startsWith("/firebasejs/")) return;  // reCAPTCHA (App Check) dosyalarına dokunma
  if (/\.mp3$/i.test(u.pathname) || r.headers.has("range")) return;

  if (r.mode === "navigate") {                             // sayfa: önce ağ
    e.respondWith(fetch(r).then(y => {
      if (y.ok && y.type === "basic" && /\/(index\.html)?$/.test(u.pathname)) { const k = y.clone(); caches.open(SURUM).then(c => c.put("./index.html", k)); }
      return y;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  if (!ayni) {                                             // yazı tipleri, Firebase kütüphanesi
    e.respondWith(caches.match(r).then(v => {
      const ag = fetch(r).then(y => { if (iyi(y)) { const k = y.clone(); caches.open(SURUM).then(c => c.put(r, k)); } return y; }).catch(() => v);
      return v || ag;
    }));
    return;
  }
  if (!u.searchParams.has("v")) {                          // sürüm eki yok: önce ağ
    e.respondWith(fetch(r).then(y => { if (y.ok) { const k = y.clone(); caches.open(SURUM).then(c => c.put(r, k)); } return y; })
      .catch(() => caches.match(r)));
    return;
  }
  e.respondWith(caches.match(r).then(v => v || fetch(r).then(y => {   // sürüm ekli veri ve kod: önce kayıtlı kopya
    if (y.ok) { const k = y.clone(); kaydet(r, k); }
    return y;
  })));
});
