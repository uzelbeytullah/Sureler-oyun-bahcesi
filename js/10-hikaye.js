/* Sureler Oyun Bahçesi · Çocuk hikâyesi canlandırma */
/* ---------- Çocuk hikâyesi canlandırma ---------- */
const AN_ARKA={
  aksam:["#F6A04D","#E26D5C","#5B4B8A"], gece:["#1B2140","#232B55","#2E3970"], yildizli:["#0E1433","#18215A","#27357A"],
  gunduz:["#8FD3FE","#BDE7FF","#E9F7FF"], kis:["#E8EEF4","#C9D6E3","#9FB3C8"], ev_ic:["#F3E3C3","#EBD3A8","#E2C38F"], safak:["#FFC48C","#FF9F80","#7A6FB8"]
};
const AN_ZEMIN={bahce:["#3E7B3A","#2F6230"],ev:["#B98B5E","#9C7148"],col:["#E9C27A","#D4A85A"],deniz:["#2C7BB6","#1D5C8C"],yol:["#8C8C7A","#6F6F5F"],kar:["#F4F8FB","#DCE6EF"]};
const AN_IC_GECE=new Set(["gece","yildizli"]);
function anKarakter(c,o,ad){
  const r=c.renk||"#E4572E",tur=c.tur||"kiz",cocuk=tur==="kiz"||tur==="erkek";
  const s=cocuk?1.2:1.5;const ten="#F2C9A0";
  const bas=tur==="kiz"||tur==="anne"||tur==="nine"
    ? `<path d="M-15,-62 a15,15 0 1,1 30,0 v10 q-15,8 -30,0z" fill="${tur==="anne"||tur==="nine"?r:"#8E5B3A"}"/><circle cx="0" cy="-60" r="11" fill="${ten}"/>${tur==="kiz"?`<path d="M-12,-66 q12,-14 24,0" fill="#5A3A22"/>`:`<path d="M-15,-62 q15,-22 30,0 v6 q-15,-14 -30,0z" fill="${r}"/>`}`
    : `<circle cx="0" cy="-60" r="12" fill="${ten}"/><path d="M-12,-64 q12,-14 24,0 v-2 q-12,-8 -24,0z" fill="${tur==="baba"||tur==="dede"?"#3A3A3A":"#4A2E1C"}"/>${tur==="dede"?`<path d="M-8,-52 q8,10 16,0" fill="#EEE"/>`:""}`;
  const govde=tur==="kiz"||tur==="anne"||tur==="nine"
    ? `<path d="M-14,-46 h28 l10,46 h-48z" fill="${r}"/>`
    : `<rect x="-13" y="-46" width="26" height="30" rx="6" fill="${r}"/><rect x="-11" y="-17" width="9" height="17" fill="#3A3A50"/><rect x="2" y="-17" width="9" height="17" fill="#3A3A50"/>`;
  const kol=o.hareket==="dua"?`<path class="an-kol" d="M-12,-40 l-12,-14 M12,-40 l12,-14" stroke="${ten}" stroke-width="6" stroke-linecap="round"/>`
    : o.hareket==="isaret"?`<path d="M-12,-40 l-8,16 M12,-40 l16,-22" stroke="${ten}" stroke-width="6" stroke-linecap="round"/>`
    : o.hareket==="sar"?`<path d="M-12,-40 l-16,4 M12,-40 l-18,6" stroke="${ten}" stroke-width="6" stroke-linecap="round"/>`
    : `<path d="M-12,-40 l-8,18 M12,-40 l8,18" stroke="${ten}" stroke-width="6" stroke-linecap="round"/>`;
  const tasi=o.tasir==="fener"?`<g transform="translate(20,-28)">${anFener(true,0.55)}</g>`:"";
  const bis=o.bisiklet?`<g><circle cx="-24" cy="-14" r="14" fill="none" stroke="#1F2440" stroke-width="4"/><circle cx="24" cy="-14" r="14" fill="none" stroke="#1F2440" stroke-width="4"/><path d="M-24,-14 L-6,-36 L16,-36 L24,-14 M-6,-36 L0,-14 L-24,-14 M16,-36 L14,-46 h8" fill="none" stroke="#E4572E" stroke-width="4" stroke-linejoin="round"/></g>`:"";
  return `${bis}<g transform="translate(0,${o.bisiklet?-30:0}) scale(${s})">${govde}${kol}${bas}${tasi}</g>${ad?`<text y="16" text-anchor="middle" class="an-ad">${esc(ad)}</text>`:""}`;
}
function anFener(yanik,k){k=k||1;return `<g transform="scale(${k})">${yanik?`<circle class="an-hale" cx="0" cy="-14" r="34" fill="url(#anIsik)"/>`:""}
  <path d="M-6,-34 q6,-8 12,0" fill="none" stroke="#5A4A3A" stroke-width="3"/><rect x="-10" y="-30" width="20" height="4" rx="2" fill="#5A4A3A"/>
  <rect x="-9" y="-26" width="18" height="22" rx="4" fill="${yanik?"#FFD866":"#7C8796"}" stroke="#5A4A3A" stroke-width="2.5"/>
  ${yanik?`<path class="an-alev" d="M0,-21 q5,6 0,12 q-5,-6 0,-12z" fill="#FF8A3D"/>`:""}<rect x="-10" y="-5" width="20" height="5" rx="2" fill="#5A4A3A"/></g>`;}
function anNesne(o,Y){
  switch(o.t){
    case "agac": return `<g><rect x="-6" y="-60" width="12" height="60" fill="#6B4A2B"/><circle cx="0" cy="-74" r="30" fill="#2F7A3B"/><circle cx="-18" cy="-60" r="20" fill="#2A6E35"/><circle cx="18" cy="-62" r="22" fill="#358A43"/></g>`;
    case "cicek": return `<g class="an-salla"><path d="M0,0 v-18" stroke="#2F6230" stroke-width="3"/><circle cx="0" cy="-22" r="6" fill="#F7C548"/>${[0,72,144,216,288].map(a=>`<circle cx="${Math.cos(a*Math.PI/180)*7}" cy="${-22+Math.sin(a*Math.PI/180)*7}" r="4.5" fill="#F28AB2"/>`).join("")}</g>`;
    case "ev": return `<g><rect x="-34" y="-58" width="68" height="58" fill="#E9D8B8" stroke="#8C6A45" stroke-width="2"/><path d="M-42,-56 L0,-90 L42,-56z" fill="#B5543F"/><rect x="-9" y="-30" width="18" height="30" fill="#7A5232"/><rect x="12" y="-46" width="16" height="14" fill="${o.isik?"#FFD866":"#3A4370"}" stroke="#8C6A45" stroke-width="2"/>${o.isik?`<circle class="an-hale" cx="20" cy="-39" r="22" fill="url(#anIsik)"/>`:""}</g>`;
    case "fener": return `<g class="${o.hareket==="parla"?"an-parla":""}">${anFener(o.durum!=="sonuk",o.buyuk?2.4:0.9)}</g>`;
    case "ay": return `<g><circle cx="0" cy="0" r="22" fill="#FFF3C4"/><circle cx="9" cy="-5" r="20" fill="${Y}"/></g>`;
    case "gunes": return `<g class="an-don"><circle r="24" fill="#FFD23F"/>${[...Array(8)].map((_,i)=>`<rect x="-2" y="-40" width="4" height="10" rx="2" fill="#FFD23F" transform="rotate(${i*45})"/>`).join("")}</g>`;
    case "bulut": return `<g class="an-kay"><circle cx="0" cy="0" r="16" fill="#fff"/><circle cx="18" cy="-6" r="20" fill="#fff"/><circle cx="38" cy="0" r="15" fill="#fff"/></g>`;
    case "kalp": return `<path d="M0,10 C-22,-6 -12,-24 0,-12 C12,-24 22,-6 0,10z" fill="#F25F7A"/>`;
    case "isik": return `<circle cx="0" cy="-40" r="46" fill="url(#anIsik)"/>`;
    case "pencere": return `<g><rect x="-30" y="-24" width="60" height="48" rx="4" fill="${o.acik?"#FFD9A0":"#1B2140"}" stroke="#8C6A45" stroke-width="5"/><path d="M0,-24 v48 M-30,0 h60" stroke="#8C6A45" stroke-width="4"/><circle cx="-12" cy="-10" r="2" fill="#fff"/><circle cx="14" cy="8" r="1.6" fill="#fff"/></g>`;
    case "mum": return `<g class="an-parla"><circle class="an-hale" cx="0" cy="-34" r="30" fill="url(#anIsik)"/><rect x="-6" y="-26" width="12" height="26" rx="2" fill="#FFF5E0"/><path class="an-alev" d="M0,-38 q6,7 0,12 q-6,-5 0,-12z" fill="#FF8A3D"/></g>`;
    case "kitap": return `<g><path d="M-26,-6 q13,-10 26,0 q13,-10 26,0 v-26 q-13,-10 -26,0 q-13,-10 -26,0z" fill="#fff" stroke="#3B6EA8" stroke-width="3"/><path d="M0,-32 v26" stroke="#3B6EA8" stroke-width="2"/></g>`;
    case "kus": return `<path class="an-kanat" d="M-12,0 q6,-8 12,0 q6,-8 12,0" fill="none" stroke="#2A2A3A" stroke-width="3"/>`;
    case "dag": return `<path d="M-70,0 L-10,-90 L50,0z" fill="#7A6FB8"/>`;
    case "deve": return `<g><path d="M-30,-30 q10,-24 22,-6 q10,-22 22,-2 l10,0 l10,-24 l8,0 l-4,30 l-6,0 v32 h-6 v-32 h-34 v32 h-6 v-32z" fill="#C8955A"/></g>`;
    case "fil": return `<g><ellipse cx="0" cy="-34" rx="40" ry="26" fill="#8C8FA3"/><circle cx="38" cy="-46" r="18" fill="#8C8FA3"/><path d="M50,-40 q14,18 4,36" stroke="#8C8FA3" stroke-width="9" fill="none" stroke-linecap="round"/>${[-26,-8,12,26].map(x=>`<rect x="${x-6}" y="-14" width="12" height="16" fill="#7A7D90"/>`).join("")}</g>`;
    case "gemi": return `<g class="an-salla"><path d="M-50,-10 h100 l-16,22 h-68z" fill="#8C5A3A"/><path d="M0,-10 v-60 l34,50z" fill="#fff"/></g>`;
    case "cami": return `<g><rect x="-60" y="-60" width="90" height="60" fill="#F3E6C8" stroke="#8C6A45" stroke-width="2"/><path d="M-50,-60 a35,35 0 0,1 70,0z" fill="#3B8F8A"/><rect x="-24" y="-34" width="18" height="34" rx="9" fill="#7A5232"/><rect x="44" y="-150" width="16" height="150" fill="#F3E6C8" stroke="#8C6A45" stroke-width="2"/><rect x="40" y="-112" width="24" height="7" fill="#C9B48A"/><path d="M44,-150 L52,-176 L60,-150z" fill="#3B8F8A"/><g class="an-parla"><circle class="an-hale" cx="52" cy="-188" r="18" fill="url(#anIsik)"/><path d="M52,-196 a8,8 0 1,0 6,13 a6,6 0 1,1 -6,-13z" fill="#FFD23F" stroke="#A87708" stroke-width="1.5"/></g></g>`;
    case "cuval": return `<g><path d="M-16,0 q-6,-24 4,-34 l-4,-6 h32 l-4,6 q10,10 4,34z" fill="#C8A26B" stroke="#7A5A32" stroke-width="2"/><path d="M-10,-38 h20" stroke="#7A5A32" stroke-width="3"/></g>`;
    case "tezgah": return `<g><rect x="-50" y="-44" width="100" height="44" fill="#B5793F"/><path d="M-56,-90 h112 l-8,22 h-96z" fill="#E4572E"/><path d="M-56,-90 h112" stroke="#fff" stroke-width="4" stroke-dasharray="14 14"/><rect x="-50" y="-68" width="4" height="24" fill="#7A5232"/><rect x="46" y="-68" width="4" height="24" fill="#7A5232"/>${[-30,-10,10,30].map(x=>`<circle cx="${x}" cy="-50" r="8" fill="${x<0?"#F25F5C":"#F7C548"}"/>`).join("")}</g>`;
    case "magara": return `<g><path d="M-90,0 q10,-120 90,-120 q80,0 90,120z" fill="#6E6A7C"/><path d="M-40,0 q4,-62 40,-62 q36,0 40,62z" fill="#14121C"/></g>`;
    case "irmak": return `<g><path d="M-120,0 q40,-14 80,0 t80,0 t80,0 v12 h-240z" fill="#4BA3D9"/><path class="an-kay" d="M-100,4 q20,-6 40,0 M-20,4 q20,-6 40,0 M60,4 q20,-6 40,0" stroke="#fff" stroke-width="2" fill="none"/></g>`;
    case "patikalar": return `<g transform="translate(0,40)"><path d="M-30,0 L-330,-120 L-250,-120 L-10,0z" fill="#F5D98B"/>${[-280,-230,-180,-130,-80].map((x,k)=>`<g transform="translate(${x},${-100+k*20})"><circle r="6" fill="#F28AB2"/><circle r="3" fill="#F7C548"/></g>`).join("")}<path d="M-12,0 L-30,-130 L30,-130 L12,0z" fill="#9C6B5A"/><g transform="translate(0,-150)"><circle cx="-20" r="22" fill="#7A2E2E"/><circle cx="10" cy="-8" r="26" fill="#8E3434"/><circle cx="34" r="18" fill="#7A2E2E"/><path d="M4,10 l-8,18 h10 l-8,18" stroke="#FFD23F" stroke-width="4" fill="none"/></g><path d="M10,0 L250,-120 L330,-120 L30,0z" fill="#B8B8C4"/><ellipse class="an-kay" cx="270" cy="-120" rx="80" ry="28" fill="#fff" opacity=".85"/></g>`;
    case "yatak": return `<g><rect x="-70" y="-34" width="140" height="26" rx="6" fill="#3B6EA8"/>${[-50,-20,10,40].map((x,k)=>`<path d="M${x},${-26+(k%2)*6} l3,6 h6 l-5,4 2,6 -6,-4 -6,4 2,-6 -5,-4 h6z" fill="#FFE9A0"/>`).join("")}<rect x="-74" y="-60" width="10" height="60" fill="#8C6A45"/><rect x="64" y="-44" width="10" height="44" fill="#8C6A45"/><rect x="-62" y="-46" width="34" height="14" rx="7" fill="#fff"/><rect x="-70" y="-10" width="140" height="10" fill="#8C6A45"/></g>`;
    case "lamba": {const y=o.durum!=="sonuk",k=o.buyuk?2.2:1;if(o.asili)return `<g><path d="M0,-200 v40" stroke="#5A4A3A" stroke-width="3"/>${y?`<circle class="an-hale" cx="0" cy="-150" r="50" fill="url(#anIsik)"/>`:""}<path d="M-16,-160 h32 l-6,18 h-20z" fill="${y?"#FFD866":"#7C8796"}" stroke="#5A4A3A" stroke-width="2"/></g>`;
      return `<g transform="scale(${k})"><rect x="-16" y="-18" width="32" height="18" rx="3" fill="#8C6A45"/>${y?`<circle class="an-hale" cx="0" cy="-40" r="40" fill="url(#anIsik)"/>`:""}<circle cx="0" cy="-36" r="16" fill="${y?"#FFE9A0":"#7C8796"}"/><circle cx="7" cy="-40" r="14" fill="${y?"#F3E3C3":"#5A6372"}"/></g>`;}
    case "golge": return o.kucuk?`<path class="an-sin" d="M-30,0 q0,-70 30,-80 q30,10 30,80z" fill="#1A1A2A" opacity=".55"/>`:`<path d="M-80,-40 q-10,-200 80,-230 q90,30 80,230z" fill="#0B0B18" opacity=".7"/>`;
    case "masa": return `<g><rect x="-80" y="-60" width="160" height="12" rx="3" fill="#8C6A45"/><rect x="-70" y="-48" width="8" height="48" fill="#7A5232"/><rect x="62" y="-48" width="8" height="48" fill="#7A5232"/></g>`;
    case "kavanoz": return `<g><rect x="-18" y="-46" width="36" height="46" rx="8" fill="#CDEBF7" stroke="#6FA8C8" stroke-width="3" opacity=".9"/><rect x="-14" y="-54" width="28" height="9" rx="3" fill="#E4572E"/>${[[-6,-12,"#F7C548"],[6,-20,"#F28AB2"],[-4,-28,"#7BC67E"]].map(([x,y,c])=>`<rect x="${x-5}" y="${y}" width="10" height="7" fill="${c}" transform="rotate(${x*3} ${x} ${y})"/>`).join("")}</g>`;
    case "ocak": return `<g><rect x="-34" y="-70" width="68" height="70" rx="6" fill="#7A6F6A"/><rect x="-22" y="-40" width="44" height="30" rx="4" fill="#2A2020"/><path class="an-alev" d="M-10,-12 q10,-26 20,0z" fill="#FF8A3D"/></g>`;
    case "kedi": return `<g><ellipse cx="0" cy="-14" rx="22" ry="14" fill="#E39B4F"/><circle cx="20" cy="-30" r="12" fill="#E39B4F"/><path d="M12,-38 l4,-10 l4,8 M22,-38 l6,-8 l2,10" fill="#E39B4F"/><path class="an-salla" d="M-22,-16 q-20,-10 -14,-30" stroke="#E39B4F" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
    case "yumak": return `<g><circle r="22" cy="-22" fill="#E4572E"/><path d="M-18,-30 q18,-10 36,4 M-20,-18 q20,-8 40,6 M-14,-8 q14,-6 30,0 M-8,-40 q-6,18 4,38" stroke="#B5402A" stroke-width="2.5" fill="none"/><path d="M20,-14 q20,4 30,14" stroke="#E4572E" stroke-width="3" fill="none"/></g>`;
    case "firin": return `<g><rect x="-70" y="-90" width="140" height="90" fill="#E9D8B8" stroke="#8C6A45" stroke-width="2"/><path d="M-80,-88 h160 l-10,-20 h-140z" fill="#B5543F"/><path d="M-30,0 v-40 a30,30 0 0,1 60,0 v40z" fill="#3A2420"/><path class="an-alev" d="M-14,-6 q14,-30 28,0z" fill="#FF8A3D"/><text x="0" y="-62" text-anchor="middle" style="font:800 16px var(--f-ui)" fill="#7A3A22">FIRIN</text></g>`;
    case "bina": return `<g><rect x="-80" y="-120" width="160" height="120" fill="#D9C7A3" stroke="#8C6A45" stroke-width="2"/><path d="M-86,-120 h172 l-86,-40z" fill="#8C5A3A"/>${[-50,-10,30].map(x=>`<path d="M${x},-30 v-36 a10,10 0 0,1 20,0 v36z" fill="#FFD866" opacity=".8"/>`).join("")}<rect x="-14" y="-40" width="28" height="40" fill="#5A3A22"/></g>`;
    case "dukkan": return `<g><rect x="-70" y="-100" width="140" height="100" fill="#F3E6C8" stroke="#8C6A45" stroke-width="2"/><path d="M-76,-100 h152 l-8,22 h-136z" fill="#2E7D5B"/><path d="M-76,-100 h152" stroke="#fff" stroke-width="5" stroke-dasharray="16 16"/><rect x="-56" y="-66" width="60" height="46" fill="#BDE7FF" stroke="#8C6A45" stroke-width="2"/><rect x="18" y="-60" width="34" height="60" fill="#7A5232"/></g>`;
    case "tablo": return `<g><rect x="-50" y="-40" width="100" height="80" fill="#fff" stroke="#8C6A45" stroke-width="6"/><rect x="-4" y="-2" width="8" height="34" fill="#6B4A2B"/><circle cx="0" cy="-12" r="22" fill="#2F7A3B"/>${[[-26,-26],[22,-30],[30,-10]].map(([x,y])=>`<path d="M${x-6},${y} q3,-4 6,0 q3,-4 6,0" stroke="#1F2440" stroke-width="2" fill="none"/>`).join("")}</g>`;
    case "tablo_tac": return `<g><rect x="-56" y="-44" width="112" height="88" fill="#FFF8E1" stroke="#8C6A45" stroke-width="6"/><rect x="-24" y="-6" width="48" height="40" rx="4" fill="#8E3434"/><rect x="-30" y="-14" width="60" height="10" rx="3" fill="#A87708"/><path d="M30,26 l8,-12 l6,8 l6,-12 l4,16z" fill="#FFD23F" stroke="#A87708" stroke-width="1.5"/></g>`;
    case "canta": return `<g><rect x="-26" y="-50" width="52" height="50" rx="10" fill="#E4572E"/><path d="M-14,-50 q14,-22 28,0" stroke="#B5402A" stroke-width="5" fill="none"/><rect x="-18" y="-34" width="36" height="16" rx="4" fill="#F28A6E"/></g>`;
    case "perde_sahne": return `<g><rect x="-360" y="-330" width="720" height="40" fill="#8E3434"/><path d="M-360,-290 q40,140 0,290 h-40 v-290z" fill="#A83E3E"/><path d="M360,-290 q-40,140 0,290 h40 v-290z" fill="#A83E3E"/></g>`;
    case "han": return `<g><rect x="-110" y="-150" width="220" height="150" fill="#C9B48A" stroke="#7A5A32" stroke-width="3"/>${[-110,-80,-50,-20,10,40,70].map(x=>`<rect x="${x}" y="-162" width="20" height="14" fill="#C9B48A" stroke="#7A5A32" stroke-width="2"/>`).join("")}<path d="M-40,0 v-70 a40,40 0 0,1 80,0 v70z" fill="#3A2A1E"/>${[-80,60].map(x=>`<path d="M${x},-90 v-26 a10,10 0 0,1 20,0 v26z" fill="#3A2A1E"/>`).join("")}</g>`;
    case "kabe": return `<g><rect x="-50" y="-96" width="100" height="96" fill="#1C1C22"/><rect x="-50" y="-74" width="100" height="10" fill="#C9A227"/><rect x="-12" y="-40" width="24" height="40" fill="#C9A227" opacity=".85"/></g>`;
    case "hurma": return `<g><path d="M-4,0 q-4,-60 4,-110 h6 q-4,50 2,110z" fill="#8C6A45"/>${[-60,-25,10,45,80,120].map(a=>`<path d="M2,-110 q${Math.cos(a*Math.PI/180)*30},${-Math.abs(Math.sin(a*Math.PI/180))*20-10} ${Math.cos(a*Math.PI/180)*60},${20}" stroke="#2F7A3B" stroke-width="7" fill="none" stroke-linecap="round"/>`).join("")}<circle cx="-4" cy="-100" r="5" fill="#B5543F"/><circle cx="6" cy="-98" r="5" fill="#B5543F"/></g>`;
    case "cadir": return `<g><path d="M-70,0 L0,-90 L70,0z" fill="#C8955A"/><path d="M0,-90 L-16,0 h32z" fill="#7A5232"/><path d="M0,-90 v-14" stroke="#7A5232" stroke-width="3"/></g>`;
    case "koyun": return `<g><ellipse cx="0" cy="-22" rx="24" ry="16" fill="#F4F1EA"/>${[-14,0,14].map(x=>`<circle cx="${x}" cy="-34" r="9" fill="#F4F1EA"/>`).join("")}<ellipse cx="26" cy="-26" rx="9" ry="7" fill="#3A3A3A"/><rect x="-14" y="-8" width="5" height="10" fill="#3A3A3A"/><rect x="10" y="-8" width="5" height="10" fill="#3A3A3A"/></g>`;
    case "tas": return `<ellipse cx="0" cy="-5" rx="8" ry="5" fill="#8C8C7A"/>`;
    case "yagmur": return `<g>${[...Array(14)].map((_,i)=>`<path class="an-damla" style="animation-delay:${(i%7)*0.15}s" d="M${i*14-90},-140 l-4,10" stroke="#9CC8F0" stroke-width="2"/>`).join("")}</g>`;
    default: return "";
  }
}
let animDurum=null;
function animSahneCiz(A,i){
  const sc=A.sahneler[i],G=AN_ARKA[sc.arka]||AN_ARKA.gunduz,Z=AN_ZEMIN[sc.zemin]||AN_ZEMIN.bahce,W=800,H=450,ZY=360;
  const px=x=>x/100*W;const gece=AN_IC_GECE.has(sc.arka);
  let yildiz="";if(sc.efekt==="yildizlar"||gece){const r=(n=>()=>(n=(n*9301+49297)%233280)/233280)(7);yildiz=[...Array(sc.efekt==="yildizlar"?40:14)].map((_,k)=>`<circle class="an-yildiz" style="animation-delay:${(r()*3).toFixed(2)}s" cx="${(r()*W).toFixed(0)}" cy="${(r()*ZY*0.65).toFixed(0)}" r="${(1+r()*2).toFixed(1)}" fill="#FFF8D6"/>`).join("");}
  const yollar=sc.nesneler.filter(o=>o.t==="yol").map(o=>`<path class="${o.hareket==="aydinlan"?"an-aydinlan":""}" d="M${px(o.x1)},${ZY+40} L${px(o.x2)-30},${ZY+4} L${px(o.x2)+30},${ZY+4} L${px(o.x1)+70},${ZY+40}z" fill="${o.isikli||o.hareket==="aydinlan"?"#F5D98B":"#9C8C6A"}" opacity="${o.isikli?0.9:0.85}"/>`).join("");
  const ogeler=sc.nesneler.filter(o=>o.t!=="yol").map((o,k)=>{
    const y=o.y!==undefined?o.y/100*H:ZY+(o.k?6:0);const x=px(o.x);
    let ic=o.k?anKarakter(A.karakterler[o.k]||{},o,(A.karakterler[o.k]||{}).ad):anNesne(o,G[0]);
    const kls={titre:"an-titre",zipla:"an-zipla",nefes:"an-nefes",belir:"an-belir",yuksel:"an-yuksel",dus:"an-dus",parla:"",dua:"an-nefes"}[o.hareket]||"";
    const bas=o.giris!==undefined?px(o.giris):x;
    const yuru=o.giris!==undefined?`style="--dx:${(bas-x).toFixed(0)}px" class="an-gir"`:"";
    return `<g transform="translate(${x.toFixed(0)},${y.toFixed(0)})"><g ${yuru}><g class="${kls} ${o.giris!==undefined?"an-adim":""}">${ic}</g></g></g>`;}).join("");
  let balon="";
  if(sc.balon){const o=sc.nesneler.find(n=>n.k===sc.balon.kim);if(o){const bx=Math.min(W-170,Math.max(170,px(o.x)));const tx=sc.balon.yazi,ar=sc.balon.ar;
    const sat=[];tx.split(" ").forEach(w=>{const l=sat[sat.length-1];if(l&&(l+" "+w).length<=24)sat[sat.length-1]=l+" "+w;else sat.push(w);});
    const gen=Math.min(360,Math.max(150,Math.max(...sat.map(l=>l.length))*11.5+36));const yuk=(ar?50:14)+sat.length*26+12;const by=Math.max(8,ZY-150-yuk);
    balon=`<g class="an-balon"><rect x="${bx-gen/2}" y="${by}" width="${gen}" height="${yuk}" rx="18" fill="#FFFFFF" stroke="#1F2440" stroke-width="3"/><path d="M${px(o.x)-8},${by+yuk-2} l${Math.max(-60,Math.min(60,(px(o.x)-bx)))*0+8},26 l12,-26z" fill="#fff" stroke="#1F2440" stroke-width="3" stroke-linejoin="round"/><rect x="${px(o.x)-10}" y="${by+yuk-5}" width="28" height="7" fill="#fff"/>
    ${ar?`<text x="${bx}" y="${by+42}" text-anchor="middle" class="an-ar">${ar}</text>`:""}${sat.map((l,li)=>`<text x="${bx}" y="${by+(ar?50:14)+li*26+20}" text-anchor="middle" class="an-bt">${esc(l)}</text>`).join("")}</g>`;}}
  const sis=sc.efekt==="sis"?[0,1,2,3].map(k=>`<ellipse class="an-kay" style="animation-duration:${8+k*3}s" cx="${120+k*190}" cy="${250+(k%2)*60}" rx="220" ry="60" fill="#fff" opacity=".55"/>`).join(""):"";
  const kar=sc.efekt==="kar"?[...Array(36)].map((_,k)=>`<circle class="an-kar" style="animation-delay:${((k*37)%30)/10}s;animation-duration:${3+(k%5)*0.6}s" cx="${(k*97)%W}" cy="-10" r="${2+(k%3)}" fill="#fff"/>`).join(""):"";
  const karar=sc.karar?`<rect width="${W}" height="${H}" fill="#000" opacity="0.25"/>`:"";
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(sc.metin)}" style="width:100%;height:auto;display:block;border-radius:16px">
   <defs><linearGradient id="anGok" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G[2]}"/><stop offset="0.55" stop-color="${G[1]}"/><stop offset="1" stop-color="${G[0]}"/></linearGradient>
   <radialGradient id="anIsik"><stop offset="0" stop-color="#FFE9A0" stop-opacity="0.95"/><stop offset="0.5" stop-color="#FFD866" stop-opacity="0.35"/><stop offset="1" stop-color="#FFD866" stop-opacity="0"/></radialGradient></defs>
   <rect width="${W}" height="${H}" fill="url(#anGok)"/>${yildiz}
   ${sc.zemin==="ev"?`<rect y="${ZY}" width="${W}" height="${H-ZY}" fill="${Z[0]}"/><rect y="${ZY}" width="${W}" height="8" fill="${Z[1]}"/>`:`<path d="M0,${ZY} Q${W*0.25},${ZY-18} ${W*0.5},${ZY} T${W},${ZY} V${H} H0z" fill="${Z[0]}"/><rect y="${ZY+40}" width="${W}" height="${H-ZY-40}" fill="${Z[1]}"/>`}
   ${yollar}${ogeler}${kar}${sis}${karar}${balon}
   ${sc.son?`<text x="${W/2}" y="70" text-anchor="middle" class="an-son">${esc(A.kisa||A.baslik)}</text>`:""}
  </svg>`;
}
const animSesVar=()=>"speechSynthesis" in window&&typeof SpeechSynthesisUtterance!=="undefined";
function animKonus(metin,bitti){
  try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(metin.replace(/[“”"]/g,""));u.lang="tr-TR";u.rate=0.9;
    const v=speechSynthesis.getVoices().find(v=>/^tr/i.test(v.lang));if(v)u.voice=v;
    u.onend=()=>bitti&&bitti();u.onerror=()=>bitti&&bitti();speechSynthesis.speak(u);}catch(e){bitti&&bitti();}
}
function animAc(A,geri){sayacIsle("hikaye");
  animDurum={A,i:0,oto:false,sesli:!!A.ses,zaman:null,ses:new Audio(),sa:new Audio(),geri:geri||cocuk};animDurum.ses.preload="metadata";animDurum.sa.preload="metadata";animDurum.ses.addEventListener("play",sikCalistir);animDurum.sa.addEventListener("play",sikCalistir);
  const V=$("view");
  V.innerHTML=`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="geri" id="anGeri">← ${geri?"Geri":"Çocuklar için"}</button></div>
  <h2 style="font-size:24px">${esc(A.kisa||A.baslik)}${A.alt?` <span style="font-size:17px">(${esc(A.alt)})</span>`:""}</h2>
  <div id="anSahne" class="an-kutu"></div>
  <div id="anIpucu" class="an-ipucu" hidden></div>
  <p id="anMetin" class="an-metin" aria-live="polite"></p>
  <div id="anOkuma" class="an-okuma" hidden></div><div id="anAile"></div>
  <div class="bar"><i id="anBar"></i></div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
   <button id="anOnce" aria-label="Önceki sahne" style="font-size:20px;min-width:56px">◀</button>
   <button class="primary" id="anOyna" style="font-size:20px;min-width:150px">▶ Oynat</button>
   <button id="anSonra" aria-label="Sonraki sahne" style="font-size:20px;min-width:56px">▶▶</button>
   ${A.ses||animSesVar()?`<button id="anSes" class="${A.ses?"on":""}" style="font-size:18px">${A.ses?"🔊 Seslendirme: açık":"🔈 Sesli anlat: kapalı"}</button>`:""}</div>
  ${A.not?`<p style="font-size:16px;text-align:center"><b>${esc(A.not)}</b></p>`:""}
  <p style="font-size:14px;text-align:center">Karakterler bilerek yüzsüz çizildi. ${A.ses?"Türkçe anlatım yapay zekâ sesiyle (Microsoft Emel ve Ahmet) yapıldı; ayetleri Mişari Râşid el-Afasi okuyor.":"Sesli anlatım telefonun kendi Türkçe sesiyle yapılır."}</p>`;
  $("anGeri").onclick=()=>{animDur();animDurum.geri();};
  $("anOnce").onclick=()=>{animDur();animDurum.elle=true;animGit(Math.max(0,animDurum.i-1));};
  $("anSonra").onclick=()=>{animDur();animDurum.elle=true;animGit(Math.min(A.sahneler.length-1,animDurum.i+1));};
  $("anOyna").onclick=()=>{if(animDurum.oto){animDur();return;}if(A.dosya&&!animDurum.acildi){animDurum.acildi=true;[animDurum.ses,animDurum.sa].forEach(a=>{a.muted=true;a.play().then(()=>{a.pause();a.muted=false;}).catch(()=>{a.muted=false;});});}animDurum.oto=true;$("anOyna").textContent="❚❚ Durdur";if(animDurum.i>=A.sahneler.length-1)animDurum.i=0;animGit(animDurum.i,true);};
  const s=$("anSes");if(s)s.onclick=()=>{animDurum.sesli=!animDurum.sesli;s.textContent=animDurum.sesli?(A.ses?"🔊 Seslendirme: açık":"🔊 Sesli anlat: açık"):(A.ses?"🔈 Seslendirme: kapalı":"🔈 Sesli anlat: kapalı");s.classList.toggle("on",animDurum.sesli);if(!animDurum.sesli){animDurum.ses.pause();animKlipDur();try{speechSynthesis.cancel();}catch(e){}}else if(!animDurum.oto)animSesCal(animDurum.i);};
  animGit(0);
}
function animZaman(){const D=animDurum;if(!D)return 0;if(D.A.dosya){const k=D.kl&&D.kl[D.ki];if(!k)return D.kBas||0;return D.kBas+Math.max(0,D.kAud.currentTime-k.b);}return D.ses.currentTime;}
function animCalar(){const D=animDurum;if(!D)return false;return D.A.dosya?!!D.klCal:!D.ses.paused;}
function animKlipDur(){const D=animDurum;if(!D)return;D.klCal=false;D.kl=null;try{D.ses.pause();D.sa.pause();}catch(e){}}
function animKlipBasla(){const D=animDurum;if(!D||!D.kl)return;const k=D.kl[D.ki];
  if(!k){const f=D.klBitti;D.klCal=false;D.kl=null;if(f)f();return;}
  const a=k.s==="n"?D.ses:D.sa,src=surumle(k.s==="n"?`anim/${D.A.dosya}?v=${SURUM}`:`ses/${String(D.A.no).padStart(3,"0")}.mp3?v=${SURUM}`);
  if(a.dataset.src!==src){a.dataset.src=src;a.src=src;}
  a.volume=k.f?0:1;D.kAud=a;D.klCal=true;
  const bas=()=>{try{a.currentTime=k.b;}catch(e){}a.play().catch(()=>animKlipAtla());};
  if(a.readyState>=1)bas();else{a.addEventListener("loadedmetadata",bas,{once:true});a.load();}
  a.onerror=()=>animKlipAtla();}
function animKlipAtla(){const D=animDurum;if(!D||!D.kl)return;const k=D.kl[D.ki];try{D.kAud.pause();}catch(e){}D.kBas+=k.e-k.b;D.ki++;animKlipBasla();}
SIK.add(()=>{const D=animDurum;if(!D||!D.kl||!D.klCal)return false;const k=D.kl[D.ki],a=D.kAud;if(!k||!a||a.paused)return true;const t=a.currentTime;
  if(k.f)a.volume=Math.max(0,Math.min(1,(t-k.b)/0.06,(k.e-t)/0.06));
  if(t>=k.e-0.02)animKlipAtla();return true;});
function animIzlendi(i){const D=animDurum;if(!D)return;D.izlenen=D.izlenen||new Set();D.izlenen.add(i);const A=D.A,n=A.sahneler.length;
  if(i===n-1&&D.izlenen.size>=Math.ceil(n*0.7)){const key=(A.no||"")+"|"+A.baslik;S.hikIzle=S.hikIzle||{};if(!S.hikIzle[key]){S.hikIzle[key]=today();gun();S.puan+=15;gorevIsle("hikaye");logIsle("hikaye");efekt("gorev");kutla(true);toast("Hikâyeyi izledin, 15 puan");checkBadges();save();renderStats();}}}
function animSesCal(i,bitti){const D=animDurum;if(!D.A.ses||!D.A.dosya){animKonus(D.A.sahneler[i].metin,bitti);return;}
  animKlipDur();D.kl=D.A.sahneler[i].klip;D.ki=0;D.kBas=0;D.klBitti=bitti;animKlipBasla();}
// ses çalarken balon gizli kalırsa (ses hatası) güvenlik: 4 sn sonra göster

function animDur(){if(!animDurum)return;animDurum.oto=false;const bb=document.querySelector('.an-balon.bekle');if(bb)bb.classList.remove('bekle');document.querySelectorAll('.an-ip.bekle').forEach(e=>e.classList.remove('bekle'));clearTimeout(animDurum.zaman);animDurum.ses.pause();animKlipDur();try{speechSynthesis.cancel();}catch(e){}const b=$("anOyna");if(b)b.textContent="▶ Oynat";}
function animGit(i,devam){
  const D=animDurum,A=D.A;D.i=i;clearTimeout(D.zaman);
  const kutu=$("anSahne");if(!kutu)return;
  kutu.innerHTML=animSahneCiz(A,i);kutu.classList.remove("an-gecis");void kutu.offsetWidth;kutu.classList.add("an-gecis");
  $("anMetin").textContent=A.sahneler[i].metin;{const ak=$("anAile");if(ak)ak.innerHTML=(i===A.sahneler.length-1&&A.kaynak==="cocuk")?aileKarti():"";}
  const ok=A.sahneler[i].okuma,kt=$("anOkuma");
  if(ok&&CUR&&CUR.ayetler){kt.hidden=false;kt.innerHTML=ok.map((o,k)=>`<div class="an-ayet" data-k="${k}"><span class="kelimeler" lang="ar" style="justify-content:center">${CUR.ayetler[o.ayet-(CUR.ilkAyet||1)].w.map((w,wi)=>(o.c!==undefined&&CUR.cumleler&&(wi<CUR.cumleler[o.c].bas||wi>=CUR.cumleler[o.c].son))?"":`<span class="k${(wi*5+o.ayet*3)%12} ${(A.ipuclari||[]).some(p=>p.ayet===o.ayet&&p.w===wi)?"an-sk":""}">${w.a}</span>`).join("")}<span class="n-ar">﴿${arNum(o.ayet)}﴾</span></span></div>`).join("");
  }else{kt.hidden=true;kt.innerHTML="";}
  const sh=A.sahneler[i],bl=kutu.querySelector(".an-balon");D.ses.ontimeupdate=null;
  const ipK=$("anIpucu"),zamanli=D.sesli&&A.ses&&(D.oto||D.elle);let ipBek=[];
  const ipListe=sh.ipucuHepsi?(A.ipuclari||[]).map((p,k)=>({i:k})):(sh.ipucu||[]);
  if(ipListe.length){ipK.hidden=false;ipK.innerHTML=ipListe.map(q=>{const p=A.ipuclari[q.i];return `<span class="an-ip ${zamanli&&q.p!==undefined?"bekle":""}" data-i="${q.i}" role="button" tabindex="0">${esc(p.ses)} → ${esc(p.kelime)}<span class="ar" lang="ar">${p.ar}</span></span>`;}).join("");
    if(zamanli)ipBek=ipListe.filter(q=>q.p!==undefined&&sh.parca&&sh.parca[q.p]).map(q=>({i:q.i,t:sh.parca[q.p].t}));
    if(!zamanli||!sh.parca)ipK.querySelectorAll(".an-ip").forEach(e=>e.classList.remove("bekle"));}
  else{ipK.hidden=true;ipK.innerHTML="";}
  ipK.onclick=ev=>{const c=ev.target.closest(".an-ip");if(!c)return;const p=A.ipuclari[+c.dataset.i];const y=CUR&&CUR.ayetler[p.ayet-(CUR.ilkAyet||1)];if(y&&y.w[p.w])kelimeSes(y.w[p.w]);};
  ipK.onkeydown=ev=>{if((ev.key==="Enter"||ev.key===" ")&&ev.target.closest(".an-ip")){ev.preventDefault();ev.target.closest(".an-ip").click();}};
  // balon: konuşan kişinin sözü başladığında açılsın
  let blT=null;if(bl&&sh.balon&&sh.parca&&D.sesli&&A.ses&&(D.oto||D.elle)){const p=sh.parca.find(q=>q.kim===sh.balon.kim);if(p){blT=p.t;bl.classList.add("bekle");}}
  clearInterval(D.izle);D.izle=setInterval(()=>{if(D.i!==i||animDurum!==D||!$("anOyna")){clearInterval(D.izle);return;}const t=animZaman(),cal=animCalar();
    if(blT!==null&&cal&&t>=blT-0.15){bl.classList.remove("bekle");blT=null;}
    if(ipBek.length&&cal){ipBek=ipBek.filter(q=>{if(t>=q.t-0.1){const e=ipK.querySelector(`[data-i="${q.i}"]`);if(e){e.classList.remove("bekle");e.classList.add("on");setTimeout(()=>e.classList.remove("on"),1800);}return false;}return true;});}
    if(ok&&cal){let k=-1;ok.forEach((o,j)=>{if(t>=o.t-0.05)k=j;});if(k>=0&&ok[k].bit&&t>ok[k].bit+0.3&&k===ok.length-1)k=-1;if(sh.okuma)ipK.querySelectorAll(".an-ip").forEach(e=>e.classList.toggle("on",k>=0&&A.ipuclari[+e.dataset.i].ayet===ok[k].ayet));kt.querySelectorAll(".an-ayet").forEach((e,j)=>{e.classList.toggle("on",j===k);if(j===k&&e.dataset.g!=="1"){e.dataset.g="1";e.scrollIntoView({block:"nearest",behavior:kaydirmaDavranisi()});}});}},30);
  $("anBar").style.width=((i+1)/A.sahneler.length*100)+"%";
  D.izlenen=D.izlenen||new Set();clearTimeout(D.izSure);{const sc=A.sahneler[i];D.izSure=setTimeout(()=>{if(D.i===i&&animDurum===D&&$("anOyna"))animIzlendi(i);},Math.max(3000,Math.min(((sc.sure||0)*1000)*0.8,(sc.metin||"").length*45+2000)));}
  D.ses.pause();animKlipDur();
  if(!D.oto){if(D.sesli&&D.A.ses&&D.elle)animSesCal(i);return;}
  const sonraki=()=>{if(!D.oto||D.i!==i)return;if(i<A.sahneler.length-1)animGit(i+1,true);else animDur();};
  const bekle=Math.max(3500,A.sahneler[i].metin.length*65);
  if(D.sesli){let b=false;animSesCal(i,()=>{if(b)return;b=true;{const bb=kutu.querySelector('.an-balon.bekle');if(bb)bb.classList.remove('bekle');kutu.parentNode.querySelectorAll('.an-ip.bekle').forEach(e=>e.classList.remove('bekle'));}D.zaman=setTimeout(sonraki,700);});D.zaman=setTimeout(()=>{if(!b){b=true;sonraki();}},Math.max(bekle,(A.sahneler[i].sure||0)*1000)+15000);}
  else D.zaman=setTimeout(sonraki,bekle);
}

async function animYukle(no){const E=await ekParca(no,"a");return E._anim||null;}
