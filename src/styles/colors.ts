// ─── Paleta ───────────────────────────────────────────────
export const COLOR_1 = '#a21d30';

const colores = {
  primario:   '#a21d30',
  secundario: '#8B5CF6',
  error:      '#EF4444',
  success:    '#22C55E',

  tag: '#F97316',

  dark: {
  fondo: '#0f0001',
  card: '#0f0f0f',
  texto: '#ffe5e7',
  textoSecundario: '#d4868f',  // ← nuevo
  muted: '#a59495',
  borde: '#542428',
},

light: {
  fondo: '#fff0f1',
  card: '#ffffff',
  texto: '#1b0002',
  textoSecundario: '#6b1020',  // ← nuevo
  muted: '#cbb2b4',
  borde: '#ffdfe2',
},

  componentes: {
    boton: {
      texto: '#ffffff',
      dark: {
        primarioHover:    '#f76e7a',
        primarioPress:    '#f77d87',
        secundarioHover:  '#9b6ef7',
        secundarioPress:  '#a37ef8',
        destructivoHover: '#f25f5f',
        destructivoPress: '#f47070',
        fantasmaHover:    '#f55b6822',
        fantasmaPress:    '#f55b6844',
      },
      light: {
        primarioHover:    '#e04452',
        primarioPress:    '#cc3a47',
        secundarioHover:  '#7a4de0',
        secundarioPress:  '#6a3ecc',
        destructivoHover: '#d93333',
        destructivoPress: '#c42a2a',
        fantasmaHover:    '#f55b6833',
        fantasmaPress:    '#f55b6855',
      },
    },
  },
};

export default colores;

// ─── Colores base ─────────────────────────────────────────






/************************************** */
const HUE1 = hexAHue(COLOR_1);
const SAT1 = hexASa(COLOR_1);
const BRI1 = hexABr(COLOR_1);

const COLOR_2 = '#8B5CF6';
const HUE2 = hexAHue(COLOR_2);
const SAT2 = hexASa(COLOR_2);
const BRI2 = hexABr(COLOR_2);


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