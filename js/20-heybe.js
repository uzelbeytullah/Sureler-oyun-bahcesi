/* Sureler Oyun Bahçesi · Heybe: ilerlemeyi buluta gerek kalmadan başka cihaza taşıma (dışa / içe aktarma)
   - Heybe, bu cihazdaki kişilerin ilerlemesini tek bir pakete koyar: dosya (.json) ya da panoya kopyalanan metin.
   - Açılınca hiçbir şeyin üstüne yazılmaz; bulut eşitlemesindeki birlestir() ile mevcut kayıtla birleştirilir.
   - İçine bulut anahtarları (aile kodu, sınıf, ortak hedef kodları) konmaz; yalnız ilerleme taşınır.
   - Hiçbir sunucuya gitmez; Firebase'in okuma-yazma sayacını etkilemez. */
const HEYBE_TUR="sureler-oyun-bahcesi-heybe",HEYBE_SURUM=1,HEYBE_EN_COK=3e6;   /* 3 MB üstü dosya açılmaz */
/* Taşınmayanlar: cihaza ya da hesaba bağlı anahtarlar ve cihaz ayarları */
const HEYBE_DISARIDA=new Set(["sinif","hedefler","kullanim","gizliT","oturumDk"]);
let HEYBE_BEKLEYEN=null;   /* okunmuş ama henüz açılmamış heybe */

function heybeKisiKaydi(id){if(id===PROF.aktif)return JSON.parse(JSON.stringify(S));
  try{const r=localStorage.getItem(lsAnahtar(id));return r?normalize(JSON.parse(r)):null;}catch(e){return null;}}
function heybeTemizle(x){const o={};Object.keys(x||{}).forEach(k=>{if(!HEYBE_DISARIDA.has(k))o[k]=x[k];});return o;}
function heybeHazirla(){
  const kisiler=PROF.liste.filter(p=>p&&kisiIdIyi(p.id)).map(p=>{const k=heybeKisiKaydi(p.id);return k?{id:p.id,ad:String(p.ad||"").slice(0,20),yas:Number(p.yas)||0,ilerleme:heybeTemizle(k)}:null;}).filter(Boolean);
  return {tur:HEYBE_TUR,surum:HEYBE_SURUM,t:new Date().toISOString(),kisiler};}

/* --- metin biçimi: "SOB1:" + sıkıştırılmış (gzip) base64; tarayıcı sıkıştıramıyorsa "SOB0:" + düz base64 --- */
const b64=u8=>{let s="";for(let i=0;i<u8.length;i+=32768)s+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));return btoa(s);};
const b64ac=t=>{const s=atob(t);const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u;};
async function akis(u8,Tur,ne){const a=new Response(u8).body.pipeThrough(new Tur(ne));return new Uint8Array(await new Response(a).arrayBuffer());}
async function heybeMetin(h){const u8=new TextEncoder().encode(JSON.stringify(h));
  if(typeof CompressionStream==="function"){try{return "SOB1:"+b64(await akis(u8,CompressionStream,"gzip"));}catch(e){}}
  return "SOB0:"+b64(u8);}
async function heybeCoz(metin){metin=String(metin||"").trim();if(metin.length>HEYBE_EN_COK*2)throw new Error("çok büyük");
  let json;
  if(metin.startsWith("{"))json=metin;   /* dosyadan gelen düz JSON */
  else{const m=/^SOB([01]):([A-Za-z0-9+/=\s]+)$/.exec(metin);if(!m)throw new Error("biçim");
    let u8=b64ac(m[2].replace(/\s/g,""));
    if(m[1]==="1"){if(typeof DecompressionStream!=="function")throw new Error("tarayıcı");u8=await akis(u8,DecompressionStream,"gzip");}
    if(u8.length>HEYBE_EN_COK)throw new Error("çok büyük");json=new TextDecoder().decode(u8);}
  const h=JSON.parse(json);
  if(!h||h.tur!==HEYBE_TUR||!Array.isArray(h.kisiler))throw new Error("biçim");
  if(Number(h.surum)>HEYBE_SURUM)throw new Error("yeni sürüm");
  /* gelen veriyi denetle: yalnız beklenen alanlar, ad kısa, ilerleme nesne */
  h.kisiler=h.kisiler.filter(k=>k&&typeof k==="object"&&k.ilerleme&&typeof k.ilerleme==="object"&&!Array.isArray(k.ilerleme))
    .slice(0,20).map(k=>({id:kisiIdIyi(String(k.id||""))?String(k.id):"",ad:String(k.ad||"").slice(0,20),yas:Math.max(0,Math.min(120,Math.round(Number(k.yas)||0))),ilerleme:heybeSinirla(heybeTemizle(k.ilerleme))}));
  if(!h.kisiler.length)throw new Error("boş");
  return h;}
/* Elle değiştirilmiş dosyaya karşı: sayılar makul aralıkta, yıldızlar yalnız doğru/yanlış */
function heybeSinirla(x){const sayi=v=>{v=Number(v);return isFinite(v)?Math.max(0,Math.min(v,1e7)):0;};
  ["puan","dogru","rekor","seri"].forEach(k=>{if(k in x)x[k]=Math.round(sayi(x[k]));});
  if(x.sure&&typeof x.sure==="object"){Object.keys(x.sure).forEach(n=>{const t=x.sure[n];if(!t||typeof t!=="object"||!/^\d{1,5}$/.test(n)){delete x.sure[n];return;}
    if(t.yildiz&&typeof t.yildiz==="object")Object.keys(t.yildiz).forEach(y=>{t.yildiz[y]=t.yildiz[y]===true;});});}
  else delete x.sure;
  if(Array.isArray(x.rozet))x.rozet=x.rozet.filter(r=>typeof r==="string"&&r.length<=40).slice(0,500);else delete x.rozet;
  return x;}

/* --- dışa aktarma --- */
function heybeDosyaAdi(h){const ad=h.kisiler.length===1&&h.kisiler[0].ad?h.kisiler[0].ad:"aile";
  return ("sureler-heybe-"+ad+"-"+today()).replace(/[^\wçğıöşüÇĞİÖŞÜ.-]+/g,"-")+".json";}
async function heybeDosyaVer(){save();const h=heybeHazirla();if(!h.kisiler.length){toast("Taşınacak ilerleme bulunamadı");return;}
  const ad=heybeDosyaAdi(h),blob=new Blob([JSON.stringify(h)],{type:"application/json"});
  /* telefonda paylaş penceresi (WhatsApp vb.); olmazsa indir */
  try{const f=new File([blob],ad,{type:"application/json"});
    if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:"Sureler Oyun Bahçesi heybesi"});return;}}
  catch(e){if(e&&e.name==="AbortError")return;}
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=ad;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);toast("Heybe dosyası indirildi: "+ad);}
async function heybeKopyala(){save();const h=heybeHazirla();if(!h.kisiler.length){toast("Taşınacak ilerleme bulunamadı");return;}
  const m=await heybeMetin(h);
  try{await navigator.clipboard.writeText(m);toast("Heybe kopyalandı; mesajla gönderip öbür cihazda yapıştırın");}
  catch(e){const t=$("hyMetin");if(t){t.value=m;t.hidden=false;t.select();}toast("Kopyalanamadı; metni seçip elle kopyalayın");}}

/* --- içe aktarma --- */
function heybeBirlestirKisi(hedefId,ilerleme){
  if(hedefId===PROF.aktif){S=normalize(birlestir(S,ilerleme));save();if(typeof bulutGonder==="function")bulutGonder();return;}
  const eski=heybeKisiKaydi(hedefId);const yeni=normalize(eski?birlestir(eski,ilerleme):JSON.parse(JSON.stringify(ilerleme)));
  try{localStorage.setItem(lsAnahtar(hedefId),JSON.stringify(yeni));}catch(e){throw new Error("yer yok");}}
function heybeYeniKisi(k){const id="p"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
  PROF.liste.push({id,ad:k.ad||"Yeni kişi",yas:k.yas||undefined});profKaydet();return id;}
/* gelen kişiye en uygun yerel kişi: aynı kimlik, yoksa aynı ad */
function heybeEslesen(k){const ad=(k.ad||"").toLocaleLowerCase("tr");
  return (PROF.liste.find(p=>p.id===k.id)||PROF.liste.find(p=>ad&&String(p.ad||"").toLocaleLowerCase("tr")===ad)||{}).id||"";}
function heybeOnizlemeHtml(h){const kisi=PROF.liste.filter(p=>p&&kisiIdIyi(p.id));
  return `<p><b>Heybe ${esc(new Date(h.t||Date.now()).toLocaleDateString("tr-TR"))} tarihinde hazırlanmış; içinde ${h.kisiler.length} kişi var.</b> Her biri için nereye ekleneceğini seçin. Hiçbir ilerleme silinmez; iki kayıttan büyük olan kalır.</p>
  ${h.kisiler.map((k,i)=>{const yil=Object.values(k.ilerleme.sure||{}).reduce((t,s)=>t+Object.values((s&&s.yildiz)||{}).filter(Boolean).length,0),es=heybeEslesen(k);
    return `<p class="esnek ara-2 sarmal"><b>${esc(k.ad||"Adsız")}</b> · ${yil} yıldız ·
    <select data-hyk="${i}" class="dokun44 yazi-3" aria-label="${esc(k.ad||"Adsız")} nereye eklensin"><option value="">Yeni kişi olarak ekle</option>${kisi.map(p=>`<option value="${esc(p.id)}" ${p.id===es?"selected":""}>${esc(p.ad||"Adsız")} kişisine ekle</option>`).join("")}<option value="-">Ekleme</option></select></p>`;}).join("")}
  <p class="esnek ara-2 sarmal"><button class="primary" id="hyAc">Heybeyi aç</button><button id="hyVazgec">Vazgeç</button></p>`;}
async function heybeOku(metin){const K=$("hyOnizleme");if(!K)return;
  try{HEYBE_BEKLEYEN=await heybeCoz(metin);}
  catch(e){HEYBE_BEKLEYEN=null;const m=String(e&&e.message);
    toast(m==="yeni sürüm"?"Bu heybe uygulamanın daha yeni bir sürümünden; önce sayfayı yenileyin":m==="tarayıcı"?"Bu tarayıcı sıkıştırılmış heybeyi açamıyor; dosya yolunu deneyin":m==="çok büyük"?"Heybe çok büyük":"Bu bir Sureler Oyun Bahçesi heybesi değil ya da bozulmuş");return;}
  K.innerHTML=heybeOnizlemeHtml(HEYBE_BEKLEYEN);K.hidden=false;
  $("hyVazgec").onclick=()=>{HEYBE_BEKLEYEN=null;K.hidden=true;K.innerHTML="";};
  $("hyAc").onclick=()=>{const h=HEYBE_BEKLEYEN;if(!h)return;let say=0;
    try{K.querySelectorAll("[data-hyk]").forEach(s=>{const k=h.kisiler[+s.dataset.hyk];if(!k||s.value==="-")return;
      const id=s.value||heybeYeniKisi(k);heybeBirlestirKisi(id,k.ilerleme);say++;});}
    catch(e){toast("Bu cihazda yer kalmadı; heybe tam açılamadı");}
    HEYBE_BEKLEYEN=null;if(say)toast(say+" kişinin ilerlemesi eklendi, maşallah");if(typeof ebeveynOzet==="function")ebeveynOzet();};}

function heybeHtml(){return `<section class="detay"><h3>Cihaz değiştir (heybe)</h3>
  <p>Çocuğun ilerlemesini buluta gerek kalmadan başka bir telefona ya da tablete taşıyın. Heybe yalnız sizin elinizde dolaşır; aile ve sınıf kodları içine konmaz.</p>
  <p><b>1. Bu cihazda heybeyi hazırlayın</b></p>
  <p class="esnek ara-2 sarmal"><button class="primary" id="hyDosya">Dosya olarak gönder</button><button id="hyKopya">Metin olarak kopyala</button></p>
  <textarea id="hyMetin" class="ara" rows="3" readonly hidden aria-label="Heybe metni"></textarea>
  <p><b>2. Öbür cihazda heybeyi açın</b></p>
  <p class="esnek ara-2 sarmal"><input type="file" id="hyDosyaSec" accept=".json,application/json" hidden><button id="hyDosyaSecB">Heybe dosyasını seç</button><button id="hyYapistir">Kopyalanan metni yapıştır</button></p>
  <textarea id="hyGiris" class="ara" rows="3" hidden placeholder="Heybe metnini buraya yapıştırın" aria-label="Heybe metnini yapıştırın"></textarea>
  <div id="hyOnizleme" hidden></div></section>`;}
function heybeBagla(){const d=$("hyDosya");if(!d)return;
  d.onclick=()=>heybeDosyaVer().catch(()=>toast("Heybe hazırlanamadı"));
  $("hyKopya").onclick=()=>heybeKopyala().catch(()=>toast("Heybe hazırlanamadı"));
  $("hyDosyaSecB").onclick=()=>$("hyDosyaSec").click();
  $("hyDosyaSec").onchange=e=>{const f=e.target.files&&e.target.files[0];e.target.value="";if(!f)return;
    if(f.size>HEYBE_EN_COK){toast("Heybe çok büyük");return;}f.text().then(heybeOku).catch(()=>toast("Dosya okunamadı"));};
  $("hyYapistir").onclick=async()=>{const g=$("hyGiris");
    try{const t=await navigator.clipboard.readText();if(t&&t.trim().startsWith("SOB")){g.hidden=true;heybeOku(t);return;}}catch(e){}
    g.hidden=false;g.focus();g.oninput=()=>{if(g.value.trim().length>10)heybeOku(g.value);};};}

/* Ebeveyn bölümüne ekle (js/13'teki ayarların sonuna) */
{const ilkHtml=ebeveynAyarHtml,ilkBagla=ebeveynAyarBagla;
  ebeveynAyarHtml=function(){return ilkHtml.apply(this,arguments)+heybeHtml();};
  ebeveynAyarBagla=function(){const r=ilkBagla.apply(this,arguments);try{heybeBagla();}catch(e){}return r;};}
