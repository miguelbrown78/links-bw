import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

export function useDragAndDrop() {
  const router = useRouter();
  const [arrastrando, setArrastrando] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let contadorDrag = 0;

    function alArrastrarEncima(e: DragEvent) {
      e.preventDefault();
      contadorDrag++;
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
      setArrastrando(true);
    }

    function alArrastrarFuera(e: DragEvent) {
      contadorDrag--;
      if (contadorDrag === 0) {
        setArrastrando(false);
      }
    }

    function alSoltar(e: DragEvent) {
      e.preventDefault();
      contadorDrag = 0;
      setArrastrando(false);

      const items = e.dataTransfer?.items;
      if (!items) return;

      // ── Comprobar si hay archivo de imagen ─────────────
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (!file) continue;

          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            router.push({
              pathname: '/guardar-link',
              params: {
                imagenBase64: base64,
                imagenMime: file.type,
                imagenNombre: file.name,
              },
            });
          };
          reader.readAsDataURL(file);
          return;
        }
      }

      // ── Comprobar si hay URL de texto ──────────────────
      const texto = e.dataTransfer?.getData('text/plain') ?? '';
      const urlDetectada = extraerUrl(texto);
      if (urlDetectada) {
        router.push({
          pathname: '/guardar-link',
          params: { urlCompartida: urlDetectada },
        });
      }
    }

    document.addEventListener('dragover', alArrastrarEncima);
    document.addEventListener('dragleave', alArrastrarFuera);
    document.addEventListener('drop', alSoltar);

    return () => {
      document.removeEventListener('dragover', alArrastrarEncima);
      document.removeEventListener('dragleave', alArrastrarFuera);
      document.removeEventListener('drop', alSoltar);
    };
  }, []);

  return { arrastrando };
}

function extraerUrl(texto: string): string | null {
  const limpio = texto.trim();
  if (limpio.startsWith('http://') || limpio.startsWith('https://')) {
    return limpio;
  }
  return null;
}