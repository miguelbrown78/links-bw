import { API_BASE } from '@/constants/api';
import { useTema } from '@/context/TemaContext';
import { Link } from '@/services/links';
import { colores, espaciado, tipografia } from '@/styles';
import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import MenuCard from '@/components/links/MenuCard';

const ANCHO_CONTAINER = 950;
const IMG_MIN_RATIO = 4 / 5;
const IMG_MAX_RATIO = 1.91;
const ALTURA_NO_IMG = 80;
const IMG_ALTURA_MAX = 400;

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

// ─── Componente BotonIcono con tooltip ────────────────────
interface BotonIconoProps {
  icono: React.ComponentProps<typeof FontAwesome>['name'];
  tooltip: string;
  onPress: () => void;
  color: string;
}

function BotonIcono({ icono, tooltip, onPress, color }: BotonIconoProps) {
  const [mostrarTooltip, setMostrarTooltip] = useState(false);

  return (
    <View style={estilosBoton.contenedor}>
      <TouchableOpacity
        onPress={onPress}
        style={estilosBoton.boton}
        // @ts-ignore — onMouseEnter/onMouseLeave solo existe en web
        onMouseEnter={() => setMostrarTooltip(true)}
        onMouseLeave={() => setMostrarTooltip(false)}
      >
        <FontAwesome name={icono} size={16} color={color} />
      </TouchableOpacity>
      {mostrarTooltip && (
        <View style={estilosBoton.tooltip}>
          <Text style={estilosBoton.tooltipTexto}>{tooltip}</Text>
        </View>
      )}
    </View>
  );
}

const estilosBoton = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
  },
  boton: {
    padding: espaciado.xs,
  },
  tooltip: {
    position: 'absolute',
    top: 28,
    backgroundColor: '#000000cc',
    borderRadius: espaciado.bordes.sm,
    paddingHorizontal: espaciado.sm,
    paddingVertical: espaciado.xs,
    zIndex: 99,
    minWidth: 80,
    alignItems: 'center',
  },
  tooltipTexto: {
    color: '#ffffff',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    whiteSpace: 'nowrap',
  } as any,
});

interface CardInstagramProps {
  link: Link;
  onEliminado: () => void;
  onMovido: () => void;
}

// ─── CardInstagram ────────────────────────────────────────
export default function CardInstagram({ link, onEliminado, onMovido }: CardInstagramProps) {

  const { tema } = useTema();
  const c = tema === 'dark' ? colores.dark : colores.light;
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(ANCHO_CONTAINER, width);
  const [imageRatio, setImageRatio] = useState<number | null>(null);

  const urlImagen = link.link_ruta_img ? `${API_BASE}/${link.link_ruta_img}` : null;

  useEffect(() => {
    if (urlImagen) {
      Image.getSize(
        urlImagen,
        (w, h) => {
          const ratio = w / h;
          setImageRatio(Math.min(IMG_MAX_RATIO, Math.max(IMG_MIN_RATIO, ratio)));
        },
        () => setImageRatio(null)
      );
    }
  }, [urlImagen]);

  const styles = crearEstilos(c, cardWidth, imageRatio, tema);
  const colorCategoria = link.categoria_color ?? '#CCCCCC';
  const letraCategoria = link.categoria_nombre?.charAt(0).toUpperCase() ?? '?';
  const fecha = formatearFecha(link.link_DATE_INSERT);

  function abrirUrl() {
    Linking.openURL(link.link_url);
  }

  function abrirImagen() {
    if (urlImagen) Linking.openURL(urlImagen);
  }

  return (
    <View style={styles.contenedor}>

      {/* FILA 1 - Cabecera */}
      <View style={styles.fila1}>

        <View style={[styles.circulo, { backgroundColor: colorCategoria }]}>
          <Text style={styles.circuloLetra}>{letraCategoria}</Text>
        </View>

        <View style={styles.fila1Titulo}>
          <Text style={styles.titulo} numberOfLines={1}>{link.link_nombre}</Text>
          <Text style={styles.fecha}>{fecha}</Text>
        </View>

        <MenuCard
          linkId={link.link_id}
          categoriaActualId={link.categoria_id}
          onEliminado={onEliminado}
          onMovido={onMovido}
        />

      </View>

      {/* FILA 2 - Imagen */}
      <TouchableOpacity onPress={abrirUrl} activeOpacity={0.9}>
        <View style={styles.fila2}>
          {urlImagen ? (
            <Image
              source={{ uri: urlImagen }}
              style={styles.imagen}
              resizeMode="contain"
              onError={() => setImageRatio(null)}
            />
          ) : (
            <View style={styles.sinImagen}>
              <FontAwesome name="link" size={20} color={c.muted} />
              <Text style={styles.sinImagenTexto} numberOfLines={2}>{link.link_url}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* FILA 3 */}
      <View style={styles.fila3}>

        {/* Fila tags + botones */}
        <View style={styles.filaTagsBotones}>

          {/* Columna izquierda — tags */}
          <View style={styles.tagsContenedor}>
            {link.tags.map((tag, index) => (
              <TouchableOpacity key={index} style={styles.tagPill} onPress={() => { }}>
                <Text style={styles.tagTexto}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Columna derecha — botones con tooltip */}
          <View style={styles.botonesContenedor}>
            <BotonIcono
              icono="external-link"
              tooltip="Abrir enlace"
              onPress={abrirUrl}
              color={c.textoSecundario}
            />
            {urlImagen && (
              <BotonIcono
                icono="image"
                tooltip="Ver imagen"
                onPress={abrirImagen}
                color={c.textoSecundario}
              />
            )}
          </View>

        </View>

        {/* Título del link */}
        {link.link_texto_titulo ? (
          <Text style={styles.linkTitulo} numberOfLines={1}>
            {link.link_texto_titulo}
          </Text>
        ) : null}

        {/* Descripción */}
        {link.link_texto_description ? (
          <Text style={styles.descripcion}>
            {link.link_texto_description}
          </Text>
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
      height: imageRatio !== null
        ? Math.min(IMG_ALTURA_MAX, cardWidth / imageRatio)
        : ALTURA_NO_IMG,
      backgroundColor: tema === 'dark' ? '#000000' : '#ffffff',
      borderRadius: cardWidth >= 480 ? espaciado.bordes.lg : 0,
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
    filaTagsBotones: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    tagsContenedor: {
      flex: 1,
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
    botonesContenedor: {
      flexDirection: 'row',
      gap: espaciado.sm,
      flexShrink: 0,
      paddingLeft: espaciado.sm,
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
    sinImagen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: espaciado.sm,
      paddingHorizontal: espaciado.lg,
    },
    sinImagenTexto: {
      fontFamily: tipografia.fuentes.mono,
      fontSize: tipografia.sizes.xs,
      color: c.muted,
      textAlign: 'center',
    },
  });
}