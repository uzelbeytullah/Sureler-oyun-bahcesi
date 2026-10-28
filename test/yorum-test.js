/* Sureler Oyun Bahçesi · satır sonu yorumu denetimi
   Kod dosyalarında çok uzun tek satırlar var. Böyle bir satırın sonuna "//" ile yorum eklenip
   arkasından yeni satır unutulursa, aynı satırdaki sonraki kod da yoruma dönüşür ve sessizce çalışmaz.
   Bu test, "//" yorumunun içinde kod gibi görünen bir parça (ör. ";x=" ya da ";f(") arar.
   Çalıştırma:  node test/yorum-test.js */
const fs = require("fs"), path = require("path");
const KOK = path.join(__dirname, "..");
const dosyalar = fs.readdirSync(path.join(KOK, "js")).filter(f => f.endsWith(".js")).map(f => "js/" + f)
  .concat(["bulut.js", "bulut-ayar.js", "kabuk.js", "sw.js"]);
let HATA = 0;
for (const f of dosyalar) {
  fs.readFileSync(path.join(KOK, f), "utf8").split(/\r?\n/).forEach((satir, i) => {
    if (satir.trim().startsWith("//")) return;
    const m = satir.match(/(?<![:"'\\/])\/\/(.*)$/);
    if (m && (/;\s*(let|const|var|if|for|return\b|[A-Za-z_$][\w$.]*\s*(=[^=]|\())/.test(m[1]) || /=>|\)\s*\{|\w\.\w+\s*=\s*\S/.test(m[1]))) {
      HATA++; console.log("HATA  " + f + ":" + (i + 1) + "  yorumun içinde kod var: " + m[0].slice(0, 80));
    }
  });
}
console.log(HATA ? HATA + " hata" : "hepsi geçti");
process.exit(HATA ? 1 : 0);
