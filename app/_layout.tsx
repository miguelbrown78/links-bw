import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import colores from '@/styles/colors';
import tipografia from '@/styles/typography';
import { TemaProvider, useTema } from '@/context/TemaContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';

import {
  Jost_600SemiBold,
  Jost_700Bold,
} from '@expo-google-fonts/jost';

import {
  JetBrainsMono_400Regular,
} from '@expo-google-fonts/jetbrains-mono';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    JetBrainsMono_400Regular,
    Jost_600SemiBold,
    Jost_700Bold,
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <TemaProvider>
      <AuthProvider>
        <NavegacionInterna />
      </AuthProvider>
    </TemaProvider>
  );
}

function NavegacionInterna() {
  const { tema } = useTema();
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (cargando) return;

    const enLogin = segments[0] === 'login';

    if (!usuario && !enLogin) {
      router.replace('/login');
    } else if (usuario && enLogin) {
      router.replace('/(tabs)');
    }
  }, [usuario, cargando, segments]);

  return (
    <ThemeProvider value={tema === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="preview"
          options={{
            title: 'Guia de estilos',
            headerStyle: { backgroundColor: colores.dark.card },
            headerTintColor: colores.primario,
            headerTitleStyle: { fontFamily: tipografia.fuentes.titulo },
          }}
        />
        <Stack.Screen
          name="guardar-link"
          options={{
            presentation: 'modal',
            title: 'Guardar link',
            headerStyle: { backgroundColor: tema === 'dark' ? colores.dark.card : colores.light.card },
            headerTintColor: colores.primario,
            headerTitleStyle: { fontFamily: tipografia.fuentes.titulo },
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}