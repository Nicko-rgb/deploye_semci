import * as React from 'react';

interface AvatarProps {
  src?: string;
  firstName?: string;
  className?: string;
  backgroundColor?: string; // formato: #ffffff
  textColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  firstName = '',
  className = 'w-32 h-32',
  backgroundColor = '#0d9488', // teal-600 por defecto
  textColor = 'text-white'
}) => {
  const getInitial = () => {
    return firstName.charAt(0).toUpperCase();
  };

  // Si hay imagen, mostrarla
  if (src && src.trim() !== '') {
    return (
      <img
        src={src}
        alt="Avatar"
        className={`${className} rounded-full object-cover border-4 border-gray-200 dark:border-gray-600`}
      />
    );
  }

  // Si no hay imagen, mostrar la inicial con color de fondo
  return (
    <div
      className={`${className} rounded-full border-4 border-gray-200 dark:border-gray-600 ${textColor} flex items-center justify-center font-bold text-lg sm:text-2xl`}
      style={{ backgroundColor }}
    >
      {getInitial()}
    </div>
  );
};
