/* Sureler Oyun Bahçesi · Küçükler için sesler, ebeveyn özeti, mola, küçük iyilik, ben okuyayım, kişi seçimi */
/* ========== KÜÇÜKLER: kelime sesi, sesli sorular, sade yol ========== */
const KEL=new Audio();KEL.preload="metadata";let kelBit=null;KEL.addEventListener("play",sikCalistir);
SIK.add(()=>{if(kelBit!==null&&!KEL.paused&&KEL.currentTime>=kelBit-0.02){KEL.pause();kelBit=null;}return kelBit!==null&&!KEL.paused;});
function kelimeSes(w){if(!w||!w.k)return false;const [g,b,e]=w.k,src=surumle(`kelime/k${g}.mp3?v=${SURUM}`);
  try{speechSynthesis.cancel();}catch(x){}
  const go=()=>{try{KEL.currentTime=b;}catch(x){}kelBit=e;KEL.play().catch(()=>{});};
  if(KEL.dataset.src!==src){KEL.dataset.src=src;KEL.src=src;KEL.addEventListener("loadedmetadata",go,{once:true});KEL.load();}else go();return true;}
function kelimeBul(ar,kaynak){const K=kaynak||CUR;if(!K||!K.ayetler)return null;const t=s=>String(s).replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,"");const a=t(ar);
  for(const y of K.ayetler)for(const w of y.w)if(w.a===ar)return w;for(const y of K.ayetler)for(const w of y.w)if(t(w.a)===a)return w;return null;}
const kucuk=()=>S.seviye==="kucuk";
let TRSES=null;function trSesVar(){try{if(!("speechSynthesis" in window))return false;const v=speechSynthesis.getVoices();if(!v.length)return true;TRSES=v.find(x=>/^tr/i.test(x.lang))||null;return !!TRSES;}catch(e){return false;}}
function soyle(t){try{if(!t)return;KEL.pause();speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang="tr-TR";u.rate=0.9;const v=speechSynthesis.getVoices().find(x=>/^tr/i.test(x.lang));if(v)u.voice=v;speechSynthesis.speak(u);}catch(e){}}
function duzMetin(html){const d=document.createElement("div");d.innerHTML=html;d.querySelectorAll("[lang=ar],.ar,.okunus,.qbig,.ayet-box").forEach(e=>e.remove());return d.textContent.replace(/\s+/g," ").trim();}
function sesliSoru(q,V){if(!kucuk())return;const arW=(()=>{const m=(q.html||"").match(/class="qbig ar"[^>]*>([^<]+)</);return m?kelimeBul(m[1].trim()):null;})();
  const bar=document.createElement("div");bar.style.cssText="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0";
  bar.innerHTML=`${trSesVar()?`<button class="dn" data-ss="soru" style="font-size:18px">🔊 Soruyu dinle</button>`:""}${arW?`<button class="dn" data-ss="kelime" style="font-size:18px">🎧 Kelimeyi dinle</button>`:""}`;
  const opts=V.querySelector(".opts");if(!opts)return;opts.before(bar);
  bar.querySelectorAll("[data-ss]").forEach(b=>b.onclick=()=>b.dataset.ss==="soru"?soyle(duzMetin(q.html)):kelimeSes(arW));
  opts.querySelectorAll("button[data-j]").forEach(b=>{const o=q.opts[+b.dataset.j];const s=document.createElement("button");s.type="button";s.className="ops-ses";s.setAttribute("aria-label",`${+b.dataset.j+1}. şıkkı dinle`);s.textContent="🔊";
    s.onclick=ev=>{ev.stopPropagation();if(q.sikAyet&&CUR&&CUR.ses){ayetCal(q.sikAyet[+b.dataset.j]);}else if(q.arOpts){kelimeSes(kelimeBul(o));}else soyle(o);};b.after(s);});
  opts.classList.add("ops-kucuk");
  if(!q.otoSesYok)setTimeout(()=>{if(arW)kelimeSes(arW);else if(trSesVar())soyle(duzMetin(q.html));},350);}
document.addEventListener("click",ev=>{if(!CUR||!CUR.ayetler)return;const kl=ev.target.closest(".read-ayet .kelimeler[lang=ar], .read-ayet [lang=ar].kelimeler");if(!kl)return;
  const ra=kl.closest('.read-ayet[id^="ay"]');if(!ra||kl!==ra.querySelector(".kelimeler"))return;const i=+ra.id.slice(2);
  const ws=[...kl.children].filter(e=>!e.classList.contains("n-ar"));let el=ev.target;while(el&&el.parentElement!==kl)el=el.parentElement;const j=ws.indexOf(el);
  const w=CUR.ayetler[i]&&CUR.ayetler[i].w[j];if(w&&kelimeSes(w)){el.classList.add("calan");setTimeout(()=>el.classList.remove("calan"),900);}});
/* ========== EBEVEYN: günlük kayıt, haftalık özet, aile etkinliği kartı, mola ========== */
function logIsle(tur,ek){const t=today();S.log=S.log||{};const g=S.log[t]=S.log[t]||{soru:0,dogru:0,tekrar:0,hikaye:0,dk:0,s:{},zor:[]};
  g[tur]=(g[tur]||0)+1;if(CUR&&CUR.no)g.s[CUR.no]=(g.s[CUR.no]||0)+1;
  if(ek&&ek.zor){const k=ek.zor;if(!g.zor.some(z=>z.s===k.s&&z.a===k.a))g.zor.push(k);if(g.zor.length>20)g.zor.shift();}
  const ks=Object.keys(S.log).sort();while(ks.length>91)delete S.log[ks.shift()];}
/* etkin süre: sayfa görünürken ve son 60 sn içinde dokunulduysa */
let sonDokunus=Date.now(),molaSonra=0;["click","keydown","touchstart"].forEach(e=>document.addEventListener(e,()=>{sonDokunus=Date.now();},{passive:true}));
function molaDk(){if(S.molaDk!==undefined)return S.molaDk;return S.seviye==="kucuk"?20:S.seviye==="genc"?40:0;}
setInterval(()=>{if(document.hidden||Date.now()-sonDokunus>60000||!PROF.aktif)return;const t=today();S.log=S.log||{};const g=S.log[t]=S.log[t]||{soru:0,dogru:0,tekrar:0,hikaye:0,dk:0,s:{},zor:[]};
  g.dk=Math.round(((g.dk||0)+0.25)*100)/100;S.oturumDk=(S.oturumDk||0)+0.25;
  const m=molaDk();if(m&&S.oturumDk>=m+molaSonra&&!document.querySelector(".mola"))molaGoster();},15000);
function molaGoster(){const p=aktifKisi();const once=document.activeElement;const d=document.createElement("div");d.className="mola";d.setAttribute("role","dialog");d.setAttribute("aria-label","Mola zamanı");
  d.innerHTML=`<div class="mola-kutu pop"><div style="font-size:54px">🌿</div><h2>${p&&p.ad?esc(p.ad)+", b":"B"}ugün çok güzel çalıştın!</h2><p style="font-size:19px">Şimdi biraz mola verelim. Öğrendiğin ayeti annene ya da babana okur musun?</p>
  <div style="display:grid;gap:8px"><button class="primary" id="molaTamam" style="font-size:20px;min-height:56px">Mola veriyorum</button>${molaSonra>0?`<p style="font-size:15px">Bir kez uzattık. Daha fazla süre için annen ya da baban <b>Ebeveyn özeti</b>nden mola ayarını değiştirebilir.</p>`:`<button id="molaBes">5 dakika daha</button>`}</div></div>`;
  document.body.appendChild(d);efekt("gorev");
  const ana=document.querySelector("main");if(ana)ana.inert=true;
  if(kucuk())setTimeout(()=>{if(d.isConnected)soyle(d.querySelector("h2").textContent+" "+d.querySelector("p").textContent);},400);
  /* kapanınca odak, pencere açılmadan önceki öğeye döner (o öğe yerinde kaldıysa) */
  const kapat=()=>{d.remove();if(ana)ana.inert=false;if(once&&once.isConnected&&once.focus)try{once.focus({preventScroll:true});}catch(e){}};
  $("molaTamam").onclick=()=>{S.oturumDk=0;molaSonra=0;save();kapat();durSes();animDur&&animDur();anaSayfa();};
  const mb=$("molaBes");if(mb)mb.onclick=()=>{molaSonra+=5;kapat();};
  /* Esc: uzatma hakkı varsa "5 dakika daha", yoksa "Mola veriyorum"; Tab odağı pencere içinde tutar */
  d.addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault();(mb||$("molaTamam")).click();return;}
    if(e.key!=="Tab")return;const f=[...d.querySelectorAll("button:not([disabled]),[href],input,select,textarea,[tabindex]:not([tabindex='-1'])")];if(!f.length)return;
    const ilk=f[0],son=f[f.length-1];if(e.shiftKey&&(document.activeElement===ilk||!d.contains(document.activeElement))){e.preventDefault();son.focus();}else if(!e.shiftKey&&(document.activeElement===son||!d.contains(document.activeElement))){e.preventDefault();ilk.focus();}});
  d.addEventListener("focusout",e=>{if(d.isConnected&&e.relatedTarget&&!d.contains(e.relatedTarget)){const t=$("molaTamam");if(t)t.focus();}});
  d.setAttribute("aria-modal","true");setTimeout(()=>{const t=$("molaTamam");if(t)t.focus();},50);}
document.addEventListener("visibilitychange",()=>{if(document.hidden){S.gizliT=Date.now();save();}else if(S.gizliT&&Date.now()-S.gizliT>15*60000){S.oturumDk=0;molaSonra=0;}});

/* aile etkinliği kartı */
function aileKarti(){const C=CUR&&CUR.ek&&CUR.ek.cocuk;if(!C)return "";const E=(C.etkinlikler||[]).filter(e=>e.ad||e.nasil);const Q=(C.ayetler||[]).filter(a=>a.soru);
  if(!E.length&&!Q.length)return "";const gun=new Date().getDate();const e=E.length?E[gun%E.length]:null,q=Q.length?Q[gun%Q.length]:null;
  return `<section class="detay aile-kart" aria-label="Bugün ailenle"><h3>👨‍👩‍👧 Bugün ailenle şunu dene</h3>${e?`<p style="font-size:19px"><b>${esc(e.ad||"")}</b>${e.nasil?": "+esc(e.nasil):""}</p>`:""}${q?`<p style="font-size:18px"><b>Sofrada sor:</b> ${esc(q.soru)}</p>`:""}<p style="font-size:14px">Ekranda öğrenilen, ailece yapılınca kalıcı olur.</p></section>`;}

/* haftalık özet (bu cihazdaki bütün kişiler) */
async function ebeveynOzet(){CUR=null;baslik();setTabs();$("baslik").textContent="Ebeveyn özeti";$("altbaslik").textContent="Son 7 gün · bu cihazdaki kişiler";
  const V=$("view");V.innerHTML=`<p class="yukleniyor">Hazırlanıyor…</p>`;save();
  const gunler=[...Array(7)].map((_,k)=>{const d=new Date();d.setDate(d.getDate()-6+k);return d.toLocaleDateString("sv-SE");});
  const bolum=[];
  for(const p of PROF.liste){let X=null;try{X=JSON.parse(localStorage.getItem(lsAnahtar(p.id))||"null");}catch(e){}if(!X)X={};
    const L=X.log||{};const top={soru:0,dogru:0,tekrar:0,hikaye:0,dk:0};const s={},zor=[];
    gunler.forEach(g=>{const x=L[g];if(!x)return;["soru","dogru","tekrar","hikaye","dk"].forEach(k=>top[k]+=x[k]||0);Object.entries(x.s||{}).forEach(([n,c])=>s[n]=(s[n]||0)+c);(x.zor||[]).forEach(z=>zor.push(z));});
    const aktifGun=gunler.filter(g=>L[g]&&(L[g].dk||L[g].soru||L[g].tekrar)).length;
    const enCok=Object.entries(s).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([n])=>+n);
    let soru="";if(enCok.length){try{const E=await ekParca(enCok[0],"a");const Q=((E.cocuk||{}).ayetler||[]).filter(a=>a.soru);if(Q.length)soru=Q[new Date().getDate()%Q.length].soru;}catch(e){}}
    const zorU=[];zor.forEach(z=>{if(!zorU.some(y=>y.s===z.s&&y.a===z.a))zorU.push(z);});
    const yanlis=Object.values(X.yanlis||{}).length;
    bolum.push(`<section class="detay"><h3>👤 ${esc(p.ad||"Adsız kişi")}${p.yas?` · ${p.yas} yaş`:""}</h3>
     <div class="ozet-satir"><div><b>${aktifGun}/7</b><span>gün çalıştı</span></div><div><b>${Math.round(top.dk)}</b><span>dakika</span></div><div><b>${top.dogru}/${top.soru}</b><span>doğru cevap</span></div><div><b>${top.tekrar}</b><span>ayet tekrarı</span></div><div><b>${top.hikaye}</b><span>hikâye</span></div></div>
     <p><b>En çok çalıştığı:</b> ${enCok.length?enCok.map(n=>esc(adBul(n))).join(", "):"Bu hafta henüz çalışmadı."}</p>
     <p><b>Zorlandığı ayetler:</b> ${zorU.length?zorU.slice(0,8).map(z=>`${esc(adBul(z.s))} ${z.a}`).join(" · "):"Ezberde zorlandığını söylediği ayet yok."}</p>
     ${yanlis?`<p><b>Yanlışlar defterinde:</b> ${yanlis} soru bekliyor.</p>`:""}
     ${soru?`<p style="font-size:18px"><b>Sofrada sorabileceğin soru:</b> ${esc(soru)}</p>`:""}
     <p style="font-size:14px">Mola uyarısı: ${(X.molaDk!==undefined?X.molaDk:(X.seviye==="kucuk"?20:X.seviye==="genc"?40:0))||"kapalı"}${(X.molaDk!==undefined?X.molaDk:(X.seviye==="kucuk"?20:X.seviye==="genc"?40:0))?" dakikada bir":""}</p></section>`);}
  V.innerHTML=`<button class="geri" id="eGeri">← Sureler</button><h2>👨‍👩‍👧 Haftalık ebeveyn özeti</h2>
  <p>Çocuğunuzun bu hafta neye çalıştığını ve nerede zorlandığını gösterir. Övgüyü emeğe yöneltin: "Bu hafta 4 gün çalıştın" demek, puandan daha çok işe yarar.</p>
  ${bolum.join("")||"<p>Henüz kayıtlı kişi yok.</p>"}
  <section class="detay"><h3>Mola ayarı (${esc((aktifKisi()||{}).ad||"bu kişi")} için)</h3><p style="display:flex;gap:6px;flex-wrap:wrap">${[[0,"Kapalı"],[15,"15 dk"],[20,"20 dk"],[30,"30 dk"],[45,"45 dk"]].map(([m,a])=>`<button data-mola="${m}" class="${molaDk()===m?"on":""}" aria-pressed="${molaDk()===m}" style="min-height:44px">${a}</button>`).join("")}</p></section>
  ${ebeveynAyarHtml()}`;
  $("eGeri").onclick=()=>anaSayfa();V.querySelectorAll("[data-mola]").forEach(b=>b.onclick=()=>{S.molaDk=+b.dataset.mola;save();ebeveynOzet();});ebeveynAyarBagla();window.scrollTo({top:0});}
/* ========== ÇOCUK ANLATIMI, GÜNLÜK KÜÇÜK İYİLİK, BEN OKUYAYIM ========== */
function cocukAnlatim(n){const A=((CUR&&CUR.ek&&CUR.ek.cocuk)||{}).ayetler||[];const x=A.find(a=>+a.ayet===+n);return x&&x.cocuk_anlatim||"";}
async function eylemSec(){const t=today();if(S.eylem&&S.eylem.gun===t)return S.eylem;
  const s=S.sonSure||1;let L=[];try{const E=await ekParca(s,"a");L=((E.cocuk||{}).eylem)||[];}catch(e){}
  if(!L.length)return null;const once=S.eylem;S.eylem={gun:t,s,metin:L[(new Date().getDate()+(S.eylemSay||0))%L.length]};
  if(once&&once.gun!==t&&once.durum===undefined)S.eylemSor=once;save();return S.eylem;}
async function eylemKartCiz(){const el=$("eylemKart");if(!el)return;const e=await eylemSec();const s=S.eylemSor;
  if(s){el.innerHTML=`<section class="detay aile-kart"><h3>🌼 Dün söz vermiştin</h3><p style="font-size:19px">"${esc(s.metin)}"</p><p><b>Yapabildin mi?</b></p>
   <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="primary" id="eyEvet">Evet, yaptım</button><button id="eyHayir">Bugün olmadı</button></div></section>`;
   $("eyEvet").onclick=()=>{S.cicek=(S.cicek||0)+1;S.eylemSay=(S.eylemSay||0)+1;s.durum="evet";delete S.eylemSor;save();efekt("gorev");kutla();toast("Maşallah! Bahçene bir çiçek açtı 🌼");eylemKartCiz();};
   $("eyHayir").onclick=()=>{s.durum="hayir";delete S.eylemSor;save();toast("Olsun, bugün yeniden deneyebilirsin");eylemKartCiz();};return;}
  if(!e){el.innerHTML="";return;}
  el.innerHTML=`<section class="detay aile-kart"><h3>🌱 Bugünün küçük iyiliği</h3><p style="font-size:19px"><b>${esc(e.metin)}</b></p><p style="font-size:14px">${esc(adBul(e.s))} suresinden. Yarın sana soracağız; yaptıysan bahçende bir çiçek açacak.</p></section>`;}
/* ben okuyayım: kendi sesini kaydet, sonra Alafasy ile karşılaştır */
let KAYIT=null;
async function benOku(i,btn,durum){
  if(KAYIT&&KAYIT.rec&&KAYIT.rec.state==="recording"){KAYIT.rec.stop();return;}
  if(!navigator.mediaDevices||!window.MediaRecorder){durum.textContent="Bu cihazda ses kaydı yapılamıyor.";return;}
  let st;try{st=await navigator.mediaDevices.getUserMedia({audio:true});}catch(e){durum.textContent="Mikrofon izni verilmedi. Sayfanın mikrofon kullanmasına izin verirsen kendi okuyuşunu dinleyebilirsin.";return;}
  if(KAYIT&&KAYIT.url)URL.revokeObjectURL(KAYIT.url);const parca=[];const rec=new MediaRecorder(st);KAYIT={rec};
  const bekci=setInterval(()=>{if(rec.state!=="recording"){clearInterval(bekci);return;}if(!btn.isConnected)rec.stop();},1000);   /* ekrandan çıkılırsa mikrofonu kapat */
  rec.ondataavailable=e=>{if(e.data.size)parca.push(e.data);};
  rec.onstop=()=>{st.getTracks().forEach(t=>t.stop());btn.textContent="🎙 Yeniden oku";btn.classList.remove("kayit");
    const url=URL.createObjectURL(new Blob(parca,{type:rec.mimeType||"audio/webm"}));KAYIT.url=url;
    durum.innerHTML=`<b>Önce kendi sesini, sonra Alafasy'yi dinle. Farkı duyuyor musun?</b><br><button id="kendim" class="dn">▶ Benim okuyuşum</button> <button id="hoca" class="dn">▶ Alafasy</button>`;
    const kendi=new Audio(url);$("kendim").onclick=()=>{durSes();kendi.currentTime=0;kendi.play();};
    $("hoca").onclick=()=>{kendi.pause();const b=CUR.ses.bas,e=i+1<b.length?b[i+1]:CUR.ses.son;hizUygula();calParca(CUR.no,b[i],e);};
    kendi.onended=()=>{const b=CUR.ses.bas,e=i+1<b.length?b[i+1]:CUR.ses.son;calParca(CUR.no,b[i],e);};kendi.play().catch(()=>{});};
  rec.start();btn.textContent="⏹ Bitirdim";btn.classList.add("kayit");durum.textContent="Ayeti şimdi sesli oku… Bitince düğmeye bas.";
  setTimeout(()=>{if(rec.state==="recording")rec.stop();},60000);}
/* ========== KİŞİ SEÇİMİ ========== */
function kisiSec(){CUR=null;baslik();setTabs();const V=$("view");$("baslik").textContent="Kim oynuyor?";$("altbaslik").textContent="Her kişinin puanı, yıldızları ve bahçesi ayrı tutulur";
  const L=PROF.liste;
  V.innerHTML=`<h2>Kim oynuyor?</h2>
  ${L.length?`<div class="sure-grid">${L.map(p=>`<button class="sure-kart ${p.id===PROF.aktif?"tam":""}" data-k="${p.id}"><span class="sad" style="font-size:22px">👤 ${esc(p.ad||"Adsız kişi")}</span><span class="sbilgi"><b>${p.yas?p.yas+" yaş · "+SEVIYE[yasSeviye(p.yas)].ad:"Yaşı girilmemiş"}</b></span></button>`).join("")}</div>`:"<p>Henüz kimse eklenmedi. Önce kendini ekle.</p>"}
  <section class="detay"><h3>${L.length?"Yeni kişi ekle":"Kendini ekle"}</h3>
  <p style="display:flex;gap:8px;flex-wrap:wrap;align-items:end"><label><b>Ad</b><br><input id="kAd" class="ara" maxlength="24" placeholder="Adın" style="min-width:180px"></label>
  <label><b>Yaş</b><br><input id="kYas" type="number" min="3" max="99" inputmode="numeric" style="min-height:44px;width:90px;font-size:18px"></label>
  <button class="primary" id="kEkle" style="font-size:18px">Ekle ve başla</button></p>
  <p style="font-size:14px">Ad ve yaş yalnız bu uygulamada, senin hesabında ve bu cihazda saklanır. Yaşa göre sorular ve görevler ayarlanır.</p></section>
  ${L.length?`<details><summary><b>Kişileri düzenle</b></summary>${L.map(p=>`<p style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"><input data-ad="${p.id}" class="ara" value="${esc(p.ad)}" maxlength="24" aria-label="${esc(p.ad||"Adsız kişi")}: ad" style="max-width:200px"><input data-yas="${p.id}" type="number" min="3" max="99" value="${p.yas||""}" aria-label="${esc(p.ad||"Adsız kişi")}: yaş" style="min-height:44px;width:80px"><button data-kay="${p.id}">Kaydet</button>${L.length>1?`<button data-sil="${p.id}">Listeden çıkar</button>`:""}</p>`).join("")}</details>`:""}`;
  V.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>kisiGec(b.dataset.k));
  $("kEkle").onclick=()=>{const ad=$("kAd").value.trim(),yas=+$("kYas").value;if(!ad){toast("Adını yaz");return;}if(!(yas>=3&&yas<=99)){toast("Yaşını yaz (3-99)");return;}
    const id=PROF.liste.some(p=>p.id==="p0")||PROF.liste.length?"p"+Date.now().toString(36):"p0";PROF.liste.push({id,ad,yas});profKaydet();kisiGec(id,true);};
  V.querySelectorAll("[data-kay]").forEach(b=>b.onclick=()=>{const p=PROF.liste.find(x=>x.id===b.dataset.kay);p.ad=V.querySelector(`[data-ad="${p.id}"]`).value.trim();p.yas=+V.querySelector(`[data-yas="${p.id}"]`).value||p.yas;profKaydet();if(p.id===PROF.aktif){S.seviye=yasSeviye(p.yas);save();}toast("Kaydedildi");kisiSec();});
  V.querySelectorAll("[data-sil]").forEach(b=>b.onclick=()=>{const p=PROF.liste.find(x=>x.id===b.dataset.sil);if(!confirmSil(p))return;PROF.liste=PROF.liste.filter(x=>x.id!==p.id);if(PROF.aktif===p.id)PROF.aktif=null;profKaydet();kisiSec();});
  window.scrollTo({top:0});}
function confirmSil(p){const b=document.querySelector(`[data-sil="${p.id}"]`);if(b.dataset.onay)return true;b.dataset.onay="1";b.textContent="Emin misin? Bir daha bas";return false;}
async function kisiGec(id,yeni){if(PROF.aktif&&PROF.aktif!==id){save();bulutGonder();}PROF.aktif=id;profKaydet();profYukle(id);const p=aktifKisi();if(p&&p.yas)S.seviye=yasSeviye(p.yas);sonPuan=S.puan;
  if(DB&&UID){docRef=null;const ref=DB.collection("data/users/"+UID).doc(docAdi(id));try{const istek=id,sn=await ref.get();if(PROF.aktif!==istek)return;const raw=sn&&sn.exists?sn.data():null;const rem=raw?normalize(JSON.parse(JSON.stringify(raw))):null;if(rem){S=normalize(birlestir(S,rem));if(p&&p.yas)S.seviye=yasSeviye(p.yas);}sonPuan=S.puan;docRef=ref;}catch(e){}}   /* okuma düşerse docRef boş kalır: yerel durum bulutun üstüne yazılmaz */
  save();toast(yeni?`Hoş geldin ${p.ad}!`:`${p.ad||"Kişi"} seçildi`);anaSayfa();}
function kisiDugme(){const p=aktifKisi();return p?`<button id="kisiDeg" style="min-height:44px">👤 ${esc(p.ad||"Adsız")}${p.yas?" · "+p.yas:""} · Değiştir</button>`:"";}
