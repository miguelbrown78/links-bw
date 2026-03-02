import { useTema } from '@/context/TemaContext';
import { useAuth } from '@/context/AuthContext';
import { colores, espaciado, tipografia } from '@/styles';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export default function MenuApp() {
  const { tema, cambiarTema } = useTema();
  const { logout } = useAuth();
  const c = tema === 'dark' ? colores.dark : colores.light;
  const styles = crearEstilos(c);
  const [visible, setVisible] = useState(false);

  function alCerrar() {
    setVisible(false);
  }

  return (
    <View>
      {/* ── Botón 9 puntos ── */}
      <Pressable onPress={() => setVisible(!visible)} style={styles.botonMenu}>
        <FontAwesome name="th" size={20} color={colores.primario} />
      </Pressable>

      {/* ── Dropdown ── */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={alCerrar}
      >
        <Pressable style={styles.fondo} onPress={alCerrar}>
          <View style={styles.dropdown}>

            {/* ── Tema ── */}
            <Pressable style={styles.item} onPress={() => { cambiarTema(); alCerrar(); }}>
              <FontAwesome
                name={tema === 'dark' ? 'sun-o' : 'moon-o'}
                size={16}
                color={c.texto}
              />
              <Text style={styles.itemTexto}>
                {tema === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              </Text>
            </Pressable>

            <View style={styles.separador} />

            {/* ── Logout ── */}
            <Pressable style={styles.item} onPress={() => { logout(); alCerrar(); }}>
              <FontAwesome name="sign-out" size={16} color={colores.error} />
              <Text style={[styles.itemTexto, { color: colores.error }]}>
                Cerrar sesión
              </Text>
            </Pressable>

          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function crearEstilos(c: typeof colores.dark) {
  return StyleSheet.create({
    botonMenu: {
      padding: 4,
    },
    fondo: {
      flex: 1,
    },
    dropdown: {
      position: 'absolute',
      top: 52,
      right: espaciado.lg,
      backgroundColor: c.card,
      borderRadius: espaciado.bordes.md,
      borderWidth: 1,
      borderColor: c.borde,
      minWidth: 180,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: espaciado.md,
      paddingHorizontal: espaciado.lg,
      paddingVertical: espaciado.md,
    },
    itemTexto: {
      fontFamily: tipografia.fuentes.cuerpo,
      fontSize: tipografia.sizes.md,
      color: c.texto,
    },
    separador: {
      height: 1,
      backgroundColor: c.borde,
      marginHorizontal: espaciado.md,
    },
  });
}