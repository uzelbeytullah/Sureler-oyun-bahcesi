/* Sureler Oyun Bahçesi · Ebeveyn onayı, namaz hazırlığı yolu, haftalık aile halkası */
/* ========== EBEVEYN ONAYI ve NAMAZ HAZIRLIĞI YOLU ========== */
/* Şifre konduysa onay, seviye ya da yaş değişse de açık kalır; yalnız şifreyle kapatılabilir */
const onayGerek=()=>S.ebeveynOnay!==undefined?!!S.ebeveynOnay:(pinVar()||S.seviye!=="yetiskin");
const PIN_KEY="bahce-ebeveyn-pin";
const pinOz=p=>{let h=7;for(const c of "sob:"+p)h=(h*31+c.charCodeAt(0))>>>0;return String(h);};
function pinVar(){try{return !!localStorage.getItem(PIN_KEY);}catch(e){return false;}}
function pinDogru(p){try{return localStorage.getItem(PIN_KEY)===pinOz(p);}catch(e){return false;}}
/* Yetişkin kapısı: ebeveyn bölümüne girmeden önce küçük çocuğun çözemeyeceği bir çarpma sorusu (10 dakika geçerli) */
let KAPI_ZAMAN=0;
const kapiAcik=()=>Date.now()-KAPI_ZAMAN<6e5;
function ebeveynKapisi(sonra){CUR=null;baslik();setTabs();durSes();$("baslik").textContent="Ebeveyn bölümü";$("altbaslik").textContent="Yetişkinler için";
  const a=6+Math.floor(Math.random()*4),b=6+Math.floor(Math.random()*4);
  $("view").innerHTML=`<button class="geri" id="kG">← Sureler</button><h2>Bu bölüm yetişkinler için</h2><p>Devam etmek için soruyu cevaplayın:</p>
  <p style="font-size:24px;font-weight:800"><label for="kCvp">${a} × ${b} kaç eder?</label></p><p><input id="kCvp" class="ara" inputmode="numeric" maxlength="3" autocomplete="off" style="max-width:140px"> <button class="primary" id="kTamam" style="min-height:44px">Devam</button></p>`;
  $("kG").onclick=()=>anaSayfa();
  const dene=()=>{if(+$("kCvp").value.trim()===a*b){KAPI_ZAMAN=Date.now();sonra();}else{toast("Cevap yanlış");ebeveynKapisi(sonra);}};
  $("kTamam").onclick=dene;$("kCvp").onkeydown=e=>{if(e.key==="Enter")dene();};try{$("kCvp").focus();}catch(e){}}
function pinKoy(p){try{localStorage.setItem(PIN_KEY,pinOz(p));return true;}catch(e){return false;}}
function onayBekleyenler(){const r=[];Object.entries(S.sure||{}).forEach(([id,x])=>Object.entries(x.ezberDurum||{}).forEach(([i,d])=>{if(d&&d.onayBekle)r.push({id:+id,i:+i});}));return r;}
async function sureVeri(no){if(!CACHE[no]){const r=await fetch("data/"+String(no).padStart(3,"0")+".json?v="+SURUM);if(!r.ok)throw 0;CACHE[no]=await r.json();}return CACHE[no];}
async function onayEkrani(){CUR=null;baslik();setTabs();durSes();$("baslik").textContent="Ebeveyn onayı";$("altbaslik").textContent="Çocuk okur, ebeveyn dinler ve onaylar";
  const V=$("view"),L=onayBekleyenler();
  if(!L.length){V.innerHTML=`<button class="geri" id="oG">← Sureler</button><h2>Onay bekleyen ayet yok</h2><p>Ezberde son basamağa gelen ayetler burada toplanır.</p>`;$("oG").onclick=()=>anaSayfa();return;}
  const x=L[0];let d;try{d=await sureVeri(x.id);}catch(e){V.innerHTML="<p>Ayet yüklenemedi.</p>";return;}
  const a=d.ayetler[x.i],ilk=d.ilkAyet||(x.id===2255?255:1);
  V.innerHTML=`<button class="geri" id="oG">← Sureler</button><h2>👨‍👩‍👧 ${esc(adBul(x.id))} · ${ilk+x.i}. ayet</h2>
  <p style="font-size:19px"><b>Çocuk:</b> Ayeti ezberden, sesli oku. <b>Ebeveyn:</b> Metne bakarak dinle.</p>
  <details class="detay"><summary><b>Ebeveyn için: ayetin metni ve kâri okuyuşu</b></summary><div class="kelimeler" lang="ar" style="justify-content:center">${a.w.map((w,j)=>`<span class="k${j%12}">${esc(w.a)}</span>`).join("")}</div><p class="okunus">${esc(a.ok||"")}</p><button class="dn" id="oDinle">▶ Kâriden dinle</button></details>
  <div class="odak" style="display:grid;gap:8px"><b>Ebeveyn şifresi</b>${pinVar()?`<input id="oPin" class="ara" type="password" inputmode="numeric" maxlength="4" placeholder="4 haneli şifre" aria-label="Ebeveyn şifresi (4 rakam)" style="max-width:200px">`:`<p>Onay için önce bir ebeveyn şifresi gerekir. Şifreyi ebeveyn bölümünden belirleyin (çocuğunuz görmesin).</p><button id="oSifreGit" class="primary" style="min-height:44px">Ebeveyn bölümüne git</button>`}
   <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="primary" data-on="1" style="font-size:19px">✓ Doğru okudu</button><button data-on="0">Biraz daha çalışsın</button></div></div>
  <p style="font-size:14px">Sırada ${L.length} ayet var. Onaylanan ayet "ezberde" sayılır; namaz hazırlığı yolunda ilerler.</p>`;
  $("oG").onclick=()=>anaSayfa();
  $("oDinle").onclick=()=>{const b=d.ses.bas,e=x.i+1<b.length?b[x.i+1]:d.ses.son;hizUygula();calParca(x.id,b[x.i],e);};
  {const sg=$("oSifreGit");if(sg)sg.onclick=()=>ebeveynOzet();}
  V.querySelectorAll("[data-on]").forEach(b=>b.onclick=()=>{if(!pinVar()){toast("Önce ebeveyn bölümünden şifre belirleyin");return;}const p=$("oPin").value.trim();
    if(!pinVar()){toast("Önce ebeveyn bölümünden şifre belirleyin");return;}
    if(!pinDogru(p)){toast("Şifre yanlış");efekt("yanlis");return;}
    const D=((S.sure[x.id]||{}).ezberDurum)||{},r=D[x.i];if(!r){onayEkrani();return;}
    if(b.dataset.on==="1"){delete r.onayBekle;r.onaylandi=today();gun();S.puan+=20;efekt("yildiz");kutla();toast("Maşallah! Ayet ezberde, 20 puan");logIsle("onay");}
    else{delete r.onayBekle;delete r.tam;r.kutu=Math.max(0,(r.kutu||0)-1);r.sonraki=gunEkle(1);toast("Olsun, yarın yeniden çalışalım 🌱");}
    checkBadges();save();renderStats();onayEkrani();});}
const NAMAZ_VARSAYILAN=[112,113,114];
function namazSureler(){return [1,...((S.namazSure&&S.namazSure.length===3)?S.namazSure:NAMAZ_VARSAYILAN)];}
function namazDurum(){return namazSureler().map(no=>{const k=KATALOG.find(x=>x.no===no)||{ayet:0,ad:String(no)};const D=((S.sure[no]||{}).ezberDurum)||{};
  let n=0;for(let i=0;i<k.ayet;i++)if(ezbTam(D[i]))n++;return {no,ad:k.ad,n,top:k.ayet};});}
function namazKart(){if(S.seviye==="yetiskin"&&!S.namazAcik)return "";const L=namazDurum(),tam=L.every(x=>x.n>=x.top);
  return `<section class="detay aile-kart" aria-label="Namaz hazırlığı yolu"><h3>🕌 Namaz hazırlığı yolu</h3>
  <p>Fâtiha ve üç kısa sureyi ezberle; ${onayGerek()?"ebeveynin onaylayınca ":""}"Namazda okuyabilirim" belgeni al.</p>
  <div style="display:flex;gap:6px;flex-wrap:wrap">${L.map(x=>`<button data-nz="${x.no}" class="${x.n>=x.top?"on":""}" style="min-height:44px">${x.n>=x.top?"✓ ":""}${esc(x.ad)} ${x.n}/${x.top}</button>`).join("")}</div>
  ${tam?`<button class="primary" id="namazBelge" style="font-size:19px;margin-top:8px">🎉 Belgeni al</button>`:""}</section>`;}
function namazBelgesi(){const p=aktifKisi()||{};S.namazBelge=S.namazBelge||today();checkBadges();save();CUR=null;baslik();setTabs();
  $("baslik").textContent="Namazda okuyabilirim";$("altbaslik").textContent="Tebrikler!";const L=namazDurum();
  const tarih=new Date(S.namazBelge+"T12:00").toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"});
  $("view").innerHTML=`<div style="display:flex;gap:8px;flex-wrap:wrap" class="yazdirma-yok"><button class="geri" id="nbG">← Sureler</button><button class="primary" id="nbY">🖨 Yazdır</button></div>
  <svg viewBox="0 0 800 560" role="img" aria-label="Namazda okuyabilirim belgesi" style="width:100%;height:auto;background:#FFFDF5;border-radius:16px">
   <rect x="16" y="16" width="768" height="528" rx="22" fill="none" stroke="#8A6200" stroke-width="6"/><rect x="34" y="34" width="732" height="492" rx="16" fill="none" stroke="#2E7D5B" stroke-width="2" stroke-dasharray="8 6"/>
   <text x="400" y="110" text-anchor="middle" style="font:700 44px var(--f-ar)" fill="#8A6200">بِسْمِ ٱللَّهِ</text>
   <text x="400" y="180" text-anchor="middle" style="font:800 40px var(--f-ui)" fill="#1D4AA0">Namazda okuyabilirim</text>
   <text x="400" y="250" text-anchor="middle" style="font:800 36px var(--f-ui)" fill="#101A33">${esc(p.ad||"")}</text>
   <text x="400" y="300" text-anchor="middle" style="font:600 22px var(--f-ui)" fill="#2A3656">aşağıdaki sureleri ezberledi ve ailesine okudu:</text>
   <text x="400" y="350" text-anchor="middle" style="font:800 26px var(--f-ui)" fill="#2E7D5B">${L.map(x=>esc(x.ad)).join(" · ")}</text>
   <text x="400" y="420" text-anchor="middle" style="font:600 20px var(--f-ui)" fill="#2A3656">Allah okuduğunu kabul etsin, artırsın.</text>
   <text x="400" y="480" text-anchor="middle" style="font:700 18px var(--f-ui)" fill="#8A6200">${esc(tarih)} · Sureler Oyun Bahçesi</text></svg>
  <p class="yazdirma-yok" style="font-size:14px">Belge çıktısını alıp çocuğunuzun odasına asabilirsiniz.</p>`;
  $("nbG").onclick=()=>anaSayfa();$("nbY").onclick=()=>{try{window.print();}catch(e){toast("Yazdırma bu görünümde açılamadı");}};kutla();}
BADGES.push(["onay1","Bir ayetini ebeveynine okuyup onay aldı",s=>Object.values(s.sure||{}).some(x=>Object.values(x.ezberDurum||{}).some(d=>d&&d.onaylandi))],
 ["namaz","Namaz hazırlığı yolunu tamamladı",s=>!!s.namazBelge]);
function ebeveynAyarHtml(){const L=KATALOG.filter(k=>!k.gruplar&&k.no>=78&&k.ayet<=11),sec=namazSureler().slice(1);
  return `<section class="detay"><h3>Ebeveyn onayı (${esc((aktifKisi()||{}).ad||"bu kişi")} için)</h3>
  <p>Açıkken ezberde son basamağa gelen ayet, siz dinleyip şifrenizle onaylayınca "ezberde" sayılır.</p>
  <p style="display:flex;gap:6px;flex-wrap:wrap"><button data-onay="1" class="${onayGerek()?"on":""}">Açık</button><button data-onay="0" class="${onayGerek()?"":"on"}">Kapalı</button></p>
  ${pinVar()?"":`<p class="odak" role="note"><b>Önemli:</b> Onayın işe yaraması için önce bir ebeveyn şifresi belirleyin. Şifre yokken onay ekranı çalışmaz.</p>`}<p><b>Ebeveyn şifresi:</b> ${pinVar()?"belirlendi":"henüz yok"} <input id="ePin" class="ara" type="password" inputmode="numeric" maxlength="4" placeholder="Yeni 4 haneli şifre" aria-label="Yeni 4 haneli ebeveyn şifresi" style="max-width:190px"> ${pinVar()?`<input id="ePinEski" class="ara" type="password" inputmode="numeric" maxlength="4" placeholder="Mevcut şifre" aria-label="Mevcut ebeveyn şifresi" style="max-width:150px">`:""} <button id="ePinKaydet">Kaydet</button></p></section>
  <section class="detay"><h3>Namaz hazırlığı yolu</h3><p>Fâtiha'nın yanında ezberlenecek üç kısa sureyi seçin:</p>
  <p style="display:flex;gap:6px;flex-wrap:wrap">${L.map(k=>`<button data-nzs="${k.no}" class="${sec.includes(k.no)?"on":""}" style="min-height:44px">${esc(k.ad)}</button>`).join("")}</p>
  ${S.seviye==="yetiskin"?`<p><button data-nzac="1" class="${S.namazAcik?"on":""}">Ana sayfada göster</button></p>`:""}</section>
  ${window.claude&&claude.bulut?`<section class="detay"><h3>Bulut kaydı ve gizlilik</h3>
  <p>İlerleme, telefonda ve bilgisayarda aynı kalsın diye Google Firebase'de adsız bir hesapla saklanır. Kayıtta kişi adları, yaşları ve ilerleme bulunur; başka kimse okuyamaz. Kötüye kullanımı önlemek için Google reCAPTCHA kullanılır.</p>
  ${bulutKapali()?`<p><b>Bulut kaydı kapalı.</b> İlerleme yalnız bu cihazda.</p><button id="bulutAcB" style="min-height:44px">Bulut kaydını yeniden aç</button>`
   :`<button id="bulutSilB" style="min-height:44px">Buluttaki kaydımızı sil</button><p style="font-size:14px">Bu cihazdaki ilerleme kalır; yalnız buluttaki kopya silinir ve eşitleme kapanır.</p>`}</section>`:""}`;}
function ebeveynAyarBagla(){const V=$("view");
  V.querySelectorAll("[data-onay]").forEach(b=>b.onclick=()=>{const ac=b.dataset.onay==="1";
    if(!ac&&pinVar()){const e=$("ePinEski");if(!pinDogru(e?e.value.trim():"")){toast("Kapatmak için mevcut şifreyi \"Mevcut şifre\" kutusuna yazın");if(e)e.focus();return;}}
    S.ebeveynOnay=ac;save();ebeveynOzet();});
  const pk=$("ePinKaydet");if(pk)pk.onclick=()=>{const y=$("ePin").value.trim(),e=$("ePinEski");if(!/^\d{4}$/.test(y)){toast("Şifre 4 rakam olmalı");return;}if(pinVar()&&!pinDogru(e?e.value.trim():"")){toast("Mevcut şifre yanlış");return;}pinKoy(y);toast("Ebeveyn şifresi kaydedildi");ebeveynOzet();};
  V.querySelectorAll("[data-nzs]").forEach(b=>b.onclick=()=>{let sec=namazSureler().slice(1);const n=+b.dataset.nzs;if(sec.includes(n))sec=sec.filter(x=>x!==n);else{sec.push(n);if(sec.length>3)sec.shift();}S.namazSure=sec.length===3?sec:sec.concat(NAMAZ_VARSAYILAN.filter(x=>!sec.includes(x))).slice(0,3);save();ebeveynOzet();});
  V.querySelectorAll("[data-nzac]").forEach(b=>b.onclick=()=>{S.namazAcik=!S.namazAcik;save();ebeveynOzet();});
  const bs=$("bulutSilB");if(bs)bs.onclick=async()=>{if(!bs.dataset.onay){bs.dataset.onay="1";bs.textContent="Emin misiniz? Silmek için bir daha basın";return;}
    bs.disabled=true;bs.textContent="Siliniyor…";try{const h=await bulutSil();toast(h?"Bazı kayıtlar silinemedi; bağlantıyı denetleyip yeniden deneyin":"Buluttaki kaydınız silindi");}catch(e){toast("Bulut bağlantısı yok; kayıt silinemedi");}ebeveynOzet();};
  const ba=$("bulutAcB");if(ba)ba.onclick=()=>bulutAc();}

/* ========== HAFTALIK AİLE HALKASI: haftada bir, 10 dakika, ailece ========== */
function haftaAnahtar(){const d=new Date();const y=new Date(d.getFullYear(),0,1);return d.getFullYear()+"-H"+Math.ceil(((d-y)/864e5+y.getDay()+1)/7);}
function halkaSure(){const L=S.log||{},say={};Object.keys(L).sort().slice(-7).forEach(g=>Object.entries(L[g].s||{}).forEach(([n,c])=>{say[n]=(say[n]||0)+c;}));
  const en=Object.entries(say).sort((a,b)=>b[1]-a[1]).map(([n])=>+n).find(n=>n<36000&&KATALOG.some(k=>k.no===n&&k.ek));return en||S.sonSure||112;}
async function halkaVeri(){const h=haftaAnahtar();if(S.halka&&S.halka.h===h&&S.halka.s)return S.halka;
  const no=halkaSure();let C={};try{const E=await ekParca(no,"a");C=E.cocuk||{};}catch(e){}
  const n=new Date().getDate();const Q=(C.ayetler||[]).filter(a=>a.soru),E=(C.etkinlikler||[]).filter(e=>e.ad&&e.nasil),A=(C.ayetler||[]);
  S.halka={h,s:no,ayet:A.length?A[n%A.length].ayet:1,soru:Q.length?Q[n%Q.length].soru:"Bu surede seni en çok ne düşündürdü?",etk:E.length?E[n%E.length]:null,adim:{},bitti:false};save();return S.halka;}
async function halkaKartCiz(){const el=$("halkaKart");if(!el)return;const H=await halkaVeri();if(!$("halkaKart"))return;
  el.innerHTML=H.bitti?`<section class="detay aile-kart"><h3>🏮 Bu haftanın aile halkası tamam</h3><p>Maşallah! Bahçenizde yeni bir fener yandı. Gelecek hafta yeni halka gelecek.</p></section>`
   :`<section class="detay aile-kart"><h3>🏮 Bu haftanın aile halkası</h3><p>Haftada bir, ailece 10 dakika: <b>${esc(adBul(H.s))}</b> suresinden bir ayet, bir soru ve küçük bir etkinlik.</p><button class="primary" id="halkaBasla">Halkayı başlat</button></section>`;
  const b=$("halkaBasla");if(b)b.onclick=()=>aileHalkasi();}
async function aileHalkasi(){const H=await halkaVeri();CUR=null;baslik();setTabs();durSes();$("baslik").textContent="Aile halkası";$("altbaslik").textContent="Bu hafta · 10 dakika · ailece";
  let d=null;try{d=await sureVeri(H.s);}catch(e){}
  const ilk=(d&&d.ilkAyet)||1,a=d&&d.ayetler[H.ayet-ilk];
  const adim=(k,bas,ic)=>`<section class="detay ${H.adim[k]?"aile-kart":""}"><h3>${H.adim[k]?"✅":"⬜"} ${bas}</h3>${ic}<button data-ha="${k}" class="${H.adim[k]?"":"primary"}">${H.adim[k]?"Yapıldı ✓":"Yaptık"}</button></section>`;
  $("view").innerHTML=`<button class="geri" id="haG">← Sureler</button><h2>🏮 Aile halkası · ${esc(adBul(H.s))}</h2>
  <p>Hep birlikte oturun, ekranı ortaya koyun. Sırayla üç adımı yapın; acele yok.</p>
  ${adim("oku","1. Birlikte okuyun",a?`<div class="kelimeler" lang="ar" style="justify-content:center">${a.w.map((w,j)=>`<span class="k${j%12}">${esc(w.a)}</span>`).join("")}</div><p class="meal">${esc(a.meal||"")}</p><button class="dn" id="haDinle">▶ Kâriden dinle</button>`:"<p>Surenin bir ayetini birlikte okuyun.</p>")}
  ${adim("soru","2. Sofrada sorun",`<p style="font-size:19px">${esc(H.soru)}</p><p style="font-size:14px">Herkes bir cümleyle cevap versin; doğru ya da yanlış yok.</p>`)}
  ${adim("etk","3. Birlikte yapın",H.etk?`<p style="font-size:18px"><b>${esc(H.etk.ad)}</b>: ${esc(H.etk.nasil)}</p>`:"<p>Bu hafta birbirinize küçük bir iyilik yapın ve akşam anlatın.</p>")}`;
  $("haG").onclick=()=>anaSayfa();
  const hd=$("haDinle");if(hd&&d)hd.onclick=()=>{const b=d.ses.bas,i=H.ayet-ilk,e=i+1<b.length?b[i+1]:d.ses.son;hizUygula();calParca(H.s,b[i],e);};
  $("view").querySelectorAll("[data-ha]").forEach(b=>b.onclick=()=>{H.adim[b.dataset.ha]=true;
    if(["oku","soru","etk"].every(k=>H.adim[k])&&!H.bitti){H.bitti=true;S.halkaSay=(S.halkaSay||0)+1;gun();S.puan+=30;efekt("gorev");kutla();toast("Aile halkası tamam! Bahçenizde bir fener yandı, 30 puan");logIsle("halka");checkBadges();}
    save();renderStats();aileHalkasi();});}
BADGES.push(["halka4","Dört hafta aile halkası yaptı",s=>(s.halkaSay||0)>=4]);
