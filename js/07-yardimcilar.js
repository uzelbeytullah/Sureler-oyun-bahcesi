/* Sureler Oyun Bahçesi · Bugün paneli, tekrarlar, kelime defteri, ayet açıklaması */
/* ---------- genel yardımcılar: tecvid kuralları, ezber, bugün, defter ---------- */
let TKUR=null;
fetch("data/tecvid_kurallar.json?v="+SURUM).then(r=>r.json()).then(d=>{TKUR=d;if(CUR&&cur==="oku")oku();}).catch(()=>{});
const VARSAYILAN_EZBER={takvim:{aciklama:"Ayetleri aralıklı tekrarla ezberle: hatırladıkça tekrarlar seyrekleşir, unuttuğunda sık sorulur. Bu takvim Fâtiha kitabınızdaki tekrar takviminden alındı.",araliklar_gun:[1,2,4,7,14,30,60]},yontemler:[],ayet_ipuclari:[],siirler:[],hikayeler:[],uyari:""};
function ezberVeri(){return (CUR.ek&&CUR.ek.ezber)||VARSAYILAN_EZBER;}
function adBul(id){id=+id;if(id>36000){const g=YASIN().gruplar.find(x=>x.id===id);return g?`Yâsîn ${g.bas}-${g.son}`:"Yâsîn";}const k=KATALOG.find(x=>x.no===id);return k?k.ad:String(id);}
function ilkAyetBul(id){id=+id;if(id>36000){const g=YASIN().gruplar.find(x=>x.id===id);return g?g.bas:1;}return 1;}
/* Bugünün tekrarı: bütün surelerden günü gelen ayetler tek akışta */
let TEKRAR_AKIS=false;
function tekrarAkisi(haric){const L=tumTekrarlar().filter(x=>x.id!==haric);if(!L.length){TEKRAR_AKIS=false;toast("Bugünün bütün tekrarları bitti, maşallah!");kutla(true);anaSayfa();return;}
  TEKRAR_AKIS=true;ac(L[0].id,"ezber");}
function tumTekrarlar(){const t=today(),r=[];Object.entries(S.sure).forEach(([id,x])=>Object.entries(x.ezberDurum||{}).forEach(([i,d])=>{if(d&&d.sonraki<=t)r.push({id:+id,i:+i});}));return r;}
function bugunPaneli(){
  const hedef=S.hedef||50,bugun=(S.gunluk||{})[today()]||0,yuzde=Math.min(100,Math.round(bugun/hedef*100));
  const gunler=[...Array(7)].map((_,k)=>{const d=new Date();d.setDate(d.getDate()-6+k);const key=d.toLocaleDateString("sv-SE");return {g:d.toLocaleDateString("tr-TR",{weekday:"short"}),p:(S.gunluk||{})[key]||0};});
  const enCok=Math.max(hedef,...gunler.map(x=>x.p));
  const tk=tumTekrarlar();const gruplu={};tk.forEach(x=>{(gruplu[x.id]=gruplu[x.id]||[]).push(x.i);});
  const defter=Object.keys(S.defter||{}).length;
  return `<section class="detay" style="background:var(--surface);border-color:var(--lapis)" aria-label="Bugün">
  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h2>Bugün</h2>
  <span style="display:flex;gap:4px;align-items:center;flex-wrap:wrap"><b style="font-size:14px">Günlük hedef:</b>${[30,50,100,200].map(h=>`<button class="hdf ${hedef===h?"on":""}" data-h="${h}" style="min-height:36px;padding:4px 10px">${h}</button>`).join("")}</span></div>
  <div class="bar" style="height:14px"><i style="width:${yuzde}%"></i></div>
  <p><b>${bugun} / ${hedef} puan</b>${bugun>=hedef?" · Bugünün hedefi tamam, maşallah!":""} · Günlük seri: <b>${S.seri} gün</b></p>
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;align-items:end;height:90px" aria-label="Son yedi günün puanları">${gunler.map(x=>`<div style="display:grid;gap:2px;justify-items:center;align-self:end"><b style="font-size:12px">${x.p}</b><span style="display:block;width:70%;height:${Math.max(3,Math.round(x.p/enCok*56))}px;background:${x.p>=hedef?"var(--gold)":"var(--lapis)"};border-radius:4px"></span><b style="font-size:12px">${x.g}</b></div>`).join("")}</div>
  <p><b>Ezber tekrarları:</b> ${tk.length?`<button class="primary" id="tekrarHepsi" style="min-height:36px;padding:4px 12px;margin:2px">▶ Bugünün tekrarı (${tk.length} ayet)</button> `:""}${tk.length?Object.entries(gruplu).map(([id,l])=>`<button class="tkr-git" data-id="${id}" style="min-height:36px;padding:4px 10px;margin:2px">${esc(adBul(id))} · ${l.length} ayet</button>`).join(""):"Bugün tekrar edilecek ayet yok."}</p>
  ${ezberOzet()}
  ${(()=>{const n=onayBekleyenler().length;return n?`<p><b>👨‍👩‍👧 Ebeveyn onayı bekleyen:</b> ${n} ayet <button class="primary" id="onayGit" style="min-height:36px;padding:4px 12px">Ebeveynine oku</button></p>`:"";})()}
  <p><b>Yanlışlarım:</b> ${(()=>{const n=Object.keys(S.yanlis||{}).length,b=yanlisSirada().length;return n?`${n} soru, bugün ${b} tanesi sırada ${b?`<button class="primary" id="yanlisOyna" style="min-height:36px;padding:4px 12px">Tekrar et</button>`:""}`:"Oyunlarda yanlış yaptığın sorular burada toplanır; 1, 3 ve 7 gün sonra yeniden sorulur.";})()}</p>
  <p style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"><b>Seviye:</b>${Object.entries(SEVIYE).map(([k,v])=>`<button class="svb ${S.seviye===k?"on":""}" data-sv="${k}" style="min-height:36px;padding:4px 10px">${v.ad}</button>`).join("")}<button id="efektAc" style="min-height:36px;padding:4px 10px">${S.efekt===false?"🔈 Oyun sesleri: kapalı":"🔊 Oyun sesleri: açık"}</button></p>
  <p><b>Kelime defterim:</b> ${defter?`${defter} kelime <button class="primary" id="defterOyna" style="min-height:36px;padding:4px 12px">Çalış</button>`:"Kelime oyununda yanlış yaptığın kelimeler burada toplanır."}</p></section>`;
}
function bugunBagla(){
  document.querySelectorAll(".hdf").forEach(b=>b.onclick=()=>{S.hedef=+b.dataset.h;save();anaSayfa();});
  document.querySelectorAll(".tkr-git").forEach(b=>b.onclick=()=>ac(+b.dataset.id,"ezber"));
  {const th=$("tekrarHepsi");if(th)th.onclick=()=>tekrarAkisi();}
  {const og=$("onayGit");if(og)og.onclick=()=>onayEkrani();}
  {const nb=$("namazBelge");if(nb)nb.onclick=()=>namazBelgesi();}
  document.querySelectorAll("[data-nz]").forEach(b=>b.onclick=()=>ac(+b.dataset.nz,"ezber"));
  const d=$("defterOyna");if(d)d.onclick=()=>kelimeDefteri();
  const y=$("yanlisOyna");if(y)y.onclick=()=>yanlisCalis();
  document.querySelectorAll(".svb").forEach(b=>b.onclick=()=>{S.seviye=b.dataset.sv;save();anaSayfa();});
  const ef=$("efektAc");if(ef)ef.onclick=()=>{S.efekt=S.efekt===false;save();anaSayfa();if(S.efekt!==false)efekt("dogru");};
}
function defterIsle(id,w,o,ok){
  S.defter=S.defter||{};const k=id+"|"+w.a;const r=S.defter[k];
  if(!ok)S.defter[k]={s:id,a:w.a,ok:w.ok,tr:w.tr,o,n:0};
  else if(r){r.n=(r.n||0)+1;if(r.n>=2){delete S.defter[k];S.defterCikti=true;toast("Bir kelime defterden çıktı");}}
}
function kelimeDefteri(){
  const R=shuffle(Object.values(S.defter||{})).slice(0,15);if(!R.length){anaSayfa();return;}
  CUR=null;setTabs();$("baslik").textContent="Kelime defterim";$("altbaslik").textContent="Yanlış yaptığın kelimeler · art arda iki kez doğru bilince defterden çıkar";
  quiz({title:"Kelime defterim",items:R,build:r=>({html:`<p>Bu kelimenin anlamı nedir? <b style="font-size:14px">(${esc(adBul(r.s))})</b></p><div class="qbig ar" lang="ar">${r.a}</div><p class="okunus">${esc(r.ok)}</p>`,answer:r.tr,opts:shuffle(r.o),
    sonuc:ok=>{const k=r.s+"|"+r.a,x=(S.defter||{})[k];if(!x)return;if(ok){x.n=(x.n||0)+1;if(x.n>=2){delete S.defter[k];S.defterCikti=true;toast("Bir kelime defterden çıktı");}}else x.n=0;}}),geri:()=>anaSayfa()});
}
BADGES.push(["sureEzber","Bir sureyi baştan sona ezberledi",()=>KATALOG.some(k=>!k.gruplar&&k.ayet&&Object.values(((S.sure[k.no]||{}).ezberDurum)||{}).filter(ezbTam).length===k.ayet)]);
BADGES.push(["defter","Kelime defterinden bir kelime çıkardı",()=>!!S.defterCikti]);

/* ---------- ayet açıklaması (kitaptan) ---------- */
const ACL_SEKME=[["aciklama","Ayet açıklaması"],["kelime","Kelime kelime"],["cozum","Çözümleme ve mesaj"],["tefsir","Tefsirlerde"],["boyut","Boyutlar"]];
let aclSekme="aciklama";
function aciklamaAc(i,sekme){
  const el=$("acp"+i);if(!el)return;
  if(sekme===undefined&&!el.hidden){el.hidden=true;document.querySelector(`[data-acl="${i}"]`).classList.remove("on");return;}
  if(sekme)aclSekme=sekme;
  const x=CUR.ek.aciklama.ayetler.find(a=>+a.ayet===(CUR.ilkAyet||1)+i);if(!x)return;
  const A=CUR.ayetler[i];
  const p=t=>`<p style="line-height:1.7">${esc(t)}</p>`;
  let ic="";
  const grupX=x.grup&&(!x.aciklama||!x.aciklama.length)?CUR.ek.aciklama.ayetler.find(a=>+a.ayet===+(x.grup_ilk||x.grup[0])):null;
  if(aclSekme==="aciklama")ic=`${x.uyarlama?`<p><b>Sıra korunarak Türkçe:</b> ${esc(x.uyarlama)}</p>`:""}${x.grup?`<p style="font-size:14px"><b>Kitap bu ayeti ${x.grup[0]}-${x.grup[1]}. ayetlerle birlikte açıklıyor.</b></p>`:""}${(grupX?grupX.aciklama:x.aciklama||[]).map(p).join("")}${grupX&&grupX.grup_uyarlama?`<p><b>Grubun uyarlaması:</b> ${esc(grupX.grup_uyarlama)}</p>`:""}`;
  else if(aclSekme==="kelime"){const ac=x.kelimeler.some(k=>k.aciklama);ic=`<div style="overflow-x:auto"><table style="border-collapse:collapse;width:100%;min-width:${ac?520:380}px">
    <thead><tr>${["Arapça","Okunuş","Karşılığı",ac?"Açıklama":"Kök ve dil bilgisi"].map(h=>`<th style="text-align:left;border-bottom:2px solid var(--gold);padding:6px">${h}</th>`).join("")}</tr></thead>
    <tbody>${x.kelimeler.map((k,j)=>`<tr style="border-bottom:1px solid var(--line);vertical-align:top"><td style="padding:6px" class="ar" lang="ar"><span style="font-size:24px">${A.w[j]?A.w[j].a:""}</span></td><td style="padding:6px">${esc(k.ok)}</td><td style="padding:6px"><b>${esc(k.karsilik)}</b></td><td style="padding:6px">${esc(k.aciklama||"")}${k.kok?`${k.aciklama?"<br>":""}<span style="font-size:14px;color:var(--lapis);font-weight:700">${esc(k.kok)}</span>`:""}</td></tr>`).join("")}</tbody></table></div>`;}
  else if(aclSekme==="cozum")ic=`${p(x.cozumleme)}<div class="odak"><b>Mesaj:</b> ${esc(x.mesaj)}</div>`;
  else if(aclSekme==="tefsir")ic=((x.tefsir||[]).length?x.tefsir.map(t=>`<p><b style="color:var(--lapis)">${esc(t.ekol)}</b></p>${p(t.metin)}`).join(""):"<p>Kitap bu bölümde görüşleri ayet ayet değil, konu konu veriyor. Aşağıda surenin bütünü için verilen tefsir görüşleri var.</p>")+((CUR.ek.aciklama.genel_tefsir||[]).length&&(i===0||!(x.tefsir||[]).length)?`<details class="detay" ${(x.tefsir||[]).length?"":"open"}><summary><b>Surenin bütünü için tefsir görüşleri (${CUR.ek.aciklama.genel_tefsir.length})</b></summary>${CUR.ek.aciklama.genel_tefsir.map(t=>`<p>${t.ekol?`<b style="color:var(--lapis)">${esc(t.ekol)}:</b> `:""}${esc(t.metin)}</p>`).join("")}</details>`:"");
  else ic=x.boyutlar.length?`<div class="sure-grid">${x.boyutlar.map(b=>`<div class="sure-kart" style="border:2px solid var(--line);border-radius:14px;cursor:default"><span class="sad" style="color:var(--gold)">${esc(b.ad)}</span><span>${esc(b.metin)}</span></div>`).join("")}</div>`:"<p>Bu ayet için kitapta boyut notu yok.</p>";
  el.hidden=false;el.className="detay";
  el.innerHTML=`<div class="subtabs">${ACL_SEKME.map(([k,a])=>`<button data-as="${k}" class="${aclSekme===k?"on":""}">${a}</button>`).join("")}</div>${ic}
  <p style="font-size:14px">Kaynak: ${esc(CUR.ad)} kitabınız, Bölüm ${({aciklama:"4.1",kelime:"4.1 ve 4.2",cozum:"14.2",tefsir:"14.1",boyut:"14.3"})[aclSekme]}.</p><button data-ak="1">Kapat</button>`;
  el.querySelectorAll("[data-as]").forEach(b=>b.onclick=()=>aciklamaAc(i,b.dataset.as));
  el.querySelector("[data-ak]").onclick=()=>{el.hidden=true;document.querySelector(`[data-acl="${i}"]`).classList.remove("on");};
  document.querySelector(`[data-acl="${i}"]`).classList.add("on");
}
