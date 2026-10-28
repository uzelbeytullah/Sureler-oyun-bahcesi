/* Sureler Oyun Bahçesi · Tecvid avcısı: tecvid alıştırma oyunu ve ebeveyn onayı için tecvid kontrol listesi */
/* Veri: sure JSON'undaki tecvid alanı (ayet → kelime → [metin, kural] parçaları) ve data/tecvid_kurallar.json (TKUR, js/07).
   Renk sınıfları TC (js/06) ve css/oyun.css içindeki .tc-* sınıflarından gelir. Yeni veri dosyası gerekmez. */

/* Kural kimliğinden kural bilgisi; TKUR yüklenmediyse kimliğin kendisi */
const tvoKural=c=>((TKUR&&TKUR.kurallar)||{})[c]||{ad:c,kisa:"",nasil:""};
/* Bir kelimedeki parçalar (yoksa boş dizi) */
const tvoParca=(veri,ai,wi)=>(veri&&veri.tecvid&&veri.tecvid[ai]&&veri.tecvid[ai][wi])||[];
/* Bir kelimede geçen kurallar (yalnız kural tablosunda olanlar) */
const tvoKelimeKural=(veri,ai,wi)=>[...new Set(tvoParca(veri,ai,wi).map(p=>p[1]).filter(c=>c&&tvoKural(c).ad))];

/* Kelimeyi tecvid renkleriyle çizer. vurgu: vurgulanacak parçanın sırası; renkli=false ise düz yazar */
function tvoKelimeHtml(veri,ai,wi,vurgu,renkli){
  const P=tvoParca(veri,ai,wi);if(!P.length)return esc(veri.ayetler[ai].w[wi].a);
  return P.map(([t,c],pi)=>{const v=pi===vurgu;
    if(!c||renkli===false)return v?`<span class="tvo-vurgu" style="outline:3px solid currentColor;outline-offset:3px;border-radius:6px;background:var(--gold-bg);text-decoration:underline">${esc(t)}</span>`:esc(t);
    return `<span class="tc-${TC[c]||"sessiz"}${v?" tvo-vurgu":""}"${v?' style="outline:3px solid currentColor;outline-offset:3px;border-radius:6px;background:var(--gold-bg);text-decoration:underline"':""}>${esc(t)}</span>`;}).join("");
}

/* Surede geçen bütün kurallı parçalar: {ai,wi,pi,c} */
function tvoParcalar(veri){const L=[];if(!veri||!Array.isArray(veri.tecvid)||!veri.ayetler)return L;
  veri.ayetler.forEach((a,ai)=>(a.w||[]).forEach((w,wi)=>tvoParca(veri,ai,wi).forEach(([t,c],pi)=>{if(c&&(!TKUR||TKUR.kurallar[c]))L.push({ai,wi,pi,c});})));return L;}

/* Soruları üretir. veri: sure verisi (CUR), adet: soru sayısı, sik: şık sayısı (doğru dahil).
   Her soru: {tur:1|2|3, soz (sesli okuma için düz metin), html, opts:[{d,h}], answer, ar (Arapça şıklar mı), tek (tek sütun), c, ai, wi} */
function tecvidSorulari(veri,adet,sik){
  if(adet===undefined)adet=kucuk()?5:8;if(sik===undefined)sik=kucuk()?3:4;
  const P=tvoParcalar(veri);if(!P.length)return [];
  const K=(TKUR&&TKUR.kurallar)||{};
  const grup={};P.forEach(p=>(grup[p.c]=grup[p.c]||[]).push(p));
  const sureKural=Object.keys(grup);
  /* kuralları sırayla dolaşarak çeşitlilik sağla */
  let kSira=shuffle(sureKural),kI=0;const sonrakiKural=()=>{if(kI>=kSira.length){kSira=shuffle(sureKural);kI=0;}return kSira[kI++];};
  const ad=c=>tvoKural(c).ad;
  /* aynı adı taşımayan, önce suredeki sonra bütün kurallardan çeldirici */
  const celdirici=(c,n,kacin)=>{const sec=[],adlar=new Set([ad(c)]);
    const dene=L=>shuffle(L).forEach(x=>{if(sec.length>=n||x===c||adlar.has(ad(x)))return;sec.push(x);adlar.add(ad(x));});
    dene(sureKural.filter(x=>!(kacin||[]).includes(x)));dene(sureKural);dene(Object.keys(K));return sec;};
  /* benzersiz kelimeler (metne göre) */
  const kelimeler=[];{const g=new Set();veri.ayetler.forEach((a,ai)=>a.w.forEach((w,wi)=>{if(g.has(w.a))return;g.add(w.a);kelimeler.push({ai,wi,w,k:tvoKelimeKural(veri,ai,wi)});}));}
  const kelimeGoster=(ai,wi,vurgu)=>{const w=veri.ayetler[ai].w[wi];return `<div class="qbig ar" lang="ar" dir="rtl">${tvoKelimeHtml(veri,ai,wi,vurgu)}</div>${w.ok?`<p class="okunus">${esc(w.ok)}${w.tr?` · ${esc(w.tr)}`:""}</p>`:""}`;};
  const tur1=()=>{const c=sonrakiKural(),p=shuffle(grup[c])[0];
    const opts=shuffle([c,...celdirici(c,sik-1,tvoKelimeKural(veri,p.ai,p.wi))]).map(x=>({d:x,h:esc(ad(x))}));
    return {tur:1,c,ai:p.ai,wi:p.wi,soz:"Bu renkli harfte hangi kural var?",html:`<p class="yazi-4 kalin">Çerçeveli renkli harfte hangi kural var?</p>${kelimeGoster(p.ai,p.wi,p.pi)}`,opts,answer:c,tek:opts.some(o=>o.h.length>22)};};
  const tur2=()=>{for(let d=0;d<sureKural.length;d++){const c=sonrakiKural();const var_=shuffle(kelimeler.filter(x=>x.k.includes(c))),yok=shuffle(kelimeler.filter(x=>!x.k.includes(c)));
      if(!var_.length||yok.length<sik-1)continue;const dg=var_[0],renkli=kucuk();
      const L=shuffle([dg,...yok.slice(0,sik-1)]);
      return {tur:2,c,ai:dg.ai,wi:dg.wi,ar:true,soz:"Hangi kelimede "+ad(c)+" kuralı var?",html:`<p class="yazi-4 kalin">Hangi kelimede <b>${esc(ad(c))}</b> kuralı var?</p>${renkli?`<p class="kucuk-yazi">İpucu: kuralın rengine bak.</p>`:""}`,
        opts:L.map(x=>({d:x.ai+":"+x.wi,h:tvoKelimeHtml(veri,x.ai,x.wi,-1,renkli)})),answer:dg.ai+":"+dg.wi};}
    return tur1();};
  const tur3=()=>{const c=sonrakiKural(),p=shuffle(grup[c])[0],dn=(tvoKural(c).nasil||tvoKural(c).kisa||"").trim();
    const metin=x=>(tvoKural(x).nasil||tvoKural(x).kisa||"").trim();
    const sec=[],gor=new Set([dn]);shuffle(sureKural).concat(shuffle(Object.keys(K))).forEach(x=>{const m=metin(x);if(sec.length>=sik-1||!m||gor.has(m))return;gor.add(m);sec.push(m);});
    if(!dn||sec.length<sik-1)return tur1();
    return {tur:3,c,ai:p.ai,wi:p.wi,soz:ad(c)+" kuralı nasıl okunur?",html:`<p class="yazi-4 kalin"><b>${esc(ad(c))}</b> nasıl okunur?</p>${kelimeGoster(p.ai,p.wi,p.pi)}`,
      opts:shuffle([dn,...sec]).map(m=>({d:m,h:esc(m)})),answer:dn,tek:true};};
  const plan=kucuk()?[1,2,1,3,2,1,2,3]:[1,2,3,1,2,3,1,2,1,3];
  const L=[];for(let i=0;i<adet;i++){const t=plan[i%plan.length];L.push(t===1?tur1():t===2?tur2():tur3());}
  return L;
}

/* Oyun: tecvidOyunu() açık sure (CUR) için; tecvidOyunu(no) verilen sureyi açıp onun için */
async function tecvidOyunu(no){
  if(no!==undefined&&no!==null&&(!CUR||CUR.no!==+no)){await ac(+no,"harita");/* "harita" eşzamanlı çizilir; "oku" ek parçayı bekleyip oyunun üstüne çizerdi */if(!CUR||CUR.no!==+no)return;}
  if(!CUR){if(typeof anaSayfa==="function")anaSayfa();return;}
  if(!TKUR){try{const r=await fetch("data/tecvid_kurallar.json?v="+SURUM);if(r.ok)TKUR=await r.json();}catch(e){}}
  /* cur="tecvid": ekran yeniden çizen gecikmeli işler (TKUR yüklenince oku(), buluttan gelince harita()) oyunu silmesin; sekmeler show() ile çıkar */
  cur="tecvid";durSes();setTabs();window.scrollTo({top:0});
  const V=$("view"),sure=CUR,sNo=CUR.no,ekran=EKRAN_NO,geri=()=>show(minik()?"oku":"harita");
  const items=TKUR?tecvidSorulari(sure):[];
  if(!items.length){V.innerHTML=`<section class="detay pop"><h2>${ikon("book-open")} Tecvid avcısı</h2><p>Bu surede tecvid verisi yok. Başka bir surede tecvid avına çıkabilirsin.</p><button class="primary" id="tvoGeri">Geri dön</button></section>`;$("tvoGeri").onclick=geri;return;}
  let i=0,dogru=0,yarim=0;
  const bitir=()=>{const n=items.length,yuzde=Math.round(Math.max(0,dogru-yarim*0.5)/n*100);const t=SS(sNo),once=t.tecvidOyun;
    t.tecvidOyun={en:Math.max((once&&once.en)||0,yuzde),son:today()};
    let p=0;if(!once){p=10;S.puan+=p;}gun();checkBadges();save();renderStats();
    if(yuzde>=80){efekt("yildiz");kutla();}
    if(minik()){V.innerHTML=`<div class="result">${minikYildiz()}<div class="esnek ara-2 sarmal yatay-orta"><button class="primary minik-tekrar" id="tvoTekrar" aria-label="Yeniden oyna">↻</button><button class="minik-tekrar" id="tvoGeri" aria-label="Geri dön">◀</button></div></div>`;if(trSesVar())soyle("Aferin!");}
    else V.innerHTML=`<div class="result pop"><h2>Tecvid avcısı bitti</h2><b class="big">${dogru} / ${n}</b>
      <p>${yuzde>=80?"Harika! Tecvid kurallarını iyi tanıyorsun.":kucuk()?"Renklere bakıp bir daha deneyelim mi?":"Kuralların açıklamalarını okuyup bir daha dene."}${p?` İlk tecvid avın: ${p} puan.`:""}</p>
      <p class="kucuk-yazi">Bu suredeki en iyi sonucun: %${t.tecvidOyun.en}. Okuyuşunu bir hocaya dinletmen en sağlamıdır.</p>
      <div class="esnek ara-2 sarmal yatay-orta"><button class="primary" id="tvoTekrar">Yeniden oyna</button><button id="tvoGeri">Geri dön</button></div></div>`;
    $("tvoTekrar").onclick=()=>tecvidOyunu();$("tvoGeri").onclick=geri;};
  const adim=()=>{if(ekran!==EKRAN_NO||CUR!==sure)return;if(i>=items.length)return bitir();
    const q=items[i],k1=kucuk();
    V.innerHTML=`<div class="qhead"><span>Tecvid avcısı</span><span>${minik()?"⭐".repeat(dogru):`${i+1} / ${items.length} · Doğru: ${dogru}`}</span></div>
    <div class="bar"><i style="width:${i/items.length*100}%"></i></div><div id="soruMetni" class="izgara ara-4">${q.html}</div>
    ${k1?`<div class="esnek ara-2 sarmal">${trSesVar()?`<button class="yazi-4 dn" id="tvoSoru">${ikon("volume-2")} Soruyu dinle</button>`:""}${q.tur!==2?`<button class="yazi-4 dn" id="tvoKel">${ikon("headphones")} Kelimeyi dinle</button>`:""}</div>`:""}
    <div class="opts ${q.ar?"ar-opts":""}" role="group" aria-label="Şıklar" aria-describedby="soruMetni"${q.tek?' style="grid-template-columns:1fr"':""}>${q.opts.map((o,j)=>`<button data-j="${j}"${q.ar?' lang="ar" dir="rtl"':""}>${o.h}</button>`).join("")}</div>
    <p class="feedback" id="fb" role="status" aria-live="polite"></p><div id="tvoAcik"></div>`;
    {const b=$("tvoSoru");if(b)b.onclick=()=>soyle(q.soz);const kb=$("tvoKel");if(kb)kb.onclick=()=>kelimeSes(sure.ayetler[q.ai].w[q.wi]);}
    let ikinci=false;
    V.querySelectorAll(".opts button[data-j]").forEach(b=>b.onclick=()=>{
      const ok=q.opts[+b.dataset.j].d===q.answer;
      if(!ok&&k1&&!ikinci&&q.opts.length>2){ikinci=true;b.disabled=true;b.classList.add("soluk");const fb=$("fb");fb.className="feedback dene";fb.textContent="Bir daha dene";soyle("Bir daha dene");return;}
      V.querySelectorAll(".opts button[data-j]").forEach(x=>{x.disabled=true;if(q.opts[+x.dataset.j].d===q.answer)x.classList.add("ok");});
      if(!ok){b.classList.add("bad");if(k1)b.classList.add("notr");}
      if(ok){dogru++;if(ikinci)yarim++;}answer(ok);
      const K=tvoKural(q.c),w=sure.ayetler[q.ai].w[q.wi],fb=$("fb");
      fb.className="feedback "+(ok?"ok":"bad")+(!ok&&k1?" notr":"");
      fb.textContent=ok&&minik()?"⭐ Aferin!":ok&&ikinci?"Doğru! İkinci denemede buldun.":ok?"Doğru!":(q.tur===2?"Doğrusu işaretlendi.":"Doğrusu: "+(q.tur===1?K.ad:q.answer));
      const A=$("tvoAcik");A.className="detay pop";
      A.innerHTML=`<p class="m0"><b class="tc-${TC[q.c]||"sessiz"}">${esc(K.ad)}</b></p>
        <div class="yazi-4 ar" lang="ar" dir="rtl" style="text-align:center">${tvoKelimeHtml(sure,q.ai,q.wi,-1)}</div>
        ${K.kisa?`<p>${esc(K.kisa)}</p>`:""}${K.nasil?`<p><b>Nasıl okunur:</b> ${esc(K.nasil)}</p>`:""}
        <div class="esnek ara-2 sarmal">${w&&w.k?`<button class="dn" id="tvoDinle">▶ Dinle</button>`:""}<button class="primary${k1?" devam-buyuk":""}" id="devam">${k1?"▶ Devam":"Devam ▶"}</button></div>`;
      {const d=$("tvoDinle");if(d)d.onclick=()=>{durSes();kelimeSes(w);};}
      $("devam").onclick=()=>{i++;adim();};try{$("devam").focus({preventScroll:true});}catch(e){}
      try{A.scrollIntoView({block:"nearest",behavior:kaydirmaDavranisi()});}catch(e){}
      if(k1&&!ok&&trSesVar())soyle("Doğrusu işaretlendi. Devam etmek için oka dokun");});
  };
  adim();
}

/* Rozet: üç ayrı surede tecvid oyununu bitirdi */
BADGES.push(["tecvid3","Tecvid avcısı: 3 surede tecvid oyununu tamamladı",s=>Object.values(s.sure||{}).filter(x=>x&&x.tecvidOyun).length>=3]);

/* Ebeveyn onay ekranı için tecvid kontrol listesi (2–3 madde). no: sure no (ya da Yâsîn grup kimliği),
   ayetIndex: o veri dosyasındaki ayet sırası (0'dan başlar; onayEkrani'ndeki x.i), veri: isteğe bağlı sure verisi
   (verilmezse CACHE[no] ya da açık sure). Yalnız HTML döner; tecvid verisi yoksa boş metin. */
const TVO_KONTROL=[
  ["medd",["madda_normal","madda_obligatory","madda_necessary","madda_permissible"],"Medd (uzatma)",L=>"Uzatma yerlerinde yeterince uzattı mı? "+[L.includes("madda_normal")?"medd-i tabiî 2 hareke":"",L.includes("madda_obligatory")?"muttasıl / munfasıl 4–5 hareke":"",L.includes("madda_necessary")?"medd-i lâzım 6 hareke":"",L.includes("madda_permissible")?"durakta medd-i ârız 2, 4 ya da 6 hareke":""].filter(Boolean).join("; ")],
  ["gunne",["ghunnah","ikhafa","ikhafa_shafawi","iqlab","idgham_ghunnah","idgham_shafawi"],"Gunne",L=>"Genizden, yaklaşık 2 hareke tutarak okudu mu? ("+L.map(c=>tvoKural(c).ad).join(", ")+")"],
  ["kalkale",["qalaqah"],"Kalkale",()=>"Sakin kalkale harfini hafifçe sektirdi mi?"],
  ["idgam",["idgham_wo_ghunnah","idgham_mutajanisayn","idgham_mutaqaribayn"],"İdğam",L=>"Harfi sonrakine katarak okudu mu? ("+L.map(c=>tvoKural(c).ad).join(", ")+")"],
  ["izhar",["izhar"],"İzhar",()=>"Nunu genizden çekmeden, açık söyledi mi?"],
  ["sessiz",["ham_wasl","laam_shamsiyah","slnt"],"Okunmayan harfler",()=>"Yazılıp okunmayan harfleri (bağlama elifi, şemsî lam) atlayarak okudu mu?"],
  ["kalin",["lafzatullah","ra_kalin_ince"],"Kalın-ince",()=>"Allah lafzını ve ra harfini yerinde kalın ya da ince okudu mu?"]
];
function tecvidKontrolListesiHtml(no,ayetIndex,veri){
  const d=veri||(typeof CACHE!=="undefined"&&CACHE[no])||(CUR&&CUR.no===+no?CUR:null);
  const ai=+ayetIndex||0;if(!d||!Array.isArray(d.tecvid)||!d.tecvid[ai]||!d.ayetler||!d.ayetler[ai])return "";
  const ornek={};d.tecvid[ai].forEach((parc,wi)=>(parc||[]).forEach(([t,c])=>{if(c&&ornek[c]===undefined)ornek[c]=wi;}));
  const M=TVO_KONTROL.map(([id,kurallar,ad,soru])=>{const L=kurallar.filter(c=>ornek[c]!==undefined);if(!L.length)return null;
    const w=d.ayetler[ai].w[ornek[L[0]]];return {id,ad,soru:soru(L),ar:w?w.a:""};}).filter(Boolean).slice(0,3);
  if(!M.length)return "";
  return `<div class="detay tecvid-kontrol"><p class="m0"><b>Tecvide dikkat</b> <span class="kucuk-yazi">· bu ayette geçen kurallar</span></p>
  <ul class="m0" style="list-style:none;padding:0;display:grid;gap:8px">${M.map(x=>`<li><label class="esnek ara-2"><input type="checkbox" data-tk="${x.id}"><span><b>${esc(x.ad)}:</b> ${esc(x.soru)}${x.ar?` <span class="ar" lang="ar" dir="rtl">(${esc(x.ar)})</span>`:""}</span></label></li>`).join("")}</ul>
  <p class="kucuk-yazi m0">Emin olamadığınız yerde bir hocaya danışmanız en sağlamıdır.</p></div>`;
}
