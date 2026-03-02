import { useTema } from '@/context/TemaContext';
import { colores, espaciado, tipografia } from '@/styles';
import { traerCategorias, Categoria } from '@/services/categorias';
import { eliminarLink, moverLinkCategoria } from '@/services/links';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface MenuCardProps {
  linkId: number;
  categoriaActualId: number;
  onEliminado: () => void;
  onMovido: () => void;
}

type Vista = 'menu' | 'categorias';

export default function MenuCard({ linkId, categoriaActualId, onEliminado, onMovido }: MenuCardProps) {
  const { tema } = useTema();
  const c = tema === 'dark' ? colores.dark : colores.light;
  const styles = crearEstilos(c);
  const [visible, setVisible] = useState(false);
  const [vistaMenu, setVistaMenu] = useState<Vista>('menu');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargandoCats, setCargandoCats] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posicion, setPosicion] = useState({ top: 0, right: 0 });
  const botonRef = useRef<View>(null);

  function alAbrir() {
    botonRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      setPosicion({
        top: pageY + height + 4,
        right: window.innerWidth - pageX - width,
      });
      setVisible(true);
      setVistaMenu('menu');
      setError(null);
    });
  }

  function alCerrar() {
    setVisible(false);
    setVistaMenu('menu');
    setError(null);
  }

  async function alMostrarCategorias() {
    try {
      setCargandoCats(true);
      setVistaMenu('categorias');
      const datos = await traerCategorias();
      setCategorias(datos.filter((c) => c.categoria_id !== categoriaActualId));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargandoCats(false);
    }
  }

  async function alEliminar() {
    try {
      setProcesando(true);
      setError(null);
      await eliminarLink(linkId);
      alCerrar();
      onEliminado();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setProcesando(false);
    }
  }

  async function alMover(categoriaId: number) {
    try {
      setProcesando(true);
      setError(null);
      await moverLinkCategoria(linkId, categoriaId);
      alCerrar();
      onMovido();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <View>
      {/* ── Botón ── */}
      <Pressable ref={botonRef} onPress={alAbrir} style={styles.boton}>
        <FontAwesome name="ellipsis-h" size={18} color={c.textoSecundario} />
      </Pressable>

      {/* ── Dropdown ── */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={alCerrar}
      >
        <Pressable style={styles.fondo} onPress={alCerrar}>
          <Pressable
            style={[styles.dropdown, { top: posicion.top, right: posicion.right }]}
            onPress={() => {}}
          >

            {/* ── Cabecera ── */}
            <View style={styles.cabecera}>
              {vistaMenu === 'categorias' && (
                <Pressable onPress={() => setVistaMenu('menu')} style={styles.btnVolver}>
                  <FontAwesome name="arrow-left" size={14} color={c.muted} />
                </Pressable>
              )}
              <Text style={styles.cabeceraTexto}>
                {vistaMenu === 'menu' ? 'Opciones' : 'Mover a categoría'}
              </Text>
            </View>

            <View style={styles.separador} />

            {/* ── Error ── */}
            {error && (
              <Text style={styles.textoError}>{error}</Text>
            )}

            {/* ── Vista menú principal ── */}
            {vistaMenu === 'menu' && (
              <>
                <Pressable style={styles.item} onPress={alMostrarCategorias}>
                  <FontAwesome name="folder-open" size={16} color={c.texto} />
                  <Text style={styles.itemTexto}>Mover a categoría</Text>
                  <FontAwesome name="chevron-right" size={12} color={c.muted} style={styles.itemChevron} />
                </Pressable>

                <View style={styles.separador} />

                <Pressable style={styles.item} onPress={alEliminar} disabled={procesando}>
                  {procesando
                    ? <ActivityIndicator size="small" color={colores.error} />
                    : <FontAwesome name="trash" size={16} color={colores.error} />
                  }
                  <Text style={[styles.itemTexto, { color: colores.error }]}>Eliminar link</Text>
                </Pressable>
              </>
            )}

            {/* ── Vista categorías ── */}
            {vistaMenu === 'categorias' && (
              <>
                {cargandoCats && (
                  <ActivityIndicator size="small" color={colores.primario} style={{ margin: espaciado.lg }} />
                )}
                {!cargandoCats && (
                  <ScrollView style={styles.listaCategorias} bounces={false}>
                    {categorias.map((cat) => (
                      <Pressable
                        key={cat.categoria_id}
                        style={styles.item}
                        onPress={() => alMover(cat.categoria_id)}
                        disabled={procesando}
                      >
                        <View style={[styles.colorCategoria, { backgroundColor: cat.categoria_color ?? '#CCCCCC' }]} />
                        <Text style={styles.itemTexto}>{cat.categoria_nombre}</Text>
                        {procesando && <ActivityIndicator size="small" color={colores.primario} />}
                      </Pressable>
                    ))}
                    {categorias.length === 0 && (
                      <Text style={styles.textoMuted}>No hay otras categorías</Text>
                    )}
                  </ScrollView>
                )}
              </>
            )}

          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function crearEstilos(c: typeof colores.dark) {
  return StyleSheet.create({
    boton: {
      paddingHorizontal: espaciado.sm,
      paddingVertical: espaciado.xs,
    },
    fondo: {
      flex: 1,
    },
    dropdown: {
      position: 'absolute',
      backgroundColor: c.card,
      borderRadius: espaciado.bordes.md,
      borderWidth: 1,
      borderColor: c.borde,
      minWidth: 200,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    cabecera: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: espaciado.lg,
      paddingVertical: espaciado.md,
      gap: espaciado.sm,
    },
    btnVolver: {
      padding: 4,
    },
    cabeceraTexto: {
      fontFamily: tipografia.fuentes.subtitulo,
      fontSize: tipografia.sizes.sm,
      color: c.muted,
    },
    separador: {
      height: 1,
      backgroundColor: c.borde,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: espaciado.md,
      paddingHorizontal: espaciado.lg,
      paddingVertical: espaciado.md,
    },
    itemTexto: {
      flex: 1,
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.md,
      color: c.texto,
    },
    itemChevron: {
      marginLeft: 'auto',
    },
    colorCategoria: {
      width: 12,
      height: 12,
      borderRadius: espaciado.bordes.full,
    },
    textoError: {
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.sm,
      color: colores.error,
      paddingHorizontal: espaciado.lg,
      paddingVertical: espaciado.sm,
    },
    textoMuted: {
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.sm,
      color: c.muted,
      paddingHorizontal: espaciado.lg,
      paddingVertical: espaciado.md,
    },
    listaCategorias: {
      maxHeight: 240,
    },
  });
}