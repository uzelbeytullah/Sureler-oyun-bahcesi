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
eksik = [y.replace("\\", "/") for y in sorted(glob.glob("data/*.json")) + sorted(glob.glob("ses/*.mp3")) + sorted(glob.glob("kelime/*.mp3")) + sorted(glob.glob("anim/hk/*.mp3"))
         if '"' + y.replace("\\", "/") + '":"' not in s]
if eksik:
    print("UYARI: şu dosyalar 01-temel.js içindeki SURUMLER haritasında yok (elle ekleyin):")
    for y in eksik: print("  ", y)

# 2) kod ve stil dosyaları: index.html içindeki ?v= ekleri
h = open("index.html", encoding="utf-8", newline="").read()
for yol in sorted(glob.glob("js/*.js")) + sorted(glob.glob("css/*.css")):
    k = yol.replace("\\", "/")
    h, n = re.subn(re.escape(k) + r"\?v=[0-9a-f]{8}", k + "?v=" + oz(yol), h)
    deg += n
for yol in ("bulut-ayar.js", "bulut.js"):
    h = re.sub(r'src="' + re.escape(yol) + r'\?v=[0-9a-z]+"', 'src="' + yol + "?v=" + oz(yol) + '"', h)
for yol in sorted(glob.glob("js/*.js")):
    if yol.replace("\\", "/") not in h:
        print("UYARI: " + yol + " index.html içinde yüklenmiyor")
open("index.html", "w", encoding="utf-8", newline="").write(h)

# 3) service worker: kabuk dosyalarının ekleri ve önbellek adı (kabuk değişince eski önbellek silinsin)
w = open("sw.js", encoding="utf-8", newline="").read()
for yol in ("bulut-ayar.js", "bulut.js"):
    w = re.sub(r'"\./' + re.escape(yol) + r'\?v=[0-9a-z]+"', '"./' + yol + "?v=" + oz(yol) + '"', w)
kabuk = hashlib.sha1("".join(oz(y) for y in ("index.html", "bulut-ayar.js", "bulut.js", "manifest.json")).encode()).hexdigest()[:8]
w = re.sub(r'const SURUM = "[^"]*";', 'const SURUM = "sob-' + kabuk + '";', w)
open("sw.js", "w", encoding="utf-8", newline="").write(w)
print("Sürüm ekleri güncellendi.")
