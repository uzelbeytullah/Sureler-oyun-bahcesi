/* Sureler Oyun Bahçesi · Ebeveyn için yazdırılabilir haftalık karne (son 7 gün, emek odaklı; puan ve kardeş kıyası yok) */
/* Sağlanan genel fonksiyonlar: karneSayfa(kisiId), karneOzetMetni(kisiId), karneVeri(kisiId) */

/* karne sayfasının stilleri: css dosyasına değil buraya, bir kez eklenir */
function karneStil(){if(document.getElementById("karneStil"))return;const st=document.createElement("style");st.id="karneStil";
  st.textContent=`
.krn{display:grid;gap:var(--s-3);color:var(--ink);background:var(--surface);border:2px solid var(--line);border-radius:var(--r-3);padding:var(--s-4)}
.krn-bas{display:flex;justify-content:space-between;align-items:flex-start;gap:var(--s-3);flex-wrap:wrap;border-bottom:3px solid var(--primary);padding-bottom:var(--s-2)}
.krn-bas h2{margin:0;font-size:var(--fs-5);color:var(--primary)}
.krn-bas p{margin:2px 0 0}
.krn-gir{margin:0;font-size:var(--fs-3)}
.krn-bol{display:grid;gap:var(--s-2);break-inside:avoid;page-break-inside:avoid}
.krn-bol h3{margin:0;font-size:var(--fs-4);color:var(--primary);border-bottom:1px solid var(--line);padding-bottom:4px}
.krn-sayilar{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:var(--s-2)}
.krn-sayi{border:1px solid var(--line);border-radius:var(--r-2);padding:var(--s-2);display:grid;gap:2px}
.krn-sayi b{font-size:var(--fs-5);color:var(--ink)}
.krn-sayi span{font-size:var(--fs-2)}
.krn-tablo{width:100%;border-collapse:collapse;font-size:var(--fs-2)}
.krn-tablo th,.krn-tablo td{text-align:left;padding:4px 6px;border-bottom:1px solid var(--line);vertical-align:middle}
.krn-tablo td.krn-n{text-align:center;white-space:nowrap}
.krn-cubuk{display:flex;height:12px;min-width:90px;border:1px solid var(--line);border-radius:var(--r-pill);overflow:hidden;background:var(--surface)}
.krn-cubuk i{display:block;height:100%}
.krn-cubuk .krn-ezb{background:var(--success)}
.krn-cubuk .krn-tkr{background:var(--accent)}
.krn-anahtar{font-size:var(--fs-1);display:flex;gap:var(--s-3);flex-wrap:wrap}
.krn-anahtar i{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-1px;margin-right:4px}
.krn-liste{margin:0;padding-left:1.3em;display:grid;gap:4px}
.krn-oneri li{font-size:var(--fs-3)}
.krn-not{display:grid;gap:var(--s-4);padding-top:var(--s-2)}
.krn-not span{display:block;border-bottom:1px solid var(--ink);height:1.6em;opacity:.6}
.krn-alt{font-size:var(--fs-1);display:flex;justify-content:space-between;gap:var(--s-2);flex-wrap:wrap;border-top:1px solid var(--line);padding-top:var(--s-2)}
.krn-dugmeler{display:flex;gap:var(--s-2);flex-wrap:wrap;align-items:center}
.krn{page:karne}
@page karne{size:A4 portrait;margin:12mm}
@media print{
 header.top,.alt-bilgi,.toast,.kutla,.mola,.krn-dugmeler,.yazdirma-yok{display:none!important}
 html,body{background:#fff!important}
 section.panel{border:0!important;padding:0!important;background:#fff!important;box-shadow:none!important}
 .krn{border:0;padding:0;background:#fff;color:#000;font-size:11pt;gap:8pt;-webkit-print-color-adjust:exact;print-color-adjust:exact}
 .krn-bas h2,.krn-bol h3{color:#1D4AA0}
 .krn-bas{border-bottom-color:#1D4AA0}
 .krn-sayi{border-color:#999}
 .krn-sayi b{font-size:16pt;color:#000}
 .krn-tablo th,.krn-tablo td{border-bottom-color:#bbb}
 .krn-cubuk{border-color:#777;background:#fff}
 .krn-cubuk .krn-ezb{background:#11734A}
 .krn-cubuk .krn-tkr{background:#C98A00}
 .krn-not span{border-bottom-color:#000;opacity:1}
}`;
  document.head.appendChild(st);}

/* kişinin kaydı: aktif kişiyse bellekteki S, değilse localStorage (lsAnahtar ile) */
function karneKayit(kisiId){const id=kisiId||PROF.aktif;
  if(!id||id===PROF.aktif){try{if(PROF.aktif)save();}catch(e){}return {id,X:S};}
  let X=null;try{X=JSON.parse(localStorage.getItem(lsAnahtar(id))||"null");}catch(e){}
  try{X=normalize(X);}catch(e){X=X||{};}return {id,X:X||{}};}
const karneTarih=g=>new Date(g+"T12:00").toLocaleDateString("tr-TR",{day:"numeric",month:"long"});
/* ezberDurum anahtarındaki sure/grup için ayet sayısı ve ad */
function karneSureBilgi(no){no=+no;if(no>36000){const g=(YASIN()||{gruplar:[]}).gruplar.find(x=>x.id===no);return g?{ad:adBul(no),top:g.son-g.bas+1,sira:KATALOG.indexOf(YASIN())+g.id/1e6}:null;}
  const k=KATALOG.find(x=>x.no===no);return k&&!k.gruplar?{ad:k.ad,top:k.ayet,sira:KATALOG.indexOf(k)}:null;}
const karneDuzYazi=h=>String(h||"").replace(/<[^>]+>/g," ").replace(/&[a-z#0-9]+;/gi," ").replace(/[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]+/g," ").replace(/\s+/g," ").trim();

/* Karnenin bütün sayıları (ekran ve paylaşım metni aynı veriden) */
function karneVeri(kisiId){const {id,X}=karneKayit(kisiId);const p=PROF.liste.find(x=>x.id===id)||{};const bug=today();
  const gunler=[...Array(7)].map((_,k)=>{const d=new Date();d.setDate(d.getDate()-6+k);return d.toLocaleDateString("sv-SE");});
  const ilk=gunler[0],haftada=g=>!!g&&g>=ilk&&g<=bug;
  const L=X.log||{},top={soru:0,dogru:0,tekrar:0,hikaye:0,dk:0,dinlet:0,onay:0,halka:0};const zorSay={};
  gunler.forEach(g=>{const x=L[g];if(!x)return;Object.keys(top).forEach(k=>top[k]+=+x[k]||0);
    (x.zor||[]).forEach(z=>{if(!z)return;const k=z.s+"|"+z.a;zorSay[k]=zorSay[k]||{s:+z.s,a:+z.a,n:0};zorSay[k].n++;});});
  const aktifGun=gunler.filter(g=>{const x=L[g];return x&&((x.dk||0)+(x.soru||0)+(x.tekrar||0)+(x.hikaye||0))>0;}).length;
  /* ezber: sure sure */
  const sureler=[];let ezb=0,tkr=0,gec=0,onayBek=0,yeniEzb=0,dinletti=0,onaylandi=0;const tamAralik=EZ_ARALIK[EZ_TAM_KUTU]||30;
  Object.entries(X.sure||{}).forEach(([no,t])=>{const D=(t&&t.ezberDurum)||{};const b=karneSureBilgi(no);const vals=Object.values(D).filter(d=>d&&typeof d==="object");if(!vals.length)return;
    const r={no:+no,ad:b?b.ad:adBul(no),top:b?b.top:vals.length,sira:b?b.sira:999,ezb:0,tkr:0,gec:0};
    vals.forEach(d=>{if(ezbTam(d))r.ezb++;else r.tkr++;if(d.sonraki&&d.sonraki<bug)r.gec++;if(d.onayBekle)onayBek++;
      if(haftada(d.dinletti))dinletti++;if(haftada(d.onaylandi))onaylandi++;
      /* bu hafta ezbere geçen: bu hafta onaylanan ya da (onaysız) son basamağa bu hafta çıkan ayet */
      let gecti=haftada(d.onaylandi);
      if(!gecti&&ezbTam(d)&&!d.onaylandi&&d.kutu===EZ_TAM_KUTU&&d.sonraki){const s=new Date(d.sonraki+"T12:00");s.setDate(s.getDate()-tamAralik);gecti=haftada(s.toLocaleDateString("sv-SE"));}
      if(gecti)yeniEzb++;});
    r.top=Math.max(r.top,r.ezb+r.tkr);ezb+=r.ezb;tkr+=r.tkr;gec+=r.gec;sureler.push(r);});
  sureler.sort((a,b)=>a.sira-b.sira||a.no-b.no);
  /* zorlandığı yerler: "Zorlandım / Hatırlamadım" denen ayetler (gün sayısıyla) ve yanlışlar defterindeki sorular (sure sure) */
  const zor=Object.values(zorSay).map(z=>({tur:"ayet",s:z.s,a:z.a,n:z.n,ad:(z.s>36000?"Yâsîn":adBul(z.s))+" "+z.a+". ayet"}));
  const yz={};Object.values(X.yanlis||{}).forEach(y=>{if(!y||!(y.sonraki>=ilk))return;const s=+y.s||0;yz[s]=yz[s]||{tur:"soru",s,n:0,ornek:""};yz[s].n++;if(!yz[s].ornek)yz[s].ornek=karneDuzYazi(y.html).slice(0,70);});
  Object.values(yz).forEach(y=>{y.ad=(y.s?adBul(y.s):"Genel")+" soruları";});
  const zorlar=zor.concat(Object.values(yz)).sort((a,b)=>b.n-a.n||(a.tur==="ayet"?-1:1)).slice(0,5);
  /* namaz yolu (o kişinin seçimiyle) */
  const nzs=[1,...((X.namazSure&&X.namazSure.length===3)?X.namazSure:NAMAZ_VARSAYILAN)].map(no=>{const k=KATALOG.find(x=>x.no===no)||{ayet:0,ad:String(no)};const D=((X.sure||{})[no]||{}).ezberDurum||{};let n=0;for(let i=0;i<k.ayet;i++)if(ezbTam(D[i]))n++;return {no,ad:k.ad,n,top:k.ayet};});
  const halkaBitti=top.halka>0||!!(X.halka&&X.halka.bitti&&typeof haftaAnahtar==="function"&&X.halka.h===haftaAnahtar());
  const yildiz=KATALOG.reduce((a,k)=>a+(k.gruplar?k.gruplar:[{id:k.no}]).reduce((b,g)=>{const y=(((X.sure||{})[g.id]||{}).yildiz)||{};return b+STAR_GAMES.filter(s=>y[s]).length;},0),0);
  const v={id,ad:p.ad||"",yas:p.yas||0,gunler,ilk,son:bug,aralik:karneTarih(ilk)+" – "+karneTarih(bug),aktifGun,dk:Math.round(top.dk),soru:top.soru,dogru:top.dogru,tekrar:top.tekrar,hikaye:top.hikaye,
    yildiz,yeniEzb,dinletti:Math.max(dinletti,top.dinlet),onaylandi:Math.max(onaylandi,top.onay),halka:halkaBitti,ezb,tkr,gec,onayBek,sureler,zorlar,namaz:nzs};
  v.oneriler=karneOneriler(v,X);return v;}

/* Gelecek hafta için kurallı öneriler: en çok 3, en az 2 madde */
function karneOneriler(v,X){const o=[];
  if(v.gec){const en=v.sureler.filter(s=>s.gec).sort((a,b)=>b.gec-a.gec).slice(0,3).map(s=>`${s.ad} ${s.gec}`).join(", ");
    o.push(`Önce gecikmiş ${v.gec} tekrarı bitirin (${en}). "Bugünün tekrarı" düğmesi bunları sırayla sorar${v.gec>EZ_GUNLUK?`; günde en çok ${EZ_GUNLUK} ayet yeter, birkaç günde biter`:""}.`);}
  if(v.onayBek)o.push(`${v.onayBek} ayet sizi bekliyor: çocuğunuz ezberden okusun, siz dinleyip "Ebeveyn onayı" ekranından onaylayın.`);
  const z=v.zorlar.find(x=>x.tur==="ayet");if(z)o.push(`${z.ad} ayetini birlikte, yavaşça okuyun; önce kâriden dinlemek kolaylaştırır.`);
  const nz=v.namaz.find(x=>x.n<x.top);if(nz)o.push(`Namaz hazırlığı yolunda sırada ${nz.ad} var (${nz.n}/${nz.top} ayet ezberde). Günde bir ayet yeter.`);
  if(!v.gec){const basl=new Set(v.sureler.map(s=>s.no));const aday=[1,...KATALOG.filter(k=>!k.gruplar&&k.no>=78&&k.no<=114).map(k=>k.no).reverse()].find(n=>!basl.has(n)&&!v.namaz.some(x=>x.no===n&&x.n<x.top));
    if(aday){const k=KATALOG.find(x=>x.no===aday);o.push(`Yeni sure olarak ${k.ad} (${k.ayet} ayet) ile başlayabilir; önce "Oku" ve "Kelime" oyunlarıyla tanışsın.`);}}
  if(v.aktifGun<3)o.push("Kısa ama sık: her gün aynı saatte 5–10 dakika, haftada birkaç uzun oturumdan daha kalıcıdır.");
  if(o.length<2)o.push("Bu hafta öğrendiği bir ayeti sofrada ailesine okusun; dinlemeniz ona güç verir.");
  if(o.length<2)o.push("Haftada bir aile halkası yapın: bir ayet, bir soru, küçük bir etkinlik.");
  return o.slice(0,3);}

function karneGiris(v){const ad=v.ad?v.ad+" ":"";
  if(v.aktifGun>=5)return `Maşallah! ${ad}bu hafta ${v.aktifGun} gün çalıştı; düzenli emek en güzel kazançtır.`;
  if(v.aktifGun>=3)return `Güzel bir emek haftası: ${ad}${v.aktifGun} gün çalıştı. Böyle devam!`;
  if(v.aktifGun>=1)return `${ad}bu hafta ${v.aktifGun} gün çalıştı. Her adım değerlidir; küçük ama sık tekrar ezberi güçlendirir.`;
  return `${ad}bu hafta ara verdi. Yeni hafta için küçük bir adım yeter: günde bir ayet.`;}

/* Paylaşım için düz metin özet */
function karneOzetMetni(kisiId){const v=karneVeri(kisiId);const s=[];
  s.push(`Haftalık karne · ${v.ad||"Çocuğum"} · ${v.aralik}`);
  s.push(karneGiris(v));
  s.push(`Bu hafta: ${v.aktifGun}/7 gün çalıştı${v.dk?`, ${v.dk} dakika`:""}, ${v.tekrar} ayet tekrarı, ${v.yeniEzb} ayet ezbere geçti, ${v.dinletti} ayet ebeveynine okundu, ${v.onaylandi} ayet onaylandı. Aile halkası: ${v.halka?"yapıldı":"bu hafta yapılmadı"}.`);
  s.push(`Ezber: ${v.ezb} ayet ezberde, ${v.tkr} ayet tekrarda${v.gec?`, ${v.gec} tekrarı gecikmiş`:""}.`);
  if(v.sureler.length)s.push(v.sureler.map(r=>`${r.ad} ${r.ezb}/${r.top}`).join(" · "));
  if(v.zorlar.length)s.push("Zorlandığı yerler: "+v.zorlar.map(z=>z.tur==="soru"?`${z.ad} (${z.n})`:z.ad).join(", ")+".");
  s.push("Gelecek hafta:");v.oneriler.forEach(x=>s.push("- "+x));
  s.push("Sureler Oyun Bahçesi");
  return s.join("\n");}

function karneSayfa(kisiId){if(typeof kapiAcik==="function"&&!kapiAcik()){ebeveynKapisi(()=>karneSayfa(kisiId));return;}
  karneStil();CUR=null;baslik();setTabs();try{durSes();}catch(e){}
  const v=karneVeri(kisiId);karneSayfa.son=v.id;
  $("baslik").textContent="Haftalık karne";$("altbaslik").textContent=(v.ad?v.ad+" · ":"")+v.aralik;
  const sayi=(n,t)=>`<div class="krn-sayi"><b>${n}</b><span>${t}</span></div>`;
  const pay=!!(navigator.share);const ucKisi=PROF.liste.length>1;
  const sureSatir=r=>{const e=Math.round(r.ezb/Math.max(1,r.top)*100),t=Math.min(100-e,Math.round(r.tkr/Math.max(1,r.top)*100));
    return `<tr><td>${esc(r.ad)}</td><td class="krn-n">${r.ezb}/${r.top}</td><td class="krn-n">${r.tkr}</td><td class="krn-n">${r.gec||"–"}</td>
     <td><span class="krn-cubuk" role="img" aria-label="${esc(r.ad)}: ${r.ezb} ayet ezberde, ${r.tkr} ayet tekrarda"><i class="krn-ezb" style="width:${e}%"></i><i class="krn-tkr" style="width:${t}%"></i></span></td></tr>`;};
  $("view").innerHTML=`<div class="krn-dugmeler yazdirma-yok"><button class="geri" id="krnGeri">${ikon("arrow-left")}Ebeveyn özeti</button>
   <button class="primary" id="krnYaz">🖨 Yazdır</button><button id="krnPay">${pay?"Paylaş":"Metni kopyala"}</button>
   ${ucKisi?PROF.liste.map(p=>`<button class="dokun44 ${p.id===v.id?"on":""}" data-krn="${esc(p.id)}" aria-pressed="${p.id===v.id}">${ikon("user")} ${esc(p.ad||"Adsız kişi")}</button>`).join(""):""}</div>
  <article class="krn" aria-label="Haftalık karne">
   <header class="krn-bas"><div><h2>${ikon("award")} ${esc(v.ad||"Haftalık karne")}${v.yas?` <span class="kucuk-yazi">· ${v.yas} yaş</span>`:""}</h2><p><b>Haftalık karne</b> · ${esc(v.aralik)}</p></div><p class="kucuk-yazi">Sureler Oyun Bahçesi</p></header>
   <p class="krn-gir">${esc(karneGiris(v))}</p>
   <section class="krn-bol" aria-label="Bu hafta"><h3>Bu hafta</h3><div class="krn-sayilar">
    ${sayi(v.aktifGun+"/7","gün çalıştı")}${v.dk?sayi(v.dk,"dakika"):""}${sayi(v.tekrar,"ayet tekrarı")}${sayi(v.yeniEzb,"ayet ezbere geçti")}
    ${sayi(v.dinletti,"ayet ebeveynine okundu")}${sayi(v.onaylandi,"ayet onaylandı")}${sayi(v.yildiz,"yıldız (toplam)")}${sayi(v.halka?"✓":"–",v.halka?"aile halkası yapıldı":"aile halkası yapılmadı")}
   </div>${v.hikaye?`<p class="kucuk-yazi">Bu hafta ${v.hikaye} hikâye izledi.</p>`:""}</section>
   <section class="krn-bol" aria-label="Ezber durumu"><h3>Ezber durumu</h3>
    <p><b>${v.ezb}</b> ayet ezberde · <b>${v.tkr}</b> ayet tekrarda${v.gec?` · <b>${v.gec}</b> tekrarı gecikmiş`:""}${v.onayBek?` · ${v.onayBek} onay bekliyor`:""}</p>
    ${v.sureler.length?`<table class="krn-tablo"><thead><tr><th>Sure</th><th>Ezberde</th><th>Tekrarda</th><th>Gecikmiş</th><th>Durum</th></tr></thead><tbody>${v.sureler.map(sureSatir).join("")}</tbody></table>
    <p class="krn-anahtar"><span><i style="background:var(--success)"></i>ezberde</span><span><i style="background:var(--accent)"></i>tekrarda</span></p>`:"<p>Henüz ezber çalışmasına başlamadı. Ezber, bir surenin \"Ezber\" bölümünden başlar.</p>"}</section>
   <section class="krn-bol" aria-label="Zorlandığı yerler"><h3>Zorlandığı yerler</h3>
    ${v.zorlar.length?`<ul class="krn-liste">${v.zorlar.map(z=>`<li>${z.tur==="ayet"?`<b>${esc(z.ad)}</b>: ${z.n} gün "zorlandım" dedi`:`<b>${esc(z.ad)}</b>: yanlışlar defterinde ${z.n} soru${z.ornek?` <span class="kucuk-yazi">(ör. ${esc(z.ornek)}…)</span>`:""}`}</li>`).join("")}</ul>
    <p class="kucuk-yazi">Zorlanmak öğrenmenin parçasıdır; bu ayetler ve sorular kısa aralıklarla yeniden sorulur.</p>`:"<p>Bu hafta zorlandığını söylediği ayet ya da bekleyen yanlış soru yok.</p>"}</section>
   <section class="krn-bol krn-oneri" aria-label="Gelecek hafta için öneri"><h3>Gelecek hafta için öneri</h3><ol class="krn-liste">${v.oneriler.map(x=>`<li>${esc(x)}</li>`).join("")}</ol></section>
   <section class="krn-bol" aria-label="Ebeveyn notu"><h3>Ebeveyn notu</h3><div class="krn-not" aria-hidden="true"><span></span><span></span><span></span><span></span></div></section>
   <footer class="krn-alt"><span>Emeği övün, sonucu değil: "Bu hafta ${v.aktifGun} gün çalıştın" demek puandan daha çok işe yarar.</span><span>İmza / tarih: ____________</span></footer>
  </article>`;
  $("krnGeri").onclick=()=>ebeveynOzet();
  $("krnYaz").onclick=()=>{try{if(typeof window.print!=="function")throw 0;window.print();}catch(e){toast("Yazdırma bu görünümde açılamadı");}};
  $("krnPay").onclick=async()=>{const metin=karneOzetMetni(v.id);
    if(navigator.share){try{await navigator.share({title:"Haftalık karne"+(v.ad?" · "+v.ad:""),text:metin});}catch(e){if(!e||e.name!=="AbortError")toast("Paylaşılamadı");}return;}
    try{await navigator.clipboard.writeText(metin);toast("Karne metni kopyalandı");}catch(e){toast("Kopyalanamadı; metni elle seçebilirsiniz");}};
  $("view").querySelectorAll("[data-krn]").forEach(b=>b.onclick=()=>karneSayfa(b.dataset.krn));
  window.scrollTo({top:0});}
