/* Sureler Oyun Bahçesi · Namaz duaları: okuma, üç oyun (sırala, eksik kelime, anlam), aralıklı ezber, namaz yolu durumu ve ana sayfa kartı */
/* İçerik data/dualar.json'dan gelir. Kişinin durumu S.dualar[id] = {okundu:"YYYY-AA-GG", oyun:{sirala,eksik,anlam}, ezber:{kutu,sonraki}}.
   birlestir() bu alanı genel kurallarla birleştirir: tarih (okundu) yenisi, boolean (oyun) "ya da", {kutu,sonraki} kutusu büyük olan. */
const DUA_LISTE=[["subhaneke","Sübhâneke"],["ettehiyyatu","Ettehiyyâtü"],["salli","Allâhümme salli"],["barik","Allâhümme bârik"],["rabbena","Rabbenâ âtinâ"],["rabbenagfirli","Rabbenağfirlî"],["kunut","Kunut duaları"]];
const DUA_OYUN=[["sirala","Sırala","list-ordered"],["eksik","Eksik kelimeyi bul","puzzle"],["anlam","Anlamını bul","brain"]];
let DUALAR=null;
async function duaYukle(){if(DUALAR)return DUALAR;
  try{const r=await fetch("data/dualar.json?v="+SURUM);if(r&&r.ok){const d=await r.json();if(d&&Array.isArray(d.dualar))DUALAR=d;}}catch(e){}
  return DUALAR;}
const duaBul=id=>DUALAR&&DUALAR.dualar.find(d=>d.id===id)||null;
/* okuma için (kayıt oluşturmaz) ve yazma için (eksik alanları açar) */
const duaKayit=id=>((S.dualar||{})[id])||{};
const duaS=id=>{if(!S.dualar||typeof S.dualar!=="object")S.dualar={};const d=S.dualar[id]=S.dualar[id]||{};if(!d.oyun||typeof d.oyun!=="object")d.oyun={};return d;};
const duaEzberde=id=>ezbTam(duaKayit(id).ezber);
const duaEzberSay=()=>DUA_LISTE.filter(([id])=>duaEzberde(id)).length;
const duaVadeli=id=>{const e=duaKayit(id).ezber;return !!e&&e.kutu>=0&&!!e.sonraki&&e.sonraki<=today();};
const duaGunEkle=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.toLocaleDateString("sv-SE");};
const duaTarih=s=>String(s||"").split("-").reverse().join(".");
const duaAd=id=>{const d=duaBul(id);if(d)return d.ad;const x=DUA_LISTE.find(([k])=>k===id);return x?x[1]:id;};

/* ---------- cihaz sesi (kâri sesi yok): yalnız cihazda Arapça ses varsa ---------- */
function duaArSes(){try{if(!("speechSynthesis" in window)||typeof SpeechSynthesisUtterance==="undefined")return null;const V=speechSynthesis.getVoices()||[];
  return V.find(v=>/^ar[-_]SA/i.test(v.lang))||V.find(v=>/^ar/i.test(v.lang))||null;}catch(e){return null;}}
function duaSoyle(metin){try{try{KEL.pause();}catch(e){}durSes();speechSynthesis.cancel();const v=duaArSes();if(!v)return;
  const u=new SpeechSynthesisUtterance(metin);u.lang="ar-SA";u.voice=v;u.rate=kucuk()?0.6:0.75;speechSynthesis.speak(u);}catch(e){}}
const DUA_SES_NOT="Bu, cihazının yapay sesidir; her harfi doğru söylemeyebilir. Doğru okunuşu bir büyüğünden ya da hocandan dinle.";
function duaSesHtml(d){if(!duaArSes())return "";
  return `<div class="esnek ara-2 sarmal dik-orta"><button class="dn" data-duases="hepsi">${ikon("volume-2")} Dinle (cihaz sesi)</button><span class="kucuk-yazi">${esc(DUA_SES_NOT)}</span></div>`;}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-duases]");if(!b)return;const d=duaBul(duaAc.id);if(!d)return;
  const k=b.dataset.duases;duaSoyle(k==="hepsi"?d.cumleler.map(c=>c.ar).join(" ، "):(d.cumleler[+k]||{}).ar||"");});

/* ---------- liste ---------- */
function duaDurumYazi(id){const x=duaKayit(id),e=x.ezber;
  if(ezbTam(e))return "✓ Ezberde";
  if(e&&e.kutu>=0)return `Ezber ${e.kutu+1}/${EZ_TAM_KUTU+1}${duaVadeli(id)?" · bugün tekrar":""}`;
  if(x.okundu)return "Okundu";return "Yeni";}
async function dualarSayfa(){CUR=null;baslik();setTabs();try{durSes();}catch(e){}const ekran=EKRAN_NO;
  $("baslik").textContent="Namaz duaları";$("altbaslik").textContent="Namazda okunan duaları oku, oyna, ezberle";
  try{sayacIsle("dualar");}catch(e){}
  const V=$("view");V.innerHTML=`<p class="yukleniyor">Dualar hazırlanıyor…</p>`;
  await duaYukle();if(ekran!==EKRAN_NO)return;
  if(!DUALAR){V.innerHTML=`<button class="geri" id="duaG">${ikon("arrow-left")}Sureler</button><p>Dualar yüklenemedi. İnternet bağlantını denetleyip yeniden dene.</p>`;$("duaG").onclick=()=>anaSayfa();return;}
  const n=duaEzberSay(),N=DUALAR.dualar.length,bekleyen=DUALAR.dualar.filter(d=>duaVadeli(d.id));
  V.innerHTML=`<button class="geri" id="duaG">${ikon("arrow-left")}Sureler</button>
  <h2>${ikon("moon-star")} Namaz duaları</h2>
  <p>${kucuk()?"Namazda okuduğumuz duaları burada öğreniyoruz. Bir duaya dokun, oku, oyna, sonra ezberle.":"Namazda okunan duaları cümle cümle oku, anlamını öğren, oyunlarla pekiştir ve aralıklı tekrarla ezberle."} <b>${n} / ${N} dua ezberde.</b></p>
  <div class="bar" aria-hidden="true"><i style="width:${n/N*100}%"></i></div>
  ${bekleyen.length?`<p class="odak" role="note"><b>Bugün tekrar zamanı:</b> ${bekleyen.map(d=>esc(d.ad)).join(", ")}</p>`:""}
  <div class="sure-grid">${DUALAR.dualar.map(d=>`<button class="sure-kart ${duaEzberde(d.id)?"tam":""}" data-dua-ac="${esc(d.id)}"><span class="ust"><span class="sno">${esc(d.ayet||"Namazda")}</span><span class="yild"><b>${esc(duaDurumYazi(d.id))}</b></span></span><span class="sar" lang="ar" dir="rtl">${esc(d.adAr)}</span><span class="sad">${esc(d.ad)}</span><span class="sbilgi">${esc(d.yer.cocuk)}</span></button>`).join("")}</div>
  <p class="kucuk-yazi">Dualar Hanefî mezhebine göre, Türkiye’de yaygın okunuşuyla verildi. Kaynaklar her duanın “Büyükler için” bölümünde.</p>`;
  $("duaG").onclick=()=>anaSayfa();}

/* ---------- dua ekranı ---------- */
const duaKelimeHtml=(w,anlam)=>anlam?w.map((x,j)=>`<span class="k${j%12}">${esc(x.tr)}</span>`).join(""):w.map((x,j)=>`<span class="k${j%12}">${esc(x.a)}</span>`).join("");
async function duaAc(id){CUR=null;baslik();setTabs();try{durSes();}catch(e){}const ekran=EKRAN_NO;
  const V=$("view");if(!DUALAR){V.innerHTML=`<p class="yukleniyor">Dua hazırlanıyor…</p>`;await duaYukle();if(ekran!==EKRAN_NO)return;}
  const d=duaBul(id);if(!d){dualarSayfa();return;}
  duaAc.id=id;duaAc.gizli=!!duaAc.gizli&&duaAc.sonId===id;duaAc.sonId=id;
  $("baslik").textContent=d.ad;$("altbaslik").textContent=(d.ayet?d.ayet+" · ":"")+d.cumleler.length+" cümle";
  const x=duaKayit(id),e=x.ezber||{kutu:-1},k1=kucuk(),m1=minik(),gz=duaAc.gizli;
  const okBugun=x.okundu===today();
  let sonParca=0;
  const cumle=(c,i)=>{let bas="";if(c.parca&&c.parca!==sonParca){sonParca=c.parca;bas=`<h3>${esc((d.parcalar||[])[c.parca-1]||c.parca+". kısım")}</h3>`;}
    return bas+`<div class="read-ayet" id="dc${i}"><div class="esnek iki-yana dik-orta ara-2 sarmal"><span class="n-ayet">${i+1}</span>${duaArSes()?`<button class="dn" data-duases="${i}" aria-label="${i+1}. cümleyi cihaz sesiyle dinle">${ikon("volume-2")} Dinle</button>`:""}</div>
    <div class="kelimeler" lang="ar" dir="rtl">${gz?c.w.map(()=>`<span class="renk-asil" aria-hidden="true">؟</span>`).join("")+`<span class="gorunmez" lang="tr" dir="ltr">Metin gizli</span>`:duaKelimeHtml(c.w)}</div>
    ${!k1&&!gz?`<div class="anlamlar">${duaKelimeHtml(c.w,true)}</div>`:""}
    ${gz?"":`<div class="okunus">${esc(c.ok)}</div>`}<p class="meal">${esc(c.tr)}</p>
    ${k1&&!m1&&!gz?`<details><summary class="kucuk-yazi">Kelime kelime</summary><div class="anlamlar">${duaKelimeHtml(c.w,true)}</div></details>`:""}</div>`;};
  const oyunlar=m1?"":`<section class="detay"><h3>${ikon("gamepad-2")} Oyunlar</h3><div class="esnek ara-2 sarmal">${DUA_OYUN.map(([k,a,ik])=>`<button data-duaoyun="${k}" class="dokun44 ${x.oyun&&x.oyun[k]?"on":""}">${x.oyun&&x.oyun[k]?"✓ ":ikon(ik)+" "}${a}</button>`).join("")}</div></section>`;
  const vadeli=e.kutu<0||!e.sonraki||e.sonraki<=today();
  const ezberPanel=`<section class="odak" aria-label="Ezber"><h3>${ikon("brain")} Ezber${ezbTam(e)?" · ✓ ezberde":""}</h3>
    <p class="m0">${e.kutu<0?(k1?"Duayı birkaç kez oku. Sonra metni gizleyip aklından söyle.":"Duayı birkaç kez oku, sonra metni gizleyip aklından söylemeyi dene."):`Basamak ${e.kutu+1} / ${EZ_TAM_KUTU+1}. ${vadeli?"Bugün tekrar günü.":`Sıradaki tekrar: ${duaTarih(e.sonraki)}.`}`}
    ${k1?"":` ${EZ_TAM_KUTU+1}. basamağa ulaşan (${EZ_ARALIK[EZ_TAM_KUTU-1]} gün sonra da hatırlanan) dua ezberde sayılır.`}</p>
    <div class="esnek ara-2 sarmal ust-2"><button id="duaGizle" class="dokun44 ${gz?"on":""}" aria-pressed="${gz}">${gz?"Metni göster":"Metni gizle"}</button>
    <button class="primary" data-duaezber="2">Hatırladım</button><button data-duaezber="1">Zorlandım</button></div></section>`;
  V.innerHTML=`<button class="geri" id="duaG">${ikon("arrow-left")}Dualar</button>
  <h2>${esc(d.ad)} <span class="ar" lang="ar" dir="rtl">${esc(d.adAr)}</span></h2>
  <p><b>Nerede okunur?</b> ${esc(d.yer.cocuk)}</p>
  ${duaSesHtml(d)}
  ${d.cumleler.map(cumle).join("")}
  ${d.ek&&!gz?`<details class="detay"><summary><b>${esc(d.ek.baslik)}</b></summary><div class="ar" lang="ar" dir="rtl" style="font-size:var(--ar-2)">${esc(d.ek.ar)}</div><div class="okunus">${esc(d.ek.ok)}</div><p class="meal">${esc(d.ek.tr)}</p></details>`:""}
  <div class="esnek ara-2 sarmal"><button class="primary${k1?" yazi-4":""}" id="duaOkudum" ${okBugun?"disabled":""}>${okBugun?"✓ Bugün okudun":"Okudum"}</button></div>
  ${oyunlar}${ezberPanel}
  <details class="detay"><summary><b>Büyükler için</b></summary><p>${esc(d.yer.ebeveyn)}</p>${d.ayet?`<p>Bu dua Kur'an’dan bir ayettir: ${esc(d.ayet)}.</p>`:""}
   <p class="kucuk-yazi">Türkçe anlamlar çocuklar için sadeleştirildi. Kaynak: ${(d.kaynak||[]).map(u=>`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(u.replace(/^https?:\/\//,"").split("/")[0])}</a>`).join(" · ")}</p></details>`;
  $("duaG").onclick=()=>{duaAc.gizli=false;try{speechSynthesis.cancel();}catch(e){}dualarSayfa();};
  $("duaGizle").onclick=()=>{duaAc.gizli=!gz;duaAc(id);};
  $("duaOkudum").onclick=()=>duaOkudum(id);
  V.querySelectorAll("[data-duaoyun]").forEach(b=>b.onclick=()=>{const k=b.dataset.duaoyun;if(k==="sirala")duaSirala(id);else if(k==="eksik")duaEksik(id);else duaAnlam(id);});
  V.querySelectorAll("[data-duaezber]").forEach(b=>b.onclick=()=>duaEzberIsle(id,+b.dataset.duaezber));
  /* sesler sayfa açıldıktan sonra gelebilir: Arapça ses o an bulunursa ekranı bir kez yeniden çiz */
  if(!duaArSes()&&!duaAc.sesDinle){try{if(typeof speechSynthesis!=="undefined"&&typeof speechSynthesis.addEventListener==="function"){duaAc.sesDinle=true;speechSynthesis.addEventListener("voiceschanged",()=>{const V2=$("view");if(duaArSes()&&V2&&V2.querySelector("#duaOkudum")&&!V2.querySelector("[data-duases]"))duaAc(duaAc.id);});}}catch(e){}}
}
function duaOkudum(id){const x=duaS(id),t=today();if(x.okundu===t)return;const ilk=!x.okundu;x.okundu=t;
  gun();S.puan+=ilk?10:2;logIsle("soru");checkBadges();save();renderStats();
  if(minik()){toast("⭐ Aferin!");try{if(trSesVar())soyle("Aferin!");}catch(e){}}else toast(ilk?`${duaAd(id)} duasını okudun, 10 puan`:"Bugün de okudun, 2 puan");
  try{efekt("dogru");}catch(e){}const b=$("duaOkudum");if(b){b.disabled=true;b.textContent="✓ Bugün okudun";}}

/* ---------- ezber: js/01'deki tek takvim (EZ_ARALIK) ve ezbTam ile ---------- */
function duaEzberIsle(id,not){const x=duaS(id),p=x.ezber&&typeof x.ezber==="object"?x.ezber:{kutu:-1};let k=typeof p.kutu==="number"?p.kutu:-1;
  const vadeli=k<0||!p.sonraki||p.sonraki<=today(),onceTam=ezbTam(p);
  if(not===2&&!vadeli){gun();S.puan+=2;logIsle("tekrar",null);save();renderStats();toast(`Bugünlük pekiştirdin. Sıradaki tekrar ${duaTarih(p.sonraki)} tarihinde`);return;}
  /* Hatırladım: bir basamak ileri; Zorlandım: basamak yerinde, yarın yeniden */
  if(not===2)k=Math.min(EZ_ARALIK.length-1,k+1);else k=Math.max(0,k);
  const sonraki=duaGunEkle(not===2?EZ_ARALIK[k]:1);
  x.ezber={kutu:k,sonraki};
  gun();S.puan+=vadeli?(not===2?10:5):2;if(vadeli){gorevIsle("tekrar");hedefIsle("tekrar");}logIsle("tekrar",null);checkBadges();save();renderStats();
  if(!onceTam&&ezbTam(x.ezber)){toast(`${duaAd(id)} artık ezberinde!`);try{efekt("yildiz");kutla();}catch(e){}}
  else toast(not===2?`Güzel! ${EZ_ARALIK[k]} gün sonra, ${duaTarih(sonraki)} tarihinde yeniden soracağız`:`Olsun, yarın (${duaTarih(sonraki)}) yeniden çalışalım; basamağın yerinde kaldı`);
  duaAc.gizli=false;if($("duaOkudum"))duaAc(id);}

/* ---------- oyun çatısı: js/04'teki quiz gibi; küçüklerde ikinci deneme hakkı ---------- */
function duaQuiz({title,items,build,bitince,geri}){const V=$("view");let i=0,dogru=0,yarim=0;const ekran=EKRAN_NO;
  const ileri=()=>{i++;step();};
  function step(){
    if(i>=items.length){const oran=items.length?(dogru-yarim*0.5)/items.length:0;if(bitince)bitince(oran);
      if(minik()){V.innerHTML=`<div class="result">${minikYildiz()}<div class="esnek ara-2 sarmal yatay-orta"><button class="primary minik-tekrar" id="again" aria-label="Geri dön">◀</button></div></div>`;$("again").onclick=geri;return;}
      V.innerHTML=`<div class="result pop"><h2>${esc(title)} bitti</h2><b class="big">${dogru} / ${items.length}</b>
      <p>${oran>=0.8?"Çok güzel, bu oyunu tamamladın.":kucuk()?"Bir daha okuyup deneyelim mi?":"Tamamlamak için en az %80 doğru gerekiyor. Bir daha dene."}</p><div class="esnek ara-2 sarmal yatay-orta"><button class="primary" id="again">Geri dön</button></div></div>`;
      $("again").onclick=geri;return;}
    const q=build(items[i]);
    V.innerHTML=`<div class="qhead"><span>${esc(title)}</span><span>${i+1} / ${items.length} · Doğru: ${dogru}</span></div>
    <div class="bar"><i style="width:${i/items.length*100}%"></i></div><div id="soruMetni" class="izgara ara-4">${q.html}</div>
    <div class="opts ${q.arOpts?"ar-opts":""}" role="group" aria-label="Şıklar" aria-describedby="soruMetni" ${q.tek?'style="grid-template-columns:1fr"':""}>${q.opts.map((o,j)=>`<button data-j="${j}" ${q.arOpts?'lang="ar" dir="rtl"':""}>${esc(o)}</button>`).join("")}</div><p class="feedback" id="fb" role="status" aria-live="polite"></p>
    <button class="geri" id="duaQG">${ikon("arrow-left")}Duaya dön</button>`;
    $("duaQG").onclick=geri;let ikinci=false;
    V.querySelectorAll(".opts button[data-j]").forEach(b=>b.onclick=()=>{
      const ok=q.opts[+b.dataset.j]===q.answer,k1=kucuk();
      if(!ok&&k1&&!ikinci&&q.opts.length>2){ikinci=true;b.disabled=true;b.classList.add("soluk");const fb=$("fb");fb.className="feedback dene";fb.textContent="Bir daha dene";try{soyle("Bir daha dene");}catch(e){}return;}
      V.querySelectorAll(".opts button[data-j]").forEach(x=>{x.disabled=true;if(q.opts[+x.dataset.j]===q.answer)x.classList.add("ok");});
      if(!ok){b.classList.add("bad");if(k1)b.classList.add("notr");}if(ok){dogru++;if(ikinci)yarim++;}answer(ok);
      const fb=$("fb");fb.className="feedback "+(ok?"ok":"bad")+(!ok&&k1?" notr":"");
      fb.textContent=ok&&minik()?"⭐ Aferin!":ok&&ikinci?"Doğru! İkinci denemede buldun.":ok?"Doğru!":"Doğrusu: "+q.answer;
      if(!ok){const dv=document.createElement("button");dv.className="primary"+(k1?" devam-buyuk":"");dv.id="devam";dv.type="button";dv.textContent=k1?"▶ Devam":"Devam ▶";fb.after(dv);dv.onclick=ileri;try{dv.focus({preventScroll:true});}catch(e){}}
      else setTimeout(()=>{if(ekran!==EKRAN_NO||!fb.isConnected)return;ileri();},1300);});
  }
  step();}
function duaOyunBitti(id,k,oran){const x=duaS(id);if(oran>=0.8&&!x.oyun[k]){x.oyun[k]=true;S.puan+=10;toast(`${duaAd(id)} · ${DUA_OYUN.find(o=>o[0]===k)[1]} tamam, 10 ek puan`);try{kutla();}catch(e){}}checkBadges();save();renderStats();}
const duaTumKelimeler=()=>{const s=new Set();(DUALAR?DUALAR.dualar:[]).forEach(d=>d.cumleler.forEach(c=>c.w.forEach(w=>s.add(w.a))));return [...s];};

/* (2) Eksik kelimeyi bul: bir cümleden bir kelime boş, 3 şık */
function duaEksik(id){const d=duaBul(id);if(!d)return;const tum=duaTumKelimeler();
  let L=[];d.cumleler.forEach((c,ci)=>{if(c.w.length>=2)c.w.forEach((_,k)=>L.push({ci,k}));});
  /* önce her cümleden birer soru, sonra gerekirse ikinci sorular; en çok 6 */
  const bir=shuffle(d.cumleler.map((_,ci)=>ci)).map(ci=>shuffle(L.filter(x=>x.ci===ci))[0]).filter(Boolean);
  const kalan=shuffle(L.filter(x=>!bir.includes(x)));const items=bir.concat(kalan).slice(0,Math.min(6,Math.max(4,bir.length)));
  duaQuiz({title:"Eksik kelimeyi bul",items,geri:()=>duaAc(id),bitince:o=>duaOyunBitti(id,"eksik",o),
    build:({ci,k})=>{const c=d.cumleler[ci],hedef=c.w[k].a,ic=new Set(c.w.map(w=>w.a));
      const yanlis=shuffle(tum.filter(a=>!ic.has(a))).slice(0,2);
      const satir=c.w.map((w,j)=>j===k?'<span class="blank">؟</span>':esc(w.a)).join(" ");
      return {html:`<p>${kucuk()?"Boşluğa hangi kelime gelir?":`${esc(d.ad)} · ${ci+1}. cümledeki boşluğa hangi kelime gelir?`}</p><div class="ayet-box ar" lang="ar" dir="rtl">${satir}</div><p class="okunus">${esc(c.tr)}</p>`,answer:hedef,arOpts:true,opts:shuffle([hedef,...yanlis])};}});}

/* (3) Anlamını bul: Arapça cümle → doğru Türkçe anlam */
function duaAnlam(id){const d=duaBul(id);if(!d)return;
  const diger=(DUALAR.dualar||[]).filter(x=>x.id!==id).flatMap(x=>x.cumleler.map(c=>c.tr));
  const items=shuffle(d.cumleler.map((_,ci)=>ci)).slice(0,6);
  duaQuiz({title:"Anlamını bul",items,geri:()=>duaAc(id),bitince:o=>duaOyunBitti(id,"anlam",o),
    build:ci=>{const c=d.cumleler[ci];const ayni=shuffle(d.cumleler.filter((_,j)=>j!==ci).map(x=>x.tr)),baska=shuffle(diger);
      const yanlis=[...new Set(ayni.concat(baska))].filter(t=>t!==c.tr).slice(0,2);
      return {html:`<p>Bu cümlenin anlamı hangisi?</p><div class="qbig ar" lang="ar" dir="rtl">${esc(c.ar)}</div>${kucuk()?`<p class="okunus">${esc(c.ok)}</p>`:""}`,answer:c.tr,tek:true,opts:shuffle([c.tr,...yanlis])};}});}

/* (1) Sırala: cümleleri doğru sıraya diz (js/04'teki sırala kalıbı: oklar ve sürükle-bırak) */
function duaSirala(id,parca){const d=duaBul(id);if(!d)return;const V=$("view");const BLOK=7;
  let idx=d.cumleler.map((_,i)=>i);
  /* uzun dua (kunut) kısım kısım sıralanır */
  if(idx.length>BLOK&&d.parcalar){const P=d.parcalar.length;parca=parca||1+Math.floor(Math.random()*P);idx=idx.filter(i=>d.cumleler[i].parca===parca);}
  else if(idx.length>BLOK){idx=idx.slice(0,BLOK);}
  if(idx.length<2){toast("Bu duada sıralanacak cümle yok");duaAc(id);return;}
  let order=shuffle(idx),dene=0,bitti=false;while(order.every((v,i)=>v===idx[i])&&dene++<20)order=shuffle(idx);
  const k1=kucuk();
  function draw(sonuc){
    V.innerHTML=`<button class="geri" id="duaSG">${ikon("arrow-left")}Duaya dön</button><h2>${esc(d.ad)} · cümleleri sırala</h2>
    ${parca&&d.parcalar?`<p class="kucuk-yazi kalin-7">${esc(d.parcalar[parca-1])}</p>`:""}
    <p>${k1?"Cümleleri oklarla taşıyarak doğru sıraya diz.":"Cümleleri tutup sürükleyerek doğru sıraya diz. Farede satırın her yerinden, telefonda soldaki ⠿ tutamağından tut. Oklarla da taşıyabilirsin."}</p>
    <div class="order-list">${order.map((ci,pos)=>`<div class="order-item ${sonuc?(ci===idx[pos]?"ok":"bad"):""}" data-ai="${ci}">
      <span class="grip" aria-hidden="true"><span class="num">${pos+1}</span>${sonuc?`<span class="isaret">${ci===idx[pos]?"✓":"✗"}</span>`:""}<span class="dots">⠿</span></span><span class="ar" lang="ar" dir="rtl">${esc(d.cumleler[ci].ar)}${k1?`<span class="okunus" lang="tr" dir="ltr" style="display:block">${esc(d.cumleler[ci].ok)}</span>`:""}${sonuc?`<span class="gorunmez" lang="tr" dir="ltr"> · ${ci===idx[pos]?"doğru yerde":"yanlış yerde"}</span>`:""}</span>
      <span class="mv"><button aria-label="${pos+1}. sıradaki cümleyi yukarı taşı" data-u="${pos}" ${pos===0?"disabled":""}>▲</button><button aria-label="${pos+1}. sıradaki cümleyi aşağı taşı" data-d="${pos}" ${pos===order.length-1?"disabled":""}>▼</button></span></div>`).join("")}</div>
    <div class="esnek ara-2 sarmal"><button class="primary" id="duaKontrol" ${bitti?"disabled":""}>Kontrol et</button>${d.parcalar&&d.cumleler.length>BLOK?`<button id="duaDiger">Öbür kısmı sırala</button>`:""}</div><p class="feedback" id="fb" tabindex="-1"></p>`;
    $("duaSG").onclick=()=>duaAc(id);
    const dg=$("duaDiger");if(dg)dg.onclick=()=>duaSirala(id,parca===1?2:1);
    const tasi=(p,y)=>{[order[y],order[p]]=[order[p],order[y]];draw();const u=V.querySelector(`[data-u="${y}"]`),dd=V.querySelector(`[data-d="${y}"]`);
      const h=(p>y?(u&&!u.disabled?u:dd):(dd&&!dd.disabled?dd:u));if(h)try{h.focus({preventScroll:true});}catch(e){}try{canliDuyur(`${y+1}. sıraya taşındı`);}catch(e){}};
    V.querySelectorAll("[data-u]").forEach(b=>b.onclick=()=>{const p=+b.dataset.u;tasi(p,p-1);});
    V.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{const p=+b.dataset.d;tasi(p,p+1);});
    const list=V.querySelector(".order-list");
    list.querySelectorAll(".order-item").forEach(it=>{
      it.addEventListener("pointerdown",e=>{
        if(e.target.closest("button"))return;
        if(e.pointerType!=="mouse"&&!e.target.closest(".grip"))return;
        if(e.pointerType==="mouse"&&e.button!==0)return;
        e.preventDefault();try{it.setPointerCapture(e.pointerId);}catch(er){}it.classList.add("drag");
        let startY=e.clientY;
        const move=ev=>{it.style.transform=`translateY(${ev.clientY-startY}px)`;
          for(const o of [...list.children].filter(x=>x!==it)){const r=o.getBoundingClientRect(),mid=r.top+r.height/2,ir=it.getBoundingClientRect(),myMid=ir.top+ir.height/2;
            const before=it.compareDocumentPosition(o)&Node.DOCUMENT_POSITION_PRECEDING;
            if((before&&myMid<mid)||(!before&&myMid>mid)){const t0=it.getBoundingClientRect().top;list.insertBefore(it,before?o:o.nextSibling);startY+=it.getBoundingClientRect().top-t0;it.style.transform=`translateY(${ev.clientY-startY}px)`;break;}}};
        const up=()=>{it.removeEventListener("pointermove",move);it.removeEventListener("pointerup",up);it.removeEventListener("pointercancel",up);
          it.style.transform="";it.classList.remove("drag");order=[...list.children].map(x=>+x.dataset.ai);draw();};
        it.addEventListener("pointermove",move);it.addEventListener("pointerup",up);it.addEventListener("pointercancel",up);});});
    $("duaKontrol").onclick=()=>{if(bitti)return;const ds=order.filter((ci,p)=>ci===idx[p]).length,tam=ds===order.length;
      answer(tam);if(tam)bitti=true;draw(true);const fb=$("fb");
      if(tam){fb.className="feedback ok";fb.textContent=minik()?"⭐ Aferin!":"Tebrikler, sıra tamamen doğru!";const x=duaS(id);if(!x.oyun.sirala){x.oyun.sirala=true;S.puan+=10;toast(`${duaAd(id)} · Sırala tamam, 10 ek puan`);try{kutla();}catch(e){}}checkBadges();save();renderStats();}
      else{fb.className="feedback "+(k1?"dene":"bad");fb.textContent=ds+" cümle doğru yerde. ✗ işaretlileri düzeltip yeniden kontrol et.";}
      try{canliDuyur(fb.textContent);}catch(e){}};
  }
  draw();}

/* ---------- namaz yolu (js/13) ve ana sayfa için ---------- */
/* Döndürür: {subhaneke, ettehiyyatu, salli, barik, rabbena}; her biri {ad, okundu, ezber, kutu}. rabbena = Rabbenâ âtinâ + Rabbenağfirlî (ikisi de gerekir) */
function duaNamazDurumu(){const b=id=>{const x=duaKayit(id),e=x.ezber;return {ad:duaAd(id),okundu:!!x.okundu,ezber:ezbTam(e),kutu:e&&typeof e.kutu==="number"?e.kutu:-1};};
  const r={subhaneke:b("subhaneke"),ettehiyyatu:b("ettehiyyatu"),salli:b("salli"),barik:b("barik")};
  const r1=b("rabbena"),r2=b("rabbenagfirli");
  r.rabbena={ad:"Rabbenâ duaları",okundu:r1.okundu&&r2.okundu,ezber:r1.ezber&&r2.ezber,kutu:Math.min(r1.kutu,r2.kutu),parcalar:{rabbena:r1,rabbenagfirli:r2}};
  return r;}
/* Sıradaki dua: önce tekrarı gelmiş olan, sonra başlanmış ama ezberlenmemiş olan, sonra hiç okunmamış olan */
function duaSiradaki(){const L=DUA_LISTE.map(([id])=>id);
  return L.find(duaVadeli)||L.find(id=>!duaEzberde(id)&&(duaKayit(id).okundu||duaKayit(id).ezber))||L.find(id=>!duaEzberde(id))||L[0];}
function dualarKartiHtml(){const n=duaEzberSay(),N=DUA_LISTE.length,bek=DUA_LISTE.filter(([id])=>duaVadeli(id)).length,s=duaSiradaki();
  return `<section class="detay aile-kart" aria-label="Namaz duaları"><h3>${ikon("moon-star")} Namaz duaları</h3>
  <p class="m0">${n}/${N} ezberde${bek?` · ${bek} dua bugün tekrar bekliyor`:""}${n<N?` · sıradaki: ${esc(duaAd(s))}`:""}</p>
  <div class="esnek ara-2 sarmal"><button class="primary" data-dua-ac="${esc(s)}">Devam et</button><button class="dokun44" data-dualar="1">Bütün dualar</button></div></section>`;}
/* Kart ve listede düğmeler olay yetkisiyle çalışır: kartı ekleyen dosyanın ayrıca bağlama yapması gerekmez */
document.addEventListener("click",e=>{if(!e.target.closest)return;const a=e.target.closest("[data-dua-ac]");if(a){duaAc(a.dataset.duaAc);return;}
  const l=e.target.closest("[data-dualar]");if(l)dualarSayfa();});

BADGES.push(["dua1","İlk duasını ezberledi",s=>DUA_LISTE.some(([id])=>ezbTam(((s.dualar||{})[id]||{}).ezber))],
 ["duaHepsi","Namaz dualarının hepsini ezberledi",s=>DUA_LISTE.every(([id])=>ezbTam(((s.dualar||{})[id]||{}).ezber))]);
