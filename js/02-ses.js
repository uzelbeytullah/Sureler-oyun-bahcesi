/* Sureler Oyun Bahçesi · Kâri sesleri: parça çalma ve sık denetim döngüsü */
/* ---------- ses ---------- */
/* Sık denetim döngüsü yalnız ses çalarken çalışır; durunca kendini kapatır (pil dostu) */
const SIK=new Set();let sikT=null;
function sikCalistir(){if(sikT)return;sikT=setInterval(()=>{let aktif=false;SIK.forEach(f=>{try{if(f())aktif=true;}catch(e){}});if(!aktif){clearInterval(sikT);sikT=null;}},15);}
const ses=new Audio(),ses2=new Audio();ses.preload="auto";ses2.preload="auto";ses.addEventListener("play",sikCalistir);ses2.addEventListener("play",sikCalistir);
let sesBitis=null,sesSonra=null,izle=null,ses2Bitis=null,ses2Sonra=null;
const HIZLAR=[0.5,0.75,1,1.25,1.5];
function hiz(){return HIZLAR.includes(S.hiz)?S.hiz:1;}
function tekrar(){return [1,2,3,7].includes(S.tekrar)?S.tekrar:1;}
function hizUygula(){[ses,ses2].forEach(a=>{a.defaultPlaybackRate=hiz();a.playbackRate=hiz();try{a.preservesPitch=true;}catch(e){}});}
function metaBekle(a,src){return new Promise(res=>{if(a.src.endsWith(src)&&a.readyState>=1)return res();a.src=src;a.addEventListener("loadedmetadata",()=>res(),{once:true});a.load();});}
ses.addEventListener("timeupdate",()=>{if(izle)izle(ses.currentTime);});
ses2.addEventListener("timeupdate",()=>{if(ses2Bitis!==null&&ses2.currentTime>=ses2Bitis-0.03){const f=ses2Sonra;ses2Bitis=null;ses2Sonra=null;if(f)f();setTimeout(()=>ses2.pause(),60);}});
ses.addEventListener("timeupdate",()=>{if(sesBitis!==null&&ses.currentTime>=sesBitis-0.05){const f=sesSonra;sesBitis=null;sesSonra=null;ses.pause();if(f)f();}});
ses.addEventListener("ended",()=>{const f=sesSonra;sesBitis=null;sesSonra=null;if(f)f();});
/* sık denetim: timeupdate saniyede yalnız ~4 kez gelir; çalarken her 15 ms'de bir bakılır */
SIK.add(()=>{
  if(!ses.paused){const t=ses.currentTime;if(izle)izle(t);
    if(sesBitis!==null&&t>=sesBitis-0.02){const f=sesSonra;sesBitis=null;sesSonra=null;ses.pause();if(f)f();}}
  if(!ses2.paused&&ses2Bitis!==null&&ses2.currentTime>=ses2Bitis-0.02){const f=ses2Sonra;ses2Bitis=null;ses2Sonra=null;if(f)f();setTimeout(()=>ses2.pause(),40);}
  return !ses.paused||!ses2.paused;
});
function calParca(no,bas,son,sonra){
  const src=surumle("ses/"+String(no).padStart(3,"0")+".mp3?v="+SURUM);
  sesSonra=sonra||null;sesBitis=son;
  const go=()=>{hizUygula();ses.currentTime=bas;ses.play().catch(()=>{sesBitis=null;sesSonra=null;toast("Ses çalınamadı");if(sonra)sonra(true);});};
  if(!ses.src.endsWith(src)){ses.src=src;ses.addEventListener("loadedmetadata",go,{once:true});ses.load();}else go();
}
function durSes(){sesBitis=null;sesSonra=null;izle=null;ses2Bitis=null;ses2Sonra=null;ses.pause();ses2.pause();}
