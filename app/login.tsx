import { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet,
    ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Image,
} from 'react-native';
import { colores, tipografia, espaciado } from '@/styles';
import { useTema } from '@/context/TemaContext';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
    const { tema } = useTema();
    const c = tema === 'dark' ? colores.dark : colores.light;
    const styles = crearEstilos(c);
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLogin() {
        if (!email || !password) {
            setError('Introduce email y contraseña.');
            return;
        }
        try {
            setCargando(true);
            setError(null);
            await login(email, password);
            // La redirección la gestiona _layout.tsx al detectar el cambio de usuario
        } catch (e: any) {
            setError(e.message || 'Error al iniciar sesión.');
        } finally {
            setCargando(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.inner}>

                <Image
                    source={require('../assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.subtitulo}>Inicia sesión para continuar</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={c.muted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    placeholderTextColor={c.muted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {error && <Text style={styles.error}>{error}</Text>}

                <Pressable
                    style={[styles.boton, cargando && styles.botonDesactivado]}
                    onPress={handleLogin}
                    disabled={cargando}
                >
                    {cargando
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.botonTexto}>Entrar</Text>
                    }
                </Pressable>

            </View>
        </KeyboardAvoidingView>
    );
}

function crearEstilos(c: typeof colores.dark) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: c.fondo,
        },
        inner: {
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: espaciado.xl,
            gap: espaciado.md,
            width: '100%',
            maxWidth: 420,
            alignSelf: 'center',
        },
        titulo: {
            fontFamily: tipografia.fuentes.titulo,
            fontSize: tipografia.sizes.xxl,
            color: colores.primario,
            textAlign: 'center',
            marginBottom: espaciado.sm,
        },
        subtitulo: {
            fontFamily: tipografia.fuentes.cuerpo,
            fontSize: tipografia.sizes.md,
            color: c.muted,
            textAlign: 'center',
            marginBottom: espaciado.lg,
        },
        input: {
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.borde,
            borderRadius: espaciado.bordes.md,
            paddingHorizontal: espaciado.lg,
            paddingVertical: espaciado.md,
            fontFamily: tipografia.fuentes.cuerpo,
            fontSize: tipografia.sizes.md,
            color: c.texto,
        },
        error: {
            fontFamily: tipografia.fuentes.cuerpo,
            fontSize: tipografia.sizes.sm,
            color: colores.error,
            textAlign: 'center',
        },
        boton: {
            backgroundColor: colores.primario,
            paddingVertical: espaciado.md,
            borderRadius: espaciado.bordes.md,
            alignItems: 'center',
            marginTop: espaciado.sm,
        },
        botonDesactivado: {
            opacity: 0.6,
        },
        botonTexto: {
            fontFamily: tipografia.fuentes.ui,
            fontSize: tipografia.sizes.md,
            color: '#fff',
        },
        logo: {
            width: 200,
            height: 60,
            alignSelf: 'center',
            marginBottom: espaciado.sm,
        },
    });
}