# Sureler Oyun Bahçesi · hikâye anlatım seslerini üretir ve sahnelere süre, okuma ve kelime ipucu bilgisini yazar
# Girdi : data/NNN_eka.json içindeki "_anim" hikâyeleri (sahne metinleri hazır, "dosya" alanı yok)
# Çıktı : anim/hk/NNN_k.webm (k: 0 çocuk, 1 ezber hikâyesi, 2 sesteş hikâyesi) ve her sahneye klip, parca, okuma, sure, ipucu
# Ayet okumaları yeniden seslendirilmez; ses/NNN.webm dosyasından zaman aralığı (klip "a") ile çalınır.
#
# Araç: Piper TTS (GPL-3.0-or-later), model tr_TR-dfki-medium (eğitim verisi CC BY-NC-SA 4.0); ffmpeg PATH'te olmalı.
# Kullanım:  python araclar/anlatim-uret.py 046 047 ...   (verilen sureler; ses dosyası varsa atlanır, --hepsi ile yeniden)
import json, os, re, subprocess, sys, tempfile, wave
import numpy as np

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIKIS = os.path.join(KOK, "anim", "hk")
MODEL = os.path.join(os.path.expanduser("~"), ".cache", "sob-piper", "tr_TR-dfki-medium.onnx")
UZUNLUK = 1.08
ONSES, PARCA_ARASI, SONSES = 0.33, 0.55, 0.12
# karakter türüne göre ses perdesi çarpanı (anlatıcı = 1.0) ve yavaşlık
PERDE = {"kiz": 1.22, "genc": 1.12, "erkek": 1.10, "anne": 1.12, "nine": 1.05, "baba": 0.96, "dede": 0.90}


def soyleyis(t):
    t = t.replace("’", "").replace("‘", "").replace("'", "").replace("“", "").replace("”", "")
    t = t.replace("ā", "a").replace("ī", "i").replace("ū", "u")
    t = re.sub(r"(\w)-(\w)", r"\1 \2", t)
    return re.sub(r"\s+", " ", t).strip()


def nrm(s):
    s = s.replace("İ", "i").replace("I", "ı").lower().replace("’", "").replace("‘", "").replace("'", "").replace("-", "").replace(" ", "")
    for a, b in (("â", "a"), ("î", "i"), ("û", "u"), ("ı", "i"), ("ā", "a"), ("ī", "i"), ("ū", "u"), ("ş", "s"), ("ç", "c"), ("ğ", "g"), ("ö", "o"), ("ü", "u")):
        s = s.replace(a, b)
    return s


def kelimeler(t):
    return set(re.findall(r"\w+", t.lower()))


class Ses:
    def __init__(self):
        from piper import PiperVoice
        from piper.config import SynthesisConfig
        self.v = PiperVoice.load(MODEL)
        self.ayar = SynthesisConfig(length_scale=UZUNLUK)
        self.hz = 22050

    def uret(self, metin, perde=1.0):
        parcalar = []
        for p in self.v.synthesize(soyleyis(metin), syn_config=self.ayar):
            self.hz = p.sample_rate
            if parcalar:
                parcalar.append(np.zeros(int(self.hz * 0.3), dtype=np.int16))
            parcalar.append(p.audio_int16_array)
        a = np.concatenate(parcalar)
        dolu = np.nonzero(np.abs(a.astype(np.int32)) > 330)[0]
        if len(dolu):
            a = a[max(0, dolu[0] - int(self.hz * 0.02)):dolu[-1] + int(self.hz * 0.05)]
        if abs(perde - 1.0) > 0.01:
            a = self.perde(a, perde)
        return a

    def perde(self, a, f):
        with tempfile.TemporaryDirectory() as g:
            x, y = os.path.join(g, "x.wav"), os.path.join(g, "y.wav")
            with wave.open(x, "wb") as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(self.hz); w.writeframes(a.tobytes())
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", x, "-af",
                            f"asetrate={int(self.hz * f)},aresample={self.hz},atempo={1 / f:.4f}", y], check=True)
            with wave.open(y, "rb") as w:
                return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)


def sessiz(sn, hz):
    return np.zeros(int(hz * sn), dtype=np.int16)


def ayet_zamanlari(sure):
    ilk = sure.get("ilkAyet") or 1
    z = {}
    for i, a in enumerate(sure["ayetler"]):
        ks = [w["k"] for w in a["w"] if w.get("k")]
        if ks:
            z[ilk + i] = (ks[0][1], ks[-1][2])
    return z


def kelime_bul(sure, ad, ayet_bas, ayet_son=None, bas_w=0):
    """ad (okunuş) sure kelimeleri arasında aranır; (ayet, w_indeksi, kelime) döner"""
    ilk = sure.get("ilkAyet") or 1
    n = nrm(ad)
    for i, a in enumerate(sure["ayetler"]):
        no = ilk + i
        if no < ayet_bas or (ayet_son and no > ayet_son):
            continue
        for j, w in enumerate(a["w"]):
            if no == ayet_bas and j < bas_w:
                continue
            o = nrm(w["ok"])
            if o == n or o.startswith(n) or n in o.split() or (len(n) > 4 and n in o):
                return no, j, w
            # birden çok kelimelik ad: ardışık kelimeler birleştirilir, bulunan ilk kelime döner
            for k2 in (2, 3, 4):
                g = "".join(nrm(x["ok"]) for x in a["w"][j:j + k2])
                if len(g) >= len(n) and g.startswith(n) and len(a["w"][j:j + k2]) == k2 and g != o:
                    return no, j, w
    # son çare: ilk sözcük (ek ve tire öncesi) ya da Türkçe karşılık
    ilk_soz = nrm(re.split(r"[’'\- ]", ad.strip())[0])
    if not ayet_son:
        for i, a in enumerate(sure["ayetler"]):
            no = ilk + i
            if no < ayet_bas:
                continue
            for j, w in enumerate(a["w"]):
                if len(ilk_soz) >= 4 and nrm(w["ok"]).startswith(ilk_soz):
                    return no, j, w
    if len(n) >= 3 and not ayet_son:
        for i, a in enumerate(sure["ayetler"]):
            no = ilk + i
            if no < ayet_bas:
                continue
            for j, w in enumerate(a["w"]):
                if n in nrm(w["ok"]):
                    return no, j, w
    return None


def parcala(sahne, karakterler):
    """sahne metnini (kim, metin) parçalarına böler"""
    m = sahne["metin"]
    parcalar, pos = [], 0
    balon = sahne.get("balon")
    for q in re.finditer(r"“([^”]+)”", m):
        onceki = m[pos:q.start()]
        soz = q.group(1)
        kim = "anlatici"
        kelime_say = len(soz.split())
        if kelime_say >= 3 and re.search(r"[.!?,;]$|[.!?]", soz):
            if balon and len(kelimeler(soz) & kelimeler(balon["yazi"])) >= max(2, 0.5 * len(kelimeler(balon["yazi"]))):
                kim = balon["kim"]
            else:
                bulunan, en = None, -1
                for k, c in karakterler.items():
                    for ad in {c["ad"], c["ad"].split()[0]}:
                        p = (m[:q.start()]).rfind(ad)
                        if p > en:
                            bulunan, en = k, p
                if bulunan and q.start() - en < 200:
                    kim = bulunan
        if kim == "anlatici":
            continue  # kısa alıntı / ad: anlatıcı okur, metne aynen katılır
        if onceki.strip():
            parcalar.append(["anlatici", onceki])
        parcalar.append([kim, soz])
        pos = q.end()
    son = m[pos:]
    if son.strip():
        parcalar.append(["anlatici", son])
    # anlatıcı metninden önceki/sonraki aynı konuşmacıları birleştir
    birles = []
    for kim, t in parcalar:
        if birles and birles[-1][0] == kim:
            birles[-1][1] += t
        else:
            birles.append([kim, t])
    return birles


def hikaye_isle(ses, no, k, A, sure, zamanlar, ad):
    kaynak = A["kaynak"]
    sahneler = A["sahneler"]
    kar = A.get("karakterler", {})
    # --- kelime ipuçları ve ayet atamaları
    ipuclari, atama = [], {}   # atama: sahne indeksi -> {"ip": [..], "ayet": set}
    eka = json.load(open(os.path.join(KOK, "data", f"{no:03d}_eka.json"), encoding="utf-8"))
    rapor = []
    if kaynak == "ezber:0":
        h = eka["ezber"]["hikayeler"][0]["metin"]
        paragraflar = [p for p in h.split("\n\n")]
        son_s, son_a, son_w = -1, 1, 0
        for p in paragraflar:
            cift = [c for c in re.findall(r"\(([^)]*·[^)]*)\)", p) if "Bölüm" not in c]
            if not cift:
                continue
            pt = re.sub(r"\([^)]*\)", "", p)
            en, es = 0, None
            for si in range(son_s + 1, len(sahneler)):
                o = len(kelimeler(sahneler[si]["metin"]) & kelimeler(pt)) / max(1, len(kelimeler(sahneler[si]["metin"])))
                if o > en:
                    en, es = o, si
            if es is None or en < 0.12:
                rapor.append(f"oda eşleşmedi: {cift[0]}"); continue
            son_s = es
            for ad2 in [x.strip() for x in cift[0].split("·")]:
                b = kelime_bul(sure, ad2, son_a, None, son_w if False else 0)
                if not b:
                    rapor.append(f"kelime yok: {ad2}"); continue
                ayet, wi, w = b
                son_a = ayet
                if any(p["ayet"] == ayet and p["w"] == wi for p in ipuclari):
                    continue
                ipuclari.append({"ses": w["tr"], "kelime": w["ok"], "ayet": ayet, "w": wi, "ar": w["a"]})
                atama.setdefault(es, {"ip": [], "ayet": set()})
                atama[es]["ip"].append(len(ipuclari) - 1); atama[es]["ayet"].add(ayet)
    elif kaynak == "ezber:1":
        h = eka["ezber"]["hikayeler"][1]["metin"]
        cift = re.findall(r"“([^”]+)”\s+ile\s+“([^”]+)”", h)
        satir = re.findall(r"([A-Z]) \((\d+)(?:‑(\d+))?\):", h)
        son_a = 1
        for i, (arapca, tr) in enumerate(cift):
            a0, a1 = (int(satir[i][1]), int(satir[i][2] or satir[i][1])) if i < len(satir) else (son_a, None)
            b = kelime_bul(sure, arapca, a0, a1) or kelime_bul(sure, arapca, 1)
            if not b:
                rapor.append(f"sesteş kelime yok: {arapca}"); continue
            ayet, wi, w = b
            son_a = ayet
            ipuclari.append({"ses": tr, "kelime": w["ok"], "ayet": ayet, "w": wi, "ar": w["a"]})
            si = i if len(sahneler) >= len(cift) else round(i * (len(sahneler) - 1) / max(1, len(cift) - 1))
            atama.setdefault(si, {"ip": [], "ayet": set()})
            atama[si]["ip"].append(len(ipuclari) - 1); atama[si]["ayet"].add(ayet)
    # --- dinleme sahnesi
    if kaynak.startswith("ezber") and not any(s["metin"].startswith("Şimdi") for s in sahneler):
        ks = list(kar)[:2]
        nes = [{"t": "gunes", "x": 86, "y": 20}, {"t": "agac", "x": 14}]
        for j, x in enumerate((44, 62)[:len(ks)]):
            nes.append({"k": ks[j], "x": x, **({"hareket": "zipla"} if j == 1 else {})})
        sahneler.append({"arka": "safak", "zemin": "bahce", "metin": f"Şimdi {ad} suresini baştan sona birlikte dinleyelim.", "nesneler": nes})
        atama[len(sahneler) - 1] = {"ip": [], "ayet": set(zamanlar), "hepsi": True}
    else:
        for si, sc in enumerate(sahneler):
            if kaynak.startswith("ezber") and sc["metin"].startswith("Şimdi"):
                atama[si] = {"ip": [], "ayet": set(zamanlar), "hepsi": True}
    # --- ses
    dosya = f"hk/{no:03d}_{k}.webm"
    tum = []
    global_t = 0.0
    hz = ses.hz
    for si, s in enumerate(sahneler):
        at = atama.get(si, {"ip": [], "ayet": set()})
        if at.get("hepsi"):
            parcalar = [["anlatici", s["metin"]]]
        else:
            parcalar = parcala(s, kar)
        seg = [sessiz(ONSES, hz)]
        parca_rel, t = [], ONSES
        for pi, (kim, tx) in enumerate(parcalar):
            perde = PERDE.get(kar.get(kim, {}).get("tur"), 1.0) if kim != "anlatici" else 1.0
            a = ses.uret(tx, perde)
            hz = ses.hz
            if pi:
                seg.append(sessiz(PARCA_ARASI, hz)); t += PARCA_ARASI
            seg.append(a)
            parca_rel.append({"kim": kim, "t": round(t, 2), "bit": round(t + len(a) / hz, 2)})
            t += len(a) / hz
        seg.append(sessiz(SONSES, hz)); t += SONSES
        n_sure = t
        klip = [{"s": "n", "b": round(global_t, 3), "e": round(global_t + n_sure, 3)}]
        okuma = []
        cur = n_sure
        if at["ayet"]:
            cur += 0.1
            for ay in sorted(at["ayet"]):
                b, e = zamanlar[ay]
                e = min(e + 0.1, zamanlar.get("sonu", 1e9))
                klip.append({"s": "a", "b": round(b, 3), "e": round(e, 3)})
                parca_rel.append({"kim": "ayet", "t": round(cur, 2), "bit": round(cur + (e - b), 2)})
                okuma.append({"ayet": ay, "t": round(cur, 2), "bit": round(cur + (e - b), 2)})
                cur += (e - b) + 0.3
            cur -= 0.2
        s.pop("ipucu", None)
        s["klip"] = klip
        s["parca"] = parca_rel
        s["sure"] = round(cur, 2)
        s["okuma"] = okuma
        if at["ip"] and not at.get("hepsi"):
            s["ipucu"] = [{"i": i} for i in at["ip"]]
        tum.extend(seg)
        global_t += n_sure
    a = np.concatenate(tum)
    os.makedirs(CIKIS, exist_ok=True)
    hedef = os.path.join(CIKIS, os.path.basename(dosya))
    with tempfile.TemporaryDirectory() as g:
        wav = os.path.join(g, "a.wav")
        with wave.open(wav, "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(hz); w.writeframes(a.tobytes())
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-ac", "1", "-codec:a", "libopus", "-b:a", "32k",
                        "-vbr", "constrained", "-map_metadata", "-1", "-f", "webm", hedef], check=True)
    A["ses"] = True
    A["dosya"] = dosya
    if ipuclari:
        A["ipuclari"] = ipuclari
        A["not"] = (f"Kartlarda Türkçe anlam → {ad} suresindeki kelime yazıyor." if kaynak == "ezber:0"
                    else "Sesteş kelimeler yalnızca hatırlatma ipucudur; anlamı vermez, okunuş için örnek alınmaz.")
    return rapor, len(a) / hz


def main():
    nolar = [int(x) for x in sys.argv[1:] if x.isdigit()]
    hepsi = "--hepsi" in sys.argv
    ses = Ses()
    for no in nolar:
        f = os.path.join(KOK, "data", f"{no:03d}_eka.json")
        e = json.load(open(f, encoding="utf-8"))
        sure = json.load(open(os.path.join(KOK, "data", f"{no:03d}.json"), encoding="utf-8"))
        zam = ayet_zamanlari(sure)
        ad = sure["ad"]
        for k, A in enumerate(e["_anim"]["liste"]):
            if A.get("dosya") and not hepsi:
                continue
            rapor, sn = hikaye_isle(ses, no, k, A, sure, zam, ad)
            print(no, k, A["baslik"], f"{sn:.0f} sn", "UYARI: " + "; ".join(rapor) if rapor else "", flush=True)
        json.dump(e, open(f, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))


if __name__ == "__main__":
    main()
