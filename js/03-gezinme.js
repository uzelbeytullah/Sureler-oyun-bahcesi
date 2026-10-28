/* Sureler Oyun Bahçesi · Sekmeler, ana sayfa, ilk giriş yolu, sure açma */
/* ---------- gezinme ---------- */
let CUR=null,cur="harita";const CACHE={};
/* Ekran sayacı: her ekran değişiminde artar; gecikmeli işler (soru geçişi vb.) eski ekranda kaldıysa çalışmaz */
let EKRAN_NO=0;
/* Erişilebilirlik yardımcıları: hareket azaltma tercihi, ekran okuyucuya duyuru, klavyeyle role=button */
function kaydirmaDavranisi(){try{return window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth";}catch(e){return "smooth";}}
function canliDuyur(t){let el=document.getElementById("canliAlan");if(!el){el=document.createElement("div");el.id="canliAlan";el.className="gorunmez";el.setAttribute("role","status");el.setAttribute("aria-live","polite");document.body.appendChild(el);}
  el.textContent="";setTimeout(()=>{el.textContent=t;},60);}
document.addEventListener("keydown",e=>{const t=e.target;if((e.key==="Enter"||e.key===" ")&&t&&t.matches&&t.matches('[role=button][tabindex]:not(button):not([data-c])')){e.preventDefault();t.click();}});
function setTabs(ayniEkran){if(!ayniEkran)EKRAN_NO++;
  const T=$("tabs");
  if(!CUR){T.innerHTML="";T.hidden=true;return;}
  T.hidden=false;
  const ac_=k=>cur===k?' aria-current="page"':"";
  const b=([k,a])=>`<button data-v="${k}" class="${cur===k?"on":""}"${ac_(k)}>${a}</button>`;
  const ust=["harita","oku","ezber","ilkeler","portre"],alt=["kelime","tamamla","sirala","bilgi"];
  if(kucuk()&&!S.tumBolum){const B=[["oku","🎧 Dinle"],["cocuk","🎬 Hikâye"],["kelime","🎮 Dinle ve seç"],["tamamla","🧩 Dinle ve tamamla"],["sirala","🔢 Sırayı bul"],["ezber","🧠 Ezber"]].filter(x=>x[0]!=="cocuk"||CUR.ek);
    T.innerHTML=`<div class="sira">${CUR.ust?`<button data-v="gruplar" class="geri">← Yâsîn grupları</button>`:""}<button data-v="sureler" class="geri">← Sureler</button><button data-v="harita" class="${cur==="harita"?"on":""}"${ac_("harita")}>⭐ Yıldızlarım</button><button data-tum="1">Bütün bölümler</button></div><div class="buyuk-yol">${B.map(([k,a])=>`<button data-v="${k}" class="${cur===k?"on primary":""}"${ac_(k)}>${a}</button>`).join("")}</div>`;return;}
  const one=S.seviye==="kucuk"&&CUR.ek?`<button data-v="cocuk" class="${cur==="cocuk"?"on":""}"${ac_("cocuk")}>🎬 Çocuklar için</button>`:S.seviye==="yetiskin"&&CUR.ek?`<button data-v="sinav" class="${cur==="sinav"?"on":""}"${ac_("sinav")}>📘 Kitap sınavı</button>`:"";
  T.innerHTML=`<div class="sira">${CUR.ust?`<button data-v="gruplar" class="geri">← Yâsîn grupları</button>`:""}<button data-v="sureler" class="geri">← Sureler</button>${kucuk()?`<button data-sade="1">Sade görünüm</button>`:""}${one}${GAMES.filter(g=>ust.includes(g[0])&&(g[0]!=="ilkeler"||CUR.ilke)).map(b).join("")}</div>
  <div class="sira">${GAMES.filter(g=>alt.includes(g[0])).map(b).join("")}</div>${CUR.ek?`<div class="sira" aria-label="Kitaptan"><b style="align-self:center;font-size:13px;color:var(--gold)">KİTAPTAN</b>${EK_SEKME.map(b).join("")}</div>`:""}`;
}
$("tabs").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;TEKRAR_AKIS=false;if(b.dataset.tum){S.tumBolum=true;save();setTabs(true);return;}if(b.dataset.sade){S.tumBolum=false;save();setTabs(true);return;}aracDur();animDur();ezberArac=null;
  if(b.dataset.v==="sureler"){CUR=null;anaSayfa();return;}
  if(b.dataset.v==="gruplar"){CUR=null;grupMenu(YASIN());return;}show(b.dataset.v);});
async function animHazirla(){if(!CUR||CUR.anim!==undefined)return;const no=CUR.no,a=await animYukle(no);if(!CUR||CUR.no!==no)return;CUR.anim=null;CUR.animEk={};
  if(a&&a.liste){CUR.anim=a.liste.find(x=>x.kaynak==="cocuk")||null;a.liste.filter(x=>x.kaynak!=="cocuk").forEach(x=>CUR.animEk[x.baslik]=x);}}
async function show(v){yarBirak();if(CUR&&CUR.no){S.sonSure=CUR.no;}const p=EK_PARCA[v];if(CUR&&(p||v==="ezber"||v==="cocuk")){const no=CUR.no,ys=!((CACHE["ek"+no]||{})._y||{})[p];
    if(ys||CUR.anim===undefined){$("view").innerHTML=`<p class="yukleniyor">Yükleniyor…</p>`;await Promise.all([p?ekParca(no,p):0,(v==="ezber"||v==="cocuk")?animHazirla():0]);if(!CUR||CUR.no!==no)return;}}
  cur=v;sayacIsle(v);setTabs();({harita,oku,kelime,tamamla,sirala,bilgi,portre,ilkeler,ezber,sinav,yol,sayilar,dusun,cocuk})[v]();window.scrollTo({top:0});}
function baslik(){
  if(CUR&&CUR.ust){const son=CUR.ilkAyet+CUR.ayetler.length-1;$("baslik").textContent=`Yâsîn · ${CUR.ilkAyet}-${son}. ayetler`;$("altbaslik").textContent=`${CUR.grup} · ${CUR.ayetler.length} ayet`;$("baslikAr").textContent=CUR.adAr;}
  else if(CUR){$("baslik").textContent=CUR.etiket?CUR.ad:CUR.ad+" Suresi";$("altbaslik").textContent=CUR.etiket?`${CUR.etiket} · ${CUR.ayetler[0].w.length} kelime · ${(CUR.cumleler||[]).length} cümle`:`${CUR.no}. sure · ${CUR.ayetler.length} ayet · ${CUR.inis}`;$("baslikAr").textContent=CUR.adAr;}
  else{$("baslik").textContent="Sureler Oyun Bahçesi";$("altbaslik").textContent="Fâtiha ve son cüz · oyna, öğren, yıldızları topla";$("baslikAr").textContent="القرآن";}
}
let araMetin="";
function anaSayfa(){yarBirak();TEKRAR_AKIS=false;
  CUR=null;baslik();setTabs();anaSayfa.no=EKRAN_NO;renderStats();
  const V=$("view");if(!aktifKisi()){kisiSec();return;}if(!S.seviye){seviyeSor(anaSayfa);return;}
  if(ilkYolGoster()){ilkYol();return;}
  V.innerHTML=`<div style="display:flex;justify-content:flex-end;margin-bottom:6px">${kisiDugme()}</div>${gorevKart()}<div id="eylemKart"></div><div id="halkaKart"></div>${namazKart()}${bugunPaneli()}<h2>Bir sure seç</h2><p>Her surede dört yıldız var: okudum, kelimeleri bildim, ayetleri tamamladım, sırayı bildim.</p>
  <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="primary yesil-dug" id="bahceAc">🌳 Bahçem</button><button id="hangiAc">🎧 Hangi sure?</button><button id="elifAc">🔤 Elif-ba</button><button id="yarKur">👪 Aile yarışması kur</button><button id="yarKatil">👪 Aile yarışmasına katıl</button><button id="hedefAc">🤝 Ortak hedef</button><button id="ebeveynAc">👨‍👩‍👧 Ebeveyn özeti</button><button class="primary" id="atlasAc">İlke atlası: bütün surelerin ilkeleri</button></div>
  <input class="ara" id="ara" type="search" placeholder="Sure adı ya da numarası yaz" aria-label="Sure ara" value="${esc(araMetin)}">
  <div class="sure-grid" id="grid"></div>
  <h2>Rozetler</h2>${(()=>{const var_=BADGES.filter(([id])=>S.rozet.includes(id)),yok=BADGES.filter(([id])=>!S.rozet.includes(id));
    return `<div class="badges">${var_.map(([,ad])=>`<span class="badge got">✓ ${ad}</span>`).join("")||"<span>Henüz rozetin yok; ilk doğru cevapla ilk rozet gelir.</span>"}</div>
    ${yok.length?`<p style="font-size:14px;margin:6px 0 0"><b>Sıradaki rozetler:</b></p><div class="badges">${yok.slice(0,3).map(([,ad])=>`<span class="badge">${ad}</span>`).join("")}</div>${yok.length>3?`<details><summary style="font-size:14px">Bütün rozetleri gör (${BADGES.length})</summary><div class="badges">${yok.slice(3).map(([,ad])=>`<span class="badge">${ad}</span>`).join("")}</div></details>`:""}`:""}`;})()}
  <p>Her çalışman bir emektir: doğru cevaplar, tekrarlar ve izlenen hikâyeler emek puanı olarak bahçeni büyütür. Asıl kazanç, öğrendiğin ayetin anlamını bilmek ve onu hayatına taşımaktır. Her gün biraz çalışırsan günlük serin büyür.</p>`;
  const kucult=t=>t.toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ’'‘]/g,"");
  const ciz=()=>{const q=kucult(araMetin.trim());
    $("grid").innerHTML=KATALOG.filter(k=>!q||kucult(k.ad).includes(q)||String(k.no)===q).map(k=>{if(k.gruplar){const t=grupYildiz(k),m=k.gruplar.length*4;
      return `<button class="sure-kart ${t===m?"tam":""}" data-n="${k.no}"><span class="ust"><span class="sno">${k.no}. sure · ${k.gruplar.length} grup</span><span class="yild" style="letter-spacing:0"><b>★ ${t}/${m}</b></span></span><span class="sar" lang="ar">${k.adAr}</span><span class="sad">${esc(k.ad)}</span><span class="sbilgi">${k.ayet} ayet · ${esc(k.anlam)}</span></button>`;}
      const y=yildizSay(k.no);
      return `<button class="sure-kart ${y===4?"tam":""}" data-n="${k.no}"><span class="ust"><span class="sno">${k.etiket||k.no+". sure"}</span><span class="yild" aria-label="${y} yıldız"><b>${"★".repeat(y)}</b>${"★".repeat(4-y)}</span></span>
      <span class="sar" lang="ar">${k.adAr}</span><span class="sad">${esc(k.ad)}</span><span class="sbilgi">${k.etiket?"Tek ayet":k.ayet+" ayet"} · ${esc(k.anlam||k.inis)}</span></button>`;}).join("")||"<p>Bu adla bir sure bulunamadı.</p>";
    $("grid").querySelectorAll("[data-n]").forEach(b=>b.onclick=()=>{const k=KATALOG.find(x=>x.no===+b.dataset.n);if(k.gruplar)grupMenu(k);else ac(k.no);});};
  $("ara").oninput=e=>{araMetin=e.target.value;ciz();};ciz();bugunBagla();$("atlasAc").onclick=()=>{atlasTema=null;atlas();};$("bahceAc").onclick=()=>bahce();eylemKartCiz();halkaKartCiz();{const kd=$("kisiDeg");if(kd)kd.onclick=()=>kisiSec();}$("yarKatil").onclick=()=>yarKatil();$("yarKur").onclick=()=>yarKur();$("hangiAc").onclick=()=>hangiSure();$("elifAc").onclick=()=>elifba();$("hedefAc").onclick=()=>hedefSayfa();$("ebeveynAc").onclick=()=>ebeveynOzet();
}
/* İlk giriş: henüz hiç yıldızı olmayan kişiye tek bir yol gösterilir */
function hicYildizYok(){return !Object.values(S.sure||{}).some(x=>x.yildiz&&Object.values(x.yildiz).some(Boolean));}
function ilkYolGoster(){return !S.ilkYolGec&&hicYildizYok()&&!S.dogru;}
function ilkYol(){const V=$("view"),p=aktifKisi()||{},k1=kucuk();
  V.innerHTML=`<div style="display:flex;justify-content:flex-end;margin-bottom:6px">${kisiDugme()}</div>
  <section class="detay pop" style="text-align:center;display:grid;gap:12px"><div style="font-size:54px">🌱</div><h2>Hoş geldin${p.ad?", "+esc(p.ad):""}!</h2>
  <p style="font-size:19px">Bahçene ilk fidanı birlikte dikelim. Üç küçük adım:</p>
  <ol style="text-align:left;font-size:19px;margin:0 auto;max-width:420px;display:grid;gap:6px"><li><b>Fâtiha'yı dinle</b> ${k1?"(kâri okur, sen dinlersin)":"ve okuduğun ayetleri işaretle"}</li><li><b>Bir kelime oyunu</b> oyna</li><li><b>İlk yıldızını</b> al</li></ol>
  <button class="primary" id="ilkBasla" style="font-size:22px;min-height:64px">▶ Başlayalım</button>
  <button id="ilkGec" style="font-size:15px">Her şeyi göster</button></section>`;
  $("ilkBasla").onclick=()=>ac(1,"oku");$("ilkGec").onclick=()=>{S.ilkYolGec=true;save();anaSayfa();};
  {const kd=$("kisiDeg");if(kd)kd.onclick=()=>kisiSec();}}
function grupMenu(k){
  CUR=null;baslik();setTabs();renderStats();
  $("baslik").textContent="Yâsîn Suresi";$("altbaslik").textContent="83 ayet · 29 grup · bir grup seç";$("baslikAr").textContent="يس";
  const V=$("view");
  V.innerHTML=`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="geri" id="gGeri">← Sureler</button></div>
  <button class="sure-kart tam" id="ortakAc" style="width:100%"><span class="ust"><span class="sno">Surenin bütünü</span><span class="yild"><b>${(S.ortakGez||[]).length?"✓":""}</b></span></span><span class="sad">Yâsîn Ortak Bilgiler</span><span class="sbilgi">Kimlik, fazilet rivayetleri, 29 grubun haritası, mimari ve mesaj, bilgi yarışması, 165 soruluk kitap sınavı, Kur'an insanı</span></button>
  <h2>Yâsîn'in 29 grubu</h2><p>Her grup kendi başına çalışılır ve dört yıldız kazandırır. Toplam: <b>${grupYildiz(k)} / ${k.gruplar.length*4} yıldız</b></p>
  <div class="sure-grid">${k.gruplar.map((g,i)=>{const y=yildizSay(g.id);return `<button class="sure-kart ${y===4?"tam":""}" data-g="${g.id}"><span class="ust"><span class="sno">${i+1}. grup</span><span class="yild" aria-label="${y} yıldız"><b>${"★".repeat(y)}</b>${"★".repeat(4-y)}</span></span><span class="sad">${g.bas}-${g.son}. ayetler</span><span class="sbilgi">${esc(g.tema)}</span></button>`;}).join("")}</div>`;
  $("gGeri").onclick=()=>anaSayfa();$("ortakAc").onclick=()=>{ortakAlt="kimlik";yasinOrtak();};
  V.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>ac(+b.dataset.g));
  window.scrollTo({top:0});
}
async function ac(no,sekme){
  const V=$("view");V.innerHTML=`<p class="yukleniyor">Sure yükleniyor…</p>`;
  try{
    if(!CACHE[no]){const r=await fetch("data/"+String(no).padStart(3,"0")+".json?v="+SURUM);if(!r.ok)throw 0;CACHE[no]=await r.json();}
    CUR=CACHE[no];if(no===2255&&!CUR.ilkAyet)CUR.ilkAyet=255;CUR.ek=await ekYukle(no);CUR.ilke=await ilkeYukle(no);CUR.anim=undefined;CUR.animEk={};if(false){const L=CUR.anim.liste;CUR.anim=L.find(a=>a.kaynak==="cocuk")||null;L.filter(a=>a.kaynak!=="cocuk").forEach(a=>CUR.animEk[a.baslik]=a);}else if(CUR.anim&&CUR.anim.ek)for(const e of CUR.anim.ek){try{const r=await fetch("data/"+String(no).padStart(3,"0")+"_anim"+e+".json?v="+SURUM);if(r.ok){const a=await r.json();CUR.animEk[a.baslik]=a;}}catch(x){}}ezberAyet=null;SS(no);baslik();renderStats();show(sekme||"harita");
  }catch(e){V.innerHTML=`<p>Sure verisi yüklenemedi. İnternet bağlantını denetleyip yeniden dene.</p><button class="primary" id="tekrar">Yeniden dene</button>`;$("tekrar").onclick=()=>ac(no);}
}
