/* Sureler Oyun Bahçesi · Erişilebilirlik yardımcıları ve başlangıç */
/* ---------- erişilebilirlik: yeni ekranın başlığına odak, klavyeyle tecvid ---------- */
{let sonBaslik="";new MutationObserver(()=>{const h=$("view").querySelector("h2");if(!h)return;const t=h.textContent;if(t===sonBaslik)return;sonBaslik=t;
  if(document.activeElement&&document.activeElement.closest&&document.activeElement.closest("input,textarea,select"))return;h.tabIndex=-1;try{h.focus({preventScroll:true});}catch(e){}}).observe($("view"),{childList:true});}
document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target&&e.target.matches&&e.target.matches(".kelimeler [data-c][role=button]")){e.preventDefault();e.target.click();}});
/* ---------- başlangıç ---------- */
anaSayfa();
fetch("data/001.json?v="+SURUM).then(r=>r.json()).then(d=>{CACHE[1]=d;}).catch(()=>{});
async function bulutBasla(){
  try{
    if(!window.claude||!claude.use)return;
    if(claude.bulut&&bulutKapali()){$("sync").textContent="İlerleme bu cihazda saklanıyor";if(Object.keys(S.hedefler||{}).length)bulutDB();return;}
    const [db,user]=await Promise.all([claude.use("db"),claude.use("user")]);
    if(!db||!user)return;
    const id=await user.id();if(!id)return;DB=db;USR=user;UID=id;try{USR_EDIT=!!(await user.canEdit());USR_YAZ=await user.can("data.write");}catch(e){}
    window.DBK=db.collection("data/users/"+id).doc("profiller");
    try{const ps=await DBK.get();const rl=(ps&&ps.exists?(ps.data().liste||[]):[]).filter(p=>p&&/^[A-Za-z0-9_]{1,24}$/.test(String(p.id))).map(p=>({...p,yas:Number(p.yas)||undefined}));   /* buluttan gelen kişi kaydını ekrana basmadan önce denetle; desen kurallardaki belge adıyla aynı */
      let deg=false;rl.forEach(p=>{if(!PROF.liste.some(x=>x.id===p.id)){PROF.liste.push(p);deg=true;}});
      try{localStorage.setItem("bahce-profil",JSON.stringify(PROF));}catch(e){}if(rl.length<PROF.liste.length||deg)DBK.set({liste:PROF.liste}).catch(()=>{});}catch(e){}
    if(!PROF.aktif){if(!CUR&&anaSayfa.no===EKRAN_NO)anaSayfa();bulutBasla.tamam=true;return;}
    /* docRef ancak buluttaki kayıt okunup birleştirildikten sonra atanır; okuma düşerse yerel durum buluttakinin üstüne yazılmaz */
    const aktif=PROF.aktif,ref=db.collection("data/users/"+id).doc(docAdi(aktif));
    const once=JSON.stringify(S);   /* bulut gelirken çocuk ilerleme yaptıysa açık ekranı yeni durumla yeniden çizeceğiz */
    const snap=await ref.get();
    if(PROF.aktif!==aktif)return;   /* bu arada kişi değiştiyse kisiGec kendi eşitlemesini yapar */
    const raw=snap&&snap.exists?snap.data():null;
    const remote=raw?normalize(JSON.parse(JSON.stringify(raw))):null;
    if(remote){S=normalize(birlestir(S,remote));try{localStorage.setItem(lsAnahtar(PROF.aktif),JSON.stringify(S));}catch(e){}}
    sonPuan=S.puan;docRef=ref;
    bulutGonder();
    $("sync").textContent=claude.bulut?"İlerleme bu tarayıcıya bağlı adsız bir hesapla buluta da kaydediliyor":"İlerleme hesabına kaydediliyor";bulutBasla.tamam=true;
    renderStats();
    /* yalnız ana sayfa ya da yıldız haritası açıksa yeniden çiz; oyun, Elif-ba, ebeveyn gibi ekranlarda çocuğu yerinden atma */
    if(!CUR){if(anaSayfa.no===EKRAN_NO)anaSayfa();}else if(cur==="harita")harita();
    else if(cur==="ezber"&&remote&&JSON.stringify(S)!==once){try{aracDur();}catch(e){}show(cur);}   /* ezber ekranı eski kaydı tutar; yalnız o yeniden çizilir */
  }catch(e){}
}
bulutBasla();
/* Uygulama çevrimdışı açıldıysa, bağlantı gelince bulut eşitlemesini bir kez yeniden dene */
window.addEventListener("online",()=>{if(!bulutBasla.tamam&&window.claude&&claude.bulut&&!bulutBasla.calisiyor){bulutBasla.calisiyor=true;bulutBasla().finally(()=>{bulutBasla.calisiyor=false;});}});
