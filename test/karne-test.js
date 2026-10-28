/* Sureler Oyun Bahçesi · haftalık karne testi (js/22-karne.js)
   Çalıştırmak için:  npm install jsdom@24  ardından  node test/karne-test.js */
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


const gunOnce=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.toLocaleDateString("sv-SE");};
async function test_karne(){const {w,errs,ev}=await kur();const ok=(a,v)=>{if(!v)HATA++;console.log((v?'TAMAM ':'HATA  ')+a);};
const V=()=>w.document.getElementById('view');
const bug=gunOnce(0),dun=gunOnce(1),uc=gunOnce(3),gecen=gunOnce(10),ileri=(()=>{const d=new Date();d.setDate(d.getDate()+5);return d.toLocaleDateString("sv-SE");})();
/* ikinci kişinin (Zeynep) kaydı yalnız localStorage'da */
const Z={puan:500,sure:{"108":{ezberDurum:{0:{kutu:4,sonraki:ileri,onaylandi:dun},1:{kutu:2,sonraki:gunOnce(2)}}}},log:{},ezberSurum:2};Z.log[dun]={soru:2,dogru:2,tekrar:3,hikaye:0,dk:6,s:{"108":3},zor:[]};
ev(`localStorage.setItem(lsAnahtar("p1"),${JSON.stringify(JSON.stringify(Z))})`);
ev(`PROF.liste=[{id:"p0",ad:"Ali",yas:8},{id:"p1",ad:"Zeynep",yas:6}];PROF.aktif="p0";S.seviye="kucuk";S.ilkYolGec=true;
 S.sure={"112":{ezberDurum:{0:{kutu:4,sonraki:"2099-01-01",onaylandi:"${dun}"},1:{kutu:4,sonraki:"2099-01-01",tam:true,onayBekle:true},2:{kutu:1,sonraki:"${uc}",dinletti:"${dun}"},3:{kutu:2,sonraki:"${ileri}",zayif:true}}},
  "1":{ezberDurum:{0:{kutu:4,sonraki:"2099-01-01",onaylandi:"${gecen}"},1:{kutu:0,sonraki:"${uc}"}},yildiz:{oku:true,kelime:true,tamamla:false,sirala:false}},
  "36001":{ezberDurum:{0:{kutu:3,sonraki:"${ileri}"}}}};
 S.log={};S.log["${bug}"]={soru:10,dogru:8,tekrar:5,hikaye:1,dk:12.5,s:{"112":5},zor:[{s:112,a:4}],onay:1};S.log["${dun}"]={soru:4,dogru:4,tekrar:3,hikaye:0,dk:7,s:{"112":3},zor:[{s:112,a:4},{s:1,a:2}],dinlet:1};
 S.log["${uc}"]={soru:0,dogru:0,tekrar:2,hikaye:0,dk:4,s:{},zor:[]};S.log["${gecen}"]={soru:50,dogru:50,tekrar:30,hikaye:0,dk:60,s:{},zor:[{s:113,a:1}]};
 S.yanlis={"a":{k:"a",s:105,html:"<p>Fil ordusunun komutanı kimdi?</p>",answer:"Ebrehe",opts:[],kutu:0,sonraki:"${ileri}"},"b":{k:"b",s:105,html:"<p>Ebabil nedir?</p>",answer:"x",opts:[],kutu:1,sonraki:"${bug}"},"c":{k:"c",s:112,html:"<p>Samed ne demek?</p>",answer:"y",opts:[],kutu:0,sonraki:"${ileri}"},"d":{k:"d",s:114,html:"eski",answer:"z",opts:[],kutu:0,sonraki:"${gecen}"}};
 KAPI_ZAMAN=Date.now();`);
ok('genel fonksiyonlar var',ev('typeof karneSayfa==="function"&&typeof karneOzetMetni==="function"&&typeof karneVeri==="function"'));
const v=ev('karneVeri()');
ok('aktif kişi varsayılan: '+v.ad,v.id==="p0"&&v.ad==="Ali");
ok('çalışılan gün 3/7 (10 gün önceki sayılmaz): '+v.aktifGun,v.aktifGun===3);
ok('süre 24 dk: '+v.dk,v.dk===24);
ok('ayet tekrarı 10: '+v.tekrar,v.tekrar===10);
ok('bu hafta ezbere geçen 1 (geçen haftaki onay sayılmaz): '+v.yeniEzb,v.yeniEzb===1);
ok('ebeveynine okunan 1, onaylanan 1',v.dinletti===1&&v.onaylandi===1);
ok('ezber toplamları: ezberde 2, tekrarda 5, gecikmiş 2, onay bekleyen 1 '+JSON.stringify([v.ezb,v.tkr,v.gec,v.onayBek]),v.ezb===2&&v.tkr===5&&v.gec===2&&v.onayBek===1);
ok('sure sırası katalogdaki gibi: '+v.sureler.map(s=>s.ad).join(","),v.sureler.map(s=>s.no).join()==="1,36001,112");
ok('Yâsîn grubu ayet sayısı 4',v.sureler[1].top===4);
ok('zorlandığı ilk yer İhlâs 4 (2 gün): '+JSON.stringify(v.zorlar[0]),v.zorlar[0].tur==="ayet"&&v.zorlar[0].s===112&&v.zorlar[0].a===4&&v.zorlar[0].n===2);
ok('yanlışlar defteri: Fîl 2 soru, eski kayıt yok',v.zorlar.some(z=>z.tur==="soru"&&z.s===105&&z.n===2)&&!v.zorlar.some(z=>z.s===114)&&!v.zorlar.some(z=>z.s===113));
ok('zorlar en çok 5',v.zorlar.length>=3&&v.zorlar.length<=5);
ok('öneri 2-3 madde: '+v.oneriler.length,v.oneriler.length>=2&&v.oneriler.length<=3);
ok('ilk öneri gecikmiş tekrarlar',/gecikmiş 2 tekrar/.test(v.oneriler[0]));
ok('onay öneri maddesi',v.oneriler.some(x=>/sizi bekliyor/.test(x)));
ok('toplam yıldız 2',v.yildiz===2);
/* sayfa */
ev('karneSayfa()');
ok('karne açıldı',!!V().querySelector('article.krn')&&/Haftalık karne/.test(w.document.getElementById('baslik').textContent));
ok('stil bir kez eklendi',w.document.querySelectorAll('#karneStil').length===1);
const T=V().textContent;
ok('başlıkta ad ve tarih aralığı',/Ali/.test(V().querySelector('.krn-bas').textContent)&&/–/.test(V().querySelector('.krn-bas').textContent));
for(const b of ['Bu hafta','Ezber durumu','Zorlandığı yerler','Gelecek hafta için öneri','Ebeveyn notu'])ok('bölüm: '+b,[...V().querySelectorAll('.krn-bol h3')].some(h=>h.textContent.trim()===b));
ok('bu hafta kutuları dolu',/3\/7/.test(V().querySelector('.krn-sayilar').textContent)&&V().querySelectorAll('.krn-sayi').length>=7);
ok('sure tablosunda 3 satır ve çubuk',V().querySelectorAll('.krn-tablo tbody tr').length===3&&V().querySelectorAll('.krn-cubuk').length===3);
ok('zorlandığı yerler listesi',V().querySelectorAll('.krn-oneri li').length===v.oneriler.length&&/İhlâs 4\. ayet/.test(T)&&/Fîl soruları/.test(T));
ok('ebeveyn notu boş satırları',V().querySelectorAll('.krn-not span').length===4);
ok('puan ve kardeş kıyası yok',!/puanı|Emek puanı|Zeynep'ten|kardeş/i.test(V().querySelector('.krn').textContent.replace(/puandan/g,""))&&!/500/.test(V().querySelector('.krn').textContent));
ok('düğmeler yazdırmada gizli sınıfta',!!V().querySelector('.krn-dugmeler.yazdirma-yok #krnYaz'));
ok('@media print ve A4 kuralı',/@media print/.test(w.document.getElementById('karneStil').textContent)&&/A4 portrait/.test(w.document.getElementById('karneStil').textContent));
/* yazdır: print çağrılır; hata verirse toast */
let bas=0;w.print=()=>{bas++;};V().querySelector('#krnYaz').click();ok('Yazdır window.print çağırdı',bas===1);
w.print=()=>{throw new Error('yok');};V().querySelector('#krnYaz').click();await new Promise(r=>setTimeout(r,50));ok('yazdırma hatasında toast',/Yazdırma/.test(w.document.getElementById('toast').textContent));
/* paylaş / kopyala */
let kop=null;Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async t=>{kop=t;}},configurable:true});
ok('share yoksa "Metni kopyala"',V().querySelector('#krnPay').textContent.trim()==="Metni kopyala");
V().querySelector('#krnPay').click();await new Promise(r=>setTimeout(r,50));ok('metin panoya kopyalandı',kop&&/Haftalık karne · Ali/.test(kop));
let pay=null;w.navigator.share=async o=>{pay=o;};ev('karneSayfa()');ok('share varsa "Paylaş"',V().querySelector('#krnPay').textContent.trim()==="Paylaş");
V().querySelector('#krnPay').click();await new Promise(r=>setTimeout(r,50));ok('navigator.share çağrıldı',pay&&/Ali/.test(pay.title)&&/Gelecek hafta/.test(pay.text));
delete w.navigator.share;
/* özet metni */
const m=ev('karneOzetMetni("p0")');
ok('özet metni satırları',/3\/7 gün/.test(m)&&/24 dakika/.test(m)&&/2 ayet ezberde/.test(m)&&/Zorlandığı yerler: İhlâs 4\. ayet/.test(m)&&/\n- /.test(m)&&!/<[a-z]/i.test(m));
/* diğer kişi: localStorage'dan */
V().querySelector('[data-krn="p1"]').click();
ok('diğer kişinin karnesi (localStorage)',/Zeynep/.test(V().querySelector('.krn-bas').textContent)&&/Kevser/.test(V().textContent));
const vz=ev('karneVeri("p1")');ok('Zeynep: 1/7 gün, 1 ezberde, 1 gecikmiş, onaylanan 1',vz.aktifGun===1&&vz.ezb===1&&vz.gec===1&&vz.onaylandi===1&&vz.yeniEzb===1);
ok('aktif kişi değişmedi',ev('PROF.aktif')==="p0"&&ev('S.sure["112"]')!==undefined);
/* boş kişi: cesaretlendirici, öneri yine 2-3 */
ev('localStorage.removeItem(lsAnahtar("p1"))');const vb=ev('karneVeri("p1")');ok('kaydı olmayan kişi: 0 gün, 2-3 öneri, yeni sure Fâtiha',vb.aktifGun===0&&vb.oneriler.length>=2&&vb.oneriler.length<=3&&vb.oneriler.some(x=>/Fâtiha/.test(x)));
ok('ara veren için nazik giriş',/küçük bir adım/.test(ev('karneGiris(karneVeri("p1"))')));
/* kapı kapalıyken önce yetişkin kapısı */
ev('KAPI_ZAMAN=0;karneSayfa("p0")');ok('kapı kapalıysa yetişkin kapısı',!!V().querySelector('#kCvp')||!!V().querySelector('#kPin'));
ev('KAPI_ZAMAN=Date.now();karneSayfa("p0")');
/* geri */
V().querySelector('#krnGeri').click();await new Promise(r=>setTimeout(r,400));ok('geri → ebeveyn özeti',/Haftalık ebeveyn özeti/.test(V().textContent));
if(errs.length){HATA++;console.log('sayfa hataları',errs);}}
(async()=>{for(const f of [test_karne]){console.log('--',f.name);await f();}console.log(HATA?HATA+' hata':'hepsi geçti');process.exit(HATA?1:0);})();
