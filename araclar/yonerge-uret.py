# Sureler Oyun Bahçesi · sesli yönerge dosyalarını üretir (ses/yonerge/<anahtar>.mp3)
# Okuma bilmeyen küçükler, cihazda Türkçe ses olmasa da yönergeleri duysun diye sabit metinler önceden seslendirilir.
#
# Araç: Piper TTS (pip: piper-tts 1.8.0, GPL-3.0-or-later, https://github.com/OHF-Voice/piper1-gpl), çevrimdışı çalışır; depoya girmez.
# Ses modeli: tr_TR-dfki-medium (https://huggingface.co/rhasspy/piper-voices/tree/main/tr/tr_TR/dfki/medium);
#   eğitim verisi DFKI OT (https://github.com/marytts/dfki-ot-data), CC BY-NC-SA 4.0.
#
# Kurulum:  pip install piper-tts   (ffmpeg de PATH'te olmalı)
# Çalıştırma:  python araclar/yonerge-uret.py            (yalnız eksik dosyaları üretir)
#              python araclar/yonerge-uret.py --hepsi    (hepsini yeniden üretir)
#              python araclar/yonerge-uret.py --liste    (yalnız anahtar ve metinleri yazar)
# Model dosyası ilk çalıştırmada ~/.cache/sob-piper/ altına indirilir (depoya girmez).
#
# Metin listesi aşağıda (SABIT); harf adları js/14-elifba.js'teki HARFLER'den, sure adları js/01-temel.js'teki KATALOG'dan okunur.
# Bir metni değiştirince o anahtarın dosyasını silip betiği yeniden çalıştırın (ya da --hepsi).
import json, os, re, subprocess, sys, tempfile, urllib.request, wave

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIKIS = os.path.join(KOK, "ses", "yonerge")
MODEL_AD = "tr_TR-dfki-medium"
MODEL_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/tr/tr_TR/dfki/medium/"
ONBELLEK = os.path.join(os.path.expanduser("~"), ".cache", "sob-piper")
UZUNLUK = 1.1      # length_scale: biraz yavaş, çocuğa uygun
CUMLE_ARASI = 0.35  # cümleler arası sessizlik (sn)

# anahtar -> metin (ekranda görünen metin; yeri js içinde yonerge("anahtar", "yedek metin") çağrısı)
SABIT = {
    "minik-soru": "Ne yapmak istersin?",                      # js/03 minik ana ekran
    "minik-dinle": "Dinle",
    "minik-hikaye": "Hikâye",
    "minik-bahce": "Bahçem",
    "minik-aile": "Ailemle",
    "aferin": "Aferin!",                                       # js/04 sonuç ve doğru cevap (minik)
    "dogru": "Doğru!",                                         # js/04 doğru cevap (küçük)
    "bir-daha-dene": "Bir daha dene",                          # js/04, js/05 ikinci hak
    "devam-ok": "Devam etmek için oka dokun",                  # js/04 yanlış cevaptan sonra
    "dogrusu-isaretlendi": "Doğrusu işaretlendi. Devam etmek için oka dokun",
    "mola": "Bugün çok güzel çalıştın! Şimdi biraz mola verelim. Öğrendiğin ayeti annene ya da babana okur musun?",  # js/11 mola
    "elif-tani": "Bu harfin adı ne?",                          # js/14 Elif-ba soruları
    "elif-kelime": "Bu kelimede hangi harf var?",
    "elif-sekil-bas": "Bu, hangi harfin kelimenin başında yazılışı?",
    "elif-sekil-orta": "Bu, hangi harfin kelimenin ortasında yazılışı?",
    "elif-sekil-son": "Bu, hangi harfin kelimenin sonunda yazılışı?",
    "hangi-soru": "Dinle: bu hangi sure?",                     # js/15 Hangi sure?
}


def harf_anahtar(c):
    """js'teki harfAnahtar ile aynı: her kod noktası 4 haneli onaltılık, tireyle"""
    return "-".join("%04x" % ord(x) for x in c)


def harfler():
    s = open(os.path.join(KOK, "js", "14-elifba.js"), encoding="utf-8").read()
    m = re.search(r"const HARFLER=(\[.*?\]\]);", s, re.S)
    return [(h[0], h[1]) for h in json.loads(m.group(1))]


def sureler():
    s = open(os.path.join(KOK, "js", "01-temel.js"), encoding="utf-8").read()
    m = re.search(r"^const KATALOG=(\[.*\]);\s*$", s, re.M)
    return [(k["no"], k["ad"]) for k in json.loads(m.group(1))]


def liste():
    L = dict(SABIT)
    for c, ad in harfler():
        L["harf-" + harf_anahtar(c)] = ad
        L["elif-bul-" + harf_anahtar(c)] = "Hangisi " + ad + "?"
    for no, ad in sureler():
        L["sure-%d" % no] = ad
    return L


def soyleyis(t):
    """Ekrandaki yazıyı Piper'ın düzgün okuyacağı biçime getirir (kesme ve uzatma işaretleri)"""
    t = t.replace("’", "").replace("‘", "").replace("'", "")
    t = t.replace("ā", "a").replace("ī", "i").replace("ū", "u")
    t = re.sub(r"(\w)-(\w)", r"\1 \2", t)
    return t


def model():
    os.makedirs(ONBELLEK, exist_ok=True)
    yol = os.path.join(ONBELLEK, MODEL_AD + ".onnx")
    for ad in (MODEL_AD + ".onnx", MODEL_AD + ".onnx.json"):
        p = os.path.join(ONBELLEK, ad)
        if not os.path.exists(p):
            print("indiriliyor:", ad)
            urllib.request.urlretrieve(MODEL_URL + ad, p + ".part")
            os.replace(p + ".part", p)
    return yol


def main():
    L = liste()
    if "--liste" in sys.argv:
        for k, v in L.items():
            print(k, "\t", v)
        print(len(L), "yönerge")
        return
    import numpy as np
    from piper import PiperVoice
    from piper.config import SynthesisConfig
    ses = PiperVoice.load(model())
    ayar = SynthesisConfig(length_scale=UZUNLUK)
    os.makedirs(CIKIS, exist_ok=True)
    hepsi = "--hepsi" in sys.argv
    n = 0
    for k, metin in L.items():
        hedef = os.path.join(CIKIS, k + ".mp3")
        if os.path.exists(hedef) and not hepsi:
            continue
        parcalar, hz = [], 22050
        for parca in ses.synthesize(soyleyis(metin), syn_config=ayar):
            hz = parca.sample_rate
            if parcalar:
                parcalar.append(np.zeros(int(hz * CUMLE_ARASI), dtype=np.int16))
            parcalar.append(parca.audio_int16_array)
        a = np.concatenate(parcalar)
        # baştaki ve sondaki sessizlik kırpılır (eşik ~ -40 dB); başa 0,05 sn, sona 0,15 sn sessizlik bırakılır
        dolu = np.nonzero(np.abs(a.astype(np.int32)) > 330)[0]
        if len(dolu):
            a = a[max(0, dolu[0] - int(hz * 0.02)):dolu[-1] + int(hz * 0.05)]
        a = np.concatenate([np.zeros(int(hz * 0.05), dtype=np.int16), a, np.zeros(int(hz * 0.15), dtype=np.int16)])
        with tempfile.TemporaryDirectory() as g:
            wav = os.path.join(g, "a.wav")
            with wave.open(wav, "wb") as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(hz)
                w.writeframes(a.tobytes())
            # 64 kbps mono mp3, üst veri yok
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "64k",
                            "-map_metadata", "-1", "-write_xing", "1", hedef], check=True)
        n += 1
        print(k, "\t", metin)
    fazla = [f for f in os.listdir(CIKIS) if f.endswith(".mp3") and f[:-4] not in L]
    if fazla:
        print("UYARI: listede olmayan dosyalar:", ", ".join(fazla))
    print(n, "dosya üretildi;", len(L), "yönerge")


if __name__ == "__main__":
    main()
