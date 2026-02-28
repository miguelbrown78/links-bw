import { Link } from '@/services/links';
import { colores, espaciado, tipografia } from '@/styles';
import { useTema } from '@/context/TemaContext';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');
const ALTO_CARD = width * 1.2;
const LINEAS_DESCRIPCION = 2;

interface Props {
  link: Link;
}

export default function CardInstagram({ link }: Props) {
  const { tema } = useTema();
  const [expandida, setExpandida] = useState(false);

  const titulo = link.link_nombre || link.link_texto_titulo || link.link_site || 'Sin título';
  const descripcion = link.link_texto_description || '';
  const tieneDescripcion = descripcion.length > 0;
  const tieneTags = link.tags.length > 0;

  return (
    <View style={styles.card}>

      {/* ── Imagen de fondo ── */}
      {link.link_url_img ? (
        <Image
          source={{ uri: link.link_url_img }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.sinImagen]} />
      )}

      {/* ── Degradado inferior ── */}
      <View style={styles.degradado} />

      {/* ── Contenido ── */}
      <View style={styles.contenido}>

        {/* Dominio */}
        {link.link_site ? (
          <Text style={styles.dominio} numberOfLines={1}>
            {link.link_site}
          </Text>
        ) : null}

        {/* Título */}
        <Text style={styles.titulo} numberOfLines={3}>
          {titulo}
        </Text>

        {/* Descripción */}
        {tieneDescripcion && (
          <Pressable onPress={() => setExpandida(!expandida)}>
            <Text
              style={styles.descripcion}
              numberOfLines={expandida ? undefined : LINEAS_DESCRIPCION}
            >
              {descripcion}
              {!expandida && (
                <Text style={styles.verMas}> ...ver más</Text>
              )}
            </Text>
          </Pressable>
        )}

        {/* Tags */}
        {tieneTags && (
          <View style={styles.tags}>
            {link.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagTexto}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width,
    height: ALTO_CARD,
    backgroundColor: colores.dark.card,
    marginBottom: espaciado.sm,
    overflow: 'hidden',
  },
  sinImagen: {
    backgroundColor: colores.dark.card,
  },
  degradado: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ALTO_CARD * 0.6,
    backgroundColor: 'transparent',
    // Degradado simulado con opacidad
    backgroundImage: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
  },
  contenido: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: espaciado.lg,
    gap: espaciado.xs,
  },
  dominio: {
    fontFamily: tipografia.fuentes.mono,
    fontSize: tipografia.sizes.xs,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'lowercase',
  },
  titulo: {
    fontFamily: tipografia.fuentes.titulo,
    fontSize: tipografia.sizes.lg,
    color: '#ffffff',
    lineHeight: tipografia.lineHeight.lg,
  },
  descripcion: {
    fontFamily: tipografia.fuentes.cuerpo,
    fontSize: tipografia.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: tipografia.lineHeight.sm,
  },
  verMas: {
    fontFamily: tipografia.fuentes.ui,
    fontSize: tipografia.sizes.sm,
    color: colores.primario,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciado.xs,
    marginTop: espaciado.xs,
  },
  tag: {
    backgroundColor: 'rgba(162,29,48,0.35)',
    borderRadius: espaciado.bordes.full,
    paddingHorizontal: espaciado.md,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(162,29,48,0.6)',
  },
  tagTexto: {
    fontFamily: tipografia.fuentes.cuerpo,
    fontSize: tipografia.sizes.xs,
    color: '#ffffff',
  },
});