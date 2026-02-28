import { useAuth } from '@/context/AuthContext';
import { useTema } from '@/context/TemaContext';
import { colores, espaciado, tipografia } from '@/styles';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Image, Pressable, View } from 'react-native';

export default function TabLayout() {
  const { tema } = useTema();

  const c = tema === 'dark' ? colores.dark : colores.light;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: {
          backgroundColor: c.card,
          borderTopColor: c.borde,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
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
        headerTitle: () => (
          <Image
            source={require('../../assets/images/logo.png')}
            style={{ width: 120, height: 36 }}
            resizeMode="contain"
          />
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: espaciado.md, marginRight: espaciado.lg }}>
            <BotonTema />
            <BotonLogout />
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


/********************************************** */

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
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