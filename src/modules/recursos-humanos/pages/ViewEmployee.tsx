import { ArrowLeft, User, MapPin, GraduationCap, Briefcase, Calendar, Mail, Phone, Dna, FileText, Activity, Loader2, Edit, Building2, Award, Heart, BadgeCheck, MapPinned, CreditCard, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../core/components/PageHeader';
import { useAppBreadcrumb } from '../../../core/hooks/useAppBreadcrumb';
import { useSubmodulePermissions } from '../../../core/hooks/useSubmodulePermissions';
import {
    EditPersonalModal,
    EditAddressModal,
    EditAcademicModal,
    EditLaborModal,
    EditOrganizationalModal,
} from '../components/EmployeeEditModals';

export default function ViewEmployee() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { empleado, establishments, loadingDetail: loading, handleBack, refreshEmpleado } = useEmployees();

    // Modal open state
    const [modal, setModal] = useState<'personal' | 'address' | 'academic' | 'labor' | 'org' | null>(null);
    const closeModal = () => setModal(null);
    const onSaved = () => { closeModal(); if (id) refreshEmpleado(id); };
    const breadcrumb = useAppBreadcrumb([
        { label: 'Empleados', to: '/home/rrhh/employees' },
        'Perfil'
    ]);

    // ─── Permisos dinámicos desde el backend ────────────────────────────────
    const { canUpdate } = useSubmodulePermissions({
        submoduleName: 'GESTIÓN DE EMPLEADOS',
        applicationCode: 'RRHH',
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin absolute inset-0 m-auto" />
                </div>
                <p className="text-gray-500 font-bold animate-pulse">Cargando perfil del empleado...</p>
            </div>
        );
    }

    if (!empleado) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-10">
                <div className="bg-red-50 p-6 rounded-full mb-4">
                    <User className="w-12 h-12 text-red-400" />
                </div>
                <h2 className="text-xl font-black text-gray-800 mb-2">Empleado no encontrado</h2>
                <p className="text-gray-500 mb-6 max-w-xs">No se pudo encontrar la información del empleado solicitado en nuestra base de datos.</p>
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al listado
                </button>
            </div>
        );
    }

    // Buscar rotación activa
    const activeRotation = (empleado as any).rotations?.find((r: any) => r.isActive);

    // Función para obtener el nombre descriptivo del origen base (simil backend)
    const getOriginBaseName = () => {
        const emp = empleado as any;
        
        // Prioridad 1: Establecimiento (si tiene codigoUnico)
        if (emp.codigoUnico && (emp.establishment?.nombre_establecimiento || emp.establishment?.nombreEstablecimiento)) {
            return emp.establishment.nombre_establecimiento || emp.establishment.nombreEstablecimiento;
        }

        // Prioridad 2: Microred (si tiene codigoMicrored y no es establecimiento)
        if (emp.codigoMicrored && emp.codigoMicrored !== '00') {
            const est = establishments.find(e => e.codigoMicrored === emp.codigoMicrored);
            if (est) return `MICRORED: ${est.nombreMicrored ||  emp.codigoMicrored}`;
            
            // Si no está en el cache de establecimientos, intentar usar el nombre de la microred del objeto establishment si existe
            if (emp.establishment?.nom_microred || emp.establishment?.nombreMicrored) {
                return `MICRORED: ${emp.establishment.nom_microred || emp.establishment.nombreMicrored}`;
            }
            return `MICRORED: ${emp.codigoMicrored}`;
        }

        // Prioridad 3: Red (si tiene codigoRed)
        if (emp.codigoRed) {
            const est = establishments.find(e => e.codigoRed === emp.codigoRed);
            if (est) return `RED: ${est.nombreRed ||  emp.codigoRed}`;

            if (emp.establishment?.nom_red || emp.establishment?.nombreRed) {
                return `RED: ${emp.establishment.nom_red || emp.establishment.nombreRed}`;
            }
            return `RED: ${emp.codigoRed}`;
        }

        return 'SEDE ADMINISTRATIVA';
    };

    // Función para obtener el nombre del destino de rotación
    const getTargetName = (rotation: any) => {
        if (rotation.targetLevel === 'ESTABLECIMIENTO') {
            return rotation.targetEstablishment?.nombre_establecimiento || rotation.targetEstablishment?.nombreEstablecimiento || rotation.targetName || 'ESTABLECIMIENTO';
        }
        if (rotation.targetLevel === 'MICRORED') {
            const est = establishments.find(e => e.codigoMicrored === rotation.targetCodigoMicrored);
            return est?.nombreMicrored || rotation.targetName || `MICRORED: ${rotation.targetCodigoMicrored}`;
        }
        if (rotation.targetLevel === 'RED') {
            const est = establishments.find(e => e.codigoRed === rotation.targetCodigoRed);
            return est?.nombreRed || rotation.targetName || `RED: ${rotation.targetCodigoRed}`;
        }
        return 'DESTINO DESCONOCIDO';
    };

    const DetailItem = ({ label, value, icon: Icon, color = "blue", highlight = false }: { label: string, value?: string | number, icon?: any, color?: string, highlight?: boolean }) => {
        const colorClasses: any = {
            blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
            green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
            purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
            orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
            gray: "bg-gray-50 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400",
            red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
        };

        return (
            <div className={`group flex flex-col gap-1 p-3 rounded-xl border transition-all hover:shadow-sm ${highlight
                ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800'
                : 'bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900'
                }`}>
                <div className="flex items-center gap-1.5">
                    {Icon && (
                        <div className={`p-1 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
                            <Icon className="w-3 h-3" />
                        </div>
                    )}
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                        {label}
                    </span>
                </div>
                <span className={`text-[13px] font-bold pl-0.5 truncate ${highlight ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                    {value || '---'}
                </span>
            </div>
        );
    };

    const SectionHeader = ({ icon: Icon, title, subtitle, onEdit }: { icon: any, title: string, subtitle?: string, onEdit?: () => void }) => (
        <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gray-900 dark:bg-white rounded-lg text-white dark:text-gray-900 shadow-md">
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase ">{title}</h3>
                    {subtitle && <p className="text-[11px] text-gray-600 font-medium -mt-1 dark:text-gray-400">{subtitle}</p>}
                </div>
            </div>
            {onEdit && canUpdate && (
                <button onClick={onEdit}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold rounded-md bg-blue-600 text-white dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors">
                    <Edit className="w-3 h-3" />
                    Editar
                </button>
            )}
        </div>
    );

    return (
        <>
            <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
                {/* Header / Actions */}
                <PageHeader
                    title={`${empleado.lastNamePaternal} ${empleado.lastNameMaternal}, ${empleado.firstName}`}
                    description={`Perfil detallado del personal - ID: ${empleado.employee_id}`}
                    icon={User}
                    color="#3B82F6"
                    breadcrumb={breadcrumb}
                    badge={[
                        { label: empleado.isEnabled ? 'ACTIVO' : 'CESADO' },
                        { label: empleado.personnelType || 'PERSONAL' }
                    ]}
                    actions={[
                        {
                            label: 'Volver',
                            icon: ArrowLeft,
                            variant: 'secondary',
                            onClick: handleBack,
                        },
                        ...(canUpdate ? [{
                            label: 'Editar Perfil',
                            icon: Edit,
                            variant: 'primary' as const,
                            onClick: () => navigate(`/home/rrhh/employees/edit/${empleado.employee_id}`),
                        }] : [])
                    ]}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Panel Izquierdo: Sidebar de Perfil */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-[1rem] border border-gray-100 dark:border-gray-700 shadow-lg shadow-gray-100 dark:shadow-none relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-bl-[4rem] -mr-8 -mt-8"></div>

                            <div className="flex flex-col items-center text-center relative">
                                {canUpdate && (
                                    <button onClick={() => setModal('personal')}
                                        className="absolute top-0 right-0 flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-md bg-blue-600 dark:bg-gray-700 text-white dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors z-10">
                                        <Edit className="w-3 h-3" />
                                        Editar
                                    </button>
                                )}
                                <div className="relative mb-4">
                                    <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-blue-500 to-blue-700 p-1 shadow-xl rotate-2">
                                        <div className="w-full h-full rounded-[1.8rem] bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden -rotate-2">
                                            {empleado.photoUrl ? (
                                                <img src={empleado.photoUrl} alt={empleado.firstName} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-16 h-16 text-blue-100 dark:text-gray-700" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white dark:border-gray-800 w-6 h-6 rounded-full shadow-md"></div>
                                </div>

                                <h2 className="text-lg font-black text-gray-900 dark:text-white mb-0.5">
                                    {empleado.firstName}
                                </h2>
                                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-wider mb-4">
                                    {empleado.profession?.description || 'Profesional'}
                                </p>

                                <div className="w-full space-y-2">
                                    <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                            <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter leading-none">Documento {empleado.documentType?.abbreviation || 'DNI'}</p>
                                            <p className="text-[12px] font-bold text-gray-900 dark:text-white">{empleado.documentNumber}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                            <Mail className="w-3.5 h-3.5 text-blue-400" />
                                        </div>
                                        <div className="text-left overflow-hidden">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter leading-none">Email Institucional</p>
                                            <p className="text-[12px] font-bold text-gray-900 dark:text-white truncate">{empleado.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                            <Phone className="w-3.5 h-3.5 text-blue-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter leading-none">Teléfono Directo</p>
                                            <p className="text-[12px] font-bold text-gray-900 dark:text-white">{empleado.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br bg-blue-100 p-4 rounded-[1rem] text-white shadow-xl">
                            <SectionHeader icon={Heart} title="Emergencia" />
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[8px] font-black text-gray-900 uppercase tracking-widest mb-0.5">Contacto</p>
                                    <p className="text-[13px] font-bold">{empleado.emergencyContact || '---'}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-gray-900 uppercase tracking-widest mb-0.5">Teléfono</p>
                                    <p className="text-[13px] font-bold text-blue-400">{empleado.emergencyPhone || '---'}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-gray-900 uppercase tracking-widest mb-0.5">Condición Salud</p>
                                    <p className="text-[11px] text-green-600 leading-tight">{empleado.healthCondition || 'Ninguna registrada'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel Derecho: Contenido Detallado */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-4">

                        {/* Sección: Ubicación y Origen */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-[1rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-100 dark:shadow-none">
                            <SectionHeader
                                icon={MapPinned}
                                title="Residencia y Origen"
                                subtitle="Información geográfica y dirección domiciliaria"
                                onEdit={() => setModal('address')}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                <DetailItem label="Departamento" value={empleado.ubigeo?.Departamento} icon={MapPin} color="blue" />
                                <DetailItem label="Provincia" value={empleado.ubigeo?.Provincia} icon={MapPin} color="blue" />
                                <DetailItem label="Distrito" value={empleado.ubigeo?.Distrito} icon={MapPin} color="blue" />
                                <DetailItem label="Código Ubigeo" value={empleado.idUbigueoReniec} icon={BadgeCheck} color="gray" />
                                <div className="md:col-span-2 lg:col-span-4">
                                    <DetailItem label="Dirección Domiciliaria Completa" value={empleado.address} icon={MapPin} color="purple" />
                                </div>
                            </div>
                        </div>

                        {/* Sección: Formación Profesional */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-[1rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-100 dark:shadow-none">
                            <SectionHeader
                                icon={GraduationCap}
                                title="Formación Profesional"
                                subtitle="Grados académicos y certificaciones"
                                onEdit={() => setModal('academic')}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                <DetailItem label="Nivel Educativo" value={empleado.educationLevel?.name || empleado.educationLevelId} icon={Award} color="orange" />
                                <DetailItem label="Grado Máximo" value={empleado.gradeAcademic?.name || empleado.academicGradeId} icon={Award} color="orange" />
                                <DetailItem label="Especialidad" value={empleado.specialty} icon={Dna} color="purple" />
                                <DetailItem label="Condición Profesión" value={empleado.condicionProfesion?.name || empleado.professionConditionId} icon={BadgeCheck} color="blue" />
                                <DetailItem label="N° Colegiatura" value={empleado.colegiaturaNumber} icon={FileText} color="blue" />
                                <DetailItem label="Origen de Formación" value={empleado.origin} icon={Building2} color="gray" />
                            </div>
                        </div>

                        {/* Sección: Situación Laboral */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-[1rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-100 dark:shadow-none">
                            <SectionHeader
                                icon={Briefcase}
                                title="Situación Laboral"
                                subtitle="Detalles del contrato y posición funcional"
                                onEdit={() => setModal('labor')}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                <DetailItem label="Régimen Laboral" value={empleado.laboralRegime?.name || empleado.laborRegimeId} icon={Briefcase} color="blue" />
                                <DetailItem label="Condición" value={empleado.condicionLaboral?.name || empleado.laborConditionId} icon={BadgeCheck} color="green" />
                                <DetailItem label="Fecha Ingreso" value={empleado.hireDate} icon={Calendar} color="blue" />
                                <DetailItem label="Código Plaza" value={empleado.airhspPlazaCode} icon={FileText} color="gray" />

                                <div className="md:col-span-2">
                                    <DetailItem label="Oficina / Unidad Orgánica" value={empleado.oficinaDireccion?.name || empleado.oficinaDireccionId} icon={Building2} color="blue" />
                                </div>
                                <DetailItem label="Grupo Ocupacional" value={empleado.occupationalGroup} icon={Activity} color="purple" />
                                <DetailItem label="Tipo Personal" value={empleado.personnelType} icon={User} color="orange" />

                                <div className="md:col-span-2">
                                    <DetailItem label="Cargo Funcional" value={empleado.functionalPosition} icon={Award} color="blue" />
                                </div>
                                <DetailItem label="Remuneración" value={empleado.salary ? `S/ ${empleado.salary.toLocaleString()}` : '---'} icon={CreditCard} color="green" />
                                <DetailItem label="Responsable Establ." value={empleado.isEstablishmentHead ? 'SÍ' : 'NO'} icon={BadgeCheck} color={empleado.isEstablishmentHead ? "green" : "gray"} />
                            </div>
                        </div>

                        {/* Sección: Ubicación y Origen Base */}
                        <div className="bg-blue-600 p-4 rounded-[1rem] shadow-2xl shadow-blue-200 dark:shadow-none text-white overflow-hidden relative">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-white rounded-lg text-blue-600 shadow-xl">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight leading-none">Origen Base</h3>
                                        <p className="text-blue-100 text-[12px] font-bold mt-1">Ubicación principal asignada al personal</p>
                                    </div>
                                </div>
                                {canUpdate && (
                                    <button onClick={() => setModal('org')}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors">
                                        <Edit className="w-3 h-3" />
                                        Editar
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                                    <p className="text-[9px] font-black text-blue-100 uppercase tracking-widest mb-1">Nombre del Establecimiento / Sede</p>
                                    <p className="text-lg font-black leading-tight">{getOriginBaseName()}</p>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <span className="px-2 py-0.5 bg-white/20 rounded-md text-[11px] font-bold uppercase tracking-wider border border-white/10">
                                            RED: {empleado.establishment?.nombreRed || establishments.find(e => e.codigoRed === (empleado as any).codigoRed)?.nombreRed || (empleado as any).codigoRed || '---'}
                                        </span>
                                        <span className="px-2 py-0.5 bg-white/20 rounded-md text-[11px] font-bold uppercase tracking-wider border border-white/10">
                                            MICRORED: {empleado.establishment?.nombreMicrored || establishments.find(e => e.codigoMicrored === (empleado as any).codigoMicrored)?.nombreMicrored || (empleado as any).codigoMicrored || '---'}
                                        </span>
                                        <span className="px-2 py-0.5 bg-white/20 rounded-md text-[11px] font-bold uppercase tracking-wider border border-white/10">
                                            CAT: {empleado.establishment?.categoriaEstablecimiento || '---'}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 flex flex-col justify-center">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <div className="p-1.5 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-orange-600">
                                            <MapPin className="w-3.5 h-3.5" />
                                        </div>
                                        <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Ubicación Red</p>
                                    </div>
                                    <p className="text-xs font-black text-white truncate">
                                        {empleado.establishment?.distrito || '---'}, {empleado.establishment?.provincia || '---'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Sección: Destino de Rotación (Solo si hay rotación activa) */}
                        {activeRotation && (
                            <div className="bg-orange-500 p-3 rounded-[1rem] shadow-2xl shadow-orange-200 dark:shadow-none text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-2 bg-white rounded-lg text-orange-600 shadow-xl">
                                            <RefreshCw className="w-5 h-5 animate-spin-slow" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black uppercase tracking-tight leading-none">Destino de Rotación</h3>
                                            <p className=" text-[12px] font-bold mt-1 text-white">Ubicación temporal por necesidad de servicio</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="lg:col-span-2 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                                            <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-white">Lugar de Destino</p>
                                            <p className="text-lg font-black leading-tight text-white">{getTargetName(activeRotation)}</p>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <span className="px-2 py-0.5 bg-white/20 rounded-md text-[11px] font-bold uppercase tracking-wider border border-white/10 text-white">
                                                    NIVEL: {activeRotation.targetLevel}
                                                </span>
                                                <span className="px-2 py-0.5 bg-white/20 rounded-md text-[11px] font-bold uppercase tracking-wider border border-white/10 text-white">
                                                    INICIO: {new Date(activeRotation.startDate).toLocaleDateString()}
                                                </span>
                                                {activeRotation.endDate && (
                                                    <span className="px-2 py-0.5 bg-white/20 rounded-md text-[11px] font-bold uppercase tracking-wider border border-white/10 text-white">
                                                        FIN: {new Date(activeRotation.endDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 flex flex-col justify-center">
                                            <div className="flex items-center gap-2.5 mb-2">
                                                <div className="p-1.5 bg-white rounded-lg text-orange-600">
                                                    <FileText className="w-3.5 h-3.5" />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white">Documento Ref.</p>
                                            </div>
                                            <p className="text-[11px] font-bold text-white truncate">
                                                {activeRotation.documentRef || 'SIN DOCUMENTO'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* ── Modales de edición ─────────────────────────────── */}
            {empleado && (<>
                <EditPersonalModal open={modal === 'personal'} onClose={closeModal} empleado={empleado!} onSaved={onSaved} />
                <EditAddressModal open={modal === 'address'} onClose={closeModal} empleado={empleado!} onSaved={onSaved} />
                <EditAcademicModal open={modal === 'academic'} onClose={closeModal} empleado={empleado!} onSaved={onSaved} />
                <EditLaborModal open={modal === 'labor'} onClose={closeModal} empleado={empleado!} onSaved={onSaved} />
                <EditOrganizationalModal open={modal === 'org'} onClose={closeModal} empleado={empleado!} onSaved={onSaved} />
            </>)}
        </>
    );
}