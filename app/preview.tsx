import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { tipografia, espaciado } from '@/styles';
import colores from '@/styles/colors';
import { useTema } from '@/context/TemaContext';

export default function Preview() {
  const { tema } = useTema();
  const c = tema === 'dark' ? colores.dark : colores.light;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.fondo }}
      contentContainerStyle={{ padding: espaciado.lg }}
    >

      {/* FUENTES */}
      <Text style={[styles.seccion, { color: colores.primario }]}>Fuentes</Text>

      <Text style={[styles.grupo, { color: c.muted }]}>Plus Jakarta Sans</Text>
      <Text style={{ fontFamily: tipografia.fuentes.titulo, fontSize: tipografia.sizes.xl, color: c.texto, marginBottom: espaciado.sm }}>
        Bold — Links Browny
      </Text>
      <Text style={{ fontFamily: tipografia.fuentes.subtitulo, fontSize: tipografia.sizes.lg, color: c.texto, marginBottom: espaciado.lg }}>
        SemiBold — Links Browny
      </Text>

      <Text style={[styles.grupo, { color: c.muted }]}>Inter</Text>
      <Text style={{ fontFamily: tipografia.fuentes.ui, fontSize: tipografia.sizes.md, color: c.texto, marginBottom: espaciado.sm }}>
        SemiBold — El mejor gestor de links
      </Text>
      <Text style={{ fontFamily: tipografia.fuentes.medio, fontSize: tipografia.sizes.md, color: c.texto, marginBottom: espaciado.sm }}>
        Medium — El mejor gestor de links
      </Text>
      <Text style={{ fontFamily: tipografia.fuentes.cuerpo, fontSize: tipografia.sizes.md, color: c.texto, marginBottom: espaciado.lg }}>
        Regular — El mejor gestor de links
      </Text>

      <Text style={[styles.grupo, { color: c.muted }]}>JetBrains Mono</Text>
      <Text style={{ fontFamily: tipografia.fuentes.mono, fontSize: tipografia.sizes.sm, color: colores.primario, marginBottom: espaciado.lg }}>
        https://www.google.com/search?q=links
      </Text>

      {/* COLORES */}
      <Text style={[styles.seccion, { color: colores.primario }]}>Colores</Text>

      <Text style={[styles.grupo, { color: c.muted }]}>Globales</Text>
      <View style={styles.fila}>
        <Muestra color={colores.primario}   etiqueta="primario"   muted={c.muted} />
        <Muestra color={colores.secundario} etiqueta="secundario" muted={c.muted} />
        <Muestra color={colores.error}      etiqueta="error"      muted={c.muted} />
        <Muestra color={colores.success}    etiqueta="success"    muted={c.muted} />
      </View>

      <Text style={[styles.grupo, { color: c.muted }]}>Dark</Text>
      <View style={styles.fila}>
        <Muestra color={colores.dark.fondo}  etiqueta="fondo"  muted={c.muted} />
        <Muestra color={colores.dark.card}   etiqueta="card"   muted={c.muted} />
        <Muestra color={colores.dark.texto}  etiqueta="texto"  muted={c.muted} />
        <Muestra color={colores.dark.muted}  etiqueta="muted"  muted={c.muted} />
        <Muestra color={colores.dark.borde}  etiqueta="borde"  muted={c.muted} />
      </View>

      <Text style={[styles.grupo, { color: c.muted }]}>Light</Text>
      <View style={styles.fila}>
        <Muestra color={colores.light.fondo}  etiqueta="fondo"  muted={c.muted} />
        <Muestra color={colores.light.card}   etiqueta="card"   muted={c.muted} />
        <Muestra color={colores.light.texto}  etiqueta="texto"  muted={c.muted} />
        <Muestra color={colores.light.muted}  etiqueta="muted"  muted={c.muted} />
        <Muestra color={colores.light.borde}  etiqueta="borde"  muted={c.muted} />
      </View>

      {/* TIPOGRAFIA */}
      <Text style={[styles.seccion, { color: colores.primario }]}>Tipografia</Text>
      {Object.entries(tipografia.sizes).map(([key, value]) => (
        <Text key={key} style={{ fontFamily: tipografia.fuentes.cuerpo, fontSize: value, color: c.texto, marginBottom: espaciado.sm }}>
          {key} - {value}px - Lorem ipsum dolor sit amet
        </Text>
      ))}

      {/* ESPACIADO */}
      <Text style={[styles.seccion, { color: colores.primario }]}>Espaciado</Text>
      {Object.entries(espaciado).map(([key, value]) => {
        if (typeof value !== 'number') return null;
        return (
          <View key={key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: espaciado.sm }}>
            <View style={{ width: value, height: value, backgroundColor: colores.primario, borderRadius: 2 }} />
            <Text style={{ fontFamily: tipografia.fuentes.mono, color: c.muted, marginLeft: espaciado.sm, fontSize: tipografia.sizes.sm }}>
              {key} - {value}px
            </Text>
          </View>
        );
      })}

      {/* BORDES */}
      <Text style={[styles.seccion, { color: colores.primario }]}>Bordes</Text>
      <View style={styles.fila}>
        {Object.entries(espaciado.bordes).map(([key, value]) => (
          <View key={key} style={{ alignItems: 'center', marginRight: espaciado.lg }}>
            <View style={{
              width: 60, height: 60,
              backgroundColor: c.card,
              borderRadius: value,
              borderWidth: 1,
              borderColor: colores.primario,
            }} />
            <Text style={{ fontFamily: tipografia.fuentes.mono, color: c.muted, fontSize: tipografia.sizes.xs, marginTop: espaciado.xs }}>
              {key} - {value}
            </Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

function Muestra({ color, etiqueta, muted }: { color: string; etiqueta: string; muted: string }) {
  return (
    <View style={{ alignItems: 'center', marginRight: espaciado.md, marginBottom: espaciado.md }}>
      <View style={{ width: 48, height: 48, backgroundColor: color, borderRadius: espaciado.bordes.md }} />
      <Text style={{ fontFamily: tipografia.fuentes.mono, color: muted, fontSize: tipografia.sizes.xs, marginTop: espaciado.xs }}>
        {etiqueta}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  seccion: {
    fontFamily: tipografia.fuentes.titulo,
    fontSize: tipografia.sizes.xl,
    marginTop: espaciado.xl,
    marginBottom: espaciado.md,
  },
  grupo: {
    fontFamily: tipografia.fuentes.ui,
    fontSize: tipografia.sizes.sm,
    marginBottom: espaciado.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: espaciado.lg,
  },
});