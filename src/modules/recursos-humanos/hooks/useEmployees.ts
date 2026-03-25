import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { employeeService } from '../services/employeeService';
import { commonService } from '../services/commonService';
import hierarchyService from '../../../core/services/hierarchyService';
import type { EmployeeSummary, EmployeeDetail, EstablishmentItem } from '../types';
import { useAppBreadcrumb } from '../../../core/hooks/useAppBreadcrumb';
import { useAuth } from '../../../core';
import { useAccessLevel } from '../../../core/hooks/useAccessLevel';

export const useEmployees = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const breadcrumb = useAppBreadcrumb(id ? ['Empleados', 'Detalle'] : ['Empleados']);
    const { codigoDisa, codigoRed, codigoMicrored, codigoUnico } = useAccessLevel();

    // List State
    const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState(() => ({
        grupoCondicion: '',
        laborRegimeId: '',
        occupationalGroup: '',
        status: 'activo',
        codigoDisa:     codigoDisa     ?? 34,
        codigoRed:      codigoRed      ?? 'TODOS',
        nomRed:         'TODOS',
        codigoMicrored: codigoMicrored ?? 'TODOS',
        nomMicrored:    codigoMicrored ?? 'TODOS',
        codigoUnico:    codigoUnico    ?? 'TODOS',
    }));

    // Page Data State
    const [hierarchy, setHierarchy] = useState<any[]>([]);
    const [exporting, setExporting] = useState(false);
    const [laborConditions, setLaborConditions] = useState<any[]>([]);
    const [laborRegimes, setLaborRegimes] = useState<any[]>([]);

    // Sincronizar filtros cuando la jerarquía carga y el usuario tiene nivel microred/establecimiento
    useEffect(() => {
        if (!hierarchy.length || !codigoMicrored) return;

        // Resolver el nombre legible de la microred para el select UI
        const m = hierarchy.find((m: any) => m.codigo_microred === codigoMicrored);
        if (!m) return;

        setFilters(prev => ({
            ...prev,
            nomMicrored:   m.nom_microred,
            codigoMicrored,
            // Si hay establecimiento asignado, verificar que pertenece a esta microred
            codigoUnico: codigoUnico
                ? (m.establecimientos?.some((e: any) => e.codigoUnico === codigoUnico) ? codigoUnico : 'TODOS')
                : 'TODOS',
        }));
    }, [hierarchy, codigoMicrored, codigoUnico]);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    // Detail State
    const [empleado, setEmpleado] = useState<EmployeeDetail | null>(null);
    const [establishments, setEstablishments] = useState<EstablishmentItem[]>([]);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Load Initial Page Data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [hierarchyData, conditionsRes, regimesRes] = await Promise.all([
                    hierarchyService.getHierarchy(codigoRed ?? '01'),
                    commonService.getConditionLaboral(),
                    commonService.getLaboralRegimes()
                ]);

                setHierarchy(hierarchyData);

                if (conditionsRes.success) {
                    setLaborConditions(conditionsRes.data);
                }
                if (regimesRes.success) {
                    setLaborRegimes(regimesRes.data);
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
            }
        };
        loadInitialData();
    }, []);

    // Options for Selects
    const microredOptions = useMemo(() => {
        if (!hierarchy.length) return [];

        // El value es el código de microred (para filtrar al backend), el label es el nombre legible
        const options = hierarchy.map((m: any) => ({
            value: m.codigo_microred || m.nom_microred, // código primero; si falta usar nombre
            label: m.nom_microred
        }));

        options.unshift({ value: 'TODOS', label: 'TODOS' });
        options.unshift({ value: 'SOLO RED', label: 'SOLO RED (SEDE ADM.)' });
        return options;
    }, [hierarchy]);

    const establishmentOptions = useMemo(() => {
        if (filters.codigoMicrored === 'SOLO RED' || filters.nomMicrored === 'SOLO RED') {
            return [{ value: 'SOLO RED', label: 'SEDE ADMINISTRATIVA RED' }];
        }

        if (filters.codigoMicrored === 'TODOS' || (!filters.codigoMicrored && !filters.nomMicrored) || !hierarchy.length) {
            return [{ value: 'TODOS', label: 'TODOS' }];
        }

        // Buscar en jerarquía por código primero, luego por nombre
        const microred = hierarchy.find((m: any) =>
            (m.codigo_microred && String(m.codigo_microred).trim() === String(filters.codigoMicrored).trim())
            || String(m.nom_microred).trim() === String(filters.nomMicrored).trim()
        );

        if (!microred) return [{ value: 'TODOS', label: 'TODOS' }];

        const options = microred.establecimientos.map((e: any) => ({
            value: e.codigoUnico,
            label: e.nombre_establecimiento
        }));

        options.unshift({ value: 'TODOS', label: 'TODOS' });
        return options;
    }, [hierarchy, filters.codigoMicrored, filters.nomMicrored]);

    const occupationalGroupOptions = [
        { value: '', label: 'TODOS' },
        { value: 'PROFESIONAL', label: 'PROFESIONAL' },
        { value: 'TECNICO', label: 'TÉCNICO' },
        { value: 'AUXILIAR', label: 'AUXILIAR' }
    ];

    const statusOptions = [
        { value: '', label: 'TODOS' },
        { value: 'activo', label: 'ACTIVO' },
        { value: 'cesado', label: 'CESADO' }
    ];

    const laborConditionOptions = useMemo(() => {
        const seen = new Set<string>();
        const options: { value: string; label: string }[] = [];
        for (const c of laborConditions) {
            if (c.grupo && !seen.has(c.grupo)) {
                seen.add(c.grupo);
                options.push({ value: c.grupo, label: c.grupo });
            }
        }
        options.unshift({ value: '', label: 'TODOS' });
        return options;
    }, [laborConditions]);

    const laborRegimeOptions = useMemo(() => {
        const options = laborRegimes.map((r: any) => ({
            value: String(r.laboral_regime_id),
            label: r.name
        }));
        options.unshift({ value: '', label: 'TODOS' });
        return options;
    }, [laborRegimes]);

    // Fetch List
    const fetchEmployees = useCallback(async (page: number = pagination.page) => {
        if (id) return; // No cargar lista si hay un ID (estamos en detalle)

        setLoading(true);
        try {
            const params = {
                page,
                limit: pagination.limit,
                search: searchTerm,
                grupoCondicion: filters.grupoCondicion || undefined,
                laborRegimeId: filters.laborRegimeId || undefined,
                occupationalGroup: filters.occupationalGroup,
                isEnabled: filters.status === 'activo' ? true : filters.status === 'cesado' ? false : undefined,
                codigoDisa: filters.codigoDisa,
                codigoRed: (filters.codigoRed === 'TODOS' || !filters.codigoRed) ? undefined : filters.codigoRed,
                nomRed: filters.nomRed,
                // Enviar código cuando está disponible (filtro por código en establishments)
                codigoMicrored: (filters.codigoMicrored === 'SOLO RED' || filters.codigoMicrored === 'TODOS' || !filters.codigoMicrored)
                    ? undefined
                    : filters.codigoMicrored,
                // Enviar nombre siempre como respaldo (backend lo usa si el código está vacío o nulo en BD)
                nomMicrored: (filters.codigoMicrored === 'TODOS' || !filters.nomMicrored || filters.nomMicrored === 'TODOS')
                    ? undefined
                    : filters.nomMicrored,
                codigoUnico: (filters.codigoMicrored === 'SOLO RED' || filters.codigoUnico === 'SOLO MICRORED')
                    ? 'SOLO MICRORED'
                    : filters.codigoUnico,
            };

            const response = await employeeService.getEmployees(params);
            if (response.success) {
                setEmployees(response.data);
                setPagination(response.pagination);
            } else {
                setEmployees([]);
            }
        } catch (error) {
            console.error('Error al cargar empleados:', error);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    }, [id, searchTerm, filters, pagination.limit, pagination.page]);

    // Fetch Detail
    const fetchDetail = useCallback(async (employeeId: string) => {
        setLoadingDetail(true);
        try {
            const [empRes, estData] = await Promise.all([
                employeeService.getEmployee(employeeId),
                hierarchyService.getEstablecimientosByRed(codigoRed || '01')
            ]);

            if (empRes.success) {
                setEmpleado(empRes.data);
            }

            setEstablishments(estData.map(e => ({
                establecimiento_id: 0,
                nombreEstablecimiento: e.nombre_establecimiento,
                ubigeo: '',
                nombreRed: e.nom_red,
                nombreMicrored: e.nom_microred,
                descripcionSector: '',
                codigoUnico: e.codigo_unico,
                departamento: '',
                provincia: '',
                distrito: '',
                categoriaEstablecimiento: e.categoria_establecimiento,
                codigoMicrored: e.codigo_microred,
                codigoRed: e.codigo_red,
            } as EstablishmentItem)));
        } catch (error) {
            console.error('Error al cargar detalle del empleado:', error);
        } finally {
            setLoadingDetail(false);
        }
    }, []);

    // Refresca el detalle del empleado sin afectar el estado de carga principal
    const refreshEmpleado = useCallback(async (employeeId: string) => {
        try {
            const res = await employeeService.getEmployee(employeeId);
            if (res.success) setEmpleado(res.data);
        } catch (error) {
            console.error('Error al refrescar empleado:', error);
        }
    }, []);

    // Effect for List
    useEffect(() => {
        if (!id) {
            const timer = setTimeout(() => {
                fetchEmployees(pagination.page);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [id, searchTerm, filters, pagination.page, fetchEmployees]);

    // Effect for Detail
    useEffect(() => {
        if (id) {
            fetchDetail(id);
        }
    }, [id, fetchDetail]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleHierarchyChange = (sel: { codigoRed: string | null; nomRed: string | null; codigoMicrored: string | null; nomMicrored: string | null; codigoUnico: string | null }) => {
        setFilters(prev => ({
            ...prev,
            codigoRed:      sel.codigoRed      ?? 'TODOS',
            nomRed:         sel.nomRed         ?? 'TODOS',
            codigoMicrored: sel.codigoMicrored ?? 'TODOS',
            nomMicrored:    sel.nomMicrored    ?? 'TODOS',
            codigoUnico:    sel.codigoUnico    ?? 'TODOS',
        }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => {
            const newFilters = { ...prev, [name]: value };
            if (name === 'codigoMicrored') {
                // Al cambiar el código de microred: derivar nombre para UI y resetear establecimiento
                if (value === 'TODOS' || value === 'SOLO RED') {
                    newFilters.nomMicrored = value;
                } else {
                    const m = hierarchy.find((m: any) => m.codigo_microred === value);
                    newFilters.nomMicrored = m ? m.nom_microred : value;
                }
                newFilters.codigoUnico = 'TODOS';
            }
            if (name === 'nomMicrored') {
                // Compatibilidad: al cambiar por nombre, sincronizar el código
                if (value === 'TODOS' || value === 'SOLO RED') {
                    newFilters.codigoMicrored = value;
                } else {
                    const m = hierarchy.find((m: any) => m.nom_microred === value);
                    newFilters.codigoMicrored = m ? (m.codigo_microred || value) : value;
                }
                newFilters.codigoUnico = 'TODOS';
            }
            return newFilters;
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleNavigateToDetail = (employeeId: number | string) => {
        navigate(`/home/rrhh/employees/${employeeId}`);
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const blob = await employeeService.exportEmployees({
                search: searchTerm,
                codigoDisa: filters.codigoDisa,
                codigoRed: (filters.codigoRed === 'TODOS' || !filters.codigoRed) ? undefined : filters.codigoRed,
                nomRed: filters.nomRed,
                codigoMicrored: (filters.codigoMicrored === 'SOLO RED' || filters.codigoMicrored === 'TODOS' || !filters.codigoMicrored)
                    ? undefined
                    : filters.codigoMicrored,
                nomMicrored: (filters.codigoMicrored === 'TODOS' || !filters.nomMicrored || filters.nomMicrored === 'TODOS')
                    ? undefined
                    : filters.nomMicrored,
                codigoUnico: (filters.codigoMicrored === 'SOLO RED' || filters.codigoUnico === 'SOLO MICRORED')
                    ? 'SOLO MICRORED'
                    : filters.codigoUnico,
                occupationalGroup: filters.occupationalGroup,
                grupoCondicion: filters.grupoCondicion || undefined,
                laborRegimeId: filters.laborRegimeId || undefined,
                isEnabled: filters.status === 'activo' ? true : filters.status === 'cesado' ? false : undefined,
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reporte_Empleados_${Date.now()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting:', error);
        } finally {
            setExporting(false);
        }
    };

    return {
        // Shared
        breadcrumb,
        navigate,
        user,

        // List Props
        employees,
        loading,
        searchTerm,
        filters,
        pagination,
        exporting,
        microredOptions,
        establishmentOptions,
        occupationalGroupOptions,
        statusOptions,
        laborConditionOptions,
        laborRegimeOptions,
        handleSearchChange,
        handleFilterChange,
        handleHierarchyChange,
        handlePageChange,
        handleNavigateToDetail,
        handleExport,
        refresh: fetchEmployees,

        // Detail Props
        empleado,
        establishments,
        loadingDetail,
        handleBack,
        refreshEmpleado
    };
};

