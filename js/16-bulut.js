/* Sureler Oyun Bahçesi · Aile yarışması, ortak hedef, kullanım sayacı (bulut) */
/* Tahmin edilemeyen kod: karışan harfler (0,O,1,I,L) yok; 8 karakter ≈ 10^12 olasılık */
function rastgeleKod(n){const A="ABCDEFGHJKMNPQRSTUVWXYZ23456789",b=new Uint8Array(n);crypto.getRandomValues(b);let k="";for(const x of b)k+=A[x%A.length];return k;}
/* ========== AİLE YARIŞMASI (canlı oda), ORTAK HEDEF ve KULLANIM SAYACI (veritabanı) ========== */
let DB=null,USR=null,UID=null,ODA=null,USR_EDIT=false,USR_YAZ=null;
async function odaAl(){if(ODA!==null)return ODA;try{ODA=(window.claude&&claude.use)?await claude.use("room"):null;}catch(e){ODA=null;}return ODA;}
let YAR=null;
function yarSorular(){const Q=[];const kel=[],seen=new Set();CUR.ayetler.forEach(a=>a.w.forEach(w=>{if(!seen.has(w.a)&&w.tr){seen.add(w.a);kel.push(w);}}));
  const an=kel.map(w=>w.tr);shuffle(kel).slice(0,5).forEach(w=>Q.push({tur:"anlam",ar:w.a,ses:Array.isArray(w.k)?w.k:null,dogru:w.tr,opts:secenek(w.tr,an,3)}));
  const tum=[...new Set(CUR.ayetler.flatMap(a=>a.w.map(w=>w.a)))];
  shuffle(CUR.ayetler.map((a,i)=>i)).slice(0,3).forEach(ai=>{const a=CUR.ayetler[ai],k=Math.floor(Math.random()*a.w.length),h=a.w[k].a;
    Q.push({tur:"bosluk",kel:a.w.map(w=>w.a),k,dogru:h,opts:secenek(h,tum,3),ar:true});});
  Q.forEach(q=>{const d=q.opts.indexOf(q.dogru);const o=shuffle(q.opts.map((_,j)=>j).filter(j=>j!==d))[0];q.kolay=shuffle([d,o]);});
  return shuffle(Q);}
/* Yarışma sorusu ekrana yalnız veriden, kaçırılarak (esc) kurulur; ağdan HTML alınmaz */
function yarSoruHtml(q){if(!q)return "";if(q.tur==="anlam")return `<p>Bu kelimenin anlamı nedir?</p><div class="qbig ar" lang="ar">${esc(q.ar)}</div>`;
  if(q.tur==="bosluk"){const k=Number(q.k);return `<p>Boşluğa hangi kelime gelir?</p><div class="ayet-box ar" lang="ar">${(Array.isArray(q.kel)?q.kel:[]).map((w,j)=>j===k?'<span class="blank">؟</span>':esc(w)).join(" ")}</div>`;}return "";}
function yarBirak(){const Y=YAR;if(!Y)return;YAR=null;try{if(Y.host){clearInterval(Y.tik);Y.durum="bitti";Y.R.emit("durum",{kod:Y.kod,sure:Y.sure,durum:"bitti",i:Y.i,n:Y.Q.length,opts:[],takim:Y.takim?{p:Y.tp,c:Y.tc,n:Y.Q.length}:null,skor:Y.takim?[]:Object.entries(Y.puan).map(([p,n])=>[Y.ad[p]||"Oyuncu",n,p])}).catch(()=>{});}Y.R.leave().catch(()=>{});}catch(e){}}
window.addEventListener("pagehide",()=>yarBirak());
const TAKIM_HEDEF=6;
function yarTakimHtml(t){if(!t)return "";const c=Number(t.c)||0,n=Number(t.n)||0;return `<div class="detay aile-kart"><p style="font-size:20px"><b>👪 Aile puanı: ${Number(t.p)||0}</b></p><p>Ailece bilinen soru: <b>${c} / ${n}</b> · Hedef: ${TAKIM_HEDEF}${c>=TAKIM_HEDEF?" · <b>Hedefe ulaştınız, maşallah!</b>":""}</p></div>`;}
function yarSkor(){if(YAR.takim)return "";return Object.entries(YAR.puan).sort((a,b)=>b[1]-a[1]).map(([p,n])=>`<li><b>${esc(YAR.ad[p]||"Oyuncu")}</b> · ${Number(n)||0} puan</li>`).join("")||"<li>Henüz katılan yok</li>";}
async function yarAc(){const V=$("view"),oda=await odaAl();
  if(!oda){V.innerHTML=`<p>Canlı yarışma için buluta bağlanılamadı. İnternet bağlantını denetleyip sayfayı yenile.</p><button class="geri" id="yG">← Geri</button>`;$("yG").onclick=()=>show("harita");return;}
  const kod=rastgeleKod(8);let R;try{R=await oda.join("yaris-"+kod);}catch(e){toast("Oda açılamadı");return;}
  YAR={kod,R,host:true,Q:yarSorular(),i:-1,durum:"bekle",puan:{},ad:{},cevap:{},sure:CUR.ad,takim:true,tp:0,tc:0};
  R.onPeers(()=>{R.peers().forEach(p=>{if(p.isMe)return;const pr=p.presence||{};if(pr.ad){YAR.ad[p.peer]=pr.ad;if(YAR.puan[p.peer]===undefined)YAR.puan[p.peer]=0;}
    if(pr.c&&YAR.durum==="soru"&&pr.c.q===YAR.i&&YAR.cevap[p.peer]===undefined)YAR.cevap[p.peer]=pr.c.j;});yarCiz();});
  YAR.tik=setInterval(()=>{if(YAR&&YAR.host)yarYay();},2500);yarCiz();}
function yarYay(){const Y=YAR,q=Y.Q[Y.i];Y.R.emit("durum",{kod:Y.kod,sure:Y.sure,durum:Y.durum,i:Y.i,n:Y.Q.length,tur:q?q.tur:"",soruAr:q&&q.ar&&q.tur==="anlam"?q.ar:"",kel:q&&q.kel?q.kel:[],k:q&&q.k!==undefined?q.k:-1,opts:q?q.opts:[],ar:q?q.tur==="bosluk":false,dogru:Y.durum==="sonuc"&&q?q.dogru:null,kolay:q&&q.kolay?q.kolay:[],ses:q&&q.ses?q.ses:[],takim:Y.takim?{p:Y.tp,c:Y.tc,n:Y.Q.length}:null,skor:Y.takim?[]:Object.entries(Y.puan).map(([p,n])=>[Y.ad[p]||"Oyuncu",n,p])}).catch(()=>{});}
function yarCiz(){const Y=YAR,V=$("view");if(!Y||!Y.host)return;const q=Y.Q[Y.i];const cevapSay=Object.keys(Y.cevap).length,oyuncu=Object.keys(Y.ad).length;
  V.innerHTML=`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="geri" id="yKapat">← Yarışmayı kapat</button></div>
  <h2>👪 Aile yarışması · ${esc(Y.sure)}</h2>
  <p style="font-size:20px">Katılım kodu: <b style="font-size:40px;letter-spacing:6px">${Y.kod}</b></p>
  <p>Oyuncular bu sayfayı kendi telefonlarında açıp ana sayfadaki <b>Aile yarışmasına katıl</b> düğmesine basar ve kodu yazar.</p>
  ${Y.durum==="bekle"?`<p><b>${oyuncu} oyuncu katıldı.</b></p><p style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"><b>Oyun biçimi:</b><button data-tk="1" class="${Y.takim?"on":""}">👪 Aile takımı (ortak puan)</button><button data-tk="0" class="${Y.takim?"":"on"}">Herkes kendi puanına</button></p>
   <p style="font-size:14px">${Y.takim?`Herkesin doğrusu ortak puana yazılır; sıralama yok. Hedef: ${Y.Q.length} sorunun ${TAKIM_HEDEF}'sını ailece bilmek.`:"Her oyuncunun puanı ayrı tutulur ve sıralama gösterilir."} Küçük yaştaki oyunculara iki şık ve sesli kelime gelir.</p>
   <button class="primary" id="yBasla" ${oyuncu?"":"disabled"} style="font-size:20px">Başlat</button>`:""}
  ${q&&Y.durum!=="bitti"?`<div class="qhead"><span>Soru ${Y.i+1} / ${Y.Q.length}</span><span>${cevapSay} / ${oyuncu} cevap</span></div>${yarSoruHtml(q)}
   <div class="opts ${q.tur==="bosluk"?"ar-opts":""}">${q.opts.map(o=>`<button disabled ${q.tur==="bosluk"?'lang="ar"':""} class="${Y.durum==="sonuc"&&o===q.dogru?"ok":""}">${esc(o)}</button>`).join("")}</div>
   ${Y.durum==="soru"?`<button class="primary" id="yGoster">Cevabı göster</button>`:`<button class="primary" id="ySonraki">${Y.i+1<Y.Q.length?"Sonraki soru":"Sonuçlar"}</button>`}`:""}
  ${Y.durum==="bitti"?`<h2>Sonuç</h2>`:""}${Y.takim?yarTakimHtml({p:Y.tp,c:Y.tc,n:Y.Q.length}):`<h3>Puan tablosu</h3><ol style="font-size:19px">${yarSkor()}</ol>`}`;
  V.querySelectorAll("[data-tk]").forEach(b=>b.onclick=()=>{Y.takim=b.dataset.tk==="1";yarYay();yarCiz();});
  $("yKapat").onclick=()=>{yarBirak();show("harita");};
  const b=$("yBasla");if(b)b.onclick=()=>{Y.i=0;Y.durum="soru";Y.cevap={};yarYay();yarCiz();efekt("seri");};
  const g=$("yGoster");if(g)g.onclick=()=>{Y.durum="sonuc";let bilen=0;Object.entries(Y.cevap).forEach(([p,j])=>{if(q.opts[j]===q.dogru){Y.puan[p]=(Y.puan[p]||0)+10;bilen++;}});Y.tp+=bilen*10;if(bilen)Y.tc++;yarYay();yarCiz();efekt("dogru");};
  const s=$("ySonraki");if(s)s.onclick=()=>{if(Y.i+1<Y.Q.length){Y.i++;Y.durum="soru";Y.cevap={};}else{Y.durum="bitti";kutla();efekt("gorev");}yarYay();yarCiz();};}
async function yarKatil(){const V=$("view");CUR=null;baslik();setTabs();$("baslik").textContent="Aile yarışması";
  const oda=await odaAl();if(!oda){V.innerHTML=`<p>Canlı yarışma için buluta bağlanılamadı. İnternet bağlantını denetleyip sayfayı yenile.</p><button class="geri" id="yG">← Sureler</button>`;$("yG").onclick=()=>anaSayfa();return;}
  let ad="";try{ad=localStorage.getItem("yaris-ad")||"";}catch(e){}
  V.innerHTML=`<button class="geri" id="yG">← Sureler</button><h2>👪 Aile yarışmasına katıl</h2>
  <p><label><b>Adın</b><br><input id="yAd" class="ara" value="${esc(ad)}" maxlength="20" placeholder="Adını yaz"></label></p>
  <p><label><b>Katılım kodu</b><br><input id="yKod" class="ara" maxlength="8" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="8 harfli kod" style="text-transform:uppercase;letter-spacing:2px"></label></p><button class="primary" id="yGir" style="font-size:20px">Katıl</button>`;
  $("yG").onclick=()=>anaSayfa();
  $("yGir").onclick=async()=>{const a=$("yAd").value.trim().slice(0,20),k=$("yKod").value.trim().toUpperCase().replace(/\s/g,"");if(!a||!/^[A-Z2-9]{8}$/.test(k)){toast("Adını ve 8 harfli kodu yaz");return;}
    try{localStorage.setItem("yaris-ad",a);}catch(e){}
    let R;try{R=await oda.join("yaris-"+k);}catch(e){toast("Katılamadım, kodu denetle");return;}
    YAR={host:false,R,kod:k,ad:a,son:null,secim:{}};R.presence({ad:a}).catch(()=>{});
    V.innerHTML=`<h2>👪 ${esc(a)}, yarışmaya katıldın</h2><div id="yEkran"><p>Sunucunun başlatmasını bekliyoruz…</p></div><button class="geri" id="yCik">Yarışmadan çık</button>`;
    $("yCik").onclick=()=>{yarBirak();anaSayfa();};
    R.on("durum",m=>{if(!YAR||YAR.host||m.isMe)return;yarOyuncuCiz(m.data||{});});};}
function yarOyuncuCiz(d){const Y=YAR,E=$("yEkran");if(!E||!d||typeof d!=="object")return;d.opts=Array.isArray(d.opts)?d.opts.map(String):[];d.i=Number(d.i)||0;d.n=Number(d.n)||0;const ar=d.tur==="bosluk";const sh=yarSoruHtml({tur:d.tur,ar:d.soruAr,kel:d.kel,k:d.k});const imza=d.durum+"|"+d.i;const skor=(Array.isArray(d.skor)?d.skor:[]).filter(Array.isArray).sort((a,b)=>(Number(b[1])||0)-(Number(a[1])||0));
  const benim=skor.find(s=>s[2]===undefined);
  if(Y.son===imza&&d.durum!=="bekle")return;Y.son=imza;
  if(d.durum==="bekle"){E.innerHTML=`<p>Sunucunun başlatmasını bekliyoruz… (${esc(d.sure||"")})</p>`;return;}
  const tablo=d.takim&&typeof d.takim==="object"?yarTakimHtml(d.takim):`<h3>Puan tablosu</h3><ol style="font-size:18px">${skor.map(s=>`<li><b>${esc(String(s[0]))}</b> · ${Number(s[1])||0}</li>`).join("")}</ol>`;
  const kolay=kucuk()&&Array.isArray(d.kolay)&&d.kolay.length===2?d.kolay.map(Number).filter(j=>j>=0&&j<d.opts.length):null;
  const gor=j=>!kolay||kolay.includes(j);const sesVar=Array.isArray(d.ses)&&d.ses.length===3&&d.ses.every(x=>typeof x==="number");
  if(d.durum==="bitti"){E.innerHTML=`<h2>Yarışma bitti</h2>${tablo}`;kutla();return;}
  if(d.durum==="soru"){E.innerHTML=`<div class="qhead"><span>Soru ${d.i+1} / ${d.n}</span></div>${sh}${sesVar?`<button class="dn" id="ySes" style="font-size:18px">🎧 Kelimeyi dinle</button>`:""}<div class="opts ${ar?"ar-opts":""}" ${kolay?'data-buyuk="1"':""}>${d.opts.map((o,j)=>gor(j)?`<button data-j="${j}" ${ar?'lang="ar"':""}>${esc(o)}</button>`:"").join("")}</div><p class="feedback" id="yFb"></p>`;
    E.querySelectorAll("[data-j]").forEach(b=>b.onclick=()=>{Y.secim[d.i]=+b.dataset.j;E.querySelectorAll("[data-j]").forEach(x=>{x.disabled=true;});b.classList.add("on");$("yFb").textContent="Cevabın gönderildi";Y.R.presence({ad:Y.ad,c:{q:d.i,j:+b.dataset.j}}).catch(()=>{});});
    const sb=$("ySes");if(sb)sb.onclick=()=>kelimeSes({k:d.ses.map(Number)});if(sb&&kucuk())setTimeout(()=>sb.click(),300);return;}
  if(d.durum==="sonuc"){const j=Y.secim[d.i],ok=j!==undefined&&d.opts[j]===d.dogru;efekt(ok?"dogru":"yanlis");if(ok)gorevIsle("soru");
    E.innerHTML=`${sh}<div class="opts ${ar?"ar-opts":""}">${d.opts.map((o,k)=>gor(k)?`<button disabled ${ar?'lang="ar"':""} class="${o===d.dogru?"ok":k===j?"bad":""}">${esc(o)}</button>`:"").join("")}</div><p class="feedback ${ok?"ok":"bad"}"><b>${ok?(d.takim?"Doğru! Aile puanına +10":"Doğru! +10"):j===undefined?"Cevap vermedin":"Doğrusu: "+esc(String(d.dogru||""))}</b></p>${tablo}`;}}

/* --- ortak hedef ---
   Her hedef tek belgedir: hedef/{kod} = {ad, hedef, tur, t, u_<kişi>: katkı}. Sayfa yalnız katıldığın hedeflerin belgelerini okur
   (bütün koleksiyonu taramaz); her kişi yalnız kendi u_ alanını günceller. */
const hSayi=v=>{v=Math.floor(Number(v));return isFinite(v)&&v>0?Math.min(v,100000):0;};
async function hedefGetir(kod){if(!DB)return null;try{const s=await DB.collection("hedef").doc(kod).get();return s&&s.exists?{id:kod,...s.data()}:null;}catch(e){return null;}}
function hedefToplam(h){let t=0,k=0;Object.keys(h||{}).forEach(x=>{if(x.startsWith("u_")){const n=hSayi(h[x]);t+=n;if(n>0||x==="u_"+UID)k++;}});return {t,k};}
let hedefYazT=null,hedefDegisen=new Set();
function hedefIsle(tur){const H=S.hedefler||{};Object.entries(H).forEach(([kod,h])=>{if(h.tur===tur){h.n=(h.n||0)+1;hedefDegisen.add(kod);}});
  if(hedefDegisen.size&&DB&&UID&&!hedefYazT)hedefYazT=setTimeout(hedefGonder,20000);}
function hedefGonder(){clearTimeout(hedefYazT);hedefYazT=null;if(!DB||!UID)return;const H=S.hedefler||{};
  [...hedefDegisen].forEach(kod=>{const n=hSayi((H[kod]||{}).n),ref=DB.collection("hedef").doc(kod);if(typeof ref.update==="function")ref.update({["u_"+UID]:n}).catch(()=>{});});hedefDegisen.clear();}
document.addEventListener("visibilitychange",()=>{if(document.hidden&&hedefDegisen.size)hedefGonder();});
window.addEventListener("pagehide",()=>{if(hedefDegisen.size)hedefGonder();});
async function hedefSayfa(){CUR=null;baslik();setTabs();$("baslik").textContent="Ortak hedef";$("altbaslik").textContent="Aile ya da sınıfça birlikte ulaşılan hedef";
  const V=$("view");V.innerHTML=`<p class="yukleniyor">Yükleniyor…</p>`;
  if(!DB){V.innerHTML=`<button class="geri" id="hG">← Sureler</button><p>Ortak hedef için buluta bağlanılamadı. İnternet bağlantını denetleyip sayfayı yenile.</p>`;$("hG").onclick=()=>anaSayfa();return;}
  const yaz=USR_YAZ;const H=S.hedefler||{};
  if(!hedefSayfa.ilk){hedefSayfa.ilk=1;Object.keys(H).forEach(k=>hedefDegisen.add(k));}  /* eski sürümden kalan katkıları bir kez taşı */
  if(hedefDegisen.size)hedefGonder();
  const L=(await Promise.all(Object.keys(H).map(hedefGetir))).filter(Boolean);
  V.innerHTML=`<button class="geri" id="hG">← Sureler</button><h2>🤝 Ortak hedef</h2>
  <p>Aile ya da sınıf birlikte bir hedef koyar: örneğin "Bu hafta hep birlikte 100 ayet tekrarı". Herkesin katkısı toplanır; sıralama yoktur, hedefe birlikte ulaşılır.</p>
  ${yaz===false?`<p class="detay"><b>Bu sayfayı yalnız görüntüleyebiliyorsun.</b> Ortak hedefe katkı vermek için sayfanın sahibi seni paylaşım menüsünden <b>Katkıda bulunan</b> olarak eklemeli.</p>`:""}
  ${L.map(h=>{const hd=Math.max(1,hSayi(h.hedef)),{t,k}=hedefToplam(h),y=Math.min(100,Math.round(t/hd*100));return `<section class="detay"><h3>${esc(h.ad)}</h3><div class="bar" style="height:16px"><i style="width:${y}%"></i></div><p><b>${t} / ${hd}</b> ${h.tur==="tekrar"?"ayet tekrarı":"doğru cevap"} · ${k} kişi katıldı · Benim katkım: <b>${hSayi((H[h.id]||{}).n)}</b> · Kod: <b>${esc(h.id)}</b>${t>=hd?" · <b>Hedefe ulaşıldı, maşallah!</b>":""}</p></section>`;}).join("")||"<p>Henüz bir hedefe katılmadın.</p>"}
  <h3>Bir hedefe katıl</h3><p><input id="hKod" class="ara" maxlength="8" placeholder="Hedef kodu" aria-label="Hedef kodu"> <button class="primary" id="hKatil">Katıl</button></p>
  <h3>Yeni hedef koy</h3><p><input id="hAd" class="ara" maxlength="40" placeholder="Hedefin adı (ör. Yılmaz ailesi Ekim hedefi)" aria-label="Hedefin adı"></p>
  <p style="display:flex;gap:8px;flex-wrap:wrap"><select id="hTur" aria-label="Hedef türü" style="min-height:44px;font-size:17px"><option value="tekrar">Ayet tekrarı</option><option value="soru">Doğru cevap</option></select><input id="hSay" type="number" min="10" max="10000" value="100" aria-label="Hedef sayısı" style="min-height:44px;width:120px;font-size:17px"><button class="primary" id="hKoy">Hedefi koy</button></p>`;
  $("hG").onclick=()=>anaSayfa();
  $("hKatil").onclick=async()=>{const k=$("hKod").value.trim().toUpperCase();if(!/^[A-Z0-9]{4,8}$/.test(k)){toast("Hedef kodunu denetle");return;}const h=await hedefGetir(k);if(!h){toast("Bu kodla bir hedef bulunamadı");return;}
    S.hedefler=S.hedefler||{};S.hedefler[k]=S.hedefler[k]||{tur:h.tur,n:0};save();hedefDegisen.add(k);hedefGonder();toast("Hedefe katıldın");hedefSayfa();};
  $("hKoy").onclick=async()=>{const ad=$("hAd").value.trim(),n=Math.max(10,Math.min(10000,Math.round(+$("hSay").value)||100)),tur=$("hTur").value;if(!ad){toast("Hedefe bir ad ver");return;}
    const kod=rastgeleKod(8);
    try{await DB.collection("hedef").doc(kod).set({ad,hedef:n,tur,t:today()});}catch(e){toast("Hedef kaydedilemedi: bu sayfada yazma iznin yok");return;}
    S.hedefler=S.hedefler||{};S.hedefler[kod]={tur,n:0};save();hedefDegisen.add(kod);hedefGonder();toast("Hedef kondu. Kodu ailene ya da sınıfına ver: "+kod);hedefSayfa();};}

/* --- kullanım sayacı (adsız: yalnız bölüm adı ve sayı) --- */
let sayacT=null;
function sayacIsle(bolum){const t=today();S.kullanim=S.kullanim||{};const g=S.kullanim[t]=S.kullanim[t]||{};g[bolum]=(g[bolum]||0)+1;
  const ks=Object.keys(S.kullanim).sort();while(ks.length>91)delete S.kullanim[ks.shift()];
  if(DB&&UID&&!sayacT)sayacT=setTimeout(sayacGonder,600000);}
function sayacGonder(){clearTimeout(sayacT);sayacT=null;if(!DB||!UID||!S.kullanim)return;const j=JSON.stringify(S.kullanim);if(j===sayacGonder.son)return;sayacGonder.son=j;DB.collection("kullanim").doc(UID).set({g:S.kullanim,s:S.seviye||""}).catch(()=>{sayacGonder.son="";});}
/* sayfa gizlenince ya da kapanınca bekleyen bulut yazmalarını hemen gönder */
document.addEventListener("visibilitychange",()=>{if(document.hidden){bulutGonder();sayacGonder();}});
window.addEventListener("pagehide",()=>{bulutGonder();sayacGonder();});
