# Sureler Oyun Bahçesi · geliştirme notları

## Klasörler

- `index.html` · sayfanın iskeleti; kod ve stil dosyalarını sırayla yükler.
- `css/oyun.css` · bütün görünüm.
- `js/` · oyunun kodu, bölüm bölüm. Dosyalar sırayla yüklenir ve ortak bir alanı paylaşır; **sıra önemlidir**:
  - `01-temel.js` katalog, sürüm ekleri, kişi ve ilerleme durumu, kayıt ve birleştirme
  - `02-ses.js` kâri sesleri
  - `03-gezinme.js` sekmeler, ana sayfa, ilk giriş, sure açma
  - `04-sure-oyunlari.js` yıldız oyunları ve oyun çatısı
  - `05` … `15` bölümler (Kur'an insanı, kitaptan bölümler, ilkeler, ezber araçları, hikâye, ebeveyn, bahçe, Elif-ba, Hangi sure?)
  - `16-bulut.js` aile yarışması, ortak hedef, kullanım sayacı
  - `17-baslangic.js` erişilebilirlik ve başlangıç
- `bulut.js`, `bulut-ayar.js` · GitHub sürümünde Firebase köprüsü (Claude sürümünde kullanılmaz).
- `firestore.rules` · veritabanı güvenlik kuralları (Firebase konsolunda da yayınlanmalı).
- App Check · veritabanına yalnız bu siteden istek gelsin diye reCAPTCHA Enterprise kullanılır. Anahtar `bulut-ayar.js`
  içindeki `appCheckKey`; anahtarın izinli alan adı `uzelbeytullah.github.io`. Başka bir alan adına taşınırsa
  Google Cloud > Güvenlik > reCAPTCHA'da anahtara o alan adı da eklenmeli.
- `sw.js`, `manifest.json`, `simge.svg` · çevrimdışı çalışma ve ana ekrana ekleme.
- `data/`, `ses/`, `kelime/`, `anim/` · içerik ve sesler.
- `test/` · oyun mantığı testleri.

## Bir şeyi değiştirdikten sonra

1. `python araclar/surum-guncelle.py` · sürüm eklerini yeniler (tarayıcılar yeni dosyayı alsın diye).
2. `npm install jsdom@24` (bir kez) ve `node test/oyun-test.js`, `node test/yeni-ozellikler-test.js`, `node test/yorum-test.js`.
   Uzun tek satırlarda açıklama için `//` değil `/* */` kullanın; `//` satırın geri kalan kodunu da yoruma çevirir.
3. `GITHUB-A-GONDER.bat` · GitHub'a gönderir.

## İki sürüm

GitHub sürümü ile claude.ai sürümü aynı kodu kullanır. Claude sürümü `python araclar/claude-surumu.py` ile
tek dosya olarak üretilir (`claude-index.html`): kod ve stil satır içine alınır, "Bulut köprüsü" bölümü çıkarılır;
aile yarışması ve ortak hedef orada Claude'un kendi altyapısıyla çalışır.
