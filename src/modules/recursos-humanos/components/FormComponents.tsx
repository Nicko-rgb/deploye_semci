import React, { useState, useRef, useEffect, useMemo } from 'react';

// ─── Paleta de colores ────────────────────────────────────────────────────────
// Clases preconstruidas por color — Tailwind no admite clases dinámicas en runtime.

export type FormColor = 'blue' | 'purple' | 'green' | 'orange' | 'teal';

/** Clases Tailwind por tema de color para los componentes de formulario */
const colorTheme: Record<FormColor, {
    focusBorder:    string;  // border al enfocar el input
    labelActive:    string;  // color del label flotante cuando está activo
    labelActive2:   string;  // variante2 — usa text-600
    icon:           string;  // color del icono al enfocar
    optionHover:    string;  // hover en opciones del Select
    optionSelected: string;  // opción seleccionada en el Select
}> = {
    blue: {
        focusBorder:    'focus:border-blue-500',
        labelActive:    'text-blue-500',
        labelActive2:   'text-blue-600',
        icon:           'group-focus-within:text-blue-500',
        optionHover:    'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400',
        optionSelected: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    purple: {
        focusBorder:    'focus:border-purple-500',
        labelActive:    'text-purple-500',
        labelActive2:   'text-purple-600',
        icon:           'group-focus-within:text-purple-500',
        optionHover:    'hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400',
        optionSelected: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    },
    green: {
        focusBorder:    'focus:border-green-500',
        labelActive:    'text-green-500',
        labelActive2:   'text-green-600',
        icon:           'group-focus-within:text-green-500',
        optionHover:    'hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400',
        optionSelected: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    },
    orange: {
        focusBorder:    'focus:border-orange-500',
        labelActive:    'text-orange-500',
        labelActive2:   'text-orange-600',
        icon:           'group-focus-within:text-orange-500',
        optionHover:    'hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400',
        optionSelected: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    },
    teal: {
        focusBorder:    'focus:border-teal-500',
        labelActive:    'text-teal-500',
        labelActive2:   'text-teal-600',
        icon:           'group-focus-within:text-teal-500',
        optionHover:    'hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 dark:hover:text-teal-400',
        optionSelected: 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    },
};

// ─── InputText ────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    Icon?: any;
    error?: string;
    variant?: 'variant1' | 'variant2';
    placeholder?: string;
    /** Color del label y borde al recibir foco. Por defecto: 'blue' */
    color?: FormColor;
}

/**
 * InputText con Label Flotante.
 * Implementa un diseño moderno donde el label se mueve hacia arriba al enfocar o tener contenido.
 * Acepta `color` para cambiar el tema de acento (label + borde al foco).
 */
export const InputText: React.FC<InputProps> = ({
    label,
    name,
    Icon,
    error,
    className = '',
    value,
    type,
    variant = 'variant1',
    placeholder,
    color = 'blue',
    onFocus,
    onBlur,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const theme = colorTheme[color];
    const isDate = type === 'date';
    const isFloating = isDate || isFocused || (value !== '' && value != null);

    // Clases base
    const baseInput = "peer w-full text-[14px] font-medium text-gray-900 dark:text-white outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    const baseLabel = "absolute font-medium transition-all duration-200 pointer-events-none";

    // Clases específicas por variante
    const variantClasses = {
        variant1: {
            input: `
                px-4 pt-4 pb-1
                bg-gray-50 dark:bg-gray-700/50
                border-b-2 border-gray-200 dark:border-gray-600
                focus:bg-white dark:focus:bg-gray-700
                ${value ? 'bg-white dark:bg-gray-700' : ''}
                ${error ? 'border-red-500' : theme.focusBorder}
            `,
            label: `
                left-4
                ${isFloating ? `-top-1 text-[11px] ${theme.labelActive}` : 'top-3 text-[13px] text-gray-500 dark:text-gray-400'}
                peer-focus:-top-1 peer-focus:text-[11px] peer-focus:${theme.labelActive}
            `
        },
        variant2: {
            input: `
                px-4 py-2 rounded-md border-2
                bg-white dark:bg-gray-800
                border-gray-200 dark:border-gray-600
                ${theme.focusBorder}
                focus:ring-0
                ${error ? 'border-red-500 focus:border-red-500' : ''}
            `,
            label: `
                left-3 px-1
                ${isFloating
                    ? `-top-2 text-[11px] ${theme.labelActive2} bg-white dark:bg-gray-800 font-medium`
                    : 'top-2.5 text-[13px] text-gray-500 dark:text-gray-400 font-medium'}
                peer-focus:-top-2.5 peer-focus:text-[11px] peer-focus:${theme.labelActive2} peer-focus:bg-white peer-focus:dark:bg-gray-800 peer-focus:font-bold
            `
        }
    };

    const currentVariant = variantClasses[variant];

    return (
        <div className="w-full">
            <div className="relative group">
                <input
                    {...props}
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    placeholder={isFocused && placeholder ? placeholder : ' '}
                    onFocus={e => { setIsFocused(true); onFocus?.(e); }}
                    onBlur={e => { setIsFocused(false); onBlur?.(e); }}
                    className={`
                        ${baseInput}
                        ${currentVariant.input}
                        ${className}
                    `}
                />
                <label
                    htmlFor={name}
                    className={`
                        ${baseLabel}
                        ${currentVariant.label}
                        ${error ? 'text-red-500 peer-focus:text-red-500' : ''}
                    `}
                >
                    {label}
                </label>
                {Icon && (
                    <Icon className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${theme.icon} transition-colors`} />
                )}
            </div>
            {error && <p className="mt-1 text-[11px] text-red-500 font-medium px-1">{error}</p>}
        </div>
    );
};

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string; label: string }[];
    Icon?: any;
    error?: string;
    variant?: 'native' | 'custom';
    /** Color del label, borde y opciones al recibir foco. Por defecto: 'blue' */
    color?: FormColor;
}

/**
 * Select con Búsqueda y Dropdown Personalizado.
 * Acepta `color` para cambiar el tema de acento (label + borde + opciones activas).
 */
export const Select: React.FC<SelectProps> = ({
    label,
    name,
    options,
    Icon,
    error,
    className = '',
    value,
    onChange,
    disabled,
    variant = 'custom',
    color = 'blue',
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const theme = colorTheme[color];

    // Encontrar la etiqueta de la opción seleccionada actualmente
    const selectedOption = useMemo(() =>
        options.find(opt => String(opt.value).trim() === String(value).trim()),
    [options, value]);

    // Filtrar opciones basadas en el término de búsqueda
    const filteredOptions = useMemo(() => {
        return options.filter(opt =>
            opt.label && opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    // Cerrar el dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        if (onChange) {
            const event = {
                target: { name, value: optionValue }
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange(event);
        }
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (!isOpen) setIsOpen(true);
    };

    const isFloating = isOpen || searchTerm || (selectedOption && selectedOption.label !== '');
    const labelFloatClass = isFloating
        ? `-top-1 text-[11px] ${theme.labelActive}`
        : 'top-3 text-[13px] text-gray-500 dark:text-gray-400';

    return (
        <div className="w-full" ref={containerRef}>
            <div className="relative group">
                {variant === 'custom' ? (
                    <>
                        <input
                            type="text"
                            id={name}
                            name={name}
                            value={isOpen ? searchTerm : (selectedOption?.label || '')}
                            onChange={handleInputChange}
                            onFocus={() => setIsOpen(true)}
                            disabled={disabled}
                            placeholder=" "
                            autoComplete="off"
                            className={`
                                peer w-full px-4 pt-4 pb-1 text-[14px] font-medium
                                bg-gray-50 dark:bg-gray-700/50
                                border-b-2 border-gray-200 dark:border-gray-600
                                text-gray-900 dark:text-white
                                ${value || isOpen ? 'bg-white dark:bg-gray-700' : ''}
                                outline-none transition-all duration-200
                                ${theme.focusBorder} focus:bg-white dark:focus:bg-gray-700
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${error ? 'border-red-500' : ''}
                                ${className}
                            `}
                            {...(props as any)}
                        />

                        <label
                            htmlFor={name}
                            className={`
                                absolute left-4 font-medium
                                transition-all duration-200 pointer-events-none
                                ${labelFloatClass}
                                ${error ? 'text-red-500' : ''}
                            `}
                        >
                            {label}
                        </label>

                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            {Icon ? (
                                <Icon className={`w-4 h-4 text-gray-400 ${theme.icon} transition-colors`} />
                            ) : (
                                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            )}
                        </div>

                        {/* Dropdown Personalizado */}
                        {isOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                {filteredOptions.length > 0 ? (
                                    <ul className="py-1">
                                        {filteredOptions.map((opt) => (
                                            <li
                                                key={opt.value}
                                                onClick={() => handleSelect(opt.value)}
                                                className={`
                                                    px-4 py-2 text-[14px] cursor-pointer transition-colors
                                                    ${theme.optionHover}
                                                    ${value === opt.value ? `${theme.optionSelected} font-bold` : 'text-gray-700 dark:text-gray-300'}
                                                `}
                                            >
                                                {opt.label}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="px-4 py-3 text-[13px] text-gray-500 dark:text-gray-400 italic">
                                        No se encontraron resultados
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <select
                            {...(props as any)}
                            id={name}
                            name={name}
                            value={value}
                            onChange={onChange}
                            disabled={disabled}
                            className={`
                                peer w-full px-4 py-2 text-[14px] font-medium rounded-md
                                bg-white dark:bg-gray-800
                                border-2 border-gray-200 dark:border-gray-600
                                text-gray-900 dark:text-white
                                outline-none transition-all duration-200
                                ${theme.focusBorder} focus:ring-0
                                appearance-none cursor-pointer
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${error ? 'border-red-500 focus:border-red-500' : ''}
                                ${className}
                            `}
                        >
                            <option value="" hidden disabled></option>
                            {options.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-800">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            {Icon ? (
                                <Icon className={`w-4 h-4 text-gray-400 ${theme.icon} transition-colors`} />
                            ) : (
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            )}
                        </div>
                    </>
                )}
            </div>
            {error && <p className="mt-1 text-[11px] text-red-500 font-medium px-1">{error}</p>}
        </div>
    );
};

// ─── Checkbox ─────────────────────────────────────────────────────────────────

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

/** Checkbox Moderno */
export const Checkbox: React.FC<CheckboxProps> = ({
    label,
    name,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className="flex flex-col">
            <label className="flex items-center gap-3 cursor-pointer group py-2">
                <div className="relative flex items-center">
                    <input
                        {...props}
                        type="checkbox"
                        id={name}
                        name={name}
                        className={`
                            peer appearance-none w-5 h-5 rounded-md border-2
                            border-gray-300 dark:border-gray-600
                            checked:bg-blue-600 checked:border-blue-600
                            focus:ring-2 focus:ring-blue-500/20 outline-none
                            transition-all duration-200 cursor-pointer
                            ${error ? 'border-red-500' : ''}
                            ${className}
                        `}
                    />
                    <svg
                        className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="4"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <span className="text-[14px] font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">
                    {label}
                </span>
            </label>
            {error && <p className="text-[11px] text-red-500 font-medium px-1">{error}</p>}
        </div>
    );
};
