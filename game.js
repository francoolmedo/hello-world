/* ============================================================
   Pet Pals — juego de mascota virtual (obra original)
   Inspirado en el género de Pet Society. Todo el arte y el
   código son propios. Guardado local en el navegador.
   ============================================================ */

'use strict';

/* ---------- Config ---------- */
const SPECIES = {
  cat:    { name: 'Gato',    ears: 'cat' },
  bunny:  { name: 'Conejo',  ears: 'bunny' },
  bear:   { name: 'Oso',     ears: 'bear' },
  puppy:  { name: 'Perrito', ears: 'puppy' },
};
const SPECIES_EMOJI = { cat:'🐱', bunny:'🐰', bear:'🐻', puppy:'🐶' };

const COLORS = {
  cream:  '#ffe1c4',
  pink:   '#ffc2dd',
  gray:   '#cdd4e0',
  mint:   '#bfead4',
  lilac:  '#d8c6ff',
  peach:  '#ffcbb0',
  butter: '#ffe79e',
  sky:    '#bfe0ff',
};

// Cada estado baja este % por minuto real
const DECAY = { hunger: 1.1, happiness: 0.8, hygiene: 0.6, energy: 0.7 };

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
  ],
};

// posiciones fijas para la decoración dentro de la habitación
const DECOR_SLOTS = [
  { left:'8%',  top:'8%'  }, { left:'80%', top:'10%' },
  { left:'6%',  top:'60%' }, { left:'82%', top:'58%' },
  { left:'44%', top:'6%'  }, { left:'24%', top:'62%' },
];

/* ---------- Estado ---------- */
const DEFAULT_STATE = () => ({
  name: 'Coco',
  species: 'cat',
  color: 'cream',
  coins: 60,
  level: 1,
  xp: 0,
  stats: { hunger: 80, happiness: 80, hygiene: 80, energy: 80 },
  inventory: {},        // { itemId: cantidad }  (comida y juguetes consumibles/usables)
  decor: [],            // [itemId, ...] colocados en la habitación
  lastTick: Date.now(),
  lastDaily: 0,
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
    state = Object.assign(DEFAULT_STATE(), parsed);
    state.stats = Object.assign(DEFAULT_STATE().stats, parsed.stats || {});
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
   Dibujo de la mascota (SVG) — expresión según humor
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
  // ojos y boca según humor
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
    default: /* neutral */
      eyes  = `<circle cx="81" cy="${eyeY}" r="7" fill="#5a4a55"/><circle cx="119" cy="${eyeY}" r="7" fill="#5a4a55"/>
               <circle cx="84" cy="93" r="2.4" fill="#fff"/><circle cx="122" cy="93" r="2.4" fill="#fff"/>`;
      mouth = `<path d="M92 116 q8 8 16 0" stroke="#5a4a55" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  }
  const blush = (mood==='happy' || mood==='neutral')
    ? `<ellipse cx="66" cy="112" rx="9" ry="6" fill="#ff9ec4" opacity=".55"/>
       <ellipse cx="134" cy="112" rx="9" ry="6" fill="#ff9ec4" opacity=".55"/>` : '';
  return eyes + mouth + blush + extra;
}

function petSVG(){
  const fill   = COLORS[state.color] || COLORS.cream;
  const stroke = shade(fill, -22);
  const mood   = moodFromStats();
  const ears   = earsSVG(SPECIES[state.species].ears, fill, stroke);
  const face   = eyesMouthSVG(mood);
  const tail   = state.species==='puppy' || state.species==='cat'
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
      ${face}
      <ellipse cx="100" cy="108" rx="4" ry="3" fill="#c98a9a"/>
      <ellipse cx="72" cy="196" rx="14" ry="9" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
      <ellipse cx="128" cy="196" rx="14" ry="9" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
    </g>
  </svg>`;
}

// aclara/oscurece un color hex
function shade(hex, pct){
  const n = parseInt(hex.slice(1),16);
  let r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  r=clamp(r+pct, 0,255); g=clamp(g+pct,0,255); b=clamp(b+pct,0,255);
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}

/* ============================================================
   Render
   ============================================================ */
function renderPet(target){
  const stage = target || $('#petStage');
  if(!stage) return;
  stage.innerHTML = petSVG();
  stage.className = 'pet-stage' + (stage.id==='previewPet' ? ' small' : '');
  if(state.sleeping){
    stage.classList.add('sleeping');
    stage.innerHTML += `<div class="zzz">Z</div>`;
  } else if(moodFromStats()==='happy'){
    stage.classList.add('happy');
  }
}

function renderStats(){
  $$('.stat').forEach(el=>{
    const key = el.dataset.stat;
    const v = clamp(state.stats[key]);
    const bar = $('i', el);
    bar.style.width = v + '%';
    bar.style.background = v > 55 ? 'linear-gradient(90deg,#8fe3c8,#5fcfae)'
                        : v > 25 ? 'linear-gradient(90deg,#ffe38a,#ffcf5c)'
                                 : 'linear-gradient(90deg,#ffb0b0,#ff7d7d)';
  });
}

function renderDecor(){
  const layer = $('#decorLayer');
  layer.innerHTML = '';
  state.decor.slice(0, DECOR_SLOTS.length).forEach((id, i)=>{
    const item = SHOP.decor.find(d=>d.id===id);
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
  $('#levelNum').textContent = state.level;
}

function renderAll(){
  renderTop();
  renderStats();
  renderDecor();
  renderPet();
}

/* ============================================================
   Economía / niveles
   ============================================================ */
function addCoins(n){ state.coins = Math.max(0, state.coins + n); renderTop(); }
function addXP(n){
  state.xp += n;
  const need = state.level * 100;
  if(state.xp >= need){
    state.xp -= need;
    state.level++;
    addCoins(state.level * 10);
    toast(`¡Subiste a nivel ${state.level}! +${state.level*10}🪙`);
    fx('⭐'); fx('🎉');
  }
  renderTop();
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
   Acciones
   ============================================================ */
function applyRestore(restore){
  for(const k in restore){
    if(state.stats[k] !== undefined) state.stats[k] = clamp(state.stats[k] + restore[k]);
  }
}

const ACTIONS = {
  feed(){ openFeed(); },
  play(){ openMinigame(); },
  wash(){
    if(state.stats.hygiene > 96){ bubble('¡Ya estoy limpio! ✨'); return; }
    applyRestore({ hygiene: 40, happiness: 4 });
    for(let i=0;i<5;i++) setTimeout(()=>fx('🫧'), i*120);
    bubble('¡Qué frescura! 🛁');
    addXP(4); afterAction();
  },
  sleep(){
    if(state.sleeping){ wake(); return; }
    state.sleeping = true;
    renderPet(); save();
    bubble('Zzz... 😴');
    $$('.act').forEach(b=>{ if(b.dataset.action!=='sleep') b.disabled = true; });
    $('.act[data-action="sleep"]').innerHTML = '<span>⏰</span>Despertar';
  },
  pet(){
    applyRestore({ happiness: 10 });
    fx('💗'); fx('💗', 55);
    bubble('¡Me encanta! 💗');
    bounce();
    addXP(2); afterAction();
  },
  shop(){ openShop(); },
};

function wake(){
  state.sleeping = false;
  applyRestore({ energy: 60 });
  $$('.act').forEach(b=> b.disabled = false);
  $('.act[data-action="sleep"]').innerHTML = '<span>😴</span>Dormir';
  renderPet(); bubble('¡Buen día! ☀️');
  addXP(5); afterAction();
}

function afterAction(){
  renderStats(); renderPet(); save();
}

function feedItem(itemId){
  const item = SHOP.food.find(f=>f.id===itemId);
  if(!item || !(state.inventory[itemId] > 0)) return;
  if(state.stats.hunger > 96){ bubble('¡Estoy lleno! 🙅'); return; }
  state.inventory[itemId]--;
  if(state.inventory[itemId] <= 0) delete state.inventory[itemId];
  applyRestore(item.restore);
  fx(item.emoji); bubble('¡Ñam ñam! 😋'); bounce();
  addXP(3); afterAction();
  openFeed(); // refresca la lista
}

/* ============================================================
   Modales: comida, tienda, menú
   ============================================================ */
function openModal(title, html){
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = html;
  $('#modal').classList.remove('hidden');
}
function closeModal(){ $('#modal').classList.add('hidden'); }

function openFeed(){
  const owned = SHOP.food.filter(f => state.inventory[f.id] > 0);
  let html;
  if(owned.length === 0){
    html = `<p class="inv-empty">No tenés comida 🍽️<br>¡Comprá en la Tienda!</p>
            <button class="btn btn-primary big" onclick="openShop('food')">Ir a la tienda 🛍️</button>`;
  } else {
    html = `<div class="shop-grid">` + owned.map(f=>`
      <div class="shop-item">
        <div class="emoji">${f.emoji}</div>
        <div class="name">${f.name} ×${state.inventory[f.id]}</div>
        <div class="desc">${f.desc}</div>
        <button class="buy" onclick="feedItem('${f.id}')">Dar de comer</button>
      </div>`).join('') + `</div>`;
  }
  openModal('🍽️ Alimentar a ' + state.name, html);
}

let shopTab = 'food';
function openShop(tab){
  shopTab = tab || shopTab;
  const tabs = [['food','🍎 Comida'],['toys','🎾 Juguetes'],['decor','🪴 Decoración']];
  const tabsHtml = tabs.map(([k,l])=>
    `<button class="shop-tab ${k===shopTab?'active':''}" onclick="openShop('${k}')">${l}</button>`).join('');

  const items = SHOP[shopTab];
  const grid = items.map(it=>{
    const canBuy = state.coins >= it.price;
    const ownedDecor = shopTab==='decor' && state.decor.includes(it.id);
    let btn;
    if(ownedDecor){
      btn = `<button class="buy" onclick="removeDecor('${it.id}')" style="background:#f0a5be">Quitar</button>`;
    } else {
      const label = shopTab==='decor' ? `Colocar 🪙${it.price}` : `Comprar 🪙${it.price}`;
      btn = `<button class="buy" ${canBuy?'':'disabled'} onclick="buyItem('${shopTab}','${it.id}')">${label}</button>`;
    }
    const ownCount = (shopTab!=='decor' && state.inventory[it.id]) ? ` (tenés ${state.inventory[it.id]})` : '';
    return `<div class="shop-item">
      <div class="emoji">${it.emoji}</div>
      <div class="name">${it.name}</div>
      <div class="desc">${it.desc}${ownCount}</div>
      ${btn}
    </div>`;
  }).join('');

  openModal('🛍️ Tienda', `<div class="shop-tabs">${tabsHtml}</div><div class="shop-grid">${grid}</div>`);
}

function buyItem(cat, id){
  const item = SHOP[cat].find(i=>i.id===id);
  if(!item || state.coins < item.price) return;

  if(cat === 'decor'){
    if(state.decor.length >= DECOR_SLOTS.length){ toast('No hay más lugar en la habitación'); return; }
    if(state.decor.includes(id)){ toast('Ya está colocado'); return; }
    state.decor.push(id);
    addCoins(-item.price);
    renderDecor(); toast(`${item.name} colocado ✨`);
  } else if(cat === 'toys'){
    addCoins(-item.price);
    // los juguetes se usan al instante: suben felicidad
    applyRestore(item.restore);
    fx(item.emoji); bounce(); bubble('¡Qué divertido! 🎉');
    addXP(3); afterAction();
    toast(`¡${state.name} ama su ${item.name}!`);
  } else { // food -> al inventario
    addCoins(-item.price);
    state.inventory[id] = (state.inventory[id] || 0) + 1;
    toast(`Compraste ${item.name} 🛒`);
  }
  save();
  openShop(); // refresca
}

function removeDecor(id){
  state.decor = state.decor.filter(d=>d!==id);
  renderDecor(); save(); openShop();
}

function openMenu(){
  const html = `
    <div class="menu-list">
      <button class="btn" onclick="dailyBonus()">🎁 Bono diario</button>
      <button class="btn" onclick="openRename()">✏️ Cambiar nombre</button>
      <button class="btn" onclick="closeModal()">▶️ Seguir jugando</button>
      <button class="btn danger" onclick="resetGame()">🗑️ Reiniciar juego</button>
      <p style="text-align:center;color:var(--ink-soft);font-size:12px;margin-top:6px">
        Pet Pals · juego original · guardado en tu navegador
      </p>
    </div>`;
  openModal('☰ Menú', html);
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
  const now = Date.now();
  const DAY = 22*60*60*1000; // 22h para tolerancia
  if(now - state.lastDaily < DAY){
    const left = Math.ceil((DAY - (now - state.lastDaily))/3600000);
    toast(`Volvé en ~${left}h para el próximo bono`);
    return;
  }
  state.lastDaily = now;
  const reward = 25 + state.level * 5;
  addCoins(reward);
  fx('🎁'); fx('🪙',55);
  toast(`¡Bono diario! +${reward}🪙`);
  save(); closeModal();
}

function resetGame(){
  if(!confirm('¿Seguro que querés reiniciar? Se perderá tu mascota y tus monedas.')) return;
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}

/* ============================================================
   Mini-juego: atrapar pelotas
   ============================================================ */
let mg = null;
function openMinigame(){
  if(state.stats.energy < 12){ bubble('Estoy muy cansado 😩'); return; }
  $('#minigame').classList.remove('hidden');
  const field = $('#mgField');
  field.innerHTML = '';
  mg = { score:0, time:20, balls:[], spawn:0 };
  $('#mgScore').textContent = 0;
  $('#mgTime').textContent = 20;

  mg.timer = setInterval(()=>{
    mg.time--;
    $('#mgTime').textContent = mg.time;
    if(mg.time <= 0) endMinigame();
  }, 1000);

  mg.loop = setInterval(mgFrame, 30);
  mg.spawner = setInterval(spawnBall, 700);
}

const MG_EMOJIS = ['🎾','⚽','🏀','🎈','⭐'];
function spawnBall(){
  const field = $('#mgField');
  const b = document.createElement('div');
  b.className = 'mg-ball';
  b.textContent = MG_EMOJIS[Math.floor(Math.random()*MG_EMOJIS.length)];
  const x = 10 + Math.random()*80;
  b.style.left = x + '%';
  b.style.top = '-50px';
  b._y = -50;
  b._speed = 2 + Math.random()*2.4 + state.level*0.15;
  const hit = (e)=>{
    e.preventDefault();
    if(b._done) return;
    b._done = true;
    mg.score++;
    $('#mgScore').textContent = mg.score;
    b.textContent = '✨';
    setTimeout(()=> b.remove(), 150);
  };
  b.addEventListener('pointerdown', hit);
  field.appendChild(b);
  mg.balls.push(b);
}
function mgFrame(){
  const h = $('#mgField').clientHeight;
  mg.balls = mg.balls.filter(b=>{
    if(b._done){ return document.body.contains(b); }
    b._y += b._speed;
    b.style.top = b._y + 'px';
    if(b._y > h){ b.remove(); return false; }
    return true;
  });
}
function endMinigame(){
  clearInterval(mg.timer); clearInterval(mg.loop); clearInterval(mg.spawner);
  const earned = mg.score;
  $('#minigame').classList.add('hidden');
  addCoins(earned);
  applyRestore({ happiness: Math.min(30, earned*2), energy: -14 });
  addXP(earned);
  toast(`¡Ganaste ${earned}🪙 jugando! 🎉`);
  bubble('¡Qué divertido! 🎉');
  afterAction();
  mg = null;
}

/* ============================================================
   Tick: decaimiento de estados según tiempo real
   ============================================================ */
function applyDecay(){
  const now = Date.now();
  const minutes = (now - state.lastTick) / 60000;
  if(minutes <= 0){ state.lastTick = now; return; }

  for(const k in DECAY){
    // dormir frena el hambre/higiene y recupera energía suavemente
    let rate = DECAY[k];
    if(state.sleeping){
      if(k === 'energy'){ state.stats.energy = clamp(state.stats.energy + minutes*2.2); continue; }
      rate *= 0.4;
    }
    state.stats[k] = clamp(state.stats[k] - rate*minutes);
  }
  state.lastTick = now;
}

function tick(){
  applyDecay();
  renderStats();
  renderPet();
  // aviso si algún estado está crítico
  const crit = Object.entries(state.stats).find(([,v]) => v < 15);
  if(crit && !state.sleeping && Math.random() < 0.15){
    const msgs = { hunger:'¡Tengo hambre! 🍽️', happiness:'Me aburro... 😔', hygiene:'Necesito un baño 🛁', energy:'Estoy agotado 😴' };
    bubble(msgs[crit[0]]);
  }
  save();
}

/* ============================================================
   Creación de mascota (pantalla de bienvenida)
   ============================================================ */
let draft = { species:'cat', color:'cream' };

function buildCreator(){
  // especies
  const sp = $('#speciesPicker');
  sp.innerHTML = Object.entries(SPECIES).map(([k,v])=>
    `<button class="pick ${k===draft.species?'selected':''}" data-species="${k}" title="${v.name}">${SPECIES_EMOJI[k]}</button>`
  ).join('');
  sp.onclick = e=>{
    const b = e.target.closest('[data-species]'); if(!b) return;
    draft.species = b.dataset.species;
    state.species = draft.species;
    $$('#speciesPicker .pick').forEach(p=>p.classList.toggle('selected', p===b));
    renderPet($('#previewPet'));
  };

  // colores
  const cp = $('#colorPicker');
  cp.innerHTML = Object.entries(COLORS).map(([k,v])=>
    `<button class="pick color ${k===draft.color?'selected':''}" data-color="${k}">
       <span class="swatch" style="background:${v}"></span></button>`
  ).join('');
  cp.onclick = e=>{
    const b = e.target.closest('[data-color]'); if(!b) return;
    draft.color = b.dataset.color;
    state.color = draft.color;
    $$('#colorPicker .pick').forEach(p=>p.classList.toggle('selected', p===b));
    renderPet($('#previewPet'));
  };

  renderPet($('#previewPet'));
}

function adopt(){
  const name = $('#petName').value.trim() || 'Coco';
  state = DEFAULT_STATE();
  state.name = name;
  state.species = draft.species;
  state.color = draft.color;
  state.lastTick = Date.now();
  save();
  startGame();
}

/* ============================================================
   Arranque
   ============================================================ */
function startGame(){
  $('#welcome').classList.add('hidden');
  $('#game').classList.remove('hidden');
  applyDecay();
  renderAll();

  // si estaba durmiendo al cerrar, mantener el modo
  if(state.sleeping){
    $$('.act').forEach(b=>{ if(b.dataset.action!=='sleep') b.disabled = true; });
    $('.act[data-action="sleep"]').innerHTML = '<span>⏰</span>Despertar';
  }
}

function bindGame(){
  $$('.act').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const a = btn.dataset.action;
      if(ACTIONS[a]) ACTIONS[a]();
    });
  });
  $('#petStage').addEventListener('click', ()=>{
    if(state.sleeping) return;
    ACTIONS.pet();
  });
  $('#menuBtn').addEventListener('click', openMenu);
  $('#modalClose').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', e=>{ if(e.target.id==='modal') closeModal(); });
  $('#mgClose').addEventListener('click', endMinigame);
  $('#adoptBtn').addEventListener('click', adopt);
}

function init(){
  bindGame();
  if(load()){
    startGame();
  } else {
    buildCreator();
  }
  setInterval(tick, 15000);          // decaimiento cada 15s
  window.addEventListener('beforeunload', save);
}

// exponer funciones usadas desde onclick del HTML generado
Object.assign(window, {
  openShop, buyItem, removeDecor, feedItem, openFeed,
  dailyBonus, openRename, doRename, resetGame, closeModal,
});

document.addEventListener('DOMContentLoaded', init);
