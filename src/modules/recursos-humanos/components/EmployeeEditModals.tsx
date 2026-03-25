/**
 * EmployeeEditModals.tsx
 * Modales de edición por sección para el perfil de empleado.
 * Exports: EditPersonalModal, EditAddressModal, EditAcademicModal, EditLaborModal, EditOrganizationalModal
 */

import { useState, useEffect, useCallback } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { employeeService } from '../services/employeeService';
import { commonService } from '../services/commonService';
import hierarchyService from '../../../core/services/hierarchyService';
import type { EmployeeDetail } from '../types';
import { InputText, Select, Checkbox } from './FormComponents';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ModalProps {
    open: boolean;
    onClose: () => void;
    empleado: EmployeeDetail;
    onSaved: () => void;
}

// ─── Shared: ModalWrapper ────────────────────────────────────────────────────

function ModalWrapper({ open, onClose, title, onSave, saving, children }: {
    open: boolean;
    onClose: () => void;
    title: string;
    onSave: () => void;
    saving: boolean;
    children: React.ReactNode;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative bg-white dark:bg-gray-800 rounded-[1rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 shrink-0">
                    <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight"> {title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
                {/* Body */}
                <div className="overflow-y-auto flex-1 px-5 py-5">{children}</div>
                {/* Footer */}
                <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 dark:border-gray-700 shrink-0">
                    <button onClick={onClose} disabled={saving}
                        className="px-4 py-2 text-xs font-bold rounded-md border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={onSave} disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-md">
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Shared: Section divider ─────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: string }) => (
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3 mt-1">{children}</p>
);

// ─── Shared: useSubmit hook ───────────────────────────────────────────────────

// Convierte strings vacíos a null en campos numéricos/ID/fecha antes de enviar al backend
function sanitize(data: Record<string, any>): Record<string, any> {
    // Campos enteros: '' o 'null' → null; valor presente → Number
    const INTEGER_FIELDS = [
        'documentTypeId', 'educationLevelId', 'academicGradeId', 'professionId',
        'professionConditionId', 'laborRegimeId', 'laborConditionId', 'oficinaDireccionId',
        'serviceId', 'appointmentConsultoryId',
    ];
    // Campos numéricos no enteros: '' → null; valor presente → Number
    const NUMERIC_FIELDS = ['salary'];
    // Campos de fecha: '' → null (evita new Date('') = Invalid Date en el backend)
    const DATE_FIELDS = ['birthDate', 'hireDate', 'appointmentDate', 'lowDate'];
    // Campos string enum: '' → null (evita CHECK constraint errors en PostgreSQL)
    const STRING_ENUM_FIELDS = ['occupationalGroup', 'personnelType', 'gender'];

    const result: Record<string, any> = { ...data };

    for (const key of [...INTEGER_FIELDS, ...NUMERIC_FIELDS]) {
        if (!(key in result)) continue;
        if (result[key] === '' || result[key] === 'null' || result[key] === null) {
            result[key] = null;
        } else {
            const n = Number(result[key]);
            result[key] = isNaN(n) ? null : (n || null);
        }
    }
    for (const key of DATE_FIELDS) {
        if (key in result && result[key] === '') result[key] = null;
    }
    for (const key of STRING_ENUM_FIELDS) {
        if (key in result && result[key] === '') result[key] = null;
    }

    return result;
}

function useSubmit(empleadoId: number, onSaved: () => void) {
    const [saving, setSaving] = useState(false);

    const submit = useCallback(async (data: Record<string, any>) => {
        setSaving(true);
        try {
            const res = await employeeService.updateEmployee(String(empleadoId), sanitize(data));
            if (res.success) {
                await Swal.fire({ icon: 'success', title: 'Guardado', text: 'Datos actualizados correctamente.', timer: 1800, showConfirmButton: false });
                onSaved();
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: (res as any).message || 'No se pudo guardar.', confirmButtonColor: '#1f2937' });
            }
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error inesperado al guardar.', confirmButtonColor: '#1f2937' });
        } finally {
            setSaving(false);
        }
    }, [empleadoId, onSaved]);

    return { saving, submit };
}

// ─── 1. EditPersonalModal ────────────────────────────────────────────────────

export function EditPersonalModal({ open, onClose, empleado, onSaved }: ModalProps) {
    const { saving, submit } = useSubmit(empleado.employee_id, onSaved);
    const [docTypeOptions, setDocTypeOptions] = useState<{ value: string; label: string }[]>([]);
    const [form, setForm] = useState({
        firstName: '',
        lastNamePaternal: '',
        lastNameMaternal: '',
        documentTypeId: '',
        documentNumber: '',
        birthDate: '',
        gender: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (!open) return;
        setForm({
            firstName: empleado.firstName ?? '',
            lastNamePaternal: empleado.lastNamePaternal ?? '',
            lastNameMaternal: empleado.lastNameMaternal ?? '',
            documentTypeId: String(empleado.documentTypeId ?? ''),
            documentNumber: empleado.documentNumber ?? '',
            birthDate: empleado.birthDate ?? '',
            gender: empleado.gender ?? '',
            email: empleado.email ?? '',
            phone: empleado.phone ?? '',
        });
        commonService.getDocumentTypes().then(r => {
            if (r.success) setDocTypeOptions(r.data.map((d: any) => ({ value: String(d.doc_type_id), label: `${d.abbreviation} - ${d.description}` })));
        });
    }, [open, empleado]);

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(p => ({ ...p, [k]: e.target.value }));

    return (
        <ModalWrapper open={open} onClose={onClose} title="Editar Datos Personales"
            onSave={() => submit(form)} saving={saving}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputText label="Nombres" name="firstName" value={form.firstName} onChange={set('firstName')} />
                <InputText label="Apellido Paterno" name="lastNamePaternal" value={form.lastNamePaternal} onChange={set('lastNamePaternal')} />
                <InputText label="Apellido Materno" name="lastNameMaternal" value={form.lastNameMaternal} onChange={set('lastNameMaternal')} />
                <Select label="Género" name="gender" value={form.gender} onChange={set('gender')}
                    options={[{ value: 'M', label: 'Masculino' }, { value: 'F', label: 'Femenino' }]} variant="custom" />
                <Select label="Tipo de Documento" name="documentTypeId" value={form.documentTypeId}
                    onChange={set('documentTypeId')} options={docTypeOptions} variant="custom" />
                <InputText label="N° Documento" name="documentNumber" value={form.documentNumber} onChange={set('documentNumber')} />
                <InputText label="Fecha de Nacimiento" name="birthDate" type="date" value={form.birthDate} onChange={set('birthDate')} />
                <InputText label="Correo Electrónico" name="email" type="email" value={form.email} onChange={set('email')} />
                <InputText label="Teléfono / Celular" name="phone" value={form.phone} onChange={set('phone')} />
            </div>
        </ModalWrapper>
    );
}

// ─── 2. EditAddressModal ─────────────────────────────────────────────────────

export function EditAddressModal({ open, onClose, empleado, onSaved }: ModalProps) {
    const { saving, submit } = useSubmit(empleado.employee_id, onSaved);
    const [deptOpts, setDeptOpts] = useState<{ value: string; label: string }[]>([]);
    const [provOpts, setProvOpts] = useState<{ value: string; label: string }[]>([]);
    const [distOpts, setDistOpts] = useState<{ value: string; label: string }[]>([]);
    const [form, setForm] = useState({
        ubigeo_departamento: '',
        ubigeo_provincia: '',
        idUbigueoReniec: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        healthCondition: '',
    });

    useEffect(() => {
        if (!open) return;
        setForm({
            ubigeo_departamento: '',
            ubigeo_provincia: '',
            idUbigueoReniec: empleado.idUbigueoReniec ?? '',
            address: empleado.address ?? '',
            emergencyContact: empleado.emergencyContact ?? '',
            emergencyPhone: empleado.emergencyPhone ?? '',
            healthCondition: empleado.healthCondition ?? '',
        });
        setProvOpts([]);
        setDistOpts([]);

        commonService.getDepartments().then(async res => {
            if (!res.success) return;
            const opts = res.data.map((d: any) => ({ value: d.id, label: d.name }));
            setDeptOpts(opts);

            if (!empleado.ubigeo?.Departamento) return;
            const dept = res.data.find((d: any) => d.name === empleado.ubigeo!.Departamento);
            if (!dept) return;
            setForm(p => ({ ...p, ubigeo_departamento: dept.id }));

            const provRes = await commonService.getProvinces(dept.id);
            if (!provRes.success) return;
            setProvOpts(provRes.data.map((p: any) => ({ value: p.id, label: p.name })));

            if (!empleado.ubigeo?.Provincia) return;
            const prov = provRes.data.find((p: any) => p.name === empleado.ubigeo!.Provincia);
            if (!prov) return;
            setForm(p => ({ ...p, ubigeo_provincia: prov.id }));

            const distRes = await commonService.getDistricts(dept.id, prov.id);
            if (!distRes.success) return;
            setDistOpts(distRes.data.map((d: any) => ({ value: d.id, label: d.name })));
        });
    }, [open, empleado]);

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(p => ({ ...p, [k]: e.target.value }));

    const handleDeptChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const deptId = e.target.value;
        setForm(p => ({ ...p, ubigeo_departamento: deptId, ubigeo_provincia: '', idUbigueoReniec: '' }));
        setProvOpts([]);
        setDistOpts([]);
        if (!deptId) return;
        const res = await commonService.getProvinces(deptId);
        if (res.success) setProvOpts(res.data.map((p: any) => ({ value: p.id, label: p.name })));
    };

    const handleProvChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provId = e.target.value;
        setForm(p => ({ ...p, ubigeo_provincia: provId, idUbigueoReniec: '' }));
        setDistOpts([]);
        if (!provId) return;
        const res = await commonService.getDistricts(form.ubigeo_departamento, provId);
        if (res.success) setDistOpts(res.data.map((d: any) => ({ value: d.id, label: d.name })));
    };

    const handleSave = () => {
        const { ubigeo_departamento: _d, ubigeo_provincia: _p, ...payload } = form;
        submit(payload);
    };

    return (
        <ModalWrapper open={open} onClose={onClose} title="Editar Residencia y Emergencia"
            onSave={handleSave} saving={saving}>
            <div className="space-y-6">
                <div>
                    <SectionLabel>Ubigeo</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <Select label="Departamento" name="ubigeo_departamento" value={form.ubigeo_departamento}
                            onChange={handleDeptChange} options={deptOpts} variant="custom" />
                        <Select label="Provincia" name="ubigeo_provincia" value={form.ubigeo_provincia}
                            onChange={handleProvChange} options={provOpts} disabled={!form.ubigeo_departamento} variant="custom" />
                        <Select label="Distrito" name="idUbigueoReniec" value={form.idUbigueoReniec}
                            onChange={set('idUbigueoReniec')} options={distOpts} disabled={!form.ubigeo_provincia} variant="custom" />
                    </div>
                </div>
                <InputText label="Dirección Domiciliaria" name="address" value={form.address} onChange={set('address')} />
                <div>
                    <SectionLabel>Contacto de Emergencia</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <InputText label="Nombre del Contacto" name="emergencyContact" value={form.emergencyContact} onChange={set('emergencyContact')} />
                        <InputText label="Teléfono de Emergencia" name="emergencyPhone" value={form.emergencyPhone} onChange={set('emergencyPhone')} />
                        <div className="sm:col-span-2">
                            <InputText label="Condición de Salud" name="healthCondition" value={form.healthCondition} onChange={set('healthCondition')} />
                        </div>
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
}

// ─── 3. EditAcademicModal ────────────────────────────────────────────────────

export function EditAcademicModal({ open, onClose, empleado, onSaved }: ModalProps) {
    const { saving, submit } = useSubmit(empleado.employee_id, onSaved);
    const [educationOpts, setEducationOpts] = useState<{ value: string; label: string }[]>([]);
    const [gradeOpts, setGradeOpts] = useState<{ value: string; label: string }[]>([]);
    const [professionOpts, setProfessionOpts] = useState<{ value: string; label: string }[]>([]);
    const [profConditionOpts, setProfConditionOpts] = useState<{ value: string; label: string }[]>([]);
    const [form, setForm] = useState({
        educationLevelId: '',
        academicGradeId: '',
        professionId: '',
        professionConditionId: '',
        specialty: '',
        colegiatura: '',
        colegiaturaNumber: '',
        origin: '',
    });

    useEffect(() => {
        if (!open) return;
        setForm({
            educationLevelId: String(empleado.educationLevelId ?? ''),
            academicGradeId: String(empleado.academicGradeId ?? ''),
            professionId: String(empleado.professionId ?? ''),
            professionConditionId: String(empleado.professionConditionId ?? ''),
            specialty: empleado.specialty ?? '',
            colegiatura: (empleado as any).colegiatura ?? '',
            colegiaturaNumber: empleado.colegiaturaNumber ?? '',
            origin: (empleado as any).origin ?? '',
        });
        Promise.all([
            commonService.getEducationLevels(),
            commonService.getEducationGrade(),
            commonService.getProfessions(),
            commonService.getConditionProfession(),
        ]).then(([el, gr, pr, pc]) => {
            if (el.success) setEducationOpts(el.data.map((d: any) => ({ value: String(d.education_level_id), label: d.name })));
            if (gr.success) setGradeOpts(gr.data.map((d: any) => ({ value: String(d.grade_academic_id), label: d.name })));
            if (pr.success) setProfessionOpts(pr.data.map((d: any) => ({ value: String(d.profession_id), label: d.description })));
            if (pc.success) setProfConditionOpts(pc.data.map((d: any) => ({ value: String(d.condicion_profesion_id), label: d.name })));
        });
    }, [open, empleado]);

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(p => ({ ...p, [k]: e.target.value }));

    return (
        <ModalWrapper open={open} onClose={onClose} title="Editar Formación Profesional"
            onSave={() => submit(form)} saving={saving}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Select label="Nivel Educativo" name="educationLevelId" value={form.educationLevelId}
                    onChange={set('educationLevelId')} options={educationOpts} variant="custom" />
                <Select label="Grado Académico" name="academicGradeId" value={form.academicGradeId}
                    onChange={set('academicGradeId')} options={gradeOpts} variant="custom" />
                <Select label="Profesión" name="professionId" value={form.professionId}
                    onChange={set('professionId')} options={professionOpts} variant="custom" />
                <Select label="Condición Profesional" name="professionConditionId" value={form.professionConditionId}
                    onChange={set('professionConditionId')} options={profConditionOpts} variant="custom" />
                <InputText label="Especialidad" name="specialty" value={form.specialty} onChange={set('specialty')} />
                <InputText label="Colegiatura (Ej: CMP, CPP)" name="colegiatura" value={form.colegiatura} onChange={set('colegiatura')} />
                <InputText label="N° de Colegiatura" name="colegiaturaNumber" value={form.colegiaturaNumber} onChange={set('colegiaturaNumber')} />
                <InputText label="Procedencia / Origen de Formación" name="origin" value={form.origin} onChange={set('origin')} />
            </div>
        </ModalWrapper>
    );
}

// ─── 4. EditLaborModal ───────────────────────────────────────────────────────

export function EditLaborModal({ open, onClose, empleado, onSaved }: ModalProps) {
    const { saving, submit } = useSubmit(empleado.employee_id, onSaved);
    const [regimeOpts, setRegimeOpts] = useState<{ value: string; label: string }[]>([]);
    const [conditionOpts, setConditionOpts] = useState<{ value: string; label: string }[]>([]);
    const [form, setForm] = useState({
        laborRegimeId: '',
        laborConditionId: '',
        functionalPosition: '',
        levelPosition: '',
        hireDate: '',
        appointmentDate: '',
        lowDate: '',
        airhspPlazaCode: '',
        salary: '',
        occupationalGroup: '',
        personnelType: '',
        isEnabled: true,
    });

    useEffect(() => {
        if (!open) return;
        setForm({
            laborRegimeId: String(empleado.laborRegimeId ?? ''),
            laborConditionId: String(empleado.laborConditionId ?? ''),
            functionalPosition: empleado.functionalPosition ?? '',
            levelPosition: (empleado as any).levelPosition ?? '',
            hireDate: empleado.hireDate ?? '',
            appointmentDate: (empleado as any).appointmentDate ?? '',
            lowDate: (empleado as any).lowDate ?? '',
            airhspPlazaCode: empleado.airhspPlazaCode ?? '',
            salary: String((empleado as any).salary ?? ''),
            occupationalGroup: empleado.occupationalGroup ?? '',
            personnelType: empleado.personnelType ?? '',
            isEnabled: empleado.isEnabled,
        });
        Promise.all([commonService.getLaboralRegimes(), commonService.getConditionLaboral()]).then(([rr, cc]) => {
            if (rr.success) setRegimeOpts(rr.data.map((d: any) => ({ value: String(d.laboral_regime_id), label: d.name })));
            if (cc.success) setConditionOpts(cc.data.map((d: any) => ({ value: String(d.condicion_laboral_id), label: d.name })));
        });
    }, [open, empleado]);

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(p => ({ ...p, [k]: e.target.value }));

    const occupationalOpts = [
        { value: 'PROFESIONAL', label: 'PROFESIONAL' },
        { value: 'TECNICO', label: 'TÉCNICO' },
        { value: 'AUXILIAR', label: 'AUXILIAR' },
    ];

    const personnelOpts = [
        { value: 'ADMINISTRATIVO', label: 'ADMINISTRATIVO' },
        { value: 'ASISTENCIAL', label: 'ASISTENCIAL' },
        { value: 'HÍBRIDO', label: 'HÍBRIDO' },
    ];

    return (
        <ModalWrapper open={open} onClose={onClose} title="Editar Situación Laboral"
            onSave={() => submit(form)} saving={saving}>
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Select label="Régimen Laboral" name="laborRegimeId" value={form.laborRegimeId}
                        onChange={set('laborRegimeId')} options={regimeOpts} variant="custom" />
                    <Select label="Condición Laboral" name="laborConditionId" value={form.laborConditionId}
                        onChange={set('laborConditionId')} options={conditionOpts} variant="custom" />
                    <InputText label="Cargo Funcional" name="functionalPosition" value={form.functionalPosition} onChange={set('functionalPosition')} />
                    <InputText label="Nivel de Cargo" name="levelPosition" value={form.levelPosition} onChange={set('levelPosition')} />
                    <InputText label="Código Plaza AIRHSP" name="airhspPlazaCode" value={form.airhspPlazaCode} onChange={set('airhspPlazaCode')} />
                    <Select label="Grupo Ocupacional" name="occupationalGroup" value={form.occupationalGroup}
                        onChange={set('occupationalGroup')} options={occupationalOpts} variant="custom" />
                    <Select label="Tipo de Personal" name="personnelType" value={form.personnelType}
                        onChange={set('personnelType')} options={personnelOpts} variant="custom" />
                    <InputText label="Remuneración (S/)" name="salary" type="number" value={form.salary} onChange={set('salary')} />
                </div>
                <div>
                    <SectionLabel>Fechas</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <InputText label="Fecha de Ingreso" name="hireDate" type="date" value={form.hireDate} onChange={set('hireDate')} />
                        <InputText label="Fecha de Nombramiento" name="appointmentDate" type="date" value={form.appointmentDate} onChange={set('appointmentDate')} />
                        <InputText label="Fecha de Baja" name="lowDate" type="date" value={form.lowDate} onChange={set('lowDate')} />
                    </div>
                </div>
                <Checkbox name="isEnabled" label="Empleado activo (habilitar / deshabilitar)"
                    checked={form.isEnabled} onChange={e => setForm(p => ({ ...p, isEnabled: e.target.checked }))} />
            </div>
        </ModalWrapper>
    );
}

// ─── 5. EditOrganizationalModal ──────────────────────────────────────────────

export function EditOrganizationalModal({ open, onClose, empleado, onSaved }: ModalProps) {
    const { saving, submit } = useSubmit(empleado.employee_id, onSaved);
    const [establishmentOpts, setEstablishmentOpts] = useState<{ value: string; label: string }[]>([]);
    const [oficinaOpts, setOficinaOpts] = useState<{ value: string; label: string }[]>([]);
    const [form, setForm] = useState({
        codigoUnico: '',
        oficinaDireccionId: '',
        isEstablishmentHead: false,
        isServiceHead: false,
        isMicroredHead: false,
        isRedHead: false,
        consultoryNumber: ''
    });

    useEffect(() => {
        if (!open) return;
        setForm({
            codigoUnico: empleado.codigoUnico ?? '',
            oficinaDireccionId: String(empleado.oficinaDireccionId ?? ''),
            isEstablishmentHead: empleado.isEstablishmentHead ?? false,
            isServiceHead: empleado.isServiceHead ?? false,
            isMicroredHead: (empleado as any).isMicroredHead ?? false,
            isRedHead: (empleado as any).isRedHead ?? false,
            consultoryNumber: empleado.consultoryNumber ?? '',
        });
        Promise.all([hierarchyService.getEstablecimientosByRed('01'), commonService.getOficinasDirecciones()]).then(([estData, of]) => {
            setEstablishmentOpts(estData.map(e => ({ value: e.codigo_unico, label: `${e.nombre_establecimiento} (${e.codigo_unico})` })));
            if (of.success) setOficinaOpts(of.data.map((o: any) => ({ value: String(o.oficina_direccion_id), label: o.name })));
        });
    }, [open, empleado]);

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(p => ({ ...p, [k]: e.target.value }));

    const setCheck = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(p => ({ ...p, [k]: e.target.checked }));

    return (
        <ModalWrapper open={open} onClose={onClose} title="Editar Asignación Organizacional"
            onSave={() => submit(form)} saving={saving}>
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-5">
                    <Select label="Establecimiento de Trabajo" name="codigoUnico" value={form.codigoUnico}
                        onChange={set('codigoUnico')} options={establishmentOpts} variant="custom" />
                    <Select label="Oficina / Unidad Orgánica" name="oficinaDireccionId" value={form.oficinaDireccionId}
                        onChange={set('oficinaDireccionId')} options={oficinaOpts} variant="custom" />
                    <InputText label="N° Consultorio" name="consultoryNumber" value={form.consultoryNumber} onChange={set('consultoryNumber')} />
                </div>
                <div>
                    <SectionLabel>Jefaturas</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Checkbox name="isEstablishmentHead" label="Jefe de Establecimiento" checked={form.isEstablishmentHead} onChange={setCheck('isEstablishmentHead')} />
                        <Checkbox name="isServiceHead" label="Jefe de Servicio" checked={form.isServiceHead} onChange={setCheck('isServiceHead')} />
                        <Checkbox name="isMicroredHead" label="Jefe de Microred" checked={form.isMicroredHead} onChange={setCheck('isMicroredHead')} />
                        <Checkbox name="isRedHead" label="Jefe de Red" checked={form.isRedHead} onChange={setCheck('isRedHead')} />
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
}
