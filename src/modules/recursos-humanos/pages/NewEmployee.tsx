
import { User, MapPin, GraduationCap, Briefcase, Save, X } from 'lucide-react';
import { InputText, Select, Checkbox } from '../components/FormComponents';
import { useNewEmployee } from '../hooks/useNewEmployee';
import PageHeader from '../../../core/components/PageHeader';
import { useAppBreadcrumb } from '../../../core/hooks/useAppBreadcrumb';
import { useSubmodulePermissions } from '../../../core';

export default function NewEmployee() {
    const {
        formData,
        isEdit,
        loading,
        provinciasFiltradas,
        distritosFiltrados,
        departamentosUbigeo,
        documentTypes,
        educationLevels,
        educationGrades,
        professions,
        conditionProfessions,
        establishments,
        oficinasDirecciones,
        laboralRegimes,
        conditionLaboral,
        handleChange,
        handleSubmit,
        handleBack
    } = useNewEmployee();

    const { canCreate, canUpdate } = useSubmodulePermissions({
        submoduleName: 'Gestión de Empleados',
        applicationCode: 'RRHH',
    });
    const canSave = isEdit ? canUpdate : canCreate;

    console.log(documentTypes)

    const breadcrumb = useAppBreadcrumb([
        { label: 'Empleados', to: '/home/rrhh/employees' },
        isEdit ? 'Editar Empleado' : 'Nuevo Empleado',
    ]);
    const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700 mb-2">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                <Icon className="w-4 h-4" />
            </div>
            <h2 className="text-[14px] font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">{title}</h2>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-4 pb-10">
            {/* Header */}
            <PageHeader
                title={isEdit ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
                description={isEdit
                    ? 'Actualice la información del empleado'
                    : 'Complete la información requerida para el sector salud'
                }
                icon={User}
                color="#3B82F6"
                breadcrumb={breadcrumb}
                actions={[
                    {
                        label: 'Cancelar',
                        icon: X,
                        variant: 'secondary',
                        onClick: handleBack,
                    },
                    ...(canSave ? [{
                        label: isEdit ? 'Guardar Cambios' : 'Registrar Empleado',
                        icon: Save,
                        variant: 'primary' as const,
                        onClick: () => {
                            const form = document.querySelector('form');
                            form?.requestSubmit();
                        },
                    }] : []),
                ]}
            />

            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">

                {/* DATOS PERSONALES */}
                <section className='flex flex-col'>
                    <SectionHeader icon={User} title="Datos Personales" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" >
                        <InputText label="Nombres" name="firstName" type="text" value={formData.firstName} onChange={handleChange} required />
                        <InputText label="Apellido Paterno" name="lastNamePaternal" type="text" value={formData.lastNamePaternal} onChange={handleChange} required />
                        <InputText label="Apellido Materno" name="lastNameMaternal" type="text" value={formData.lastNameMaternal} onChange={handleChange} required />

                        <Select
                            label="Tipo de Documento"
                            name="documentTypeId"
                            value={formData.documentTypeId}
                            onChange={handleChange}
                            options={documentTypes.map(d => ({
                                value: String(d.doc_type_id),
                                label: d.description
                            }))}
                            required
                        />
                        <InputText label="N° Documento" name="documentNumber" type="text" value={formData.documentNumber} onChange={handleChange} required />
                        <InputText label="Fecha de Nacimiento" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} required />

                        <InputText label="Correo Electrónico" name="email" type="email" value={formData.email} onChange={handleChange} />
                        <InputText label="Teléfono / Celular" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                        <Select
                            label="Género"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            options={[
                                { value: 'M', label: 'Masculino' },
                                { value: 'F', label: 'Femenino' }
                            ]}
                        />
                    </div>
                </section>

                {/* UBIGEO Y DIRECCIÓN */}
                <section>
                    <SectionHeader icon={MapPin} title="Dirección y Ubigeo" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Select
                            label="Departamento"
                            name="ubigeo_departamento"
                            value={formData.ubigeo_departamento}
                            onChange={handleChange}
                            options={departamentosUbigeo.map(d => ({ value: d.id, label: d.name }))}
                        />
                        <Select
                            label="Provincia"
                            name="ubigeo_provincia"
                            value={formData.ubigeo_provincia}
                            onChange={handleChange}
                            options={provinciasFiltradas.map(p => ({ value: p.id, label: p.name }))}
                            disabled={!formData.ubigeo_departamento}
                        />
                        <Select
                            label="Distrito"
                            name="ubigeo_distrito"
                            value={formData.ubigeo_distrito}
                            onChange={handleChange}
                            options={distritosFiltrados.map(d => ({ value: d.id, label: d.name }))}
                            disabled={!formData.ubigeo_provincia}
                        />
                        <InputText label="Dirección Actual" name="address" type="text" className="md:col-span-1" value={formData.address} onChange={handleChange} />
                    </div>
                </section>

                {/* FORMACIÓN ACADÉMICA */}
                <section>
                    <SectionHeader icon={GraduationCap} title="Formación Académica" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select
                            label="Nivel Educativo"
                            name="educationLevelId"
                            value={formData.educationLevelId}
                            onChange={handleChange}
                            options={educationLevels.map(e => ({
                                value: String(e.education_level_id),
                                label: e.name
                            }))}
                        />
                        <Select
                            label="Grado Educativo / Sustento"
                            name="academicGradeId"
                            value={formData.academicGradeId}
                            onChange={handleChange}
                            options={educationGrades.map(e => ({
                                value: String(e.grade_academic_id),
                                label: e.name
                            }))}
                        />
                        <Select
                            label="Profesion"
                            name="professionId"
                            value={formData.professionId}
                            onChange={handleChange}
                            options={professions.map(p => ({
                                value: String(p.profession_id),
                                label: p.description
                            }))}
                        />
                        <Select
                            label="Condición Profesional"
                            name="professionConditionId"
                            value={formData.professionConditionId}
                            onChange={handleChange}
                            options={conditionProfessions.map(c => ({
                                value: String(c.condicion_profesion_id),
                                label: c.name
                            }))}
                        />
                        <InputText label="Especialidad" name="specialty" type="text" value={formData.specialty} onChange={handleChange} />

                        <InputText label="N° de Colegiatura" name="colegiaturaNumber" type="text" value={formData.colegiaturaNumber} onChange={handleChange} />
                    </div>
                </section>

                {/* DATOS LABORALES */}
                <section>
                    <SectionHeader icon={Briefcase} title="Información Laboral" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Procedencia */}
                        <InputText label="Procedencia" name="origin" type="text" value={formData.origin} onChange={handleChange} />
                        {/* Contrato y Cargo */}
                        <Select
                            label="Régimen Laboral"
                            name="laborRegimeId"
                            value={formData.laborRegimeId}
                            onChange={handleChange}
                            options={laboralRegimes.map(r => ({
                                value: String(r.laboral_regime_id),
                                label: r.name
                            }))}
                        />
                        <Select
                            label="Condicion Laboral"
                            name="laborConditionId"
                            value={formData.laborConditionId}
                            onChange={handleChange}
                            options={conditionLaboral.map(c => ({
                                value: String(c.condicion_laboral_id),
                                label: c.name
                            }))}
                        />
                        <InputText label="Cargo Funcional" name="functionalPosition" type="text" value={formData.functionalPosition} onChange={handleChange} />
                        <InputText label="Fecha de Ingreso" name="hireDate" type="date" value={formData.hireDate} onChange={handleChange} />
                        <InputText label="Código Plaza AIRHSP" name="airhspPlazaCode" type="text" value={formData.airhspPlazaCode} onChange={handleChange} />

                        {/* Detalles Profesionales */}
                        <Select
                            label="Grupo Ocupacional"
                            name="occupationalGroup"
                            value={formData.occupationalGroup}
                            onChange={handleChange}
                            options={[
                                { value: 'PROFESIONAL', label: 'PROFESIONAL' },
                                { value: 'TECNICO', label: 'TECNICO' },
                                { value: 'AUXILIAR', label: 'AUXILIAR' },
                            ]}
                        />
                        <Select
                            label="Tipo Personal"
                            name="personnelType"
                            value={formData.personnelType}
                            onChange={handleChange}
                            options={[
                                { value: 'ADMINISTRATIVO', label: 'ADMINISTRATIVO' },
                                { value: 'ASISTENCIAL', label: 'ASISTENCIAL' },
                                { value: 'HÍBRIDO', label: 'HÍBRIDO' }
                            ]}
                        />
                    </div>
                </section>

                {/* ESTABLECIMIENTO DONDE TRABAJA */}
                <section>
                    <SectionHeader icon={Briefcase} title="Establecimiento Donde Trabaja" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select
                            label="Establecimiento"
                            name="codigoUnico"
                            value={formData.codigoUnico}
                            onChange={handleChange}
                            options={establishments.map(e => ({
                                value: String(e.codigoUnico),
                                label: e.nombreEstablecimiento
                            }))}
                        />
                        <Select
                            label="OFICINA / DIRECCION"
                            name="oficinaDireccionId"
                            value={formData.oficinaDireccionId || undefined}
                            onChange={handleChange}
                            options={oficinasDirecciones.map(d => ({
                                value: String(d.oficina_direccion_id),
                                label: d.name
                            }))}
                        />

                        <div className="flex items-center pt-4 md:pt-0">
                            <Checkbox
                                label="¿Es Jefe de Establecimiento?"
                                name="isEstablishmentHead"
                                checked={formData.isEstablishmentHead}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </section>

                {/* Footer del Formulario */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="px-6 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold text-[14px]"
                    >
                        Cancelar
                    </button>
                    {canSave && (
                        <button
                            type="submit"
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all shadow-lg shadow-blue-200 dark:shadow-none font-medium text-[13px]"
                        >
                            {isEdit ? 'Guardar Cambios' : 'Registrar Empleado'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
