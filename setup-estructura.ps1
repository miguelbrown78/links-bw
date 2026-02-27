# ============================================================
# Links Browny — Reestructuración de carpetas
# Fecha: 27 Feb 2026
# ============================================================

# PASO 1 — Crear estructura src/
mkdir src\components\ui, src\components\links, src\components\dashboard, src\constants, src\hooks, src\services

# PASO 2 — Mover hooks existentes
Move-Item components\useColorScheme.ts src\hooks\useColorScheme.ts
Move-Item components\useColorScheme.web.ts src\hooks\useColorScheme.web.ts
Move-Item components\useClientOnlyValue.ts src\hooks\useClientOnlyValue.ts

# PASO 3 — Mover constants
Move-Item constants\Colors.ts src\constants\Colors.ts

# PASO 4 — Eliminar archivos del template
Remove-Item components\EditScreenInfo.tsx
Remove-Item components\ExternalLink.tsx
Remove-Item components\StyledText.tsx
Remove-Item components\Themed.tsx
Remove-Item components\__tests__ -Recurse

# PASO 5 — Eliminar carpetas vacías
Remove-Item constants -Recurse
Remove-Item components -Recurse

# PASO 6 — Actualizar tsconfig.json (alias @/ apunta a src/)
(Get-Content tsconfig.json) -replace '"\./\*"', '"./src/*"' | Set-Content tsconfig.json

# PASO 7 — Actualizar app/_layout.tsx
(Get-Content app\_layout.tsx) -replace '@/components/useColorScheme', '@/hooks/useColorScheme' | Set-Content app\_layout.tsx

# PASO 8 — Actualizar app/(tabs)/_layout.tsx
@'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useClientOnlyValue } from '@/hooks/useClientOnlyValue';
import Colors from '@/constants/Colors';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}>
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
'@ | Set-Content "app\(tabs)\_layout.tsx"

# PASO 9 — Reemplazar app/(tabs)/index.tsx (Dashboard placeholder)
@'
import { StyleSheet, View, Text } from 'react-native';

export default function Dashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
'@ | Set-Content "app\(tabs)\index.tsx"

# PASO 10 — Eliminar two.tsx y crear links.tsx (Mis Links placeholder)
Remove-Item "app\(tabs)\two.tsx"
@'
import { StyleSheet, View, Text } from 'react-native';

export default function MisLinks() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Links</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
'@ | Set-Content "app\(tabs)\links.tsx"

# PASO 11 — Crear colecciones.tsx (placeholder)
@'
import { StyleSheet, View, Text } from 'react-native';

export default function Colecciones() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Colecciones</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
'@ | Set-Content "app\(tabs)\colecciones.tsx"

# PASO 12 — Limpiar modal.tsx
@'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';

export default function Modal() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modal</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
'@ | Set-Content "app\modal.tsx"

# PASO 13 — Limpiar +not-found.tsx
@'
import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Esta pantalla no existe.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Volver al inicio</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
'@ | Set-Content "app\+not-found.tsx"