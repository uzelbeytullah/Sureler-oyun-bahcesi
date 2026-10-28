/* Sureler Oyun Bahçesi · Ezber araçları ve Yâsîn ortak bilgiler */
/* ---------- ezber araçları (önce Fâtiha) ---------- */
const ezberAracVar=()=>!!CUR;
let ezberArac=null,aracJeton=0;
function ilkHarf(w){const t=w.match(/[\u0621-\u064A\u0671]/g)||[];if(!t.length)return w;const son=h=>"\u0627\u062F\u0630\u0631\u0632\u0648\u0624\u0621\u0629\u0623\u0625\u0622\u0671".includes(h)?"…":"\u0640";if(t.length>2&&(t[0]==="\u0671"||t[0]==="\u0627")&&t[1]==="\u0644")return "\u0671\u0644"+t[2]+son(t[2]);return t[0]+son(t[0]);}
function ayetSure(i){const b=CUR.ses.bas;return (i+1<b.length?b[i+1]:CUR.ses.son)-b[i];}
function aracDur(){aracJeton++;durSes();}
function bekle(ms,j){return new Promise(r=>setTimeout(()=>r(j===aracJeton),ms));}
function calAralik(i1,i2){return new Promise(res=>{const b=CUR.ses.bas,e=i2+1<b.length?b[i2+1]:CUR.ses.son;hizUygula();calParca(CUR.no,b[i1],e,h=>res(!h));});}
function ezberHaritasi(){
  const D=ekS("ezberDurum"),n=CUR.ayetler.length,ilk=CUR.ilkAyet||1;
  const ez=CUR.ayetler.filter((_,i)=>ezbTam(D[i])).length;
  return `<div class="izgara ara-2"><b>Ezber haritası: ${ez} / ${n} ayet ezberde</b><span class="kucuk-yazi kalin-7">${EZ_TAM_KUTU+1}. basamağa ulaşan (${EZ_ARALIK[EZ_TAM_KUTU-1]} gün sonra da hatırlanan) ayet ezberde sayılır. Renk koyulaştıkça ayet daha sağlam.</span>
  <div style="display:grid;grid-template-columns:repeat(${Math.min(n,20)},1fr);gap:3px">${CUR.ayetler.map((_,i)=>{const k=(D[i]||{}).kutu;const r=k===undefined?"var(--line)":ezbTam(D[i])?"var(--ok)":k>=2?"var(--gold)":"var(--lapis)";
    return `<span title="${ilk+i}. ayet" style="height:22px;border-radius:5px;background:${r};display:grid;place-items:center;font-size:11px;font-weight:800;color:var(--bg)">${ilk+i}</span>`;}).join("")}</div>
  <span class="yazi-1 kalin-7"><b class="renk-asil">■</b> başlandı · <b class="renk-vurgu">■</b> pekişiyor · <b class="renk-basari">■</b> ezberde</span></div>`;
}
function ezberAraclari(){
  return `<div class="izgara ara-2 detay"><b class="yazi-4">Ezber araçları</b>
  <div class="sure-grid" style="grid-template-columns:repeat(auto-fill,minmax(170px,1fr))">
  ${[["dt","Dinle ve tekrarla","Kâri okur, sen boşlukta tekrar edersin."],...(CUR.ayetler.length>1?[["zincir","Zincirleme ezber","1, 1-2, 1-3… ayetleri birbirine bağla."]]:[]),["diz","Kelime dizme","Karışık kelimelerle ayeti kur."],["sonra","Sonra ne gelir?","Ardından gelen ayeti bul."]].filter(([k])=>k!=="sonra"||CUR.ayetler.length>1).map(([k,a,t])=>`<button class="sure-kart" data-arac="${k}"><span class="sad">${a}</span><span class="sbilgi">${t}</span></button>`).join("")}</div></div>`;
}
function aracCiz(){
  const V=$("view"),ilk=CUR.ilkAyet||1;
  const ust=`<div class="esnek ara-2 sarmal"><button class="geri" id="arGeri">${ikon("arrow-left")}Ezber köşesi</button></div>`;
  const geriBagla=()=>{$("arGeri").onclick=()=>{aracDur();ezberArac=null;ezber();};};
  const ayetSec=(id,sec)=>`<select class="gen-oto ara" id="${id}" aria-label="${id==="dtBas"?"Başlangıç ayeti":id==="dtSon"?"Bitiş ayeti":"Ayet seç"}">${CUR.ayetler.map((_,i)=>`<option value="${i}" ${i===sec?"selected":""}>${ilk+i}. ayet</option>`).join("")}</select>`;
  const metin=(i,gizle)=>`<div class="yatay-orta kelimeler" lang="ar">${CUR.ayetler[i].w.map((w,j)=>gizle?`<span class="k${j%12}">${ilkHarf(w.a)}</span>`:`<span class="k${j%12}">${w.a}</span>`).join("")}</div>`;
  if(ezberArac==="dt"){
    const A=S.dtAyar=S.dtAyar||{bas:0,tekrar:2,carpan:1,gizle:false};
    V.innerHTML=`${ust}<h2>Dinle ve tekrarla</h2><p>Kâri ayeti okur; ardından ekranda <b>“Şimdi sen oku”</b> yazar ve ayetin süresi kadar boşluk bırakılır. O boşlukta ayeti yüksek sesle tekrar et.</p>
    <div class="esnek ara-3 sarmal dik-orta"><label><b>Başlangıç:</b> ${ayetSec("dtBas",A.bas)}</label>
    <span><b>Her ayet:</b> ${[1,2,3].map(t=>`<button data-tk="${t}" class="dokun44 dar ${A.tekrar===t?"on":""}">${t} kez</button>`).join("")}</span>
    <span><b>Boşluk:</b> ${[[1,"Ayet kadar"],[1.5,"Bir buçuk katı"],[2,"İki katı"]].map(([c,a])=>`<button data-cp="${c}" class="dokun44 dar ${A.carpan===c?"on":""}">${a}</button>`).join("")}</span>
    <button data-gz="1" class="dokun44 ${A.gizle?"on":""}">${A.gizle?"Metin: yalnız ilk harfler":"Metin: tam"}</button></div>
    <div class="esnek ara-2"><button class="primary" id="dtBasla">${ikon("play")} Başlat</button><button id="dtDur">${ikon("pause")} Durdur</button></div>
    <div id="dtEkran" class="ortali izgara ara-2 odak"><b id="dtDurum">Hazır</b><div id="dtMetin">${metin(A.bas,A.gizle)}</div></div>`;
    geriBagla();
    $("dtBas").onchange=e=>{A.bas=+e.target.value;save();aracCiz();};
    V.querySelectorAll("[data-tk]").forEach(b=>b.onclick=()=>{A.tekrar=+b.dataset.tk;save();aracCiz();});
    V.querySelectorAll("[data-cp]").forEach(b=>b.onclick=()=>{A.carpan=+b.dataset.cp;save();aracCiz();});
    V.querySelector("[data-gz]").onclick=()=>{A.gizle=!A.gizle;save();aracCiz();};
    $("dtDur").onclick=()=>{aracDur();$("dtDurum").textContent="Durduruldu";};
    $("dtBasla").onclick=async()=>{aracDur();const j=aracJeton;
      for(let i=A.bas;i<CUR.ayetler.length;i++){
        for(let t=0;t<A.tekrar;t++){
          if(j!==aracJeton)return;
          $("dtMetin").innerHTML=metin(i,A.gizle);$("dtDurum").textContent=`${ilk+i}. ayet · dinle (${t+1}/${A.tekrar})`;$("dtEkran").style.borderColor="var(--lapis)";
          if(!(await calAralik(i,i))||j!==aracJeton)return;
          const ms=ayetSure(i)/hiz()*A.carpan*1000;
          $("dtDurum").textContent=`${ilk+i}. ayet · Şimdi sen oku`;$("dtEkran").style.borderColor="var(--ok)";
          if(A.gizle===false){$("dtMetin").innerHTML=metin(i,true);}
          if(!(await bekle(ms+400,j)))return;
        }
      }
      if(j===aracJeton){$("dtDurum").textContent="Bitti. Maşallah!";gun();S.puan+=10;save();renderStats();toast("Dinle ve tekrarla tamam, 10 puan");}
    };
  }else if(ezberArac==="zincir"){
    const Z=SS(CUR.no).zincir=SS(CUR.no).zincir||{halka:0,gizle:true,carpan:1};const n=CUR.ayetler.length;const k=Math.min(Z.halka,n-1);
    V.innerHTML=`${ust}<h2>Zincirleme ezber</h2><p>Kitabınızdaki çivileme yöntemi: Her halkada baştan o ayete kadar hepsi okunur, sonra sen hepsini art arda tekrar edersin. Halka tamam olunca bir sonraki ayet zincire eklenir.</p>
    <div class="esnek ara-1 sarmal">${CUR.ayetler.map((_,i)=>`<button data-h="${i}" class="${i===k?"on":""}" style="min-height:44px;padding:4px 10px;${i<k?"border-color:var(--ok);color:var(--ok)":""}">${i===0?ilk:ilk+"-"+(ilk+i)}</button>`).join("")}</div>
    <div class="esnek ara-2 sarmal"><button data-gz="1" class="${Z.gizle?"on":""}">${Z.gizle?"Tekrarda metin: yalnız ilk harfler":"Tekrarda metin: tam"}</button>
    <span><b>Boşluk:</b> ${[[1,"Okuma kadar"],[1.5,"Bir buçuk katı"]].map(([c,a])=>`<button data-cp="${c}" class="dokun44 dar ${Z.carpan===c?"on":""}">${a}</button>`).join("")}</span></div>
    <div class="izgara ara-2 ortali odak"><b id="zDurum">${k+1}. halka: ${k===0?`${ilk}. ayet`:`${ilk}-${ilk+k}. ayetler`}</b><div id="zMetin">${[...Array(k+1)].map((_,i)=>metin(i,false)).join("")}</div>
    <div class="esnek ara-2 yatay-orta sarmal"><button class="primary" id="zBasla">${ikon("play")} Halkayı başlat</button><button id="zDur">■ Durdur</button></div>
    <div id="zSonra" hidden class="esnek ara-2 yatay-orta sarmal"><button class="primary" id="zTamam">Halkayı doğru okudum →</button><button id="zTekrar">Bu halkayı tekrarla</button></div></div>`;
    geriBagla();
    V.querySelectorAll("[data-h]").forEach(b=>b.onclick=()=>{aracDur();Z.halka=+b.dataset.h;save();aracCiz();});
    V.querySelector("[data-gz]").onclick=()=>{Z.gizle=!Z.gizle;save();aracCiz();};
    V.querySelectorAll("[data-cp]").forEach(b=>b.onclick=()=>{Z.carpan=+b.dataset.cp;save();aracCiz();});
    $("zDur").onclick=()=>{aracDur();$("zDurum").textContent="Durduruldu";};
    const basla=async()=>{aracDur();const j=aracJeton;$("zSonra").hidden=true;
      $("zDurum").textContent=`${k+1}. halka · dinle`;$("zMetin").innerHTML=[...Array(k+1)].map((_,i)=>metin(i,false)).join("");
      if(!(await calAralik(0,k))||j!==aracJeton)return;
      let top=0;for(let i=0;i<=k;i++)top+=ayetSure(i);
      $("zDurum").textContent=`${k+1}. halka · Şimdi sen oku (${ilk}-${ilk+k})`;$("zMetin").innerHTML=[...Array(k+1)].map((_,i)=>metin(i,Z.gizle)).join("");
      if(!(await bekle(top/hiz()*Z.carpan*1000+600,j)))return;
      $("zDurum").textContent="Doğru okuyabildin mi?";$("zSonra").hidden=false;};
    $("zBasla").onclick=basla;$("zTekrar").onclick=basla;
    $("zTamam").onclick=()=>{gun();S.puan+=5+k;if(k+1>=n){toast("Bütün zinciri tamamladın, maşallah!");S.zincirTam=true;Z.halka=0;}else{Z.halka=k+1;toast(`${k+1}. halka tamam`);}checkBadges();save();renderStats();aracCiz();};
  }else if(ezberArac==="diz"){
    const Dz=ezberArac_diz=ezberArac_diz||{i:0};const i=Math.min(Dz.i,CUR.ayetler.length-1),w=CUR.ayetler[i].w;
    let sira=0,hata=0;const kar=shuffle(w.map((x,j)=>j));
    V.innerHTML=`${ust}<h2>Kelime dizme</h2><p>Ayetin kelimeleri karıştırıldı. Doğru sırayla dokun; yanlış kart sallanır.</p>
    <label><b>Ayet:</b> ${ayetSec("dzSec",i)}</label> <button id="dzDinle" class="dn">▶ Ayeti dinle</button>
    <div class="odak" style="min-height:70px"><div class="sola-yasla kelimeler" lang="ar" id="dzKur"></div></div>
    <div class="yatay-orta ara-2 kelimeler" lang="ar" id="dzKart">${kar.map(j=>`<button data-k="${j}" style="font-family:var(--f-ar);font-size:26px;min-height:56px;padding:4px 14px">${w[j].a}</button>`).join("")}</div>
    <p class="feedback" id="dzFb"></p>`;
    geriBagla();
    $("dzSec").onchange=e=>{Dz.i=+e.target.value;aracCiz();};
    $("dzDinle").onclick=()=>{calAralik(i,i);};
    V.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{
      if(+b.dataset.k===sira){const s2=document.createElement("span");s2.className="k"+(sira%12);s2.textContent=w[sira].a;$("dzKur").appendChild(s2);b.remove();sira++;
        if(sira===w.length){const ok=hata===0;answer(ok);gun();S.puan+=ok?10:5;save();renderStats();
          $("dzFb").className="feedback ok";$("dzFb").innerHTML=`${ok?"Hatasız dizdin, maşallah!":"Tamamladın ("+hata+" hata)."} <button class="primary" id="dzSonraki">Sonraki ayet →</button>`;
          $("dzSonraki").onclick=()=>{Dz.i=(i+1)%CUR.ayetler.length;aracCiz();};}}
      else{hata++;b.classList.remove("salla");void b.offsetWidth;b.classList.add("salla");$("dzFb").className="feedback bad";$("dzFb").textContent="Bu değil, bir daha dene.";}
    });
  }else if(ezberArac==="sonra"){
    const n=CUR.ayetler.length,bas=a=>a.w.slice(0,Math.min(3,a.w.length)).map(x=>x.a).join(" ")+(a.w.length>3?" …":"");
    const havuz=CUR.ayetler.map(bas);const items=shuffle([...Array(n-1).keys()]);
    quiz({title:"Sonra ne gelir?",items,build:i=>({html:`<p>Bu ayetten sonra hangi ayet gelir?</p><div class="ayet-box ar" lang="ar">${CUR.ayetler[i].w.map(x=>x.a).join(" ")}</div><p class="okunus">${ilk+i}. ayet</p>`,
      answer:havuz[i+1],arOpts:true,opts:secenek(havuz[i+1],havuz.filter((_,x)=>x!==i))}),geri:()=>{ezberArac=null;ezber();}});
  }
}
let ezberArac_diz=null;
BADGES.push(["zincir","Zincirleme ezberde bütün halkaları tamamladı",()=>!!S.zincirTam]);

function ezberOzet(){
  let top=0;const tam=[];
  KATALOG.forEach(k=>{if(k.gruplar){k.gruplar.forEach(g=>{const D=((S.sure[g.id]||{}).ezberDurum)||{};top+=Object.values(D).filter(ezbTam).length;});return;}
    const D=((S.sure[k.no]||{}).ezberDurum)||{};const n=Object.values(D).filter(ezbTam).length;top+=n;if(k.ayet&&n>=k.ayet)tam.push(k.ad);});
  return `<p><b>Ezberim:</b> ${top} ayet ezberde${tam.length?` · <b>Namazda okuyabileceğin sureler:</b> ${tam.map(esc).join(", ")}`:""}</p>`;
}

/* ---------- Yâsîn Ortak Bilgiler ---------- */
let ORTAK=null,ortakAlt="kimlik";
async function yasinOrtak(){
  CUR=null;setTabs();durSes();window.scrollTo({top:0});
  $("baslik").textContent="Yâsîn Ortak Bilgiler";$("altbaslik").textContent="Surenin bütünü · 83 ayet · 29 grup";$("baslikAr").textContent="يس";
  const V=$("view");
  if(!ORTAK){V.innerHTML=`<p class="yukleniyor">Yükleniyor…</p>`;try{ORTAK=await (await fetch("data/36000_ortak.json?v="+SURUM)).json();}catch(e){V.innerHTML="<p>Yüklenemedi. Bağlantını denetleyip yeniden dene.</p>";return;}}
  S.ortakGez=S.ortakGez||[];if(!S.ortakGez.includes(ortakAlt)){S.ortakGez.push(ortakAlt);save();}
  const O=ORTAK;
  const alt=[["kimlik","Kimlik"],["fazilet","Fazilet rivayetleri"],["harita","29 grubun haritası"],["mimari","Mimari ve mesaj"],["bilgi","Bilgi yarışması"],["sinav","Kitap sınavı"],["portre","Kur'an insanı"]];
  V.innerHTML=`<div class="esnek ara-2 sarmal"><button class="geri" id="oGeri">${ikon("arrow-left")}Yâsîn grupları</button><button class="geri" id="oSure">${ikon("arrow-left")}Sureler</button></div>
  <div class="subtabs">${alt.map(([k,a])=>`<button data-o="${k}" class="${ortakAlt===k?"on":""}">${a}</button>`).join("")}</div><div id="oIc" class="izgara ara-3"></div>`;
  $("oGeri").onclick=()=>grupMenu(YASIN());$("oSure").onclick=()=>anaSayfa();
  V.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{ortakAlt=b.dataset.o;yasinOrtak();});
  const el=$("oIc"),p=t=>`<p class="satir-17">${esc(t)}</p>`;
  if(ortakAlt==="kimlik"){
    el.innerHTML=`<div class="sure-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${O.kimlik.map(k=>`<div class="sinir kose-2 imlec-ok sure-kart"><span class="sno">${esc(k.baslik)}</span><span class="kalin-7">${esc(k.deger)}</span></div>`).join("")}</div>
    <h3 class="m0">Adları</h3>${O.adlar.map(a=>`<p><b>${esc(a.ad)}:</b> ${esc(a.anlam)}</p>`).join("")}`;
  }else if(ortakAlt==="fazilet"){
    el.innerHTML=`<p>Kitabınız Yâsîn'in faziletiyle ilgili rivayetleri kaynağı ve hadis âlimlerinin değerlendirmesiyle birlikte veriyor:</p>${O.fazilet.map(x=>`<div class="read-ayet"><p>${esc(x.metin)}</p><p class="kucuk-yazi"><b>Kaynak:</b> ${esc(x.kaynak)}</p><p class="kucuk-yazi"><b class="renk-tehlike">Değerlendirme:</b> ${esc(x.derece)}</p></div>`).join("")}`;
  }else if(ortakAlt==="harita"){
    const k=YASIN();
    el.innerHTML=`<p>Sure 29 gruba ayrılıyor. Bir gruba dokununca o grubun çalışması açılır.</p>${O.gruplar.map((g,i)=>{const gr=k.gruplar.find(x=>x.bas===g.bas);const y=gr?yildizSay(gr.id):0;
      return `<button class="oz" data-gid="${gr?gr.id:""}" style="grid-template-columns:auto 1fr auto"><span class="no">${i+1}</span><span><b>${g.bas}-${g.son}. ayetler · ${esc(g.ad)}</b>${g.kelime?` <span class="renk-vurgu">· ${esc(g.kelime)}</span>`:""}<br><span class="yari-kalin">${esc(g.ozet)}</span><br><span class="kucuk-yazi kalin-7 renk-asil">${esc(g.anahtar_ayet)}</span></span><span class="renk-vurgu durum">${"★".repeat(y)}</span></button>`;}).join("")}`;
    el.querySelectorAll("[data-gid]").forEach(b=>b.onclick=()=>{if(b.dataset.gid)ac(+b.dataset.gid);});
  }else if(ortakAlt==="mimari"){
    el.innerHTML=`<h3 class="m0">Surenin mimarisi</h3>${O.mimari.map(p).join("")}<h3 class="m0">Fikir, mesaj ve öğreti</h3>${O.mesaj.map(p).join("")}`;
  }else if(ortakAlt==="bilgi"){
    quiz({title:"Yâsîn bilgi yarışması",items:shuffle(O.bilgi),build:q=>({html:`<p class="yazi-4 kalin">${esc(q.q)}</p>`,answer:q.a,opts:shuffle(q.o),tek:true}),geri:()=>{ortakAlt="bilgi";yasinOrtak();}});
  }else if(ortakAlt==="sinav"){
    const Sn=O.sinav;S.ortakSinav=S.ortakSinav||{};
    el.innerHTML=`<p>Yâsîn Ortak Bilgiler kitabınızdaki ${Sn.sorular.length} soru, on kısma göre. Her sorudan sonra kitaptaki kısa açıklama gösterilir.</p><button class="primary" data-k="0">Karışık 20 soru</button>
    <div class="sure-grid">${Sn.kisimlar.map(k=>{const n=Sn.sorular.filter(q=>q.kisim===k.no).length,b=S.ortakSinav[k.no];return `<button class="sure-kart ${(b||0)>=80?"tam":""}" data-k="${k.no}"><span class="ust"><span class="sno">${k.no}. kısım</span><span class="yild"><b>${b!==undefined?"%"+b:""}</b></span></span><span class="sad">${esc(k.ad)}</span><span class="sbilgi">Bölüm ${esc(k.bolumler)} · ${n} soru</span></button>`;}).join("")}</div>`;
    el.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{const k=+b.dataset.k;const h=k?shuffle(Sn.sorular.filter(q=>q.kisim===k)):shuffle(Sn.sorular).slice(0,20);
      quiz({title:k?`${k}. kısım`:"Karışık sınav",items:h,build:q=>({html:`<p class="yazi-4 kalin">${esc(q.q)}</p>`,answer:q.a,opts:shuffle(q.o),tek:true,aciklama:q.aciklama}),
        bitince:(d,n)=>{if(k){S.ortakSinav[k]=Math.max(S.ortakSinav[k]||0,Math.round(d/n*100));save();}},geri:()=>{ortakAlt="sinav";yasinOrtak();}});});
  }else{
    const P=O.portre;
    el.innerHTML=`${P.baslik?`<p><b>${esc(P.baslik)}</b></p>`:""}${p(P.giris)}${P.bolumler.map(b=>`<div class="bolum"><h3>${esc(b.ad)} · ${esc(b.alt||"")}</h3>${P.oz.map((o,i)=>o.b!==b.ad?"":`<button class="oz" data-po="${i}"><span class="no">${i+1}</span><span>${esc(o.ad)}</span><span></span></button><div id="po${i}" hidden></div>`).join("")}</div>`).join("")}`;
    el.querySelectorAll("[data-po]").forEach(b=>b.onclick=()=>{const i=+b.dataset.po,d=$("po"+i);if(!d.hidden){d.hidden=true;return;}const o=P.oz[i];d.hidden=false;d.className="detay pop";
      d.innerHTML=`<p>${esc(o.kisa)}</p><div class="satir"><b>Günlük hayatta</b><span>${o.hayat.map(esc).join("<br>")}</span></div><div class="satir"><b>Zıddı</b><span>${esc(o.zit)}</span></div><div class="satir"><b>Kendine sor</b><span>${esc(o.sor)}</span></div><div class="satir"><b>Bugün dene</b><span>${esc(o.dene)}</span></div><div class="satir"><b>Dayanak</b><span>${esc(o.dayanak)}</span></div>`;});
  }
}
