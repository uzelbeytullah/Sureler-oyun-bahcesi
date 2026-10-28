/* Sureler Oyun Bahçesi · Yıldızlar, Oku, oyun çatısı (quiz), kelime, tamamla, bilgi, sırala */
/* ---------- yıldızlar ---------- */
/* Secde (tilâvet secdesi) ayetleri: sure no → ayet no */
const SECDE_AYET={84:21,96:19};
function harita(){
  const t=SS(CUR.no),V=$("view");
  V.innerHTML=`<h2>${esc(CUR.ad)} · yıldızların</h2>
  <p>${esc(CUR.konu||"")}</p>
  <div class="stars">${STAR_GAMES.map(k=>`<button class="star ${t.yildiz[k]?"got":""}" data-g="${k}"><div class="s" aria-hidden="true">★</div>${STAR_NAMES[k]}<span class="gorunmez">${t.yildiz[k]?" · yıldız kazanıldı":" · yıldız henüz kazanılmadı"}</span></button>`).join("")}</div>
  <p>Yıldızlar için: Oku bölümünde bütün ayetleri işaretle; kelime ve tamamlama oyunlarında en az %80 doğru yap; ayetleri doğru sıraya diz. Bilgi yarışması ve Kur'an insanı bölümleri puan ve rozet kazandırır.</p>`;
  V.querySelectorAll(".star").forEach(b=>b.onclick=()=>show(b.dataset.g));
  if(USR_EDIT&&CUR.ayetler.flatMap(a=>a.w).length>=6){const d=document.createElement("div");d.innerHTML=`<section class="detay"><h3>${ikon("trophy")} Aile yarışması</h3><p>Bu surenin kelimelerinden 8 soruluk canlı bir yarışma aç. Bu ekranı herkesin göreceği yere koy; aile üyeleri kendi telefonlarından katılıp cevap verir.</p><button class="primary" id="yarAcB">Yarışma aç</button></section>`;V.appendChild(d);$("yarAcB").onclick=()=>yarAc();}
}

/* ---------- oku ---------- */
function oku(){
  const V=$("view"),A=CUR.ayetler,no=CUR.no,bas=CUR.ses.bas,son=CUR.ses.son;
  const alanIdx={};CUR.alanlar.forEach((a,i)=>alanIdx[a.id]=i%12);
  const renkler=ws=>{const r=[];ws.forEach((w,j)=>{let c=alanIdx[w.alan]??0;if(j>0&&c===r[j-1]){c=(c+6)%12;if(c===r[j-1])c=(c+1)%12;}r.push(c);});return r;};
  const kelimeHtml=(ws,tik)=>{const r=renkler(ws);return [ws.map((w,j)=>`<span class="k${r[j]}"${tik?' role="button" tabindex="0"':""}>${w.a}</span>`).join(""),ws.map((w,j)=>`<span class="k${r[j]}">${esc(w.tr)}</span>`).join("")];};
  const besmeleVar=no!==1&&!CUR.etiket&&(!CUR.ust||CUR.ilkAyet===1);
  const tecvidMod=!!(CUR.tecvid&&TKUR&&S.renkModu==="tecvid");
  const ilk=CUR.ilkAyet||1;
  const k1=kucuk();/* küçüklerde dinle düğmesi en üstte, ayarlar katlanır */
  const dinleSatir=`<div class="esnek ara-2 sarmal dik-orta"><button class="primary${k1?" dinle-buyuk":""}" id="hepsi">${ikon("play")} Baştan sona dinle</button><span class="kucuk-yazi kalin-7">Okuyan: Mişari Râşid el-Afasi</span>${indirVar()?`<button id="indir" class="dokun44">${ikon("download")} İnternetsiz dinlemek için indir</button>`:""}</div>`;
  V.innerHTML=`<h2>${esc(CUR.ad)} suresini oku</h2>
  ${k1?dinleSatir+`<details class="oku-ayar"><summary>Ayarlar</summary>`:""}
  <p><b>Arapça bir kelimeye dokununca okunuşunu dinlersin.</b> Her kelime anlam alanının rengiyle yazıldı; altındaki aynı renkli kutu o kelimenin anlamıdır. Aynı alandan iki kelime yan yana gelince, ayırt edilsin diye ikincisi başka renkle yazılır. Her ayeti okuyunca işaretle; hepsi bitince yıldızı alırsın.</p>
  ${CUR.tecvid&&TKUR?`<div class="subtabs" role="group" aria-label="Renklendirme"><b style="align-self:center;font-size:14px">Renkler:</b><button data-rm="alan" class="${S.renkModu!=="tecvid"?"on":""}" aria-pressed="${S.renkModu!=="tecvid"}">Anlam alanları</button><button data-rm="tecvid" class="${S.renkModu==="tecvid"?"on":""}" aria-pressed="${S.renkModu==="tecvid"}">Tecvid kuralları</button></div>`:""}
  ${tecvidMod?tecvidLejant():`<div class="lejant">${CUR.alanlar.map((a,i)=>`<span class="k${i%12}">${esc(a.ad)}</span>`).join("")}</div>`}
  ${k1?"":dinleSatir}
  <div class="esnek ara-2 sarmal dik-orta" role="group" aria-label="Okuma hızı"><b class="kucuk-yazi">Hız:</b>${HIZLAR.map(h=>`<button class="dokun44 dar hz ${hiz()===h?"on":""}" data-h="${h}" aria-pressed="${hiz()===h}">${h.toFixed(2).replace(".",",")}</button>`).join("")}</div>
  <div class="esnek ara-2 sarmal dik-orta" role="group" aria-label="Ayet tekrar sayısı"><b class="kucuk-yazi">Her ayeti tekrarla:</b>${[1,2,3,7].map(t=>`<button class="dokun44 dar tk ${tekrar()===t?"on":""}" data-t="${t}" aria-pressed="${tekrar()===t}">${t} kez</button>`).join("")}</div>
  <div class="esnek ara-2 sarmal dik-orta"><button id="basaDon" class="dokun44 ${S.basaDon?"on":""}" aria-pressed="${!!S.basaDon}">${S.basaDon?"↻ Bitince başa dön: açık":"↻ Bitince başa dön: kapalı"}</button><b id="tkr" class="kucuk-yazi renk-asil"></b></div>${k1?"</details>":""}
  <p class="istiaze m0" style="text-align:center"><b>Okumaya Eûzü besmele ile başlarız:</b> Eûzü billâhi mine’ş-şeytâni’r-racîm.</p>
  ${besmeleVar?`<div class="besmele"><div class="ar" lang="ar" dir="rtl">${BESMELE}</div><button class="dn" data-s="b">${ikon("play")} Besmele'yi dinle</button></div>`:""}
  ${A.map((a,i)=>`<div class="read-ayet" id="ay${i}"><div class="esnek iki-yana dik-orta ara-2 sarmal"><span class="esnek ara-2 dik-orta"><span class="n-ayet">${ilk+i}</span><span class="ozet">${esc(a.oz)}</span></span><span class="esnek ara-2">${CUR.ek&&CUR.ek.aciklama?`<button data-acl="${i}" class="acl" aria-label="${ilk+i}. ayetin açıklaması">Açıklama</button>`:""}<button data-s="${i}" class="dn" aria-label="${ilk+i}. ayeti dinle">${ikon("play")} Dinle</button><button data-i="${i}" class="rd">Okudum</button></span></div>
  <div class="kelimeler" lang="ar" dir="rtl" data-ai="${i}">${tecvidMod?a.w.map((w,j)=>`<span class="tw">${tecvidKelime(i,j)}</span>`).join(""):kelimeHtml(a.w,true)[0]}<span class="n-ar">﴿${arNum(ilk+i)}﴾</span>${SECDE_AYET[CUR.no]===ilk+i?`<span class="secde" role="img" aria-label="Secde ayeti">۩</span>`:""}</div>
  <div class="anlamlar">${kelimeHtml(a.w)[1]}</div><div id="tv${i}" hidden></div><div id="acp${i}" hidden></div>
  <div class="okunus">${esc(a.ok)}</div>${SECDE_AYET[CUR.no]===ilk+i?`<p class="kucuk-yazi odak"><b>۩ Secde ayeti:</b> Bu ayeti okuyan ve dinleyen secde eder.</p>`:""}<p class="meal">${kucuk()&&cocukAnlatim(ilk+i)?`<b class="renk-vurgu">${ikon("smile")}</b> ${esc(cocukAnlatim(ilk+i))}`:esc(a.meal)}</p></div>`).join("")}
  ${CUR.cumleler?`<h2>Cümle cümle</h2>${CUR.cumleler.map((c,ci)=>`<div class="read-ayet cumle" id="cm${ci}"><div class="esnek iki-yana dik-orta ara-2 sarmal"><span class="n-ayet">${ci+1}</span><span class="esnek ara-2"><button data-c="${ci}" class="dnc" aria-label="${ci+1}. cümleyi dinle">${ikon("play")} Dinle</button><button data-ci="${ci}" class="rdc">Okudum</button></span></div><div class="kelimeler" lang="ar" dir="rtl" data-ai="0">${tecvidMod?A[0].w.slice(c.bas,c.son).map((w,jj)=>`<span class="tw">${tecvidKelime(0,c.bas+jj)}</span>`).join(""):kelimeHtml(A[0].w.slice(c.bas,c.son))[0]}</div><div class="anlamlar">${kelimeHtml(A[0].w.slice(c.bas,c.son))[1]}</div><div class="okunus">${esc(c.ok)}</div><p class="meal">${esc(c.meal)}</p></div>`).join("")}`:""}`;
  let sira=false,calan=null;
  const dug=[...V.querySelectorAll(".dn")];
  const guncelle=()=>{dug.forEach(b=>{const on=String(calan)===b.dataset.s;b.innerHTML=on?ikon("pause")+" Durdur":(b.dataset.s==="b"?ikon("play")+" Besmele'yi dinle":ikon("play")+" Dinle");b.classList.toggle("on",on);if(b.dataset.s!=="b")b.setAttribute("aria-label",`${ilk+(+b.dataset.s)}. ayeti ${on?"durdur":"dinle"}`);});
    $("hepsi").innerHTML=sira?ikon("pause")+" Durdur":ikon("play")+" Baştan sona dinle";
    V.querySelectorAll(".read-ayet:not(.cumle)").forEach((d,j)=>d.style.background=calan===j?"var(--gold-bg)":"");
    V.querySelectorAll(".cumle").forEach((d,j)=>d.style.background=calanC===j?"var(--gold-bg)":"");
    V.querySelectorAll(".dnc").forEach(b=>{const on=+b.dataset.c===calanC&&!sira;b.innerHTML=on?ikon("pause")+" Durdur":ikon("play")+" Dinle";b.classList.toggle("on",on);b.setAttribute("aria-label",`${+b.dataset.c+1}. cümleyi ${on?"durdur":"dinle"}`);});};
  let calanC=null;
  const bitir=()=>{calan=null;calanC=null;sira=false;guncelle();};
  const tkYaz=(ad,n)=>{const el=$("tkr");if(el)el.textContent=tekrar()>1&&ad?`${ad} · ${tekrar()-n}/${tekrar()}. okuyuş`:"";};
  function cal(j,kalan){
    if(kalan===undefined)kalan=tekrar()-1;
    calan=j;guncelle();tkYaz(j==="b"?"Besmele":(ilk+j)+". ayet",kalan);
    const tekrarla=(hata)=>{if(hata){tkYaz("",0);return bitir();}if(!sira&&kalan>0&&String(calan)===String(j)){cal(j,kalan-1);return true;}return false;};
    if(j==="b"){ const f1=CACHE[1]&&CACHE[1].ses?CACHE[1].ses.bas[1]:4.0; calParca(1,0,f1,(hata)=>{if(tekrarla(hata)!==false)return;if(!sira){tkYaz("",0);return bitir();}cal(0);}); return;}
    if(sira)$("ay"+j).scrollIntoView({block:"center",behavior:kaydirmaDavranisi()});
    const e=j+1<bas.length?bas[j+1]:son;
    calParca(no,bas[j],e,(hata)=>{if(tekrarla(hata)!==false)return;tkYaz("",0);bitir();});
  }
  dug.forEach(b=>b.onclick=()=>{const k=b.dataset.s==="b"?"b":+b.dataset.s;if(String(calan)===String(k)){durSes();bitir();return;}sira=false;cal(k);});
  V.querySelectorAll(".tk").forEach(b=>b.onclick=()=>{S.tekrar=+b.dataset.t;save();V.querySelectorAll(".tk").forEach(x=>{x.classList.toggle("on",x===b);x.setAttribute("aria-pressed",String(x===b));});});
  $("basaDon").onclick=()=>{S.basaDon=!S.basaDon;save();$("basaDon").classList.toggle("on",!!S.basaDon);$("basaDon").setAttribute("aria-pressed",String(!!S.basaDon));$("basaDon").textContent=S.basaDon?"↻ Bitince başa dön: açık":"↻ Bitince başa dön: kapalı";};
  V.querySelectorAll(".acl").forEach(b=>b.onclick=()=>aciklamaAc(+b.dataset.acl));
  V.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{S.renkModu=b.dataset.rm;save();durSes();oku();});
  V.querySelectorAll(".kelimeler[data-ai] [data-c]").forEach(sp=>{sp.style.cursor="pointer";sp.onclick=()=>tecvidAc(V,+sp.closest(".kelimeler").dataset.ai,sp.dataset.c);});
  V.querySelectorAll(".hz").forEach(b=>b.onclick=()=>{S.hiz=+b.dataset.h;hizUygula();save();V.querySelectorAll(".hz").forEach(x=>{x.classList.toggle("on",x===b);x.setAttribute("aria-pressed",String(x===b));});});
  const sureSrc="ses/"+String(no).padStart(3,"0")+".mp3?v="+SURUM;
  {const ib=$("indir");if(ib){const no=CUR.no,yaz=v=>{ib.innerHTML=v?ikon("check")+" İnternetsiz dinlenebilir · kaldır":ikon("download")+" İnternetsiz dinlemek için indir";ib.dataset.var=v?"1":"";delete ib.dataset.onay;};
    sesIndirildi(no).then(yaz);
    ib.onclick=async()=>{if(ib.dataset.var){if(!ib.dataset.onay){ib.dataset.onay="1";ib.textContent="Emin misin? Bir daha bas";return;}await sesSil(no);yaz(false);toast("İndirilen ses kaldırıldı");return;}
      ib.disabled=true;ib.textContent="İndiriliyor…";try{await sesIndir(no);yaz(true);toast("Bu sure artık internetsiz de dinlenebilir");}catch(e){yaz(false);toast("İndirilemedi; bağlantıyı denetle");}ib.disabled=false;};}}
  $("hepsi").onclick=async()=>{
    if(sira){durSes();bitir();return;}
    durSes();sira=true;calan=besmeleVar?"b":0;guncelle();
    await metaBekle(ses,sureSrc);if(!sira)return;hizUygula();ses.currentTime=bas[0];
    const basla=()=>{if(!sira)return;
      let kalan=tekrar()-1;
      izle=tm=>{let j=0;while(j+1<bas.length&&tm>=bas[j+1]-0.02)j++;
        if(calan!=="b"&&calan!==null&&j===calan+1&&kalan>0){kalan--;ses.currentTime=bas[calan];sayac();return;}
        if(j!==calan){calan=j;kalan=tekrar()-1;guncelle();sayac();$("ay"+j).scrollIntoView({block:"center",behavior:kaydirmaDavranisi()});}
        if(CUR.cumleler){const C=CUR.cumleler;let c=0;while(c+1<C.length&&tm>=C[c+1].t-0.02)c++;if(c!==calanC){calanC=c;guncelle();}}};
      const sayac=()=>{const el=$("tkr");if(el)el.textContent=tekrar()>1&&calan!==null&&calan!=="b"?`${calan+ilk}. ayet · ${tekrar()-kalan}/${tekrar()}. okuyuş`:"";};
      const sonda=()=>{if(!sira)return;
        if(kalan>0){kalan--;sayac();ses.currentTime=bas[bas.length-1];ses.play().catch(()=>{});sesSonra=sonda;return;}
        if(S.basaDon){calan=0;kalan=tekrar()-1;guncelle();sayac();ses.currentTime=bas[0];$("ay0").scrollIntoView({block:"center",behavior:kaydirmaDavranisi()});ses.play().catch(()=>{});sesSonra=sonda;toast("Başa dönüldü");return;}
        izle=null;const el=$("tkr");if(el)el.textContent="";bitir();};
      sesBitis=null;sesSonra=sonda;sayac();
      if(calan!==0){calan=0;guncelle();}$("ay0").scrollIntoView({block:"center",behavior:kaydirmaDavranisi()});
      ses.play().catch(()=>{izle=null;bitir();toast("Ses çalınamadı");});};
    if(besmeleVar){
      await metaBekle(ses2,"ses/001.mp3?v="+SURUM);if(!sira)return;hizUygula();
      const f1=CACHE[1]&&CACHE[1].ses?CACHE[1].ses.bas[1]:4.0;
      ses2.currentTime=0;ses2Bitis=f1;ses2Sonra=basla;
      ses2.play().catch(()=>{bitir();toast("Ses çalınamadı");});
    }else basla();
  };
  V.querySelectorAll(".dnc").forEach(b=>b.onclick=()=>{const c=+b.dataset.c;if(calanC===c&&!sira){durSes();bitir();return;}
    durSes();sira=false;calan=null;calanC=c;guncelle();const C=CUR.cumleler;const e=c+1<C.length?C[c+1].t:son;
    let kalan=tekrar()-1;const bir=()=>{tkYaz((c+1)+". cümle",kalan);calParca(no,C[c].t,e,(h)=>{if(!h&&kalan>0&&calanC===c){kalan--;bir();}else{tkYaz("",0);bitir();}});};bir();});
  const seenC=new Set();
  V.querySelectorAll(".rdc").forEach(b=>b.onclick=()=>{if(seenC.has(b.dataset.ci))return;seenC.add(b.dataset.ci);b.textContent="✓ Okundu";b.classList.add("on");b.disabled=true;
    gun();{const tc=SS(no).cumleGun=SS(no).cumleGun||{};if(tc[b.dataset.ci]!==today()){tc[b.dataset.ci]=today();S.puan+=2;}}save();renderStats();
    if(seenC.size===CUR.cumleler.length){const rb=V.querySelector('.rd[data-i="0"]');if(rb&&!rb.disabled)rb.click();}});
  const t=SS(no);const seen=new Set();
  V.querySelectorAll(".rd").forEach(b=>b.onclick=()=>{if(seen.has(b.dataset.i))return;seen.add(b.dataset.i);b.textContent="✓ Okundu";b.classList.add("on");b.disabled=true;
    if(seen.size===A.length){const ilk=!t.yildiz.oku,bugun=today();let p=0;if(ilk)p=20;else if(t.okuGun!==bugun)p=5;t.okuGun=bugun;giveStar("oku");S.puan+=p;save();renderStats();if(minik()){toast("⭐ Aferin! Sureyi baştan sona dinledin");yonerge("aferin","Aferin!");}else toast(p?`Sureyi baştan sona okudun, ${p} puan`:"Sureyi baştan sona okudun; bugünün okuma puanını almıştın");}});
}

/* ---------- oyun çatısı ---------- */
function quiz({title,items,build,star,need=0.8,bitince,geri}){
  const V=$("view");let i=0,dogru=0,yarim=0,odakla=false;/* yarim: küçüklerde ikinci denemede bilinenler; yıldız oranında yarım sayılır */const ekran=EKRAN_NO;if(star&&items.length>sv().soru)items=items.slice(0,sv().soru);
  const ileri=()=>{i++;odakla=true;step();};
  function step(){
    if(i>=items.length){const oran=(dogru-yarim*0.5)/items.length;if(star&&oran>=need)giveStar(star);if(bitince)bitince(dogru,items.length);
      if(minik()){/* minik: sayı ve yüzde yerine büyük yıldız ve sesli "Aferin!" */V.innerHTML=`<div class="result">${minikYildiz()}<div class="esnek ara-2 sarmal yatay-orta"><button class="primary minik-tekrar" id="again" aria-label="${geri?"Geri dön":"Yeniden oyna"}">${geri?"◀":"↻"}</button></div></div>`;
        yonerge("aferin","Aferin!");$("again").onclick=()=>geri?geri():show(cur);return;}
      V.innerHTML=`<div class="result pop"><h2>${title} bitti</h2><b class="big">${dogru} / ${items.length}</b>
      <p>${!star?"Güzel çalışma.":oran>=need?"Çok güzel, yıldızı hak ettin.":kucuk()?"Bir daha dinleyip deneyelim mi?":"Yıldız için en az %"+Math.round(need*100)+" doğru gerekiyor. Bir daha dene."}</p><div class="esnek ara-2 sarmal yatay-orta"><button class="primary" id="again">${geri?"Geri dön":"Yeniden oyna"}</button></div></div>`;
      $("again").onclick=()=>geri?geri():show(cur);return;}
    const q=build(items[i]);
    V.innerHTML=`<div class="qhead"><span>${title}</span><span>${minik()?"⭐".repeat(dogru):`${i+1} / ${items.length} · Doğru: ${dogru}`}</span></div>
    <div class="bar"><i style="width:${i/items.length*100}%"></i></div><div id="soruMetni" class="izgara ara-4">${q.html}</div>
    <div class="opts ${q.arOpts?"ar-opts":""}" role="group" aria-label="Şıklar" aria-describedby="soruMetni" ${q.tek?'style="grid-template-columns:1fr"':""} ${q.buyuk?'data-buyuk="1"':""}>${q.opts.map((o,j)=>`<button data-j="${j}" ${q.arOpts?'lang="ar" dir="rtl"':""}>${esc(o)}</button>`).join("")}</div><p class="feedback" id="fb" role="status" aria-live="polite"></p>`;
    sesliSoru(q,V);let ikinci=false;
    if(odakla){odakla=false;const ilkSik=V.querySelector(".opts button[data-j]");if(ilkSik)try{ilkSik.focus({preventScroll:true});}catch(e){}}
    V.querySelectorAll(".opts button[data-j]").forEach(b=>b.onclick=()=>{
      const ok=q.opts[+b.dataset.j]===q.answer,k1=kucuk();
      if(!ok&&k1&&CUR&&!ikinci&&q.opts.length>2){/* ikinci hak yalnız sure oyunlarında (Elif-ba kendi akışında) */ikinci=true;b.disabled=true;b.classList.add("soluk");const fb=$("fb");fb.className="feedback dene";fb.textContent="Bir daha dene";yonerge("bir-daha-dene","Bir daha dene");return;}
      V.querySelectorAll(".opts button[data-j]").forEach(x=>{x.disabled=true;if(q.opts[+x.dataset.j]===q.answer)x.classList.add("ok");});
      if(!ok)b.classList.add("bad");if(!ok&&k1)b.classList.add("notr");if(ok){dogru++;if(ikinci)yarim++;}if(q.sonuc)q.sonuc(ok);if(!ok&&!q.sonuc&&q.opts.length>1)yanlisEkle(q);answer(ok);
      const fb=$("fb");fb.className="feedback "+(ok?"ok":"bad")+(!ok&&k1?" notr":"");
      fb.textContent=ok&&minik()?"⭐ Aferin!":ok&&ikinci?"Doğru! İkinci denemede buldun.":ok?(S.ardarda>=3?"Doğru! Art arda "+S.ardarda+" doğru":"Doğru!"):"Doğrusu: "+q.answer;if(ok&&k1)yonerge(minik()?"aferin":"dogru",minik()?"Aferin!":"Doğru!");
      if(q.aciklama){const p=document.createElement("div");p.className="detay";p.innerHTML=`<p>${esc(q.aciklama)}</p><button class="primary" id="devam">Devam</button>`;fb.after(p);$("devam").onclick=ileri;$("devam").focus();}
      else if(!ok){const d=document.createElement("button");d.className="primary"+(k1?" devam-buyuk":"");d.id="devam";d.type="button";d.textContent=k1?"▶ Devam":"Devam ▶";fb.after(d);d.onclick=ileri;try{d.focus({preventScroll:true});}catch(e){}try{d.scrollIntoView({block:"nearest",behavior:kaydirmaDavranisi()});}catch(e){}
        if(k1){const ek="Devam etmek için oka dokun";if(q.arOpts){const w=kelimeBul(q.answer);if(w&&kelimeSes(w))setTimeout(()=>{if(d.isConnected&&KEL.paused)yonerge("devam-ok",ek);},1800);else yonerge("dogrusu-isaretlendi","Doğrusu işaretlendi. "+ek);}else if(trSesVar()&&TRSES)soyle("Doğrusu: "+q.answer+". "+ek);else yonerge("devam-ok",ek);}}   /* doğru cevap metni değişken: cihazda Türkçe ses varsa onunla, yoksa yalnız kayıtlı "devam" yönergesi */
      else setTimeout(()=>{if(ekran!==EKRAN_NO||!fb.isConnected)return;ileri();},1500);});
  }
  step();
}
function secenek(dogru,havuz,adet){if(adet===undefined)adet=sv().sik;const h=shuffle([...new Set(havuz.filter(x=>x&&x!==dogru))]).slice(0,adet);return shuffle([dogru,...h]);}
function kelime(){
  const seen=new Set(),all=[];
  CUR.ayetler.forEach(a=>a.w.forEach(w=>{if(!seen.has(w.a)){seen.add(w.a);all.push(w);}}));
  const anlamlar=all.map(w=>w.tr);
  quiz({title:kucuk()?"Dinle ve seç":"Kelime eşleştir",star:"kelime",items:shuffle(all).slice(0,10),
    build:w=>{const o=secenek(w.tr,anlamlar);return {html:`<p>Bu kelimenin anlamı nedir?</p><div class="qbig ar" lang="ar" dir="rtl">${w.a}</div><p class="okunus">${esc(w.ok)}</p>`,answer:w.tr,opts:o,sonuc:ok=>defterIsle(CUR.no,w,o,ok)};}});
}
function ayetCal(ai){const b=CUR.ses.bas,e=ai+1<b.length?b[ai+1]:CUR.ses.son;durSes();hizUygula();calParca(CUR.no,b[ai],e);}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-ayetcal]");if(b&&CUR&&CUR.ses)ayetCal(+b.dataset.ayetcal);});
function tamamla(){
  const tum=[...new Set(CUR.ayetler.flatMap(a=>a.w.map(w=>w.a)))];
  let sec;
  if(CUR.ayetler.length>=10)sec=shuffle(CUR.ayetler.map((a,i)=>i)).slice(0,10).map(ai=>({ai,k:Math.floor(Math.random()*CUR.ayetler[ai].w.length)}));
  else{const t=[];CUR.ayetler.forEach((a,ai)=>a.w.forEach((_,k)=>t.push({ai,k})));sec=shuffle(t).slice(0,10);}
  quiz({title:"Ayet tamamla",star:"tamamla",items:sec,
    build:({ai,k})=>{const a=CUR.ayetler[ai];const hedef=a.w[k].a;
      const satir=a.w.map((w,j)=>j===k?'<span class="blank">؟</span>':w.a).join(" ");
      const k1=kucuk();if(k1&&CUR.ses)setTimeout(()=>ayetCal(ai),300);
      return{html:`<p>${k1?"Ayeti dinle; boşluğa hangi kelime gelir? Şıkları da dinleyebilirsin.":(CUR.ayetler.length===1?"Ayetteki":((CUR.ilkAyet||1)+ai)+". ayetteki")+" boşluğa hangi kelime gelir?"}</p>${k1&&CUR.ses?`<button class="yazi-4 dn" data-ayetcal="${ai}">${ikon("volume-2")} Ayeti yeniden dinle</button>`:""}<div class="ayet-box ar" lang="ar" dir="rtl">${satir}</div><p class="okunus">${esc(a.meal)}</p>`,answer:hedef,arOpts:true,opts:secenek(hedef,tum),otoSesYok:k1};}});
}
function bilgi(){
  quiz({title:"Bilgi yarışması",items:shuffle(CUR.bilgi),build:q=>({html:`<p class="yazi-4 kalin">${esc(q.q)}</p>`,answer:q.a,opts:shuffle(q.o),tek:q.o.some(o=>o.length>22)})});
}
/* Küçükler için sesli sıralama: bir ayeti dinle, ardından gelen ayeti dinleyerek seç */
function siralaKucuk(){const A=CUR.ayetler,n=A.length;
  if(n<2||!CUR.ses){const V=$("view");V.innerHTML=`<p>Bu surede sıralanacak ayet yok; yıldızı Dinle bölümünden alabilirsin.</p>`;return;}
  const bas=a=>a.w.slice(0,Math.min(3,a.w.length)).map(x=>x.a).join(" ")+(a.w.length>3?" …":"");
  const items=shuffle([...Array(n-1).keys()]).slice(0,Math.min(6,n-1));
  quiz({title:"Sırayı bul",star:"sirala",need:0.8,items,
    build:i=>{const dogru=bas(A[i+1]);const digerIdx=shuffle([...Array(n).keys()].filter(x=>x!==i+1&&x!==i)).slice(0,1);
      const opts=shuffle([i+1,...digerIdx]);setTimeout(()=>ayetCal(i),300);
      return {html:`<p class="yazi-4 kalin">Bu ayeti dinle. Sonra hangisi gelir?</p><button class="yazi-4 primary" data-ayetcal="${i}">${ikon("volume-2")} Ayeti dinle</button>
        <p>Seçenekleri dinle: ${opts.map((x,j)=>`<button class="yazi-4 dn" data-ayetcal="${x}">${ikon("headphones")} ${j+1}. seçenek</button>`).join(" ")}</p>`,
        answer:dogru,opts:opts.map(x=>bas(A[x])),sikAyet:opts,arOpts:true,tek:true,buyuk:true,otoSesYok:true,sonuc:()=>{}};}});}
function sirala(){if(kucuk()&&!S.tumBolum)return siralaKucuk();let siraTam=false;
  const V=$("view");const CM=!!CUR.cumleler;
  const A=CM?CUR.cumleler.map(c=>({ar:CUR.ayetler[0].w.slice(c.bas,c.son).map(w=>w.a)})):CUR.ayetler;const BLOK=CM?A.length:7;
  const basI=A.length<=BLOK?0:Math.floor(Math.random()*(A.length-BLOK+1));
  const idx=A.map((_,i)=>i).slice(basI,basI+Math.min(BLOK,A.length));
  let order=shuffle(idx);let dene=0;while(order.every((v,i)=>v===idx[i])&&dene++<20)order=shuffle(idx);
  function draw(sonuc){
    V.innerHTML=`<h2>${CM?"Cümleleri sırala":"Ayetleri sırala"}</h2><p>${CM?"Ayetin on cümlesini doğru sıraya diz. ":""}${A.length>BLOK?`Bu turda ${basI+1}-${basI+idx.length}. ayetler var. `:""}Ayetleri tutup sürükleyerek doğru sıraya diz. Farede satırın her yerinden, telefonda soldaki ⠿ tutamağından tut. Oklarla da taşıyabilirsin.</p>
    <div class="order-list">${order.map((ai,pos)=>`<div class="order-item ${sonuc?(ai===idx[pos]?"ok":"bad"):""}" data-ai="${ai}">
      <span class="grip" aria-hidden="true"><span class="num">${pos+1}</span>${sonuc?`<span class="isaret">${ai===idx[pos]?"✓":"✗"}</span>`:""}<span class="dots">⠿</span></span><span class="ar" lang="ar" dir="rtl">${A[ai].ar.join(" ")}${sonuc?`<span class="gorunmez" lang="tr" dir="ltr"> · ${ai===idx[pos]?"doğru yerde":"yanlış yerde"}</span>`:""}</span>
      <span class="mv"><button aria-label="${pos+1}. sıradaki ${CM?"cümleyi":"ayeti"} yukarı taşı" data-u="${pos}" ${pos===0?"disabled":""}>▲</button><button aria-label="${pos+1}. sıradaki ${CM?"cümleyi":"ayeti"} aşağı taşı" data-d="${pos}" ${pos===order.length-1?"disabled":""}>▼</button></span></div>`).join("")}</div>
    <div class="esnek ara-2 sarmal"><button class="primary" id="kontrol">Kontrol et</button>${A.length>BLOK?`<button id="yeni">Başka ayetlerle oyna</button>`:""}</div><p class="feedback" id="fb" tabindex="-1"></p>`;
    const tasi=(p,y)=>{[order[y],order[p]]=[order[p],order[y]];draw();const u=V.querySelector(`[data-u="${y}"]`),d=V.querySelector(`[data-d="${y}"]`);
      const hedef=(p>y?(u&&!u.disabled?u:d):(d&&!d.disabled?d:u));if(hedef)try{hedef.focus({preventScroll:true});}catch(e){}canliDuyur(`${y+1}. sıraya taşındı`);};
    V.querySelectorAll("[data-u]").forEach(b=>b.onclick=()=>{const p=+b.dataset.u;tasi(p,p-1);});
    V.querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{const p=+b.dataset.d;tasi(p,p+1);});
    const list=V.querySelector(".order-list");
    list.querySelectorAll(".order-item").forEach(it=>{
      it.addEventListener("pointerdown",e=>{
        if(e.target.closest("button"))return;
        if(e.pointerType!=="mouse"&&!e.target.closest(".grip"))return;
        if(e.pointerType==="mouse"&&e.button!==0)return;
        e.preventDefault();it.setPointerCapture(e.pointerId);it.classList.add("drag");
        let startY=e.clientY;
        const move=ev=>{it.style.transform=`translateY(${ev.clientY-startY}px)`;
          for(const o of [...list.children].filter(x=>x!==it)){const r=o.getBoundingClientRect(),mid=r.top+r.height/2,ir=it.getBoundingClientRect(),myMid=ir.top+ir.height/2;
            const before=it.compareDocumentPosition(o)&Node.DOCUMENT_POSITION_PRECEDING;
            if((before&&myMid<mid)||(!before&&myMid>mid)){const t0=it.getBoundingClientRect().top;list.insertBefore(it,before?o:o.nextSibling);startY+=it.getBoundingClientRect().top-t0;it.style.transform=`translateY(${ev.clientY-startY}px)`;break;}}};
        const up=()=>{it.removeEventListener("pointermove",move);it.removeEventListener("pointerup",up);it.removeEventListener("pointercancel",up);
          it.style.transform="";it.classList.remove("drag");order=[...list.children].map(x=>+x.dataset.ai);draw();};
        it.addEventListener("pointermove",move);it.addEventListener("pointerup",up);it.addEventListener("pointercancel",up);
      });
    });
    const y=$("yeni");if(y)y.onclick=()=>sirala();
    $("kontrol").onclick=()=>{if(siraTam)return;const ds=order.filter((ai,p)=>ai===idx[p]).length;const tam=ds===order.length;
      answer(tam);draw(true);const fb=$("fb");
      if(tam){fb.className="feedback ok";fb.textContent="Tebrikler, sıra tamamen doğru!";giveStar("sirala");siraTam=true;const kb=$("kontrol");if(kb){kb.disabled=true;kb.onclick=null;}}
      else{fb.className="feedback bad";fb.textContent=ds+" ayet doğru yerde. ✗ işaretli kırmızıları düzeltip yeniden kontrol et.";}
      canliDuyur(fb.textContent);{const kb=$("kontrol"),hedef=kb&&!kb.disabled?kb:($("yeni")||fb);try{hedef.focus({preventScroll:true});}catch(e){}}};
  }
  draw();
}
