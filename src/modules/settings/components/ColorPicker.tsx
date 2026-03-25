import * as React from "react";

interface ColorPickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    name: string;
    value: string; // Si Application.color puede ser opcional, usa: value?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ColorPicker = ({ label, name, value, onChange, ...props }: ColorPickerProps) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </label>
            )}
            <div className="flex items-center gap-3">
                <input
                    type="color"
                    name={name}
                    value={value || "#3b82f6"} // Fallback para evitar errores de undefined
                    onChange={onChange}
                    {...props}
                    className="h-10 w-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600 bg-transparent p-1"
                />
                <span className="text-sm font-mono text-gray-600 dark:text-gray-300 uppercase">
                    {value || "#3b82f6"}
                </span>
            </div>
        </div>
    );
};