import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { colores, tipografia, espaciado } from '@/styles';
import { useTema } from '@/context/TemaContext';

export default function Dashboard() {
  const { tema } = useTema();
  const c = tema === 'dark' ? colores.dark : colores.light;
  const styles = crearEstilos(c);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Dashboard</Text>
      <Link href="/preview" asChild>
        <Pressable style={styles.boton}>
          <Text style={styles.botonTexto}>Ver guia de estilos</Text>
        </Pressable>
      </Link>
    </View>
  );
}

function crearEstilos(c: typeof colores.dark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.fondo,
    },
    titulo: {
      fontSize: tipografia.sizes.xl,
      fontWeight: tipografia.pesos.bold as any,
      color: c.texto,
      marginBottom: espaciado.xl,
    },
    boton: {
      backgroundColor: colores.primario,
      paddingHorizontal: espaciado.xl,
      paddingVertical: espaciado.md,
      borderRadius: espaciado.bordes.md,
    },
    botonTexto: {
      color: '#FFFFFF',
      fontSize: tipografia.sizes.md,
      fontWeight: tipografia.pesos.semibold as any,
    },
  });
}