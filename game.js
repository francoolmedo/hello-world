/* ============================================================
   Pet Pals — juego de mascota virtual (obra original)
   Inspirado en el género de Pet Society. Todo el arte y el
   código son propios. Guardado local en el navegador.
   ============================================================ */

'use strict';

/* ---------- Config: especies y colores ---------- */
const SPECIES = {
  cat:    { name: 'Gato',    ears: 'cat' },
  bunny:  { name: 'Conejo',  ears: 'bunny' },
  bear:   { name: 'Oso',     ears: 'bear' },
  puppy:  { name: 'Perrito', ears: 'puppy' },
};
const SPECIES_EMOJI = { cat:'🐱', bunny:'🐰', bear:'🐻', puppy:'🐶' };

const COLORS = {
  cream:  '#ffe1c4', pink:  '#ffc2dd', gray:   '#cdd4e0', mint:  '#bfead4',
  lilac:  '#d8c6ff', peach: '#ffcbb0', butter: '#ffe79e', sky:   '#bfe0ff',
};

// Cada estado baja este % por minuto real
const DECAY = { hunger: 1.1, happiness: 0.8, hygiene: 0.6, energy: 0.7 };

/* ---------- Tienda ---------- */
const SHOP = {
  food: [
    { id:'apple',   emoji:'🍎', name:'Manzana',    price:5,   restore:{hunger:18}, desc:'Snack sano y barato' },
    { id:'fish',    emoji:'🐟', name:'Pescado',    price:12,  restore:{hunger:34}, desc:'Rico en proteínas' },
    { id:'cake',    emoji:'🍰', name:'Pastel',     price:20,  restore:{hunger:45, happiness:12}, desc:'¡Delicioso y alegra!' },
    { id:'carrot',  emoji:'🥕', name:'Zanahoria',  price:6,   restore:{hunger:16, energy:6}, desc:'Crocante y energética' },
    { id:'sushi',   emoji:'🍣', name:'Sushi',      price:28,  restore:{hunger:55}, desc:'Comida gourmet' },
    { id:'cookie',  emoji:'🍪', name:'Galleta',    price:8,   restore:{hunger:20, happiness:8}, desc:'Un gustito dulce' },
  ],
  toys: [
    { id:'ball',    emoji:'🎾', name:'Pelota',     price:15,  restore:{happiness:22}, desc:'Clásica e infaltable' },
    { id:'teddy',   emoji:'🧸', name:'Peluche',    price:24,  restore:{happiness:30}, desc:'Un amigo suavecito' },
    { id:'yarn',    emoji:'🧶', name:'Ovillo',     price:10,  restore:{happiness:16}, desc:'Horas de diversión' },
    { id:'kite',    emoji:'🪁', name:'Barrilete',  price:30,  restore:{happiness:34, energy:-6}, desc:'A correr al parque' },
  ],
  decor: [
    { id:'plant',   emoji:'🪴', name:'Planta',     price:18,  desc:'Un toque verde' },
    { id:'lamp',    emoji:'🛋️', name:'Sillón',     price:40,  desc:'Comodidad total' },
    { id:'picture', emoji:'🖼️', name:'Cuadro',     price:22,  desc:'Decorá la pared' },
    { id:'rug',     emoji:'🌸', name:'Alfombra',   price:16,  desc:'Suave para las patas' },
    { id:'balloon', emoji:'🎈', name:'Globo',      price:12,  desc:'¡Fiesta!' },
    { id:'cactus',  emoji:'🌵', name:'Cactus',     price:14,  desc:'Bajo mantenimiento' },
    { id:'tv',      emoji:'📺', name:'Tele',       price:45,  desc:'Para maratonear' },
    { id:'clock',   emoji:'🕰️', name:'Reloj',      price:20,  desc:'Elegante' },
  ],
  seeds: [
    { id:'tulip',   emoji:'🌷', name:'Tulipán',    price:8,   grown:'🌷', growMin:1,  reward:16, desc:'Florece rápido' },
    { id:'sunflower',emoji:'🌻',name:'Girasol',    price:14,  grown:'🌻', growMin:2,  reward:30, desc:'Grande y alegre' },
    { id:'tomato',  emoji:'🍅', name:'Tomate',     price:10,  grown:'🍅', growMin:2,  reward:24, desc:'Fresco de la huerta' },
    { id:'strawberry',emoji:'🍓',name:'Frutilla',  price:18,  grown:'🍓', growMin:3,  reward:42, desc:'Dulce y jugosa' },
  ],
  clothes: [
    { id:'tophat',  emoji:'🎩', name:'Galera',     price:26,  slot:'head', desc:'Muy elegante' },
    { id:'crown',   emoji:'👑', name:'Corona',     price:60,  slot:'head', desc:'De la realeza' },
    { id:'bow',     emoji:'🎀', name:'Moño',       price:14,  slot:'head', desc:'Coqueto' },
    { id:'beanie',  emoji:'🧢', name:'Gorro',      price:18,  slot:'head', desc:'Abrigado y canchero' },
    { id:'glasses', emoji:'👓', name:'Lentes',     price:16,  slot:'eyes', desc:'Look intelectual' },
    { id:'shades',  emoji:'🕶️', name:'Anteojos sol',price:22, slot:'eyes', desc:'Estilo estrella' },
    { id:'scarf',   emoji:'🧣', name:'Bufanda',    price:20,  slot:'neck', desc:'Calentita' },
    { id:'bowtie',  emoji:'👔', name:'Moñito',     price:18,  slot:'neck', desc:'De gala' },
    { id:'necklace',emoji:'📿', name:'Collar',     price:24,  slot:'neck', desc:'Con dije brillante' },
  ],
  house: [ // temas de habitación (papel y piso)
    { id:'wall_pink',  emoji:'🌸', name:'Pared rosa',   price:25, kind:'wall',  css:'linear-gradient(180deg,#ffd9ef,#ffe9f6)', desc:'Suave y romántica' },
    { id:'wall_mint',  emoji:'🌿', name:'Pared menta',  price:25, kind:'wall',  css:'linear-gradient(180deg,#cdeede,#e6f7ef)', desc:'Fresca y natural' },
    { id:'wall_night', emoji:'🌙', name:'Pared noche',  price:40, kind:'wall',  css:'linear-gradient(180deg,#3b3b63,#5a5a8a)', desc:'Cielo estrellado' },
    { id:'wall_sunset',emoji:'🌅', name:'Pared atardecer',price:35,kind:'wall', css:'linear-gradient(180deg,#ffd0a0,#ffe3c2)', desc:'Cálida' },
    { id:'floor_pink', emoji:'💗', name:'Piso rosa',    price:25, kind:'floor', css:'linear-gradient(180deg,#ffc2dd,#ffd9ec)', desc:'Baldosas tiernas' },
    { id:'floor_grass',emoji:'🍀', name:'Piso césped',  price:30, kind:'floor', css:'linear-gradient(180deg,#bfead4,#a5dcc0)', desc:'Como un jardín' },
    { id:'floor_wood2',emoji:'🪵', name:'Piso madera',  price:22, kind:'floor', css:'linear-gradient(180deg,#e6b98a,#d9a56e)', desc:'Clásico y cálido' },
  ],
  premium: [ // se compran con Patitas 🐾
    { id:'rainbow', emoji:'🌈', name:'Aura arcoíris', price:5, kind:'aura', desc:'Efecto brillante único' },
    { id:'party',   emoji:'🎉', name:'Caja fiesta',   price:3, kind:'box',  desc:'Abre 3 cajas misteriosas' },
    { id:'goldbowl',emoji:'🏆', name:'Trofeo de oro',  price:8, kind:'decor', decorId:'trophy', emojiDecor:'🏆', desc:'Decoración exclusiva' },
  ],
};

// posiciones fijas para la decoración
const DECOR_SLOTS = [
  { left:'8%', top:'8%' }, { left:'80%', top:'10%' }, { left:'6%', top:'58%' },
  { left:'82%', top:'56%' }, { left:'44%', top:'6%' }, { left:'24%', top:'60%' },
];

/* ---------- Logros ---------- */
const ACHIEVEMENTS = [
  { id:'firstFeed', name:'Primer bocado',   emoji:'🍽️', paw:1, desc:'Alimentá a tu mascota',        check:c=>c.feeds>=1 },
  { id:'clean',     name:'Bien limpito',    emoji:'🫧', paw:1, desc:'Bañala 3 veces',              check:c=>c.washes>=3 },
  { id:'player',    name:'Juguetón',        emoji:'🎾', paw:2, desc:'Jugá 5 veces',                check:c=>c.plays>=5 },
  { id:'gardener',  name:'Jardinero',       emoji:'🌻', paw:2, desc:'Cosechá 3 plantas',           check:c=>c.harvests>=3 },
  { id:'angler',    name:'Pescador',        emoji:'🐟', paw:2, desc:'Pescá 5 peces',               check:c=>c.catches>=5 },
  { id:'shopper',   name:'Comprador',       emoji:'🛍️', paw:2, desc:'Comprá 10 cosas',             check:c=>c.buys>=10 },
  { id:'fashion',   name:'Fashionista',     emoji:'👗', paw:2, desc:'Consegví 3 prendas',          check:(c,s)=>s.wardrobe.length>=3 },
  { id:'neighbor',  name:'Buen vecino',     emoji:'🏠', paw:1, desc:'Visitá al vecino',            check:c=>c.visits>=1 },
  { id:'level5',    name:'Creciendo',       emoji:'⭐', paw:3, desc:'Llegá al nivel 5',            check:(c,s)=>s.level>=5 },
  { id:'rich',      name:'Millonario',      emoji:'💰', paw:3, desc:'Junta 500 monedas',           check:(c,s)=>s.coins>=500 },
];

/* ---------- Vecino simulado ---------- */
const NEIGHBOR = { name:'Luna', species:'bunny', color:'lilac' };

/* ============================================================
   Estado
   ============================================================ */
const DEFAULT_STATE = () => ({
  name: 'Coco', species: 'cat', color: 'cream',
  coins: 60, pawPoints: 0, level: 1, xp: 0,
  stats: { hunger: 80, happiness: 80, hygiene: 80, energy: 80 },
  inventory: {},          // comida: { itemId: cantidad }
  seedsInv: {},           // semillas: { seedId: cantidad }
  decor: [],              // decoración colocada
  wardrobe: [],           // prendas compradas
  outfit: { head:'', eyes:'', neck:'' },
  ownedThemes: [],        // temas de casa comprados
  wallpaper: '', floor: '',
  garden: [null, null, null],  // 3 macetas
  aura: false,
  achievements: [],
  counters: { feeds:0, plays:0, washes:0, buys:0, harvests:0, catches:0, pets:0, visits:0 },
  lastTick: Date.now(), lastDaily: 0, lastBox: 0, lastVisit: 0,
  sleeping: false,
});

let state = DEFAULT_STATE();
const SAVE_KEY = 'petpals_save_v1';

/* ---------- Utilidades ---------- */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const clamp = (n, lo=0, hi=100) => Math.max(lo, Math.min(hi, n));

function save(){
  state.lastTick = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch(e){}
}
function load(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return false;
    const parsed = JSON.parse(raw);
    const base = DEFAULT_STATE();
    state = Object.assign(base, parsed);
    state.stats    = Object.assign(base.stats, parsed.stats || {});
    state.outfit   = Object.assign(base.outfit, parsed.outfit || {});
    state.counters = Object.assign(base.counters, parsed.counters || {});
    if(!Array.isArray(state.garden) || state.garden.length !== 3) state.garden = [null,null,null];
    return true;
  } catch(e){ return false; }
}

function toast(msg){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=> t.classList.add('hidden'), 1800);
}

/* ============================================================
   Dibujo de la mascota (SVG)
   ============================================================ */
function moodFromStats(){
  const s = state.stats;
  const avg = (s.hunger + s.happiness + s.hygiene + s.energy) / 4;
  if(state.sleeping) return 'sleepy';
  if(s.energy < 18) return 'sleepy';
  if(s.hunger < 20) return 'hungry';
  if(s.hygiene < 20) return 'dirty';
  if(avg > 72) return 'happy';
  if(avg < 35) return 'sad';
  return 'neutral';
}

function earsSVG(kind, fill, stroke){
  switch(kind){
    case 'cat':
      return `<path d="M55 60 L48 20 L82 44 Z" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
              <path d="M145 60 L152 20 L118 44 Z" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
              <path d="M57 52 L53 32 L72 46 Z" fill="#ffb3cf"/>
              <path d="M143 52 L147 32 L128 46 Z" fill="#ffb3cf"/>`;
    case 'bunny':
      return `<ellipse cx="72" cy="24" rx="12" ry="34" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
              <ellipse cx="128" cy="24" rx="12" ry="34" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
              <ellipse cx="72" cy="24" rx="5" ry="24" fill="#ffb3cf"/>
              <ellipse cx="128" cy="24" rx="5" ry="24" fill="#ffb3cf"/>`;
    case 'bear':
      return `<circle cx="60" cy="44" r="20" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
              <circle cx="140" cy="44" r="20" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
              <circle cx="60" cy="44" r="10" fill="#e9a98a"/>
              <circle cx="140" cy="44" r="10" fill="#e9a98a"/>`;
    case 'puppy':
      return `<path d="M52 46 q-16 6 -12 40 q22 6 30 -18 Z" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
              <path d="M148 46 q16 6 12 40 q-22 6 -30 -18 Z" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
    default: return '';
  }
}

function eyesMouthSVG(mood){
  let eyes, mouth, extra = '';
  const eyeY = 96;
  switch(mood){
    case 'happy':
      eyes  = `<path d="M74 92 q7 -10 14 0" stroke="#5a4a55" stroke-width="4" fill="none" stroke-linecap="round"/>
               <path d="M112 92 q7 -10 14 0" stroke="#5a4a55" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      mouth = `<path d="M88 116 q12 14 24 0" stroke="#5a4a55" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      break;
    case 'sad':
      eyes  = `<circle cx="81" cy="${eyeY}" r="6" fill="#5a4a55"/><circle cx="119" cy="${eyeY}" r="6" fill="#5a4a55"/>
               <path d="M74 84 q7 4 14 2" stroke="#5a4a55" stroke-width="3" fill="none"/>
               <path d="M112 86 q7 -2 14 -2" stroke="#5a4a55" stroke-width="3" fill="none"/>`;
      mouth = `<path d="M88 122 q12 -12 24 0" stroke="#5a4a55" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      extra = `<ellipse cx="70" cy="106" rx="4" ry="7" fill="#9fd8ff" opacity=".8"/>`;
      break;
    case 'hungry':
      eyes  = `<circle cx="81" cy="${eyeY}" r="7" fill="#5a4a55"/><circle cx="119" cy="${eyeY}" r="7" fill="#5a4a55"/>
               <circle cx="83" cy="94" r="2" fill="#fff"/><circle cx="121" cy="94" r="2" fill="#fff"/>`;
      mouth = `<ellipse cx="100" cy="120" rx="8" ry="6" fill="#5a4a55"/>`;
      break;
    case 'dirty':
      eyes  = `<path d="M74 96 h14" stroke="#5a4a55" stroke-width="4" stroke-linecap="round"/>
               <path d="M112 96 h14" stroke="#5a4a55" stroke-width="4" stroke-linecap="round"/>`;
      mouth = `<path d="M90 118 q10 -6 20 0" stroke="#5a4a55" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      extra = `<text x="60" y="70" font-size="20">💨</text>`;
      break;
    case 'sleepy':
      eyes  = `<path d="M74 96 q7 6 14 0" stroke="#5a4a55" stroke-width="4" fill="none" stroke-linecap="round"/>
               <path d="M112 96 q7 6 14 0" stroke="#5a4a55" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      mouth = `<circle cx="100" cy="118" r="5" fill="#5a4a55"/>`;
      break;
    default:
      eyes  = `<circle cx="81" cy="${eyeY}" r="7" fill="#5a4a55"/><circle cx="119" cy="${eyeY}" r="7" fill="#5a4a55"/>
               <circle cx="84" cy="93" r="2.4" fill="#fff"/><circle cx="122" cy="93" r="2.4" fill="#fff"/>`;
      mouth = `<path d="M92 116 q8 8 16 0" stroke="#5a4a55" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  }
  const blush = (mood==='happy' || mood==='neutral')
    ? `<ellipse cx="66" cy="112" rx="9" ry="6" fill="#ff9ec4" opacity=".55"/>
       <ellipse cx="134" cy="112" rx="9" ry="6" fill="#ff9ec4" opacity=".55"/>` : '';
  return eyes + mouth + blush + extra;
}

// Accesorios de vestuario dibujados en SVG (escalan con la mascota)
function accessorySVG(){
  let head='', eyes='', neck='';
  switch(state.outfit.head){
    case 'tophat': head = `<rect x="76" y="16" width="48" height="7" rx="3" fill="#3a3a4a"/><rect x="86" y="-16" width="28" height="34" rx="4" fill="#3a3a4a"/><rect x="86" y="6" width="28" height="6" fill="#ff6fa5"/>`; break;
    case 'crown':  head = `<path d="M76 26 L86 4 L100 20 L114 4 L124 26 Z" fill="#ffd85c" stroke="#e0a92e" stroke-width="2"/><circle cx="86" cy="4" r="3" fill="#ff6fa5"/><circle cx="114" cy="4" r="3" fill="#7ad0ff"/>`; break;
    case 'bow':    head = `<g transform="translate(126,28)"><path d="M0 0 L-15 -9 L-15 9 Z" fill="#ff6fa5"/><path d="M0 0 L15 -9 L15 9 Z" fill="#ff6fa5"/><circle r="4.5" fill="#ff9ec4"/></g>`; break;
    case 'beanie': head = `<path d="M66 36 q34 -34 68 0 Z" fill="#5fcfae"/><rect x="64" y="34" width="72" height="9" rx="4" fill="#4bb896"/><circle cx="100" cy="6" r="6" fill="#ffe38a"/>`; break;
  }
  switch(state.outfit.eyes){
    case 'glasses': eyes = `<g fill="none" stroke="#3a3a4a" stroke-width="3"><circle cx="81" cy="96" r="12"/><circle cx="119" cy="96" r="12"/><path d="M93 96 h14"/></g>`; break;
    case 'shades':  eyes = `<g fill="#2a2a3a"><rect x="67" y="88" width="27" height="16" rx="7"/><rect x="106" y="88" width="27" height="16" rx="7"/><rect x="93" y="93" width="14" height="4"/></g>`; break;
  }
  switch(state.outfit.neck){
    case 'scarf':    neck = `<path d="M62 132 q38 22 76 0 l-7 17 q-31 15 -62 0 Z" fill="#ff6fa5"/><path d="M124 149 l10 26 l-12 3 l-6 -24 Z" fill="#ff87b3"/>`; break;
    case 'bowtie':   neck = `<g transform="translate(100,140)"><path d="M0 0 L-17 -10 L-17 10 Z" fill="#7a5cd0"/><path d="M0 0 L17 -10 L17 10 Z" fill="#7a5cd0"/><rect x="-4" y="-7" width="8" height="14" rx="2" fill="#5f47b0"/></g>`; break;
    case 'necklace': neck = `<path d="M70 132 q30 20 60 0" fill="none" stroke="#ffd85c" stroke-width="4"/><path d="M100 150 l-6 10 l12 0 Z" fill="#7ad0ff"/>`; break;
  }
  return { head, eyes, neck };
}

function petSVGFor(sp, col, mood, outfit){
  const fill   = COLORS[col] || COLORS.cream;
  const stroke = shade(fill, -22);
  const ears   = earsSVG(SPECIES[sp].ears, fill, stroke);
  const face   = eyesMouthSVG(mood);
  const acc     = outfit;
  const tail = (sp==='puppy' || sp==='cat')
    ? `<path d="M150 168 q40 -6 30 -40" stroke="${stroke}" stroke-width="10" fill="none" stroke-linecap="round"/>` : '';
  return `
  <svg viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="196" rx="60" ry="12" fill="rgba(90,60,80,.15)"/>
    <g class="pet-body">
      ${tail}
      ${ears}
      <ellipse cx="100" cy="150" rx="58" ry="52" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
      <circle cx="100" cy="100" r="52" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
      <ellipse cx="100" cy="118" rx="24" ry="18" fill="${shade(fill,10)}"/>
      ${acc.neck}
      ${face}
      <ellipse cx="100" cy="108" rx="4" ry="3" fill="#c98a9a"/>
      ${acc.eyes}
      ${acc.head}
      <ellipse cx="72" cy="196" rx="14" ry="9" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
      <ellipse cx="128" cy="196" rx="14" ry="9" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
    </g>
  </svg>`;
}

function petSVG(){
  return petSVGFor(state.species, state.color, moodFromStats(), accessorySVG());
}

function shade(hex, pct){
  const n = parseInt(hex.slice(1),16);
  let r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  r=clamp(r+pct,0,255); g=clamp(g+pct,0,255); b=clamp(b+pct,0,255);
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}

/* ============================================================
   Render
   ============================================================ */
function renderPet(target){
  const stage = target || $('#petStage');
  if(!stage) return;
  const isPreview = stage.id === 'previewPet';
  stage.innerHTML = petSVG();
  stage.className = 'pet-stage' + (isPreview ? ' small' : '') + (state.aura ? ' aura' : '');
  if(state.sleeping){
    stage.classList.add('sleeping');
    stage.innerHTML += `<div class="zzz">Z</div>`;
  } else if(moodFromStats()==='happy'){
    stage.classList.add('happy');
  }
}

function renderStats(){
  $$('.stat').forEach(el=>{
    const v = clamp(state.stats[el.dataset.stat]);
    const bar = $('i', el);
    bar.style.width = v + '%';
    bar.style.background = v > 55 ? 'linear-gradient(90deg,#8fe3c8,#5fcfae)'
                        : v > 25 ? 'linear-gradient(90deg,#ffe38a,#ffcf5c)'
                                 : 'linear-gradient(90deg,#ffb0b0,#ff7d7d)';
  });
}

function renderRoom(){
  const room = $('#room');
  if(!room) return;
  const wall  = state.wallpaper ? (SHOP.house.find(h=>h.id===state.wallpaper)?.css) : 'linear-gradient(180deg,#d8ecff,#eaf6ff)';
  const floor = state.floor ? (SHOP.house.find(h=>h.id===state.floor)?.css) : 'linear-gradient(180deg,#ffd9c2,#ffcbb0)';
  room.style.background =
    `${wall} 0 0/100% 55% no-repeat, ${floor} 0 100%/100% 45% no-repeat`;
}

function renderDecor(){
  const layer = $('#decorLayer');
  layer.innerHTML = '';
  state.decor.slice(0, DECOR_SLOTS.length).forEach((id, i)=>{
    const item = SHOP.decor.find(d=>d.id===id) || (id==='trophy' ? {emoji:'🏆'} : null);
    if(!item) return;
    const el = document.createElement('div');
    el.className = 'decor';
    el.textContent = item.emoji;
    el.style.left = DECOR_SLOTS[i].left;
    el.style.top  = DECOR_SLOTS[i].top;
    layer.appendChild(el);
  });
}

function renderTop(){
  $('#petLabel').textContent = state.name;
  $('#coinCount').textContent = state.coins;
  $('#pawCount').textContent = state.pawPoints;
  $('#levelNum').textContent = state.level;
}

function renderAll(){ renderTop(); renderStats(); renderRoom(); renderDecor(); renderPet(); }

/* ============================================================
   Economía / niveles / logros
   ============================================================ */
function addCoins(n){ state.coins = Math.max(0, state.coins + n); renderTop(); }
function addPaw(n){ state.pawPoints = Math.max(0, state.pawPoints + n); renderTop(); }
function addXP(n){
  state.xp += n;
  const need = state.level * 100;
  if(state.xp >= need){
    state.xp -= need; state.level++;
    addCoins(state.level * 10); addPaw(1);
    toast(`¡Subiste a nivel ${state.level}! +${state.level*10}🪙 +1🐾`);
    fx('⭐'); fx('🎉');
  }
  renderTop();
  checkAchievements();
}

function checkAchievements(){
  ACHIEVEMENTS.forEach(a=>{
    if(!state.achievements.includes(a.id) && a.check(state.counters, state)){
      state.achievements.push(a.id);
      addPaw(a.paw);
      toast(`🏆 ¡Logro! ${a.name} +${a.paw}🐾`);
      fx('🏆');
    }
  });
}

/* ============================================================
   Efectos visuales
   ============================================================ */
function fx(emoji, x){
  const layer = $('#fx');
  if(!layer) return;
  const el = document.createElement('div');
  el.className = 'fx-item';
  el.textContent = emoji;
  el.style.left = (x ?? (30 + Math.random()*40)) + '%';
  el.style.bottom = '90px';
  layer.appendChild(el);
  setTimeout(()=> el.remove(), 1500);
}
function bubble(text){
  const b = $('#petMoodBubble');
  b.textContent = text;
  b.classList.remove('hidden');
  clearTimeout(bubble._t);
  bubble._t = setTimeout(()=> b.classList.add('hidden'), 1400);
}
function bounce(){
  const s = $('#petStage');
  s.classList.add('bouncing');
  setTimeout(()=> s.classList.remove('bouncing'), 800);
}

/* ============================================================
   Acciones de cuidado
   ============================================================ */
function applyRestore(restore){
  for(const k in restore){
    if(state.stats[k] !== undefined) state.stats[k] = clamp(state.stats[k] + restore[k]);
  }
}
function afterAction(){ renderStats(); renderPet(); checkAchievements(); save(); }

const ACTIONS = {
  feed(){ openFeed(); },
  play(){ openMinigame(); },
  wash(){
    if(state.stats.hygiene > 96){ bubble('¡Ya estoy limpio! ✨'); return; }
    applyRestore({ hygiene: 40, happiness: 4 });
    state.counters.washes++;
    for(let i=0;i<5;i++) setTimeout(()=>fx('🫧'), i*120);
    bubble('¡Qué frescura! 🛁'); addXP(4); afterAction();
  },
  sleep(){
    if(state.sleeping){ wake(); return; }
    state.sleeping = true; renderPet(); save(); bubble('Zzz... 😴');
    $$('.act').forEach(b=>{ if(b.dataset.action!=='sleep') b.disabled = true; });
    $('.act[data-action="sleep"]').innerHTML = '<span>⏰</span>Despertar';
  },
  pet(){
    applyRestore({ happiness: 10 });
    state.counters.pets++;
    fx('💗'); fx('💗', 55); bubble('¡Me encanta! 💗'); bounce(); addXP(2); afterAction();
  },
  dress(){ openWardrobe(); },
  garden(){ openGarden(); },
  fish(){ openFishing(); },
  visit(){ openVisit(); },
  box(){ openBox(); },
  achievements(){ openAchievements(); },
  shop(){ openShop(); },
};

function wake(){
  state.sleeping = false;
  applyRestore({ energy: 60 });
  $$('.act').forEach(b=> b.disabled = false);
  $('.act[data-action="sleep"]').innerHTML = '<span>😴</span>Dormir';
  renderPet(); bubble('¡Buen día! ☀️'); addXP(5); afterAction();
}

function feedItem(itemId){
  const item = SHOP.food.find(f=>f.id===itemId);
  if(!item || !(state.inventory[itemId] > 0)) return;
  if(state.stats.hunger > 96){ bubble('¡Estoy lleno! 🙅'); return; }
  state.inventory[itemId]--;
  if(state.inventory[itemId] <= 0) delete state.inventory[itemId];
  applyRestore(item.restore);
  state.counters.feeds++;
  fx(item.emoji); bubble('¡Ñam ñam! 😋'); bounce(); addXP(3); afterAction();
  openFeed();
}

/* ============================================================
   Modal genérico
   ============================================================ */
function openModal(title, html){
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = html;
  $('#modal').classList.remove('hidden');
}
function closeModal(){ $('#modal').classList.add('hidden'); }

/* ---------- Alimentar ---------- */
function openFeed(){
  const owned = SHOP.food.filter(f => state.inventory[f.id] > 0);
  let html;
  if(owned.length === 0){
    html = `<p class="inv-empty">No tenés comida 🍽️<br>¡Comprá en la Tienda!</p>
            <button class="btn btn-primary big" onclick="openShop('food')">Ir a la tienda 🛍️</button>`;
  } else {
    html = `<div class="shop-grid">` + owned.map(f=>`
      <div class="shop-item"><div class="emoji">${f.emoji}</div>
        <div class="name">${f.name} ×${state.inventory[f.id]}</div>
        <div class="desc">${f.desc}</div>
        <button class="buy" onclick="feedItem('${f.id}')">Dar de comer</button>
      </div>`).join('') + `</div>`;
  }
  openModal('🍽️ Alimentar a ' + state.name, html);
}

/* ---------- Tienda ---------- */
let shopTab = 'food';
function openShop(tab){
  shopTab = tab || shopTab;
  const tabs = [['food','🍎'],['toys','🎾'],['clothes','👗'],['decor','🪴'],['house','🏠'],['seeds','🌱'],['premium','🐾']];
  const tabsHtml = tabs.map(([k,l])=>
    `<button class="shop-tab ${k===shopTab?'active':''}" onclick="openShop('${k}')">${l}</button>`).join('');
  const grid = SHOP[shopTab].map(it => shopItemHTML(shopTab, it)).join('');
  const cur = shopTab==='premium' ? '🐾 '+state.pawPoints : '🪙 '+state.coins;
  openModal('🛍️ Tienda', `<div class="wallet-line">Tenés ${cur}</div>
    <div class="shop-tabs">${tabsHtml}</div><div class="shop-grid">${grid}</div>`);
}

function shopItemHTML(cat, it){
  const premium = cat==='premium';
  const price = it.price;
  const canBuy = premium ? state.pawPoints >= price : state.coins >= price;
  const priceStr = premium ? `🐾${price}` : `🪙${price}`;
  let btn, extra = '';

  if(cat==='clothes'){
    const owned = state.wardrobe.includes(it.id);
    btn = owned ? `<button class="buy" onclick="openWardrobe()" style="background:#c9b6ff">En vestuario</button>`
                : `<button class="buy" ${canBuy?'':'disabled'} onclick="buyItem('clothes','${it.id}')">Comprar ${priceStr}</button>`;
  } else if(cat==='decor'){
    const owned = state.decor.includes(it.id);
    btn = owned ? `<button class="buy" onclick="removeDecor('${it.id}')" style="background:#f0a5be">Quitar</button>`
                : `<button class="buy" ${canBuy?'':'disabled'} onclick="buyItem('decor','${it.id}')">Colocar ${priceStr}</button>`;
  } else if(cat==='house'){
    const owned = state.ownedThemes.includes(it.id);
    const active = state.wallpaper===it.id || state.floor===it.id;
    if(active) btn = `<button class="buy" style="background:#8fe3c8">✔ Puesto</button>`;
    else if(owned) btn = `<button class="buy" onclick="applyTheme('${it.id}')" style="background:#a9d8ff">Aplicar</button>`;
    else btn = `<button class="buy" ${canBuy?'':'disabled'} onclick="buyItem('house','${it.id}')">Comprar ${priceStr}</button>`;
  } else if(cat==='seeds'){
    btn = `<button class="buy" ${canBuy?'':'disabled'} onclick="buyItem('seeds','${it.id}')">Comprar ${priceStr}</button>`;
    if(state.seedsInv[it.id]) extra = ` (tenés ${state.seedsInv[it.id]})`;
  } else if(cat==='premium'){
    btn = `<button class="buy" ${canBuy?'':'disabled'} onclick="buyItem('premium','${it.id}')" style="background:linear-gradient(180deg,#ffd85c,#ffb84d)">Canjear ${priceStr}</button>`;
  } else { // food / toys
    btn = `<button class="buy" ${canBuy?'':'disabled'} onclick="buyItem('${cat}','${it.id}')">Comprar ${priceStr}</button>`;
    if(cat==='food' && state.inventory[it.id]) extra = ` (tenés ${state.inventory[it.id]})`;
  }
  return `<div class="shop-item"><div class="emoji">${it.emoji}</div>
    <div class="name">${it.name}</div>
    <div class="desc">${it.desc}${extra}</div>${btn}</div>`;
}

function buyItem(cat, id){
  const item = SHOP[cat].find(i=>i.id===id);
  if(!item) return;
  const premium = cat==='premium';
  if(premium ? state.pawPoints < item.price : state.coins < item.price){ toast('Te falta plata 💸'); return; }

  if(cat==='food'){ addCoins(-item.price); state.inventory[id]=(state.inventory[id]||0)+1; state.counters.buys++; toast(`Compraste ${item.name} 🛒`); }
  else if(cat==='seeds'){ addCoins(-item.price); state.seedsInv[id]=(state.seedsInv[id]||0)+1; state.counters.buys++; toast(`Compraste ${item.name} 🌱`); }
  else if(cat==='toys'){ addCoins(-item.price); applyRestore(item.restore); state.counters.buys++; fx(item.emoji); bounce(); bubble('¡Qué divertido! 🎉'); addXP(3); afterAction(); toast(`¡${state.name} ama su ${item.name}!`); }
  else if(cat==='clothes'){ addCoins(-item.price); state.wardrobe.push(id); state.counters.buys++; toast(`${item.name} en tu vestuario 👗`); }
  else if(cat==='decor'){
    if(state.decor.length >= DECOR_SLOTS.length){ toast('No hay más lugar'); return; }
    addCoins(-item.price); state.decor.push(id); state.counters.buys++; renderDecor(); toast(`${item.name} colocado ✨`);
  }
  else if(cat==='house'){ addCoins(-item.price); state.ownedThemes.push(id); applyTheme(id); state.counters.buys++; toast(`${item.name} comprado 🏠`); }
  else if(cat==='premium'){
    addPaw(-item.price);
    if(item.kind==='aura'){ state.aura=true; renderPet(); toast('¡Aura arcoíris activada! 🌈'); }
    else if(item.kind==='box'){ save(); openBox(3); return; }
    else if(item.kind==='decor'){ if(!state.decor.includes(item.decorId) && state.decor.length<DECOR_SLOTS.length){ state.decor.push(item.decorId); renderDecor(); } toast('¡Trofeo colocado! 🏆'); }
  }
  checkAchievements(); save();
  if(cat!=='toys') openShop();
}

function removeDecor(id){ state.decor = state.decor.filter(d=>d!==id); renderDecor(); save(); openShop(); }
function applyTheme(id){
  const t = SHOP.house.find(h=>h.id===id); if(!t) return;
  if(t.kind==='wall') state.wallpaper = id; else state.floor = id;
  renderRoom(); save();
  if($('#modal') && !$('#modal').classList.contains('hidden')) openShop('house');
}

/* ---------- Vestuario ---------- */
function openWardrobe(){
  if(state.wardrobe.length === 0){
    openModal('👗 Vestuario', `<p class="inv-empty">Tu vestuario está vacío 👕<br>¡Comprá ropa en la Tienda!</p>
      <button class="btn btn-primary big" onclick="openShop('clothes')">Ver ropa 👗</button>`);
    return;
  }
  const slots = { head:'Cabeza', eyes:'Cara', neck:'Cuello' };
  let html = '';
  for(const slot in slots){
    const items = state.wardrobe.map(id=>SHOP.clothes.find(c=>c.id===id)).filter(c=>c && c.slot===slot);
    if(items.length===0) continue;
    html += `<div class="ward-slot"><h3>${slots[slot]}</h3><div class="ward-row">`;
    html += items.map(it=>{
      const on = state.outfit[slot]===it.id;
      return `<button class="ward-item ${on?'on':''}" onclick="equip('${slot}','${it.id}')">
        <span>${it.emoji}</span><small>${it.name}</small></button>`;
    }).join('');
    if(state.outfit[slot]) html += `<button class="ward-item off" onclick="equip('${slot}','')"><span>🚫</span><small>Quitar</small></button>`;
    html += `</div></div>`;
  }
  openModal('👗 Vestuario de ' + state.name, html);
}
function equip(slot, id){
  state.outfit[slot] = (state.outfit[slot]===id) ? '' : id;
  renderPet(); save(); openWardrobe();
  if(id) bubble('¡Me queda genial! ✨');
}

/* ---------- Jardín ---------- */
function gardenPlotState(plot){
  if(!plot) return { phase:'empty' };
  const seed = SHOP.seeds.find(s=>s.id===plot.seedId);
  const growMs = seed.growMin * 60000 * (plot.watered ? 0.5 : 1);
  const elapsed = Date.now() - plot.plantedAt;
  return { phase: elapsed >= growMs ? 'ready' : 'growing', seed, pct: clamp(elapsed/growMs*100) };
}
function openGarden(){
  let html = `<div class="garden">`;
  state.garden.forEach((plot, i)=>{
    const st = gardenPlotState(plot);
    if(st.phase==='empty'){
      html += `<div class="plot"><div class="plot-soil">🟫</div><div class="plot-lbl">Vacía</div>
        <button class="buy" onclick="choosePlant(${i})">Plantar 🌱</button></div>`;
    } else if(st.phase==='growing'){
      html += `<div class="plot"><div class="plot-soil growing">🌱</div>
        <div class="plot-bar"><i style="width:${st.pct}%"></i></div>
        <button class="buy" ${plot.watered?'disabled':''} onclick="waterPlot(${i})">${plot.watered?'Regada 💧':'Regar 💧'}</button></div>`;
    } else {
      html += `<div class="plot"><div class="plot-soil ready">${st.seed.grown}</div><div class="plot-lbl">¡Lista!</div>
        <button class="buy" onclick="harvestPlot(${i})" style="background:linear-gradient(180deg,#ffd85c,#ffb84d)">Cosechar +🪙${st.seed.reward}</button></div>`;
    }
  });
  html += `</div><button class="btn btn-primary big" onclick="openShop('seeds')">Comprar semillas 🌱</button>`;
  openModal('🌱 Jardín', html);
}
function choosePlant(i){
  const owned = SHOP.seeds.filter(s=>state.seedsInv[s.id]>0);
  if(owned.length===0){ toast('No tenés semillas 🌱'); openShop('seeds'); return; }
  const html = `<div class="shop-grid">` + owned.map(s=>`
    <div class="shop-item"><div class="emoji">${s.emoji}</div>
      <div class="name">${s.name} ×${state.seedsInv[s.id]}</div>
      <div class="desc">Crece en ${s.growMin} min · +🪙${s.reward}</div>
      <button class="buy" onclick="plantSeed(${i},'${s.id}')">Plantar</button></div>`).join('') + `</div>`;
  openModal('🌱 Elegí qué plantar', html);
}
function plantSeed(i, seedId){
  if(!(state.seedsInv[seedId]>0)) return;
  state.seedsInv[seedId]--;
  if(state.seedsInv[seedId]<=0) delete state.seedsInv[seedId];
  state.garden[i] = { seedId, plantedAt: Date.now(), watered:false };
  save(); toast('¡Plantado! 🌱'); openGarden();
}
function waterPlot(i){
  if(state.garden[i]){ state.garden[i].watered = true; save(); toast('¡Regada! 💧 Crece más rápido'); openGarden(); }
}
function harvestPlot(i){
  const plot = state.garden[i]; if(!plot) return;
  const st = gardenPlotState(plot);
  if(st.phase!=='ready') return;
  addCoins(st.seed.reward);
  applyRestore({ happiness: 8 });
  state.counters.harvests++;
  state.garden[i] = null;
  fx(st.seed.grown); bubble('¡A cosechar! 🌻'); addXP(6); afterAction();
  toast(`Cosechaste ${st.seed.name} +🪙${st.seed.reward}`);
  openGarden();
}

/* ---------- Vecino ---------- */
function openVisit(){
  const now = Date.now();
  const DAY = 22*60*60*1000;
  const canVisit = now - state.lastVisit >= DAY;
  const petHtml = petSVGFor(NEIGHBOR.species, NEIGHBOR.color, 'happy', {head:'bow',eyes:'',neck:''});
  const html = `
    <div class="visit">
      <div class="visit-pet">${petHtml}</div>
      <p>Visitás a <b>${NEIGHBOR.name}</b>, la mascota de tu vecino 🏠</p>
      ${canVisit
        ? `<button class="btn btn-primary big" onclick="doVisit()">Saludar y jugar 👋</button>`
        : `<p class="inv-empty">Ya visitaste hoy 💚<br>Volvé mañana por más monedas.</p>`}
    </div>`;
  openModal('🏠 Visitar al vecino', html);
}
function doVisit(){
  const reward = 20 + state.level*3;
  state.lastVisit = Date.now();
  state.counters.visits++;
  addCoins(reward);
  applyRestore({ happiness: 14 });
  fx('👋'); fx('💗',55);
  toast(`¡${NEIGHBOR.name} te dio +🪙${reward}!`);
  addXP(5); afterAction();
  openVisit();
}

/* ---------- Caja misteriosa ---------- */
function openBox(freeExtra){
  const now = Date.now();
  const DAY = 22*60*60*1000;
  const canFree = now - state.lastBox >= DAY;
  const html = `
    <div class="box-area">
      <div class="box-emoji">🎁</div>
      <p>Abrí una caja y llevate un premio sorpresa: monedas, comida, ropa ¡o Patitas! 🐾</p>
      ${canFree ? `<button class="btn btn-primary big" onclick="doBox(true)">Abrir caja diaria (gratis) 🎁</button>` : ''}
      <button class="btn big" onclick="doBox(false)">Abrir caja (🪙25)</button>
      ${!canFree ? `<p class="inv-empty" style="padding:8px">La caja gratis vuelve mañana ⏰</p>`:''}
    </div>`;
  openModal('🎁 Caja misteriosa', html);
  if(freeExtra){ // canje premium: abre varias
    let n = freeExtra;
    const chain = ()=>{ if(n-->0){ awardBox(); setTimeout(chain, 700); } else openBox(); };
    chain();
  }
}
function doBox(free){
  if(free){
    if(Date.now() - state.lastBox < 22*60*60*1000){ toast('La caja gratis vuelve mañana'); return; }
    state.lastBox = Date.now();
  } else {
    if(state.coins < 25){ toast('Te faltan monedas 💸'); return; }
    addCoins(-25);
  }
  awardBox();
  save(); openBox();
}
function awardBox(){
  const roll = Math.random();
  let msg;
  if(roll < 0.45){ const c = 15 + Math.floor(Math.random()*40); addCoins(c); msg = `+🪙${c}`; fx('🪙'); }
  else if(roll < 0.70){ const f = SHOP.food[Math.floor(Math.random()*SHOP.food.length)]; state.inventory[f.id]=(state.inventory[f.id]||0)+1; msg = `${f.emoji} ${f.name}`; fx(f.emoji); }
  else if(roll < 0.88){ const notOwned = SHOP.clothes.filter(c=>!state.wardrobe.includes(c.id)); if(notOwned.length){ const cl=notOwned[Math.floor(Math.random()*notOwned.length)]; state.wardrobe.push(cl.id); msg=`👗 ${cl.name}!`; fx(cl.emoji);} else { addCoins(30); msg='+🪙30'; } }
  else { addPaw(1); msg = '+1 🐾 ¡Patita!'; fx('🐾'); }
  toast(`🎁 Ganaste ${msg}`);
  checkAchievements();
}

/* ---------- Logros ---------- */
function openAchievements(){
  const done = state.achievements.length;
  const html = `<div class="wallet-line">Desbloqueados ${done}/${ACHIEVEMENTS.length} · 🐾 ${state.pawPoints}</div>
    <div class="ach-list">` + ACHIEVEMENTS.map(a=>{
      const on = state.achievements.includes(a.id);
      return `<div class="ach ${on?'on':'off'}">
        <span class="ach-ico">${on?a.emoji:'🔒'}</span>
        <div><b>${a.name}</b><small>${a.desc}</small></div>
        <span class="ach-paw">${on?'✔':'+'+a.paw+'🐾'}</span></div>`;
    }).join('') + `</div>`;
  openModal('🏆 Logros', html);
}

/* ---------- Menú ---------- */
function openMenu(){
  openModal('☰ Menú', `
    <div class="menu-list">
      <button class="btn" onclick="dailyBonus()">🎁 Bono diario</button>
      <button class="btn" onclick="openRename()">✏️ Cambiar nombre</button>
      <button class="btn" onclick="openAchievements()">🏆 Logros</button>
      <button class="btn" onclick="closeModal()">▶️ Seguir jugando</button>
      <button class="btn danger" onclick="resetGame()">🗑️ Reiniciar juego</button>
      <p style="text-align:center;color:var(--ink-soft);font-size:12px;margin-top:6px">
        Pet Pals · juego original · guardado en tu navegador</p>
    </div>`);
}
function openRename(){
  openModal('✏️ Cambiar nombre', `
    <input id="renameInput" type="text" maxlength="14" value="${state.name}"
      style="width:100%;padding:12px 14px;border-radius:14px;border:2px solid #f0dbe8;font-family:'Nunito';font-weight:700;font-size:16px;margin-bottom:12px" />
    <button class="btn btn-primary big" onclick="doRename()">Guardar</button>`);
  setTimeout(()=> $('#renameInput')?.focus(), 50);
}
function doRename(){
  const v = $('#renameInput').value.trim();
  if(v){ state.name = v; renderTop(); save(); toast('¡Nombre actualizado!'); }
  closeModal();
}
function dailyBonus(){
  const now = Date.now(), DAY = 22*60*60*1000;
  if(now - state.lastDaily < DAY){
    const left = Math.ceil((DAY - (now - state.lastDaily))/3600000);
    toast(`Volvé en ~${left}h para el próximo bono`); return;
  }
  state.lastDaily = now;
  const reward = 25 + state.level * 5;
  addCoins(reward); fx('🎁'); fx('🪙',55);
  toast(`¡Bono diario! +${reward}🪙`); save(); closeModal();
}
function resetGame(){
  if(!confirm('¿Seguro que querés reiniciar? Se perderá tu mascota y tus monedas.')) return;
  localStorage.removeItem(SAVE_KEY); location.reload();
}

/* ============================================================
   Mini-juego: atrapar
   ============================================================ */
let mg = null;
function openMinigame(){
  if(state.stats.energy < 12){ bubble('Estoy muy cansado 😩'); return; }
  $('#minigame').classList.remove('hidden');
  const field = $('#mgField'); field.innerHTML = '';
  mg = { score:0, time:20, balls:[] };
  $('#mgScore').textContent = 0; $('#mgTime').textContent = 20;
  mg.timer = setInterval(()=>{ mg.time--; $('#mgTime').textContent = mg.time; if(mg.time<=0) endMinigame(); }, 1000);
  mg.loop = setInterval(mgFrame, 30);
  mg.spawner = setInterval(spawnBall, 700);
}
const MG_EMOJIS = ['🎾','⚽','🏀','🎈','⭐'];
function spawnBall(){
  const field = $('#mgField');
  const b = document.createElement('div');
  b.className = 'mg-ball';
  b.textContent = MG_EMOJIS[Math.floor(Math.random()*MG_EMOJIS.length)];
  b.style.left = (10 + Math.random()*80) + '%';
  b.style.top = '-50px'; b._y = -50;
  b._speed = 2 + Math.random()*2.4 + state.level*0.15;
  b.addEventListener('pointerdown', e=>{
    e.preventDefault(); if(b._done) return; b._done = true;
    mg.score++; $('#mgScore').textContent = mg.score; b.textContent = '✨';
    setTimeout(()=> b.remove(), 150);
  });
  field.appendChild(b); mg.balls.push(b);
}
function mgFrame(){
  const h = $('#mgField').clientHeight;
  mg.balls = mg.balls.filter(b=>{
    if(b._done) return document.body.contains(b);
    b._y += b._speed; b.style.top = b._y + 'px';
    if(b._y > h){ b.remove(); return false; }
    return true;
  });
}
function endMinigame(){
  if(!mg) return;
  clearInterval(mg.timer); clearInterval(mg.loop); clearInterval(mg.spawner);
  const earned = mg.score;
  $('#minigame').classList.add('hidden');
  addCoins(earned);
  applyRestore({ happiness: Math.min(30, earned*2), energy: -14 });
  state.counters.plays++;
  addXP(earned);
  toast(`¡Ganaste ${earned}🪙 jugando! 🎉`); bubble('¡Qué divertido! 🎉');
  afterAction(); mg = null;
}

/* ============================================================
   Pesca
   ============================================================ */
const FISH = [ {e:'🐟',n:'Pez',c:12}, {e:'🐠',n:'Pez tropical',c:20}, {e:'🐡',n:'Globo',c:28}, {e:'🦐',n:'Camarón',c:10}, {e:'🦀',n:'Cangrejo',c:24}, {e:'🐙',n:'Pulpo',c:35}, {e:'🥾',n:'Bota vieja',c:2} ];
let fishState = 'idle', fishTimer = null;
function openFishing(){
  $('#fishing').classList.remove('hidden');
  resetFishing();
}
function resetFishing(){
  fishState = 'idle';
  clearTimeout(fishTimer);
  $('#fishBobber').textContent = '🎣';
  $('#fishBobber').classList.remove('bite');
  $('#fishHelp').textContent = 'Lanzá la caña y esperá a que pique. ¡Cada intento cuesta un poco de energía!';
  $('#fishAction').textContent = 'Lanzar caña';
  $('#fishAction').disabled = state.stats.energy < 8;
}
function fishActionClick(){
  if(fishState === 'idle'){
    if(state.stats.energy < 8){ toast('Sin energía para pescar 😴'); return; }
    applyRestore({ energy: -6 }); renderStats(); save();
    fishState = 'waiting';
    $('#fishHelp').textContent = 'Esperando... 🎣';
    $('#fishAction').textContent = 'Esperando...';
    $('#fishAction').disabled = true;
    $('#fishBobber').textContent = '🎣';
    const wait = 1200 + Math.random()*2800;
    fishTimer = setTimeout(()=>{
      fishState = 'bite';
      $('#fishBobber').textContent = '❗';
      $('#fishBobber').classList.add('bite');
      $('#fishHelp').textContent = '¡PICÓ! ¡Tocá rápido! 🎣';
      $('#fishAction').textContent = '¡Atrapar!';
      $('#fishAction').disabled = false;
      // ventana de reacción
      fishTimer = setTimeout(()=>{
        if(fishState==='bite'){ fishState='idle'; $('#fishHelp').textContent='Se escapó... probá de nuevo 🌊'; $('#fishBobber').textContent='🎣'; $('#fishBobber').classList.remove('bite'); $('#fishAction').textContent='Lanzar caña'; $('#fishAction').disabled = state.stats.energy<8; }
      }, 1100);
    }, wait);
  } else if(fishState === 'bite'){
    clearTimeout(fishTimer);
    const fish = FISH[Math.floor(Math.random()*FISH.length)];
    addCoins(fish.c);
    applyRestore({ happiness: 6 });
    if(fish.e!=='🥾'){ state.counters.catches++; }
    $('#fishBobber').textContent = fish.e;
    $('#fishBobber').classList.remove('bite');
    $('#fishHelp').textContent = `¡Atrapaste ${fish.n}! +🪙${fish.c}`;
    $('#fishAction').textContent = 'Lanzar de nuevo';
    fishState = 'idle';
    fx(fish.e); addXP(4); checkAchievements(); save();
    setTimeout(()=>{ $('#fishAction').disabled = state.stats.energy<8; }, 10);
  }
}
function closeFishing(){ clearTimeout(fishTimer); fishState='idle'; $('#fishing').classList.add('hidden'); }

/* ============================================================
   Tick: decaimiento de estados
   ============================================================ */
function applyDecay(){
  const now = Date.now();
  const minutes = (now - state.lastTick) / 60000;
  if(minutes <= 0){ state.lastTick = now; return; }
  for(const k in DECAY){
    let rate = DECAY[k];
    if(state.sleeping){
      if(k==='energy'){ state.stats.energy = clamp(state.stats.energy + minutes*2.2); continue; }
      rate *= 0.4;
    }
    state.stats[k] = clamp(state.stats[k] - rate*minutes);
  }
  state.lastTick = now;
}
function tick(){
  applyDecay(); renderStats(); renderPet();
  const crit = Object.entries(state.stats).find(([,v]) => v < 15);
  if(crit && !state.sleeping && Math.random() < 0.15){
    const msgs = { hunger:'¡Tengo hambre! 🍽️', happiness:'Me aburro... 😔', hygiene:'Necesito un baño 🛁', energy:'Estoy agotado 😴' };
    bubble(msgs[crit[0]]);
  }
  save();
}

/* ============================================================
   Creación de mascota
   ============================================================ */
let draft = { species:'cat', color:'cream' };
function buildCreator(){
  const sp = $('#speciesPicker');
  sp.innerHTML = Object.entries(SPECIES).map(([k,v])=>
    `<button class="pick ${k===draft.species?'selected':''}" data-species="${k}" title="${v.name}">${SPECIES_EMOJI[k]}</button>`).join('');
  sp.onclick = e=>{
    const b = e.target.closest('[data-species]'); if(!b) return;
    draft.species = b.dataset.species; state.species = draft.species;
    $$('#speciesPicker .pick').forEach(p=>p.classList.toggle('selected', p===b));
    renderPet($('#previewPet'));
  };
  const cp = $('#colorPicker');
  cp.innerHTML = Object.entries(COLORS).map(([k,v])=>
    `<button class="pick color ${k===draft.color?'selected':''}" data-color="${k}"><span class="swatch" style="background:${v}"></span></button>`).join('');
  cp.onclick = e=>{
    const b = e.target.closest('[data-color]'); if(!b) return;
    draft.color = b.dataset.color; state.color = draft.color;
    $$('#colorPicker .pick').forEach(p=>p.classList.toggle('selected', p===b));
    renderPet($('#previewPet'));
  };
  renderPet($('#previewPet'));
}
function adopt(){
  const name = $('#petName').value.trim() || 'Coco';
  state = DEFAULT_STATE();
  state.name = name; state.species = draft.species; state.color = draft.color;
  state.lastTick = Date.now();
  save(); startGame();
}

/* ============================================================
   Arranque
   ============================================================ */
function startGame(){
  $('#welcome').classList.add('hidden');
  $('#game').classList.remove('hidden');
  applyDecay(); renderAll();
  if(state.sleeping){
    $$('.act').forEach(b=>{ if(b.dataset.action!=='sleep') b.disabled = true; });
    $('.act[data-action="sleep"]').innerHTML = '<span>⏰</span>Despertar';
  }
}
function bindGame(){
  $$('.act').forEach(btn=>{
    btn.addEventListener('click', ()=>{ const a = btn.dataset.action; if(ACTIONS[a]) ACTIONS[a](); });
  });
  $('#petStage').addEventListener('click', ()=>{ if(!state.sleeping) ACTIONS.pet(); });
  $('#menuBtn').addEventListener('click', openMenu);
  $('#modalClose').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', e=>{ if(e.target.id==='modal') closeModal(); });
  $('#mgClose').addEventListener('click', endMinigame);
  $('#fishAction').addEventListener('click', fishActionClick);
  $('#fishClose').addEventListener('click', closeFishing);
  $('#adoptBtn').addEventListener('click', adopt);
}
function init(){
  bindGame();
  if(load()) startGame(); else buildCreator();
  setInterval(tick, 15000);
  window.addEventListener('beforeunload', save);
}

Object.assign(window, {
  openShop, buyItem, removeDecor, applyTheme, feedItem, openFeed,
  openWardrobe, equip, openGarden, choosePlant, plantSeed, waterPlot, harvestPlot,
  openVisit, doVisit, openBox, doBox, openAchievements,
  dailyBonus, openRename, doRename, resetGame, closeModal,
});

document.addEventListener('DOMContentLoaded', init);
