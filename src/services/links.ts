import { obtener } from '@/services/storage';

// ─── URL base ─────────────────────────────────────────────
const API = 'https://agendaapi.browny.es/links2';

// ─── Token temporal hardcodeado ───────────────────────────
const TOKEN_TEMP = '0fb2a3d0dbf0547a626e041aea9bf07d2499409610d424c20551e05bbf751bdf';

// ─── Tipo Link ────────────────────────────────────────────
export interface Link {
  link_id: number;
  link_url: string;
  link_nombre: string;
  link_texto_titulo: string;
  link_texto_description: string;
  link_site: string;
  link_url_img: string;
  link_cat_id: number;
  link_user_id: number;
  link_DATE_INSERT: string;
}

// ─── Obtener token ────────────────────────────────────────
async function obtenerToken(): Promise<string> {
  const tokenGuardado = await obtener('token');
  return tokenGuardado ?? TOKEN_TEMP;
}

// ─── Traer links ──────────────────────────────────────────
export async function traerLinks(): Promise<Link[]> {
  const token = await obtenerToken();

  const respuesta = await fetch(`${API}/select.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token,
    },
    body: JSON.stringify({
      sql: 'SELECT * FROM link_links WHERE link_user_id = :user_id ORDER BY link_DATE_INSERT DESC',
      params: { ':user_id': 1 },
    }),
  });

  const datos = await respuesta.json();

  if (!datos.ok) {
    throw new Error(datos.error || 'Error al traer los links');
  }

  return datos.results;
}