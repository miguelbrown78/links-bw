import { API_BASE } from '@/constants/api';
import { obtener } from '@/services/storage';

const API = API_BASE;

// ─── Cabeceras comunes ────────────────────────────────────
async function obtenerCabeceras(): Promise<Record<string, string>> {
  const token = await obtener('token');
  if (!token) throw new Error('No hay sesión activa.');
  return {
    'X-Auth-Token': token,
  };
}

// ─── Subir imagen desde URL remota ───────────────────────
export async function subirImagenDesdeUrl(url_imagen: string): Promise<string> {
  const token = await obtener('token');
  if (!token) throw new Error('No hay sesión activa.');

  const respuesta = await fetch(`${API}/upload_img.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token,
    },
    body: JSON.stringify({ url_imagen }),
  });

  const datos = await respuesta.json();
  if (!datos.ok) throw new Error(datos.error || 'Error al subir la imagen');

  return datos.results[0].ruta;
}

// ─── Subir imagen desde archivo local (base64) ───────────
export async function subirImagenDesdeArchivo(base64: string, mimeType: string): Promise<string> {
  const cabeceras = await obtenerCabeceras();

  const respuesta = await fetch(`${API}/upload_img.php`, {
    method: 'POST',
    headers: {
      ...cabeceras,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      base64,
      mime_type: mimeType,
    }),
  });

  const datos = await respuesta.json();
  if (!datos.ok) throw new Error(datos.error || 'Error al subir la imagen');

  return datos.results[0].ruta;
}