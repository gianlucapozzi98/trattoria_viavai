// Costruisce il logo della Trattoria ViaVai ispirato all'insegna in ferro.
// Uso: node build-logo.js <cartella-font> <file-svg-out> <file-symbol-out>
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');

const [fontDir, outSvg, outSymbol] = process.argv.slice(2);
const script = opentype.loadSync(path.join(fontDir, 'MeaCulpa.ttf'));
const sans = opentype.loadSync(path.join(fontDir, 'Kanit-SemiBold.ttf'));

const W = 600, H = 320, CX = 300;
const r = (n) => Math.round(n * 10) / 10;

function pathData(p) { return p.toPathData(1); }

// --- "TRATTORIA" con spaziatura, centrato ---
function trackedPath(font, text, size, tracking, baseline) {
  const scale = size / font.unitsPerEm;
  const glyphs = font.stringToGlyphs(text);
  let width = 0;
  glyphs.forEach((g, i) => { width += g.advanceWidth * scale + (i < glyphs.length - 1 ? tracking : 0); });
  let x = CX - width / 2;
  const parts = [];
  glyphs.forEach((g) => {
    parts.push(pathData(g.getPath(x, baseline, size)));
    x += g.advanceWidth * scale + tracking;
  });
  return parts.join('');
}

// --- "ViaVai" calligrafico, centrato sul suo ingombro reale ---
function centeredPath(font, text, size, cy) {
  const p0 = font.getPath(text, 0, 0, size);
  const bb = p0.getBoundingBox();
  const dx = CX - (bb.x1 + bb.x2) / 2;
  const dy = cy - (bb.y1 + bb.y2) / 2;
  return { d: pathData(font.getPath(text, dx, dy, size)), bb: { x1: bb.x1 + dx, x2: bb.x2 + dx, y1: bb.y1 + dy, y2: bb.y2 + dy } };
}

const trattoria = trackedPath(sans, 'TRATTORIA', 25, 7.5, 116);
const viavai = centeredPath(script, 'ViaVai', 118, 177);

// --- Forma dell'insegna: ovale con punte laterali ---
const lens = `M14 160 C 74 52 196 22 300 22 C 404 22 526 52 586 160 C 526 268 404 298 300 298 C 196 298 74 268 14 160 Z`;

// --- Ghirigori (metà sinistra, poi specchiata) ---
const flourishHalf = `
  <path d="M298 46 C 268 30 228 40 228 64 C 228 82 250 90 262 79 C 272 70 266 56 254 59" />
  <path d="M231 72 C 212 92 180 94 158 82 C 146 75 134 77 128 88" />
  <path d="M289 56 C 279 68 281 83 294 86" />
  <circle cx="128" cy="90" r="4.5" class="dot" />`;
const flourish = (y, flip) => `
  <g transform="${flip ? `translate(0 ${y}) scale(1 -1)` : `translate(0 ${y})`} translate(300 64) scale(.82) translate(-300 -64)">
    <g>${flourishHalf}</g>
    <g transform="translate(${W} 0) scale(-1 1)">${flourishHalf}</g>
    <circle cx="300" cy="94" r="8.5" class="dot" />
  </g>`;

const defs = `
  <defs>
    <radialGradient id="vv-iron" cx="45%" cy="38%" r="75%">
      <stop offset="0" stop-color="#4f4e52"/>
      <stop offset=".65" stop-color="#3a393d"/>
      <stop offset="1" stop-color="#2a292c"/>
    </radialGradient>
    <linearGradient id="vv-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f3d27c"/>
      <stop offset=".45" stop-color="#d09a3a"/>
      <stop offset="1" stop-color="#9c6a22"/>
    </linearGradient>
    <linearGradient id="vv-silver" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#eef0ea"/>
      <stop offset=".6" stop-color="#cfd3cc"/>
      <stop offset="1" stop-color="#a6aaa3"/>
    </linearGradient>
    <filter id="vv-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .16 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="vv-worn" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="3" result="t"/>
      <feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.75" result="m"/>
      <feComposite in="SourceGraphic" in2="m" operator="in"/>
    </filter>
    <clipPath id="vv-clip"><path d="${lens}"/></clipPath>
  </defs>`;

const body = `
  <path d="${lens}" fill="url(#vv-iron)"/>
  <rect width="${W}" height="${H}" filter="url(#vv-grain)" clip-path="url(#vv-clip)"/>
  <path d="${lens}" fill="none" stroke="#1d1c1f" stroke-width="5"/>
  <path d="${lens}" fill="none" stroke="#6b6a6e" stroke-width="1.5" transform="translate(300 160) scale(.975) translate(-300 -160)" opacity=".6"/>
  <g fill="none" stroke="url(#vv-gold)" stroke-width="9.5" stroke-linecap="round" filter="url(#vv-worn)">
    <style>.dot{fill:url(#vv-gold);stroke:none}</style>
    ${flourish(-8, false)}
    ${flourish(328, true)}
  </g>
  <path d="${trattoria}" fill="url(#vv-silver)"/>
  <path d="${viavai.d}" fill="url(#vv-silver)" stroke="#d3d6cf" stroke-width="2.2" stroke-linejoin="round"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Trattoria ViaVai">
  <title>Trattoria ViaVai</title>${defs}${body}
</svg>
`;
fs.writeFileSync(outSvg, svg);

// Versione <symbol> da inserire nella pagina (defs separati, id univoci)
const symbol = `${defs.replace('<defs>', '<defs>')}
  <symbol id="logo-viavai" viewBox="0 0 ${W} ${H}">${body}
  </symbol>`;
fs.writeFileSync(outSymbol, symbol);

console.log('ViaVai bbox', JSON.stringify(viavai.bb), 'svg bytes', svg.length);
