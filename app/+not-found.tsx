import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { colores, tipografia, espaciado } from '@/styles';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.titulo}>Esta pantalla no existe.</Text>
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
    padding: espaciado.xl,
    backgroundColor: colores.dark.fondo,
  },
  titulo: {
    fontSize: tipografia.sizes.lg,
    fontWeight: tipografia.pesos.bold as any,
    color: colores.dark.texto,
  },
  link: {
    marginTop: espaciado.lg,
    paddingVertical: espaciado.md,
  },
  linkText: {
    fontSize: tipografia.sizes.sm,
    color: colores.primario,
  },
});