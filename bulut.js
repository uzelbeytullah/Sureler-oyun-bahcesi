/* Sureler Oyun Bahçesi · bulut köprüsü
   Claude dışında (ör. GitHub Pages) açıldığında, oyunun kullandığı
   claude.use("db" | "user" | "room") arayüzünü Firebase ile sağlar.
   Ayarlar bulut-ayar.js içindeki window.BULUT_AYAR nesnesinden gelir.
   Ayar yoksa ya da sayfa claude.ai içinde açıldıysa hiçbir şey yapmaz. */
(function () {
  "use strict";
  if (window.claude && window.claude.use) return;          // Claude içindeyiz
  var AYAR = window.BULUT_AYAR;
  if (!AYAR || !AYAR.apiKey || !AYAR.projectId || !window.firebase) return;

  var app, fs, hazir = null;
  function baslat() {
    if (hazir) return hazir;
    hazir = new Promise(function (ok, hata) {
      try {
        app = firebase.initializeApp(AYAR);
        fs = firebase.firestore();
        var auth = firebase.auth();
        auth.onAuthStateChanged(function (u) { if (u) ok(u); });
        auth.signInAnonymously().catch(hata);
      } catch (e) { hata(e); }
    });
    return hazir;
  }
  /* Firestore iç içe listeleri ([[a,b],[c,d]]) kabul etmez: içteki listeleri {__d:[...]} ile sarıp geri açıyoruz */
  function sar(v) {
    if (Array.isArray(v)) return v.map(function (x) { return Array.isArray(x) ? { __d: sar(x) } : sar(x); });
    if (v && typeof v === "object") { var o = {}; Object.keys(v).forEach(function (k) { o[k] = sar(v[k]); }); return o; }
    return v;
  }
  function ac(v) {
    if (Array.isArray(v)) return v.map(ac);
    if (v && typeof v === "object") {
      var k = Object.keys(v);
      if (k.length === 1 && k[0] === "__d" && Array.isArray(v.__d)) return ac(v.__d);
      var o = {}; k.forEach(function (x) { o[x] = ac(v[x]); }); return o;
    }
    return v;
  }
  function temiz(v) { return sar(JSON.parse(JSON.stringify(v === undefined ? null : v))); }

  /* ---------- db ---------- */
  function belge(ref) {
    return {
      id: ref.id,
      get: function () {
        return ref.get().then(function (s) {
          return { id: s.id, exists: s.exists, data: function () { return ac(s.data() || {}); } };
        });
      },
      set: function (v) { return ref.set(temiz(v)); }
    };
  }
  function koleksiyon(yol) {
    var ref = fs.collection(yol);
    return {
      doc: function (id) { return belge(ref.doc(String(id))); },
      get: function () {
        return ref.get().then(function (s) {
          return { docs: s.docs.map(function (d) { return { id: d.id, data: function () { return ac(d.data() || {}); } }; }) };
        });
      }
    };
  }
  var DB = { collection: koleksiyon };

  /* ---------- user ---------- */
  function kullanici(u) {
    return {
      id: function () { return Promise.resolve(u.uid); },
      canEdit: function () { return Promise.resolve(true); },
      can: function () { return Promise.resolve(true); }
    };
  }

  /* ---------- room (canlı oda) ---------- */
  function oda(u) {
    return {
      join: function (ad) {
        var kok = fs.collection("odalar").doc(String(ad).replace(/[^\w-]/g, "_"));
        var esler = kok.collection("esler"), olaylar = kok.collection("olaylar");
        var benim = esler.doc(u.uid);
        var liste = [], peerCb = [], olayCb = {}, sonYayin = {}, kapat = [], acik = true, simdi = Date.now();
        var benimDurum = {};

        function nabiz() { return benim.set({ presence: temiz(benimDurum), t: Date.now() }); }
        var nabizT = setInterval(function () { if (acik) nabiz().catch(function () {}); }, 15000);

        kapat.push(esler.onSnapshot(function (s) {
          var sinir = Date.now() - 45000;
          liste = s.docs.filter(function (d) { return (d.data().t || 0) > sinir || d.id === u.uid; })
            .map(function (d) { return { peer: d.id, isMe: d.id === u.uid, presence: ac(d.data().presence || {}) }; });
          peerCb.forEach(function (f) { try { f(liste); } catch (e) {} });
        }, function () {}));

        kapat.push(olaylar.onSnapshot(function (s) {
          s.docChanges().forEach(function (c) {
            if (c.type === "removed") return;
            var d = c.doc.data() || {};
            if ((d.t || 0) < simdi - 60000) return;   // eski yarışmalardan kalan
            (olayCb[c.doc.id] || []).forEach(function (f) {
              try { f({ data: ac(d.data), peer: d.kimden, isMe: d.kimden === u.uid }); } catch (e) {}
            });
          });
        }, function () {}));

        return nabiz().then(function () {
          return {
            peers: function () { return liste.slice(); },
            onPeers: function (f) { peerCb.push(f); return function () { peerCb = peerCb.filter(function (x) { return x !== f; }); }; },
            presence: function (v) { benimDurum = v || {}; return nabiz(); },
            on: function (olay, f) { (olayCb[olay] = olayCb[olay] || []).push(f); },
            emit: function (olay, veri) {
              var j = JSON.stringify(veri);
              var o = sonYayin[olay];
              if (o && o.j === j && Date.now() - o.t < 20000) return Promise.resolve();   // değişmeyeni sık yazma
              sonYayin[olay] = { j: j, t: Date.now() };
              return olaylar.doc(String(olay)).set({ data: temiz(veri), kimden: u.uid, t: Date.now() });
            },
            leave: function () {
              acik = false; clearInterval(nabizT);
              kapat.forEach(function (f) { try { f(); } catch (e) {} });
              return benim.delete().catch(function () {});
            }
          };
        });
      }
    };
  }

  window.claude = {
    bulut: true,
    use: function (ne) {
      return baslat().then(function (u) {
        if (ne === "db") return DB;
        if (ne === "user") return kullanici(u);
        if (ne === "room") return oda(u);
        return null;
      });
    }
  };

  /* Oyundaki "telefonda ve bilgisayarda aynı kalır" yazısını bu sürüme uygun hale getir */
  document.addEventListener("DOMContentLoaded", function () {
    var el = document.getElementById("sync");
    if (!el || !window.MutationObserver) return;
    new MutationObserver(function () {
      if (/telefonda ve bilgisayarda/.test(el.textContent))
        el.textContent = "İlerleme buluta da kaydediliyor (bu tarayıcıya bağlı)";
    }).observe(el, { childList: true, characterData: true, subtree: true });
  });
})();
