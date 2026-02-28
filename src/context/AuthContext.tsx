import { createContext, useContext, useEffect, useState } from 'react';
import { iniciarSesion, cerrarSesion, obtenerSesion, Usuario } from '@/services/auth';

// ─── Tipos ────────────────────────────────────────────────
interface AuthContextType {
  usuario: Usuario | null;
  cargando: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Contexto ─────────────────────────────────────────────
const AuthContext = createContext<AuthContextType>({
  usuario: null,
  cargando: true,
  login:  async () => {},
  logout: async () => {},
});

// ─── Provider ─────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // Al arrancar la app, recuperar sesión guardada
  useEffect(() => {
    obtenerSesion().then((sesion) => {
      setUsuario(sesion);
      setCargando(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const usuarioLogueado = await iniciarSesion(email, password);
    setUsuario(usuarioLogueado);
  };

  const logout = async () => {
    await cerrarSesion();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}