/* Sureler Oyun Bahçesi · çevrimdışı çalışma (yalnız GitHub Pages sürümü)
   - Sayfa: önce ağ, yoksa kayıtlı kopya
   - Sürüm ekli (?v=) veri ve kod: önce kayıtlı kopya, yoksa ağ; yeni sürüm kaydedilince eskisi silinir
   - Sürüm eki olmayan kendi dosyalarımız: önce ağ, yoksa kayıtlı kopya
   - Firebase kütüphanesi: kayıtlı kopya varsa o, arkada tazelenir (yazı tipleri siteden, fonts/ klasöründen)
   - İndirilmiş sure sesleri (ses/*.mp3, sob-ses önbelleği) kısmi isteklere parça parça verilir; ötekiler tarayıcıya bırakılır
   - Kabuk her değişince sürüm önbelleği yenilenir; indirilen sesler ve sure metinleri sob-ses'te kalır
   - Yalnız bu sitenin (sob-) önbelleklerine dokunulur
   - Firestore ve reCAPTCHA bağlantılarına hiç dokunulmaz
   - Yalnız başarılı yanıtlar kaydedilir */
const SURUM = "sob-c4f7987a";
const KABUK = ["./", "./index.html", "./bulut-ayar.js?v=dc657c3c", "./bulut.js?v=cef30bf8", "./kabuk.js?v=e532b473", "./manifest.json", "./simge.svg", "./simge-192.png", "./data/tecvid_kurallar.json"];

self.addEventListener("install", e => {
  /* Kabuğun yanında index.html'nin yüklediği bütün kod ve stil dosyaları da (?v= ekleriyle) alınır; ilk ziyaretten sonra çevrimdışı tam açılsın */
  e.waitUntil(caches.open(SURUM).then(c => c.addAll(KABUK).then(() => fetch("./index.html").then(y => y.text()).then(h => {
    const L = [...new Set([...h.matchAll(/(?:src|href)="((?:js|css)\/[^"?]+\?v=[0-9a-f]+)"/g)].map(m => "./" + m[1]))];
    return Promise.all(L.map(u => c.add(u).catch(() => {})));
  }))).then(() => self.skipWaiting()).catch(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x.startsWith("sob-") && x !== SURUM && x !== SES).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});

const SES = "sob-ses";   /* kalıcı önbellek: "çevrimdışı için indir" ile kaydedilen sure sesleri ve yazı tipleri; sürüm değişince silinmez */

/* İndirilmiş sure sesi: tarayıcı sesi parça parça (Range) ister; kayıtlı dosyadan o parçayı keserek veririz */
function sesYanit(r) {
  return caches.open(SES).then(c => c.match(r.url)).then(v => {
    if (!v) return fetch(r);
    const aralik = r.headers.get("range");
    if (!aralik) return v;
    return v.blob().then(b => {
      const m = /bytes=(\d*)-(\d*)/.exec(aralik) || [];
      let bas = m[1] ? +m[1] : 0, son = m[2] ? +m[2] : b.size - 1;
      if (!m[1] && m[2]) { bas = Math.max(0, b.size - +m[2]); son = b.size - 1; }
      son = Math.min(son, b.size - 1);
      if (bas > son) return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + b.size } });
      return new Response(b.slice(bas, son + 1), { status: 206, headers: {
        "Content-Type": "audio/mpeg", "Accept-Ranges": "bytes",
        "Content-Range": "bytes " + bas + "-" + son + "/" + b.size, "Content-Length": String(son - bas + 1) } });
    });
  }).catch(() => fetch(r));
}

const DIS = ["www.gstatic.com"];   // yazı tipleri artık siteden geliyor
const iyi = y => y && (y.ok || y.type === "opaque");

/* Aynı dosyanın eski ?v= kopyalarını silip yenisini kaydeder (önbellek büyümesin).
   Sure verileri (data/) sürümle silinmeyen kalıcı önbelleğe gider: kabuk güncellenince baştan inmesin */
const veriMi = u => u.pathname.includes("/data/");
function kaydet(r, y) {
  const u = new URL(r.url);
  return caches.open(veriMi(u) ? SES : SURUM).then(c => c.keys().then(L => Promise.all(L.filter(q => {
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
  if (ayni && /\/ses\/[^/]+\.mp3$/i.test(u.pathname)) { e.respondWith(sesYanit(r)); return; }
  if (/\.mp3$/i.test(u.pathname) || r.headers.has("range")) return;

  if (r.mode === "navigate") {                             // sayfa: önce ağ
    /* zayıf bağlantıda 4 sn içinde yanıt gelmezse kayıtlı kopya açılır (kopya yoksa ağ beklenir) */
    const ag = fetch(r).then(y => {
      if (y.ok && y.type === "basic" && /\/(index\.html)?$/.test(u.pathname)) { const k = y.clone(); caches.open(SURUM).then(c => c.put("./index.html", k)); }
      return y;
    });
    const yedek = new Promise(ok => setTimeout(ok, 4000)).then(() => caches.match("./index.html")).then(v => v || ag);
    e.respondWith(Promise.race([ag, yedek]).catch(() => caches.match("./index.html")));
    return;
  }
  if (!ayni) {                                             // yazı tipleri, Firebase kütüphanesi
    e.respondWith(caches.match(r).then(v => {
      const ag = fetch(r).then(y => { if (iyi(y)) { const k = y.clone(); caches.open(SURUM).then(c => c.put(r, k)); } return y; }).catch(() => v);
      return v || ag;
    }));
    return;
  }
  if (u.pathname.includes("/fonts/")) {                    // yazı tipleri: önce kalıcı önbellek (sürümler arasında silinmez)
    e.respondWith(caches.open(SES).then(c => c.match(r).then(v => v || fetch(r).then(y => { if (y.ok) c.put(r, y.clone()); return y; }))));
    return;
  }
  if (!u.searchParams.has("v")) {                          // sürüm eki yok: önce ağ
    e.respondWith(fetch(r).then(y => { if (y.ok) { const k = y.clone(); caches.open(SURUM).then(c => c.put(r, k)); } return y; })
      .catch(() => caches.match(r)));
    return;
  }
  e.respondWith(caches.match(r).then(v => v || fetch(r).then(y => {   /* sürüm ekli veri ve kod: önce kayıtlı kopya (caches.match bütün önbelleklere bakar) */
    if (y.ok) { const k = y.clone(); kaydet(r, k); }
    return y;
  })));
});
