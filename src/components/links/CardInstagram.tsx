import { useTema } from '@/context/TemaContext';
import { Link } from '@/services/links';
import { colores, espaciado, tipografia } from '@/styles';
import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

interface CardInstagramProps {
  link: Link;
}

function formatearFecha(fechaStr: string): string {
  const fecha = new Date(fechaStr);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);

  const mismaFecha = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (mismaFecha(fecha, hoy)) return 'Hoy';
  if (mismaFecha(fecha, ayer)) return 'Ayer';

  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dd = String(fecha.getDate()).padStart(2, '0');
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const yyyy = fecha.getFullYear();
  const diaSemana = dias[fecha.getDay()];

  return `${dd}/${mm}/${yyyy}, ${diaSemana}`;
}

export default function CardInstagram({ link }: CardInstagramProps) {
  const { tema } = useTema();
  const c = tema === 'dark' ? colores.dark : colores.light;
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(470, width);
  const [imageRatio, setImageRatio] = useState<number | null>(null);
  const [expandido, setExpandido] = useState(false);
  const [necesitaTruncar, setNecesitaTruncar] = useState(false);

  useEffect(() => {
    if (link.link_url_img) {
      Image.getSize(
        link.link_url_img,
        (w, h) => {
          const ratio = w / h;
          const MIN_RATIO = 4 / 5;
          const MAX_RATIO = 1.91;
          setImageRatio(Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio)));
        },
        () => setImageRatio(null)
      );
    }
  }, [link.link_url_img]);

  const styles = crearEstilos(c, cardWidth, imageRatio, tema);
  const colorCategoria = link.categoria_color ?? '#CCCCCC';
  const letraCategoria = link.categoria_nombre?.charAt(0).toUpperCase() ?? '?';
  const fecha = formatearFecha(link.link_DATE_INSERT);

  return (
    <View style={styles.contenedor}>

      {/* FILA 1 - Cabecera */}
      <View style={styles.fila1}>

        {/* Columna 1 - Círculo categoría */}
        <View 
          style={
            [
              styles.circulo, 
              { backgroundColor: colorCategoria }
            ]}>
          <Text 
            style={styles.circuloLetra}
          >
            {letraCategoria}
          </Text>
        </View>

        {/* Columna 2 - Nombre y fecha */}
        <View style={styles.fila1Titulo}>
          <Text style={styles.titulo} numberOfLines={1}>{link.link_nombre}</Text>
          <Text style={styles.fecha}>{fecha}</Text>
        </View>

        {/* Columna 3 - Tres puntos */}
        <TouchableOpacity style={styles.menuBoton} onPress={() => { }}>
          <FontAwesome name="ellipsis-h" size={18} color={c.textoSecundario} />
        </TouchableOpacity>

      </View>

      {/* FILA 2 - Imagen */}
      <View style={styles.fila2}>
        {link.link_url_img ? (
          <Image
            source={{ uri: link.link_url_img }}
            style={styles.imagen}
            resizeMode="cover"
            onError={() => setImageRatio(null)}
          />
        ) : null}
      </View>

      {/* FILA 3 */}
      <View style={styles.fila3}>

        {/* Tags */}
        {link.tags.length > 0 && (
          <View style={styles.tagsContenedor}>
            {link.tags.map((tag, index) => (
              <TouchableOpacity key={index} style={styles.tagPill} onPress={() => { }}>
                <Text style={styles.tagTexto}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Título del link */}
        {link.link_texto_titulo ? (
          <Text 
            style={styles.linkTitulo} 
            numberOfLines={1}
          >
              {link.link_texto_titulo}
          </Text>
        ) : null}

        {/* Descripción con ver más */}
        {link.link_texto_description ? (
          <View>
            <Text style={[styles.descripcion]}>
              {link.link_texto_description}
            </Text>
          </View>
        ) : null}

      </View>

    </View>
  );
}

function crearEstilos(c: typeof colores.dark, cardWidth: number, imageRatio: number | null, tema: string) {
  return StyleSheet.create({
    contenedor: {
      width: cardWidth,
      alignSelf: 'center',
    },
    fila1: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: espaciado.md,
      gap: espaciado.sm,
    },
    circulo: {
      width: 36,
      height: 36,
      borderRadius: espaciado.bordes.full,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    circuloLetra: {
      color: '#1b0002',
      fontFamily: tipografia.fuentes.ui,
      fontSize: tipografia.sizes.md,
    },
    fila1Titulo: {
      flex: 1,
      justifyContent: 'center',
    },
    titulo: {
      color: c.texto,
      fontFamily: tipografia.fuentes.ui,
      fontSize: tipografia.sizes.sm,
    },
    fecha: {
      color: c.textoSecundario,
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.xs,
      marginTop: 2,
    },
    menuBoton: {
      paddingHorizontal: espaciado.sm,
      paddingVertical: espaciado.xs,
      flexShrink: 0,
    },
    fila2: {
      ...(imageRatio !== null ? { aspectRatio: imageRatio } : { height: 200 }),
      backgroundColor: tema === 'dark' ? '#000000' : '#ffffff',
      borderRadius: espaciado.bordes.lg,
      borderWidth: 1,
      borderColor: c.borde,
      overflow: 'hidden',
    },
    imagen: {
      width: '100%',
      height: '100%',
    },
    fila3: {
      paddingHorizontal: espaciado.md,
      paddingTop: espaciado.sm,
      paddingBottom: espaciado.lg,
      gap: espaciado.sm,
    },
    tagsContenedor: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: espaciado.xs,
    },
    tagPill: {
      backgroundColor: colores.tag,
      borderRadius: espaciado.bordes.full,
      paddingHorizontal: espaciado.sm,
      paddingVertical: espaciado.xs,
    },
    tagTexto: {
      color: '#ffffff',
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.xs,
    },
    linkTitulo: {
      color: c.texto,
      fontFamily: tipografia.fuentes.subtitulo,
      fontSize: tipografia.sizes.sm,
    },
    descripcion: {
      color: c.textoSecundario,
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.xs,
      lineHeight: tipografia.lineHeight.sm,
    },
    verMas: {
      color: colores.primario,
      fontFamily: tipografia.fuentes.ui,
      fontSize: tipografia.sizes.xs,
      marginTop: 2,
    },
  });
}