import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { employeeService } from '../services/employeeService';
import { commonService } from '../services/commonService';
import hierarchyService from '../../../core/services/hierarchyService';
import type { 
    EmployeeFormData, 
    UbigeoItem, 
    DocumentTypeItem, 
    ProfessionItem, 
    EstablishmentItem,
    EducationLevelItem,
    GradeAcademicItem,
    CondicionProfesionItem,
    LaboralRegimeItem,
    CondicionLaboralItem,
    OficinaDireccionItem
} from '../types';

export const useNewEmployee = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState<EmployeeFormData>({
        firstName: '',
        lastNamePaternal: '',
        lastNameMaternal: '',
        documentTypeId: '',
        documentNumber: '',
        email: '',
        phone: '',
        birthDate: '',
        gender: '',
        // Ubigeo
        idUbigueoReniec: '',
        address: '',
        ubigeo_departamento: '',
        ubigeo_provincia: '',
        ubigeo_distrito: '',
        // Formación
        educationLevelId: '',
        academicGradeId: '',
        professionId: '',
        professionConditionId: '',
        specialty: '',
        colegiaturaNumber: '',
        // Laboral
        origin: '',
        laborRegimeId: '',
        laborConditionId: '',
        functionalPosition: '',
        hireDate: '',
        airhspPlazaCode: '',
        oficinaDireccionId: '',
        occupationalGroup: '',
        personnelType: '',
        // Establecimiento
        codigoUnico: '',
        isEstablishmentHead: false,
        // Estado
        isEnabled: true
    });

    const [loading, setLoading] = useState(isEdit);
    const [departamentosUbigeo, setDepartamentosUbigeo] = useState<UbigeoItem[]>([]);
    const [provinciasFiltradas, setProvinciasFiltradas] = useState<UbigeoItem[]>([]);
    const [distritosFiltrados, setDistritosFiltrados] = useState<UbigeoItem[]>([]);
    const [documentTypes, setDocumentTypes] = useState<DocumentTypeItem[]>([]);
    const [educationLevels, setEducationLevels] = useState<EducationLevelItem[]>([]);
    const [educationGrades, setEducationGrades] = useState<GradeAcademicItem[]>([]);
    const [professions, setProfessions] = useState<ProfessionItem[]>([]);
    const [conditionProfessions, setConditionProfessions] = useState<CondicionProfesionItem[]>([]);
    const [establishments, setEstablishments] = useState<EstablishmentItem[]>([]);
    const [laboralRegimes, setLaboralRegimes] = useState<LaboralRegimeItem[]>([]);
    const [conditionLaboral, setConditionLaboral] = useState<CondicionLaboralItem[]>([]);
    const [oficinasDirecciones, setOficinasDirecciones] = useState<OficinaDireccionItem[]>([]);

    useEffect(() => {
        const initData = async () => {
            setLoading(true);
            try {
                const [
                    responseDeps, 
                    responseDocs, 
                    responseEdu, 
                    responseGrades, 
                    responseProf, 
                    responseConditionProf, 
                    responseEst, 
                    responseLaboralRegimes, 
                    responseConditionLaboral, 
                    responseOficinas
                ] = await Promise.all([
                    commonService.getDepartments(),
                    commonService.getDocumentTypes(),
                    commonService.getEducationLevels(),
                    commonService.getEducationGrade(),
                    commonService.getProfessions(),
                    commonService.getConditionProfession(),
                    hierarchyService.getEstablecimientosByRed('01'),
                    commonService.getLaboralRegimes(),
                    commonService.getConditionLaboral(),
                    commonService.getOficinasDirecciones()
                ]);
                setDepartamentosUbigeo(responseDeps.success ? responseDeps.data : []);
                setDocumentTypes(responseDocs.success ? responseDocs.data : []);
                setEducationLevels(responseEdu.success ? responseEdu.data : []);
                setEducationGrades(responseGrades.success ? responseGrades.data : []);
                setProfessions(responseProf.success ? responseProf.data : []);
                setConditionProfessions(responseConditionProf.success ? responseConditionProf.data : []);
                setEstablishments((responseEst as any[]).map(e => ({
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
                })));
                setLaboralRegimes(responseLaboralRegimes.success ? responseLaboralRegimes.data : []);
                setConditionLaboral(responseConditionLaboral.success ? responseConditionLaboral.data : []);
                setOficinasDirecciones(responseOficinas.success ? responseOficinas.data : []);

                if (isEdit && id) {
                    const response = await employeeService.getEmployee(id);
                    if (response.success) {
                        const employeeData = response.data;
                        
                        // Extraer ubigeo si existe idUbigueoReniec (formato: DDPRDI)
                        let ubigeo_dep = '';
                        let ubigeo_prov = '';
                        let ubigeo_dist = '';
                        
                        if (employeeData.idUbigueoReniec && employeeData.idUbigueoReniec.length === 6) {
                            ubigeo_dep = employeeData.idUbigueoReniec.substring(0, 2);
                            ubigeo_prov = employeeData.idUbigueoReniec.substring(0, 4);
                            ubigeo_dist = employeeData.idUbigueoReniec;
                        }

                        setFormData({
                            firstName: employeeData.firstName,
                            lastNamePaternal: employeeData.lastNamePaternal,
                            lastNameMaternal: employeeData.lastNameMaternal,
                            documentTypeId: employeeData.documentTypeId,
                            documentNumber: employeeData.documentNumber,
                            email: employeeData.email,
                            phone: employeeData.phone || '',
                            birthDate: employeeData.birthDate,
                            gender: employeeData.gender,
                            photoUrl: employeeData.photoUrl,
                            
                            emergencyContact: employeeData.emergencyContact,
                            emergencyPhone: employeeData.emergencyPhone,
                            healthCondition: employeeData.healthCondition,

                            // Ubigeo
                            idUbigueoReniec: employeeData.idUbigueoReniec,
                            address: employeeData.address || '',
                            ubigeo_departamento: ubigeo_dep,
                            ubigeo_provincia: ubigeo_prov,
                            ubigeo_distrito: ubigeo_dist,

                            // Formación
                            educationLevelId: employeeData.educationLevelId,
                            academicGradeId: employeeData.academicGradeId,
                            professionId: employeeData.professionId,
                            professionConditionId: employeeData.professionConditionId,
                            specialty: employeeData.specialty || '',
                            colegiaturaNumber: employeeData.colegiaturaNumber || '',

                            // Laboral
                            origin: employeeData.origin || '',
                            laborRegimeId: employeeData.laborRegimeId,
                            laborConditionId: employeeData.laborConditionId,
                            functionalPosition: employeeData.functionalPosition || '',
                            hireDate: employeeData.hireDate,
                            airhspPlazaCode: employeeData.airhspPlazaCode || '',
                            oficinaDireccionId: employeeData.oficinaDireccionId,
                            occupationalGroup: employeeData.occupationalGroup,
                            personnelType: employeeData.personnelType,

                            // Establecimiento
                            codigoUnico: employeeData.codigoUnico,
                            isEstablishmentHead: employeeData.isEstablishmentHead,

                            // Estado
                            isEnabled: employeeData.isEnabled
                        });
                        
                        if (ubigeo_dep) {
                            const respProvs = await commonService.getProvinces(ubigeo_dep);
                            setProvinciasFiltradas(respProvs.success ? respProvs.data : []);
                        }
                        
                        if (ubigeo_dep && ubigeo_prov) {
                            const respDists = await commonService.getDistricts(ubigeo_dep, ubigeo_prov);
                            setDistritosFiltrados(respDists.success ? respDists.data : []);
                        }
                    }
                }
            } catch (error) {
                console.error('Error inicializando datos:', error);
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, [isEdit, id]);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const isChecked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: isChecked }));
            return;
        }
        
        // Actualizar el valor actual
        setFormData(prev => ({ ...prev, [name]: value }));

        // Lógica de carga asíncrona para Ubigeo
        if (name === 'ubigeo_departamento') {
            setProvinciasFiltradas([]);
            setDistritosFiltrados([]);
            setFormData(prev => ({ 
                ...prev, 
                ubigeo_departamento: value,
                ubigeo_provincia: '', 
                ubigeo_distrito: '',
                idUbigueoReniec: ''
            }));

            if (value) {
                try {
                    const resp = await commonService.getProvinces(value);
                    if (resp.success) setProvinciasFiltradas(resp.data);
                } catch (error) {
                    console.error('Error cargando provincias:', error);
                }
            }
        } else if (name === 'ubigeo_provincia') {
            setDistritosFiltrados([]);
            setFormData(prev => ({ 
                ...prev, 
                ubigeo_provincia: value,
                ubigeo_distrito: '',
                idUbigueoReniec: ''
            }));

            if (value && formData.ubigeo_departamento) {
                try {
                    const resp = await commonService.getDistricts(formData.ubigeo_departamento, value);
                    if (resp.success) setDistritosFiltrados(resp.data);
                } catch (error) {
                    console.error('Error cargando distritos:', error);
                }
            }
        } else if (name === 'ubigeo_distrito') {
            setFormData(prev => ({ 
                ...prev, 
                ubigeo_distrito: value,
                idUbigueoReniec: value // El distrito es el ubigeo completo de 6 dígitos
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Mostrar cargando
        Swal.fire({
            title: isEdit ? 'Actualizando empleado...' : 'Registrando empleado...',
            text: 'Por favor espere',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // Limpiar campos temporales de ubigeo antes de enviar
            const { ubigeo_departamento, ubigeo_provincia, ubigeo_distrito, ...dataToSave } = formData;
            
            // Convertir strings vacíos a null para campos opcionales o que el backend espera como null
            const cleanedData = Object.fromEntries(
                Object.entries(dataToSave).map(([key, value]) => [
                    key, 
                    value === '' ? null : value
                ])
            );
            
            const response = isEdit && id
                ? await employeeService.updateEmployee(id, cleanedData)
                : await employeeService.saveEmployee(cleanedData);

            if (response.success) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: response.message || (isEdit ? 'Empleado actualizado correctamente' : 'Empleado registrado correctamente'),
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/home/rrhh/employees');
            } else {
                throw new Error(response.message || 'Error al procesar la solicitud');
            }
        } catch (error: any) {
            console.error('Error al procesar empleado:', error);
            
            const errorMessage = error.response?.data?.message || error.message || 'Ocurrió un error inesperado';
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonColor: '#3085d6'
            });
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return {
        formData,
        loading,
        isEdit,
        provinciasFiltradas,
        distritosFiltrados,
        departamentosUbigeo,
        documentTypes,
        educationLevels,
        educationGrades,
        professions,
        conditionProfessions,
        establishments,
        laboralRegimes,
        conditionLaboral,
        oficinasDirecciones,
        handleChange,
        handleSubmit,
        handleBack
    };
};
