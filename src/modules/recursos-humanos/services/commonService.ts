import { apiService } from '../../../core/services/apiService';
import type {
    UbigeoItem,
    DocumentTypeItem,
    UbigeoApiResponse,
    ProfessionItem,
    EducationLevelItem,
    GradeAcademicItem,
    CondicionProfesionItem,
    LaboralRegimeItem,
    CondicionLaboralItem,
    OficinaDireccionItem
} from '../types';

class CommonService {
    // --- UBIGEO ---
    // Obtener todos los departamentos
    async getDepartments(): Promise<UbigeoApiResponse<UbigeoItem>> {
        return await apiService.get<UbigeoApiResponse<UbigeoItem>>('/catalogs/ubigeos/departments');
    }

    // Obtener provincias por departamento
    async getProvinces(deptId: string): Promise<UbigeoApiResponse<UbigeoItem>> {
        return await apiService.get<UbigeoApiResponse<UbigeoItem>>(`/catalogs/ubigeos/departments/${deptId}/provinces`);
    }

    // Obtener distritos por departamento y provincia
    async getDistricts(deptId: string, provId: string): Promise<UbigeoApiResponse<UbigeoItem>> {
        return await apiService.get<UbigeoApiResponse<UbigeoItem>>(`/catalogs/ubigeos/departments/${deptId}/provinces/${provId}/districts`);
    }

    // --- DOCUMENTOS ---
    // Obtener tipos de documentos de identidad
    async getDocumentTypes(): Promise<UbigeoApiResponse<DocumentTypeItem>> {
        return await apiService.get<UbigeoApiResponse<DocumentTypeItem>>('/catalogs/document-types');
    }

    // --- EDUCACIÓN ---
    // Obtener niveles educativos
    async getEducationLevels(): Promise<UbigeoApiResponse<EducationLevelItem>> {
        return await apiService.get<UbigeoApiResponse<EducationLevelItem>>('/catalogs/education-levels');
    }
    // Obtener grados académicos
    async getEducationGrade(): Promise<UbigeoApiResponse<GradeAcademicItem>> {
        return await apiService.get<UbigeoApiResponse<GradeAcademicItem>>('/catalogs/grade-academics');
    }

    // --- PROFESIONES ---
    // Obtener profesiones
    async getProfessions(): Promise<UbigeoApiResponse<ProfessionItem>> {
        return await apiService.get<UbigeoApiResponse<ProfessionItem>>('/catalogs/professions');
    }
    // Condicion de profesiones
    async getConditionProfession(): Promise<UbigeoApiResponse<CondicionProfesionItem>> {
        return await apiService.get<UbigeoApiResponse<CondicionProfesionItem>>('/catalogs/professions/conditions');
    }

    // --- OFICINAS / DIRECCIONES ---
    // Obtener oficinas y direcciones
    async getOficinasDirecciones(): Promise<UbigeoApiResponse<OficinaDireccionItem>> {
        const data = await apiService.get<UbigeoApiResponse<OficinaDireccionItem>>('/catalogs/oficinas-direcciones');
        return data;
    }

    // --- OTROS ---
    // Obtener provincias filtradas por departamento
    async getLaboralRegimes(): Promise<UbigeoApiResponse<LaboralRegimeItem>> {
        return await apiService.get<UbigeoApiResponse<LaboralRegimeItem>>(`/catalogs/laboral-regimes`);
    }
    // Obtener condicion laboral
    async getConditionLaboral(): Promise<UbigeoApiResponse<CondicionLaboralItem>> {
        return await apiService.get<UbigeoApiResponse<CondicionLaboralItem>>(`/catalogs/laboral-conditions`);
    }
}

export const commonService = new CommonService();
