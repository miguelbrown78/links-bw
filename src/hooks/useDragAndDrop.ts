import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

export function useDragAndDrop() {
  const router = useRouter();
  const [arrastrando, setArrastrando] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Contador para evitar falsos dragleave al pasar sobre elementos hijos
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