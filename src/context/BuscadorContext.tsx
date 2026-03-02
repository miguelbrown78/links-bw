import { createContext, useContext, useState } from 'react';

interface BuscadorContextType {
  textoBusqueda: string;
  setTextoBusqueda: (texto: string) => void;
}

const BuscadorContext = createContext<BuscadorContextType>({
  textoBusqueda: '',
  setTextoBusqueda: () => {},
});

export function BuscadorProvider({ children }: { children: React.ReactNode }) {
  const [textoBusqueda, setTextoBusqueda] = useState('');

  return (
    <BuscadorContext.Provider value={{ textoBusqueda, setTextoBusqueda }}>
      {children}
    </BuscadorContext.Provider>
  );
}

export function useBuscador(): BuscadorContextType {
  return useContext(BuscadorContext);
}