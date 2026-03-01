import { API_BASE } from '@/constants/api';
import { obtener } from '@/services/storage';

const API = API_BASE;

// ─── Tipos ────────────────────────────────────────────────

export interface Categoria {
  categoria_id: number;
  categoria_nombre: string;
  categoria_color: string | null;
  categoria_activa: number;
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

// ─── Traer categorías del usuario ─────────────────────────

export async function traerCategorias(): Promise<Categoria[]> {
  const cabeceras = await obtenerCabeceras();
  const userId = await obtener('user_id');

  if (!userId) throw new Error('No hay sesión activa.');

  const respuesta = await fetch(`${API}/select.php`, {
    method: 'POST',
    headers: cabeceras,
    body: JSON.stringify({
      sql: 'SELECT * FROM link_categorias WHERE (categoria_id_users = :user_id OR categoria_id_users = 0) AND categoria_activa = 1 ORDER BY categoria_id_users, categoria_nombre',
      params: { ':user_id': parseInt(userId) },
    }),
  });

  const datos = await respuesta.json();

  if (!datos.ok) {
    throw new Error(datos.error || 'Error al traer las categorías');
  }

  return datos.results;
}