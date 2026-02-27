import { createContext, useContext, useEffect, useState } from 'react';
import { guardar, obtener } from '@/services/storage';

// ─── Tipos ────────────────────────────────────────────────
type Tema = 'dark' | 'light';

interface TemaContextType {
  tema: Tema;
  cambiarTema: () => void;
}

// ─── Contexto ─────────────────────────────────────────────
const TemaContext = createContext<TemaContextType>({
  tema:        'dark',
  cambiarTema: () => {},
});

// ─── Provider ─────────────────────────────────────────────
export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>('dark');

  useEffect(() => {
    obtener('tema').then((valor) => {
      if (valor === 'dark' || valor === 'light') {
        setTema(valor);
      }
    });
  }, []);

  const cambiarTema = () => {
    const nuevoTema: Tema = tema === 'dark' ? 'light' : 'dark';
    setTema(nuevoTema);
    guardar('tema', nuevoTema);
  };

  return (
    <TemaContext.Provider value={{ tema, cambiarTema }}>
      {children}
    </TemaContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────
export function useTema(): TemaContextType {
  return useContext(TemaContext);
}