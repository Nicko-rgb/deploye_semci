import { useEffect } from 'react';

// Declaración global para TypeScript
declare global {
  interface Window {
    Highcharts: typeof import('highcharts');
  }
}

export const HighchartsExportLoader = () => {
  useEffect(() => {
    const loadHighchartsScripts = () => {
      // Función para cargar un script de forma secuencial
      const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          // Verificar si el script ya está cargado
          if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
          }

          const script = document.createElement('script');
          script.src = src;
          script.async = false; // Cargar de forma secuencial
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Failed to load script ${src}`));
          document.head.appendChild(script);
        });
      };

      // Cargar scripts de forma secuencial
      const loadModules = async () => {
        try {
          console.log('Cargando módulos de Highcharts...');
          
          // Cargar módulos en orden
          await loadScript('https://code.highcharts.com/modules/exporting.js');
          console.log('Módulo exporting cargado');
          
          await loadScript('https://code.highcharts.com/modules/export-data.js');
          console.log('Módulo export-data cargado');
          
          await loadScript('https://code.highcharts.com/modules/accessibility.js');
          console.log('Módulo accessibility cargado');

          // Esperar un poco para que los módulos se inicialicen
          setTimeout(() => {
            if (window.Highcharts) {
              console.log('Configurando opciones globales de Highcharts...');
              window.Highcharts.setOptions({
                exporting: {
                  enabled: true,
                  fallbackToExportServer: false,
                  buttons: {
                    contextButton: {
                      enabled: true,
                      menuItems: [
                        'viewFullscreen',
                        'printChart',
                        'separator',
                        'downloadPNG',
                        'downloadJPEG',
                        'downloadPDF',
                        'downloadSVG',
                        'separator',
                        'downloadCSV',
                        'downloadXLS',
                        'separator',
                        'viewData'
                      ]
                    }
                  }
                }
              });
              console.log('Configuración de exportación aplicada exitosamente');
            } else {
              console.error('window.Highcharts no está disponible');
            }
          }, 500);
        } catch (error) {
          console.error('Error cargando módulos de Highcharts:', error);
        }
      };

      loadModules();
    };

    // Solo cargar si no están ya cargados
    if (!document.querySelector('script[src*="exporting.js"]')) {
      loadHighchartsScripts();
    } else {
      console.log('Módulos de Highcharts ya están cargados');
    }
  }, []);

  return null;
};
