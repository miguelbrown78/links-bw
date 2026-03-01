import { colores, espaciado, tipografia } from '@/styles';
import { useTema } from '@/context/TemaContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Platform, StyleSheet, Text, View } from 'react-native';

interface OverlayDropProps {
  visible: boolean;
}

export default function OverlayDrop({ visible }: OverlayDropProps) {
  if (Platform.OS !== 'web') return null;
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.caja}>
        <FontAwesome name="link" size={40} color={colores.primario} />
        <Text style={styles.titulo}>Suelta el link aquí</Text>
        <Text style={styles.subtitulo}>Se añadirá automáticamente a tu colección</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(162, 29, 48, 0.15)',
    borderWidth: 3,
    borderColor: colores.primario,
    borderStyle: 'dashed' as any,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none' as any,
  },
  caja: {
    backgroundColor: '#0f0f0fee',
    borderRadius: espaciado.bordes.lg,
    borderWidth: 1,
    borderColor: colores.primario,
    paddingHorizontal: espaciado.xxl,
    paddingVertical: espaciado.xl,
    alignItems: 'center',
    gap: espaciado.md,
  },
  titulo: {
    fontFamily: tipografia.fuentes.titulo,
    fontSize: tipografia.sizes.xl,
    color: colores.primario,
  },
  subtitulo: {
    fontFamily: tipografia.fuentes.cuerpo,
    fontSize: tipografia.sizes.sm,
    color: '#ffe5e7aa',
  },
});