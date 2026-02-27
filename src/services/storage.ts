import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Guarda un valor de forma persistente.
 * - Móvil: expo-secure-store (cifrado)
 * - Web: localStorage
 */
export async function guardar(clave: string, valor: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(clave, valor);
    return;
  }
  await SecureStore.setItemAsync(clave, valor);
}

/**
 * Obtiene un valor guardado. Devuelve null si no existe.
 * - Móvil: expo-secure-store
 * - Web: localStorage
 */
export async function obtener(clave: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(clave);
  }
  return await SecureStore.getItemAsync(clave);
}

/**
 * Elimina un valor guardado.
 * - Móvil: expo-secure-store
 * - Web: localStorage
 */
export async function eliminar(clave: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(clave);
    return;
  }
  await SecureStore.deleteItemAsync(clave);
}