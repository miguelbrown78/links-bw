import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { colores, tipografia } from '@/styles';
import { useTema } from '@/context/TemaContext';

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
        headerStyle: { backgroundColor: c.card },
        headerTintColor: c.texto,
        headerTitleStyle: { fontFamily: tipografia.fuentes.titulo },
        headerRight: () => <BotonTema />,
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