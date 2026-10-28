/* Sureler Oyun Bahçesi · Kitaptan bölümler: tecvid, ezber köşesi, kitap sınavı, 30 günlük yol, sayılar, düşünme, çocuklar için */
/* ---------- kitaptan bölümler (ek) ---------- */
const EK_SEKME=[["sinav","Kitap sınavı"],["yol","30 günlük yol"],["sayilar","Sayılar"],["dusun","Düşünme"],["cocuk","Çocuklar için"]];
const TC={ham_wasl:"sessiz",laam_shamsiyah:"sessiz",slnt:"sessiz",madda_normal:"medd1",madda_permissible:"medd2",madda_necessary:"medd3",madda_obligatory:"medd4",
  ghunnah:"gunne",ikhafa:"ihfa",ikhafa_shafawi:"ihfa",iqlab:"iklab",idgham_ghunnah:"idgam",idgham_wo_ghunnah:"idgam",idgham_mutajanisayn:"idgam",idgham_mutaqaribayn:"idgam",idgham_shafawi:"idgam",qalaqah:"kalkale"};
const gunEkle=(n)=>{const d=new Date();d.setDate(d.getDate()+n);return d.toLocaleDateString("sv-SE");};
const ekS=k=>{const t=SS(CUR.no);if(!t[k])t[k]={};return t[k];};
let yaziTimer=null;const yaziKaydet=()=>{clearTimeout(yaziTimer);yaziTimer=setTimeout(save,900);};
async function ekYukle(no){return CACHE["ek"+no]=CACHE["ek"+no]||{};}
const EK_PARCA={oku:"a",ezber:"a",cocuk:"a",sinav:"b",yol:"b",sayilar:"b",dusun:"b"};
async function ekParca(no,p){const E=CACHE["ek"+no]=CACHE["ek"+no]||{};E._y=E._y||{};if(E._y[p])return E;
  try{const r=await fetch("data/"+String(no).padStart(3,"0")+"_ek"+p+".json?v="+SURUM);if(r.ok){Object.assign(E,await r.json());E._y[p]=1;}}catch(e){}return E;}
function ekRozet(){
  const t=(S.sure["1"]||{});const e=t.ezberDurum||{};
  return [
   /* basamak numaraları ekrandakiyle aynı: ekranda "Basamak kutu+1" yazar */
   ["ezber1","Bir ayeti ezber kutusunda 4. basamağa taşıdı",()=>Object.values(S.sure).some(x=>Object.values(x.ezberDurum||{}).some(v=>v&&(v.kutu>=3||v.tam)))],
   ["ezberF",`Fâtiha ezberde (yedi ayet de ${EZ_TAM_KUTU+1}. basamakta)`,()=>[0,1,2,3,4,5,6].every(i=>ezbTam(e[i]))],
   ["sinav","Kitap sınavının on kısmında %80",()=>{const s=t.sinav||{};return [1,2,3,4,5,6,7,8,9,10].every(k=>(s[k]||0)>=80);}],
   ["yol30","30 günlük yolu bitirdi",()=>((t.yol||{}).gunler||[]).length>=30],
   ["dusun5","Beş düşünme kartına cevap yazdı",()=>Object.keys(t.dusun||{}).length>=5]
  ];
}

/* tecvid görünümü: oku() içinden çağrılır */
function tecvidKelime(ai,wi){
  const k=CUR.tecvid&&CUR.tecvid[ai]&&CUR.tecvid[ai][wi];
  if(!k)return esc(CUR.ayetler[ai].w[wi].a);
  const kAd=c=>esc(((TKUR&&TKUR.kurallar||{})[c]||{}).ad||"Tecvid kuralı");
  return k.map(([t,c])=>c?`<span class="tc-${TC[c]||"sessiz"}" data-c="${c}" tabindex="0" role="button" title="${kAd(c)}" aria-describedby="tkl-${String(c).replace(/[^\w-]/g,"_")}">${t}</span>`:t).join("");
}
function tecvidLejant(){
  const K=TKUR.kurallar,var_=new Set();
  CUR.tecvid.forEach(a=>(a||[]).forEach(w=>w.forEach(([t,c])=>{if(c)var_.add(c);})));
  return `<div class="lejant">${[...var_].map(c=>`<span class="tc-${TC[c]||"sessiz"}" id="tkl-${String(c).replace(/[^\w-]/g,"_")}" style="border-color:currentColor">${esc((K[c]||{}).ad||c)}</span>`).join("")}</div>
  <p class="kucuk-yazi">Renkli harfe dokununca kuralın açıklaması çıkar. ${esc((CUR.ek&&CUR.ek.tecvid&&CUR.ek.tecvid.genel)||"Okuyuşunuzu bir hocaya dinletmeniz en sağlamıdır.")}</p>`;
}
function tecvidAc(V,ai,c){
  const K=TKUR.kurallar[c]||{ad:c,kisa:"",nasil:""};const el=$("tv"+ai);if(!el)return;const acan=document.activeElement;
  const T=(CUR.ek&&CUR.ek.tecvid)||{};
  const gA=(CUR.ilkAyet||1)+ai;
  const notlar=(T.fatiha_notlari||[]).filter(n=>+n.ayet===gA);
  const kir=(T.kiraat||[]).filter(n=>+n.ayet===gA);
  el.hidden=false;el.className="detay pop";
  el.innerHTML=`<p><b class="tc-${TC[c]||"sessiz"}">${esc(K.ad)}</b></p><p>${esc(K.kisa)}</p>${K.nasil?`<p><b>Nasıl okunur:</b> ${esc(K.nasil)}</p>`:""}
  ${(TKUR.kitapta_yok||[]).includes(c)?`<p class="kucuk-yazi">Bu açıklama kitapta yok; genel tecvid bilgisidir.</p>`:""}
  ${notlar.length?`<p><b>Kitaptaki notlar (${(CUR.ilkAyet||1)+ai}. ayet)</b></p><ul class="m0 liste-ic">${notlar.map(n=>`<li>${n.ar?`<span class="yazi-4 ar" lang="ar">${n.ar}</span> `:""}<b>${esc(n.kelime)}</b>${n.kural?` <span class="renk-vurgu kalin">(${esc(n.kural)})</span>`:""}: ${esc(n.not)}</li>`).join("")}</ul>`:""}
  ${kir.length?`<p><b>Kıraat farkı:</b> ${kir.map(n=>esc(n.not)).join(" ")}</p>`:""}
  <button id="tvk${ai}">Kapat</button>`;
  $("tvk"+ai).onclick=()=>{el.hidden=true;if(acan&&acan!==document.body&&acan.isConnected&&acan.focus)try{acan.focus({preventScroll:true});}catch(e){}};
  el.tabIndex=-1;try{el.focus({preventScroll:true});el.scrollIntoView({block:"nearest",behavior:kaydirmaDavranisi()});}catch(e){}
}

/* ---------- ezber köşesi ---------- */
let ezberAyet=null,ezberSeviye=1;
function ezber(){
  const V=$("view"),E=ezberVeri(),D=ekS("ezberDurum"),bugun=today(),ilk=CUR.ilkAyet||1;
  /* Tek takvim: surenin kitabındaki araliklar_gun yalnız eski kayıtları dönüştürmek için kullanıldı (01-temel.js, ezberGoc) */
  const AR=EZ_ARALIK,yetiskin=S.seviye==="yetiskin";
  if(ezberAyet!==null)return ezberCalis(ezberAyet);
  if(ezberArac)return aracCiz();
  const due=tumTekrarlar().filter(x=>x.id===CUR.no).map(x=>x.i).filter(i=>D[i]);
  const ilkAr=AR.slice(0,EZ_TAM_KUTU),sade=`Bir ayeti ${ilkAr.slice(0,-1).join(", ")} ve ${ilkAr[ilkAr.length-1]} gün sonra tekrar edince ezberin kalıcı olur.`;
  const yeniI=CUR.ayetler.findIndex((_,i)=>!D[i]),birikti=tekrarBirikti();
  V.innerHTML=`<h2>Ezber köşesi</h2>
  <p>${sade}</p>
  ${yetiskin?`<details class="detay"><summary><b>Neden aralıklı tekrar? (yetişkinler için)</b></summary><p>${esc(E.takvim.aciklama)}</p><p class="kucuk-yazi">Kitaptaki takvim farklı olabilir; uygulama bütün surelerde aynı takvimi kullanır: ${AR.map(g=>g+" gün").join(" · ")}. Ayet, ${AR[EZ_TAM_KUTU-1]} günlük aralıktan sonra da hatırlanınca (${EZ_TAM_KUTU+1}. basamak) ezberde sayılır. Günde en çok ${EZ_GUNLUK} ayet tekrar edilir.</p></details>`:""}
  <div class="odak"><b>Bugünün tekrarları:</b> ${due.length?due.map(i=>`${ilk+i}. ayet`).join(", "):"Bugün tekrar edilecek ayet yok."}
  ${due.length?`<br><button class="ust-2 primary" id="tekrarBasla">Tekrara başla</button>`:""}
  ${yeniI<0?"":birikti?`<br><span role="note"><b>Önce tekrarları bitirelim.</b> Yeni ayete tekrarlar azalınca geçeriz.</span>`:`<br><b>Sıradaki yeni ayet:</b> <button id="yeniAyet" class="dokun44 dar">${ilk+yeniI}. ayet</button>`}</div>
  ${ezberAracVar()?ezberHaritasi()+ezberAraclari():""}
  ${yetiskin?`<p class="kucuk-yazi"><b>Tekrar aralıkları:</b> ${AR.map(g=>g+" gün").join(" · ")}. Ayeti gizleyip aklından okuyup “Hatırladım” dedikçe bir sonraki basamağa geçer ve daha seyrek sorulur.</p>`:""}
  <div class="plan">${CUR.ayetler.map((a,i)=>{const d=D[i];const k=d?d.kutu:-1;
    return `<button class="oz" data-e="${i}" style="grid-template-columns:auto 1fr auto"><span class="no">${ilk+i}</span><span><span class="yazi-4 ar" lang="ar">${a.w.slice(0,3).map(w=>w.a).join(" ")}${a.w.length>3?" …":""}</span><br><span class="kucuk-yazi">${d?`Basamak ${k+1}/${AR.length} · sıradaki tekrar: ${d.sonraki<=bugun?"bugün":new Date(d.sonraki).toLocaleDateString("tr-TR")}${d.onayBekle?" · "+ikon("users")+" ebeveyn onayı bekliyor":ezbTam(d)?" · ✓ ezberde":""}${d.dinletBekle&&!d.onayBekle?" · "+ikon("ear")+" bugün ebeveynine oku":""}`:"Henüz başlanmadı"}</span></span><span class="durum">${d?"●".repeat(k+1):""}</span></button>`;}).join("")}</div>
  ${E.uyari?`<p class="kucuk-yazi"><b>Not:</b> ${esc(E.uyari)}</p>`:""}
  ${E.yontemler.length?"<h2>Ezber yöntemleri</h2>":""}
  ${E.yontemler.map((y,i)=>`<button class="oz" data-y="${i}"><span class="no">${i+1}</span><span>${esc(y.ad)}</span><span></span></button><div id="ey${i}" hidden></div>`).join("")}
  ${E.siirler.length?"<h2>Satır başı şiirleri</h2>":""}
  ${E.siirler.map((s,i)=>`<button class="oz" data-s="${i}"><span class="no">${i+1}</span><span>${esc(s.tur)}</span><span></span></button><div id="es${i}" hidden></div>`).join("")}
  ${E.hikayeler.length?"<h2>Hikâyeler</h2>":""}
  ${E.hikayeler.map((h,i)=>kucuk()&&/sesteş/i.test(h.baslik)?"":`<button class="oz" data-h="${i}"><span class="no">${i+1}</span><span>${esc(h.baslik)}</span><span></span></button><div id="eh${i}" hidden></div>`).join("")}`;
  const ac2=(id,html)=>{const d=$(id);if(!d.hidden){d.hidden=true;return;}d.className="detay pop";d.hidden=false;d.innerHTML=html;};
  V.querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>{ezberAyet=+b.dataset.e;ezberSeviye=Math.min(4,((D[ezberAyet]||{}).kutu??-1)+1);ezber();});
  V.querySelectorAll("[data-y]").forEach(b=>b.onclick=()=>{const y=E.yontemler[+b.dataset.y];ac2("ey"+b.dataset.y,`<ol class="m0 liste-ic">${y.adimlar.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>${y.ipucu?`<p><b>İpucu:</b> ${esc(y.ipucu)}</p>`:""}`);});
  V.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{const s=E.siirler[+b.dataset.s];ac2("es"+b.dataset.s,`<p>${esc(s.aciklama||"")}</p><p class="yazi-4 satir-17">${s.satirlar.map(l=>{const t=esc(l);return `<b class="renk-vurgu">${t.charAt(0)}</b>${t.slice(1)}`;}).join("<br>")}</p>`);});
  V.querySelectorAll("[data-h]").forEach(b=>b.onclick=()=>{const h=E.hikayeler[+b.dataset.h];const an=CUR.animEk&&Object.values(CUR.animEk).find(a=>h.baslik.startsWith(a.baslik));ac2("eh"+b.dataset.h,`${an?`<button class="yazi-4 dokun56 primary" id="animEz">${ikon("clapperboard")} Hikâyeyi canlandır</button>`:""}${h.metin.split("\n").filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join("")}${h.not?`<p class="kucuk-yazi"><b>Nasıl kullanılır:</b> ${esc(h.not)}</p>`:""}`);const ae=$("animEz");if(ae)ae.onclick=()=>{animAc(an,()=>ezber());window.scrollTo({top:0});};});
  V.querySelectorAll("[data-arac]").forEach(b=>b.onclick=()=>{ezberArac=b.dataset.arac;ezber();window.scrollTo({top:0});});
  const tb=$("tekrarBasla");if(tb)tb.onclick=()=>{ezberAyet=due[0];ezberSeviye=Math.min(4,(D[due[0]].kutu||0)+1);ezber();};
  const ya=$("yeniAyet");if(ya)ya.onclick=()=>{ezberAyet=yeniI;ezberSeviye=0;ezber();};
  if(TEKRAR_AKIS){if(tb)tb.click();else tekrarAkisi(CUR.no);}
}
function ezberCalis(i){
  const V=$("view"),E=ezberVeri(),D=ekS("ezberDurum"),a=CUR.ayetler[i],ilk=CUR.ilkAyet||1,AR=EZ_ARALIK;
  const p0=D[i]||{kutu:-1};
  /* Günü gelmiş tekrarda (kutu 1 ve üstü) "Hatırladım" yalnız ayet gizliyken; ilk öğrenmede (kutu 0) serbest */
  const kilit=p0.kutu>=1&&(!p0.sonraki||p0.sonraki<=today())&&ezberSeviye===0;
  const ip=(E.ayet_ipuclari||[]).find(x=>+x.ayet===ilk+i)||{};
  const gizli=(j)=>ezberSeviye===4||(ezberSeviye===3&&j>0)||(ezberSeviye===2&&j%2===1)||(ezberSeviye===1&&j%3===1);
  const SV=["Hiç gizleme","Az gizle","Yarısını gizle","Yalnız ilk kelime","Hepsini gizle"].concat(ezberAracVar()?["İlk harfler"]:[]);
  V.innerHTML=`<div class="esnek ara-2 sarmal"><button class="geri" id="ezGeri">${ikon("arrow-left")}Ezber listesi</button><button class="dn" id="ezDinle">▶ Ayeti dinle</button></div>
  <h2>${ilk+i}. ayeti ezberle</h2>
  <div class="subtabs">${SV.map((s,k)=>`<button data-sv="${k}" class="${ezberSeviye===k?"on":""}">${s}</button>`).join("")}</div>
  <div class="yatay-orta kelimeler" lang="ar">${a.w.map((w,j)=>ezberSeviye===5?`<button class="gizli" data-j="${j}" aria-label="Kelimeyi göster" style="font-family:var(--f-ar);font-size:26px;min-width:2.2em;border-style:dashed">${ilkHarf(w.a)}</button>`:gizli(j)?`<button class="gizli" data-j="${j}" aria-label="Gizli kelimeyi göster" style="font-family:var(--f-ar);font-size:26px;min-width:3em;border-style:dashed">؟</button>`:`<span class="k${j%12}">${w.a}</span>`).join("")}</div>
  <p class="kucuk-yazi">Gizli kelimeyi önce aklından söyle, sonra üstüne dokunup denetle.</p>
  <div class="subtabs">${[["ilk_kelime","İlk kelime bağlantısı"],["civi","Çivi imgesi"],["kodlama","Ezber kodu"],["saray","Hafıza sarayı"],["sinema","Zihinsel sinema"]].filter(([k])=>ip[k]).map(([k,ad])=>`<button data-ip="${k}">${ad}</button>`).join("")}<button data-ip="meal">Meali göster</button></div>
  <div id="ipucu" hidden></div>
  <div class="detay aile-kart"><button id="benOkuB" class="yazi-4 primary yesil-dug">${ikon("mic")} Ben okuyayım</button><p id="benOkuD" class="kucuk-yazi m0 ust-2">Ayeti kendin sesli oku; sonra kendi sesini ve Alafasy'yi art arda dinle.</p></div>
  <div class="odak"><b>Bu ayeti ne kadar hatırladın?</b>
   ${kilit?`<p class="m0 ust-2">Tekrar gününde ayeti önce gizleyip aklından oku, sonra “Hatırladım” de. <button class="dokun44 dar primary" id="gizleDene">Gizleyip dene</button></p>`:""}
   <div class="esnek ara-2 sarmal ust-2"><button class="${kilit?"":"primary"}" data-d="2" ${kilit?`disabled aria-disabled="true" title="Önce ayeti gizle"`:""}>Hatırladım</button><button data-d="1">Zorlandım</button><button data-d="0">Hatırlamadım</button></div></div>`;
  $("ezGeri").onclick=()=>{TEKRAR_AKIS=false;ezberAyet=null;durSes();ezber();};$("benOkuB").onclick=()=>benOku(i,$("benOkuB"),$("benOkuD"));
  $("ezDinle").onclick=()=>{const b=CUR.ses.bas,e=i+1<b.length?b[i+1]:CUR.ses.son;hizUygula();calParca(CUR.no,b[i],e);};
  V.querySelectorAll("[data-sv]").forEach(b=>b.onclick=()=>{ezberSeviye=+b.dataset.sv;ezberCalis(i);});
  {const gd=$("gizleDene");if(gd)gd.onclick=()=>{ezberSeviye=Math.min(4,p0.kutu+1);ezberCalis(i);};}
  V.querySelectorAll(".gizli").forEach(b=>b.onclick=()=>{const w=a.w[+b.dataset.j];const s=document.createElement("span");s.className="k"+(+b.dataset.j%12);s.textContent=w.a;b.replaceWith(s);});
  V.querySelectorAll("[data-ip]").forEach(b=>b.onclick=()=>{const d=$("ipucu");d.hidden=false;d.className="detay pop";
    d.innerHTML=b.dataset.ip==="meal"?`<p>${esc(a.meal)}</p><p class="okunus">${esc(a.ok)}</p>`:`<p><b>${esc(b.textContent)}:</b> ${esc(ip[b.dataset.ip])}</p>`;});
  V.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{
    const p=D[i]||{kutu:-1};let k=p.kutu;const not=+b.dataset.d;
    /* Basamak yalnız tekrar günü geldiğinde (ya da ilk çalışmada) yükselir; erken çalışma pekiştirir ama basamak atlatmaz */
    const vadeli=k<0||!p.sonraki||p.sonraki<=today();
    const trh=s=>s.split("-").reverse().join(".");
    if(not===2&&vadeli&&k>=1&&ezberSeviye===0){toast("Önce ayeti gizleyip dene");return;}
    if(not===2&&!vadeli){gun();S.puan+=2;logIsle("tekrar",null);save();renderStats();
      toast(`Bugünlük pekiştirdin. Sıradaki tekrar ${trh(p.sonraki)} tarihinde`);}
    else{
      /* günü gelmiş tekrar günlük sınıra sayılır (ilk öğrenme sayılmaz) */
      if(k>=0&&p.sonraki&&p.sonraki<=today())tekrarSayIsle();
      /* Hatırladım: bir kutu ileri. Zorlandım: kutu yerinde, yarın yeniden. Hatırlamadım: baştan */
      if(not===2)k=Math.min(AR.length-1,k+1);else if(not===0)k=0;else k=Math.max(0,k);
      const tam=not===2&&(k>=EZ_TAM_KUTU||!!p.tam);
      /* unutulan ayetin onayı silinir; yeniden ezberde sayılınca onay yeniden istenir */
      const onaylandi=not===2?p.onaylandi:undefined;
      const bekle=tam&&onayGerek()&&!onaylandi;
      const zayif=not===1&&k>=EZ_TAM_KUTU;
      /* ara dinletme: ayet ilk kez 3 günlük aralığa geçince */
      const dinlet=!!p.dinletBekle||(not===2&&k===EZ_DINLET_KUTU&&p.kutu<k&&!p.dinletti&&!onaylandi&&onayGerek());
      const sonraki=gunEkle(not===2?AR[k]:1);
      D[i]={kutu:k,sonraki,...(tam?{tam:true}:{}),...(bekle?{onayBekle:true}:{}),...(onaylandi?{onaylandi}:{}),...(zayif?{zayif:true}:{}),...(p.dinletti?{dinletti:p.dinletti}:{}),...(dinlet?{dinletBekle:true}:{})};
      if(bekle&&!p.onayBekle)setTimeout(()=>toast("Bu ayeti ezberledin gibi! Annene ya da babana oku, onaylasınlar"),900);
      else if(dinlet&&!p.dinletBekle)setTimeout(()=>toast("Bugün bu ayeti annene ya da babana oku"),900);
      gun();S.puan+=vadeli?(not===2?10:5):2;if(vadeli){gorevIsle("tekrar");hedefIsle("tekrar");}logIsle("tekrar",not<2?{zor:{s:CUR.no,a:ilk+i}}:null);checkBadges();save();renderStats();
      toast(not===2?`Güzel! ${AR[k]} gün sonra, ${trh(sonraki)} tarihinde yeniden sorulacak`:not===1?`Olsun, yarın (${trh(sonraki)}) yeniden çalışalım; basamağın yerinde kaldı`:`Baştan alıyoruz; yarın (${trh(sonraki)}) yeniden sorulacak`);}
    const due=tumTekrarlar().filter(x=>x.id===CUR.no&&x.i!==i&&D[x.i]).map(x=>x.i);
    if(due.length){ezberAyet=due[0];ezberSeviye=Math.min(4,(D[due[0]].kutu||0)+1);}else ezberAyet=null;
    if(!due.length&&TEKRAR_AKIS){tekrarAkisi(CUR.no);return;}
    ezber();
  });
}

/* ---------- kitap sınavı ---------- */
let sinavKisim=null;
function sinav(){
  const V=$("view"),Sn=CUR.ek.sinav,R=ekS("sinav");
  if(sinavKisim!==null){
    const havuz=sinavKisim===0?shuffle(Sn.sorular).slice(0,20):shuffle(Sn.sorular.filter(q=>q.kisim===sinavKisim));
    const ad=sinavKisim===0?"Karışık sınav":`${sinavKisim}. kısım · ${Sn.kisimlar.find(k=>k.no===sinavKisim).ad}`;
    const k=sinavKisim;sinavKisim=null;
    quiz({title:ad,items:havuz,build:q=>({html:`<p class="yazi-4 kalin">${esc(q.q)}</p>`,answer:q.a,opts:shuffle(q.o),tek:true,aciklama:q.aciklama}),
      bitince:(d,n)=>{if(k){R[k]=Math.max(R[k]||0,Math.round(d/n*100));checkBadges();save();}},geri:()=>sinav()});
    return;
  }
  V.innerHTML=`<h2>Kitap sınavı</h2><p>${esc(CUR.ad)} kitabınızdaki ${Sn.sorular.length} soru, kitabın on kısmına göre ayrıldı. Bir kısım seç ya da karışık 20 soruyla sına. Her sorudan sonra kitaptaki kısa açıklama gösterilir.</p>
  <button class="primary" data-k="0">Karışık 20 soru</button>
  <div class="sure-grid">${Sn.kisimlar.map(k=>{const n=Sn.sorular.filter(q=>q.kisim===k.no).length,b=R[k.no];
    return `<button class="sure-kart ${(b||0)>=80?"tam":""}" data-k="${k.no}"><span class="ust"><span class="sno">${k.no}. kısım</span><span class="yild"><b>${b!==undefined?"%"+b:""}</b></span></span><span class="sad">${esc(k.ad)}</span><span class="sbilgi">Bölüm ${esc(k.bolumler)} · ${n} soru</span></button>`;}).join("")}</div>
  <p class="kucuk-yazi">Bir kısımdaki en iyi sonucun saklanır. On kısımda da %80'i geçince rozet kazanırsın.</p>`;
  V.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{sinavKisim=+b.dataset.k;sinav();});
}

/* ---------- 30 günlük yol ---------- */
function yol(){
  const V=$("view"),Y=CUR.ek.yol,T=ekS("yol");T.gunler=T.gunler||[];T.plan=T.plan||{};T.kontrol=T.kontrol||{};
  const sira=Y.gunler.find(g=>!T.gunler.includes(g.gun));
  const hafta=g=>g<=28?Math.floor((g-1)/7):Math.min(4,Y.haftalar.length-1);
  const d=new Date();const yilBas=new Date(d.getFullYear(),0,1);const hft=d.getFullYear()+"-H"+Math.ceil(((d-yilBas)/864e5+yilBas.getDay()+1)/7);
  const anahtar=i=>i===0?today():i===1?hft:i===2?today().slice(0,7):"genel";
  V.innerHTML=`<h2>30 günlük yol</h2><p>${esc(Y.giris)}</p>
  <div class="bar"><i style="width:${T.gunler.length/30*100}%"></i></div><p><b>${T.gunler.length} / 30 gün tamam</b></p>
  ${sira?`<div class="odak"><b>Sıradaki gün: ${sira.gun}. gün · ${esc(sira.baslik)}</b><br>${esc(sira.gorev)}<br><button class="ust-2 primary" data-g="${sira.gun}">Bugünkü görevi yaptım (+15 puan)</button></div>`:`<div class="odak"><b>Otuz günü tamamladın. Tebrikler!</b></div>`}
  ${Y.haftalar.map((h,hi)=>`<div class="bolum"><h3>${esc(h.ad)}${h.odak?" · "+esc(h.odak):""}</h3>${Y.gunler.filter(g=>hafta(g.gun)===hi).map(g=>{const ok=T.gunler.includes(g.gun);
    return `<label class="${ok?"done":""}" style="display:grid;grid-template-columns:auto auto 1fr;gap:10px;border:2px solid ${ok?"var(--ok)":"var(--line)"};background:${ok?"var(--ok-bg)":"transparent"};border-radius:12px;padding:10px"><input type="checkbox" data-g="${g.gun}" ${ok?"checked disabled":""} class="gen22 yuk22"><span class="kalin renk-vurgu gun">${g.gun}. gün</span><span><b>${esc(g.baslik)}</b>${g.ayet?` · ${esc(String(g.ayet))}. ayet`:""}<br>${esc(g.gorev)}</span></label>`;}).join("")}</div>`).join("")}
  <h2>Kontrol listeleri</h2>
  ${Y.kontrol_listeleri.map((l,li)=>{const k=anahtar(li);const st=(T.kontrol[li]&&T.kontrol[li].k===k)?T.kontrol[li].v:{};
    return `<div class="bolum"><h3>${esc(l.ad)}</h3>${l.maddeler.map((m,mi)=>`<label style="display:flex;gap:10px;align-items:flex-start;padding:6px 0"><input type="checkbox" data-l="${li}" data-m="${mi}" ${st[mi]?"checked":""} style="width:22px;height:22px;accent-color:var(--ok)"><span>${esc(m)}</span></label>`).join("")}</div>`;}).join("")}
  <p class="kucuk-yazi">Günlük liste her gün, haftalık liste her hafta, aylık liste her ay kendiliğinden boşalır.</p>
  <h2>Kişisel eylem planım</h2><p class="kucuk-yazi">Yazdıkların yalnız sana görünür ve kendiliğinden kaydedilir.</p>
  ${Y.eylem_plani.map((p,pi)=>`<label class="izgara ara-1"><b>${esc(p.soru)}</b>${p.ornek?`<span class="kucuk-yazi">Örnek: ${esc(p.ornek)}</span>`:""}<textarea id="ep${pi}" data-p="${pi}" rows="2" class="dikey-boyut ara" aria-label="${esc(p.soru)}">${esc(T.plan[pi]||"")}</textarea></label>`).join("")}
  <h2>Beklenen davranış değişimleri</h2><ul class="m0 liste-ic">${Y.davranis_degisimleri.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`;
  V.querySelectorAll("[data-g]").forEach(b=>{const f=()=>{const g=+b.dataset.g;if(T.gunler.includes(g))return;T.gunler.push(g);gun();S.puan+=15;toast(g+". gün tamam, 15 puan");checkBadges();save();renderStats();yol();};
    if(b.tagName==="INPUT")b.onchange=()=>{if(b.checked)f();};else b.onclick=f;});
  V.querySelectorAll("[data-l]").forEach(c=>c.onchange=()=>{const li=+c.dataset.l,k=anahtar(li);if(!T.kontrol[li]||T.kontrol[li].k!==k)T.kontrol[li]={k,v:{}};
    T.kontrol[li].v[c.dataset.m]=c.checked;const pg=T.kontrol[li].p=T.kontrol[li].p||{};if(c.checked&&pg[c.dataset.m]!==today()){pg[c.dataset.m]=today();S.puan+=2;renderStats();}save();});
  V.querySelectorAll("[data-p]").forEach(t=>t.oninput=()=>{T.plan[t.dataset.p]=t.value;yaziKaydet();});
}

/* ---------- sayılar ---------- */
function sayilar(){
  const V=$("view"),Y=CUR.ek.sayilar;
  V.innerHTML=`<h2>Sayılar ve örüntüler</h2><p>${esc(Y.giris)}</p>
  <div class="sure-grid">${Y.sayilar.map(s=>`<div class="sinir kose-2 imlec-ok sure-kart"><span class="sno">${esc(s.baslik)}</span><span class="sad" style="font-size:30px;color:var(--lapis)">${esc(s.deger)}</span><span class="sbilgi">${esc(s.aciklama)}</span></div>`).join("")}</div>
  <h2>Tekrar eden kökler ve kelimeler</h2>
  ${Y.kokler.map(k=>`<div class="read-ayet"><p><b class="yazi-4 renk-vurgu">${esc(k.kok)}</b> · <b>${k.adet} kez</b>${k.ayetler&&k.ayetler.length?` · ${k.ayetler.join(", ")}. ayet`:""}</p><p>${esc(k.anlam)}</p><div class="ltr anlamlar">${k.kelimeler.map(w=>`<span class="k1">${esc(w)}</span>`).join("")}</div></div>`).join("")}
  ${Y.uyari?`<p class="kucuk-yazi"><b>Not:</b> ${esc(Y.uyari)}</p>`:""}
  <button class="primary" id="sayiOyun">Sayı yarışmasına başla</button>`;
  $("sayiOyun").onclick=()=>quiz({title:"Sayı yarışması",items:shuffle(Y.sorular),build:q=>({html:`<p class="yazi-4 kalin">${esc(q.q)}</p>`,answer:q.a,opts:shuffle(q.o),tek:true}),geri:()=>sayilar()});
}

/* ---------- düşünme ---------- */
let dusunKart=null,dusunAlt="kart";
function dusun(){
  const V=$("view"),Y=CUR.ek.dusun,T=ekS("dusun");
  const gunNo=Math.floor((new Date()-new Date(new Date().getFullYear(),0,0))/864e5);
  if(dusunKart===null)dusunKart=gunNo%Y.kartlar.length;
  const alt=[["kart","Günün kartı"],["yazdiklarim","Yazdıklarım"],["yontem","Düşünme yöntemleri"],["durum","Durum çözümlemesi"]];
  V.innerHTML=`<h2>Düşünme</h2><p>${esc(Y.giris)}</p><div class="subtabs">${alt.map(([k,a])=>`<button data-a="${k}" class="${dusunAlt===k?"on":""}">${a}</button>`).join("")}</div><div id="dalt" class="izgara ara-3"></div>`;
  V.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{dusunAlt=b.dataset.a;dusun();});
  const el=$("dalt");
  if(dusunAlt==="kart"){const k=Y.kartlar[dusunKart];const c=T[k.id];
    el.innerHTML=`<div class="detay"><p class="kucuk-yazi"><b>Kart ${dusunKart+1} / ${Y.kartlar.length}</b>${k.ayet?` · ${esc(String(k.ayet))}. ayet`:""}</p><p class="yazi-4 kalin">${esc(k.soru)}</p>${k.ipucu?`<p><b>Düşünme yönü:</b> ${esc(k.ipucu)}</p>`:""}</div>
    <label class="izgara ara-1"><b>Cevabım</b><textarea id="dcvp" class="dikey-boyut ara" rows="5" placeholder="Aklından geçenleri yaz. Yalnız sana görünür.">${esc(c?c.metin:"")}</textarea></label>
    <div class="esnek ara-2 sarmal"><button class="primary" id="dkay">Kaydet</button><button id="dbas">Başka kart</button></div>${c?`<p class="kucuk-yazi">Son kayıt: ${esc(c.t)}</p>`:""}`;
    $("dkay").onclick=()=>{const m=$("dcvp").value.trim();if(!m){toast("Önce bir şey yaz");return;}const yeni=!T[k.id];T[k.id]={t:new Date().toLocaleDateString("tr-TR"),metin:m};gun();if(yeni){S.puan+=10;}checkBadges();save();renderStats();toast(yeni?"Kaydedildi, 10 puan":"Kaydedildi");dusun();};
    $("dbas").onclick=()=>{let n=dusunKart;while(n===dusunKart&&Y.kartlar.length>1)n=Math.floor(Math.random()*Y.kartlar.length);dusunKart=n;dusun();};
  }else if(dusunAlt==="yazdiklarim"){const ids=Object.keys(T);
    el.innerHTML=ids.length?ids.map(id=>{const k=Y.kartlar.find(x=>x.id===id);return k?`<div class="read-ayet"><p><b>${esc(k.soru)}</b></p><p>${esc(T[id].metin)}</p><p class="kucuk-yazi">${esc(T[id].t)} · <button data-ac="${id}" class="dokun44 dar">Aç ve düzenle</button></p></div>`:"";}).join(""):"<p>Henüz bir karta cevap yazmadın. “Günün kartı”ndan başlayabilirsin.</p>";
    el.querySelectorAll("[data-ac]").forEach(b=>b.onclick=()=>{dusunKart=Y.kartlar.findIndex(x=>x.id===b.dataset.ac);dusunAlt="kart";dusun();});
  }else if(dusunAlt==="yontem"||dusunAlt==="durum"){
    const D2=CUR.ek.dusun2,liste=dusunAlt==="yontem"?D2.yontemler:D2.durum;
    el.innerHTML=`<p>${dusunAlt==="yontem"?"Kitabınızda her düşünme yöntemi ${esc(CUR.ad)} suresinin ayetleri üzerinde uygulanarak anlatılıyor. Önce kitaptaki örneği oku, sonra aynı yöntemi bir ayete kendin uygula.":"Kitabınızda durum tabloları Fâtiha ilkelerini benimseyen bir insan ve toplum için doldurulmuş. Önce kitaptaki tabloyu incele, sonra kendi tablonu doldur."}</p>`+
      liste.map((y,yi)=>`<button class="oz" data-yo="${yi}"><span class="no">${esc(y.id)}</span><span>${esc(y.ad||y.baslik)}${y.ayetler&&y.ayetler.length?` <span class="kucuk-yazi renk-vurgu">· ${y.ayetler.join(", ")}. ayet</span>`:""}</span><span class="durum">${dusunDolu(y.id)?"Uyguladım":""}</span></button><div id="yo${yi}" hidden></div>`).join("");
    el.querySelectorAll("[data-yo]").forEach(b=>b.onclick=()=>{const yi=+b.dataset.yo,box=$("yo"+yi);if(!box.hidden){box.hidden=true;return;}box.hidden=false;box.className="detay pop";dusunYontemCiz(box,liste[yi]);});
  }
}
function dusunDolu(id){const U=((SS(CUR.no).yontemUyg)||{})[id];return U&&Object.values(U).some(a=>Object.values(a).some(v=>v&&v.trim()));}
function tabloCiz(t){if(!t||!t.satirlar||!t.satirlar.length)return "";
  return `<div class="yatay-kaydir"><table style="border-collapse:collapse;width:100%;min-width:${Math.min(720,t.sutunlar.length*170)}px">${t.baslik?`<caption style="text-align:left;font-weight:800;padding:4px 0">${esc(t.baslik)}</caption>`:""}
  <thead><tr>${t.sutunlar.map(h=>`<th style="text-align:left;border-bottom:2px solid var(--gold);padding:6px">${esc(h)}</th>`).join("")}</tr></thead>
  <tbody>${t.satirlar.map(r=>`<tr class="alt-cizgi ust-hiza">${r.map((c,ci)=>`<td class="ic-2">${ci===0?`<b>${esc(c)}</b>`:esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;}
function ayetGoster(n){const r=ayetBul(n);return r?`<div class="read-ayet" style="background:var(--gold-bg);border-radius:12px;padding:10px"><span class="n-ayet">${n}</span><div class="kelimeler" lang="ar">${r.a.w.map((w,j)=>`<span class="k${j%12}">${w.a}</span>`).join("")}</div><p class="meal">${esc(r.a.meal)}</p></div>`:"";}
function dusunYontemCiz(box,y){
  const U=SS(CUR.no).yontemUyg=SS(CUR.no).yontemUyg||{};U[y.id]=U[y.id]||{};
  const ilk=CUR.ilkAyet||1,son=ilk+CUR.ayetler.length-1;
  let secili=box.dataset.ayet?+box.dataset.ayet:((y.ayetler&&y.ayetler[0])||ilk);
  const p=a=>(a||[]).map(t=>`<p class="satir-17">${esc(t)}</p>`).join("");
  const gruplar=(y.gruplar||[]).length?`<div class="sure-grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">${y.gruplar.map(g=>`<div style="border:2px solid var(--lapis);border-radius:12px;padding:10px;display:grid;gap:4px"><b class="renk-asil">${esc(g.ad)}</b>${g.alt?`<span class="yazi-1 kalin">${esc(g.alt)}</span>`:""}${(g.maddeler||[]).map(m=>`<span>${m.no?`<b class="renk-vurgu">${m.no}.</b> `:""}${esc(m.metin)}${m.ayet?` <b class="yazi-1 renk-vurgu">(${esc(m.ayet)}. ayet)</b>`:""}</span>`).join("")}${g.olasilik!==undefined?`<span class="yazi-1">Olasılık ${esc(String(g.olasilik))} · Etki ${esc(String(g.etki))}</span>`:""}</div>`).join("")}</div>`:"";
  const liste=(y.liste||[]).length?`<div class="izgara ara-2">${y.liste.map((l,li)=>`<div style="border-left:4px solid var(--gold);padding-left:10px"><b>${esc(l.ad)}</b>${l.tur?` <span class="yazi-1 kalin renk-asil">(${esc(l.tur)})</span>`:""}<br>${esc(l.metin||"")}${l.alt&&l.alt.length?`<br><span class="kucuk-yazi">${l.alt.map(esc).join(" · ")}</span>`:""}</div>`).join("")}</div>`:"";
  const ay=[];for(let n=ilk;n<=son;n++)ay.push(n);
  const kayit=U[y.id][secili]||{};
  box.innerHTML=`${y.tanim?`<p><b>${esc(y.tanim)}</b></p>`:""}
  ${(y.ayetler||[]).map(ayetGoster).join("")}
  ${p(y.giris)}${tabloCiz(y.tablo)}${liste}${gruplar}${p(y.sonuc)}
  <div class="izgara ara-2 odak"><b class="yazi-4">Sen uygula</b><span>${esc((y.uygula||{}).yonerge||"Aynı yöntemi bir ayete uygula.")}</span>
   <label class="esnek ara-2 dik-orta sarmal"><b>Ayet:</b><select class="gen-oto ara" data-sec="1">${ay.map(n=>`<option value="${n}" ${n===secili?"selected":""}>${n}. ayet</option>`).join("")}</select></label>
   ${ayetGoster(secili)}
   ${((y.uygula||{}).alanlar||["Düşüncelerim"]).map((a,ai)=>`<label class="izgara ara-1"><b>${esc(a)}</b><textarea class="dikey-boyut ara" rows="2" data-al="${ai}">${esc(kayit[ai]||"")}</textarea></label>`).join("")}
   <span class="kucuk-yazi">Yazdıkların kendiliğinden kaydedilir ve yalnız sana görünür. Her yöntemi ilk uyguladığında 15 puan.</span></div>`;
  box.querySelector("[data-sec]").onchange=e=>{box.dataset.ayet=e.target.value;dusunYontemCiz(box,y);};
  box.querySelectorAll("[data-al]").forEach(t=>t.oninput=()=>{const ilkKez=!dusunDolu(y.id);U[y.id][secili]=U[y.id][secili]||{};U[y.id][secili][t.dataset.al]=t.value;
    if(ilkKez&&t.value.trim().length>5){gun();S.puan+=15;renderStats();toast("Yöntemi uyguladın, 15 puan");checkBadges();}yaziKaydet();});
}

/* ---------- çocuklar için ---------- */
function cocuk(){
  const V=$("view"),C=CUR.ek.cocuk,A=CUR.ayetler;
  V.innerHTML=`<div class="izgara ara-4 cocuk">
  <h2 class="yazi-5">Çocuklar için ${esc(CUR.ad)}</h2>${aileKarti()}<p>${esc(C.giris)}${C.yas?` <b>(${esc(C.yas)})</b>`:""}</p>
  ${C.ayetler.filter(x=>A[x.ayet-(CUR.ilkAyet||1)]).map(x=>{const i=x.ayet-(CUR.ilkAyet||1),a=A[i];return `<div class="ara-2 read-ayet"><div class="esnek iki-yana dik-orta ara-2"><span class="n-ayet" style="width:40px;height:40px;font-size:18px">${x.ayet}</span><button class="yazi-4 dn" data-s="${i}">▶ Dinle</button></div>
    <div class="yatay-orta kelimeler" lang="ar">${a.w.map((w,j)=>`<span class="k${j%12}" style="font-size:36px">${w.a}</span>`).join("")}</div>
    <p class="yazi-4 kalin-7">${esc(x.cocuk_anlatim)}</p>
    ${x.soru?`<p class="yazi-4"><b>Soru:</b> ${esc(x.soru)}</p>`:""}${x.etkinlik?`<p class="yazi-3"><b>Etkinlik:</b> ${esc(x.etkinlik)}</p>`:""}</div>`;}).join("")}
  ${C.hikaye&&C.hikaye.metin?`<h2 class="yazi-5">${esc(C.hikaye.baslik||"Hikâye")}</h2>${CUR.anim?`<button class="yazi-4 dokun56 primary" id="animBasla">${ikon("clapperboard")} Hikâyeyi canlandır</button>`:""}${C.hikaye.metin.split("\n").filter(Boolean).map(p=>`<p class="yazi-4">${esc(p)}</p>`).join("")}`:""}
  <h2 class="yazi-5">Etkinlikler</h2>${(C.etkinlikler||[]).map(e=>`<div class="read-ayet"><p class="yazi-4"><b>${esc(e.ad||e.soz||"")}</b></p><p class="yazi-4">${esc(e.nasil||e.metin||[e.cocuga,e.birlikte].filter(Boolean).join(" · ")||"")}</p></div>`).join("")}
  <button class="yazi-4 dokun56 primary" id="cOyun">Oyun oyna</button></div>`;
  V.querySelectorAll(".dn").forEach(b=>b.onclick=()=>{const i=+b.dataset.s,bs=CUR.ses.bas,e=i+1<bs.length?bs[i+1]:CUR.ses.son;hizUygula();calParca(CUR.no,bs[i],e);});
  const ab=$("animBasla");if(ab)ab.onclick=()=>{animAc(CUR.anim);window.scrollTo({top:0});};
  $("cOyun").onclick=()=>quiz({title:"Çocuk oyunu",items:shuffle(C.oyun_sorulari.filter(q=>!q.ebeveyn)).slice(0,sv().soru),
    build:q=>({html:q.ar?`<p class="yazi-4 kalin">Bu kelime ne demek?</p><div class="qbig ar" lang="ar">${esc(q.ar)}</div>`:`<p class="yazi-5 kalin">${esc(q.q)}</p>`,answer:q.a,opts:shuffle(q.o),tek:true,buyuk:true,aciklama:q.uzun&&q.uzun!==q.a?q.uzun:""}),geri:()=>cocuk()});
}

BADGES.push(...ekRozet().map(([i,a])=>[i,a,()=>{const r=ekRozet().find(x=>x[0]===i);return r?r[2]():false;}]));
