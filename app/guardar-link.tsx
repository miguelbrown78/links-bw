import { traerCategorias, Categoria } from '@/services/categorias';
import { insertarTag } from '@/services/tags';
import { obtenerMetadatos, guardarLinkCompleto } from '@/services/guardar-link';
import { colores, espaciado, tipografia } from '@/styles';
import { useTema } from '@/context/TemaContext';
import ModalCategoria from '@/components/ModalCategoria';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';

// ─── Tipos ────────────────────────────────────────────────

interface TagLocal {
  nombre: string;
}

// ─── Pantalla ─────────────────────────────────────────────

export default function GuardarLink() {
  const { tema } = useTema();
  const c = tema === 'dark' ? colores.dark : colores.light;
  const styles = crearEstilos(c);
  const router = useRouter();
  const { urlCompartida } = useLocalSearchParams<{ urlCompartida?: string }>();

  // ── Campos del formulario ──
  const [url, setUrl] = useState('');
  const [nombre, setNombre] = useState('');
  const [catId, setCatId] = useState<number | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<TagLocal[]>([]);

  // ── Metadata ──
  const [meta, setMeta] = useState<{
    titulo: string;
    descripcion: string;
    site: string;
    url_img: string;
    fecha_post: string;
  } | null>(null);

  // ── Estado ──
  const [cargandoMeta, setCargandoMeta] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);

  const urlRef = useRef('');

  // ── Cargar categorías al montar ──
  useEffect(() => {
    cargarCategorias();
  }, []);

  // ── Inyectar URL compartida al montar ──
  useEffect(() => {
    if (urlCompartida) {
      alCambiarUrl(urlCompartida);
    }
  }, [urlCompartida]);

  async function cargarCategorias() {
    try {
      const datos = await traerCategorias();
      setCategorias(datos);
      if (datos.length > 0) {
        setCatId(datos[0].categoria_id);
      }
    } catch (e: any) {
      setError(e.message);
    }
  }

  // ── Cargar metadata cuando la URL cambia ──
  async function alCambiarUrl(valor: string) {
    setUrl(valor);
    urlRef.current = valor;

    const urlValida = valor.startsWith('http://') || valor.startsWith('https://');
    if (!urlValida) {
      setMeta(null);
      return;
    }

    try {
      setCargandoMeta(true);
      setMeta(null);
      const datos = await obtenerMetadatos(valor);

      if (urlRef.current !== valor) return;

      setMeta({
        titulo: datos.title || '',
        descripcion: datos.description || '',
        site: datos.site_name || '',
        url_img: datos.url_imagen || '',
        fecha_post: (datos as any).fecha_post || '',
      });
      setNombre(datos.title || '');
    } catch {
      // Si falla metadata, no bloqueamos el formulario
    } finally {
      setCargandoMeta(false);
    }
  }

  // ── Añadir tag ──
  function añadirTag() {
    const nombreTag = tagInput.trim();
    if (!nombreTag) return;
    if (tags.find((t) => t.nombre.toLowerCase() === nombreTag.toLowerCase())) return;
    setTags([...tags, { nombre: nombreTag }]);
    setTagInput('');
  }

  // ── Quitar tag ──
  function quitarTag(index: number) {
    setTags(tags.filter((_, i) => i !== index));
  }

  // ── Categoría creada desde modal ──
  function alCategoriaCreada(categoria: Categoria) {
    setCategorias([...categorias, categoria]);
    setCatId(categoria.categoria_id);
  }

  // ── Guardar ──
  async function alGuardar() {
    if (!url) return setError('La URL es obligatoria.');
    if (!catId) return setError('Selecciona una categoría.');

    try {
      setGuardando(true);
      setError(null);

      const tags_ids: number[] = [];
      for (const tag of tags) {
        const id = await insertarTag(tag.nombre);
        tags_ids.push(id);
      }

      await guardarLinkCompleto(url, catId, tags_ids, nombre || undefined);

      router.back();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.fondo }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── 1. URL ── */}
        <View style={styles.grupo}>
          <Text style={styles.label}>URL</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={alCambiarUrl}
              placeholder="https://..."
              placeholderTextColor={c.muted}
              autoCapitalize="none"
              keyboardType="url"
            />
            {url.length > 0 && (
              <Pressable onPress={() => { setUrl(''); setMeta(null); setNombre(''); }}>
                <FontAwesome name="times-circle" size={18} color={c.muted} />
              </Pressable>
            )}
          </View>
          {cargandoMeta && <ActivityIndicator size="small" color={colores.primario} style={{ marginTop: espaciado.sm }} />}
        </View>

        {/* ── 2. Nombre ── */}
        <View style={styles.grupo}>
          <Text style={styles.label}>Nombre</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputMultilinea]}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre del link"
              placeholderTextColor={c.muted}
              multiline
              numberOfLines={4}
              blurOnSubmit={true}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Enter') {
                  // bloquear intro — no hace nada
                }
              }}
            />
            {nombre.length > 0 && (
              <Pressable onPress={() => setNombre('')}>
                <FontAwesome name="times-circle" size={18} color={c.muted} />
              </Pressable>
            )}
          </View>
        </View>

        {/* ── 3. Categorías ── */}
        <View style={styles.grupo}>
          <Text style={styles.label}>Categoría</Text>
          <View style={styles.chips}>
            {categorias.map((cat) => (
              <Pressable
                key={cat.categoria_id}
                style={[styles.chip, catId === cat.categoria_id && styles.chipActivo]}
                onPress={() => setCatId(cat.categoria_id)}
              >
                <Text style={[styles.chipTexto, catId === cat.categoria_id && styles.chipTextoActivo]}>
                  {cat.categoria_nombre}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.btnNuevaCategoria}
              onPress={() => setModalCategoriaVisible(true)}
            >
              <FontAwesome name="plus" size={12} color={colores.primario} />
              <Text style={styles.btnNuevaCategoriaTexto}>Nueva categoría</Text>
            </Pressable>
          </View>
        </View>

        {/* ── 4. Tags ── */}
        <View style={styles.grupo}>
          <Text style={styles.label}>Tags</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Nuevo tag..."
              placeholderTextColor={c.muted}
              onSubmitEditing={añadirTag}
              returnKeyType="done"
            />
            {tagInput.length > 0 && (
              <Pressable onPress={() => setTagInput('')}>
                <FontAwesome name="times-circle" size={18} color={c.muted} />
              </Pressable>
            )}
            <Pressable style={styles.btnAñadir} onPress={añadirTag}>
              <Text style={styles.btnAñadirTexto}>Añadir</Text>
            </Pressable>
          </View>
          {tags.length > 0 && (
            <View style={styles.chips}>
              {tags.map((tag, i) => (
                <View key={i} style={styles.tagChip}>
                  <Text style={styles.tagTexto}>{tag.nombre}</Text>
                  <Pressable onPress={() => quitarTag(i)}>
                    <FontAwesome name="times" size={12} color="#fff" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── 5. Info metadata ── */}
        {meta && (
          <View style={styles.metaBox}>
            {meta.url_img ? (
              <Image
                source={{ uri: meta.url_img }}
                style={styles.metaImagen}
                contentFit="cover"
              />
            ) : null}
            <View style={styles.metaDatos}>
              {meta.titulo ? <Text style={styles.metaTitulo}>{meta.titulo}</Text> : null}
              {meta.descripcion ? <Text style={styles.metaDesc}>{meta.descripcion}</Text> : null}
              {meta.site ? <Text style={styles.metaSite}>{meta.site}</Text> : null}
              {meta.url_img ? <Text style={styles.metaUrlImg} numberOfLines={1}>{meta.url_img}</Text> : null}
            </View>
          </View>
        )}

        {/* ── Error ── */}
        {error && <Text style={styles.textoError}>{error}</Text>}

        {/* ── Botón guardar ── */}
        <Pressable
          style={[styles.btnGuardar, guardando && { opacity: 0.6 }]}
          onPress={alGuardar}
          disabled={guardando}
        >
          {guardando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnGuardarTexto}>Guardar link</Text>
          }
        </Pressable>

      </ScrollView>

      {/* ── Modal nueva categoría ── */}
      <ModalCategoria
        visible={modalCategoriaVisible}
        onCerrar={() => setModalCategoriaVisible(false)}
        onCategoriaCreada={alCategoriaCreada}
      />

    </KeyboardAvoidingView>
  );
}

// ─── Estilos ──────────────────────────────────────────────

function crearEstilos(c: typeof colores.dark) {
  return StyleSheet.create({
    scroll: {
      padding: espaciado.lg,
      gap: espaciado.lg,
      paddingBottom: espaciado.xxl,
      width: '100%',
      maxWidth: 720,
      alignSelf: 'center',
    },
    grupo: {
      gap: espaciado.sm,
    },
    label: {
      fontFamily: tipografia.fuentes.ui,
      fontSize: tipografia.sizes.sm,
      color: c.textoSecundario,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.borde,
      borderRadius: espaciado.bordes.md,
      paddingHorizontal: espaciado.md,
      gap: espaciado.sm,
    },
    input: {
      flex: 1,
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.md,
      color: c.texto,
      paddingVertical: espaciado.md,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: espaciado.sm,
    },
    chip: {
      paddingHorizontal: espaciado.md,
      paddingVertical: espaciado.sm,
      borderRadius: espaciado.bordes.full,
      borderWidth: 1,
      borderColor: c.borde,
      backgroundColor: c.card,
    },
    chipActivo: {
      backgroundColor: colores.primario,
      borderColor: colores.primario,
    },
    chipTexto: {
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.sm,
      color: c.texto,
    },
    chipTextoActivo: {
      color: '#fff',
    },
    btnNuevaCategoria: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: espaciado.xs,
      paddingHorizontal: espaciado.md,
      paddingVertical: espaciado.sm,
      borderRadius: espaciado.bordes.full,
      borderWidth: 1,
      borderColor: colores.primario,
      alignSelf: 'flex-start',
    },
    btnNuevaCategoriaTexto: {
      fontFamily: tipografia.fuentes.ui,
      fontSize: tipografia.sizes.sm,
      color: colores.primario,
    },
    btnAñadir: {
      paddingHorizontal: espaciado.md,
      paddingVertical: espaciado.sm,
      backgroundColor: colores.primario,
      borderRadius: espaciado.bordes.md,
    },
    btnAñadirTexto: {
      fontFamily: tipografia.fuentes.ui,
      fontSize: tipografia.sizes.sm,
      color: '#fff',
    },
    tagChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: espaciado.xs,
      paddingHorizontal: espaciado.md,
      paddingVertical: espaciado.sm,
      backgroundColor: colores.tag,
      borderRadius: espaciado.bordes.full,
    },
    tagTexto: {
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.sm,
      color: '#fff',
    },
    metaBox: {
      backgroundColor: c.card,
      borderRadius: espaciado.bordes.md,
      borderWidth: 1,
      borderColor: c.borde,
      overflow: 'hidden',
    },
    metaImagen: {
      width: '100%',
      height: 180,
    },
    metaDatos: {
      padding: espaciado.md,
      gap: espaciado.xs,
    },
    metaTitulo: {
      fontFamily: tipografia.fuentes.subtitulo,
      fontSize: tipografia.sizes.md,
      color: c.texto,
    },
    metaDesc: {
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.sm,
      color: c.textoSecundario,
    },
    metaSite: {
      fontFamily: tipografia.fuentes.mono,
      fontSize: tipografia.sizes.xs,
      color: c.muted,
    },
    metaUrlImg: {
      fontFamily: tipografia.fuentes.mono,
      fontSize: tipografia.sizes.xs,
      color: c.muted,
    },
    textoError: {
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.sm,
      color: colores.error,
      textAlign: 'center',
    },
    btnGuardar: {
      backgroundColor: colores.primario,
      borderRadius: espaciado.bordes.md,
      paddingVertical: espaciado.md,
      alignItems: 'center',
    },
    btnGuardarTexto: {
      fontFamily: tipografia.fuentes.ui,
      fontSize: tipografia.sizes.md,
      color: '#fff',
    },
    inputMultilinea: {
      paddingVertical: espaciado.md,
      textAlignVertical: 'top',
      minHeight: 72,
    },
  });
}