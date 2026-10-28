/* Sureler Oyun Bahçesi · tecvid avcısı oyunu ve tecvid kontrol listesi testleri
   Çalıştırmak için:  npm install jsdom@24  ardından  node test/tecvid-test.js */
let HATA=0;
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');const fs=require('fs'),path=require('path');
const ROOT=require('path').join(__dirname,'..');
const kur=async function(){
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
class Yerel extends ResourceLoader{fetch(url,opt){const u=url.replace(/^https:\/\/x\.test\//,'').split('?')[0];const p=path.join(ROOT,u);if(/^https?:/.test(u)||!fs.existsSync(p))return Promise.resolve(Buffer.from(''));return Promise.resolve(fs.readFileSync(p));}}
const __errs=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>__errs.push(String(e.message||e)));
const dom=new JSDOM(html,{virtualConsole:vc,runScripts:'dangerously',resources:new Yerel(),pretendToBeVisual:true,url:'https://x.test/',beforeParse(w){
  w.fetch=async(u)=>{u=String(u).replace(/^https:\/\/x\.test\//,'').split('?')[0];const p=path.join(ROOT,u);if(!fs.existsSync(p))return {ok:false,status:404,json:async()=>{throw 1},text:async()=>''};const b=fs.readFileSync(p);return {ok:true,status:200,json:async()=>JSON.parse(b.toString()),text:async()=>b.toString(),arrayBuffer:async()=>b};};
  w.Audio=function(){return {dataset:{},load(){},play:()=>Promise.resolve(),pause(){},addEventListener(){},removeEventListener(){},set src(v){},currentTime:0,duration:1}};
  w.AudioContext=w.webkitAudioContext=function(){return {createOscillator:()=>({connect(){},start(){},stop(){},frequency:{setValueAtTime(){},value:0},type:''}),createGain:()=>({connect(){},gain:{setValueAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){},value:0}}),destination:{},currentTime:0,resume(){}}};
  w.speechSynthesis={getVoices:()=>[],speak(){},cancel(){}};w.HTMLMediaElement.prototype.play=()=>Promise.resolve();w.HTMLMediaElement.prototype.pause=()=>{};
  w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=function(){};w.matchMedia=()=>({matches:false,addEventListener(){},addListener(){}});
}});
const w=dom.window;const errs=__errs;w.addEventListener('error',e=>errs.push(e.message));
await new Promise(r=>{if(w.document.readyState==='complete')r();else w.addEventListener('load',()=>r());});await new Promise(r=>setTimeout(r,300));
return {w,dom,errs,ev:s=>w.eval(s)};};
const bekle=ms=>new Promise(r=>setTimeout(r,ms));
/* doğru şıkkı bulup tıklar; tur 2 ve 3 için q.answer değeriyle, tur 1 için kural kimliğiyle */
async function test_tecvid(seviye){const {w,errs,ev}=await kur();const ok=(a,v)=>{if(!v)HATA++;console.log((v?'TAMAM ':'HATA  ')+'['+seviye+'] '+a);};
ev(`PROF.liste=[{id:"p0",ad:"Ali",yas:10}];PROF.aktif="p0";S.seviye="${seviye}";S.ilkYolGec=true;`);
await ev('ac(112,"oku")');await bekle(500);ok('sure açıldı',ev('CUR&&CUR.no')===112);
await bekle(200);ok('TKUR yüklü',!!ev('TKUR&&TKUR.kurallar'));
const n=seviye==='genc'?8:5,sik=seviye==='genc'?4:3;
{const L=JSON.parse(ev('JSON.stringify(tecvidSorulari(CUR))'));ok('soru sayısı '+L.length,L.length===n);
 ok('şık sayıları',L.every(q=>q.opts.length===sik));ok('doğru cevap şıklarda',L.every(q=>q.opts.some(o=>o.d===q.answer)));
 ok('şıklar benzersiz',L.every(q=>new Set(q.opts.map(o=>o.d)).size===q.opts.length&&new Set(q.opts.map(o=>o.h)).size===q.opts.length));
 const turler=new Set(L.map(q=>q.tur));ok('üç soru türü de var '+[...turler],turler.size===3);
 ok('tür 1 vurgulu parça',L.filter(q=>q.tur===1).every(q=>/tvo-vurgu/.test(q.html)));
 ok('tür 2 kelimelerden yalnız biri kuralı içerir',L.filter(q=>q.tur===2).every(q=>q.opts.filter(o=>ev(`tvoKelimeKural(CUR,${o.d.split(':')[0]},${o.d.split(':')[1]}).includes(${JSON.stringify(q.c)})`)).length===1));
 ok('tür 3 doğru cevap kuralın nasıl metni',L.filter(q=>q.tur===3).every(q=>q.answer===ev(`TKUR.kurallar[${JSON.stringify(q.c)}].nasil`)));}
const p0=ev('S.puan');await ev('tecvidOyunu()');await bekle(100);
const V=()=>w.document.getElementById('view');
ok('oyun ekranı',/Tecvid avcısı/.test(V().textContent)&&V().querySelectorAll('.opts button[data-j]').length===sik);
/* oyunun gerçek sorularına erişim yok; doğru şık "ok" sınıfından anlaşılmaz, bu yüzden her şıkkı deneyerek değil, doğru metni bularak ilerleriz */
let say=0,yanlisYapildi=false;
while(V().querySelector('.opts button[data-j]')&&say<20){say++;
  const bs=[...V().querySelectorAll('.opts button[data-j]')];
  /* doğru şıkkı belirlemek için: geçici olarak ilk şıkka tıklamadan önce kopya DOM'da deneme yapılamaz; onun yerine soru metninden yararlan */
  const soru=V().querySelector('#soruMetni').innerHTML;let dogruJ=-1;
  const kurAd=c=>ev(`tvoKural(${JSON.stringify(c)}).ad`);
  if(/tvo-vurgu/.test(soru)&&/hangi kural/.test(soru)){const c=V().querySelector('#soruMetni .tvo-vurgu').className.match(/tc-(\S+)/);
    /* vurgulanan parçanın kuralı: sınıftan değil, veriden bulunur */
    const ar=V().querySelector('#soruMetni .qbig').textContent;const kural=ev(`(()=>{for(let ai=0;ai<CUR.ayetler.length;ai++)for(let wi=0;wi<CUR.ayetler[ai].w.length;wi++){const P=CUR.tecvid[ai][wi];if(P.map(p=>p[0]).join("")!==${JSON.stringify(ar)})continue;return P.filter(p=>p[1]&&p[0]===${JSON.stringify(V().querySelector('#soruMetni .tvo-vurgu').textContent)}).map(p=>p[1]);}return [];})()`);
    dogruJ=bs.findIndex(b=>kural.map(kurAd).includes(b.textContent));}
  else if(/nasıl okunur/.test(soru)){const ad=V().querySelector('#soruMetni b').textContent;const c=ev(`Object.keys(TKUR.kurallar).find(k=>TKUR.kurallar[k].ad===${JSON.stringify(ad)})`);const m=ev(`TKUR.kurallar[${JSON.stringify(c)}].nasil`);dogruJ=bs.findIndex(b=>b.textContent===m);}
  else {const ad=V().querySelector('#soruMetni b').textContent;const c=ev(`Object.keys(TKUR.kurallar).find(k=>TKUR.kurallar[k].ad===${JSON.stringify(ad)})`);
    dogruJ=bs.findIndex(b=>ev(`(()=>{for(let ai=0;ai<CUR.ayetler.length;ai++)for(let wi=0;wi<CUR.ayetler[ai].w.length;wi++){if(CUR.ayetler[ai].w[wi].a===${JSON.stringify(b.textContent)})return tvoKelimeKural(CUR,ai,wi).includes(${JSON.stringify(c)});}return false;})()`));}
  if(dogruJ<0){ok('doğru şık bulunamadı: '+soru.replace(/<[^>]+>/g,' ').slice(0,80),false);break;}
  if(say===1&&seviye!=='genc'){/* küçüklerde ilk yanlışta ikinci hak */const yj=bs.findIndex((b,j)=>j!==dogruJ);const pa=ev('S.puan');bs[yj].click();
    ok('küçüklerde ikinci deneme',/Bir daha dene/.test(V().querySelector('#fb').textContent)&&bs[yj].disabled&&!bs[dogruJ].disabled&&ev('S.puan')===pa);}
  if(say===2&&seviye==='genc'){const yj=bs.findIndex((b,j)=>j!==dogruJ);const pa=ev('S.puan');bs[yj].click();yanlisYapildi=true;
    ok('yanlış cevapta puan artmadı ve açıklama çıktı',ev('S.puan')===pa&&/Nasıl okunur/.test(V().querySelector('#tvoAcik').textContent));}
  else{const pa=ev('S.puan');bs[dogruJ].click();if(say<=3)ok('doğru şıkla puan arttı',ev('S.puan')>pa&&bs[dogruJ].classList.contains('ok'));
    if(say===1){ok('açıklama ve Dinle düğmesi',/Nasıl okunur/.test(V().querySelector('#tvoAcik').textContent)&&!!V().querySelector('#tvoDinle'));
      V().querySelector('#tvoDinle').click();}}
  V().querySelector('#devam').click();await bekle(20);}
ok('soru sayısı oyunda '+say,say===n);
ok('sonuç ekranı',!!w.document.getElementById('tvoTekrar'));
const kay=ev('JSON.stringify(SS(112).tecvidOyun)');const k=JSON.parse(kay||'null');
ok('sonuç kaydı '+kay,k&&k.son===ev('today()')&&k.en===(seviye==='genc'?Math.round(7/8*100):Math.round((5-0.5)/5*100)));
ok('toplam puan arttı',ev('S.puan')>p0);
/* rozet: üç surede bitirince */
ok('rozet henüz yok',!ev('S.rozet.includes("tecvid3")'));
ev('SS(113).tecvidOyun={en:50,son:today()};SS(114).tecvidOyun={en:60,son:today()};checkBadges()');ok('Tecvid avcısı rozeti',ev('S.rozet.includes("tecvid3")'));
/* kontrol listesi */
{const h=ev('tecvidKontrolListesiHtml(112,0)');const d=w.document.createElement('div');d.innerHTML=h;const li=d.querySelectorAll('li');
 ok('kontrol listesi 2–3 madde ('+li.length+')',li.length>=2&&li.length<=3&&d.querySelectorAll('input[type=checkbox]').length===li.length);
 ok('kalkale maddesi (İhlâs 1)',/Kalkale/.test(d.textContent));}
{const h=ev('tecvidKontrolListesiHtml(112,3)');ok('4. ayet: idğam ve medd',/İdğam/.test(h)&&/Medd/.test(h));}
ok('veri yoksa boş',ev('tecvidKontrolListesiHtml(999,0)')==='');
/* tecvid verisi olmayan sure */
ev('CUR.tecvid=null');await ev('tecvidOyunu()');ok('tecvid verisi yok mesajı',/Bu surede tecvid verisi yok/.test(V().textContent));
ev('delete CACHE[112]');
/* verilen sure numarasıyla açma */
await ev('tecvidOyunu(113)');await bekle(300);ok('tecvidOyunu(113) sureyi açtı',ev('CUR.no')===113&&/Tecvid avcısı/.test(V().textContent));
if(errs.length){HATA++;console.log('sayfa hataları',errs);}}
(async()=>{for(const s of ['genc','kucuk','minik']){console.log('-- tecvid',s);await test_tecvid(s);}console.log(HATA?HATA+' hata':'hepsi geçti');process.exit(HATA?1:0);})();
