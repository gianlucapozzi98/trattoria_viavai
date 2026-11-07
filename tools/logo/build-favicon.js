// Favicon: ovale dell'insegna con la V calligrafica
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');
const [fontDir, out] = process.argv.slice(2);
const font = opentype.loadSync(path.join(fontDir, 'MeaCulpa.ttf'));
const p0 = font.getPath('V', 0, 0, 36);
const bb = p0.getBoundingBox();
const dx = 32 - (bb.x1 + bb.x2) / 2, dy = 33 - (bb.y1 + bb.y2) / 2;
const d = font.getPath('V', dx, dy, 36).toPathData(1);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3d27c"/><stop offset="1" stop-color="#b47722"/></linearGradient></defs>
  <path d="M1 32 C 8 12 20 6 32 6 C 44 6 56 12 63 32 C 56 52 44 58 32 58 C 20 58 8 52 1 32 Z" fill="#38373b" stroke="#1d1c1f" stroke-width="2"/>
  <path d="${d}" fill="url(#g)" stroke="url(#g)" stroke-width="1.6" stroke-linejoin="round"/>
</svg>
`;
fs.writeFileSync(out, svg);
console.log('favicon ok', svg.length);
