import { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, X, FileText } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { EmployeeTurno, ShiftType } from '../types';

interface ExportTurnoProps {
    isOpen: boolean;
    onClose: () => void;
    employees: EmployeeTurno[];
    monthName: string;
    year: number;
    monthDays: { dayNumber: number; dayName: string }[];
    allowedShiftTypes: ShiftType[];
    establishmentName: string;
}

export default function ExportTurno({
    isOpen,
    onClose,
    employees,
    monthName,
    year,
    monthDays,
    allowedShiftTypes,
    establishmentName
}: ExportTurnoProps) {
    const [exporting, setExporting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Sincronizar estados para animación de entrada/salida
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            // Pequeño delay para que el navegador registre el cambio de renderizado antes de iniciar la animación
            const timer = setTimeout(() => setIsAnimating(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsAnimating(false);
            // Esperar a que termine la animación de salida (300ms) antes de desmontar
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    const exportNormal = async () => {
        setExporting(true);
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Turnos');

            // 1. Configurar Columnas
            const columns = [
                { header: '#', key: 'index', width: 3 },
                { header: 'DOCUMENTO', key: 'documentNumber', width: 8 },
                { header: 'APELLIDOS Y NOMBRES', key: 'fullName', width: 25 },
                { header: 'PROFESIÓN', key: 'profession', width: 16 },
                // Días del mes
                ...monthDays.map(d => ({ 
                    header: `${d.dayName}${d.dayNumber}`, 
                    key: `day_${d.dayNumber}`, 
                    width: 2.5
                })),
                { header: 'HRS', key: 'totalHours', width: 5 }
            ];

            worksheet.columns = columns;

            // 2. Estilo de Cabecera (Sombreado)
            const headerRow = worksheet.getRow(1);
            headerRow.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE0E0E0' } // Gris claro
                };
                cell.font = { bold: true, size: 7, color: { argb: 'FF000000' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // 3. Agregar Datos
            employees.forEach((emp, idx) => {
                const rowData: any = {
                    index: idx + 1,
                    documentNumber: emp.documentNumber,
                    fullName: emp.fullName,
                    profession: emp.profession || 'N/A',
                };

                let totalHours = 0;
                monthDays.forEach(day => {
                    const shift = emp.shifts?.find(s => s.day === day.dayNumber);
                    const type = allowedShiftTypes.find(t => t.shift_type_id === shift?.shift_type_id);
                    rowData[`day_${day.dayNumber}`] = type?.abbreviation || '';
                    if (type) totalHours += Number(type.totalHours) || 0;
                });

                rowData.totalHours = totalHours;
                const row = worksheet.addRow(rowData);

                // 4. Estilos por Celda (Colores de Turnos)
                row.eachCell((cell, colNumber) => {
                    // Fuente tamaño 7 para todas las celdas de datos
                    cell.font = { size: 7, color: { argb: 'FF000000' } };

                    // Centrar todas excepto nombre y profesión (Columnas 3 y 4)
                    if (colNumber !== 3 && colNumber !== 4) {
                        cell.alignment = { vertical: 'middle', horizontal: 'center' };
                    }

                    // Colorear turnos (columnas desde la 5 hasta penúltima)
                    if (colNumber >= 5 && colNumber < columns.length) {
                        const dayNumber = monthDays[colNumber - 5].dayNumber;
                        const shift = emp.shifts?.find(s => s.day === dayNumber);
                        const type = allowedShiftTypes.find(t => t.shift_type_id === shift?.shift_type_id);

                        if (type && type.color) {
                            // Limpiar el color hex (quitar # si existe)
                            const colorHex = type.color.replace('#', '');
                            cell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: `FF${colorHex}` }
                            };
                            // Ajustar color de texto según fondo y mantener tamaño 7
                            cell.font = { bold: true, size: 7, color: { argb: 'FF000000' } };
                        }
                    }

                    // Bordes para todas las celdas
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            // 5. Generar y Descargar
            const buffer = await workbook.xlsx.writeBuffer();
            const fileName = `Turnos_${establishmentName}_${monthName}_${year}.xlsx`.replace(/\s+/g, '_');
            saveAs(new Blob([buffer]), fileName);
            
            onClose();
        } catch (error) {
            console.error('Error al exportar excel:', error);
            alert('Error al generar el archivo Excel');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div 
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity duration-300 ${
                isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
        >
            <div 
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-300 transform ${
                    isAnimating 
                        ? 'opacity-100 scale-100 translate-y-0' 
                        : 'opacity-0 scale-95 translate-y-4'
                }`}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-green-600" />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Exportar Turnos</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Selecciona el formato de exportación para el periodo <strong>{monthName} {year}</strong>.
                    </p>

                    <div className="grid gap-3">
                        {/* Opción Normal */}
                        <button
                            onClick={exportNormal}
                            disabled={exporting}
                            className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group text-left"
                        >
                            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 group-hover:scale-110 transition-transform">
                                <FileSpreadsheet className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800 dark:text-white">Exportación Normal</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Formato estándar con nombres y turnos por día.</p>
                            </div>
                            <Download className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                        </button>

                        {/* Opción TUASUSALUD (Próximamente) */}
                        <button
                            disabled={true}
                            className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-100 dark:border-gray-700 opacity-60 cursor-not-allowed group text-left"
                        >
                            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800 dark:text-white">Formato TUASUSALUD</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Formato específico para carga en sistema externo.</p>
                            </div>
                            <span className="text-[10px] font-bold bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500">PRÓXIMAMENTE</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                        Sistema de Gestión de Turnos - SEMCI
                    </p>
                </div>
            </div>
        </div>
    );
}
