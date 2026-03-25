import { useState, useEffect, useCallback } from 'react';
import { rotationService } from '../services/rotationService';
import type { Rotation } from '../types/employee.types';
import { useNavigate } from 'react-router-dom';
import { useAccessLevel } from '../../../core/hooks/useAccessLevel';
import type { HierarchySelection } from '../../../core/components/RedLevelAccess';

export const useRotation = () => {
    const navigate = useNavigate();
    const { isMicroredLevel, isEstablishmentLevel } = useAccessLevel();

    // UI State
    const [rotations, setRotations] = useState<Rotation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const [showNewRotationModal, setShowNewRotationModal] = useState(false);
    const [selectedRotationId, setSelectedRotationId] = useState<number | undefined>(undefined);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    // History State
    const [history, setHistory] = useState<Rotation[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Unified hierarchy state for RedLevelAccess component
    const [selectedHierarchy, setSelectedHierarchy] = useState<HierarchySelection>({
        codigoRed: null,
        nomRed: null,
        codigoMicrored: null,
        nomMicrored: null,
        codigoUnico: null,
        nombreEstablecimiento: null,
    });


    // Filters & Pagination State
    const [filters, setFilters] = useState({
        isActive: undefined as boolean | undefined
    });
const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    // Close menu logic
    useEffect(() => {
        const handleClickOutside = () => {
            setOpenMenuId(null);
            setMenuPosition(null);
        };
        const handleScroll = () => {
            if (openMenuId) {
                setOpenMenuId(null);
                setMenuPosition(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [openMenuId]);




    // Fetch rotations when search or filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRotations(1);
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchTerm, filters, selectedHierarchy]);

    const fetchRotations = async (page: number = pagination.page) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: pagination.limit,
                search: searchTerm,
                isActive: filters.isActive,
                codigoRed: selectedHierarchy.codigoRed || undefined,
                codigoMicrored: selectedHierarchy.codigoMicrored || undefined,
                codigoUnico: selectedHierarchy.codigoUnico || undefined,
            };

            const response = await rotationService.getRotations(params);
            if (response.success) {
                setRotations(response.data);
                setPagination(response.pagination);
            } else {
                setRotations([]);
            }
        } catch (error) {
            console.error('Error al cargar rotaciones:', error);
            setRotations([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = useCallback(async (employeeId: number) => {
        setLoadingHistory(true);
        try {
            const response = await rotationService.getRotationHistory(employeeId);
            if (response.success) {
                setHistory(response.data);
            }
        } catch (error) {
            console.error('Error al cargar historial:', error);
        } finally {
            setLoadingHistory(false);
        }
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (name: string, value: any) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchRotations(newPage);
        }
    };

    const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>, rotationId: number) => {
        e.stopPropagation();
        if (openMenuId === rotationId) {
            setOpenMenuId(null);
            setMenuPosition(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + window.scrollY + 5,
                left: rect.right + window.scrollX - 192 // w-48 = 192px
            });
            setOpenMenuId(rotationId);
        }
    };

    const handleEndRotation = async (rotationId: number) => {
        if (!window.confirm('¿Está seguro de que desea finalizar esta rotación? Esta acción marcará la rotación como inactiva.')) {
            return;
        }

        try {
            setLoading(true);
            const response = await rotationService.updateRotation(rotationId, {
                isActive: false,
                endDate: new Date().toISOString().split('T')[0]
            });

            if (response.success) {
                await fetchRotations();
            } else {
                console.error('Error al finalizar rotación:', response.message);
                alert('No se pudo finalizar la rotación. Intente nuevamente.');
            }
        } catch (error) {
            console.error('Error al finalizar rotación:', error);
            alert('Ocurrió un error al procesar la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditRotation = (rotationId: number) => {
        setSelectedRotationId(rotationId);
        setShowNewRotationModal(true);
        setOpenMenuId(null);
        setMenuPosition(null);
    };

    const handleNewRotation = () => {
        setSelectedRotationId(undefined);
        setShowNewRotationModal(true);
    };

    const handleViewHistory = (employeeId: number) => {
        navigate(`/home/rrhh/rotations/history/${employeeId}`);
        setOpenMenuId(null);
        setMenuPosition(null);
    };

    const handleDownloadDoc = async (rotationId: number) => {
        setDownloadingId(rotationId);
        try {
            await rotationService.downloadRotationDoc(rotationId);
        } catch (err) {
            console.error('Error downloading document:', err);
        } finally {
            setDownloadingId(null);
            setOpenMenuId(null);
            setMenuPosition(null);
        }
    };

    const handleCloseModal = () => {
        setShowNewRotationModal(false);
        setSelectedRotationId(undefined);
    };

    const handleSuccessModal = () => {
        handleCloseModal();
        fetchRotations();
    };

    // Helper to format date string YYYY-MM-DD to DD/MM/YYYY
    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const datePart = dateString.split('T')[0];
        const [year, month, day] = datePart.split('-');
        return `${day}/${month}/${year}`;
    };

    // Helper to determine status color and text
    const getStatusConfig = (rotation: any) => {
        if (!rotation.isActive) {
            return {
                label: 'Finalizado',
                className: 'bg-gray-100 text-gray-700 border-gray-200'
            };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!rotation.endDate) {
            return {
                label: 'Activo',
                className: 'bg-green-50 text-green-700 border-green-200'
            };
        }

        const datePart = rotation.endDate.split('T')[0];
        const [year, month, day] = datePart.split('-');
        const endDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

        if (endDate < today) {
            return {
                label: 'Activo',
                className: 'bg-orange-50 text-orange-700 border-orange-200'
            };
        }

        return {
            label: 'Activo',
            className: 'bg-green-50 text-green-700 border-green-200'
        };
    };

    return {
        // State
        rotations,
        loading,
        searchTerm,
        filters,
        pagination,
        openMenuId,
        menuPosition,
        showNewRotationModal,
        selectedRotationId,
        downloadingId,
        history,
        loadingHistory,

        // Handlers
        handleSearchChange,
        handleFilterChange,
        handlePageChange,
        handleMenuClick,
        handleEndRotation,
        handleEditRotation,
        handleNewRotation,
        handleViewHistory,
        handleDownloadDoc,
        handleCloseModal,
        handleSuccessModal,
        refresh: fetchRotations,
        fetchHistory,

        // Helpers
        formatDate,
        getStatusConfig,
        setOpenMenuId,
        setMenuPosition,

        // Location filters
        selectedHierarchy,
        setSelectedHierarchy,
        isMicroredLevel,
        isEstablishmentLevel,
    };
};
