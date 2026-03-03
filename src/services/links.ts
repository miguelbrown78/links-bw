// src/services/links.ts

import { FiltroItem } from '@/components/links/FiltroPills';
import { API_BASE } from '@/constants/api';
import { obtener } from '@/services/storage';

const API = API_BASE;
export const LINKS_POR_PAGINA = 10;

// ─── Tipo Link ────────────────────────────────────────────
export interface Link {
  link_id: number;
  link_url: string;
  link_nombre: string;
  link_texto_titulo: string;
  link_texto_titulo_fecha: string;
  link_texto_description: string;
  link_url_img: string;
  link_site: string;
  link_fecha_post: string;
  link_DATE_INSERT: string;
  categoria_id: number;
  categoria_nombre: string;
  users_id: number;
  autor_nombre: string;
  autor_email: string;
  tags_nombres: string | null;
  tags_ids: string | null;
  categoria_color: string | null;
  link_ruta_img: string | null;
  tags: string[];
}

// ─── Cabeceras comunes ────────────────────────────────────
async function obtenerCabeceras(): Promise<Record<string, string>> {
  const token = await obtener('token');
  if (!token) throw new Error('No hay sesión activa.');
  return {
    'Content-Type': 'application/json',
    'X-Auth-Token': token,
  };
}

// ─── Normalizar tags ──────────────────────────────────────
function normalizarLinks(results: Omit<Link, 'tags'>[]): Link[] {
  return results.map((link) => ({
    ...link,
    tags: link.tags_nombres
      ? link.tags_nombres.split(', ').map((t) => t.trim()).filter(Boolean)
      : [],
  }));
}

// ─── Traer links paginados ────────────────────────────────
export async function traerLinks(offset: number = 0): Promise<Link[]> {
  const cabeceras = await obtenerCabeceras();
  const userId = await obtener('user_id');

  if (!userId) throw new Error('No hay sesión activa.');

  const respuesta = await fetch(`${API}/select.php`, {
    method: 'POST',
    headers: cabeceras,
    body: JSON.stringify({
      sql: 'SELECT * FROM view_links_completa WHERE users_id = :user_id ORDER BY link_DATE_INSERT DESC LIMIT :limite OFFSET :offset',
      params: {
        ':user_id': parseInt(userId),
        ':limite': LINKS_POR_PAGINA,
        ':offset': offset,
      },
    }),
  });

  const datos = await respuesta.json();
  if (!datos.ok) throw new Error(datos.error || 'Error al traer los links');

  return normalizarLinks(datos.results);
}

// ─── Buscar links paginados ───────────────────────────────
export async function buscarLinks(texto: string, offset: number = 0): Promise<Link[]> {
  const cabeceras = await obtenerCabeceras();
  const userId = await obtener('user_id');

  if (!userId) throw new Error('No hay sesión activa.');

  const busqueda = `%${texto}%`;

  const respuesta = await fetch(`${API}/select.php`, {
    method: 'POST',
    headers: cabeceras,
    body: JSON.stringify({
      sql: `SELECT * FROM view_links_completa 
            WHERE users_id = :user_id 
            AND (
              link_nombre LIKE :b1
              OR link_url LIKE :b2
              OR link_texto_description LIKE :b3
              OR tags_nombres LIKE :b4
            )
            ORDER BY link_DATE_INSERT DESC
            LIMIT :limite OFFSET :offset`,
      params: {
        ':user_id': parseInt(userId),
        ':b1': busqueda,
        ':b2': busqueda,
        ':b3': busqueda,
        ':b4': busqueda,
        ':limite': LINKS_POR_PAGINA,
        ':offset': offset,
      },
    }),
  });

  const datos = await respuesta.json();
  if (!datos.ok) throw new Error(datos.error || 'Error al buscar links');

  return normalizarLinks(datos.results);
}

// ─── Filtrar links por categoría o tag (OR) ───────────────
export async function filtrarLinksPorCategoriaOTag(
  filtros: FiltroItem[],
  offset: number = 0
): Promise<Link[]> {
  const cabeceras = await obtenerCabeceras();
  const userId = await obtener('user_id');

  if (!userId) throw new Error('No hay sesión activa.');

  const categoriaIds = filtros
    .filter((f) => f.tipo === 'categoria')
    .map((f) => f.id);

  const tagIds = filtros
    .filter((f) => f.tipo === 'tag')
    .map((f) => f.id);

  const condiciones: string[] = [];
  const params: Record<string, any> = {
    ':user_id': parseInt(userId),
    ':limite': LINKS_POR_PAGINA,
    ':offset': offset,
  };

  // ── Condiciones por categoría ──
  categoriaIds.forEach((id, i) => {
    condiciones.push(`categoria_id = :cat_${i}`);
    params[`:cat_${i}`] = id;
  });

  // ── Condiciones por tag ──
  tagIds.forEach((id, i) => {
    condiciones.push(`FIND_IN_SET(:tag_${i}, REPLACE(tags_ids, ', ', ',')) > 0`);
    params[`:tag_${i}`] = String(id);
  });

  const where = condiciones.length > 0
    ? `AND (${condiciones.join(' OR ')})`
    : '';

  const respuesta = await fetch(`${API}/select.php`, {
    method: 'POST',
    headers: cabeceras,
    body: JSON.stringify({
      sql: `SELECT * FROM view_links_completa
            WHERE users_id = :user_id
            ${where}
            ORDER BY link_DATE_INSERT DESC
            LIMIT :limite OFFSET :offset`,
      params,
    }),
  });

  const datos = await respuesta.json();
  if (!datos.ok) throw new Error(datos.error || 'Error al filtrar links');

  return normalizarLinks(datos.results);
}

// ─── Eliminar link ────────────────────────────────────────
export async function eliminarLink(link_id: number): Promise<void> {
  const cabeceras = await obtenerCabeceras();

  const respuesta = await fetch(`${API}/delete.php`, {
    method: 'POST',
    headers: cabeceras,
    body: JSON.stringify({
      tabla: 'link_links',
      id: link_id,
    }),
  });

  const datos = await respuesta.json();
  if (!datos.ok) throw new Error(datos.error || 'Error al eliminar el link');
}

// ─── Mover link a otra categoría ─────────────────────────
export async function moverLinkCategoria(link_id: number, categoria_id: number): Promise<void> {
  const cabeceras = await obtenerCabeceras();

  const respuesta = await fetch(`${API}/update.php`, {
    method: 'POST',
    headers: cabeceras,
    body: JSON.stringify({
      tabla: 'link_links',
      id: link_id,
      campos: ['link_cat_id'],
      valores: [categoria_id],
    }),
  });

  const datos = await respuesta.json();
  if (!datos.ok) throw new Error(datos.error || 'Error al mover el link');
}