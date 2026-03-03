// src/components/links/FiltroPills.tsx

import { useFiltro } from '@/context/FiltroContext';
import { useTema } from '@/context/TemaContext';
import { colores, espaciado, tipografia } from '@/styles';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useRef } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function FiltroPills() {
  const { tema } = useTema();
  const c = tema === 'dark' ? colores.dark : colores.light;
  const styles = crearEstilos(c);
  const contenedorRef = useRef<View>(null);
  const inputRef = useRef<TextInput>(null);

  const {
    texto,
    seleccionados,
    setTexto,
    quitar,
    limpiarTodo,
    abrirDropdown,
    cerrarDropdown,
    cargarDatos,
  } = useFiltro();

  useEffect(() => {
    cargarDatos();
  }, []);

  function alFoco(e: any) {
    contenedorRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      abrirDropdown({ top: pageY + height + 4, left: pageX, width });
    });
    if (Platform.OS === 'web') {
      e.target.style.outline = 'none';
    }
  }

  function alCambiarTexto(t: string) {
    setTexto(t);
    contenedorRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      abrirDropdown({ top: pageY + height + 4, left: pageX, width });
    });
  }

  function alLimpiarInput() {
    cerrarDropdown();
    inputRef.current?.blur();
  }

  return (
    <View style={styles.wrapper}>

      {/* ── Input ── */}
      <View ref={contenedorRef} style={styles.inputContenedor}>
        <FontAwesome name="filter" size={12} color={c.muted} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={texto}
          onChangeText={alCambiarTexto}
          onFocus={alFoco}
          placeholder="Filtrar..."
          placeholderTextColor={c.muted}
          autoCapitalize="none"
          returnKeyType="done"
          underlineColorAndroid="transparent"
          selectionColor={colores.primario}
          cursorColor={colores.primario}
        />
        {texto.length > 0 && (
          <Pressable onPress={alLimpiarInput} hitSlop={6}>
            <FontAwesome name="times-circle" size={12} color={c.muted} />
          </Pressable>
        )}
      </View>

      {/* ── Pills seleccionadas ── */}
      {seleccionados.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillsScroll}
          contentContainerStyle={styles.pillsContenido}
        >
          {seleccionados.map((item) => (
            <View
              key={`${item.tipo}-${item.id}`}
              style={[
                styles.pillActiva,
                { backgroundColor: item.tipo === 'categoria' ? (item.color ?? colores.primario) : colores.tag },
              ]}
            >
              <FontAwesome name={item.tipo === 'categoria' ? 'folder' : 'tag'} size={10} color="#fff" />
              <Text style={styles.pillActivaTexto}>{item.nombre}</Text>
              <Pressable onPress={() => quitar(item)} hitSlop={6}>
                <FontAwesome name="times" size={10} color="#fff" />
              </Pressable>
            </View>
          ))}
          <Pressable onPress={limpiarTodo} style={styles.pillLimpiar}>
            <Text style={styles.pillLimpiarTexto}>Limpiar</Text>
          </Pressable>
        </ScrollView>
      )}

    </View>
  );
}

function crearEstilos(c: typeof colores.dark) {
  return StyleSheet.create({
    wrapper: {
      flex: 1,
    },
    inputContenedor: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.borde,
      borderRadius: espaciado.bordes.full,
      paddingHorizontal: espaciado.md,
      gap: espaciado.sm,
      height: 36,
    },
    input: {
      flex: 1,
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.sm,
      color: c.texto,
      padding: 0,
      height: 36,
    } as any,
    pillsScroll: {
      flexGrow: 0,
      marginTop: espaciado.xs,
    },
    pillsContenido: {
      flexDirection: 'row',
      gap: espaciado.xs,
      paddingHorizontal: espaciado.xs,
      alignItems: 'center',
    },
    pillActiva: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: espaciado.bordes.full,
      paddingHorizontal: espaciado.sm,
      paddingVertical: 3,
      gap: 4,
    },
    pillActivaTexto: {
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.xs,
      color: '#fff',
    },
    pillLimpiar: {
      borderRadius: espaciado.bordes.full,
      paddingHorizontal: espaciado.sm,
      paddingVertical: 3,
      borderWidth: 1,
      borderColor: c.borde,
    },
    pillLimpiarTexto: {
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.xs,
      color: c.muted,
    },
  });
}