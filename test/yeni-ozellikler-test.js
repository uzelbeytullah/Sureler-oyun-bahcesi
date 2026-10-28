/* Sureler Oyun Bahçesi · yeni özellik testleri: ebeveyn onayı, namaz hazırlığı yolu, aile halkası, aile takımı
   Çalıştırmak için:  npm install jsdom@24  ardından  node test/yeni-ozellikler-test.js */
let HATA=0;
const {JSDOM}=require('jsdom');const fs=require('fs'),path=require('path');
const ROOT=require('path').join(__dirname,'..');
const kur=async function(){
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/',beforeParse(w){
  w.fetch=async(u)=>{u=String(u).replace(/^https:\/\/x\.test\//,'').split('?')[0];const p=path.join(ROOT,u);if(!fs.existsSync(p))return {ok:false,status:404,json:async()=>{throw 1},text:async()=>''};const b=fs.readFileSync(p);return {ok:true,status:200,json:async()=>JSON.parse(b.toString()),text:async()=>b.toString(),arrayBuffer:async()=>b};};
  w.Audio=function(){return {play:()=>Promise.resolve(),pause(){},addEventListener(){},removeEventListener(){},set src(v){},currentTime:0,duration:1}};
  w.AudioContext=w.webkitAudioContext=function(){return {createOscillator:()=>({connect(){},start(){},stop(){},frequency:{setValueAtTime(){},value:0},type:''}),createGain:()=>({connect(){},gain:{setValueAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){},value:0}}),destination:{},currentTime:0,resume(){}}};
  w.speechSynthesis={getVoices:()=>[],speak(){},cancel(){}};w.HTMLMediaElement.prototype.play=()=>Promise.resolve();w.HTMLMediaElement.prototype.pause=()=>{};
  w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){},addListener(){}});
}});
const w=dom.window;const errs=[];w.addEventListener('error',e=>errs.push(e.message));
await new Promise(r=>setTimeout(r,300));
return {w,dom,errs,ev:s=>w.eval(s)};};

async function test_t5(){const {w,errs,ev}=await kur();const ok=(a,v)=>{if(!v)HATA++;console.log((v?'TAMAM ':'HATA  ')+a);};
ev('PROF.liste=[{id:"p0",ad:"Ali",yas:8}];PROF.aktif="p0";S.seviye="kucuk";');
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
await ev('ebeveynOzet()');await new Promise(r=>setTimeout(r,300));ok('ebeveyn ayarları',!!V().querySelector('[data-onay="0"]'));V().querySelector('[data-onay="0"]').click();await new Promise(r=>setTimeout(r,300));ok('onay kapatıldı',ev('onayGerek()')===false);
V().querySelector('[data-nzs="108"]').click();await new Promise(r=>setTimeout(r,300));ok('namaz sure seçimi '+JSON.stringify(ev('S.namazSure')),ev('S.namazSure').includes(108)&&ev('S.namazSure').length===3);
if(errs.length){HATA++;console.log('sayfa hataları',errs);}}

async function test_t6(){const {w,errs,ev}=await kur();const ok=(a,v)=>{if(!v)HATA++;console.log((v?'TAMAM ':'HATA  ')+a);};
ev('PROF.liste=[{id:"p0",ad:"Ali",yas:8}];PROF.aktif="p0";S.seviye="genc";S.log={};S.log[today()]={s:{"113":5}};anaSayfa()');await new Promise(r=>setTimeout(r,700));
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

(async()=>{for(const f of [test_t5,test_t6,test_t7]){console.log('--',f.name);await f();}console.log(HATA?HATA+' hata':'hepsi geçti');process.exit(HATA?1:0);})();
