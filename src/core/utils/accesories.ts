
  export const anios = () => {
    const anios = [];
    const date = new Date();
    const currentYear = Number(date.getFullYear().toString());
    
    for (let i = 0; i < 5; i++) {
      anios.push((currentYear - i).toString());
    }
    return anios;
  }

  export const meses = () => {
    return [ 
      {mes: 1, nombre: 'Enero', abrev: 'Ene'},
      {mes: 2, nombre: 'Febrero', abrev: 'Feb'},
      {mes: 3, nombre: 'Marzo', abrev: 'Mar'},
      {mes: 4, nombre: 'Abril', abrev: 'Abr'},
      {mes: 5, nombre: 'Mayo', abrev: 'May'},
      {mes: 6, nombre: 'Junio', abrev: 'Jun'},
      {mes: 7, nombre: 'Julio', abrev: 'Jul'},
      {mes: 8, nombre: 'Agosto', abrev: 'Ago'},
      {mes: 9, nombre: 'Septiembre', abrev: 'Sep'},
      {mes: 10, nombre: 'Octubre', abrev: 'Oct'},
      {mes: 11, nombre: 'Noviembre', abrev: 'Nov'},
      {mes: 12, nombre: 'Diciembre', abrev: 'Dic'}
    ];
  }

  export const roles = () => {
    return [
      'ADMINISTRADOR',
      'DIRECTOR(A) GENERAL',
      'DIRECTOR(A) DE AREA',
      'COORDINADOR(A)',
      'SUPERVISOR(A)',
      'MONITOR(A)',
      'DIGITADOR(A)',
      'ESTABLECIMIENTO',
      'OTRO'
    ];
  }

  export const documentTypes = () => {
    return [
      { id: 1, name: 'DNI', name_complete: 'Documento Nacional de Identidad' },
      { id: 2, name: 'CE', name_complete: 'Carné de Extranjería' },
      { id: 3, name: 'RUC', name_complete: 'Registro Único de Contribuyentes' },
      { id: 4, name: 'PASAPORTE', name_complete: 'Pasaporte' }
    ]
  }

  /**
   * Convierte un color hexadecimal a clases de gradiente de Tailwind
   * @param hexColor - Color en formato hexadecimal (ej: "#2196F3")
   * @returns String con clases de gradiente de Tailwind
   */
  export const hexToTailwindGradient = (hexColor: string): string => {
    // Mapa de colores hex aproximados a colores de Tailwind
    const colorMap: { [key: string]: string } = {
      // Blues
      '#2196F3': 'from-blue-500 to-blue-600',
      '#1976D2': 'from-blue-600 to-blue-700',
      '#0D47A1': 'from-blue-700 to-blue-800',
      '#42A5F5': 'from-blue-400 to-blue-500',
      
      // Greens
      '#4CAF50': 'from-green-500 to-green-600',
      '#388E3C': 'from-green-600 to-green-700',
      '#1B5E20': 'from-green-700 to-green-800',
      '#66BB6A': 'from-green-400 to-green-500',
      
      // Purples
      '#9C27B0': 'from-purple-500 to-purple-600',
      '#7B1FA2': 'from-purple-600 to-purple-700',
      '#4A148C': 'from-purple-700 to-purple-800',
      '#AB47BC': 'from-purple-400 to-purple-500',
      
      // Oranges
      '#FF9800': 'from-orange-500 to-orange-600',
      '#F57C00': 'from-orange-600 to-orange-700',
      '#E65100': 'from-orange-700 to-orange-800',
      '#FFB74D': 'from-orange-400 to-orange-500',
      
      // Reds
      '#F44336': 'from-red-500 to-red-600',
      '#D32F2F': 'from-red-600 to-red-700',
      '#B71C1C': 'from-red-700 to-red-800',
      '#EF5350': 'from-red-400 to-red-500',
      
      // Indigos
      '#3F51B5': 'from-indigo-500 to-indigo-600',
      '#303F9F': 'from-indigo-600 to-indigo-700',
      '#1A237E': 'from-indigo-700 to-indigo-800',
      
      // Teals
      '#009688': 'from-teal-500 to-teal-600',
      '#00796B': 'from-teal-600 to-teal-700',
      '#004D40': 'from-teal-700 to-teal-800',
      
      // Cyans
      '#00BCD4': 'from-cyan-500 to-cyan-600',
      '#0097A7': 'from-cyan-600 to-cyan-700',
      '#006064': 'from-cyan-700 to-cyan-800',
      
      // Pinks
      '#E91E63': 'from-pink-500 to-pink-600',
      '#C2185B': 'from-pink-600 to-pink-700',
      '#880E4F': 'from-pink-700 to-pink-800',
      
      // Yellows
      '#FFEB3B': 'from-yellow-400 to-yellow-500',
      '#FDD835': 'from-yellow-500 to-yellow-600',
      '#F9A825': 'from-yellow-600 to-yellow-700',
    };

    // Normalizar el color (uppercase y sin espacios)
    const normalizedColor = hexColor?.toUpperCase().trim();

    // Si el color existe en el mapa, retornarlo
    if (colorMap[normalizedColor]) {
      return colorMap[normalizedColor];
    }

    // Si no existe, intentar aproximar por el rango del color
    // Extraer valores RGB del hex
    const hex = normalizedColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Determinar el color dominante
    if (r > g && r > b) {
      return 'from-red-500 to-red-600';
    } else if (g > r && g > b) {
      return 'from-green-500 to-green-600';
    } else if (b > r && b > g) {
      return 'from-blue-500 to-blue-600';
    } else if (r > 200 && g > 100 && b < 100) {
      return 'from-orange-500 to-orange-600';
    } else if (r > 100 && b > 100 && g < 100) {
      return 'from-purple-500 to-purple-600';
    }

    // Por defecto, retornar azul
    return 'from-blue-500 to-blue-600';
  }

  /**
   * Convierte un color hexadecimal a una clase de color de texto de Tailwind
   * @param hexColor - Color en formato hexadecimal (ej: "#2196F3")
   * @returns String con clase de color de texto de Tailwind
   */
  export const hexToTailwindText = (hexColor: string): string => {
    const gradient = hexToTailwindGradient(hexColor);
    // Extraer el color base del gradiente (ej: "from-blue-500" -> "text-blue-600")
    const colorMatch = gradient.match(/from-(\w+)-\d+/);
    if (colorMatch && colorMatch[1]) {
      return `text-${colorMatch[1]}-600`;
    }
    return 'text-blue-600';
  }