import Boton from '@/components/Boton';
import CardInstagram from '@/components/links/CardInstagram';
import { useTema } from '@/context/TemaContext';
import { Link, traerLinks } from '@/services/links';
import { colores, espaciado, tipografia } from '@/styles';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

type Vista = 'instagram' | 'explorer';

export default function MisLinks() {
  const { tema } = useTema();
  const c = tema === 'dark' ? colores.dark : colores.light;
  const [vista, setVista] = useState<Vista>('instagram');
  const [links, setLinks] = useState<Link[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const styles = crearEstilos(c);

  useEffect(() => {
    cargarLinks();
  }, []);

  async function cargarLinks() {
    try {
      setCargando(true);
      setError(null);
      const datos = await traerLinks();
      setLinks(datos);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
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
      </View>

      {/* ── Cargando ── */}
      {cargando && (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={colores.primario} />
        </View>
      )}

      {/* ── Error ── */}
      {!cargando && error && (
        <View style={styles.centro}>
          <Text style={styles.textoError}>{error}</Text>
          <Boton tipo="fantasma" label="Reintentar" onPress={cargarLinks} />
        </View>
      )}

      {/* ── Sin links ── */}
      {!cargando && !error && links.length === 0 && (
        <View style={styles.centro}>
          <Text style={styles.textoMuted}>No tienes links guardados aún.</Text>
        </View>
      )}

      {/* ── Vista Instagram ── */}
      {!cargando && !error && links.length > 0 && vista === 'instagram' && (
        <FlatList
          data={links}
          keyExtractor={(item) => String(item.link_id)}
          renderItem={({ item }) => <CardInstagram link={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.lista}
        />
      )}

      {/* ── Vista Explorer (próximamente) ── */}
      {!cargando && !error && links.length > 0 && vista === 'explorer' && (
        <View style={styles.centro}>
          <Text style={styles.textoMuted}>Vista Explorer — próximamente</Text>
        </View>
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
      /*backgroundColor: c.card,*/
      /*borderBottomWidth: 1,*/
      borderBottomColor: c.borde,
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
  });
}