# Sureler Oyun Bahçesi · sürüm eklerini günceller
# js/, css/ ve data/ dosyalarından biri değişince çalıştırın:  python araclar/surum-guncelle.py
# index.html içindeki ?v=... ekleri ve 01-temel.js içindeki SURUMLER haritası dosyanın içeriğine göre yenilenir;
# böylece tarayıcılar eski kopyayı değil yenisini alır.
import hashlib, os, re, glob

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(KOK)

def oz(yol):
    return hashlib.sha1(open(yol, "rb").read()).hexdigest()[:8]

# 1) veri dosyaları: SURUMLER haritası (01-temel.js)
temel = "js/01-temel.js"
s = open(temel, encoding="utf-8", newline="").read()
deg = 0
for yol in sorted(glob.glob("data/*.json")) + sorted(glob.glob("ses/*.mp3")) + sorted(glob.glob("kelime/*.mp3")) + sorted(glob.glob("anim/hk/*.mp3")):
    k = yol.replace("\\", "/")
    m = re.search(re.escape('"' + k + '":"') + r"([0-9a-f]{8})", s)
    if m and m.group(1) != oz(yol):
        s = s[:m.start(1)] + oz(yol) + s[m.end(1):]
        deg += 1
open(temel, "w", encoding="utf-8", newline="").write(s)

# 2) kod ve stil dosyaları: index.html içindeki ?v= ekleri
h = open("index.html", encoding="utf-8", newline="").read()
for yol in sorted(glob.glob("js/*.js")) + sorted(glob.glob("css/*.css")):
    k = yol.replace("\\", "/")
    h, n = re.subn(re.escape(k) + r"\?v=[0-9a-f]{8}", k + "?v=" + oz(yol), h)
    deg += n
open("index.html", "w", encoding="utf-8", newline="").write(h)
print("Sürüm ekleri güncellendi.")
