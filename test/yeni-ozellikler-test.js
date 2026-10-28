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
ok('şifre yokken onay ekranı ebeveyn bölümüne yönlendirir',!!V().querySelector('#oSifreGit')&&!V().querySelector('#oPin2'));
V().querySelector('#oSifreGit').click();await new Promise(r=>setTimeout(r,300));ok('yetişkin kapısı çıktı',!!V().querySelector('#kCvp'));
V().querySelector('#kCvp').value='1';V().querySelector('#kTamam').click();await new Promise(r=>setTimeout(r,300));ok('yanlış cevapla kapı açılmadı',!!V().querySelector('#kCvp')&&!V().querySelector('[data-onay]'));
{const t=V().querySelector('label[for=kCvp]').textContent.match(/(\d+) × (\d+)/);V().querySelector('#kCvp').value=String(t[1]*t[2]);V().querySelector('#kTamam').click();await new Promise(r=>setTimeout(r,400));ok('doğru cevapla ebeveyn bölümü açıldı',!!V().querySelector('[data-onay]'));}
V().querySelector('#ePin').value='1234';V().querySelector('#ePinKaydet').click();await new Promise(r=>setTimeout(r,300));ok('şifre ebeveyn bölümünde kaydedildi',ev('pinVar()'));
await ev('onayEkrani()');await new Promise(r=>setTimeout(r,300));
V().querySelector('#oPin').value='1234';V().querySelector('[data-on="1"]').click();await new Promise(r=>setTimeout(r,400));
ok('onaylandı → ezberde',ev('ezbTam(S.sure["112"].ezberDurum[0])')&&!!ev('S.sure["112"].ezberDurum[0].onaylandi'));
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

async function test_t11(){const {w,errs,ev}=await kur();const ok=(a,v)=>{if(!v)HATA++;console.log((v?'TAMAM ':'HATA  ')+a);};
const V=()=>w.document.getElementById('view');
w.document.getElementById('hakkindaAc').click();await new Promise(r=>setTimeout(r,200));ok('hakkında açıldı',/Sureler Oyun Bahçesi hakkında/.test(V().textContent));
V().querySelector('[data-hk="gizlilik"]').click();await new Promise(r=>setTimeout(r,100));ok('gizlilik sekmesi',/Haklarınız/.test(V().textContent)&&/Veri sorumlusu/.test(V().textContent));
V().querySelector('[data-hk="kaynaklar"]').click();await new Promise(r=>setTimeout(r,100));ok('kaynaklar sekmesi',/Tanzil/.test(V().textContent)&&/Elmalılı/.test(V().textContent));
ok('küçüklere gizlenen ayet notu',ev('(CUR={ek:{cocuk:{ayetler:[{ayet:5,cocuk_anlatim:"x",kucuk_gizle:true}]}}},cocukAnlatim(5))')==="Bu ayeti büyüyünce ailece öğreneceğiz.");ev('CUR=null');
if(errs.length){HATA++;console.log('sayfa hataları',errs);}}
/* 9a-9e: tek tekrar takvimi, eski kayıt dönüşümü, gizleyerek hatırlama, Zorlandım, onay sıfırlama, günlük sınır, ara dinletme; 13a-13b: puan geri planda */
async function test_t12(){const {w,errs,ev}=await kur();const ok=(a,v)=>{if(!v)HATA++;console.log((v?'TAMAM ':'HATA  ')+a);};
const V=()=>w.document.getElementById('view');const bekle=ms=>new Promise(r=>setTimeout(r,ms));
/* 9a: eski kayıtlar bir kez yeni takvime */
w.__E={puan:0,sure:{"112":{ezberDurum:{"0":{kutu:2,sonraki:"2030-01-01"},"1":{kutu:4,sonraki:"2030-01-01",onaylandi:"x"}}},"78":{ezberDurum:{"0":{kutu:8,sonraki:"2030-01-01"},"1":{kutu:2,sonraki:"2030-01-01"}}}}};
const N=ev('normalize(__E)');const kt=[N.sure["112"].ezberDurum[0].kutu,N.sure["112"].ezberDurum[1].kutu,N.sure["78"].ezberDurum[0].kutu,N.sure["78"].ezberDurum[1].kutu];
ok('eski kutular dönüştü '+kt,N.ezberSurum===2&&kt.join()==="1,4,4,1"&&ev('ezbTam(__E.sure["112"].ezberDurum[1])'));
ok('ikinci kez dönüştürülmez',ev('normalize(__E).sure["112"].ezberDurum[0].kutu')===1);
ev('PROF.liste=[{id:"p0",ad:"Ali",yas:11}];PROF.aktif="p0";S.seviye="genc";S.ilkYolGec=true;');
await ev('ac(112)');await bekle(500);
const D=i=>ev(`JSON.stringify(ekS("ezberDurum")[${i}]||null)`)&&JSON.parse(ev(`JSON.stringify(ekS("ezberDurum")[${i}]||null)`));
/* 9a: 7 günlük aralıktan sonra hatırlanan ayet 14 güne geçer, henüz ezberde değil */
ev('ekS("ezberDurum")[0]={kutu:2,sonraki:"2000-01-01"};ezberSeviye=3;ezberCalis(0)');w.document.querySelector('[data-d="2"]').click();
ok('yeni takvim: kutu 3, 14 gün sonra, ezberde değil',D(0).kutu===3&&D(0).sonraki===ev('gunEkle(14)')&&!ev('ezbTam(ekS("ezberDurum")[0])'));
/* 9b: gizlemeden "Hatırladım" yok; Zorlandım kutuyu korur, yarına */
ev('ekS("ezberDurum")[1]={kutu:2,sonraki:"2000-01-01"};ezberAyet=null;ezberSeviye=0;ezberCalis(1)');
ok('Hiç gizleme iken Hatırladım kapalı',w.document.querySelector('[data-d="2"]').disabled&&!!w.document.getElementById('gizleDene'));
w.document.getElementById('gizleDene').click();ok('Gizleyip dene → Hatırladım açık',!w.document.querySelector('[data-d="2"]').disabled&&ev('ezberSeviye')>0);
w.document.querySelector('[data-d="1"]').click();const trh=ev('gunEkle(1).split("-").reverse().join(".")');
ok('Zorlandım: kutu yerinde, yarın',D(1).kutu===2&&D(1).sonraki===ev('gunEkle(1)'));ok('Zorlandım mesajı gerçek tarih',ev('[toast.su,...(toast.q||[])].join("|")').includes(trh));
/* 9c: onaylı ayet unutulunca onay silinir, yeniden hatırlanınca yeniden istenir */
ev('ekS("ezberDurum")[2]={kutu:4,sonraki:"2000-01-01",tam:true,onaylandi:"2026-01-01"};ezberAyet=null;ezberSeviye=4;ezberCalis(2)');w.document.querySelector('[data-d="1"]').click();
ok('Zorlandım: onay silindi, ezberde sayılmıyor',!D(2).onaylandi&&!ev('ezbTam(ekS("ezberDurum")[2])'));
ev('ekS("ezberDurum")[2].sonraki="2000-01-01";ezberAyet=null;ezberSeviye=4;ezberCalis(2)');w.document.querySelector('[data-d="2"]').click();
ok('yeniden hatırlanınca onay yeniden isteniyor',!!D(2).onayBekle&&!ev('ezbTam(ekS("ezberDurum")[2])'));
/* 9e: kutu 1'e (3 günlük aralığa) ilk geçişte ara dinletme */
ev('ekS("ezberDurum")[3]={kutu:0,sonraki:"2000-01-01"};ezberAyet=null;ezberSeviye=1;ezberCalis(3)');w.document.querySelector('[data-d="2"]').click();
ok('ara dinletme istendi',D(3).kutu===1&&!!D(3).dinletBekle&&ev('dinletBekleyenler().length')===1);
ev('anaSayfa()');ok('Bugün panelinde dinletilecekler',/dinletilecek/.test(V().textContent)&&!!w.document.getElementById('onayGit'));
ev('delete S.sure["112"].ezberDurum[2].onayBekle;pinKoy("1234")');await ev('onayEkrani()');await bekle(300);ok('onay ekranında ara dinletme notu',/Ara dinletme/.test(V().textContent));
V().querySelector('#oPin').value='1234';V().querySelector('[data-on="1"]').click();await bekle(300);
ok('dinletti işareti, ezberde sayılmaz',!!ev('S.sure["112"].ezberDurum[3].dinletti')&&!ev('S.sure["112"].ezberDurum[3].dinletBekle')&&!ev('ezbTam(S.sure["112"].ezberDurum[3])'));
/* 9d: günde en çok 12 tekrar; en çok geciken önce; birikince yeni ayet yerine not */
ev(`S.sure={};S.tekrarSay=null;for(const [no,n] of [[1,5],[113,5],[114,6]]){S.sure[no]={ezberDurum:{}};for(let i=0;i<n;i++)S.sure[no].ezberDurum[i]={kutu:i%3,sonraki:"2001-01-0"+(1+i)};}S.sure[114].ezberDurum[5]={kutu:3,sonraki:"1999-01-01"};`);
ok('günlük sınır 12',ev('tumTekrarlar().length')===12&&ev('tekrarHavuzu().length')===16);ok('en çok geciken önce',ev('JSON.stringify(tumTekrarlar()[0])')==='{"id":114,"i":5}');
ok('aynı gecikmede düşük kutu önce',ev('(()=>{const L=tekrarHavuzu().filter(x=>x.sonraki==="2001-01-01");return L.length===3&&L.every(x=>x.kutu===0)})()'));
ev('S.tekrarSay={g:today(),n:10}');ok('bugün yapılanlar düşülür',ev('tumTekrarlar().length')===2);
ev('anaSayfa()');ok('Bugün panelinde "Önce tekrarları bitirelim"',/Önce tekrarları bitirelim/.test(V().textContent));
await ev('ac(1,"ezber")');await bekle(600);ok('ezber köşesinde yeni ayet önerisi yerine not',/Önce tekrarları bitirelim/.test(V().textContent)&&!w.document.getElementById('yeniAyet'));
/* 9f: sade giriş cümlesi, akademik metin yalnız yetişkinde */
ok('sade giriş cümlesi',/Bir ayeti 1, 3, 7 ve 14 gün sonra tekrar edince ezberin kalıcı olur\./.test(V().textContent)&&!/Ebbinghaus/.test(V().textContent));
/* 13a-13b */
ev('anaSayfa()');ok('Bugün panelinde puan grafiği ve günlük hedef yok',!w.document.querySelector('.hdf')&&!/Son yedi günün puanları/.test(V().textContent));
ok('puanGrafigiHtml kendi başına',/Son yedi günün puanları/.test(ev('puanGrafigiHtml()')));
ev('S.puan=0;S.ardarda=4;S.gunDogru=null;answer(true)');ok('art arda bonus yok',ev('S.puan')===10&&ev('S.ardarda')===5);
ok('puan rozetleri listenin sonunda',ev('BADGES.slice(-6).map(b=>b[0]).sort().join()')==="bin,onlu,seri15,seri5,yuz,yuzdogru");
w.__L={};for(const g of ["2026-01-01","2026-01-02","2026-01-04","2026-01-05","2026-01-07"])w.__L[g]={soru:1};ok('7 günde 5 gün rozeti',ev('haftaBesGun({log:__L})')&&!ev('(delete __L["2026-01-07"],__L["2026-01-09"]={soru:1},haftaBesGun({log:__L}))'));
if(errs.length){HATA++;console.log('sayfa hataları',errs);}}
/* 4-6 yaş (minik): yaş eşlemesi, sade ana ekran, puan kutuları gizli, "Büyükler için" yetişkin kapısından geçer */
async function test_t13(){const {w,errs,ev}=await kur();const ok=(a,v)=>{if(!v)HATA++;console.log((v?'TAMAM ':'HATA  ')+a);};
const V=()=>w.document.getElementById('view');const bekle=ms=>new Promise(r=>setTimeout(r,ms));
ok('yaş eşlemesi 5→minik, 8→küçük, 12→genç, 20→yetişkin',ev('[yasSeviye(5),yasSeviye(3),yasSeviye(8),yasSeviye(12),yasSeviye(20)].join()')==="minik,minik,kucuk,genc,yetiskin");
ok('SEVIYE: Minik ve 7-9 etiketi',ev('SEVIYE.minik.ad')==="Minik (4-6 yaş)"&&/7-9/.test(ev('SEVIYE.kucuk.ad')));
ev('PROF.liste=[{id:"p0",ad:"Elif",yas:5}];PROF.aktif="p0";S.seviye=yasSeviye(5);S.molaDk=undefined;anaSayfa()');
ok('kucuk() minikte de doğru, mola 15 dk',ev('kucuk()&&minik()&&molaDk()===15'));
const D=[...V().querySelectorAll('.minik-dug')];ok('minik ana ekranında 4 büyük düğme',D.length===4&&D.map(b=>b.querySelector('.minik-ad').textContent).join()==="Dinle,Hikâye,Bahçem,Ailemle"&&D.every(b=>parseInt(w.getComputedStyle(b).minHeight)>=120));
ok('sure listesi, arama ve rozet yok',!w.document.getElementById('grid')&&!w.document.getElementById('ara')&&!V().querySelector('.badges'));
const st=w.document.querySelector('.stats');ok('puan kutuları gizli',w.document.body.dataset.seviye==="minik"&&w.getComputedStyle(st).display==="none");
w.document.getElementById('minikBuyuk').click();await bekle(100);ok('"Büyükler için" yetişkin kapısına gidiyor',/Bu bölüm yetişkinler için/.test(V().textContent)&&!w.document.getElementById('grid'));
ev('KAPI_ZAMAN=Date.now()');w.document.getElementById('kG').click();await bekle(50);w.document.getElementById('minikBuyuk').click();await bekle(100);
ok('kapı açıkken normal ana sayfa',!!w.document.getElementById('grid')&&!!w.document.getElementById('minikDon'));
w.document.getElementById('minikDon').click();await bekle(50);ok('minik ekranına dönüş',V().querySelectorAll('.minik-dug').length===4);
V().querySelector('[data-mk="dinle"]').click();await bekle(700);const sek=[...w.document.querySelectorAll('#tabs [data-v]')].map(b=>b.dataset.v).join();
ok('Dinle sureye gidiyor, yalnız Dinle/Hikâye/oyun sekmeleri: '+sek,ev('CUR&&CUR.no')===1&&ev('cur')==="oku"&&sek==="sureler,oku,cocuk,kelime");
await ev('show("kelime")');await bekle(100);ok('oyun başlığında sayı yok',!/Doğru:/.test(V().querySelector('.qhead').textContent));
ev('quiz({title:"x",items:[1],build:()=>({html:"",answer:"a",opts:["a","b"]})})');V().querySelector('.opts button[data-j]').click();
const dj=V().querySelector('.opts button.ok');ok('doğru şık işaretlendi',!!dj);await bekle(1700);
ok('sonuç: büyük yıldız ve Aferin, sayı yok',!!V().querySelector('.minik-yildiz')&&/Aferin/.test(V().textContent)&&!/\d+ \/ \d+/.test(V().textContent));
ev('CUR=null;anaSayfa()');V().querySelector('[data-mk="hikaye"]').click();await bekle(1500);ok('Hikâye canlandırmayı açıyor',!!w.document.getElementById('anSahne'));
ev('animDur();S.seviye="genc";anaSayfa()');ok('genç seviyede normal ana sayfa, puan görünür',!!w.document.getElementById('grid')&&w.getComputedStyle(st).display!=="none");
if(errs.length){HATA++;console.log('sayfa hataları',errs);}}
/* 14: aile kodu ve öğretmen paneli (Firebase yok: bulut şimini taklit eden bellek içi sahte veritabanı; kurallar burada sınanmaz) */
async function test_t14(){const {w,errs,ev}=await kur();const ok=(a,v)=>{if(!v)HATA++;console.log((v?'TAMAM ':'HATA  ')+a);};const bekle=ms=>new Promise(r=>setTimeout(r,ms));
ev('window.__eski=window.claude;window.claude={use:async()=>null};localStorage.setItem("bahce-aile-kodu","ABCDEFGH23")');
ok('claude.ai sürümünde aile/sınıf düğmeleri ve ödev kartı gizli',ev('aileSinifDugmeleri()')===""&&ev('odevKartiHtml()')===""&&ev('aileKodu()')==="");
ev('localStorage.removeItem("bahce-aile-kodu");window.claude=window.__eski');
ok('GitHub sürümünde ebeveyn bölümünde düğmeler',/Öğretmen paneli/.test(ev('aileSinifDugmeleri()')));
w.eval(`(()=>{const M=new Map();window.__M=M;window.__uid="U1";const kopya=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
 function belge(yol,id){const k=yol+"/"+id;return {id,get:async()=>({id,exists:M.has(k),data:()=>kopya(M.get(k))}),set:async v=>{M.set(k,kopya(v));},
  update:async v=>{if(!M.has(k))throw new Error("yok");M.set(k,Object.assign(M.get(k),kopya(v)));},delete:async()=>{M.delete(k);},
  listeyeEkle:async(a,d)=>{const o=M.get(k);if(!o)throw new Error("yok");if(o[a].includes(d))throw new Error("izin");o[a]=o[a].concat([d]);},
  listedenCikar:async(a,d)=>{const o=M.get(k);o[a]=o[a].filter(x=>x!==d);}};}
 const db={collection:yol=>({doc:id=>belge(yol,String(id)),get:async()=>({docs:[...M.keys()].filter(k=>k.startsWith(yol+"/")&&!k.slice(yol.length+1).includes("/")).map(k=>({id:k.slice(yol.length+1),data:()=>kopya(M.get(k))}))})})};
 window.claude={bulut:true,use:async ne=>ne==="db"?db:ne==="user"?{id:async()=>window.__uid,canEdit:async()=>true,can:async()=>true}:null};})()`);
const cihaz=(uid)=>ev(`window.__uid="${uid}";DB=null;UID=null;docRef=null;window.DBK=null;`);
/* 14a: aile kodu oluşturma */
cihaz("U1");ev('localStorage.setItem("bahce-bulut-acik","1");PROF.liste=[{id:"p0",ad:"Ali",yas:8}];PROF.aktif="p0";profKaydet();S=normalize(null);S.sure={"112":{yildiz:{oku:true,kelime:false,tamamla:false,sirala:false}}};save()');
ok('aile kodu yokken kişisel yol',await ev('bulutDB().then(()=>kayitYolu())')==="data/users/U1");
const kod=await ev('aileOlustur()');const A=k=>JSON.parse(ev(`JSON.stringify(__M.get(${JSON.stringify(k)})||null)`));
ok('aile kodu 10 harf '+kod,/^[A-Z2-9]{10}$/.test(kod));
ok('aileler/{kod} = {sahip, uyeler:[uid], t}',(()=>{const a=A("aileler/"+kod);return a&&a.sahip==="U1"&&JSON.stringify(a.uyeler)==='["U1"]'&&Object.keys(a).sort().join()==="sahip,t,uyeler";})());
ok('kayıtlar aileye kopyalandı',!!(A("aileler/"+kod+"/kayit/fatiha")||{sure:{}}).sure["112"]&&(A("aileler/"+kod+"/kayit/profiller")||{liste:[]}).liste.length===1);
ok('eşitleme aile yolunda',ev('kayitYolu()')==="aileler/"+kod+"/kayit"&&ev('localStorage.getItem("bahce-aile-kodu")')===kod);
/* 14b: ikinci cihaz katılır, kayıtlar birleşir */
ev('localStorage.clear()');cihaz("U2");ev('PROF.liste=[{id:"p0",ad:"Ali",yas:8}];PROF.aktif="p0";S=normalize(null);S.sure={"113":{yildiz:{oku:true,kelime:true,tamamla:false,sirala:false}}};save()');
ok('izin yokken bulut kapalı',ev('bulutKapali()'));
await ev(`aileKatil(" ${kod.toLowerCase()} ")`);
ok('uyeler listesine eklendi',JSON.stringify(A("aileler/"+kod).uyeler)==='["U1","U2"]');
ok('yerel ve aile kaydı birleşti',ev('!!(S.sure["112"].yildiz.oku&&S.sure["113"].yildiz.kelime)'));
ok('birleşik kayıt aileye yazıldı',!!A("aileler/"+kod+"/kayit/fatiha").sure["113"]);
ok('bulut açıldı, aile yolu',!ev('bulutKapali()')&&ev('kayitYolu()')==="aileler/"+kod+"/kayit");
await ev('bulutBasla()');ev('S.puan=777;bulutGonder()');await bekle(50);
ok('bulutBasla aile yolundan eşitliyor (js/17)',A("aileler/"+kod+"/kayit/fatiha").puan===777&&!A("data/users/U2/fatiha"));
await ev('aileBirak()');
ok('üye aileden çıktı, kişisel yola döndü',JSON.stringify(A("aileler/"+kod).uyeler)==='["U1"]'&&ev('kayitYolu()')==="data/users/U2");
/* 14c: öğretmen paneli */
cihaz("T1");const sk=await ev('sinifOlustur("Cumartesi kursu")');
ok('sınıf belgesi',/^[A-Z2-9]{8}$/.test(sk)&&(()=>{const c=A("siniflar/"+sk);return c.ogretmen==="T1"&&c.ad==="Cumartesi kursu"&&c.odev===null;})());
await ev(`odevVer("${sk}",{sure:112,tur:"yildiz",son:"2099-01-01"})`);
ok('ödev alanı',JSON.stringify(A("siniflar/"+sk).odev)==='{"sure":112,"tur":"yildiz","son":"2099-01-01"}');
cihaz("U2");await ev(`sinifKatil("${sk}","Ali K.")`);
const o=A("siniflar/"+sk+"/ogrenciler/U2");
ok('öğrenci özeti: yalnız takma ad ve sayılar',o&&Object.keys(o).sort().join()==="ad,ozet,t"&&o.ad==="Ali K."&&o.ozet.yildiz===3&&o.ozet.ezberde===0&&o.ozet.odevDurum==="suruyor"&&Object.keys(o.ozet).sort().join()==="ezberde,odevDurum,sonGun,yildiz");
ok('ana sayfa ödev kartı',/Öğretmeninin ödevi/.test(ev('odevKartiHtml()'))&&/İhlâs/.test(ev('odevKartiHtml()')));
ok('değişmeyen özet yazılmaz',await ev('sinifOzetGonder(false)')===false);
ev('S.sure["112"].yildiz={oku:true,kelime:true,tamamla:true,sirala:true}');ok('ödev tamam',ev('odevDurumu()')==="tamam"&&await ev('sinifOzetGonder(false)')===true&&A("siniflar/"+sk+"/ogrenciler/U2").ozet.odevDurum==="tamam");
ok('ikinci çocuğun belge adı',ev('(()=>{const a=PROF.aktif;PROF.aktif="p1x";const r=ogrenciBelge();PROF.aktif=a;return r;})()')==="U2_p1x");
cihaz("T1");ev('KAPI_ZAMAN=Date.now()');await ev(`ogretmenPaneli("${sk}")`);
ok('öğretmen panelinde öğrenci listesi',(()=>{const t=w.document.getElementById('view').textContent;return t.includes("Ali K.")&&t.includes(sk)&&t.includes("✓ Tamam");})());
await ev(`sinifSil("${sk}")`);ok('sınıf ve öğrenci kayıtları silindi',!A("siniflar/"+sk)&&!A("siniflar/"+sk+"/ogrenciler/U2")&&ev('siniflarim().length')===0);
/* 14d: bulut kaydını silme (sahip) aileyi ve aile kayıtlarını da siler */
cihaz("U1");ev(`localStorage.setItem("bahce-aile-kodu","${kod}");localStorage.setItem("bahce-bulut-acik","1")`);await ev('bulutSil()');
ok('bulutSil: aile ve aile kayıtları silindi',!A("aileler/"+kod)&&!A("aileler/"+kod+"/kayit/fatiha")&&!A("aileler/"+kod+"/kayit/profiller")&&ev('aileKodu()')==="");
ev('window.claude=window.__eski;DB=null;UID=null;docRef=null;window.DBK=null');
if(errs.length){HATA++;console.log('sayfa hataları',errs);}}

/* 15: heybe (buluta gerek kalmadan cihaz değiştirme): hazırla, metne çevir, öbür cihazda birleştirerek aç */
async function test_t15(){const {w,errs,ev}=await kur();const ok=(a,v)=>{if(!v)HATA++;console.log((v?'TAMAM ':'HATA  ')+a);};
const bekle=ms=>new Promise(r=>setTimeout(r,ms));
for(const k of ['CompressionStream','DecompressionStream','Response','TextEncoder','TextDecoder'])if(globalThis[k])w[k]=globalThis[k];
ev(`PROF.liste=[{id:"p0",ad:"Ali",yas:8},{id:"pkz",ad:"Ayşe",yas:6}];PROF.aktif="p0";S.ilkYolGec=true;S.puan=120;S.rozet=["ilk"];
  SS(1).yildiz.oku=true;SS(1).yildiz.kelime=true;S.sinif={kod:"ABCDEFGH",ad:"x"};S.hedefler={ABCDEFGH:{tur:"soru",n:3}};save();
  localStorage.setItem(lsAnahtar("pkz"),JSON.stringify(normalize({puan:40,sure:{"112":{yildiz:{oku:true}}}})));`);
const h=ev('heybeHazirla()');ok('heybede iki kişi',h.kisiler.length===2);
ok('bulut anahtarları heybede yok',!('sinif' in h.kisiler[0].ilerleme)&&!('hedefler' in h.kisiler[0].ilerleme));
const m1=await ev('heybeMetin(heybeHazirla())');ok('metin sıkıştırılmış ('+m1.slice(0,5)+', '+m1.length+' harf)',m1.startsWith(w.CompressionStream?'SOB1:':'SOB0:'));
const geri=await ev(`heybeCoz(${JSON.stringify(m1)})`);ok('metin geri çözüldü',geri.kisiler[1].ad==="Ayşe"&&geri.kisiler[0].ilerleme.puan===120);
let red=0;for(const bozuk of ['merhaba','SOB0:'+Buffer.from('{"tur":"baska","kisiler":[]}').toString('base64'),'{"tur":"sureler-oyun-bahcesi-heybe","surum":9,"kisiler":[]}'])
  {try{await ev(`heybeCoz(${JSON.stringify(bozuk)})`);}catch(e){red++;}}ok('bozuk ya da yabancı heybe açılmaz',red===3);
const elle=await ev(`heybeCoz(${JSON.stringify(JSON.stringify({tur:"sureler-oyun-bahcesi-heybe",surum:1,kisiler:[{id:"p0",ad:"Ali",ilerleme:{puan:"9e99",sure:{"1":{yildiz:{oku:"evet"}},"x<y>":{}},rozet:[1,"a"]}}]}))})`);
ok('elle oynanmış değerler sınırlandı',elle.kisiler[0].ilerleme.puan===1e7&&elle.kisiler[0].ilerleme.sure["1"].yildiz.oku===false&&!("x<y>" in elle.kisiler[0].ilerleme.sure)&&elle.kisiler[0].ilerleme.rozet.join()==="a");
/* öbür cihaz: Ali'nin daha az ilerlemesi var, Ayşe yok */
ev(`localStorage.clear();PROF.liste=[{id:"q1",ad:"ali",yas:8}];PROF.aktif="q1";profYukle("q1");S.ilkYolGec=true;S.puan=200;SS(1).yildiz.tamamla=true;S.rozet=["ikinci"];save();`);
await ev('ebeveynOzet()');await bekle(300);
{const V=w.document.getElementById('view');if(V.querySelector('#kCvp')){const t=V.querySelector('label[for=kCvp]').textContent.match(/(\d+) × (\d+)/);V.querySelector('#kCvp').value=String(t[1]*t[2]);V.querySelector('#kTamam').click();await bekle(400);}}
ok('ebeveyn bölümünde heybe kutusu',!!w.document.getElementById('hyDosya')&&!!w.document.getElementById('hyYapistir'));
await ev(`heybeOku(${JSON.stringify(m1)})`);await bekle(100);
const sec=[...w.document.querySelectorAll('[data-hyk]')];ok('önizlemede iki kişi',sec.length===2);
ok('Ali adla eşleşti, Ayşe yeni kişi',sec[0].value==="q1"&&sec[1].value==="");
w.document.getElementById('hyAc').click();await bekle(300);
ok('birleşti: büyük puan kalır',ev('S.puan')===200);
ok('birleşti: yıldızlar toplandı',ev('S.sure["1"].yildiz.oku&&S.sure["1"].yildiz.kelime&&S.sure["1"].yildiz.tamamla')===true);
ok('birleşti: rozetler toplandı',ev('S.rozet.includes("ilk")&&S.rozet.includes("ikinci")'));
const yeni=ev('PROF.liste.find(p=>p.ad==="Ayşe")');ok('Ayşe yeni kişi olarak eklendi',!!yeni);
ok('Ayşe\'nin ilerlemesi yerinde',yeni&&JSON.parse(w.localStorage.getItem(ev(`lsAnahtar(${JSON.stringify(yeni&&yeni.id)})`))).sure["112"].yildiz.oku===true);
ok('bulut anahtarı taşınmadı',!ev('S.sinif'));
if(errs.length){HATA++;console.log('sayfa hataları',errs);}}
(async()=>{for(const f of [test_t5,test_t6,test_t7,test_t8,test_t9,test_t10,test_t11,test_t12,test_t13,test_t14,test_t15]){console.log('--',f.name);await f();}console.log(HATA?HATA+' hata':'hepsi geçti');process.exit(HATA?1:0);})();
