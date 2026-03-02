import Boton from '@/components/Boton';
import CardInstagram from '@/components/links/CardInstagram';
import { useTema } from '@/context/TemaContext';
import { useBuscador } from '@/context/BuscadorContext';
import { Link, traerLinks, buscarLinks, LINKS_POR_PAGINA } from '@/services/links';
import { colores, espaciado, tipografia } from '@/styles';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

type Vista = 'instagram' | 'explorer';
const CARACT_MIN_BUSQ = 3;

export default function MisLinks() {
  const { tema } = useTema();
  const c = tema === 'dark' ? colores.dark : colores.light;
  const { textoBusqueda } = useBuscador();
  const [vista, setVista] = useState<Vista>('instagram');
  const [links, setLinks] = useState<Link[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hayMas, setHayMas] = useState(true);
  const [mostrarSubir, setMostrarSubir] = useState(false);
  const offsetRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enBusquedaRef = useRef(false);
  const flatListRef = useRef<FlatList>(null);
  const styles = crearEstilos(c);

  // ── Carga inicial al entrar en la pantalla ──
  useFocusEffect(
    useCallback(() => {
      if (!textoBusqueda) {
        reiniciarYCargar();
      }
    }, [])
  );

  // ── Búsqueda con debounce cuando cambia el texto ──
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (textoBusqueda.length < CARACT_MIN_BUSQ) {
      if (enBusquedaRef.current) {
        enBusquedaRef.current = false;
        reiniciarYCargar();
      }
      return;
    }

    enBusquedaRef.current = true;
    debounceRef.current = setTimeout(() => {
      reiniciarYBuscar(textoBusqueda);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [textoBusqueda]);

  // ── Reiniciar estado y cargar links normales ──
  async function reiniciarYCargar() {
    try {
      offsetRef.current = 0;
      setHayMas(true);
      setCargando(true);
      setError(null);
      const datos = await traerLinks(0);
      setLinks(datos);
      setHayMas(datos.length === LINKS_POR_PAGINA);
      offsetRef.current = datos.length;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  // ── Reiniciar estado y buscar ──
  async function reiniciarYBuscar(texto: string) {
    try {
      offsetRef.current = 0;
      setHayMas(true);
      setCargando(true);
      setError(null);
      const datos = await buscarLinks(texto, 0);
      setLinks(datos);
      setHayMas(datos.length === LINKS_POR_PAGINA);
      offsetRef.current = datos.length;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  // ── Cargar más al llegar al final ──
  async function cargarMas() {
    if (cargandoMas || !hayMas || cargando) return;

    try {
      setCargandoMas(true);
      const datos = enBusquedaRef.current
        ? await buscarLinks(textoBusqueda, offsetRef.current)
        : await traerLinks(offsetRef.current);

      setLinks((prev) => [...prev, ...datos]);
      setHayMas(datos.length === LINKS_POR_PAGINA);
      offsetRef.current += datos.length;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargandoMas(false);
    }
  }

  function alScroll(e: any) {
    setMostrarSubir(e.nativeEvent.contentOffset.y > 300);
  }

  function subirArriba() {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }

  return (
    <View style={styles.container}>

      {/* ── Barra de vistas ── */}
      <View style={styles.barraVistas}>
        <Boton
          tipo="primario"
          label="Posts"
          icono="th"
          onPress={() => setVista('instagram')}
          activo={vista === 'instagram'}
        />
        <Boton
          tipo="primario"
          label="Lista"
          icono="list"
          onPress={() => setVista('explorer')}
          activo={vista === 'explorer'}
        />
        {textoBusqueda.length >= CARACT_MIN_BUSQ && !cargando && (
          <Text style={styles.textoResultados}>
            {links.length} resultado{links.length !== 1 ? 's' : ''} para "{textoBusqueda}"
          </Text>
        )}
      </View>

      {/* ── Cargando inicial ── */}
      {cargando && (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={colores.primario} />
        </View>
      )}

      {/* ── Error ── */}
      {!cargando && error && (
        <View style={styles.centro}>
          <Text style={styles.textoError}>{error}</Text>
          <Boton tipo="fantasma" label="Reintentar" onPress={reiniciarYCargar} />
        </View>
      )}

      {/* ── Sin links ── */}
      {!cargando && !error && links.length === 0 && (
        <View style={styles.centro}>
          <Text style={styles.textoMuted}>
            {textoBusqueda.length >= CARACT_MIN_BUSQ
              ? `Sin resultados para "${textoBusqueda}"`
              : 'No tienes links guardados aún.'}
          </Text>
        </View>
      )}

      {/* ── Lista ── */}
      {!cargando && !error && links.length > 0 && vista === 'instagram' && (
        <FlatList
          ref={flatListRef}
          data={links}
          keyExtractor={(item) => String(item.link_id)}
          renderItem={({ item }) => (
            <CardInstagram
              link={item}
              onEliminado={() => setLinks((prev) => prev.filter((l) => l.link_id !== item.link_id))}
              onMovido={() => reiniciarYCargar()}
            />
          )}
          contentContainerStyle={styles.lista}
          onEndReached={cargarMas}
          onEndReachedThreshold={0.5}
          onScroll={alScroll}
          scrollEventThrottle={16}
          ListFooterComponent={
            cargandoMas
              ? <ActivityIndicator size="small" color={colores.primario} style={styles.cargandoMas} />
              : null
          }
        />
      )}

      {/* ── Vista Explorer (próximamente) ── */}
      {!cargando && !error && links.length > 0 && vista === 'explorer' && (
        <View style={styles.centro}>
          <Text style={styles.textoMuted}>Vista Explorer — próximamente</Text>
        </View>
      )}

      {/* ── Botón subir ── */}
      {mostrarSubir && (
        <Pressable style={styles.botonSubir} onPress={subirArriba}>
          <FontAwesome name="arrow-up" size={18} color="#fff" />
        </Pressable>
      )}

    </View>
  );
}

function crearEstilos(c: typeof colores.dark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.fondo,
    },
    barraVistas: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: espaciado.lg,
      paddingVertical: espaciado.md,
      gap: espaciado.sm,
      borderBottomColor: c.borde,
    },
    textoResultados: {
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.sm,
      color: c.muted,
      marginLeft: espaciado.sm,
    },
    centro: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: espaciado.md,
    },
    textoError: {
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.md,
      color: colores.error,
      textAlign: 'center',
    },
    textoMuted: {
      textAlign: 'center',
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.md,
      color: c.muted,
    },
    lista: {
      paddingBottom: espaciado.xl,
    },
    cargandoMas: {
      paddingVertical: espaciado.xl,
    },
    botonSubir: {
      position: 'absolute',
      bottom: espaciado.xl,
      right: espaciado.xl,
      width: 44,
      height: 44,
      borderRadius: espaciado.bordes.full,
      backgroundColor: colores.primario,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
      opacity: 0.6,
    },
  });
}