import { useState, useEffect } from 'react';

/**
 * Hook personalizado para "debouncing".
 * Retrasa la actualización de un valor hasta que han pasado 'delay' milisegundos
 * desde la última vez que el valor de entrada cambió.
 * * @param value El valor que quieres "debouncear" (ej. el texto de un input)
 * @param delay El tiempo de espera en milisegundos (ej. 3000)
 * @returns El valor "debounceado"
 */
export default function useDebounce<T>(value: T, delay: number): T {
  // Estado para guardar el valor "debounceado"
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(
    () => {
      // Inicia un temporizador para actualizar el valor "debounceado"
      // después de que el 'delay' haya pasado
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Función de limpieza:
      // Esto se ejecuta si el 'value' cambia ANTES de que el 'delay' termine
      // (ej. el usuario sigue escribiendo). Cancela el temporizador anterior.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Solo vuelve a ejecutar el efecto si 'value' o 'delay' cambian
  );

  return debouncedValue;
}