# Expo Template Browny

Template base para aplicaciones React Native con Expo en managed workflow.

---

## Stack

| Tecnología | Versión |
|---|---|
| React | 19.1.0 |
| React Native | 0.81.5 |
| Expo | ~54.0.33 |
| Expo Router | ~6.0.23 |
| TypeScript | ~5.9.2 |
| React Navigation | 7 |

---

## Requisitos previos

- Node.js >= 18
- pnpm instalado globalmente
- Expo CLI
- EAS CLI
- Android Studio (para emulador) o dispositivo físico

```bash
npm install -g pnpm
npm install -g eas-cli
```

---

## Configuración pnpm centralizado (recomendado)

Para centralizar los node_modules y ahorrar espacio en disco:

```bash
pnpm config set store-dir C:\Users\TU_USUARIO\app_mobile\pnpm-store
```

---

## Cómo usar este template

```bash
pnpm create expo-app@latest mi-app --template https://github.com/miguelbrown78/expo-template-browny
```

---

## Instalación manual

```bash
git clone https://github.com/miguelbrown78/expo-template-browny.git mi-app
cd mi-app
pnpm install
```

---

## Comandos

```bash
# Desarrollo
pnpm expo start
pnpm expo start --android

# Build preview APK
eas build --platform android --profile preview

# Build producción
eas build --platform android --profile production
```

---

## Dependencias incluidas

- `@react-navigation/bottom-tabs` — Navegación por pestañas
- `@react-navigation/elements` — Elementos de navegación
- `expo-haptics` — Feedback háptico
- `expo-image` — Componente de imagen optimizado
- `expo-symbols` — Iconos SF Symbols
- `expo-system-ui` — Control de UI del sistema
- `expo-secure-store` — Almacenamiento seguro
- `expo-share-intent` — Recibir contenido compartido desde otras apps
- `react-native-gesture-handler` — Gestos táctiles

---

## Reglas del proyecto

- Siempre `pnpm expo install` para dependencias Expo/React Native
- Nunca `pnpm add` con librerías del ecosistema
- Nunca `expo run:android` ni `expo run:ios`
- Managed workflow — sin carpetas nativas android/ios

---

## Estructura

```
app/          # Pantallas y navegación (Expo Router)
assets/       # Imágenes, fuentes
components/   # Componentes reutilizables
constants/    # Colores y constantes
hooks/        # Custom hooks
```
