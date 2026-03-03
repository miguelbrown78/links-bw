// src/components/BuscadorHeader.tsx

import { useBuscador } from '@/context/BuscadorContext';
import { useTema } from '@/context/TemaContext';
import { colores, espaciado, tipografia } from '@/styles';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, useSegments } from 'expo-router';
import { Dimensions, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

const { width: ANCHO_PANTALLA } = Dimensions.get('window');
const ANCHO_INPUT = ANCHO_PANTALLA - 90 - 90 - 40 - 48;

export default function BuscadorHeader() {
  const { tema } = useTema();
  const c = tema === 'dark' ? colores.dark : colores.light;
  const { textoBusqueda, setTextoBusqueda } = useBuscador();
  const router = useRouter();
  const segments = useSegments();
  const styles = crearEstilos(c);

  function alCambiarTexto(texto: string) {
    setTextoBusqueda(texto);
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
        placeholder="Buscar..."
        placeholderTextColor={c.muted}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
        underlineColorAndroid="transparent"
        selectionColor={colores.primario}
        cursorColor={colores.primario}
        onFocus={(e: any) => {
          if (Platform.OS === 'web') {
            e.target.style.outline = 'none';
          }
        }}
      />
      {textoBusqueda.length > 0 && (
        <Pressable onPress={alLimpiar}>
          <FontAwesome name="times-circle" size={14} color={c.muted} />
        </Pressable>
      )}
    </View>
  );
}

function crearEstilos(c: typeof colores.dark) {
  return StyleSheet.create({
    contenedor: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.borde,
      borderRadius: espaciado.bordes.full,
      paddingHorizontal: espaciado.md,
      paddingVertical: espaciado.sm,
      gap: espaciado.sm,
      marginHorizontal: espaciado.md,
      width: 120,                 // ← fijo duro para test
      height: 35,                 // ← fijo duro para test
    },
    input: {
      flex: 1,
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.sm,
      color: c.texto,
      padding: 0,
      //width: 150,                 // ← fijo duro para test
      height: 40,                 // ← fijo duro para test            
    } as any,
  });
}