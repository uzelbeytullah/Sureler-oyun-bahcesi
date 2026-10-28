/* Sureler Oyun Bahçesi · Erişilebilirlik yardımcıları ve başlangıç */
/* ---------- erişilebilirlik: yeni ekranın başlığına odak, klavyeyle tecvid ---------- */
{let sonBaslik="";new MutationObserver(()=>{const h=$("view").querySelector("h2");if(!h)return;const t=h.textContent;if(t===sonBaslik)return;sonBaslik=t;
  if(document.activeElement&&document.activeElement.closest&&document.activeElement.closest("input,textarea,select"))return;h.tabIndex=-1;try{h.focus({preventScroll:true});}catch(e){}}).observe($("view"),{childList:true});}
document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target&&e.target.matches&&e.target.matches(".kelimeler [data-c][role=button]")){e.preventDefault();e.target.click();}});
/* ---------- başlangıç ---------- */
anaSayfa();
fetch("data/001.json?v="+SURUM).then(r=>r.json()).then(d=>{CACHE[1]=d;}).catch(()=>{});
(async()=>{
  try{
    if(!window.claude||!claude.use)return;
    const [db,user]=await Promise.all([claude.use("db"),claude.use("user")]);
    if(!db||!user)return;
    const id=await user.id();if(!id)return;DB=db;USR=user;UID=id;try{USR_EDIT=!!(await user.canEdit());USR_YAZ=await user.can("data.write");}catch(e){}
    window.DBK=db.collection("data/users/"+id).doc("profiller");
    try{const ps=await DBK.get();const rl=ps&&ps.exists?(ps.data().liste||[]):[];let deg=false;rl.forEach(p=>{if(!PROF.liste.some(x=>x.id===p.id)){PROF.liste.push(p);deg=true;}});
      try{localStorage.setItem("bahce-profil",JSON.stringify(PROF));}catch(e){}if(rl.length<PROF.liste.length||deg)DBK.set({liste:PROF.liste}).catch(()=>{});}catch(e){}
    if(!PROF.aktif){if(!CUR)anaSayfa();return;}
    docRef=db.collection("data/users/"+id).doc(docAdi(PROF.aktif));
    const snap=await docRef.get();
    const raw=snap&&snap.exists?snap.data():null;
    const remote=raw?normalize(JSON.parse(JSON.stringify(raw))):null;
    if(remote){S=normalize(birlestir(S,remote));try{localStorage.setItem(lsAnahtar(PROF.aktif),JSON.stringify(S));}catch(e){}}
    sonPuan=S.puan;
    bulutGonder();
    $("sync").textContent="İlerleme hesabına kaydediliyor; telefonda ve bilgisayarda aynı kalır";
    renderStats();if(!CUR)anaSayfa();else if(cur==="harita")harita();
  }catch(e){}
})();
