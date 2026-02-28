import { obtener } from '@/services/storage';

const API = 'https://agendaapi.browny.es/links2';

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
  // Campo derivado — array de tags listo para usar
  tags: string[];
}

// ─── Traer links ──────────────────────────────────────────
export async function traerLinks(): Promise<Link[]> {
  const token  = await obtener('token');
  const userId = await obtener('user_id');

  if (!token || !userId) {
    throw new Error('No hay sesión activa.');
  }

  const respuesta = await fetch(`${API}/select.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token,
    },
    body: JSON.stringify({
      sql: 'SELECT * FROM view_links_completa WHERE users_id = :user_id ORDER BY link_DATE_INSERT DESC',
      params: { ':user_id': parseInt(userId) },
    }),
  });

  const datos = await respuesta.json();

  if (!datos.ok) {
    throw new Error(datos.error || 'Error al traer los links');
  }

  // ── Normalizar tags: string CSV → array ────────────────
  return datos.results.map((link: Omit<Link, 'tags'>) => ({
    ...link,
    tags: link.tags_nombres
      ? link.tags_nombres.split(', ').map((t) => t.trim()).filter(Boolean)
      : [],
  }));
}