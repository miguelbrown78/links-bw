// app/(tabs)/_layout.tsx

import Boton from '@/components/Boton';
import BuscadorHeader from '@/components/BuscadorHeader';
import MenuApp from '@/components/MenuApp';
import { useAuth } from '@/context/AuthContext';
import { FiltroProvider, useFiltro } from '@/context/FiltroContext';
import { useTema } from '@/context/TemaContext';
import { colores, espaciado, tipografia } from '@/styles';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function HeaderConBuscador() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={{ width: 90, height: 40 }}
        resizeMode="contain"
      />
      <BuscadorHeader />
    </View>
  );
}

function DropdownGlobal() {
  const { tema } = useTema();
  const c = tema === 'dark' ? colores.dark : colores.light;
  const {
    dropdownVisible,
    posicion,
    texto,
    categoriasFiltradas,
    tagsFiltrados,
    hayResultados,
    cerrarDropdown,
    seleccionar,
  } = useFiltro();
  const styles = crearEstilosDropdown(c);

  if (!dropdownVisible) return null;

  return (
    <>
      <Pressable style={StyleSheet.absoluteFill} onPress={cerrarDropdown} />
      <View style={[styles.dropdown, { top: posicion.top, left: posicion.left, width: posicion.width }]}>
        <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 260 }}>

          {!hayResultados && (
            <Text style={styles.sinResultados}>Sin resultados para "{texto}"</Text>
          )}

          {categoriasFiltradas.length > 0 && (
            <>
              <Text style={styles.seccion}>CATEGORÍAS</Text>
              <View style={styles.pills}>
                {categoriasFiltradas.map((cat) => (
                  <Pressable
                    key={cat.categoria_id}
                    style={[styles.pill, { backgroundColor: cat.categoria_color ?? colores.primario }]}
                    onPress={() => seleccionar({ tipo: 'categoria', id: cat.categoria_id, nombre: cat.categoria_nombre, color: cat.categoria_color })}
                  >
                    <FontAwesome name="folder" size={10} color="#fff" />
                    <Text style={styles.pillTexto}>{cat.categoria_nombre}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {tagsFiltrados.length > 0 && (
            <>
              <Text style={styles.seccion}>TAGS</Text>
              <View style={styles.pills}>
                {tagsFiltrados.map((tag) => (
                  <Pressable
                    key={tag.tag_id}
                    style={[styles.pill, { backgroundColor: colores.tag }]}
                    onPress={() => seleccionar({ tipo: 'tag', id: tag.tag_id, nombre: tag.tag_nombre })}
                  >
                    <FontAwesome name="tag" size={10} color="#fff" />
                    <Text style={styles.pillTexto}>{tag.tag_nombre}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

        </ScrollView>
      </View>
    </>
  );
}

function TabLayoutInner() {
  const { tema } = useTema();
  const c = tema === 'dark' ? colores.dark : colores.light;
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colores.primario,
          tabBarInactiveTintColor: c.muted,
          tabBarStyle: {
            backgroundColor: c.card,
            borderTopColor: c.borde,
            borderTopWidth: 1,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
          },
          tabBarLabelStyle: {
            fontSize: tipografia.sizes.xs,
            fontWeight: tipografia.pesos.medium as any,
          },
          headerShown: true,
          headerStyle: {
            backgroundColor: c.fondo,
            borderBottomWidth: 0,
            borderBottomColor: c.borde,
          },
          headerTintColor: c.texto,
          headerTitle: () => <HeaderConBuscador />,
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: espaciado.md, marginRight: espaciado.lg }}>
              <BotonNuevoLink />
              <MenuApp />
            </View>
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="links"
          options={{
            title: 'Mis Links',
            tabBarIcon: ({ color }) => <TabBarIcon name="bookmark" color={color} />,
          }}
        />
        <Tabs.Screen
          name="colecciones"
          options={{
            title: 'Colecciones',
            tabBarIcon: ({ color }) => <TabBarIcon name="folder" color={color} />,
          }}
        />
      </Tabs>

      <DropdownGlobal />
    </View>
  );
}

export default function TabLayout() {
  return (
    <FiltroProvider>
      <TabLayoutInner />
    </FiltroProvider>
  );
}

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

function BotonNuevoLink() {
  const router = useRouter();
  return (
    <Boton
      tipo="primario"
      label="Añadir"
      icono="plus-circle"
      onPress={() => router.push('/guardar-link')}
    />
  );
}

function BotonTema() {
  const { tema, cambiarTema } = useTema();
  return (
    <Pressable onPress={cambiarTema} style={{ marginRight: 16, padding: 4 }}>
      <FontAwesome
        name={tema === 'dark' ? 'sun-o' : 'moon-o'}
        size={20}
        color={colores.primario}
      />
    </Pressable>
  );
}

function BotonLogout() {
  const { logout } = useAuth();
  return (
    <Pressable onPress={logout} style={{ padding: 4 }}>
      <FontAwesome
        name="sign-out"
        size={20}
        color={colores.primario}
      />
    </Pressable>
  );
}

function crearEstilosDropdown(c: typeof colores.dark) {
  return StyleSheet.create({
    dropdown: {
      position: 'absolute',
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.borde,
      borderRadius: espaciado.bordes.md,
      padding: espaciado.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 20,
      zIndex: 999,
    },
    seccion: {
      fontFamily: tipografia.fuentes.ui,
      fontSize: tipografia.sizes.xs,
      color: c.muted,
      marginBottom: espaciado.xs,
      marginTop: espaciado.xs,
    },
    pills: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: espaciado.xs,
      marginBottom: espaciado.sm,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: espaciado.bordes.full,
      paddingHorizontal: espaciado.sm,
      paddingVertical: 4,
      gap: 4,
    },
    pillTexto: {
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.xs,
      color: '#fff',
    },
    sinResultados: {
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.sm,
      color: c.muted,
      textAlign: 'center',
      paddingVertical: espaciado.md,
    },
  });
}