import { colores, espaciado, tipografia } from '@/styles';
import { useTema } from '@/context/TemaContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Categoria } from '@/services/categorias';
import { obtener } from '@/services/storage';
import { API_BASE } from '@/constants/api';

// ─── Props ────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onCerrar: () => void;
  onCategoriaCreada: (categoria: Categoria) => void;
}

// ─── Componente ───────────────────────────────────────────

export default function ModalCategoria({ visible, onCerrar, onCategoriaCreada }: Props) {
  const { tema } = useTema();
  const c = tema === 'dark' ? colores.dark : colores.light;
  const styles = crearEstilos(c);

  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function alGuardar() {
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) return setError('El nombre es obligatorio.');

    try {
      setGuardando(true);
      setError(null);

      const token = await obtener('token');
      if (!token) throw new Error('No hay sesión activa.');

      const respuesta = await fetch(`${API_BASE}/insert.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token,
        },
        body: JSON.stringify({
          tabla: 'link_categorias',
          categoria_nombre: nombreLimpio,
          categoria_activa: 1,
        }),
      });

      const datos = await respuesta.json();

      if (!datos.ok) {
        throw new Error(datos.error || 'Error al crear la categoría');
      }

      onCategoriaCreada({
        categoria_id: datos.new_id,
        categoria_nombre: nombreLimpio,
        categoria_color: null,
        categoria_activa: 1,
      });

      setNombre('');
      onCerrar();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  function alCerrar() {
    setNombre('');
    setError(null);
    onCerrar();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={alCerrar}
    >
      <Pressable style={styles.fondo} onPress={alCerrar}>
        <Pressable style={styles.caja} onPress={() => { }}>

          {/* ── Cabecera ── */}
          <View style={styles.cabecera}>
            <Text style={styles.titulo}>Nueva categoría</Text>
            <Pressable onPress={alCerrar}>
              <FontAwesome name="times" size={20} color={c.muted} />
            </Pressable>
          </View>

          {/* ── Input nombre ── */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre de la categoría"
              placeholderTextColor={c.muted}
              autoFocus
              onSubmitEditing={alGuardar}
              returnKeyType="done"
            />
            {nombre.length > 0 && (
              <Pressable onPress={() => setNombre('')}>
                <FontAwesome name="times-circle" size={18} color={c.muted} />
              </Pressable>
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
              : <Text style={styles.btnGuardarTexto}>Crear categoría</Text>
            }
          </Pressable>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Estilos ──────────────────────────────────────────────

function crearEstilos(c: typeof colores.dark) {
  return StyleSheet.create({
    fondo: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: espaciado.lg,
    },
    caja: {
      width: '100%',
      maxWidth: 420,
      alignSelf: 'center',
      backgroundColor: c.card,
      borderRadius: espaciado.bordes.lg,
      padding: espaciado.lg,
      gap: espaciado.md,
      borderWidth: 1,
      borderColor: c.borde,
    },
    cabecera: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    titulo: {
      fontFamily: tipografia.fuentes.subtitulo,
      fontSize: tipografia.sizes.lg,
      color: c.texto,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.fondo,
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
    textoError: {
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.sm,
      color: colores.error,
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