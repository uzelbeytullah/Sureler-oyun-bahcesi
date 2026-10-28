# Sureler Oyun Bahçesi · claude.ai sürümünü üretir
# Claude sayfası en çok 512 dosya tutabildiği için kod ve stil tek dosyada birleştirilir;
# GitHub'a özel "Bulut köprüsü" bölümü çıkarılır.  Çalıştırma:  python araclar/claude-surumu.py
# Çıktı: claude-index.html (GitHub'a gönderilmez)
import os, re

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s = open(os.path.join(KOK, "index.html"), encoding="utf-8", newline="").read()
a = s.index("<!-- Bulut köprüsü"); b = s.index("<!-- /Bulut köprüsü -->") + len("<!-- /Bulut köprüsü -->")
c = s[:a] + s[b:].lstrip("\r\n")
c = re.sub(r'<link rel="stylesheet" href="(css/[^"?]+)\?v=[0-9a-f]+">',
           lambda m: "<style>\n" + open(os.path.join(KOK, m.group(1)), encoding="utf-8").read() + "</style>", c)
parcalar = []
def topla(m):
    parcalar.append(open(os.path.join(KOK, m.group(1)), encoding="utf-8").read()); return ""
c = re.sub(r'<script src="(js/[^"?]+)\?v=[0-9a-f]+"></script>\n?', topla, c)
c = c.replace("<!-- Oyunun kodu: js/ klasöründe, sırayla yüklenir (sıra önemlidir) -->\n", "<script>\n" + "\n".join(parcalar) + "</script>\n")
open(os.path.join(KOK, "claude-index.html"), "w", encoding="utf-8", newline="").write(c)
print("claude-index.html hazır")
