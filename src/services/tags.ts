import { API_BASE } from '@/constants/api';
import { obtener } from '@/services/storage';

const API = API_BASE;

// ─── Tipos ────────────────────────────────────────────────

export interface Tag {
  tag_id: number;
  tag_nombre: string;
  tag_slug: string;
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

// ─── Traer todos los tags ─────────────────────────────────

export async function traerTags(): Promise<Tag[]> {
  const cabeceras = await obtenerCabeceras();

  const respuesta = await fetch(`${API}/select.php`, {
    method: 'POST',
    headers: cabeceras,
    body: JSON.stringify({
      sql: 'SELECT * FROM link_tags ORDER BY tag_nombre ASC',
      params: {},
    }),
  });

  const datos = await respuesta.json();

  if (!datos.ok) {
    throw new Error(datos.error || 'Error al traer los tags');
  }

  return datos.results;
}

// ─── Insertar tag nuevo ───────────────────────────────────

export async function insertarTag(nombre: string): Promise<number> {
  const cabeceras = await obtenerCabeceras();

  const slug = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  // ── Comprobar si ya existe ─────────────────────────────
  const respuestaBuscar = await fetch(`${API}/select.php`, {
    method: 'POST',
    headers: cabeceras,
    body: JSON.stringify({
      sql: 'SELECT tag_id FROM link_tags WHERE tag_slug = :slug LIMIT 1',
      params: { ':slug': slug },
    }),
  });

  const datosBuscar = await respuestaBuscar.json();

  if (datosBuscar.ok && datosBuscar.results.length > 0) {
    return datosBuscar.results[0].tag_id;
  }

  // ── Insertar si no existe ──────────────────────────────
  const respuesta = await fetch(`${API}/insert.php`, {
    method: 'POST',
    headers: cabeceras,
    body: JSON.stringify({
      tabla: 'link_tags',
      tag_nombre: nombre,
      tag_slug: slug,
    }),
  });

  const datos = await respuesta.json();

  if (!datos.ok) {
    throw new Error(datos.error || 'Error al insertar el tag');
  }

  return datos.new_id;
}