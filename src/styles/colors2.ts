
// ─── Colores base ─────────────────────────────────────────
export const COLOR_1 = '#f55b68';
const HUE1 = hexAHue(COLOR_1);
const SAT1 = hexASa(COLOR_1);
const BRI1 = hexABr(COLOR_1);

const COLOR_2 = '#8B5CF6';
const HUE2 = hexAHue(COLOR_2);
const SAT2 = hexASa(COLOR_2);
const BRI2 = hexABr(COLOR_2);

// ─── Paleta ───────────────────────────────────────────────
const colores = {
  primario:   hsl(HUE1, SAT1, BRI1),
  secundario: hsl(HUE2, SAT2, BRI2),
  error:      '#EF4444',
  success:    '#22C55E',

  dark: {
    fondo:  hsl(HUE1, 27,  8),
    card:   hsl(HUE1, 22, 13),
    texto:  hsl(HUE1, 30, 100),
    muted:  hsl(HUE1,  9, 46),
    borde:  hsl(HUE1, 24, 23),
  },

  light: {
    fondo:  hsl(HUE1, 100, 99),
    card:   hsl(0,      0, 100),
    texto:  hsl(HUE1,  22, 13),
    muted:  hsl(HUE1,   9, 46),
    borde:  hsl(HUE1,  33, 91),
  },
};

export default colores;


// ─── Helper HSL ───────────────────────────────────────────
function hsl(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}
function hexAHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return 0;
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / delta) % 6; break;
    case g: h = (b - r) / delta + 2;   break;
    case b: h = (r - g) / delta + 4;   break;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return h;
}
function hexASa(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  if (delta === 0) return 0;
  return Math.round((delta / (1 - Math.abs(2 * l - 1))) * 100);
}
function hexABr(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return Math.round(((max + min) / 2) * 100);
}