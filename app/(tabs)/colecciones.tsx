import { StyleSheet, View, Text } from 'react-native';
import { colores, tipografia } from '@/styles';
import { useTema } from '@/context/TemaContext';

export default function Colecciones() {
  const { tema } = useTema();
  const c = tema === 'dark' ? colores.dark : colores.light;
  const styles = crearEstilos(c);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Colecciones</Text>
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
    },
  });
}