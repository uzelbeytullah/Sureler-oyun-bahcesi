/* Sureler Oyun Bahçesi · Kur'an insanı: özellikler, ölçek, plan, zıddını bul */
/* ---------- Kur'an insanı ---------- */
let portreAlt="tani";
function portre(){
  const V=$("view"),P=CUR.portre;
  const alt=[["tani","On özellik"],["olc","Kendini değerlendir"],["plan","On günlük plan"],["zitoyun","Zıddını bul"]];
  V.innerHTML=`<h2>Kur'an insanı</h2>${P.baslik?`<p><b>${esc(P.baslik)}</b></p>`:""}<p>${esc(P.giris)}</p>
  <div class="subtabs">${alt.map(([k,a])=>`<button data-a="${k}" class="${portreAlt===k?"on":""}">${a}</button>`).join("")}</div><div id="palt" style="display:grid;gap:14px"></div>`;
  V.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{portreAlt=b.dataset.a;portre();});
  ({tani:pTani,olc:pOlc,plan:pPlan,zitoyun:pZit})[portreAlt]($("palt"));
}
function pTani(el){
  const P=CUR.portre,t=SS(CUR.no).portre;
  el.innerHTML=P.bolumler.map(b=>`<div class="bolum"><h3>${esc(b.ad)} · ${esc(b.alt||"")}</h3>${P.oz.map((o,i)=>o.b!==b.ad?"":`<button class="oz" data-o="${i}"><span class="no">${i+1}</span><span>${esc(o.ad)}</span><span class="durum">${t.olcek[i]?"Puan "+t.olcek[i]+"/5":""}</span></button><div id="d${i}" hidden></div>`).join("")}</div>`).join("")+
  `<p style="font-size:14px">Kaynak: ${esc(CUR.ad)} kitabınızın Kur'an insanı portresi. Portre yapay zekâ desteğiyle hazırlanmıştır; uzman incelemesi yerine geçmez.</p>`;
  el.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{
    const i=+b.dataset.o,d=$("d"+i);if(!d.hidden){d.hidden=true;return;}
    const o=P.oz[i];d.className="detay pop";d.hidden=false;
    d.innerHTML=`<p>${esc(o.kisa)}</p>
    <div class="satir"><b>Günlük hayatta</b><span>${o.hayat.map(esc).join("<br>")}</span></div>
    <div class="satir"><b>Zıddı</b><span>${esc(o.zit)}</span></div>
    <div class="satir"><b>Kendine sor</b><span>${esc(o.sor)}</span></div>
    <div class="satir"><b>Bugün dene</b><span>${esc(o.dene)}</span></div>
    <div class="satir"><b>Dayanak</b><span>${esc(o.dayanak)}</span></div>
    <button class="primary" id="yap${i}">${t.plan.includes(i)?"✓ Bunu denedim":"Bugün bunu denedim (+15 puan)"}</button>`;
    $("yap"+i).onclick=()=>{denedim(i);$("yap"+i).textContent="✓ Bunu denedim";};
  });
}
function denedim(i){const t=SS(CUR.no).portre;if(t.plan.includes(i))return;
  gun();t.plan.push(i);S.puan+=15;toast("Güzel! 15 puan: "+CUR.portre.oz[i].ad);checkBadges();save();renderStats();}
function pOlc(el){
  const P=CUR.portre,t=SS(CUR.no).portre,o=t.olcek,N=P.oz.length,dolu=Object.keys(o).length;
  let odak="";
  if(dolu>=N){const min=Math.min(...Object.values(o));const i=P.oz.findIndex((_,k)=>o[k]===min);
    odak=`<div class="odak">Bu ayın odağı: <b>${i+1}. ${esc(P.oz[i].ad)}</b><br>Bu özelliğin “Bugün dene” görevini sık sık yap; bir ay sonra ölçeği yeniden doldur.</div>`;}
  const son=t.gecmis.slice(-3).reverse().map(g=>`<li>${g.t}: ortalama ${g.ort}</li>`).join("");
  el.innerHTML=`<p>Her özellik için kendine 1 ile 5 arası puan ver: <b>1 hiç · 2 az · 3 bazen · 4 çoğu zaman · 5 her zaman</b>. Puanlar yalnız sana görünür.</p>
  <div class="olcek">${P.oz.map((p,i)=>`<div class="r"><span><b>${i+1}.</b> ${esc(p.ad)}</span><span class="puanlar">${[1,2,3,4,5].map(n=>`<button data-i="${i}" data-n="${n}" class="${o[i]===n?"on":""}" aria-label="${i+1}. özellik için ${n}">${n}</button>`).join("")}</span></div>`).join("")}</div>
  ${odak}<button class="primary" id="kaydet" ${dolu<N?"disabled":""}>${dolu<N?`Kaydetmek için bütün özellikleri puanla (${dolu}/${N})`:"Bu ölçümü kaydet"}</button>
  ${son?`<div><b>Önceki ölçümler</b><ul style="margin:6px 0 0;padding-left:20px">${son}</ul></div>`:""}`;
  el.querySelectorAll("[data-n]").forEach(b=>b.onclick=()=>{o[b.dataset.i]=+b.dataset.n;checkBadges();save();pOlc(el);});
  $("kaydet").onclick=()=>{if(dolu<N)return;const ort=(Object.values(o).reduce((a,b)=>a+b,0)/N).toFixed(1);
    t.gecmis.push({t:new Date().toLocaleDateString("tr-TR"),ort});gun();S.puan+=20;toast("Ölçüm kaydedildi, 20 puan");save();renderStats();pOlc(el);};
}
function pPlan(el){
  const P=CUR.portre,t=SS(CUR.no).portre,n=t.plan.length,N=P.oz.length;
  el.innerHTML=`<p>Her gün bir özelliğin “Bugün dene” görevini yap ve işaretle. Her görev 15 puan.</p>
  <div class="bar"><i style="width:${n/N*100}%"></i></div><p><b>${n} / ${N} gün tamam</b></p>
  <div class="plan">${P.oz.map((p,i)=>{const d=t.plan.includes(i);return `<label class="${d?"done":""}"><input type="checkbox" data-i="${i}" ${d?"checked disabled":""}><span class="gun">${i+1}. gün</span><span><b>${esc(p.ad)}</b><br>${esc(p.dene)}</span></label>`;}).join("")}</div>`;
  el.querySelectorAll("input[data-i]").forEach(c=>c.onchange=()=>{if(c.checked){denedim(+c.dataset.i);pPlan(el);}});
}
function pZit(el){
  const P=CUR.portre,t=SS(CUR.no).portre,items=shuffle(P.oz.map((_,i)=>i));let k=0,dogru=0;
  function step(){
    if(k>=items.length){const ok=dogru>=Math.ceil(items.length*0.8);if(ok&&!t.zit){t.zit=true;checkBadges();save();}
      el.innerHTML=`<div class="result pop"><h2>Zıddını bul bitti</h2><b class="big">${dogru} / ${items.length}</b><p>${ok?"Çok güzel, zıtları tanıdın.":"Rozet için en az %80 doğru gerekiyor."}</p><button class="primary" id="zy">Yeniden oyna</button></div>`;
      $("zy").onclick=()=>pZit(el);return;}
    const i=items[k],d=P.oz[i].zit;const opts=secenek(d,P.oz.map(p=>p.zit),2);
    el.innerHTML=`<div class="qhead"><span>Zıddını bul</span><span>${k+1} / ${items.length} · Doğru: ${dogru}</span></div><div class="bar"><i style="width:${k/items.length*100}%"></i></div>
    <p>Bu özelliğin zıddı hangisidir?</p><p style="font-size:22px;font-weight:800">${esc(P.oz[i].ad)}</p>
    <div class="opts" style="grid-template-columns:1fr">${opts.map((o,j)=>`<button data-j="${j}">${esc(o)}</button>`).join("")}</div><p class="feedback" id="fb"></p>`;
    el.querySelectorAll(".opts button").forEach(b=>b.onclick=()=>{const ok=opts[+b.dataset.j]===d;
      el.querySelectorAll(".opts button").forEach(x=>{x.disabled=true;if(opts[+x.dataset.j]===d)x.classList.add("ok");});
      if(!ok)b.classList.add("bad");if(ok)dogru++;answer(ok);
      const fb=$("fb");fb.className="feedback "+(ok?"ok":"bad");fb.textContent=ok?"Doğru!":"Doğrusu işaretlendi.";
      setTimeout(()=>{k++;step();},ok?900:1800);});
  }
  step();
}
