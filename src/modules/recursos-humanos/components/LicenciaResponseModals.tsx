import React, { useState } from 'react';
import { X, FileUp, Save, MessageSquare } from 'lucide-react';

interface ResponseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (comments: string, file?: File) => void;
    title: string;
    description: string;
    actionLabel: string;
    isSubmitting?: boolean;
    color: 'red' | 'yellow' | 'blue';
}

export const ResponseModal: React.FC<ResponseModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    description,
    actionLabel,
    isSubmitting = false,
    color
}) => {
    const [comments, setComments] = useState('');
    const [file, setFile] = useState<File | null>(null);

    if (!isOpen) return null;

    const colorClasses = {
        red: 'bg-red-100 text-red-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        blue: 'bg-blue-100 text-blue-600'
    };

    const buttonClasses = {
        red: 'bg-red-600 hover:bg-red-700',
        yellow: 'bg-yellow-600 hover:bg-yellow-700',
        blue: 'bg-blue-600 hover:bg-blue-700'
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                            <p className="text-xs text-gray-500">{description}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Motivo / Sustento</label>
                        <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-28 text-sm"
                            placeholder="Escribe el motivo aquí..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Documento Adjunto (Opcional)</label>
                        <div className="relative group">
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                accept=".pdf,.doc,.docx,.jpg,.png"
                            />
                            <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center group-hover:border-blue-400 transition-colors">
                                <FileUp className="w-6 h-6 text-gray-400 group-hover:text-blue-500 mb-1" />
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    {file ? file.name : 'Subir documento de respuesta'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all">
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSubmit(comments, file || undefined)}
                        disabled={isSubmitting || !comments.trim()}
                        className={`flex items-center gap-2 px-8 py-2 rounded-xl text-white text-sm font-bold shadow-lg transition-all disabled:opacity-50 ${buttonClasses[color]}`}
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {actionLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
