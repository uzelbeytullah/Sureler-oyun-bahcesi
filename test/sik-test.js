/* Sureler Oyun Bahçesi · şık uzunluğu denetimi
   Çoktan seçmeli sorularda doğru şık, uzunluğundan tahmin edilmemeli. Bu test şunlara bakar:
   - Kitap sınavı (data/*_ekb.json → sinav.sorular): doğru şıkkın en uzun şık olma oranı her dosyada ve
     toplamda %40'ı aşarsa HATA.
   - Bilgi yarışması (data/NNN.json → bilgi, data/*_ortak.json → bilgi) ve sayı yarışması
     (data/*_ekb.json → sayilar.sorular): oranlar raporlanır; %40'ı aşarsa UYARI
     (SIK_SIKI=1 ile çalıştırılırsa HATA sayılır).
   - Bütün bu sorularda: doğru cevap şıklar arasında yoksa ya da şık tekrarı varsa HATA.
   "En uzun" = doğru şık en uzun şıklardan biri (karakter sayısı). Eşitlikte puan paylaştırılır: en uzun
   uzunlukta k şık varsa ve doğru şık onlardan biriyse 1/k sayılır. Böylece "78 | 77 | 79 | 80" gibi
   eşit uzunluktaki şıklar %25 (şans düzeyi) sayılır, uzunluktan ipucu var gibi görünmez.
   Uzunluk farkı = (doğru şık − en uzun çeldirici) / en uzun çeldirici.
   Çalıştırma:  node test/sik-test.js */
const fs = require("fs"), path = require("path");
const VERI = path.join(__dirname, "..", "data");
const SINIR = 0.40, SIKI = process.env.SIK_SIKI === "1";
let HATA = 0, UYARI = 0;
const yuzde = x => (100 * x).toFixed(1) + "%";
const norm = s => String(s).trim().toLocaleLowerCase("tr");

function olc(sorular, etiket) {
  let n = 0, enUzun = 0, fark = 0;
  sorular.forEach((q, i) => {
    const yer = etiket + " #" + i;
    if (!q || typeof q.a !== "string" || !Array.isArray(q.o)) { HATA++; console.log("HATA  " + yer + ": soru biçimi bozuk"); return; }
    if (!q.o.includes(q.a)) { HATA++; console.log("HATA  " + yer + ": doğru cevap şıklar arasında yok: " + q.a.slice(0, 60)); return; }
    if (new Set(q.o.map(norm)).size !== q.o.length) { HATA++; console.log("HATA  " + yer + ": şık tekrarı: " + q.o.join(" | ").slice(0, 100)); return; }
    const cel = q.o.filter(o => o !== q.a).map(o => o.length);
    if (!cel.length) { HATA++; console.log("HATA  " + yer + ": çeldirici yok"); return; }
    const m = Math.max(...cel);
    n++; if (q.a.length >= m) enUzun += 1 / q.o.filter(o => o.length === q.a.length).length;
    fark += (q.a.length - m) / Math.max(m, 1);
  });
  return { n, enUzun, fark };
}
const topla = (t, r) => { t.n += r.n; t.enUzun += r.enUzun; t.fark += r.fark; };
const oran = r => r.n ? r.enUzun / r.n : 0;
const satir = (ad, r) => ad + ": " + r.n + " soru, doğru en uzun " + yuzde(oran(r)) + ", ortalama fark " + yuzde(r.n ? r.fark / r.n : 0);

const dosyalar = fs.readdirSync(VERI).sort();
// 1) Kitap sınavı
const sinav = { n: 0, enUzun: 0, fark: 0 }, sayi = { n: 0, enUzun: 0, fark: 0 }, dosyaOran = [];
for (const f of dosyalar.filter(f => /_ekb\.json$/.test(f))) {
  const d = JSON.parse(fs.readFileSync(path.join(VERI, f), "utf8"));
  const s = (d.sinav && d.sinav.sorular) || [];
  const r = olc(s, f + " sinav");
  topla(sinav, r);
  if (r.n) {
    dosyaOran.push([f, oran(r)]);
    if (oran(r) > SINIR) { HATA++; console.log("HATA  " + f + ": kitap sınavında doğru şık " + yuzde(oran(r)) + " oranında en uzun (sınır " + yuzde(SINIR) + ")"); }
  }
  topla(sayi, olc((d.sayilar && d.sayilar.sorular) || [], f + " sayilar"));
}
// 2) Bilgi yarışması
const bilgi = { n: 0, enUzun: 0, fark: 0 };
for (const f of dosyalar.filter(f => /^\d+\.json$/.test(f) || /_ortak\.json$/.test(f))) {
  const d = JSON.parse(fs.readFileSync(path.join(VERI, f), "utf8"));
  if (Array.isArray(d.bilgi)) topla(bilgi, olc(d.bilgi, f + " bilgi"));
}

console.log(satir("Kitap sınavı", sinav));
console.log("  en kötü 5 dosya: " + dosyaOran.sort((a, b) => b[1] - a[1]).slice(0, 5).map(([f, o]) => f + " " + yuzde(o)).join(", "));
if (oran(sinav) > SINIR) { HATA++; console.log("HATA  kitap sınavı toplam oranı " + yuzde(oran(sinav)) + " (sınır " + yuzde(SINIR) + ")"); }
for (const [ad, r] of [["Bilgi yarışması", bilgi], ["Sayı yarışması", sayi]]) {
  console.log(satir(ad, r));
  if (oran(r) > SINIR) {
    if (SIKI) { HATA++; console.log("HATA  " + ad + " oranı " + yuzde(oran(r)) + " (sınır " + yuzde(SINIR) + ")"); }
    else { UYARI++; console.log("UYARI " + ad + " oranı " + yuzde(oran(r)) + " sınırı (" + yuzde(SINIR) + ") aşıyor; SIK_SIKI=1 ile hata sayılır"); }
  }
}
console.log(HATA ? HATA + " hata" : "hepsi geçti" + (UYARI ? " (" + UYARI + " uyarı)" : ""));
process.exit(HATA ? 1 : 0);
