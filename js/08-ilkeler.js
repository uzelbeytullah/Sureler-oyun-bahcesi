/* Sureler Oyun Bahçesi · İlkeler ve ilke atlası */
/* ---------- İlkeler ---------- */
async function ilkeYukle(no){return (CACHE[no]&&CACHE[no]._ilke)||null;}

let ilkeAlt="kart";
const gunSirasi=()=>Math.floor((new Date()-new Date(new Date().getFullYear(),0,0))/864e5);
function ayetBul(n){const i=n-(CUR.ilkAyet||1);return CUR.ayetler[i]?{i,a:CUR.ayetler[i]}:null;}
function ilkeler(){
  const V=$("view"),L=CUR.ilke;
  const alt=[["kart","İlke kartları"],["agac","Bilgi ağacı"],["gun","Günün ilkesi"],["tasi","Başka alana taşı"],["oyun","İlke oyunları"],["kavram","Kavramlar ve temalar"]];
  V.innerHTML=`<h2>İlkeler</h2><p>${esc(CUR.ad)} suresinden çıkan ${L.ilkeler.length} ilke, kitabınızın 11. ve 21. bölümlerinden.</p>
  <div class="subtabs">${alt.map(([k,a])=>`<button data-a="${k}" class="${ilkeAlt===k?"on":""}">${a}</button>`).join("")}</div><div id="ialt" style="display:grid;gap:12px"></div>`;
  V.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{ilkeAlt=b.dataset.a;ilkeler();});
  ({kart:iKart,agac:iAgac,gun:iGun,tasi:iTasi,oyun:iOyun,kavram:iKavram})[ilkeAlt]($("ialt"));
}
function iKart(el){
  const L=CUR.ilke;
  el.innerHTML=`${L.temel_dusunce&&L.temel_dusunce.length?`<details class="detay"><summary><b>Temel ilkelerden okumak nedir?</b></summary>${L.temel_dusunce.map(p=>`<p>${esc(p)}</p>`).join("")}</details>`:""}
  ${(L.ilke_aciklama||[]).map(p=>`<p>${esc(p)}</p>`).join("")}
  <div class="sure-grid" style="grid-template-columns:repeat(auto-fill,minmax(230px,1fr))">${L.ilkeler.map((x,i)=>`<button class="sure-kart" data-ik="${i}" style="gap:6px"><span class="ust"><span class="sno">${x.no}. ilke</span><span class="yild" style="letter-spacing:0"><b>${x.ayetler.length?x.ayetler.join(", ")+". ayet":""}</b></span></span><span class="sad">${esc(x.ad)}</span><span style="font-weight:600">${esc(x.tanim)}</span></button>`).join("")}</div>
  <div id="ikd" hidden></div>`;
  el.querySelectorAll("[data-ik]").forEach(b=>b.onclick=()=>{const x=L.ilkeler[+b.dataset.ik],d=$("ikd");
    d.hidden=false;d.className="detay pop";
    d.innerHTML=`<p><b style="font-size:19px">${esc(x.ad)}</b></p><p>${esc(x.tanim)}</p>${x.ayetler.map(n=>{const r=ayetBul(n);return r?`<div class="read-ayet"><span class="n-ayet">${n}</span><div class="kelimeler" lang="ar">${r.a.w.map((w,j)=>`<span class="k${j%12}">${w.a}</span>`).join("")}</div><p class="meal">${esc(r.a.meal)}</p></div>`:"";}).join("")}<button id="ikk">Kapat</button>`;
    $("ikk").onclick=()=>{d.hidden=true;};d.scrollIntoView({block:"nearest",behavior:kaydirmaDavranisi()});});
}
function iAgac(el){
  const L=CUR.ilke,A=L.agac,T=ekS("ilke");T.agac=T.agac||{};const bugun=today();
  const yapraklar=A.dallar.flatMap(d=>d.yapraklar);
  const say=k=>(T.agac[k]||[]).length;
  const dolu=yapraklar.filter(y=>say(y.no)>0).length;T.agacToplam=yapraklar.length;
  const renk=n=>n===0?"transparent":n<3?"var(--ok-bg)":"var(--ok)";const yazi=n=>n>=3?"var(--bg)":"var(--ink)";
  el.innerHTML=`<p>Yapraklar günlük davranışlardır. Bir davranışı bugün yaşadıysan yaprağına dokun; yaprak yeşerir. Üç gün yaşadığın yaprak koyu yeşil olur.</p>
  <p><b>${dolu} / ${yapraklar.length} yaprak yeşerdi</b></p>
  <div style="display:grid;gap:10px;justify-items:center;text-align:center">
   <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;width:100%">${A.dallar.map(d=>`<div style="border:2px solid var(--ok);border-radius:16px;padding:8px;display:grid;gap:6px"><b style="color:var(--ok)">${esc(d.ad)}</b>${d.yapraklar.map(y=>{const n=say(y.no),bugunVar=(T.agac[y.no]||[]).includes(bugun);
     return `<button data-y="${y.no}" style="border-radius:999px 999px 999px 4px;border-color:var(--ok);background:${renk(n)};color:${yazi(n)};font-weight:800">${bugunVar?"✓ ":""}${esc(y.ad)}${n?` · ${n}`:""}</button>`;}).join("")}</div>`).join("")}</div>
   <div style="width:28px;height:28px;border-left:6px solid var(--gold);border-right:6px solid var(--gold)"></div>
   <div style="border:3px solid var(--gold);border-radius:12px;padding:10px 16px;background:var(--gold-bg)"><b>Gövde: ${esc(A.govde.ad)}</b>${A.govde.ayetler&&A.govde.ayetler.length?` <span>(${A.govde.ayetler.join(", ")}. ayet)</span>`:""}</div>
   <div style="width:28px;height:20px;border-left:6px solid var(--gold);border-right:6px solid var(--gold)"></div>
   <div style="border-top:3px dashed var(--gold);padding-top:8px;width:100%"><b>Kökler: ${esc(A.kokler)}</b></div>
  </div>
  ${A.aciklama.map(p=>`<p>${esc(p)}</p>`).join("")}`;
  el.querySelectorAll("[data-y]").forEach(b=>b.onclick=()=>{const k=b.dataset.y;T.agac[k]=T.agac[k]||[];
    if(T.agac[k].includes(bugun)){T.agac[k]=T.agac[k].filter(x=>x!==bugun);}else{T.agac[k].push(bugun);gun();T.agacPuan=T.agacPuan||{};if(T.agacPuan[k]!==bugun){T.agacPuan[k]=bugun;S.puan+=5;toast("Yaprak yeşerdi, 5 puan");}else toast("Yaprak yeşerdi");}
    checkBadges();save();renderStats();iAgac(el);});
}
function iGun(el){
  const L=CUR.ilke,T=ekS("ilke");T.gun=T.gun||{};const bugun=today();
  const x=L.ilkeler[gunSirasi()%L.ilkeler.length];const kayit=T.gun[bugun];
  const son7=[...Array(7)].map((_,k)=>{const d=new Date();d.setDate(d.getDate()-6+k);const key=d.toLocaleDateString("sv-SE");return {g:d.toLocaleDateString("tr-TR",{weekday:"short",day:"numeric"}),r:T.gun[key]};});
  const D={2:["Uyguladım","var(--ok)","✓"],1:["Kısmen","var(--gold)","½"],0:["Yarın yeniden","var(--lapis)","🌱"]};
  el.innerHTML=`<div class="odak"><p style="font-size:14px"><b>Günün ilkesi</b></p><p style="font-size:21px;font-weight:800">${esc(x.ad)}</p><p>${esc(x.tanim)}</p>${x.ayetler.length?`<p style="font-size:14px">${x.ayetler.join(", ")}. ayet</p>`:""}</div>
  <p><b>Akşam: Bugün bu ilkeyi ne kadar uyguladın?</b></p>
  <div style="display:flex;gap:8px;flex-wrap:wrap">${[2,1,0].map(d=>`<button data-d="${d}" class="${kayit&&kayit.d===d?"on":""}">${D[d][0]}</button>`).join("")}</div>
  <h3 style="margin:0">Haftalık karne</h3>
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">${son7.map(g=>`<div style="border:2px solid ${g.r?D[g.r.d][1]:"var(--line)"};border-radius:10px;padding:6px 2px;text-align:center"><b style="font-size:12px">${g.g}</b><br><b style="font-size:20px;color:${g.r?D[g.r.d][1]:"var(--line)"}">${g.r?D[g.r.d][2]:"·"}</b></div>`).join("")}</div>
  ${L.dongu&&L.dongu.adimlar&&L.dongu.adimlar.length?`<h3 style="margin:0">Günlük tekrar ve geri bildirim döngüsü</h3><p>${esc(L.dongu.aciklama)}</p>
  <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">${L.dongu.adimlar.map((a,i)=>`${i?'<b style="color:var(--gold)">→</b>':""}<span style="border:2px solid var(--lapis);border-radius:10px;padding:6px 10px"><b>${esc(a.ad)}</b><br><span style="font-size:13px;font-weight:700">${esc(a.metin)}</span></span>`).join("")}</div>`:""}`;
  el.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{const d=+b.dataset.d,yeni=!T.gun[bugun];T.gun[bugun]={no:x.no,d};gun();if(yeni&&d>0){S.puan+=d===2?10:5;toast(d===2?"Maşallah, 10 puan":"5 puan; yarın daha iyisi");}else if(d===0)toast("Olsun, yarın yeniden deneriz 🌱");checkBadges();save();renderStats();iGun(el);});
}
function iTasi(el){
  const L=CUR.ilke,T=ekS("ilke");T.tasima=T.tasima||{};
  el.innerHTML=`<p>Surenin ilkeleri yalnız ibadette değil, hayatın her alanında yol gösterir. Kitaptaki örnekleri oku, sonra kendi hayatından bir örnek yaz.</p>
  ${L.tasima.map((t,i)=>`<div class="read-ayet"><p><b style="font-size:19px;color:var(--lapis)">${esc(t.alan)}</b>${t.ilke?` · ${esc(t.ilke)}`:""}</p>${t.metin.split(/(?<=\.)\s+(?=[A-ZÇĞİÖŞÜ][^:]{0,30}\(Ayet)/).map(p=>`<p>${esc(p)}</p>`).join("")}
   <label style="display:grid;gap:4px"><b style="font-size:14px">Benim örneğim</b><textarea class="ara" rows="2" data-t="${i}" style="resize:vertical" placeholder="Bu alanda bu ilkeyi nasıl uygulayabilirim?">${esc(T.tasima[i]||"")}</textarea></label></div>`).join("")}
  ${L.yeni_bakislar&&L.yeni_bakislar.length?`<h3 style="margin:0">Alanlar arası yeni bakışlar</h3>${L.yeni_bakislar.map(y=>`<p><b>${esc(y.ad)}:</b> ${esc(y.metin)}</p>`).join("")}`:""}`;
  el.querySelectorAll("[data-t]").forEach(t=>t.oninput=()=>{T.tasimaPuan=T.tasimaPuan||{};const ilk=!T.tasimaPuan[t.dataset.t];T.tasima[t.dataset.t]=t.value;if(ilk&&t.value.trim().length>10){T.tasimaPuan[t.dataset.t]=1;S.puan+=10;renderStats();toast("Örneğin kaydedildi, 10 puan");}yaziKaydet();});
}
function iOyun(el){
  const L=CUR.ilke;const sorular=[];
  const ayetMetin=x=>x.ayetler.length?x.ayetler.join(", ")+". ayet":"";
  const tumAyet=[...new Set(L.ilkeler.map(ayetMetin).filter(Boolean))];
  L.ilkeler.forEach(x=>{
    sorular.push({q:`Bu tanım hangi ilkenin?`,ek:x.tanim,a:x.ad,o:secenek(x.ad,L.ilkeler.map(y=>y.ad))});
    if(ayetMetin(x)&&tumAyet.length>=3)sorular.push({q:`“${x.ad}” hangi ayetten çıkar?`,a:ayetMetin(x),o:secenek(ayetMetin(x),tumAyet)});
  });
  (L.kalip||[]).filter(k=>k.kalip&&k.ilke&&k.konu).forEach(k=>{sorular.push({q:`“${k.konu}” konusunda bu söz hangi okumaya örnektir?`,ek:k.kalip,a:"Kalıpla (benzetmeyle) okuma",o:["Kalıpla (benzetmeyle) okuma","Temel ilkelerden okuma"]});
    sorular.push({q:`“${k.konu}” konusunda bu söz hangi okumaya örnektir?`,ek:k.ilke,a:"Temel ilkelerden okuma",o:["Kalıpla (benzetmeyle) okuma","Temel ilkelerden okuma"]});});
  if((L.kavramlar||[]).length>=4)L.kavramlar.forEach(k=>sorular.push({q:"Bu tanım hangi kavramın?",ek:k.tanim,a:k.ad,o:secenek(k.ad,L.kavramlar.map(y=>y.ad))}));
  el.innerHTML=`<p>İlke tanımları, ilkelerin ayetleri, kalıpla okuma ile temel ilkelerden okuma farkı ve kavramlar üzerine karışık sorular. Toplam ${sorular.length} soru; her oyunda 12 tanesi gelir.</p><button class="primary" id="ioyun">Oyuna başla</button>`;
  $("ioyun").onclick=()=>quiz({title:"İlke oyunu",items:shuffle(sorular).slice(0,12),build:q=>({html:`<p style="font-size:20px;font-weight:800">${esc(q.q)}</p>${q.ek?`<div class="detay"><p style="font-size:18px">${esc(q.ek)}</p></div>`:""}`,answer:q.a,opts:shuffle(q.o),tek:true}),
    bitince:(d,n)=>{const T=ekS("ilke");T.oyunEnIyi=Math.max(T.oyunEnIyi||0,Math.round(d/n*100));checkBadges();save();},geri:()=>{ilkeAlt="oyun";ilkeler();}});
}
function iKavram(el){
  const L=CUR.ilke;const blok=(bas,list,f)=>list&&list.length?`<h3 style="margin:0">${bas}</h3><div class="sure-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${list.map(f).join("")}</div>`:"";
  const kart=(ad,metin,ay)=>`<div class="sure-kart" style="border:2px solid var(--line);border-radius:14px;cursor:default"><span class="sad">${esc(ad)}</span><span style="font-weight:600">${esc(metin)}</span>${ay&&ay.length?`<span class="sbilgi">${ay.join(", ")}. ayet</span>`:""}</div>`;
  el.innerHTML=blok("Kavramlar",L.kavramlar,k=>kart(k.ad,k.tanim,k.ayetler))+blok("Temalar",L.temalar,k=>kart(k.ad,k.aciklama,k.ayetler))+blok("Anahtar kelimeler",L.anahtar,k=>kart(k.kelime,k.anlam,k.ayetler));
}
BADGES.push(["agac1","Bir surenin bilgi ağacındaki bütün yapraklar yeşerdi",()=>Object.values(S.sure).some(x=>x.ilke&&x.ilke.agac&&x.ilke.agacToplam&&Object.keys(x.ilke.agac).filter(k=>x.ilke.agac[k].length).length>=x.ilke.agacToplam)]);
BADGES.push(["ilke7","Günün ilkesini yedi gün uyguladı",()=>Object.values(S.sure).some(x=>x.ilke&&x.ilke.gun&&Object.values(x.ilke.gun).filter(g=>g.d===2).length>=7)]);
BADGES.push(["ilkeOyun","İlke oyununda %80",()=>Object.values(S.sure).some(x=>x.ilke&&(x.ilke.oyunEnIyi||0)>=80)]);


/* ---------- İlke atlası ---------- */
let ATLAS=null,atlasTema=null,atlasAra="",atlasGorunum="tema";
async function atlas(){
  CUR=null;setTabs();durSes();
  $("baslik").textContent="İlke atlası";$("altbaslik").textContent="Bütün surelerdeki ilkeler, ortak temalarına göre";$("baslikAr").textContent="القرآن";
  const V=$("view");
  if(!ATLAS){V.innerHTML=`<p class="yukleniyor">Atlas yükleniyor…</p>`;try{ATLAS=await (await fetch("data/atlas.json?v="+SURUM)).json();}catch(e){V.innerHTML="<p>Atlas yüklenemedi. Bağlantını denetleyip yeniden dene.</p>";return;}}
  const T=ATLAS.temalar,top=T.reduce((a,t)=>a+t.uyeler.length,0);
  const kucult=t=>String(t).toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ’'‘]/g,"");
  const gez=S.atlasGezilen=S.atlasGezilen||[];
  if(atlasTema){const t=T.find(x=>x.id===atlasTema);
    if(!gez.includes(t.id)){gez.push(t.id);checkBadges();save();}
    const gruplu={};t.uyeler.forEach(u=>{(gruplu[u.s]=gruplu[u.s]||[]).push(u);});
    const sira=Object.keys(gruplu).map(Number).sort((a,b)=>sureSira(a)-sureSira(b));
    V.innerHTML=`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="geri" id="atGeri">← Atlas</button><button class="geri" id="atSure">← Sureler</button></div>
    <h2>${esc(t.ad)}</h2><p>${esc(t.aciklama)}</p><p><b>${t.uyeler.length} ilke · ${sira.length} sure ya da grup</b></p>
    ${sira.map(sid=>`<div class="read-ayet"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><b style="font-size:19px;color:var(--lapis)">${esc(adBul(sid))}</b><button data-git="${sid}" style="min-height:44px;padding:4px 10px">Surenin ilkelerine git</button></div>
      ${gruplu[sid].map(u=>`<p><b>${esc(u.ad)}:</b> ${esc(u.tanim)}${u.ayetler&&u.ayetler.length?` <span style="font-size:14px;font-weight:800;color:var(--gold)">(${u.ayetler.join(", ")}. ayet)</span>`:""}</p>`).join("")}</div>`).join("")}`;
    $("atGeri").onclick=()=>{atlasTema=null;atlas();};$("atSure").onclick=()=>{atlasTema=null;anaSayfa();};
    V.querySelectorAll("[data-git]").forEach(b=>b.onclick=()=>{ilkeAlt="kart";ac(+b.dataset.git,"ilkeler");});
    window.scrollTo({top:0});return;}
  V.innerHTML=`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="geri" id="atSure">← Sureler</button></div>
  <h2>İlke atlası</h2><p>Kitaplarınızdaki ${top} ilke ${T.length} ortak temada toplandı. Bir temaya dokununca o ilkenin hangi surelerde, nasıl geçtiğini görürsün. Gezdiğin temalar işaretlenir.</p>
  <p style="font-size:14px">İlkeler kitaplarınızdan alındı; temalara ayırma ve tema açıklamaları yapay zekâ ile yapıldı.</p>
  <div class="subtabs"><button data-g="tema" class="${atlasGorunum==="tema"?"on":""}">Temalar</button><button data-g="ara" class="${atlasGorunum==="ara"?"on":""}">İlke ara</button></div>
  <div id="atIc" style="display:grid;gap:10px"></div>`;
  $("atSure").onclick=()=>anaSayfa();
  V.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{atlasGorunum=b.dataset.g;atlas();});
  const ic=$("atIc");
  if(atlasGorunum==="tema"){
    ic.innerHTML=`<p><b>${gez.length} / ${T.length} tema gezildi</b></p><div class="sure-grid" style="grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">${T.map(t=>{const ss=new Set(t.uyeler.map(u=>u.s)).size;
      return `<button class="sure-kart ${gez.includes(t.id)?"tam":""}" data-t="${t.id}"><span class="ust"><span class="sno">${t.uyeler.length} ilke · ${ss} sure</span><span class="yild"><b>${gez.includes(t.id)?"✓":""}</b></span></span><span class="sad">${esc(t.ad)}</span><span class="sbilgi">${esc(t.aciklama)}</span></button>`;}).join("")}</div>`;
    ic.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{atlasTema=b.dataset.t;atlas();});
  }else{
    ic.innerHTML=`<input class="ara" id="atAra" type="search" placeholder="Bir kelime yaz: şükür, sabır, adalet…" aria-label="İlke ara" value="${esc(atlasAra)}"><div id="atSonuc" style="display:grid;gap:8px"></div>`;
    const ciz=()=>{const q=kucult(atlasAra.trim());const r=[];if(q.length>=2)T.forEach(t=>t.uyeler.forEach(u=>{if(kucult(u.ad+" "+u.tanim).includes(q))r.push({t,u});}));
      $("atSonuc").innerHTML=q.length<2?"<p>En az iki harf yaz.</p>":r.length?`<p><b>${r.length} ilke bulundu</b></p>`+r.slice(0,80).map(({t,u})=>`<div class="read-ayet"><p style="font-size:14px"><b style="color:var(--lapis)">${esc(adBul(u.s))}</b> · tema: <button data-t="${t.id}" style="min-height:44px;padding:2px 8px">${esc(t.ad)}</button></p><p><b>${esc(u.ad)}:</b> ${esc(u.tanim)}</p></div>`).join(""):"<p>Bu kelimeyle bir ilke bulunamadı.</p>";
      $("atSonuc").querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{atlasTema=b.dataset.t;atlas();});};
    $("atAra").oninput=e=>{atlasAra=e.target.value;ciz();};ciz();
  }
  window.scrollTo({top:0});
}
function sureSira(id){if(id===1)return 0;if(id===2255)return 1;if(id>36000)return 2+(id-36000)/1000;return id;}
BADGES.push(["atlas10","İlke atlasında on tema gezdi",()=>(S.atlasGezilen||[]).length>=10]);
BADGES.push(["atlasHepsi","İlke atlasının bütün temalarını gezdi",()=>ATLAS&&(S.atlasGezilen||[]).length>=ATLAS.temalar.length]);
