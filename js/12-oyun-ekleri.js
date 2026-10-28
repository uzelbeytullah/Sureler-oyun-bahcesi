/* Sureler Oyun Bahçesi · Ses efektleri, kutlama, seviye, günün görevi, yanlışlar defteri, bahçe */
/* ========== OYUN EKLERİ: ses efektleri, kutlama, günün görevi, seviye, bahçe, yanlışlar defteri ========== */
let EFX=null;
function efekt(tur){if(S.efekt===false)return;try{EFX=EFX||new (window.AudioContext||window.webkitAudioContext)();const c=EFX;if(c.state==="suspended")c.resume();
  const N={dogru:[[660,0,.09],[880,.09,.14]],yanlis:S.seviye==="kucuk"?[[392,0,.12],[330,.1,.14]]:[[220,0,.22]],seri:[[523,0,.08],[659,.08,.08],[784,.16,.08],[1047,.24,.18]],yildiz:[[784,0,.1],[988,.1,.1],[1175,.2,.1],[1568,.3,.3]],gorev:[[523,0,.12],[784,.12,.12],[1047,.24,.3]],satin:[[880,0,.06],[1320,.07,.12]]}[tur]||[];
  N.forEach(([f,t,d])=>{const o=c.createOscillator(),g=c.createGain();o.type=tur==="yanlis"&&S.seviye!=="kucuk"?"triangle":"sine";o.frequency.value=f;const s=c.currentTime+t;
    g.gain.setValueAtTime(0.0001,s);g.gain.exponentialRampToValueAtTime(tur==="yanlis"?(S.seviye==="kucuk"?0.08:0.18):0.22,s+0.015);g.gain.exponentialRampToValueAtTime(0.0001,s+d);o.connect(g).connect(c.destination);o.start(s);o.stop(s+d+0.02);});}catch(e){}}
function kutla(az){if(S.efekt===false)return;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;const k=document.createElement("div");k.className="kutla";k.setAttribute("aria-hidden","true");
  const R=["#E4572E","#F7C548","#2E7D5B","#3B6EA8","#8E44AD","#F28AB2"];
  k.innerHTML=[...Array(az?18:44)].map((_,i)=>`<i style="left:${Math.random()*100}%;background:${R[i%R.length]};animation-delay:${(Math.random()*.4).toFixed(2)}s;animation-duration:${(1.6+Math.random()*1.2).toFixed(2)}s;transform:rotate(${Math.random()*360}deg)">${i%5===0?"★":""}</i>`).join("");
  document.body.appendChild(k);setTimeout(()=>k.remove(),3200);}

/* --- seviye --- */
const SEVIYE={kucuk:{ad:"Küçük (6-9 yaş)",sik:2,soru:6,gSoru:3},genc:{ad:"Genç (10-14 yaş)",sik:3,soru:10,gSoru:5},yetiskin:{ad:"Yetişkin",sik:3,soru:10,gSoru:8}};
const sv=()=>SEVIYE[S.seviye]||SEVIYE.genc;
function seviyeSor(sonra){const V=$("view");
  V.innerHTML=`<section class="detay pop" style="text-align:center"><h2>Hoş geldin!</h2><p>Sorular ve görevler yaşına göre ayarlansın. Kim oynuyor?</p>
  <div style="display:grid;gap:10px;max-width:420px;margin:0 auto">${Object.entries(SEVIYE).map(([k,v])=>`<button class="${k==="genc"?"primary":""}" data-sv="${k}" style="font-size:20px;min-height:58px">${v.ad}</button>`).join("")}</div>
  <p style="font-size:14px">Sonra "Bugün" bölümünden değiştirebilirsin.</p></section>`;
  V.querySelectorAll("[data-sv]").forEach(b=>b.onclick=()=>{S.seviye=b.dataset.sv;save();sonra();});}

/* --- günün görevi --- */
function gorevBugun(){const t=today();if(!S.gorev||S.gorev.gun!==t)S.gorev={gun:t,tekrar:0,hikaye:0,soru:0,tamam:false};return S.gorev;}
function gorevHedef(){return {tekrar:1,hikaye:1,soru:sv().gSoru};}
function gorevIsle(tur){const g=gorevBugun(),h=gorevHedef();if(g.tamam)return;g[tur]=(g[tur]||0)+1;
  if(Object.keys(h).every(k=>g[k]>=h[k])){g.tamam=true;const d=new Date();d.setDate(d.getDate()-1);
    S.gorevSeri=(S.gorevSonGun===d.toLocaleDateString("sv-SE"))?(S.gorevSeri||0)+1:1;S.gorevSonGun=g.gun;
    S.puan+=20;efekt("gorev");kutla();toast(`Günün üç görevi tamam! 20 puan · görev serisi ${S.gorevSeri} gün`);checkBadges();renderStats();}
  save();}
function gorevKart(){const g=gorevBugun(),h=gorevHedef();
  const satir=(k,ad,nasil)=>{const n=Math.min(g[k]||0,h[k]),ok=n>=h[k];return `<li style="display:flex;gap:8px;align-items:center;padding:4px 0"><b style="font-size:22px;width:28px">${ok?"✅":"⬜"}</b><span style="flex:1"><b>${ad}</b> <span style="font-size:14px">(${n}/${h[k]}) · ${nasil}</span></span></li>`;};
  return `<section class="detay" style="border-color:var(--gold)" aria-label="Günün görevi"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px"><h2>Günün görevi</h2><b>Görev serisi: ${S.gorevSeri&&S.gorevSonGun?S.gorevSeri:0} gün</b></div>
  <ul style="list-style:none;margin:0;padding:0">${satir("tekrar","Bir ayet tekrar et","Ezber bölümünde bir ayeti değerlendir")}${satir("hikaye","Bir hikâye izle","Çocuklar için ya da Ezber hikâyelerinden")}${satir("soru",`${h.soru} soruyu doğru cevapla`,"herhangi bir oyunda")}</ul>
  ${g.tamam?`<p><b>Bugünün görevleri tamam, maşallah! Yarın yeni görevler gelecek.</b></p>`:`<p style="font-size:14px">Üçü bitince 20 ek puan ve görev serin bir gün uzar.</p>`}</section>`;}

/* --- yanlışlar defteri --- */
const YARALIK=[1,3,7];
function yanlisEkle(q){S.yanlis=S.yanlis||{};const k=(CUR?CUR.no:0)+"|"+(q.answer||"")+"|"+(q.html||"").replace(/<[^>]+>/g,"").slice(0,60);
  S.yanlis[k]={k,s:CUR?CUR.no:0,html:q.html,answer:q.answer,opts:q.opts,arOpts:!!q.arOpts,tek:!!q.tek,aciklama:q.aciklama||"",kutu:0,sonraki:gunEkle(1)};
  const ks=Object.keys(S.yanlis);if(ks.length>80)ks.sort((a,b)=>S.yanlis[a].sonraki<S.yanlis[b].sonraki?-1:1).slice(0,ks.length-80).forEach(x=>delete S.yanlis[x]);}
function yanlisSirada(){const t=today();return Object.values(S.yanlis||{}).filter(x=>x.sonraki<=t);}
function yanlisCalis(){const L=shuffle(yanlisSirada()).slice(0,10);if(!L.length){toast("Bugün tekrar edilecek yanlış yok");return;}
  const onceki=CUR;CUR=null;baslik();setTabs();
  quiz({title:"Yanlışlarım",items:L,geri:()=>{CUR=onceki;anaSayfa();},
    build:y=>({html:`<p style="font-size:14px"><b>${esc(adBul(y.s))}</b> · daha önce yanlış yaptığın soru</p>`+y.html,answer:y.answer,opts:shuffle(y.opts),arOpts:y.arOpts,tek:y.tek,aciklama:y.aciklama,
      sonuc:ok=>{const r=S.yanlis[y.k];if(!r)return;if(ok){r.kutu++;if(r.kutu>=YARALIK.length){delete S.yanlis[y.k];S.yanlisCikan=(S.yanlisCikan||0)+1;toast("Bu soru defterden çıktı");}else r.sonraki=gunEkle(YARALIK[r.kutu]);}else{r.kutu=0;r.sonraki=gunEkle(1);}save();},yanlisTekrar:true})});}

/* --- bahçe --- */
const SUSLER=[["kus","Kuşlar",100],["cit","Çit",120],["tarh","Çiçek tarhı",150],["kelebek","Kelebekler",180],["bank","Bank",200],["fener","Bahçe feneri",250],["cesme","Çeşme",300],["havuz","Havuz",400],["gokkusagi","Gökkuşağı",600]];
/* Süs dükkânı: puan yetmez, bazı süsler ezber ve yıldız emeğiyle açılır */
const SUS_KILIT={cit:["Bir sureyi dört yıldızla bitir",()=>tamSure()>=1],tarh:["İki sureyi dört yıldızla bitir",()=>tamSure()>=2],
  kelebek:["Beş ayeti ezberle",()=>ezberToplam()>=5],bank:["Bir sureyi baştan sona ezberle",()=>sureEzberSay()>=1],fener:["Beş sureyi dört yıldızla bitir",()=>tamSure()>=5],
  cesme:["Fâtiha'yı ezberle",()=>[0,1,2,3,4,5,6].every(i=>ezbTam(((S.sure["1"]||{}).ezberDurum||{})[i]))],havuz:["On sureyi dört yıldızla bitir",()=>tamSure()>=10],gokkusagi:["Namaz hazırlığı yolunu tamamla",()=>!!S.namazBelge]};
function ezberToplam(){let n=0;Object.values(S.sure||{}).forEach(x=>Object.values(x.ezberDurum||{}).forEach(d=>{if(ezbTam(d))n++;}));return n;}
function sureEzberSay(){return KATALOG.filter(k=>!k.gruplar&&k.ayet&&Object.values(((S.sure[k.no]||{}).ezberDurum)||{}).filter(ezbTam).length>=k.ayet).length;}
/* Tekrar günü üç günden fazla geçmiş ayet sayısı: ağaç hafifçe solar, tekrar edince canlanır */
function susuz(no,kat){const ids=kat&&kat.gruplar?kat.gruplar.map(g=>g.id):[no];const sinir=gunEkle(-3);let n=0;
  ids.forEach(id=>Object.values(((S.sure[id]||{}).ezberDurum)||{}).forEach(d=>{if(d&&d.sonraki&&d.sonraki<sinir)n++;}));return n;}
function harcanabilir(){return S.puan-(S.harcanan||0);}
function bitkiAsama(k){if(k.gruplar){const t=grupYildiz(k),m=k.gruplar.length*4;if(t===0)return k.gruplar.some(g=>S.sure[g.id])?0.5:0;return Math.max(1,Math.round(t/m*4));}
  const y=yildizSay(k.no);if(y)return y;return S.sure[k.no]?0.5:0;}
function bitkiSvg(a,ezb,solgun){if(solgun)return `<g style="filter:saturate(.35) brightness(1.08)">${bitkiSvg(a,ezb,false)}</g><text x="78" y="22" font-size="18">💧</text>`;
  const toprak=`<ellipse cx="50" cy="92" rx="34" ry="8" fill="#8C6A45"/>`;
  if(a===0)return toprak+`<ellipse cx="50" cy="88" rx="5" ry="3.5" fill="#5A3A22"/>`;
  if(a===0.5)return toprak+`<path d="M50,90 v-14" stroke="#2F7A3B" stroke-width="3"/><path d="M50,80 q-10,-6 -12,-14 q10,2 12,12z M50,78 q10,-6 12,-14 q-10,2 -12,12z" fill="#4CAF50"/>`;
  const boy=[0,30,46,60,66][a],tac=[0,14,22,30,34][a];
  let s=toprak+`<rect x="47" y="${90-boy}" width="6" height="${boy}" rx="2" fill="#6B4A2B"/><circle cx="50" cy="${90-boy}" r="${tac}" fill="#2F7A3B"/><circle cx="${50-tac*.6}" cy="${90-boy+tac*.4}" r="${tac*.65}" fill="#2A6E35"/><circle cx="${50+tac*.6}" cy="${90-boy+tac*.35}" r="${tac*.7}" fill="#358A43"/>`;
  if(a>=4)s+=[[-14,-8],[10,-14],[0,6],[16,4],[-18,8],[-4,-20]].map(([x,y])=>`<circle cx="${50+x}" cy="${90-boy+y}" r="3.6" fill="${ezb?"#F7C548":"#F28AB2"}"/>`).join("");
  return s;}
function susSvg(id){return {kus:`<path d="M60,40 q8,-10 16,0 q8,-10 16,0" stroke="#1F2440" stroke-width="3" fill="none"/><path d="M120,58 q6,-8 12,0 q6,-8 12,0" stroke="#1F2440" stroke-width="3" fill="none"/>`,
  cit:`<g fill="#C8955A">${[...Array(22)].map((_,i)=>`<rect x="${i*37}" y="196" width="10" height="34" rx="3"/>`).join("")}<rect y="204" width="800" height="6"/><rect y="220" width="800" height="6"/></g>`,
  tarh:`<g>${[...Array(12)].map((_,i)=>`<circle cx="${250+i*14}" cy="${222+(i%2)*6}" r="7" fill="${["#F28AB2","#F7C548","#E4572E"][i%3]}"/>`).join("")}</g>`,
  kelebek:`<g class="an-kay"><path d="M400,70 q-14,-14 -16,4 q10,8 16,-4 q14,-14 16,4 q-10,8 -16,-4z" fill="#8E44AD"/></g>`,
  bank:`<g><rect x="560" y="200" width="90" height="10" rx="3" fill="#8C6A45"/><rect x="560" y="186" width="90" height="8" rx="3" fill="#8C6A45"/><rect x="566" y="210" width="6" height="18" fill="#5A3A22"/><rect x="638" y="210" width="6" height="18" fill="#5A3A22"/></g>`,
  fener:`<g transform="translate(700,232)">${anFener(true,1.3)}<rect x="-3" y="0" width="6" height="0"/></g>`,
  cesme:`<g><ellipse cx="120" cy="222" rx="46" ry="12" fill="#8FC9EF" stroke="#6F8FA8" stroke-width="3"/><rect x="114" y="176" width="12" height="44" fill="#B8B8C4"/><path class="an-damla" d="M120,176 q-14,10 -20,30 M120,176 q14,10 20,30" stroke="#8FC9EF" stroke-width="3" fill="none"/></g>`,
  havuz:`<ellipse cx="300" cy="226" rx="70" ry="14" fill="#4BA3D9" opacity=".85"/>`,
  gokkusagi:`<g opacity=".55" fill="none" stroke-width="10">${["#E4572E","#F7C548","#4CAF50","#3B6EA8","#8E44AD"].map((c,i)=>`<path d="M80,${200} a320,180 0 0,1 640,0" stroke="${c}" transform="translate(${i*0},${i*10}) scale(1,1)"/>`).join("")}</g>`}[id]||"";}
function bahce(){sayacIsle("bahce");CUR=null;baslik();setTabs();renderStats();$("baslik").textContent="Bahçem";$("altbaslik").textContent="Her sure bahçende bir fidan · çalıştıkça büyür";
  const V=$("view"),sus=S.sus||[];
  const ust=`<svg viewBox="0 0 800 240" style="width:100%;display:block;border-radius:16px" role="img" aria-label="Bahçenin süsleri"><defs><linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD3FE"/><stop offset="1" stop-color="#E9F7FF"/></linearGradient><radialGradient id="anIsik"><stop offset="0" stop-color="#FFE9A0" stop-opacity=".95"/><stop offset="1" stop-color="#FFD866" stop-opacity="0"/></radialGradient></defs>
   <rect width="800" height="240" fill="url(#bg1)"/>${sus.includes("gokkusagi")?susSvg("gokkusagi"):""}<circle cx="720" cy="50" r="26" fill="#FFD23F"/><rect y="200" width="800" height="40" fill="#5DA05A"/>${[...Array(Math.min(12,S.halkaSay||0))].map((_,k)=>`<g transform="translate(${70+k*58},${120+(k%2)*14})">${anFener(true,0.7)}</g>`).join("")}${sus.filter(s=>s!=="gokkusagi").map(susSvg).join("")}${[...Array(Math.min(60,S.cicek||0))].map((_,k)=>`<g transform="translate(${20+(k*53)%760},${206+(k%3)*9})"><path d="M0,0 v-12" stroke="#2F6230" stroke-width="2"/><circle cy="-14" r="5" fill="${["#F7C548","#F28AB2","#E4572E","#8E44AD"][k%4]}"/><circle cy="-14" r="2" fill="#fff"/></g>`).join("")}</svg>`;
  const tum=KATALOG.map(k=>({k,su:susuz(k.no,k)>0,a:bitkiAsama(k),ezb:!k.gruplar&&k.ayet&&Object.values(((S.sure[k.no]||{}).ezberDurum)||{}).filter(ezbTam).length>=k.ayet}));
  const sayac=[0,0,0,0,0];tum.forEach(x=>{sayac[Math.ceil(x.a)>=4?4:Math.ceil(x.a)]++;});
  V.innerHTML=`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="geri" id="bGeri">← Sureler</button></div>
  ${ust}
  ${S.cicek?`<p><b>🌼 Yaptığın iyiliklerle bahçende ${S.cicek} çiçek açtı.</b></p>`:""}${S.halkaSay?`<p><b>🏮 Ailece ${S.halkaSay} haftalık halka tamamladınız; her biri bahçede bir fener yaktı.</b></p>`:""}<p><b>Bahçende ${tum.length} sure var:</b> ${sayac[4]} çiçekli ağaç · ${sayac[3]+sayac[2]} fidan · ${sayac[1]} filiz · ${sayac[0]} tohum. Bir surede yıldız kazandıkça fidanı büyür; dört yıldızla çiçek açar, sureyi ezberleyince çiçekleri altın sarısı olur.</p>
  ${(()=>{const n=tum.filter(x=>x.su).length;return n?`<p><b>💧 ${n} fidanın suya ihtiyacı var:</b> tekrar günü geçmiş ayetleri var. Fidana dokun, ezber tekrarını yap; yeniden canlanır.</p>`:"";})()}
  <div class="bahce-grid">${tum.map(({k,a,ezb,su})=>`<button class="bahce-hucre" data-n="${k.no}" ${su?'data-su="1"':""} aria-label="${esc(k.ad)}: ${a===0?"tohum":a<1?"filiz":a>=4?"çiçekli ağaç":"fidan"}${su?", tekrar bekliyor":""}"><svg viewBox="0 0 100 100" style="width:100%;display:block">${bitkiSvg(a,ezb,su)}</svg><b>${esc(k.ad)}</b></button>`).join("")}</div>
  <h2>Süs dükkânı</h2><p>Harcanabilir puanın: <b style="font-size:20px">${harcanabilir()}</b> · Toplam kazandığın puan değişmez, rozetlerin de korunur.</p>
  <p style="font-size:14px">Bazı süsler emekle açılır: yıldızlar, ezber ve namaz hazırlığı yolu.</p>
  <div class="sure-grid">${SUSLER.map(([id,ad,f])=>{const var_=sus.includes(id),kl=SUS_KILIT[id],acik=!kl||kl[1]();return `<button class="sure-kart ${var_?"tam":""}" data-sus="${id}" ${var_?"disabled":""}><span class="sad">${acik?"":"🔒 "}${esc(ad)}</span><span class="sbilgi"><b>${var_?"Bahçende ✓":f+" puan"}</b>${!var_&&!acik?`<br>${esc(kl[0])}`:""}</span></button>`;}).join("")}</div>`;
  $("bGeri").onclick=()=>anaSayfa();
  V.querySelectorAll("[data-n]").forEach(b=>b.onclick=()=>{const k=KATALOG.find(x=>x.no===+b.dataset.n);if(k.gruplar)grupMenu(k);else ac(k.no,b.dataset.su?"ezber":undefined);});
  V.querySelectorAll("[data-sus]").forEach(b=>b.onclick=()=>{const it=SUSLER.find(s=>s[0]===b.dataset.sus);const kl=SUS_KILIT[it[0]];if(kl&&!kl[1]()){toast("Bu süs emekle açılır: "+kl[0]);return;}if(harcanabilir()<it[2]){toast(`Bunun için ${it[2]-harcanabilir()} puan daha gerekiyor`);efekt("yanlis");return;}
    S.harcanan=(S.harcanan||0)+it[2];S.sus=[...sus,it[0]];save();efekt("satin");kutla(true);toast(it[1]+" bahçene eklendi");bahce();});
  window.scrollTo({top:0});}
