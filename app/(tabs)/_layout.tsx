import { useAuth } from '@/context/AuthContext';
import { useTema } from '@/context/TemaContext';
import { colores, espaciado, tipografia } from '@/styles';
import BuscadorHeader from '@/components/BuscadorHeader';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import { Image, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Boton from '@/components/Boton';
import MenuApp from '@/components/MenuApp';

function HeaderConBuscador() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={{ width: 90 }}
        resizeMode="contain"
      />
      <BuscadorHeader />
    </View>
  );
}

export default function TabLayout() {
  const { tema } = useTema();
  const c = tema === 'dark' ? colores.dark : colores.light;
  const insets = useSafeAreaInsets();

  return (
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
  );
}

/***********************************************/

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