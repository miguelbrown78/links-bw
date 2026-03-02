import { API_BASE } from '@/constants/api';
import { obtener } from '@/services/storage';

const API = API_BASE;

// ─── Tipos ────────────────────────────────────────────────

export interface Metadatos {
  title: string;
  description: string;
  url_imagen: string;
  site_name: string;
  url: string;
}

export interface DatosGuardarLink {
  link_url: string;
  link_cat_id: number;
  link_nombre?: string;
  link_texto_titulo?: string;
  link_texto_description?: string;
  link_url_img?: string;
  link_ruta_img?: string;
  link_site?: string;
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

// ─── 1. Obtener metadatos de una URL ─────────────────────

export async function obtenerMetadatos(url: string): Promise<Metadatos> {
  const cabeceras = await obtenerCabeceras();

  const respuesta = await fetch(`${API}/metadata.php`, {
    method: 'POST',
    headers: cabeceras,
    body: JSON.stringify({ url }),
  });

  const datos = await respuesta.json();

  if (!datos.ok) {
    throw new Error(datos.error || 'Error al obtener metadatos');
  }

  return datos.results[0];
}

// ─── 2. Subir imagen al servidor ──────────────────────────

export async function subirImagen(url_imagen: string): Promise<string> {
  const cabeceras = await obtenerCabeceras();

  const respuesta = await fetch(`${API}/upload_img.php`, {
    method: 'POST',
    headers: cabeceras,
    body: JSON.stringify({ url_imagen }),
  });

  const datos = await respuesta.json();

  if (!datos.ok) {
    throw new Error(datos.error || 'Error al subir la imagen');
  }

  return datos.results[0].ruta;
}

// ─── 3. Insertar link en la BD ────────────────────────────

export async function insertarLink(link: DatosGuardarLink): Promise<number> {
  const cabeceras = await obtenerCabeceras();

  const respuesta = await fetch(`${API}/insert.php`, {
    method: 'POST',
    headers: cabeceras,
    body: JSON.stringify({
      tabla: 'link_links',
      ...link,
    }),
  });

  const datos = await respuesta.json();

  if (!datos.ok) {
    throw new Error(datos.error || 'Error al guardar el link');
  }

  return datos.new_id;
}

// ─── 4. Asignar tags al link ──────────────────────────────

export async function asignarTag(link_id: number, tag_id: number): Promise<void> {
  const cabeceras = await obtenerCabeceras();

  const respuesta = await fetch(`${API}/insert.php`, {
    method: 'POST',
    headers: cabeceras,
    body: JSON.stringify({
      tabla: 'link_tag_relation',
      link_id,
      tag_id,
    }),
  });

  const datos = await respuesta.json();

  if (!datos.ok) {
    throw new Error(datos.error || `Error al asignar tag ${tag_id}`);
  }
}

// ─── Flujo completo link ──────────────────────────────────

export async function guardarLinkCompleto(
  url: string,
  cat_id: number,
  tags_ids: number[],
  nombre_manual?: string
): Promise<number> {

  const meta = await obtenerMetadatos(url);

  let ruta_img: string | undefined;
  if (meta.url_imagen) {
    try {
      ruta_img = await subirImagen(meta.url_imagen);
    } catch {
      // Si falla la imagen continuamos sin ella
    }
  }

  const link_id = await insertarLink({
    link_url: url,
    link_cat_id: cat_id,
    link_nombre: nombre_manual || meta.title,
    link_texto_titulo: meta.title,
    link_texto_description: meta.description,
    link_url_img: meta.url_imagen,
    link_ruta_img: ruta_img,
    link_site: meta.site_name,
  });

  for (const tag_id of tags_ids) {
    await asignarTag(link_id, tag_id);
  }

  return link_id;
}

// ─── Flujo completo imagen ────────────────────────────────

export async function guardarImagenCompleto(
  ruta_img: string,
  cat_id: number,
  tags_ids: number[],
  nombre?: string,
  url_link?: string,
  descripcion?: string,
  site?: string,
): Promise<number> {

  const link_id = await insertarLink({
    link_url: url_link || '',
    link_cat_id: cat_id,
    link_nombre: nombre || 'Imagen',
    link_texto_titulo: nombre,
    link_texto_description: descripcion,
    link_site: site,
    link_ruta_img: ruta_img,
  });

  for (const tag_id of tags_ids) {
    await asignarTag(link_id, tag_id);
  }

  return link_id;
}