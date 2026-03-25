import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = ({ label, error, className = "", ...props }: InputProps) => {
    return (
        <div className="w-full">
            {label && (
                <label 
                    htmlFor={props.id || props.name} 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                    {label}
                    {/* Si la prop 'required' es true, mostramos el asterisco rojo */}
                    {props.required && (
                        <span className="text-red-500 ml-1 font-bold">*</span>
                    )}
                </label>
            )}
            <input
                {...props}
                className={`
                    mt-1 block w-full px-3 py-2 
                    bg-white dark:bg-gray-700 
                    border border-gray-300 dark:border-gray-600 
                    rounded-md shadow-sm dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    transition-all duration-200
                    ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300"}
                    ${className}
                `}
            />
            {error && (
                <p className="mt-1 text-xs text-red-500">{error}</p>
            )}
        </div>
    );
};