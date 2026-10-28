/* Sureler Oyun Bahçesi · Aile kodu (cihaz bağlama) ve öğretmen paneli
   Yalnız GitHub sürümünde (window.claude.bulut) görünür; claude.ai sürümünde bütün giriş düğmeleri gizlidir.
   Veri modeli:
   - aileler/{kod}                       {sahip, uyeler:[uid], t}       kod: rastgeleKod(10)
   - aileler/{kod}/kayit/{belge}         belge: profiller | fatiha | fatiha-<kişi> (data/users/{uid} ile aynı)
   - siniflar/{kod}                      {ogretmen, ad, odev:null|{sure,tur,son}, t}   kod: rastgeleKod(8)
   - siniflar/{kod}/ogrenciler/{uid}     {ad (takma), ozet:{ezberde,yildiz,sonGun,odevDurum}, t}
     belge adı: uid (ilk kişi) ya da uid_<kişi> (aynı cihazda birden çok çocuk)
   Yerelde: bahce-aile-kodu (js/16), bahce-siniflarim (öğretmenin sınıfları), S.sinif (çocuğun sınıfı, kişiye özel). */
const aileSinifVar=()=>!!(window.claude&&claude.bulut);
const KOD_HARF=/^[A-Z2-9]+$/;
const kodTemiz=k=>String(k||"").toUpperCase().replace(/[\s-]/g,"");
const kisiIdIyi=id=>/^[A-Za-z0-9_]{1,24}$/.test(String(id));
/* aile ya da sınıf değişince eşitlemeyi yeni yoldan yeniden başlatır (testte değiştirilebilir) */
let aileEsitle=()=>{try{if(typeof bulutBasla==="function")bulutBasla();}catch(e){}};
/* bir kişinin yerel kaydı (etkin kişi için bellekteki durum) */
function kisiKaydi(id){if(id===PROF.aktif)return JSON.parse(JSON.stringify(S));try{const r=localStorage.getItem(lsAnahtar(id));return r?normalize(JSON.parse(r)):null;}catch(e){return null;}}
function bulutYazmayiDurdur(){docRef=null;window.DBK=null;clearTimeout(saveTimer);saveTimer=null;}

/* ========== AİLE KODU ========== */
async function aileOlustur(){if(!aileSinifVar()||bulutKapali())throw new Error("bulut kapalı");if(aileKodu())return aileKodu();
  if(!await bulutDB())throw new Error("bağlantı yok");save();
  const kod=rastgeleKod(10);
  await DB.collection("aileler").doc(kod).set({sahip:UID,uyeler:[UID],t:today()});
  const kol=DB.collection("aileler/"+kod+"/kayit"),L=PROF.liste.filter(p=>p&&kisiIdIyi(p.id));
  await Promise.all([kol.doc("profiller").set({liste:L}),...L.map(p=>{const k=kisiKaydi(p.id);return k?kol.doc(docAdi(p.id)).set(k):null;})]);
  bulutYazmayiDurdur();
  try{localStorage.setItem(AILE_KEY,kod);}catch(e){}
  return kod;}
/* Katılma: kod bilgisi yetkidir; cihaz kendini uyeler listesine ekler, aile kayıtlarını indirip yereldekiyle birleştirir */
async function aileKatil(kod){kod=kodTemiz(kod);if(kod.length!==10||!KOD_HARF.test(kod))throw new Error("kod");
  if(!aileSinifVar())throw new Error("bulut yok");if(!await bulutDB())throw new Error("bağlantı yok");
  const ref=DB.collection("aileler").doc(kod);if(typeof ref.listeyeEkle!=="function")throw new Error("desteklenmiyor");
  try{await ref.listeyeEkle("uyeler",UID);}
  catch(e){let s=null;try{s=await ref.get();}catch(x){}if(!(s&&s.exists&&(s.data().uyeler||[]).includes(UID)))throw new Error("bulunamadı");}   /* zaten üyeyse ekleme reddedilir; okunabiliyorsa üyeyiz */
  save();bulutYazmayiDurdur();
  const kol=DB.collection("aileler/"+kod+"/kayit");
  let rl=[];try{const ps=await kol.doc("profiller").get();rl=(ps&&ps.exists?(ps.data().liste||[]):[]).filter(p=>p&&kisiIdIyi(p.id)).map(p=>({...p,id:String(p.id),ad:String(p.ad||"").slice(0,40),yas:Number(p.yas)||undefined}));}catch(e){}
  rl.forEach(p=>{if(!PROF.liste.some(x=>x.id===p.id))PROF.liste.push(p);});
  const yaz=[];
  for(const p of PROF.liste){if(!kisiIdIyi(p.id))continue;let rem=null;
    try{const sn=await kol.doc(docAdi(p.id)).get();rem=sn&&sn.exists?normalize(JSON.parse(JSON.stringify(sn.data()))):null;}catch(e){}
    const yer=kisiKaydi(p.id),bir=rem&&yer?normalize(birlestir(yer,rem)):(rem||yer);if(!bir)continue;
    try{localStorage.setItem(lsAnahtar(p.id),JSON.stringify(bir));}catch(e){}
    if(p.id===PROF.aktif){S=bir;sonPuan=S.puan;}
    yaz.push(kol.doc(docAdi(p.id)).set(JSON.parse(JSON.stringify(bir))).catch(()=>{}));}
  yaz.push(kol.doc("profiller").set({liste:PROF.liste.filter(p=>kisiIdIyi(p.id))}).catch(()=>{}));
  try{localStorage.setItem("bahce-profil",JSON.stringify(PROF));}catch(e){}
  await Promise.all(yaz);
  try{localStorage.setItem(AILE_KEY,kod);localStorage.setItem(BULUT_ACIK_KEY,"1");}catch(e){}
  return kod;}
async function aileBilgi(){const kod=aileKodu();if(!kod||!await bulutDB())return null;try{const s=await DB.collection("aileler").doc(kod).get();return s&&s.exists?s.data():null;}catch(e){return null;}}
/* Sahip: aile kayıtlarını ve aileyi siler. Üye: aileden çıkar. Bu cihazdaki ilerleme kalır; eşitleme kişisel yola döner. Silinemeyen kayıt sayısını döndürür. */
async function aileBirak(){const kod=aileKodu();if(!kod)return 0;if(!await bulutDB())throw new Error("bağlantı yok");
  const ref=DB.collection("aileler").doc(kod);let sahip=false;
  try{const s=await ref.get();sahip=!!(s&&s.exists&&s.data().sahip===UID);}catch(e){}
  save();bulutYazmayiDurdur();let hata=0;
  if(sahip){const kol=DB.collection("aileler/"+kod+"/kayit"),ad=["profiller",...PROF.liste.filter(p=>kisiIdIyi(p.id)).map(p=>docAdi(p.id))];
    try{const s=await kol.get();(s.docs||[]).forEach(d=>{if(!ad.includes(d.id))ad.push(d.id);});}catch(e){}
    const r=await Promise.allSettled(ad.map(a=>kol.doc(a).delete()));hata=r.filter(x=>x.status==="rejected").length;
    await ref.delete();}
  else await ref.listedenCikar("uyeler",UID);
  try{localStorage.removeItem(AILE_KEY);}catch(e){}
  return hata;}
/* Sahip: diğer cihazların bağlantısını keser (kodu bilen yeniden katılabilir; tamamen kesmek için aileyi silip yeni kod alın) */
async function aileDigerleriniCikar(){const kod=aileKodu();if(!kod||!await bulutDB())throw new Error("bağlantı yok");const ref=DB.collection("aileler").doc(kod);
  /* çıkarılanlar yasak listesine yazılır; kodu bilseler de kendilerini yeniden ekleyemezler */
  const s=await ref.get(),d=(s&&s.exists&&s.data())||{};const yasak=[...new Set([...(Array.isArray(d.yasak)?d.yasak:[]),...(Array.isArray(d.uyeler)?d.uyeler:[]).filter(u=>u!==UID)])].slice(-50);
  await ref.update({uyeler:[UID],yasak});}

/* ========== SINIF: öğretmen tarafı ========== */
const SINIF_KEY="bahce-siniflarim";
function siniflarim(){try{const L=JSON.parse(localStorage.getItem(SINIF_KEY)||"[]");return Array.isArray(L)?L.filter(x=>x&&typeof x.kod==="string"&&x.kod.length===8&&KOD_HARF.test(x.kod)).map(x=>({kod:x.kod,ad:String(x.ad||"").slice(0,40)})):[];}catch(e){return [];}}
function siniflarimKaydet(L){try{localStorage.setItem(SINIF_KEY,JSON.stringify(L));}catch(e){}}
async function sinifOlustur(ad){ad=String(ad||"").trim().slice(0,40);if(!ad)throw new Error("ad");if(!aileSinifVar()||!await bulutDB())throw new Error("bağlantı yok");
  const kod=rastgeleKod(8);await DB.collection("siniflar").doc(kod).set({ogretmen:UID,ad,odev:null,t:today()});
  siniflarimKaydet(siniflarim().concat([{kod,ad}]));return kod;}
async function sinifGetir(kod){if(!await bulutDB())return undefined;try{const s=await DB.collection("siniflar").doc(kod).get();return s&&s.exists?s.data():null;}catch(e){return undefined;}}
async function sinifOgrencileri(kod){const s=await DB.collection("siniflar/"+kod+"/ogrenciler").get();return (s.docs||[]).map(d=>({id:d.id,...(d.data()||{})}));}
/* odev: null (kaldır) ya da {sure, tur:"ezber"|"yildiz", son:"YYYY-AA-GG"} */
async function odevVer(kod,odev){if(!await bulutDB())throw new Error("bağlantı yok");const o=odev?odevTemiz(odev):null;if(odev&&!o)throw new Error("ödev");
  await DB.collection("siniflar").doc(kod).update({odev:o,t:today()});}
async function sinifSil(kod){if(!await bulutDB())throw new Error("bağlantı yok");const kol=DB.collection("siniflar/"+kod+"/ogrenciler");
  try{const s=await kol.get();await Promise.allSettled((s.docs||[]).map(d=>kol.doc(d.id).delete()));}catch(e){}
  await DB.collection("siniflar").doc(kod).delete();siniflarimKaydet(siniflarim().filter(x=>x.kod!==kod));}

/* ========== SINIF: öğrenci tarafı (veli izniyle; yalnız takma ad ve özet sayılar gider) ========== */
function odevTemiz(o){if(!o||typeof o!=="object")return null;const sure=Math.floor(Number(o.sure));if(!KATALOG.some(k=>k.no===sure&&!k.gruplar))return null;
  return {sure,tur:o.tur==="ezber"?"ezber":"yildiz",son:/^\d{4}-\d\d-\d\d$/.test(String(o.son||""))?String(o.son):""};}
function ogrenciBelge(){return PROF.aktif&&PROF.aktif!=="p0"&&kisiIdIyi(PROF.aktif)?UID+"_"+PROF.aktif:UID;}
function odevDurumu(){const x=S.sinif,o=x&&x.odev;if(!o)return "yok";let tam=false;
  if(o.tur==="ezber"){const k=KATALOG.find(k=>k.no===o.sure),D=((S.sure[o.sure]||{}).ezberDurum)||{};tam=!!k&&k.ayet>0&&Array.from({length:k.ayet},(_,i)=>i).every(i=>ezbTam(D[i]));}
  else tam=yildizSay(o.sure)===4;
  if(tam)return "tamam";return o.son&&today()>o.son?"gecikti":"suruyor";}
function sinifOzet(){let ez=0;Object.values(S.sure||{}).forEach(x=>Object.values((x&&x.ezberDurum)||{}).forEach(d=>{if(ezbTam(d))ez++;}));
  const y=KATALOG.reduce((a,k)=>a+(k.gruplar?grupYildiz(k):yildizSay(k.no)),0);
  return {ezberde:Math.min(ez,10000),yildiz:Math.min(y,10000),sonGun:/^\d{4}-\d\d-\d\d$/.test(S.sonGun||"")?S.sonGun:"",odevDurum:odevDurumu()};}
async function sinifKatil(kod,ad){kod=kodTemiz(kod);ad=String(ad||"").trim().slice(0,20);
  if(kod.length!==8||!KOD_HARF.test(kod))throw new Error("kod");if(!ad)throw new Error("ad");if(!aileSinifVar()||!await bulutDB())throw new Error("bağlantı yok");
  const s=await DB.collection("siniflar").doc(kod).get();if(!s||!s.exists)throw new Error("bulunamadı");const d=s.data()||{};
  S.sinif={kod,ad,sinifAd:String(d.ad||"").slice(0,40),doc:ogrenciBelge(),odev:odevTemiz(d.odev)};save();
  if(!await sinifOzetGonder(true))throw new Error("yazılamadı");return S.sinif;}
async function sinifCik(){const x=S.sinif;if(!x)return;delete S.sinif;save();
  if(await bulutDB()&&x.doc&&(x.doc===UID||x.doc.startsWith(UID+"_"))){try{await DB.collection("siniflar/"+x.kod+"/ogrenciler").doc(x.doc).delete();}catch(e){}}}
/* Özet: çalışmadan 30 sn sonra, değiştiyse ve günde en çok 6 kez yazılır */
const OZET_GUNLUK=6;let ozetT=null;
async function sinifOzetGonder(zorla){clearTimeout(ozetT);ozetT=null;const x=S.sinif;if(!aileSinifVar()||!x||!x.kod||!x.ad)return false;
  if(!await bulutDB())return false;
  if(x.doc!==ogrenciBelge())return false;   /* başka bir cihazda katılındı: özeti o cihaz yazar */
  const oz=sinifOzet(),j=JSON.stringify([x.ad,oz]);if(!zorla&&j===x.son)return false;
  let say={};try{say=JSON.parse(localStorage.getItem("bahce-sinif-yazim")||"{}")||{};}catch(e){}if(say.g!==today())say={g:today(),n:0};if(!zorla&&say.n>=OZET_GUNLUK)return false;
  try{await DB.collection("siniflar/"+x.kod+"/ogrenciler").doc(x.doc).set({ad:x.ad,ozet:oz,t:today()});}catch(e){return false;}
  say.n++;try{localStorage.setItem("bahce-sinif-yazim",JSON.stringify(say));}catch(e){}
  if(S.sinif===x){x.son=j;save();}return true;}
function sinifOzetPlanla(){if(ozetT||!aileSinifVar()||!S.sinif)return;ozetT=setTimeout(()=>{ozetT=null;sinifOzetGonder(false);},30000);}
/* her kayıttan sonra (çalışma bitince) özeti planla */
{const ilkSave=save;save=function(){const r=ilkSave.apply(this,arguments);try{sinifOzetPlanla();}catch(e){}return r;};}
async function sinifOdevYenile(){const x=S.sinif;if(!x||!await bulutDB())return;let s;try{s=await DB.collection("siniflar").doc(x.kod).get();}catch(e){return;}
  if(S.sinif!==x)return;if(s&&!s.exists){delete S.sinif;save();return;}   /* öğretmen sınıfı sildi */
  const d=(s&&s.data())||{},once=JSON.stringify([x.odev||null,x.sinifAd]);x.odev=odevTemiz(d.odev);x.sinifAd=String(d.ad||"").slice(0,40);
  if(JSON.stringify([x.odev||null,x.sinifAd])!==once){save();if(!CUR&&anaSayfa.no===EKRAN_NO)anaSayfa();}}
/* Ana sayfa kartı: js/03 anaSayfa içinde ${odevKartiHtml()} olarak eklenir; "Sureyi aç" düğmesi aşağıdaki genel dinleyiciyle çalışır */
function odevKartiHtml(){if(!aileSinifVar())return "";const x=S.sinif,o=x&&x.odev;if(!o)return "";const k=KATALOG.find(k=>k.no===o.sure);if(!k)return "";const d=odevDurumu();
  let son="";try{son=o.son?new Date(o.son+"T12:00").toLocaleDateString("tr-TR",{day:"numeric",month:"long"}):"";}catch(e){}
  return `<section class="detay aile-kart" aria-label="Öğretmeninin ödevi"><h3>${ikon("library")} Öğretmeninin ödevi</h3><p><b>${esc(k.ad)}</b> suresini ${o.tur==="ezber"?"ezberle":"dört yıldızla bitir"}${son?" · son gün: "+esc(son):""}</p>${d==="tamam"?"<p><b>✓ Ödevin tamam, maşallah!</b></p>":d==="gecikti"?"<p>Süresi geçti; yine de tamamlayabilirsin.</p>":""}${d==="tamam"?"":`<button class="dokun44" data-odevac="${k.no}">Sureyi aç</button>`}</section>`;}
document.addEventListener("click",e=>{const b=e.target&&e.target.closest&&e.target.closest("[data-odevac]");if(!b)return;const x=S.sinif;ac(+b.dataset.odevac,x&&x.odev&&x.odev.tur==="ezber"?"ezber":undefined);});

/* ========== bulut kaydını silerken (js/16 bulutSil): aile, öğrenci ve öğretmen kayıtları ========== */
async function aileSinifSil(){const L=[];if(!DB||!UID)return L;
  if(aileKodu())L.push(aileBirak().finally(()=>{try{localStorage.removeItem(AILE_KEY);}catch(e){}}));
  PROF.liste.forEach(p=>{if(!kisiIdIyi(p.id))return;const k=kisiKaydi(p.id),x=k&&k.sinif;if(!x)return;
    if(x.kod&&x.doc&&(x.doc===UID||String(x.doc).startsWith(UID+"_")))L.push(DB.collection("siniflar/"+x.kod+"/ogrenciler").doc(x.doc).delete());
    if(p.id===PROF.aktif)delete S.sinif;else{delete k.sinif;try{localStorage.setItem(lsAnahtar(p.id),JSON.stringify(k));}catch(e){}}});
  delete S.sinif;
  siniflarim().forEach(s=>L.push(sinifSil(s.kod)));
  try{localStorage.setItem(lsAnahtar(PROF.aktif),JSON.stringify(S));}catch(e){}
  return L;}

/* ========== EKRANLAR (yetişkin kapısı arkasında) ========== */
const kodKutusu=(id,n,ph)=>`<input id="${id}" class="ara" maxlength="${n+2}" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="${ph}" aria-label="${ph}" style="text-transform:uppercase;letter-spacing:2px;max-width:260px">`;
function ekranAc(baslikYazi,alt){CUR=null;baslik();setTabs();try{durSes();}catch(e){}$("baslik").textContent=baslikYazi;$("altbaslik").textContent=alt;}
/* Ebeveyn bölümündeki "Bulut kaydı ve gizlilik" kutusuna giriş düğmeleri (js/13) */
function aileSinifDugmeleri(){if(!aileSinifVar())return "";const k=aileKodu(),x=S.sinif;
  return `<h4 style="margin:14px 0 6px">Aile ve sınıf</h4><p class="kucuk-yazi">Aile kodu, ailenizin telefon ve tabletlerini aynı kayda bağlar. Sınıf kodu, çocuğunuzun Kur'an kursundaki öğretmenine yalnız özet sayıları (ezberdeki ayet, yıldız, son çalışma günü, ödev durumu) gösterir.</p>
  <p class="esnek ara-2 sarmal"><button id="aileGit" class="dokun44">${ikon("users")} ${k?"Aile kodu: "+k:"Aile kodu"}</button><button id="sinifGit" class="dokun44">${ikon("backpack")} ${x?"Sınıf: "+esc(x.sinifAd||x.kod):"Sınıfa katıl"}</button><button id="ogretmenGit" class="dokun44">${ikon("school")} Öğretmen paneli</button></p>`;}
function aileSinifBagla(){const a=$("aileGit");if(a)a.onclick=()=>aileSayfa();const s=$("sinifGit");if(s)s.onclick=()=>sinifSayfa();const o=$("ogretmenGit");if(o)o.onclick=()=>ogretmenPaneli();}
const RIZA_METNI="Velisi olarak, çocuğumun adının, yaşının ve ilerlemesinin ebeveyn bölümünde anlatıldığı gibi Google Firebase'de saklanmasına izin veriyorum.";
async function aileSayfa(){if(!aileSinifVar())return;if(!kapiAcik()){ebeveynKapisi(aileSayfa);return;}
  ekranAc("Aile kodu","Ailenin cihazlarını birbirine bağla");const V=$("view"),kod=aileKodu();const geri=`<button class="geri" id="afG">${ikon("arrow-left")}Ebeveyn bölümü</button>`;
  if(kod){V.innerHTML=geri+`<p class="yukleniyor">Yükleniyor…</p>`;$("afG").onclick=()=>ebeveynOzet();const A=await aileBilgi();if(aileKodu()!==kod)return;const sahip=!!(A&&A.sahip===UID);
    V.innerHTML=geri+`<h2>${ikon("users")} Aile kodu</h2><p class="yazi-4">Kod: <b style="font-size:36px;letter-spacing:4px">${kod}</b></p>
    <p>Bu cihazdaki kişiler ve ilerleme bu aile kaydıyla eşitleniyor${A&&Array.isArray(A.uyeler)?` (${A.uyeler.length} cihaz bağlı)`:""}. Başka bir cihazı bağlamak için orada ebeveyn bölümünde <b>Aile kodu → Aile koduna katıl</b>'a basıp bu kodu yazın. Kodu yalnız ailenizle paylaşın: kodu bilen her cihaz aile kaydına katılabilir.</p>
    ${A?"":`<p class="odak" role="note">Aile kaydına şu an ulaşılamıyor (bağlantı yok ya da aile silinmiş olabilir).</p>`}
    <p class="esnek ara-2 sarmal">${sahip?`<button id="afKes" class="dokun44">Diğer cihazların bağlantısını kes</button><button id="afSil" class="dokun44">Aileyi ve aile kayıtlarını sil</button>`:`<button id="afSil" class="dokun44">Bu cihazı aileden çıkar</button>`}</p>
    <p class="kucuk-yazi">${sahip?"Aileyi silince bu cihazdaki ilerleme kalır; buluttaki aile kayıtları silinir, diğer cihazlar kendi kayıtlarına döner.":"Aileden çıkınca bu cihazdaki ilerleme kalır ve kendi bulut kaydınızla eşitlenmeye devam eder."}</p>`;
    $("afG").onclick=()=>ebeveynOzet();
    const ks=$("afKes");if(ks)ks.onclick=async()=>{try{await aileDigerleriniCikar();toast("Diğer cihazların bağlantısı kesildi");}catch(e){toast("Yapılamadı; bağlantıyı denetleyin");}aileSayfa();};
    const sl=$("afSil");sl.onclick=async()=>{if(!sl.dataset.onay){sl.dataset.onay="1";sl.textContent="Emin misiniz? Bir daha basın";return;}
      sl.disabled=true;try{const h=await aileBirak();toast(h?"Bazı aile kayıtları silinemedi":sahip?"Aile silindi":"Aileden çıkıldı");aileEsitle();}catch(e){toast("Bağlantı yok; yapılamadı");}aileSayfa();};
    return;}
  const kapali=bulutKapali();
  V.innerHTML=geri+`<h2>${ikon("users")} Aile kodu</h2><p>Her tarayıcı kendi adsız hesabını açar; bu yüzden telefonunuzdan çocuğunuzun tabletindeki ilerlemeyi göremezsiniz. Aile kodu, ailenin cihazlarını tek bir aile kaydına bağlar (en çok 8 cihaz).</p>
  <section class="detay"><h3>Aile kodu oluştur</h3>${kapali?`<p>Önce ebeveyn bölümünden bulut kaydını açın; ya da başka bir cihazda oluşturulan koda aşağıdan katılın.</p>`:`<p>Bu cihazdaki kişiler ve ilerleme aile kaydına kopyalanır; kod ekranda görünür.</p><button class="dokun44 primary" id="afOlustur">Aile kodu oluştur</button>`}</section>
  <section class="detay"><h3>Aile koduna katıl</h3><p>${kodKutusu("afKod",10,"10 harfli aile kodu")}</p>
  ${kapali?`<label class="esnek ara-2 dik-bas kucuk-yazi"><input type="checkbox" id="afRiza" class="gen24 yuk24"> ${RIZA_METNI}</label>`:""}
  <button class="dokun44 primary" id="afKatil">Katıl</button><p class="kucuk-yazi">Katılınca bu cihazdaki kişiler ve ilerleme aile kaydıyla birleştirilir; hiçbir emek kaybolmaz.</p></section>`;
  $("afG").onclick=()=>ebeveynOzet();
  const ol=$("afOlustur");if(ol)ol.onclick=async()=>{ol.disabled=true;try{const k=await aileOlustur();toast("Aile kodu oluşturuldu: "+k);aileEsitle();}catch(e){toast("Aile kodu oluşturulamadı; bağlantıyı denetleyin");}aileSayfa();};
  $("afKatil").onclick=async()=>{const k=kodTemiz($("afKod").value);if(k.length!==10||!KOD_HARF.test(k)){toast("10 harfli aile kodunu yazın");return;}
    if(kapali&&!($("afRiza")&&$("afRiza").checked)){toast("Önce izin kutusunu işaretleyin");return;}
    const b=$("afKatil");b.disabled=true;b.textContent="Katılınıyor…";
    try{await aileKatil(k);toast("Aileye katıldınız");aileEsitle();}catch(e){toast(e&&e.message==="bulunamadı"?"Bu kodla bir aile bulunamadı ya da aile dolu":"Katılınamadı; bağlantıyı denetleyin");}aileSayfa();};}
const ODEV_DURUM={yok:"—",suruyor:"Sürüyor",tamam:"✓ Tamam",gecikti:"Gecikti"};
const odevYazi=o=>{const k=o&&KATALOG.find(k=>k.no===o.sure);return k?`${esc(k.ad)} · ${o.tur==="ezber"?"ezberle":"4 yıldız"}${o.son?" · son gün "+esc(o.son):""}`:"";};
async function sinifSayfa(){if(!aileSinifVar())return;if(!kapiAcik()){ebeveynKapisi(sinifSayfa);return;}
  ekranAc("Sınıfa katıl","Kur'an kursu ya da sınıf");const V=$("view"),p=aktifKisi(),x=S.sinif;const geri=`<button class="geri" id="sfG">${ikon("arrow-left")}Ebeveyn bölümü</button>`;
  if(!p){V.innerHTML=geri+`<h2>${ikon("backpack")} Sınıfa katıl</h2><p>Önce ana sayfadan bir kişi seçin; sınıf kaydı kişiye özeldir.</p>`;$("sfG").onclick=()=>ebeveynOzet();return;}
  if(x){V.innerHTML=geri+`<h2>${ikon("backpack")} ${esc(p.ad||"Bu kişi")} · ${esc(x.sinifAd||x.kod)}</h2>
    <p>Takma ad: <b>${esc(x.ad)}</b> · Sınıf kodu: <b>${esc(x.kod)}</b></p>
    <p>Öğretmene giden: ${(()=>{const o=sinifOzet();return `ezberdeki ayet <b>${o.ezberde}</b>, toplam yıldız <b>${o.yildiz}</b>, son çalışma günü <b>${esc(o.sonGun||"—")}</b>, ödev durumu <b>${ODEV_DURUM[o.odevDurum]}</b>`;})()}. Ayrıntılı ilerleme gönderilmez; özet çalışmadan sonra, günde en çok ${OZET_GUNLUK} kez güncellenir.</p>
    <p>Ödev: ${x.odev?`<b>${odevYazi(x.odev)}</b>`:"şu an yok"}</p>
    <p class="esnek ara-2 sarmal"><button id="sfGonder" class="dokun44">Özeti şimdi gönder</button><button id="sfCik" class="dokun44">Sınıftan çık</button></p>`;
    $("sfG").onclick=()=>ebeveynOzet();
    $("sfGonder").onclick=async()=>{await sinifOdevYenile();toast(await sinifOzetGonder(true)?"Özet gönderildi":"Gönderilemedi; bağlantıyı denetleyin");sinifSayfa();};
    const c=$("sfCik");c.onclick=async()=>{if(!c.dataset.onay){c.dataset.onay="1";c.textContent="Emin misiniz? Bir daha basın";return;}await sinifCik();toast("Sınıftan çıkıldı");sinifSayfa();};
    return;}
  V.innerHTML=geri+`<h2>${ikon("backpack")} ${esc(p.ad||"Bu kişi")} için sınıfa katıl</h2><p>Öğretmenin verdiği 8 harfli kodu ve çocuğunuz için bir takma ad yazın. Öğretmen yalnız takma adı ve özet sayıları görür: ezberdeki ayet sayısı, toplam yıldız, son çalışma günü ve ödev durumu.</p>
  <p>${kodKutusu("sfKod",8,"8 harfli sınıf kodu")}</p><p><input id="sfAd" class="ara" maxlength="20" placeholder="Takma ad (ör. Ali K.)" aria-label="Takma ad" style="max-width:260px"></p>
  <label class="esnek ara-2 dik-bas kucuk-yazi"><input type="checkbox" id="sfRiza" class="gen24 yuk24"> Velisi olarak, çocuğumun takma adının ve özet sayılarının öğretmenine görünmesine ve bunun için Google Firebase'de saklanmasına izin veriyorum.</label>
  <button class="dokun44 primary" id="sfKatil">Katıl</button>`;
  $("sfG").onclick=()=>ebeveynOzet();
  $("sfKatil").onclick=async()=>{const k=kodTemiz($("sfKod").value),a=$("sfAd").value.trim();if(k.length!==8||!KOD_HARF.test(k)){toast("8 harfli sınıf kodunu yazın");return;}if(!a){toast("Bir takma ad yazın");return;}
    if(!$("sfRiza").checked){toast("Önce izin kutusunu işaretleyin");return;}
    const b=$("sfKatil");b.disabled=true;
    try{const s=await sinifKatil(k,a);toast("Sınıfa katıldınız: "+(s.sinifAd||k));}catch(e){toast(e&&e.message==="bulunamadı"?"Bu kodla bir sınıf bulunamadı":"Katılınamadı; bağlantıyı denetleyin");}sinifSayfa();};}
async function ogretmenPaneli(kod){if(!aileSinifVar())return;if(!kapiAcik()){ebeveynKapisi(()=>ogretmenPaneli(kod));return;}
  ekranAc("Öğretmen paneli","Kur'an kursu ve sınıf için");const V=$("view");V.innerHTML=`<p class="yukleniyor">Yükleniyor…</p>`;
  const L=siniflarim();if(kod===undefined&&L.length===1)kod=L[0].kod;
  if(!await bulutDB()){V.innerHTML=`<button class="geri" id="opG">${ikon("arrow-left")}Ebeveyn bölümü</button><p>Öğretmen paneli için buluta bağlanılamadı. İnternet bağlantınızı denetleyin.</p>`;$("opG").onclick=()=>ebeveynOzet();return;}
  if(kod){const C=await sinifGetir(kod);
    if(C===null){siniflarimKaydet(siniflarim().filter(x=>x.kod!==kod));toast("Bu sınıf artık yok");ogretmenPaneli(null);return;}
    if(!C||C.ogretmen!==UID){V.innerHTML=`<button class="geri" id="opG">${ikon("arrow-left")}Sınıflarım</button><p>Sınıfa ulaşılamadı.</p>`;$("opG").onclick=()=>ogretmenPaneli(null);return;}
    let O=[];try{O=await sinifOgrencileri(kod);}catch(e){}
    O.sort((a,b)=>String(a.ad||"").localeCompare(String(b.ad||""),"tr"));
    const sec=KATALOG.filter(k=>!k.gruplar),od=odevTemiz(C.odev),hc="padding:6px 8px;border-bottom:1px solid currentColor;text-align:left";
    V.innerHTML=`<button class="geri" id="opG">${ikon("arrow-left")}Sınıflarım</button><h2>${ikon("school")} ${esc(C.ad||"")}</h2>
    <p class="yazi-4">Sınıf kodu: <b style="font-size:40px;letter-spacing:6px">${esc(kod)}</b></p>
    <p>Öğrencinin velisi, ebeveyn bölümündeki <b>Sınıfa katıl</b> düğmesine basıp bu kodu ve bir takma ad yazar. Burada yalnız özet sayılar görünür.</p>
    <h3>Öğrenciler (${O.length})</h3>${O.length?`<div class="yatay-kaydir"><table style="width:100%;border-collapse:collapse;font-size:16px"><thead><tr><th style="${hc}">Takma ad</th><th style="${hc}">Ezberdeki ayet</th><th style="${hc}">Yıldız</th><th style="${hc}">Son çalışma</th><th style="${hc}">Ödev</th></tr></thead><tbody>
    ${O.map(o=>{const z=o.ozet&&typeof o.ozet==="object"?o.ozet:{};return `<tr><td class="ic-2"><b>${esc(String(o.ad||"").slice(0,20))}</b></td><td class="ic-2">${Number(z.ezberde)||0}</td><td class="ic-2">${Number(z.yildiz)||0}</td><td class="ic-2">${esc(/^\d{4}-\d\d-\d\d$/.test(z.sonGun||"")?z.sonGun:"—")}</td><td class="ic-2">${ODEV_DURUM[z.odevDurum]||"—"}</td></tr>`;}).join("")}</tbody></table></div>`:"<p>Henüz katılan öğrenci yok.</p>"}
    <section class="detay"><h3>Ödev</h3><p>Şu anki ödev: ${od?`<b>${odevYazi(od)}</b>`:"yok"}</p>
    <p class="esnek ara-2 sarmal dik-orta"><select id="opSure" aria-label="Sure" class="dokun44 yazi-3">${sec.map(k=>`<option value="${k.no}" ${od&&od.sure===k.no?"selected":""}>${esc(k.ad)}</option>`).join("")}</select>
    <select id="opTur" aria-label="Hedef" class="dokun44 yazi-3"><option value="ezber" ${od&&od.tur==="ezber"?"selected":""}>Ezberle</option><option value="yildiz" ${od&&od.tur==="yildiz"?"selected":""}>4 yıldız</option></select>
    <label>Son gün <input id="opSon" type="date" value="${esc(od&&od.son?od.son:gunEkle(7))}" class="dokun44 yazi-3"></label></p>
    <p class="esnek ara-2 sarmal"><button class="dokun44 primary" id="opVer">Ödevi ver</button>${od?`<button id="opKaldir" class="dokun44">Ödevi kaldır</button>`:""}<button id="opYenile" class="dokun44">Listeyi yenile</button></p></section>
    <details class="detay"><summary>Sınıfı sil</summary><p>Sınıf ve öğrencilerin özet kayıtları buluttan silinir.</p><button id="opSil" class="dokun44">Sınıfı sil</button></details>`;
    $("opG").onclick=()=>ogretmenPaneli(null);$("opYenile").onclick=()=>ogretmenPaneli(kod);
    $("opVer").onclick=async()=>{try{await odevVer(kod,{sure:+$("opSure").value,tur:$("opTur").value,son:$("opSon").value});toast("Ödev verildi");}catch(e){toast("Ödev kaydedilemedi");}ogretmenPaneli(kod);};
    const kl=$("opKaldir");if(kl)kl.onclick=async()=>{try{await odevVer(kod,null);toast("Ödev kaldırıldı");}catch(e){toast("Yapılamadı");}ogretmenPaneli(kod);};
    const sl=$("opSil");sl.onclick=async()=>{if(!sl.dataset.onay){sl.dataset.onay="1";sl.textContent="Emin misiniz? Bir daha basın";return;}try{await sinifSil(kod);toast("Sınıf silindi");}catch(e){toast("Silinemedi");}ogretmenPaneli(null);};
    return;}
  V.innerHTML=`<button class="geri" id="opG">${ikon("arrow-left")}Ebeveyn bölümü</button><h2>${ikon("school")} Öğretmen paneli</h2><p>Kur'an kursu ya da sınıf için bir sınıf açın; öğrencilerinizin velileri kodla katılır. Yalnız takma ad ve özet sayılar (ezberdeki ayet, yıldız, son çalışma günü, ödev durumu) görünür.</p>
  ${L.length?`<h3>Sınıflarım</h3><p class="esnek ara-2 sarmal">${L.map(s=>`<button data-sinif="${esc(s.kod)}" class="dokun44">${esc(s.ad||s.kod)} · ${esc(s.kod)}</button>`).join("")}</p>`:""}
  <section class="detay"><h3>Sınıf oluştur</h3><p><input id="opAd" class="ara" maxlength="40" placeholder="Sınıfın adı (ör. Cumartesi Kur'an kursu)" aria-label="Sınıfın adı"></p><button class="dokun44 primary" id="opOlustur">Sınıf oluştur</button></section>`;
  $("opG").onclick=()=>ebeveynOzet();
  V.querySelectorAll("[data-sinif]").forEach(b=>b.onclick=()=>ogretmenPaneli(b.dataset.sinif));
  $("opOlustur").onclick=async()=>{const a=$("opAd").value.trim();if(!a){toast("Sınıfa bir ad verin");return;}try{const k=await sinifOlustur(a);toast("Sınıf oluşturuldu: "+k);ogretmenPaneli(k);}catch(e){toast("Sınıf oluşturulamadı; bağlantıyı denetleyin");}};}

/* ========== açılışta: silinmiş aileyi bırak, ödevi yenile, bekleyen özeti gönder ========== */
setTimeout(async()=>{if(!aileSinifVar())return;
  if(aileKodu()&&!bulutKapali()&&await bulutDB()){try{await DB.collection("aileler").doc(aileKodu()).get();}catch(e){
    if(e&&e.code==="permission-denied"){try{localStorage.removeItem(AILE_KEY);}catch(x){}toast("Aile kaydı artık yok; bu cihaz kendi bulut kaydına döndü");bulutYazmayiDurdur();aileEsitle();}}}
  if(S.sinif){await sinifOdevYenile();sinifOzetPlanla();}},4000);
