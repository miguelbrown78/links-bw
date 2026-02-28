import { colores, espaciado, tipografia } from '@/styles';
import { useTema } from '@/context/TemaContext';
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

// ─── Componente ───────────────────────────────────────────
export default function Boton({ tipo, label, onPress, icono, activo, desactivado }: BotonProps) {
  const { tema } = useTema();
  const c = tema === 'dark' ? colores.dark : colores.light;
  const b = colores.componentes.boton[tema];
  const [hover, setHover] = useState(false);

  const config = {
    primario: {
      fondo:      colores.primario,
      fondoHover: b.primarioHover,
      fondoPress: b.primarioPress,
      texto:      colores.componentes.boton.texto,
      borde:      'transparent',
    },
    secundario: {
      fondo:      colores.secundario,
      fondoHover: b.secundarioHover,
      fondoPress: b.secundarioPress,
      texto:      colores.componentes.boton.texto,
      borde:      'transparent',
    },
    fantasma: {
      fondo:      'transparent',
      fondoHover: b.fantasmaHover,
      fondoPress: b.fantasmaPress,
      texto:      colores.primario,
      borde:      colores.primario,
    },
    destructivo: {
      fondo:      colores.error,
      fondoHover: b.destructivoHover,
      fondoPress: b.destructivoPress,
      texto:      colores.componentes.boton.texto,
      borde:      'transparent',
    },
  };

  const cfg = config[tipo];
  const colorTexto = activo ? cfg.texto : colores.primario;
  const colorBorde = activo ? cfg.borde : c.borde;

  const calcularFondo = (pressed: boolean) => {
    if (pressed) return activo ? cfg.fondoPress : b.fantasmaPress;
    if (hover)   return activo ? cfg.fondoHover : b.fantasmaHover;
    return activo ? cfg.fondo : 'transparent';
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
        { borderColor: colorBorde },
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