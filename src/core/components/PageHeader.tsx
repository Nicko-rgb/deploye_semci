import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PageHeaderAction {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    disabled?: boolean;
    loading?: boolean;
}

export interface PageHeaderBadge {
    label: string | number;
}

/** Un ítem del breadcrumb: string simple o `{ label, to }` navegable. */
export type BreadcrumbItem = string | { label: string; to: string };

export interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    /**
     * Color hex que aplica a: icono, fondo icono, título, badge.
     * @example color="#3B82F6"
     */
    color?: string;
    /**
     * Badge(s) junto a la descripción.
     * El color se deriva automáticamente de `color`.
     */
    badge?: PageHeaderBadge | PageHeaderBadge[];
    /**
     * Activa fondo suave en el panel usando `color`.
     * El icono y badge se oscurecen levemente para seguir visibles.
     */
    accentColor?: boolean;
    /**
     * Breadcrumb navegable.
     */
    breadcrumb?: BreadcrumbItem[];
    actions?: PageHeaderAction[];
    extra?: ReactNode;
    className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const actionVariants: Record<NonNullable<PageHeaderAction['variant']>, string> = {
    primary:
        'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md shadow-blue-200 dark:shadow-none',
    secondary:
        'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600',
    danger:
        'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-md shadow-red-200 dark:shadow-none',
    ghost:
        'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300',
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PageHeader({
    title,
    description,
    icon: Icon,
    color = '#3B82F6',
    badge,
    accentColor = false,
    breadcrumb,
    actions = [],
    extra,
    className = '',
}: PageHeaderProps) {
    const navigate = useNavigate();

    // Opacidades hex: normal vs accent (icono y badge se oscurecen para no perderse)
    const iconBg   = accentColor ? `${color}35` : `${color}18`;
    const badgeBg  = accentColor ? `${color}35` : `${color}18`;
    const panelBg  = accentColor ? `${color}10` : 'transparent';
    const panelBorder = accentColor ? `${color}35` : 'transparent';

    const badges = badge ? (Array.isArray(badge) ? badge : [badge]) : [];

    const normalizeItem = (item: BreadcrumbItem): { label: string; to?: string } =>
        typeof item === 'string' ? { label: item } : item;

    return (
        <div className={`flex flex-col gap-1 ${className}`}>

            {/* ── Breadcrumb ── */}
            {breadcrumb && breadcrumb.length > 0 && (
                <nav className="flex items-center px-0.5" aria-label="breadcrumb">
                    {breadcrumb.map((raw, i) => {
                        const { label, to } = normalizeItem(raw);
                        return (
                            <span key={i} className="flex items-center">
                                {i > 0 && (
                                    <span className="text-gray-300 dark:text-gray-600 select-none">
                                        <ChevronRight size={18} className='mt-[2px]' />
                                    </span>
                                )}
                                {to ? (
                                    <button
                                        onClick={() => navigate(to)}
                                        className="text-sm font-medium hover:underline underline-offset-2 transition-opacity hover:opacity-75"
                                        style={{ color }}
                                    >
                                        {label}
                                    </button>
                                ) : (
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {label}
                                    </span>
                                )}
                            </span>
                        );
                    })}
                </nav>
            )}

            {/* ── Panel título + acciones ── */}
            <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2 ${
                    accentColor ? 'rounded-lg px-4 py-3' : ''
                }`}
                style={accentColor ? { backgroundColor: panelBg, border: `1px solid ${panelBorder}` } : undefined}
            >
                {/* Lado izquierdo */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                        {Icon && (
                            <span
                                className="flex-shrink-0 p-1.5 rounded-lg"
                                style={{ backgroundColor: iconBg }}
                            >
                                <Icon className="w-5 h-5" style={{ color }} strokeWidth={2} />
                            </span>
                        )}
                        <h1 className="text-xl font-bold leading-tight truncate" style={{ color }}>
                            {title}
                        </h1>
                    </div>

                    {(description || badges.length > 0) && (
                        <div className="flex items-center gap-2 mt-0.5 ml-0.5 flex-wrap">
                            {description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {description}
                                </p>
                            )}
                            {badges.map((b, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-bold shrink-0"
                                    style={{ backgroundColor: badgeBg, color }}
                                >
                                    {b.label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Lado derecho: extra + acciones */}
                {(extra || actions.length > 0) && (
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        {extra}
                        {actions.map((action, i) => {
                            const BtnIcon = action.icon;
                            const variant = action.variant ?? 'primary';
                            const isPrimary = variant === 'primary';
                            return (
                                <button
                                    key={i}
                                    onClick={action.onClick}
                                    disabled={action.disabled || action.loading}
                                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg
                                                text-[13px] font-medium transition-all duration-150
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                ${isPrimary ? 'text-white' : actionVariants[variant]}`}
                                    style={isPrimary ? { backgroundColor: color } : undefined}
                                >
                                    {action.loading ? (
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10"
                                                stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    ) : (
                                        BtnIcon && <BtnIcon className="w-4 h-4" strokeWidth={2} />
                                    )}
                                    {action.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
