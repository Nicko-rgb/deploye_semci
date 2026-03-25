import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBackToApp } from '../../../core/hooks/useBackToApp';

// Definición de tipos para los items
interface MenuItem {
  id: string;
  label: string;
  ruta: string;
  icon: React.ReactElement;
  secondary: boolean;
  data_secondary?: SubMenuItem[];
}

interface SubMenuItem {
  id: string;
  label: string;
  ruta: string;
  icon: React.ReactElement;
  allowNominalData?: boolean; // Nueva propiedad para controlar datos nominales
}

interface DashboardItem {
  id: string;
  label: string;
  route: string;
  icon: React.ReactElement;
  section: string;
}

// Items disponibles para el menú
const availableMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    ruta: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0a2 2 0 002-2V7a2 2 0 00-.59-1.41l-7-7a2 2 0 00-2.82 0l-7 7A2 2 0 003 7v11a2 2 0 002 2h3" />
      </svg>
    ),
    secondary: false,
  },
  {
    id: 'consultas',
    label: 'Consultas',
    ruta: '',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    ),
    secondary: true,
    data_secondary: [
      {
        id: 'his',
        label: 'His',
        ruta: '/dashboard/his',
        icon: (
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
            <path d="M12 14v4" />
            <circle cx="12" cy="14" r="2" />
          </svg>
        ),
      },
      {
        id: 'seguimiento',
        label: 'Seguimiento',
        ruta: '/dashboard/seguimiento',
        icon: (
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
        ),
        allowNominalData: true, // Habilitado por defecto
      },
    ],
  },
  {
    id: 'repositorio',
    label: 'Repositorio',
    ruta: '/dashboard/repositorio',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 12l2 2 4-4" />
      </svg>
    ),
    secondary: false,
  },
  {
    id: 'calidad',
    label: 'Calidad',
    ruta: '/home/calidad',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    secondary: false,
    data_secondary: [],
  },
  {
    id: 'epidemiologia',
    label: 'Epidemiología',
    ruta: '/home/epidemiologia',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    secondary: false,
    data_secondary: [],
  },
  {
    id: 'sis',
    label: 'SIS',
    ruta: '/home/sis',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    secondary: false,
    data_secondary: [],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    ruta: '',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    secondary: true,
    data_secondary: [
      {
        id: 'reportes-operacionales',
        label: 'Operacionales',
        ruta: '/home/reportes/operacionales',
        icon: (
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        id: 'reportes-generales',
        label: 'Generales',
        ruta: '/home/reportes/generales',
        icon: (
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
          </svg>
        ),
      },
      {
        id: 'reportes-referencia',
        label: 'Referencias',
        ruta: '/home/reportes/referencias',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v12a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        id: 'reportes-produccion',
        label: 'Produccion',
        ruta: '/home/reportes/produccion',
        icon: (
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ),
        allowNominalData: true,
      },
    ],
  },
  {
    id: 'indicadores',
    label: 'Indicadores',
    ruta: '',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    secondary: true,
    data_secondary: [
      {
        id: 'indicadores-fed',
        label: 'FED',
        ruta: '/home/indicadores/fed',
        icon: (
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        id: 'indicadores-gestion',
        label: 'Gestión',
        ruta: '/home/indicadores/gestion',
        icon: (
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
      {
        id: 'indicadores-salud-mental',
        label: 'Gestión',
        ruta: '/home/indicadores/salud-mental',
        icon: (
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
    ],
  },
  {
    id: 'user-settings',
    label: 'Configuración',
    ruta: '/home/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
    ),
    secondary: true,
    data_secondary: [
      {
        id: 'usuarios',
        label: 'Usuarios',
        ruta: '/home/settings/usuarios',
        icon: (
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" />
          </svg>
        ),
      },
      {
        id: 'importar',
        label: 'Importar Archivos',
        ruta: '/home/settings/importar',
        icon: (
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        ),
      },
      {
        id: 'importar-informes',
        label: 'Importar Informes',
        ruta: '/home/settings/importar-informes',
        icon: (
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        id: 'digitador',
        label: 'Digitador',
        ruta: '/home/settings/digitador',
        icon: (
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        ),
      },
      {
        id: 'procesar',
        label: 'Procesar',
        ruta: '/home/settings/procesar',
        icon: (
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        ),
      },
    ],
  },
];

// Items disponibles para el dashboard
const availableDashboardItems: DashboardItem[] = [
  {
    id: 'adolecentes',
    label: 'ADOLECENTE',
    route: '/adolecentes',
    section: 'ACCESO A CAMPAÑAS',
    icon: (
      <svg className="w-10 h-10 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="M12 14v4" />
        <circle cx="12" cy="14" r="2" />
      </svg>
    ),
  },
  {
    id: 'his-digital',
    label: 'HIS DIGITAL',
    route: '/his',
    section: 'ACCESO A CONSULTA',
    icon: (
      <svg className="w-10 h-10 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="M12 14v4" />
        <circle cx="12" cy="14" r="2" />
      </svg>
    ),
  },
  {
    id: 'padron-nominal',
    label: 'PADRON NOMINAL',
    route: '/padron',
    section: 'ACCESO A CONSULTA',
    icon: (
      <svg className="w-10 h-10 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" />
      </svg>
    ),
  },
  {
    id: 'seguimientos',
    label: 'SEGUIMIENTOS',
    route: '/seguimientos',
    section: 'ACCESO A CONSULTA',
    icon: (
      <svg className="w-10 h-10 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    id: 'cnv',
    label: 'CNV',
    route: '/cnv',
    section: 'ACCESO A CONSULTA',
    icon: (
      <svg className="w-10 h-10 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M8 2v4M16 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    id: 'paciente-vacunado',
    label: 'PACIENTE VACUNADO',
    route: '/vacunado',
    section: 'ACCESO A CONSULTA',
    icon: (
      <svg className="w-10 h-10 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
   {
    id: 'personal-salud',
    label: 'PERSONAL DE SALUD',
    route: '/home/consultas/personal-salud',
    section: 'ACCESO A CONSULTA',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    id: 'establecimientos',
    label: 'ESTABLECIMIENTOS',
    route: '/home/consultas/establecimientos',
    section: 'ACCESO A CONSULTA',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
      </svg>
    ),
  },
  {
    id: 'calidad',
    label: 'CALIDAD',
    route: '/calidad',
    section: 'ACCESO A CONSULTAS',
    icon: (
      <svg className="w-10 h-10 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'mapas-seguimiento',
    label: 'MAPAS - SEGUIMIENTO',
    route: '/mapas',
    section: 'ACCESO A CONSULTA',
    icon: (
      <svg className="w-10 h-10 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    id: 'epidemiologia',
    label: 'EPIDEMIOLOGÍA',
    route: '/home/epidemiologia',
    section: 'ACCESO A EPIDEMIOLOGÍA',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'reportes-operacionales',
    label: 'Operacionales',
    route: '/reportes',
    section: 'ACCESO A REPORTES',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'reportes-generales',
    label: 'Generales',
    route: '/reportes',
    section: 'ACCESO A REPORTES',
    icon: (
      <svg className="w-10 h-10 " fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
  },
  {
    id: 'reportes-referencias',
    label: 'Referencia',
    route: '/home/reportes/referencias',
    section: 'ACCESO A REPORTES',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v12a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'reportes-produccion',
    label: 'Produccion',
    route: '/reportes',
    section: 'ACCESO A REPORTES',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    id: 'indicadores-fed',
    label: 'Indicadores FED',
    route: '/fed',
    section: 'ACCESO A INDICADORES',
    icon: (
      <svg className="w-10 h-10 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 20v-6" />
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8" />
      </svg>
    ),
  },
  {
    id: 'indicadores-gestion',
    label: 'Indicadores GESTION',
    route: '/gestion',
    section: 'ACCESO A INDICADORES',
    icon: (
      <svg className="w-10 h-10 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    id: 'indicadores-salud-mental',
    label: 'SALUD MENTAL',
    route: '/salud-mental',
    section: 'ACCESO A INDICADORES',
    icon: (
      <svg className="w-10 h-10 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    id: 'indicadores-sis',
    label: 'Indicadores SIS',
    route: '/sis',
    section: 'ACCESO A INDICADORES',
    icon: (
      <svg className="w-10 h-10 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8" />
      </svg>
    ),
  },
  {
    id: 'user-settings',
    label: 'CONFIGURACIÓN',
    route: '/dashboard/settings',
    section: 'ACCESO A CONFIGURACIÓN',
    icon: (
      <svg className="w-10 h-10 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
  
];

export default function UserSettings() {
  const backLink = useBackToApp();
  const navigate = useNavigate();
  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);
  const [selectedDashboardItems, setSelectedDashboardItems] = useState<string[]>([]);
  const [modulePermissions, setModulePermissions] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'menu' | 'dashboard'>('menu');

  // Cargar configuración guardada al montar el componente
  useEffect(() => {
    const savedMenuItems = localStorage.getItem('userMenuItems');
    const savedDashboardItems = localStorage.getItem('userDashboardItems');
    const savedModulePermissions = localStorage.getItem('modulePermissions');

    if (savedMenuItems) {
      setSelectedMenuItems(JSON.parse(savedMenuItems));
    } else {
      // Por defecto, seleccionar todos los items
      setSelectedMenuItems(availableMenuItems.map(item => item.id));
    }

    if (savedDashboardItems) {
      setSelectedDashboardItems(JSON.parse(savedDashboardItems));
    } else {
      // Por defecto, seleccionar todos los items
      setSelectedDashboardItems(availableDashboardItems.map(item => item.id));
    }

    if (savedModulePermissions) {
      setModulePermissions(JSON.parse(savedModulePermissions));
    } else {
      // Por defecto, permitir datos nominales para seguimiento
      setModulePermissions({ 'seguimiento': true });
    }
  }, []);

  const handleMenuItemToggle = (itemId: string) => {
    setSelectedMenuItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleDashboardItemToggle = (itemId: string) => {
    setSelectedDashboardItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleNominalDataToggle = (moduleId: string) => {
    setModulePermissions(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleSave = () => {
    localStorage.setItem('userMenuItems', JSON.stringify(selectedMenuItems));
    localStorage.setItem('userDashboardItems', JSON.stringify(selectedDashboardItems));
    localStorage.setItem('modulePermissions', JSON.stringify(modulePermissions));

    // Mostrar mensaje de éxito
    alert('Configuración guardada exitosamente');

    // Redirigir al dashboard
    navigate('/dashboard');
  };

  const handleSelectAll = (type: 'menu' | 'dashboard') => {
    if (type === 'menu') {
      setSelectedMenuItems(availableMenuItems.map(item => item.id));
    } else {
      setSelectedDashboardItems(availableDashboardItems.map(item => item.id));
    }
  };

  const handleDeselectAll = (type: 'menu' | 'dashboard') => {
    if (type === 'menu') {
      setSelectedMenuItems([]);
    } else {
      setSelectedDashboardItems([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex justify-center items-center gap-80">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Configuración de Usuario
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Selecciona qué elementos quieres mostrar en tu menú y dashboard
          </p>
        </div>
        {/* Botón de inicio, se empuja al lado derecho */}
        <div>
          <Link to={backLink} className="flex items-center justify-between text-white hover:text-gray-300 transition-colors duration-200">
            <svg className="w-12 h-12  dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" color='black'>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0a2 2 0 002-2V7a2 2 0 00-.59-1.41l-7-7a2 2 0 00-2.82 0l-7 7A2 2 0 003 7v11a2 2 0 002 2h3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('menu')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'menu'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              Menú de Navegación
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              Dashboard Home
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido de las tabs */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Elementos del Menú
            </h2>
            <div className="space-x-2">
              <button
                onClick={() => handleSelectAll('menu')}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Seleccionar Todo
              </button>
              <button
                onClick={() => handleDeselectAll('menu')}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Deseleccionar Todo
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {availableMenuItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <input
                  type="checkbox"
                  id={item.id}
                  checked={selectedMenuItems.includes(item.id)}
                  onChange={() => handleMenuItemToggle(item.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={item.id} className="ml-3 flex items-center flex-1 cursor-pointer">
                  <span className="text-gray-700 dark:text-gray-300 mr-2">{item.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                </label>
                {item.secondary && item.data_secondary && (
                  <div className="ml-8 space-y-3">
                    {item.data_secondary.map((subItem) => (
                      <div key={subItem.id} className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={subItem.id}
                            checked={selectedMenuItems.includes(subItem.id)}
                            onChange={() => handleMenuItemToggle(subItem.id)}
                            className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={subItem.id} className="ml-2 flex items-center cursor-pointer">
                            <span className="text-gray-600 dark:text-gray-400 mr-1">{subItem.icon}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{subItem.label}</span>
                          </label>
                        </div>

                        {/* Control específico para datos nominales en seguimiento */}
                        {subItem.id === 'seguimiento' && subItem.allowNominalData && selectedMenuItems.includes(subItem.id) && (
                          <div className="ml-5 pl-4 border-l-2 border-blue-200 dark:border-blue-700">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`${subItem.id}-nominal`}
                                checked={modulePermissions[subItem.id] || false}
                                onChange={() => handleNominalDataToggle(subItem.id)}
                                className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor={`${subItem.id}-nominal`}
                                className="text-xs text-green-700 dark:text-green-400 cursor-pointer flex items-center"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Permitir mostrar datos nominales
                              </label>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-5">
                              Habilita la visualización de información personal de pacientes
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Elementos del Dashboard
            </h2>
            <div className="space-x-2">
              <button
                onClick={() => handleSelectAll('dashboard')}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Seleccionar Todo
              </button>
              <button
                onClick={() => handleDeselectAll('dashboard')}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Deseleccionar Todo
              </button>
            </div>
          </div>

          {/* Agrupar por secciones */}
          {['ACCESO A CAMPAÑAS', 'ACCESO A CONSULTA', 'ACCESO A REPORTES', 'ACCESO A EPIDEMIOLOGÍA', 'ACCESO A INDICADORES', 'ACCESO A CONFIGURACIÓN'].map((section) => (
            <div key={section} className="space-y-4">
              <h3 className="text-lg font-medium text-white bg-blue-600 px-4 py-2 rounded-t-md">
                {section}
              </h3>
              <div className="grid gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-b-md">
                {availableDashboardItems
                  .filter(item => item.section === section)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <input
                        type="checkbox"
                        id={item.id}
                        checked={selectedDashboardItems.includes(item.id)}
                        onChange={() => handleDashboardItemToggle(item.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={item.id} className="ml-3 flex items-center flex-1 cursor-pointer">
                        <span className="text-gray-700 dark:text-gray-300 mr-2">{item.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
                      </label>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botones de acción */}
      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Guardar Configuración
        </button>
      </div>
    </div>
  );
} 