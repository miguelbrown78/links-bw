import { traerCategorias, Categoria } from '@/services/categorias';
import { insertarTag } from '@/services/tags';
import { obtenerMetadatos, guardarLinkCompleto, guardarImagenCompleto } from '@/services/guardar-link';
import { subirImagenDesdeUrl, subirImagenDesdeArchivo } from '@/services/upload';
import { colores, espaciado, tipografia } from '@/styles';
import { useTema } from '@/context/TemaContext';
import ModalCategoria from '@/components/ModalCategoria';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
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

type TipoPost = 'link' | 'imagen';

interface TagLocal {
  nombre: string;
}

// ─── Pantalla ─────────────────────────────────────────────

export default function GuardarLink() {
  const { tema } = useTema();
  const c = tema === 'dark' ? colores.dark : colores.light;
  const styles = crearEstilos(c);
  const router = useRouter();
  const {
    urlCompartida,
    imagenBase64,
    imagenMime,
    imagenNombre,
    imagenUri,
  } = useLocalSearchParams<{
    urlCompartida?: string;
    imagenBase64?: string;
    imagenMime?: string;
    imagenNombre?: string;
    imagenUri?: string;
  }>();

  // ── Tipo de post ──
  const [tipoPost, setTipoPost] = useState<TipoPost>('link');

  // ── Campos comunes ──
  const [nombre, setNombre] = useState('');
  const [catId, setCatId] = useState<number | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<TagLocal[]>([]);

  // ── Campos tipo link ──
  const [url, setUrl] = useState('');
  const [meta, setMeta] = useState<{
    titulo: string;
    descripcion: string;
    site: string;
    url_img: string;
  } | null>(null);
  const [cargandoMeta, setCargandoMeta] = useState(false);

  // ── Campos tipo imagen ──
  const [urlImagenManual, setUrlImagenManual] = useState('');
  const [imagenLocal, setImagenLocal] = useState<{ uri: string; base64: string; mimeType: string } | null>(null);
  const [urlLinkOpcional, setUrlLinkOpcional] = useState('');
  const [metaImagen, setMetaImagen] = useState<{
    titulo: string;
    descripcion: string;
    site: string;
  } | null>(null);
  const [cargandoMetaImagen, setCargandoMetaImagen] = useState(false);

  // ── Estado ──
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);

  const urlRef = useRef('');

  useEffect(() => {
    cargarCategorias();
  }, []);

  // ── Inyectar URL compartida ──
  useEffect(() => {
    if (urlCompartida) {
      alCambiarUrl(urlCompartida);
    }
  }, [urlCompartida]);

  // ── Inyectar imagen desde drag and drop (web) o share intent (móvil) ──
  useEffect(() => {
    // Imagen desde drag and drop — llega como base64
    if (imagenBase64 && imagenMime) {
      setTipoPost('imagen');
      setImagenLocal({
        uri: `data:${imagenMime};base64,${imagenBase64}`,
        base64: imagenBase64,
        mimeType: imagenMime,
      });
      if (imagenNombre) setNombre(imagenNombre.replace(/\.[^/.]+$/, ''));
      return;
    }

    // Imagen desde share intent — llega como URI local
    if (imagenUri && imagenMime) {
      setTipoPost('imagen');
      const convertirABase64 = async () => {
        try {
          const respuesta = await fetch(imagenUri);
          const blob = await respuesta.blob();
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            setImagenLocal({
              uri: imagenUri,
              base64,
              mimeType: imagenMime,
            });
          };
          reader.readAsDataURL(blob);
        } catch (e: any) {
          setError('Error al cargar la imagen compartida.');
        }
      };
      convertirABase64();
      if (imagenNombre) setNombre(imagenNombre.replace(/\.[^/.]+$/, ''));
    }
  }, [imagenBase64, imagenUri]);

  // ── Cargar metadata desde URL opcional en modo imagen ──
  useEffect(() => {
    if (tipoPost !== 'imagen') return;
    if (!urlLinkOpcional) {
      setMetaImagen(null);
      return;
    }

    const urlValida = urlLinkOpcional.startsWith('http://') || urlLinkOpcional.startsWith('https://');
    if (!urlValida) return;

    const timer = setTimeout(async () => {
      try {
        setCargandoMetaImagen(true);
        const datos = await obtenerMetadatos(urlLinkOpcional);
        setMetaImagen({
          titulo: datos.title || '',
          descripcion: datos.description || '',
          site: datos.site_name || '',
        });
        if (datos.title) setNombre(datos.title);
      } catch {
        // Si falla metadata no bloqueamos
      } finally {
        setCargandoMetaImagen(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [urlLinkOpcional, tipoPost]);

  async function cargarCategorias() {
    try {
      const datos = await traerCategorias();
      setCategorias(datos);
      if (datos.length > 0) setCatId(datos[0].categoria_id);
    } catch (e: any) {
      setError(e.message);
    }
  }

  function alCambiarTipo(tipo: TipoPost) {
    setTipoPost(tipo);
    setError(null);
    setMeta(null);
    setMetaImagen(null);
    setUrl('');
    setNombre('');
    setUrlImagenManual('');
    setImagenLocal(null);
    setUrlLinkOpcional('');
  }

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
      });
      setNombre(datos.title || '');
    } catch {
      // Si falla metadata no bloqueamos
    } finally {
      setCargandoMeta(false);
    }
  }

  async function alSeleccionarImagen() {
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.9,
        base64: true,
      });

      if (!resultado.canceled && resultado.assets[0]) {
        const asset = resultado.assets[0];
        setImagenLocal({
          uri: asset.uri,
          base64: asset.base64 ?? '',
          mimeType: asset.mimeType ?? 'image/jpeg',
        });
        setUrlImagenManual('');
      }
    } catch (e: any) {
      setError(e.message);
    }
  }

  function añadirTag() {
    const nombreTag = tagInput.trim();
    if (!nombreTag) return;
    if (tags.find((t) => t.nombre.toLowerCase() === nombreTag.toLowerCase())) return;
    setTags([...tags, { nombre: nombreTag }]);
    setTagInput('');
  }

  function quitarTag(index: number) {
    setTags(tags.filter((_, i) => i !== index));
  }

  function alCategoriaCreada(categoria: Categoria) {
    setCategorias([...categorias, categoria]);
    setCatId(categoria.categoria_id);
  }

  async function alGuardar() {
    if (!catId) return setError('Selecciona una categoría.');

    try {
      setGuardando(true);
      setError(null);

      const tags_ids: number[] = [];
      for (const tag of tags) {
        const id = await insertarTag(tag.nombre);
        tags_ids.push(id);
      }

      if (tipoPost === 'link') {
        if (!url) return setError('La URL es obligatoria.');
        await guardarLinkCompleto(url, catId, tags_ids, nombre || undefined);

      } else {
        let ruta_img: string;

        if (imagenLocal) {
          ruta_img = await subirImagenDesdeArchivo(imagenLocal.base64, imagenLocal.mimeType);
        } else if (urlImagenManual) {
          ruta_img = await subirImagenDesdeUrl(urlImagenManual);
        } else {
          return setError('Añade una imagen.');
        }

        await guardarImagenCompleto(
          ruta_img,
          catId,
          tags_ids,
          nombre || undefined,
          urlLinkOpcional || undefined,
          metaImagen?.descripcion || undefined,
          metaImagen?.site || undefined,
        );
      }

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

        {/* ── 0. Selector tipo post ── */}
        <View style={styles.grupo}>
          <Text style={styles.label}>Tipo</Text>
          <View style={styles.selectorTipo}>
            <Pressable
              style={[styles.btnTipo, tipoPost === 'link' && styles.btnTipoActivo]}
              onPress={() => alCambiarTipo('link')}
            >
              <FontAwesome name="link" size={14} color={tipoPost === 'link' ? '#fff' : c.muted} />
              <Text style={[styles.btnTipoTexto, tipoPost === 'link' && styles.btnTipoTextoActivo]}>
                Link
              </Text>
            </Pressable>
            <Pressable
              style={[styles.btnTipo, tipoPost === 'imagen' && styles.btnTipoActivo]}
              onPress={() => alCambiarTipo('imagen')}
            >
              <FontAwesome name="image" size={14} color={tipoPost === 'imagen' ? '#fff' : c.muted} />
              <Text style={[styles.btnTipoTexto, tipoPost === 'imagen' && styles.btnTipoTextoActivo]}>
                Imagen
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ── Campos tipo LINK ── */}
        {tipoPost === 'link' && (
          <>
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
              {cargandoMeta && (
                <ActivityIndicator size="small" color={colores.primario} style={{ marginTop: espaciado.sm }} />
              )}
            </View>

            {meta && (
              <View style={styles.metaBox}>
                {meta.url_img ? (
                  <Image source={{ uri: meta.url_img }} style={styles.metaImagen} contentFit="cover" />
                ) : null}
                <View style={styles.metaDatos}>
                  {meta.titulo ? <Text style={styles.metaTitulo}>{meta.titulo}</Text> : null}
                  {meta.descripcion ? <Text style={styles.metaDesc}>{meta.descripcion}</Text> : null}
                  {meta.site ? <Text style={styles.metaSite}>{meta.site}</Text> : null}
                </View>
              </View>
            )}
          </>
        )}

        {/* ── Campos tipo IMAGEN ── */}
        {tipoPost === 'imagen' && (
          <>
            <View style={styles.grupo}>
              <Text style={styles.label}>Imagen</Text>
              <Pressable style={styles.btnSeleccionarImagen} onPress={alSeleccionarImagen}>
                <FontAwesome name="upload" size={16} color={colores.primario} />
                <Text style={styles.btnSeleccionarImagenTexto}>
                  {imagenLocal ? 'Cambiar imagen' : 'Seleccionar desde dispositivo'}
                </Text>
              </Pressable>
              {imagenLocal && (
                <View style={styles.previstaImagenContenedor}>
                  <Image
                    source={{ uri: imagenLocal.uri }}
                    style={styles.previstaImagen}
                    contentFit="contain"
                  />
                  <Pressable style={styles.btnEliminarImagen} onPress={() => setImagenLocal(null)}>
                    <FontAwesome name="times-circle" size={20} color={colores.error} />
                  </Pressable>
                </View>
              )}
            </View>

            {!imagenLocal && (
              <View style={styles.grupo}>
                <Text style={styles.label}>O pega una URL de imagen</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    value={urlImagenManual}
                    onChangeText={setUrlImagenManual}
                    placeholder="https://imagen.com/foto.jpg"
                    placeholderTextColor={c.muted}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                  {urlImagenManual.length > 0 && (
                    <Pressable onPress={() => setUrlImagenManual('')}>
                      <FontAwesome name="times-circle" size={18} color={c.muted} />
                    </Pressable>
                  )}
                </View>
                {urlImagenManual.length > 0 && (
                  <Image
                    source={{ uri: urlImagenManual }}
                    style={styles.previstaImagen}
                    contentFit="contain"
                  />
                )}
              </View>
            )}

            <View style={styles.grupo}>
              <Text style={styles.label}>URL del link (opcional)</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={urlLinkOpcional}
                  onChangeText={setUrlLinkOpcional}
                  placeholder="https://..."
                  placeholderTextColor={c.muted}
                  autoCapitalize="none"
                  keyboardType="url"
                />
                {urlLinkOpcional.length > 0 && (
                  <Pressable onPress={() => setUrlLinkOpcional('')}>
                    <FontAwesome name="times-circle" size={18} color={c.muted} />
                  </Pressable>
                )}
              </View>
              {cargandoMetaImagen && (
                <ActivityIndicator size="small" color={colores.primario} style={{ marginTop: espaciado.sm }} />
              )}
              {metaImagen && (
                <View style={styles.metaBox}>
                  <View style={styles.metaDatos}>
                    {metaImagen.titulo ? <Text style={styles.metaTitulo}>{metaImagen.titulo}</Text> : null}
                    {metaImagen.descripcion ? <Text style={styles.metaDesc}>{metaImagen.descripcion}</Text> : null}
                    {metaImagen.site ? <Text style={styles.metaSite}>{metaImagen.site}</Text> : null}
                  </View>
                </View>
              )}
            </View>
          </>
        )}

        {/* ── Nombre ── */}
        <View style={styles.grupo}>
          <Text style={styles.label}>Nombre</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputMultilinea]}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre del post"
              placeholderTextColor={c.muted}
              multiline
              numberOfLines={4}
              blurOnSubmit={true}
            />
            {nombre.length > 0 && (
              <Pressable onPress={() => setNombre('')}>
                <FontAwesome name="times-circle" size={18} color={c.muted} />
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Categorías ── */}
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
            <Pressable style={styles.btnNuevaCategoria} onPress={() => setModalCategoriaVisible(true)}>
              <FontAwesome name="plus" size={12} color={colores.primario} />
              <Text style={styles.btnNuevaCategoriaTexto}>Nueva categoría</Text>
            </Pressable>
          </View>
        </View>

        {/* ── Tags ── */}
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
            : <Text style={styles.btnGuardarTexto}>Guardar</Text>
          }
        </Pressable>

      </ScrollView>

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
    selectorTipo: {
      flexDirection: 'row',
      gap: espaciado.sm,
    },
    btnTipo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: espaciado.sm,
      paddingHorizontal: espaciado.lg,
      paddingVertical: espaciado.sm,
      borderRadius: espaciado.bordes.full,
      borderWidth: 1,
      borderColor: c.borde,
      backgroundColor: c.card,
    },
    btnTipoActivo: {
      backgroundColor: colores.primario,
      borderColor: colores.primario,
    },
    btnTipoTexto: {
      fontFamily: tipografia.fuentes.ui,
      fontSize: tipografia.sizes.sm,
      color: c.muted,
    },
    btnTipoTextoActivo: {
      color: '#fff',
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
    inputMultilinea: {
      paddingVertical: espaciado.md,
      textAlignVertical: 'top',
      minHeight: 72,
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
    btnSeleccionarImagen: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: espaciado.sm,
      paddingHorizontal: espaciado.lg,
      paddingVertical: espaciado.md,
      borderRadius: espaciado.bordes.md,
      borderWidth: 1,
      borderColor: colores.primario,
      borderStyle: 'dashed',
      justifyContent: 'center',
    },
    btnSeleccionarImagenTexto: {
      fontFamily: tipografia.fuentes.ui,
      fontSize: tipografia.sizes.sm,
      color: colores.primario,
    },
    previstaImagenContenedor: {
      position: 'relative',
    },
    previstaImagen: {
      width: '100%',
      height: 200,
      borderRadius: espaciado.bordes.md,
      marginTop: espaciado.sm,
    },
    btnEliminarImagen: {
      position: 'absolute',
      top: espaciado.sm,
      right: espaciado.sm,
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
  });
}