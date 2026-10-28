/* Sureler Oyun Bahçesi · oyun mantığı testleri: kayıt birleştirme, seri telafisi, mesaj sırası, Bugünün tekrarı, mola, ortak hedef güvenliği
   Çalıştırmak için:  npm install jsdom@24  ardından  node test/oyun-test.js */
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

async function test_t3(){const {w,errs,ev}=await kur();
const ok=(ad,v)=>{if(!v)HATA++;console.log((v?'TAMAM ':'HATA  ')+ad);};
// birleştirme
/* ezberSurum:2 → iki kayıt da yeni takvimde; eski kayıt dönüşümü yeni-ozellikler-test.js'te (test_t12) */
const A={ezberSurum:2,puan:100,dogru:10,ardarda:3,rekor:5,seri:2,sonGun:"2026-10-20",rozet:["ilk"],sus:["kus"],hiz:1.25,sure:{"112":{yildiz:{oku:true,kelime:false},ezberDurum:{"0":{kutu:2,sonraki:"2026-10-25"}}}},gunluk:{"2026-10-20":30}};
const B={ezberSurum:2,puan:80,dogru:12,ardarda:0,rekor:4,seri:5,sonGun:"2026-10-22",rozet:["onlu"],sus:["cit"],hiz:0.75,sure:{"112":{yildiz:{oku:false,kelime:true},ezberDurum:{"0":{kutu:3,sonraki:"2026-10-30"},"1":{kutu:0,sonraki:"2026-10-23"}}},"113":{yildiz:{oku:true}}},gunluk:{"2026-10-20":10,"2026-10-21":40}};
w.__A=A;w.__B=B;const M=ev('birlestir(__A,__B)');
ok('puan en büyük',M.puan===100);ok('dogru en büyük',M.dogru===12);ok('rozet birleşim',M.rozet.length===2);ok('süs birleşim',M.sus.length===2);
ok('ayar yerel kalır',M.hiz===1.25&&M.ardarda===3);ok('yıldızlar VEYA',M.sure["112"].yildiz.oku&&M.sure["112"].yildiz.kelime);
ok('ezber yüksek kutu',M.sure["112"].ezberDurum["0"].kutu===3&&!!M.sure["112"].ezberDurum["1"]);ok('başka sure korunur',!!M.sure["113"]);
ok('seri yeni günden',M.seri===5&&M.sonGun==="2026-10-22");ok('günlük gün gün',M.gunluk["2026-10-20"]===30&&M.gunluk["2026-10-21"]===40);
// seri telafi
const t=ev('today()');const gunOnce=n=>{const d=new Date(t+"T12:00");d.setDate(d.getDate()-n);return d.toLocaleDateString("sv-SE");};
ev(`S.seri=10;S.sonGun="${gunOnce(2)}";S.telafi=null;gun()`);ok('1 gün kaçırma telafi',ev('S.seri')===11&&ev('S.telafi.n')===1);
ev(`S.sonGun="${gunOnce(3)}";gun()`);ok('2 gün daha kaçırma hak yetmez',ev('S.seri')===1);
ev(`S.seri=4;S.sonGun="${gunOnce(1)}";gun()`);ok('dün çalıştıysa artar',ev('S.seri')===5);
// toast kuyruğu
ev('toast("a");toast("b");toast("c")');ok('toast kuyrukta',w.document.getElementById('toast').textContent==='a'&&ev('toast.q.length')===2);
// tekrar akışı: iki surede günü gelen ayet
ev(`S.sure["112"]=Object.assign(S.sure["112"]||{},{ezberDurum:{"0":{kutu:1,sonraki:"2000-01-01"}}});S.sure["113"]=Object.assign(S.sure["113"]||{},{ezberDurum:{"2":{kutu:0,sonraki:"2000-01-01"}}});`);
ev('PROF.liste=[{id:"p0",ad:"Test",yas:8}];PROF.aktif="p0";S.seviye="genc";S.ilkYolGec=true;anaSayfa()');const b=w.document.getElementById('tekrarHepsi');ok('Bugünün tekrarı düğmesi',!!b&&/2 ayet/.test(b.textContent));
b.click();await new Promise(r=>setTimeout(r,800));ok('ilk surede ezber ekranı (düşük kutu önce: 113)',ev('CUR&&CUR.no')===113&&!!w.document.querySelector('[data-d="2"]'));
w.document.querySelector('[data-d="2"]').click();await new Promise(r=>setTimeout(r,800));
ok('ikinci sureye geçti',ev('CUR&&CUR.no')===112&&!!w.document.querySelector('[data-d="2"]'));
w.document.querySelector('[data-d="2"]').click();await new Promise(r=>setTimeout(r,800));
ok('akış bitti, ana sayfa',ev('CUR')===null&&!ev('TEKRAR_AKIS'));
// mola
ev('molaGoster()');ok('mola: uzatma düğmesi',!!w.document.getElementById('molaBes'));w.document.getElementById('molaBes').click();ev('molaGoster()');ok('mola: ikinci kez uzatma yok',!w.document.getElementById('molaBes'));
// hedef sayfası sahte db ile
const docs={};w.DB=null;ev(`DB={collection:(c)=>({doc:(id)=>({get:async()=>({exists:!!window.__docs[c+'/'+id],data:()=>window.__docs[c+'/'+id]}),set:async v=>{window.__docs[c+'/'+id]=v},update:async v=>{Object.assign(window.__docs[c+'/'+id],v)}}),get:async()=>{throw new Error('liste okunmamalı')}})};UID="u1";`);
w.__docs={'hedef/ABCD12':{ad:'<b>Aile</b>',hedef:100,tur:'tekrar',t:'x',u_u2:'<img src=x>',u_u3:7}};
ev('S.hedefler={ABCD12:{tur:"tekrar",n:5}}');await ev('hedefSayfa()');await new Promise(r=>setTimeout(r,200));
const V=w.document.getElementById('view').innerHTML;ok('hedef: kaçırılmış ad',V.includes('&lt;b&gt;Aile'));ok('hedef: kötü sayı yok sayıldı, toplam 12',/<b>12 \/ 100<\/b>/.test(V));ok('hedef: kendi katkısı yazıldı',w.__docs['hedef/ABCD12'].u_u1===5);
if(errs.length){HATA++;console.log('sayfa hataları',errs);}}

(async()=>{for(const f of [test_t3]){console.log('--',f.name);await f();}console.log(HATA?HATA+' hata':'hepsi geçti');process.exit(HATA?1:0);})();
