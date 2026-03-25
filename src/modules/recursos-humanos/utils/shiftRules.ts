
export interface ShiftRule {
    allowedAbbreviations: string[];
    requiresNombrado?: string[];
    allowSundayShifts?: boolean;
}

export const SHIFT_SEQUENCE_RULES: Record<string, { forbiddenNext: string[]; message: string }> = {
    'GD': {
        forbiddenNext: ['GD', 'M', 'MT'],
        message: 'Después de una Guardia Diurna (GD), no se puede realizar otra GD, ni turno Mañana (M) o Mañana-Tarde (MT). Debe tener un turno Tarde (T) o descanso (L).'
    }
};

export const SHIFT_CATEGORY_RULES: Record<string, ShiftRule> = {
    'I-1': {
        allowedAbbreviations: ['M', 'L'],
        requiresNombrado: ['MVD', 'TVD']
    },
    'I-2': {
        allowedAbbreviations: ['M', 'T', 'MT', 'GD', 'L'],
        requiresNombrado: ['MVD', 'TVD']
    },
    'I-3': {
        allowedAbbreviations: ['M', 'T', 'MT', 'GD', 'GN', 'GC', 'L'],
        requiresNombrado: ['MVD', 'TVD'],
        // allowSundayShifts: true,
    },
    'I-4': {
        allowedAbbreviations: ['M', 'T', 'MT', 'GD', 'GN', 'GC', 'L'],
        requiresNombrado: ['MVD', 'TVD'],
        allowSundayShifts: true
    }
};
