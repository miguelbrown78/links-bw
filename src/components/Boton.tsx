import { colores, espaciado, tipografia } from '@/styles';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

// ─── Tipos ────────────────────────────────────────────────

type TipoBoton = 'primario' | 'secundario' | 'fantasma' | 'destructivo';

interface BotonProps {
  tipo: TipoBoton;
  label: string;
  onPress: () => void;
  icono?: React.ComponentProps<typeof FontAwesome>['name'];
  activo?: boolean;
  desactivado?: boolean;
}

// ─── Config por tipo ──────────────────────────────────────

const config: Record<TipoBoton, {
  fondo: string;
  fondoHover: string;
  fondoPress: string;
  texto: string;
  borde: string;
}> = {
  primario: {
    fondo:      colores.primario,
    fondoHover: '#f76e7a',
    fondoPress: '#f77d87',
    texto:      '#ffffff',
    borde:      'transparent',
  },
  secundario: {
    fondo:      colores.secundario,
    fondoHover: '#9b6ef7',
    fondoPress: '#a37ef8',
    texto:      '#ffffff',
    borde:      'transparent',
  },
  fantasma: {
    fondo:      'transparent',
    fondoHover: colores.primario + '22',
    fondoPress: colores.primario + '44',
    texto:      colores.primario,
    borde:      colores.primario,
  },
  destructivo: {
    fondo:      colores.error,
    fondoHover: '#f25f5f',
    fondoPress: '#f47070',
    texto:      '#ffffff',
    borde:      'transparent',
  },
};

// ─── Componente ───────────────────────────────────────────

export default function Boton({ tipo, label, onPress, icono, activo, desactivado }: BotonProps) {
  const c = config[tipo];
  const [hover, setHover] = useState(false);
  const colorTexto = activo ? c.texto : colores.primario;

  const calcularFondo = (pressed: boolean) => {
    if (pressed) return activo ? c.fondoPress : colores.primario + '44';
    if (hover)   return activo ? c.fondoHover : colores.primario + '22';
    return activo ? c.fondo : 'transparent';
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={desactivado}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: calcularFondo(pressed) },
        { borderColor: 'transparent' },
        desactivado && styles.desactivado,
      ]}
    >
      {icono && (
        <FontAwesome
          name={icono}
          size={16}
          color={colorTexto}
        />
      )}
      <Text style={[styles.texto, { color: colorTexto }]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Estilos ──────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.xs,
    paddingHorizontal: espaciado.xl,
    paddingVertical: espaciado.sm,
    borderRadius: espaciado.bordes.full,
    borderWidth: 1,
  },
  texto: {
    fontFamily: tipografia.fuentes.ui,
    fontSize: tipografia.sizes.sm,
  },
  desactivado: {
    opacity: 0.4,
  },
});