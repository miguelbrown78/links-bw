import { guardar, eliminar, obtener } from '@/services/storage';

const API = 'https://agendaapi.browny.es/links2';

export interface Usuario {
  users_id: number;
  users_nombre: string;
  users_email: string;
  users_activo: number;
  users_admin: number;
  users_super: number;
  users_perfil: number;
  token: string;
  token_expires: string;
}

// ─── Iniciar sesión ───────────────────────────────────────
export async function iniciarSesion(email: string, password: string): Promise<Usuario> {
  const respuesta = await fetch(`${API}/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      users_email: email,
      users_pw: password,
    }),
  });

  const datos = await respuesta.json();

  if (!datos.ok) {
    throw new Error(datos.error || 'Error al iniciar sesión');
  }

  const usuario: Usuario = datos.results[0];

  // Persistir en storage
  await guardar('token', usuario.token);
  await guardar('user_id', String(usuario.users_id));
  await guardar('usuario', JSON.stringify(usuario));

  return usuario;
}

// ─── Cerrar sesión ────────────────────────────────────────
export async function cerrarSesion(): Promise<void> {
  await eliminar('token');
  await eliminar('user_id');
  await eliminar('usuario');
}

// ─── Recuperar sesión guardada ────────────────────────────
export async function obtenerSesion(): Promise<Usuario | null> {
  const raw = await obtener('usuario');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Usuario;
  } catch {
    return null;
  }
}