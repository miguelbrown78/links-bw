// src/context/FiltroContext.tsx

import { Categoria, traerCategorias } from '@/services/categorias';
import { Tag, traerTags } from '@/services/tags';
import { createContext, useContext, useRef, useState } from 'react';

export type FiltroItem =
  | { tipo: 'categoria'; id: number; nombre: string; color: string | null }
  | { tipo: 'tag'; id: number; nombre: string };

interface PosicionDropdown {
  top: number;
  left: number;
  width: number;
}

interface FiltroContextType {
  // Estado del dropdown
  dropdownVisible: boolean;
  posicion: PosicionDropdown;
  texto: string;
  categoriasFiltradas: Categoria[];
  tagsFiltrados: Tag[];
  hayResultados: boolean;

  // Pills seleccionadas
  seleccionados: FiltroItem[];

  // Acciones
  abrirDropdown: (posicion: PosicionDropdown) => void;
  cerrarDropdown: () => void;
  setTexto: (t: string) => void;
  seleccionar: (item: FiltroItem) => void;
  quitar: (item: FiltroItem) => void;
  limpiarTodo: () => void;
  cargarDatos: () => void;
}

const FiltroContext = createContext<FiltroContextType | null>(null);

export function FiltroProvider({ children }: { children: React.ReactNode }) {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [posicion, setPosicion] = useState<PosicionDropdown>({ top: 0, left: 0, width: 0 });
  const [texto, setTextoState] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [seleccionados, setSeleccionados] = useState<FiltroItem[]>([]);
  const cargado = useRef(false);

  function cargarDatos() {
    if (cargado.current) return;
    cargado.current = true;
    traerCategorias().then(setCategorias).catch(() => {});
    traerTags().then(setTags).catch(() => {});
  }

  const categoriasFiltradas = texto.length > 0
    ? categorias.filter((cat) => cat.categoria_nombre.toLowerCase().includes(texto.toLowerCase()))
    : categorias;

  const tagsFiltrados = texto.length > 0
    ? tags.filter((tag) => tag.tag_nombre.toLowerCase().includes(texto.toLowerCase()))
    : tags;

  const hayResultados = categoriasFiltradas.length > 0 || tagsFiltrados.length > 0;

  function abrirDropdown(pos: PosicionDropdown) {
    setPosicion(pos);
    setDropdownVisible(true);
  }

  function cerrarDropdown() {
    setDropdownVisible(false);
    setTextoState('');
  }

  function setTexto(t: string) {
    setTextoState(t);
    if (!dropdownVisible) setDropdownVisible(true);
  }

  function seleccionar(item: FiltroItem) {
    const yaEsta = seleccionados.some((s) => s.tipo === item.tipo && s.id === item.id);
    if (!yaEsta) setSeleccionados((prev) => [...prev, item]);
    cerrarDropdown();
  }

  function quitar(item: FiltroItem) {
    setSeleccionados((prev) => prev.filter((s) => !(s.tipo === item.tipo && s.id === item.id)));
  }

  function limpiarTodo() {
    setSeleccionados([]);
    setTextoState('');
  }

  return (
    <FiltroContext.Provider value={{
      dropdownVisible,
      posicion,
      texto,
      categoriasFiltradas,
      tagsFiltrados,
      hayResultados,
      seleccionados,
      abrirDropdown,
      cerrarDropdown,
      setTexto,
      seleccionar,
      quitar,
      limpiarTodo,
      cargarDatos,
    }}>
      {children}
    </FiltroContext.Provider>
  );
}

export function useFiltro() {
  const ctx = useContext(FiltroContext);
  if (!ctx) throw new Error('useFiltro debe usarse dentro de FiltroProvider');
  return ctx;
}