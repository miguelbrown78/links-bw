import { useBuscador } from '@/context/BuscadorContext';
import { colores, espaciado, tipografia } from '@/styles';
import { useTema } from '@/context/TemaContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, useSegments } from 'expo-router';
import { Pressable, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';

export default function BuscadorHeader() {
  const { tema } = useTema();
  const c = tema === 'dark' ? colores.dark : colores.light;
  const { textoBusqueda, setTextoBusqueda } = useBuscador();
  const router = useRouter();
  const segments = useSegments();
  const { width } = useWindowDimensions();
  const styles = crearEstilos(c, width);


  function alCambiarTexto(texto: string) {
    setTextoBusqueda(texto);

    // Si no estamos en Mis Links, navegar allí
    const enLinks = segments[segments.length - 1] === 'links';
    if (!enLinks && texto.length > 0) {
      router.push('/(tabs)/links');
    }
  }

  function alLimpiar() {
    setTextoBusqueda('');
  }

  return (
    <View style={styles.contenedor}>
      <FontAwesome name="search" size={14} color={c.muted} />
      <TextInput
        style={styles.input}
        value={textoBusqueda}
        onChangeText={alCambiarTexto}
        placeholder="..."
        placeholderTextColor={c.muted}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
        tabIndex={0}
        autoFocus
        onFocus={(e: any) => e.target.style.outline = 'none'}
      />
      {textoBusqueda.length > 0 && (
        <Pressable onPress={alLimpiar}>
          <FontAwesome name="times-circle" size={14} color={c.muted} />
        </Pressable>
      )}
    </View>
  );
}

function calcularMaxWidth(width: number): number {
  if (width < 480) return 20;   // móvil pequeño
  if (width < 768) return 200;  // móvil grande
  if (width < 1024) return 300;  // tablet
  return 300;                   // escritorio
}

function crearEstilos(c: typeof colores.dark, width: number) {
  return StyleSheet.create({
    contenedor: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.borde,
      borderRadius: espaciado.bordes.full,
      paddingHorizontal: espaciado.md,
      paddingVertical: espaciado.sm,
      gap: espaciado.sm,
      marginHorizontal: espaciado.md,

    },

    input: {
      flex: 1,
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.sm,
      color: c.texto,
      padding: 0,
      width: calcularMaxWidth(width),
    } as any,
  });
}