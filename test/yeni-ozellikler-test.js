/* Sureler Oyun Bahçesi · yeni özellik testleri: ebeveyn onayı, namaz yolu, aile halkası, aile takımı, Elif-ba, harf sesleri, çocuk oyunu, küçükler, ilk giriş, bahçe
   Çalıştırmak için:  npm install jsdom@24  ardından  node test/yeni-ozellikler-test.js */
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

async function test_t5(){const {w,errs,ev}=await kur();const ok=(a,v)=>{if(!v)HATA++;console.log((v?'TAMAM ':'HATA  ')+a);};
ev('PROF.liste=[{id:"p0",ad:"Ali",yas:8}];PROF.aktif="p0";S.seviye="kucuk";S.ilkYolGec=true;');
await ev('ac(112)');await new Promise(r=>setTimeout(r,500));
ev('ekS("ezberDurum")[0]={kutu:3,sonraki:"2000-01-01"}');ev('ezberCalis(0)');w.document.querySelector('[data-d="2"]').click();
const d0=ev('JSON.stringify(ekS("ezberDurum")[0])');ok('son basamakta onay bekliyor '+d0,/onayBekle/.test(d0)&&!ev('ezbTam(ekS("ezberDurum")[0])'));
ev('anaSayfa()');ok('bugün panelinde onay düğmesi',!!w.document.getElementById('onayGit'));ok('namaz kartı görünüyor',/Namaz hazırlığı yolu/.test(w.document.getElementById('view').textContent));
w.document.getElementById('onayGit').click();await new Promise(r=>setTimeout(r,400));
const V=()=>w.document.getElementById('view');ok('onay ekranı',/İhlâs · 1\. ayet/.test(V().textContent));
V().querySelector('#oPin').value='1234';V().querySelector('#oPin2').value='1234';V().querySelector('[data-on="1"]').click();await new Promise(r=>setTimeout(r,400));
ok('onaylandı → ezberde',ev('ezbTam(S.sure["112"].ezberDurum[0])')&&!!ev('S.sure["112"].ezberDurum[0].onaylandi'));ok('şifre kaydedildi',ev('pinVar()'));
// yanlış şifre
ev('S.sure["112"].ezberDurum[1]={kutu:4,sonraki:"2026-12-01",tam:true,onayBekle:true}');await ev('onayEkrani()');await new Promise(r=>setTimeout(r,300));
V().querySelector('#oPin').value='9999';V().querySelector('[data-on="1"]').click();ok('yanlış şifre reddedildi',!!ev('S.sure["112"].ezberDurum[1].onayBekle'));
V().querySelector('#oPin').value='1234';V().querySelector('[data-on="0"]').click();await new Promise(r=>setTimeout(r,300));ok('biraz daha → basamak geri',ev('S.sure["112"].ezberDurum[1].kutu')===3&&!ev('S.sure["112"].ezberDurum[1].tam'));
// namaz yolu tamam
ev(`for(const [no,n] of [[1,7],[112,4],[113,5],[114,6]]){S.sure[no]=S.sure[no]||{};S.sure[no].ezberDurum={};for(let i=0;i<n;i++)S.sure[no].ezberDurum[i]={kutu:4,sonraki:"2030-01-01",onaylandi:"x"};}`);
ev('anaSayfa()');ok('belge düğmesi',!!w.document.getElementById('namazBelge'));w.document.getElementById('namazBelge').click();
ok('belge ekranı adla',/Namazda okuyabilirim/.test(V().textContent)&&/Ali/.test(V().textContent));ok('rozet',ev('S.rozet.includes("namaz")'));
// ebeveyn ayarları
await ev('ebeveynOzet()');await new Promise(r=>setTimeout(r,300));ok('ebeveyn ayarları',!!V().querySelector('[data-onay="0"]'));V().querySelector('[data-onay="0"]').click();await new Promise(r=>setTimeout(r,300));ok('şifresiz kapatılamadı',ev('onayGerek()')===true);
ev('S.seviye="yetiskin"');ok('seviye değişince onay açık kalır',ev('onayGerek()')===true);
V().querySelector('#ePinEski').value='1234';V().querySelector('[data-onay="0"]').click();await new Promise(r=>setTimeout(r,300));ok('şifreyle onay kapatıldı',ev('onayGerek()')===false);
V().querySelector('[data-nzs="108"]').click();await new Promise(r=>setTimeout(r,300));ok('namaz sure seçimi '+JSON.stringify(ev('S.namazSure')),ev('S.namazSure').includes(108)&&ev('S.namazSure').length===3);
if(errs.length){HATA++;console.log('sayfa hataları',errs);}}

async function test_t6(){const {w,errs,ev}=await kur();const ok=(a,v)=>{if(!v)HATA++;console.log((v?'TAMAM ':'HATA  ')+a);};
ev('PROF.liste=[{id:"p0",ad:"Ali",yas:8}];PROF.aktif="p0";S.seviye="genc";S.ilkYolGec=true;S.log={};S.log[today()]={s:{"113":5}};anaSayfa()');await new Promise(r=>setTimeout(r,700));
const V=()=>w.document.getElementById('view');ok('halka kartı',/aile halkası/.test(V().textContent)&&/Felak/.test(V().textContent));
w.document.getElementById('halkaBasla').click();await new Promise(r=>setTimeout(r,700));ok('halka ekranı 3 adım',V().querySelectorAll('[data-ha]').length===3);
for(const k of ['oku','soru','etk']){V().querySelector(`[data-ha="${k}"]`).click();await new Promise(r=>setTimeout(r,500));}
ok('tamamlandı',ev('S.halka.bitti')&&ev('S.halkaSay')===1);ev('bahce()');ok('bahçede fener',/Ailece 1 haftalık/.test(V().textContent));
if(errs.length){HATA++;console.log('sayfa hataları',errs);}}

async function test_t7(){const {w,errs,ev}=await kur();const ok=(a,v)=>{if(!v)HATA++;console.log((v?'TAMAM ':'HATA  ')+a);};
let son=null,peersCb=null;const peers=[{peer:'p1',isMe:false,presence:{ad:'Ali',sv:'kucuk'}},{peer:'p2',isMe:false,presence:{ad:'Anne',sv:'yetiskin'}}];
w.claude={use:async n=>n==='room'?{join:async()=>({peers:()=>peers,onPeers(f){peersCb=f;setTimeout(f,5)},presence:async()=>{},on(){},emit:async(o,d)=>{son=JSON.parse(JSON.stringify(d))},leave:async()=>{}})}:null};
ev('PROF.liste=[{id:"p0",ad:"T",yas:40}];PROF.aktif="p0";S.seviye="yetiskin";');
await ev('ac(112)');await new Promise(r=>setTimeout(r,400));await ev('yarAc()');await new Promise(r=>setTimeout(r,50));
const V=()=>w.document.getElementById('view');ok('mod seçimi var, takım varsayılan',!!V().querySelector('[data-tk="1"].on'));
w.document.getElementById('yBasla').click();ok('yayında kolay ve takım',Array.isArray(son.kolay)&&son.kolay.length===2&&son.takim&&son.skor.length===0);
const q=ev('YAR.Q[0]');const dj=q.opts.indexOf(q.dogru);
peers[0].presence={ad:'Ali',sv:'kucuk',c:{q:0,j:dj}};peers[1].presence={ad:'Anne',sv:'yetiskin',c:{q:0,j:(dj+1)%q.opts.length}};peersCb();
w.document.getElementById('yGoster').click();ok('aile puanı 10, bilinen 1',ev('YAR.tp')===10&&ev('YAR.tc')===1);ok('ekranda aile puanı',/Aile puanı: 10/.test(V().textContent)&&!/Puan tablosu/.test(V().textContent));
const kopya=JSON.parse(JSON.stringify(son));
// küçük oyuncu görünümü
ev('S.seviye="kucuk";YAR=null');V().innerHTML='<div id="yEkran"></div>';ev('YAR={host:false,R:{presence:async()=>{}},secim:{},ad:"Ali"}');
kopya.durum='soru';w.yarOyuncuCiz(kopya);const E=()=>w.document.getElementById('yEkran');
ok('küçüğe iki şık',E().querySelectorAll('[data-j]').length===2);ok('doğru şık görünür',[...E().querySelectorAll('[data-j]')].some(b=>+b.dataset.j===dj));
ok('ses düğmesi (anlam sorusunda)',kopya.tur!=='anlam'||!!w.document.getElementById('ySes'));
ev('YAR.son=null');kopya.durum='sonuc';kopya.dogru=q.dogru;w.yarOyuncuCiz(kopya);ok('sonuçta aile tablosu',/Aile puanı/.test(E().textContent));
if(errs.length){HATA++;console.log('sayfa hataları',errs);}}

async function test_t8(){const {w,errs,ev}=await kur();const ok=(a,v)=>{if(!v)HATA++;console.log((v?'TAMAM ':'HATA  ')+a);};
ev('PROF.liste=[{id:"p0",ad:"Ali",yas:7}];PROF.aktif="p0";S.seviye="kucuk";S.ilkYolGec=true;anaSayfa()');
w.document.getElementById('elifAc').click();const V=()=>w.document.getElementById('view');
ok('tablo 28 harf',V().querySelectorAll('[data-hi]').length===28);V().querySelector('[data-hi="4"]').click();ok('cim şekilleri',/Cim/.test(V().textContent)&&V().querySelectorAll('#ebD .ar').length===4);
V().querySelector('[data-hi="7"]').click();ok('dal bağlanmaz uyarısı',/bağlanmaz/.test(V().textContent));
for(const alt of ['tani','bul','sekil']){ev(`elifAlt="${alt}";elifba()`);let n=0;for(let k=0;k<12;k++){{const dv=V().querySelector('#devam');if(dv){dv.click();await new Promise(r=>setTimeout(r,50));}}const b=V().querySelector('.opts button[data-j]');if(!b)break;b.click();n++;await new Promise(r=>setTimeout(r,1850));}ok(alt+' oyunu bitti ('+n+' soru)',/bitti/.test(V().textContent));}
ok('ilerleme kaydı',Object.keys(ev('S.elifba')).length>3);
await ev('ac(1)');await new Promise(r=>setTimeout(r,500));ev('elifAlt="kelime";elifba()');const b=V().querySelector('.opts button[data-j]');ok('kelimede harf sorusu',!!b&&/hangi harf var/.test(V().textContent));
const q=V().querySelector('.qbig').textContent;console.log('örnek kelime',q,'harfler',JSON.stringify(ev(`kelimeHarfleri(${JSON.stringify(q)})`)));
if(errs.length){HATA++;console.log('sayfa hataları',errs);}}

async function test_t9(){const {w,errs,ev}=await kur();const ok=(a,v)=>{if(!v)HATA++;console.log((v?'TAMAM ':'HATA  ')+a);};
const calan=[];w.eval('kelimeSes=function(x){window.__k.push(x&&x.a);return true}');w.__k=calan;
ev('PROF.liste=[{id:"p0",ad:"Ali",yas:7}];PROF.aktif="p0";S.seviye="kucuk";elifAlt="tablo";elifba()');
const V=()=>w.document.getElementById('view');V().querySelector('[data-hi="1"]').click();
ok('be için örnek kelime düğmeleri',V().querySelectorAll('[data-horn^="ب|"]').length===3);
V().querySelector('[data-horn^="ب|"]').click();ok('örnek kelime çalındı: '+calan[0],calan.length===1);
ok('28 harfin hepsinde örnek',ev('HARFLER.every(h=>(ELIF_ORNEK[h[0]]||[]).length>0)'));
ev('elifAlt="bul";elifba()');ok('harfi bul ekranında ses düğmeleri',!!V().querySelector('[data-horn]'));
// çocuk oyunu
await ev('ac(112)');await new Promise(r=>setTimeout(r,400));await ev('show("cocuk")');await new Promise(r=>setTimeout(r,400));
w.document.getElementById('cOyun').click();const metin=V().textContent;ok('çocuk oyunu sorusu çocuğa hitap ediyor',!/çocuğa/.test(metin));console.log('   ',metin.slice(0,160).replace(/\s+/g,' '));
const n=ev('CUR.ek.cocuk.oyun_sorulari.filter(q=>!q.ebeveyn).length');ok('İhlâs çocuk soru sayısı '+n,n>=6);
if(errs.length){HATA++;console.log('sayfa hataları',errs);}}

async function test_t10(){const {w,errs,ev}=await kur();const ok=(a,v)=>{if(!v)HATA++;console.log((v?'TAMAM ':'HATA  ')+a);};
const calan=[];w.eval('calParca=function(no,b,e){window.__c.push([no,b])}');w.__c=calan;
const V=()=>w.document.getElementById('view');
// ilk giriş yolu
ev('PROF.liste=[{id:"p0",ad:"Ali",yas:7}];PROF.aktif="p0";S.seviye="kucuk";anaSayfa()');
ok('ilk giriş: tek yol',!!w.document.getElementById('ilkBasla')&&!w.document.getElementById('grid'));
w.document.getElementById('ilkBasla').click();await new Promise(r=>setTimeout(r,600));ok('Fâtiha açıldı',ev('CUR&&CUR.no')===1);
ok('sade görünümde tamamla ve sırala',!!w.document.querySelector('#tabs [data-v="tamamla"]')&&!!w.document.querySelector('#tabs [data-v="sirala"]'));
// sesli tamamla
await ev('show("tamamla")');await new Promise(r=>setTimeout(r,500));ok('tamamla: ayet otomatik çalındı',calan.length>=1);ok('yeniden dinle düğmesi',!!V().querySelector('[data-ayetcal]'));
// sesli sırala ve yıldız
await ev('show("sirala")');await new Promise(r=>setTimeout(r,500));ok('sırala küçük: sesli seçenek düğmeleri',V().querySelectorAll('[data-ayetcal]').length===3);
for(let k=0;k<8;k++){const q=V().querySelector('.opts');if(!q)break;const dogru=ev('(()=>{return null})()');
  // doğru şıkkı bul: bir sonraki ayetin ilk kelimeleri
  const btns=[...V().querySelectorAll('.opts button[data-j]')];const i=+(V().querySelector('[data-ayetcal]').dataset.ayetcal);
  const hedef=ev(`(()=>{const a=CUR.ayetler[${i}+1];return a.w.slice(0,Math.min(3,a.w.length)).map(x=>x.a).join(" ")+(a.w.length>3?" …":"")})()`);
  (btns.find(b=>b.textContent.trim()===hedef)||btns[0]).click();await new Promise(r=>setTimeout(r,1700));}
ok('sırala yıldızı alındı',ev('S.sure["1"].yildiz.sirala')===true);
ev('anaSayfa()');ok('ilk yıldızdan sonra normal ana sayfa',!!w.document.getElementById('grid'));
ok('rozetler kısaltıldı',/Sıradaki rozetler/.test(V().textContent));
// bahçe: solgun fidan ve kilitli süs
ev('S.sure["112"]={ezberDurum:{"0":{kutu:1,sonraki:"2000-01-01"}}};S.puan=5000;bahce()');
ok('solgun fidan uyarısı',/suya ihtiyacı var/.test(V().textContent)&&!!V().querySelector('[data-su="1"]'));
ok('kilitli süs',/🔒/.test(V().textContent));V().querySelector('[data-sus="havuz"]').click();ok('kilitli süs alınamadı',!(ev('S.sus')||[]).includes('havuz'));
V().querySelector('[data-sus="kus"]').click();ok('kilitsiz süs alındı',(ev('S.sus')||[]).includes('kus'));
if(errs.length){HATA++;console.log('sayfa hataları',errs);}}

(async()=>{for(const f of [test_t5,test_t6,test_t7,test_t8,test_t9,test_t10]){console.log('--',f.name);await f();}console.log(HATA?HATA+' hata':'hepsi geçti');process.exit(HATA?1:0);})();
