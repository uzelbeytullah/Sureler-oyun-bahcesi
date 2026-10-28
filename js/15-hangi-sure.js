/* Sureler Oyun Bahçesi · Hangi sure? oyunu */
/* ========== HANGİ SURE? Kârinin sesinden kısa bir parça dinle, hangi sure olduğunu bul ========== */
function hsAdaylar(){
  /* Bilinen sureler öne: çalışılmış olanlar, sonra kısa sureler; Yâsîn grupları "Yâsîn" adıyla tek aday */
  const calisilan=new Set(Object.keys(S.sure||{}).map(Number));
  const L=[];KATALOG.forEach(k=>{if(k.gruplar){const g=k.gruplar.filter(x=>calisilan.has(x.id));const sec=(g.length?g:k.gruplar)[Math.floor(Math.random()*(g.length||k.gruplar.length))];L.push({ad:k.ad,adAr:k.adAr,no:sec.id,ust:36,bilinen:g.length>0});}
    else L.push({ad:k.ad,adAr:k.adAr,no:k.no,bilinen:calisilan.has(k.no)});});
  return L;}
async function hangiSure(){
  CUR=null;baslik();setTabs();durSes();$("baslik").textContent="Hangi sure?";$("altbaslik").textContent="Kâriyi dinle, hangi sure olduğunu bul";
  const V=$("view");V.innerHTML=`<p class="yukleniyor">Sesler hazırlanıyor…</p>`;
  const L=hsAdaylar();const kucukMu=kucuk();
  let havuz=L.filter(x=>x.bilinen);if(havuz.length<4)havuz=havuz.concat(L.filter(x=>!x.bilinen&&(x.no>=105||x.no===1))).slice(0,Math.max(havuz.length,8));
  if(havuz.length<4)havuz=L;
  const secim=shuffle(havuz).slice(0,Math.min(8,havuz.length));
  const items=[];
  await Promise.all(secim.filter(x=>!CACHE[x.no]).map(x=>fetch("data/"+String(x.no).padStart(3,"0")+".json?v="+SURUM).then(r=>r.ok?r.json():null).then(d=>{if(d)CACHE[x.no]=d;}).catch(()=>{})));   // hepsi aynı anda iner
  for(const x of secim){try{if(!CACHE[x.no])continue;
      const d=CACHE[x.no],b=d.ses&&d.ses.bas;if(!b||!b.length)continue;const i=Math.floor(Math.random()*b.length);
      const son=i+1<b.length?b[i+1]:d.ses.son;const uz=kucukMu?6:4;items.push({...x,bas:b[i],son:Math.min(son,b[i]+uz),son2:Math.min(d.ses.son,b[i]+uz*2.5)});}catch(e){}}
  if(items.length<3){V.innerHTML=`<p>Sesler yüklenemedi. İnternet bağlantını denetleyip yeniden dene.</p><button class="geri" id="hsG">${ikon("arrow-left")}Sureler</button>`;$("hsG").onclick=()=>anaSayfa();return;}
  const adlar=[...new Set(L.map(x=>x.ad))];let su=null;
  window.hsDinle=(uzun)=>{if(!su)return;durSes();hizUygula();calParca(su.no,su.bas,uzun?su.son2:su.son);};
  sayacIsle("hangi");
  quiz({title:"Hangi sure?",items,tek:true,
    build:x=>{su=x;setTimeout(()=>window.hsDinle(false),300);
      return {html:`<p class="yazi-4 kalin">Dinle: bu hangi sure?</p><div class="esnek ara-2 sarmal"><button class="yazi-4 primary" data-hs="0">${ikon("volume-2")} Yeniden dinle</button><button data-hs="1">Biraz daha dinle</button></div>`,
        answer:x.ad,opts:secenek(x.ad,adlar,kucukMu?2:3),tek:true,buyuk:kucukMu,otoSesYok:true,sonuc:()=>{}};},
    bitince:(d,n)=>{durSes();S.hangiEnIyi=Math.max(S.hangiEnIyi||0,Math.round(d/n*100));if(d===n)S.hangiTam=true;checkBadges();save();},
    geri:()=>{durSes();anaSayfa();}});}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-hs]");if(b&&window.hsDinle)window.hsDinle(b.dataset.hs==="1");});
BADGES.push(["hangi","Hangi sure? oyununda hepsini bildi",()=>!!S.hangiTam]);
