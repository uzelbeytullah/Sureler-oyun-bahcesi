/* Sureler Oyun Bahçesi · Namaz duaları testi (js/21-dualar.js, data/dualar.json)
   Çalıştırmak için:  npm install jsdom@24  ardından  node test/dualar-test.js */
let HATA=0;
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');const fs=require('fs'),path=require('path');
const ROOT=require('path').join(__dirname,'..');
const kur=async function(){
let html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
/* index.html js/21'i yüklemiyorsa (ör. sürüm ekleri yenilenirken satır düştüyse) test için son js/ betiğinin ardına eklenir */
if(!/js\/21-dualar\.js/.test(html)){console.log('UYARI index.html js/21-dualar.js satırını içermiyor; test için eklendi');const m=[...html.matchAll(/<script src="js\/[^"]+"><\/script>/g)].pop();html=m?html.slice(0,m.index+m[0].length)+'\n<script src="js/21-dualar.js"></script>'+html.slice(m.index+m[0].length):html.replace('</body>','<script src="js/21-dualar.js"></script></body>');}
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

/* içerik: her cümlenin kelimeleri cümleyi verir, okunuşlarda düz kesme işareti yok */
function test_icerik(){const ok=(a,v)=>{if(!v)HATA++;console.log((v?'TAMAM ':'HATA  ')+a);};
  const D=JSON.parse(fs.readFileSync(path.join(ROOT,'data/dualar.json'),'utf8'));
  ok('7 dua',D.dualar.length===7);
  ok('beklenen kimlikler',['subhaneke','ettehiyyatu','salli','barik','rabbena','rabbenagfirli','kunut'].every(id=>D.dualar.some(d=>d.id===id)));
  let birlesik=true,alan=true,kesme=true;
  D.dualar.forEach(d=>{if(!d.ad||!d.adAr||!d.yer||!d.yer.cocuk||!d.yer.ebeveyn||!(d.kaynak||[]).length)alan=false;
    d.cumleler.forEach(c=>{if(c.w.map(x=>x.a).join(' ')!==c.ar)birlesik=false;if(!c.ok||!c.tr||!c.w.every(x=>x.a&&x.ok&&x.tr))alan=false;
      [c.ok,...c.w.map(x=>x.ok)].forEach(s=>{if(/['`]/.test(s))kesme=false;});});});
  ok('kelimeler cümleyi veriyor',birlesik);ok('zorunlu alanlar dolu',alan);ok('okunuşta hemze ’ ayın ‘ (düz kesme yok)',kesme);
  ok('kaynak listesi',(D.kaynaklar||[]).length>=3);}

async function test_dualar(){const {w,errs,ev}=await kur();const ok=(a,v)=>{if(!v)HATA++;console.log((v?'TAMAM ':'HATA  ')+a);};
  const V=()=>w.document.getElementById('view');
  ev('PROF.liste=[{id:"p0",ad:"Ali",yas:10}];PROF.aktif="p0";S.seviye="genc";S.ilkYolGec=true;');
  ok('genel fonksiyonlar',['dualarSayfa','duaAc','duaNamazDurumu','dualarKartiHtml'].every(f=>typeof w[f]==='function'));
  ok('rozetler eklendi',ev('BADGES.some(b=>b[0]==="dua1")&&BADGES.some(b=>b[0]==="duaHepsi")'));
  /* liste */
  await ev('dualarSayfa()');await bekle(300);
  ok('dualar.json yüklendi',ev('!!DUALAR&&DUALAR.dualar.length===7'));
  ok('liste: 7 kart',V().querySelectorAll('[data-dua-ac]').length===7);
  ok('liste: ad ve nerede okunur',/Sübhâneke/.test(V().textContent)&&/tekbir|Allâhü ekber/.test(V().textContent));
  /* dua ekranı */
  V().querySelector('[data-dua-ac="subhaneke"]').click();await bekle(300);
  ok('dua ekranı açıldı',/Sübhâneke/.test(w.document.getElementById('baslik').textContent)&&V().querySelectorAll('.read-ayet').length===4);
  ok('Arapça lang/dir',!!V().querySelector('.kelimeler[lang="ar"][dir="rtl"]'));
  ok('okunuş ve anlam',/Sübhâneke’llâhümme/.test(V().textContent)&&/Senden başka ilah yoktur/.test(V().textContent));
  ok('Arapça ses yokken Dinle düğmesi yok',!V().querySelector('[data-duases]'));
  w.document.getElementById('duaOkudum').click();
  ok('Okudum işaretlendi',ev('S.dualar.subhaneke.okundu===today()')&&w.document.getElementById('duaOkudum').disabled);
  /* sırala: doğru sırayla tamamla */
  const p0=ev('S.puan');
  V().querySelector('[data-duaoyun="sirala"]').click();await bekle(100);
  ok('sırala ekranı',V().querySelectorAll('.order-item').length===4);
  for(let g=0;g<20;g++){const sira=[...V().querySelectorAll('.order-item')].map(x=>+x.dataset.ai);const p=sira.findIndex((v,i)=>v!==i);if(p<0)break;
    const j=sira.indexOf(p);/* p. sıraya doğru cümleyi yukarı taşı */V().querySelector(`[data-u="${j}"]`).click();}
  ok('sıra doğru dizildi',[...V().querySelectorAll('.order-item')].every((x,i)=>+x.dataset.ai===i));
  w.document.getElementById('duaKontrol').click();
  ok('sırala tamam işareti',ev('S.dualar.subhaneke.oyun.sirala===true'));
  ok('puan arttı ('+p0+' → '+ev('S.puan')+')',ev('S.puan')>p0);
  ok('doğru mesajı',/sıra tamamen doğru/.test(V().textContent));
  /* eksik kelime ve anlam oyunu açılıyor, 3 şık */
  await ev('duaEksik("salli")');ok('eksik kelime: 3 şık ve boşluk',V().querySelectorAll('.opts button[data-j]').length===3&&!!V().querySelector('.blank'));
  await ev('duaAnlam("kunut")');ok('anlamını bul: 3 şık',V().querySelectorAll('.opts button[data-j]').length===3);
  /* anlam oyununu hep doğru bitir */
  for(let g=0;g<8&&V().querySelector('.opts');g++){const q=ev('DUALAR.dualar.find(d=>d.id==="kunut").cumleler.map(c=>c.tr)');
    const b=[...V().querySelectorAll('.opts button[data-j]')].find(x=>q.includes(x.textContent)&&ev(`(()=>{const ar=document.querySelector(".qbig").textContent;return DUALAR.dualar.find(d=>d.id==="kunut").cumleler.find(c=>c.ar===ar).tr})()`)===x.textContent);
    b.click();await bekle(1400);}
  ok('anlam oyunu tamam',ev('S.dualar.kunut.oyun.anlam===true'));
  /* ezber: Hatırladım akışı */
  await ev('duaAc("rabbena")');await bekle(100);
  V().querySelector('[data-duaezber="2"]').click();
  ok('Hatırladım: kutu 0, yarın',ev('S.dualar.rabbena.ezber.kutu')===0&&ev('S.dualar.rabbena.ezber.sonraki')===ev('duaGunEkle(1)'));
  V().querySelector('[data-duaezber="2"]').click();
  ok('vadesi gelmeden Hatırladım basamak atlatmaz',ev('S.dualar.rabbena.ezber.kutu')===0);
  V().querySelector('[data-duaezber="1"]').click();ok('Zorlandım: basamak yerinde',ev('S.dualar.rabbena.ezber.kutu')===0);
  ev('S.dualar.rabbena.ezber={kutu:3,sonraki:"2000-01-01"}');await ev('duaAc("rabbena")');await bekle(50);
  V().querySelector('[data-duaezber="2"]').click();
  ok('kutu 4 → ezberde, sonraki 30 gün',ev('S.dualar.rabbena.ezber.kutu')===4&&ev('S.dualar.rabbena.ezber.sonraki')===ev('duaGunEkle(30)')&&ev('duaEzberde("rabbena")'));
  ok('rozet: ilk dua',ev('S.rozet.includes("dua1")'));
  /* kayıt birleştirmede dualar alanı korunur */
  const bir=ev('JSON.stringify(birlestir({puan:1,sure:{},dualar:{salli:{okundu:"2026-01-01",oyun:{eksik:true},ezber:{kutu:1,sonraki:"2026-01-05"}}}},{puan:2,sure:{},dualar:{salli:{okundu:"2026-02-01",oyun:{sirala:true},ezber:{kutu:2,sonraki:"2026-01-03"}},barik:{okundu:"2026-02-02"}}}).dualar)');
  const B=JSON.parse(bir);ok('birlestir dualar: '+bir,B.salli.okundu==="2026-02-01"&&B.salli.oyun.eksik&&B.salli.oyun.sirala&&B.salli.ezber.kutu===2&&B.barik.okundu==="2026-02-02");
  ok('normalize dualar alanını korur',ev('normalize({dualar:{x:{okundu:"2026-01-01"}}}).dualar.x.okundu')==="2026-01-01");
  /* namaz yolu durumu */
  ev('S.dualar.rabbenagfirli={okundu:today(),oyun:{},ezber:{kutu:4,sonraki:"2030-01-01"}}');
  const N=ev('JSON.stringify(duaNamazDurumu())');const n=JSON.parse(N);
  ok('duaNamazDurumu anahtarları',['subhaneke','ettehiyyatu','salli','barik','rabbena'].every(k=>k in n));
  ok('duaNamazDurumu: sübhâneke okundu, ezberde değil',n.subhaneke.okundu&&!n.subhaneke.ezber);
  ok('duaNamazDurumu: rabbena ikisi de ezberde',n.rabbena.ezber===true);
  /* ana sayfa kartı */
  const K=ev('dualarKartiHtml()');
  ok('kart: '+K.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,90),/Namaz duaları/.test(K)&&/2\/7 ezberde/.test(K)&&/Devam et/.test(K));
  V().innerHTML=K;V().querySelector('[data-dua-ac]').click();await bekle(200);
  ok('kart Devam et bir duayı açar',!!w.document.getElementById('duaOkudum'));
  V().innerHTML=K;V().querySelector('[data-dualar]').click();await bekle(200);
  ok('kart Bütün dualar listeyi açar',V().querySelectorAll('[data-dua-ac]').length===7);
  ev('S.dualar={};["subhaneke","ettehiyyatu","salli","barik","rabbena","rabbenagfirli","kunut"].forEach(id=>S.dualar[id]={ezber:{kutu:4,sonraki:"2030-01-01"}});checkBadges()');
  ok('rozet: hepsi',ev('S.rozet.includes("duaHepsi")'));
  if(errs.length){HATA++;console.log('sayfa hataları',errs);}}

async function test_kucuk(){const {w,errs,ev}=await kur();const ok=(a,v)=>{if(!v)HATA++;console.log((v?'TAMAM ':'HATA  ')+a);};
  const V=()=>w.document.getElementById('view');
  /* cihazda Arapça ses varmış gibi */
  ev('speechSynthesis.getVoices=()=>[{lang:"ar-SA",name:"Arapça"}];window.SpeechSynthesisUtterance=function(t){this.text=t;};');
  ev('PROF.liste=[{id:"p0",ad:"Ece",yas:7}];PROF.aktif="p0";S.seviye="kucuk";S.ilkYolGec=true;');
  await ev('duaAc("ettehiyyatu")');await bekle(300);
  ok('küçük: sade görünüm (kelime anlamları katlı)',!V().querySelector('.read-ayet > .anlamlar')&&!!V().querySelector('details .anlamlar'));
  ok('Arapça ses varken Dinle (cihaz sesi) ve not',!!V().querySelector('[data-duases="hepsi"]')&&/büyüğünden/.test(V().textContent));
  /* ikinci deneme hakkı */
  await ev('duaAnlam("salli")');const ar=V().querySelector('.qbig').textContent;
  const dogru=ev(`DUALAR.dualar.find(d=>d.id==="salli").cumleler.find(c=>c.ar===${JSON.stringify(ar)}).tr`);
  const yanlis=[...V().querySelectorAll('.opts button[data-j]')].find(b=>b.textContent!==dogru);yanlis.click();
  ok('küçük: yanlışta bir daha dene',/Bir daha dene/.test(w.document.getElementById('fb').textContent)&&yanlis.disabled&&[...V().querySelectorAll('.opts button[data-j]')].some(b=>!b.disabled));
  [...V().querySelectorAll('.opts button[data-j]')].find(b=>b.textContent===dogru).click();
  ok('küçük: ikinci denemede doğru',/İkinci denemede/.test(w.document.getElementById('fb').textContent));
  ev('S.seviye="minik"');await ev('duaAc("subhaneke")');await bekle(100);ok('minik: oyun düğmesi yok, Okudum var',!V().querySelector('[data-duaoyun]')&&!!w.document.getElementById('duaOkudum'));
  if(errs.length){HATA++;console.log('sayfa hataları',errs);}}

(async()=>{test_icerik();await test_dualar();await test_kucuk();
  console.log(HATA?HATA+' hata':'hepsi geçti');process.exit(HATA?1:0);})().catch(e=>{console.log('HATA',e);process.exit(1);});
