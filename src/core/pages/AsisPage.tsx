import React, { useState, useEffect } from "react";
import { mapaPucallpa, slider1, slider3, slider4, ninios, ninios2, atencion1, bote, octubre, cs_salud_mental, enfermera, santa_elena } from '../../assets/asis'
import logo from '../../assets/img/logo.png'
import { Link, useNavigate } from 'react-router-dom';

const heroImages = [
    ninios2,
    slider1,
    slider4,
];

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ViewPDFButtonProps {
    href: string;
    label?: string;
    fileName?: string;
}

// ─── Icono SVG del documento PDF ──────────────────────────────────────────────
function PDFDocIcon({ isHovered }: { isHovered: boolean }) {
    return (
        <svg
            viewBox="0 0 40 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`w-9 h-11 transition-transform duration-500 ease-out ${isHovered ? "-translate-y-1 rotate-1 drop-shadow-md" : "rotate-0"
                }`}
        >
            {/* Cuerpo */}
            <path
                d="M4 5C4 3.9 4.9 3 6 3H26L36 13V44C36 45.1 35.1 46 34 46H6C4.9 46 4 45.1 4 44V5Z"
                fill="white"
                stroke="#e2e8f0"
                strokeWidth="1.5"
                className="drop-shadow-sm"
            />
            {/* Esquina doblada */}
            <path
                d="M26 3L36 13H30C27.8 13 26 11.2 26 9V3Z"
                fill={isHovered ? "#dc2626" : "#fca5a5"}
                className="transition-colors duration-300"
            />
            {/* Badge PDF */}
            <rect
                x="7"
                y="22"
                width="26"
                height="11"
                rx="3"
                fill={isHovered ? "#dc2626" : "#ef4444"}
                className="transition-colors duration-300"
            />
            <text
                x="20"
                y="31"
                textAnchor="middle"
                fontFamily="monospace"
                fontSize="7.5"
                fontWeight="700"
                fill="white"
                letterSpacing="1"
            >
                PDF
            </text>
            {/* Líneas decorativas */}
            <rect
                x="8"
                y="36"
                width={isHovered ? "22" : "0"}
                height="2"
                rx="1"
                fill="#fca5a5"
                style={{ transition: "width 0.4s ease 0.1s" }}
            />
            <rect
                x="8"
                y="40"
                width={isHovered ? "16" : "0"}
                height="2"
                rx="1"
                fill="#fca5a5"
                style={{ transition: "width 0.4s ease 0.2s" }}
            />
            <rect
                x="8"
                y="16"
                width={isHovered ? "14" : "0"}
                height="2"
                rx="1"
                fill="#e2e8f0"
                style={{ transition: "width 0.3s ease 0s" }}
            />
        </svg>
    );
}

// ─── Icono Ojo ────────────────────────────────────────────────────────────────
function EyeIcon({ isHovered }: { isHovered: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-4 h-4 transition-all duration-300 ${isHovered ? "scale-110" : "scale-100"
                }`}
            style={{
                animation: isHovered ? "eyeBlink 2.5s ease-in-out infinite" : "none",
            }}
        >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

// ─── Flecha externa ───────────────────────────────────────────────────────────
function ExternalArrow({ isHovered }: { isHovered: boolean }) {
    return (
        <svg
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-3.5 h-3.5 transition-all duration-300 ${isHovered ? "translate-x-0.5 -translate-y-0.5 opacity-100" : "opacity-50"
                }`}
        >
            <path d="M1 13L13 1M13 1H6M13 1V8" />
        </svg>
    );
}

// ─── Partículas decorativas ───────────────────────────────────────────────────
function Particles({ isHovered }: { isHovered: boolean }) {
    const dots = [
        { top: "15%", left: "18%", delay: "0s", size: 3 },
        { top: "25%", left: "75%", delay: "0.1s", size: 4 },
        { top: "65%", left: "55%", delay: "0.15s", size: 3 },
        { top: "75%", left: "82%", delay: "0.05s", size: 2 },
        { top: "55%", left: "8%", delay: "0.2s", size: 3 },
    ];

    return (
        <>
            {dots.map((d, i) => (
                <span
                    key={i}
                    className="absolute rounded-full bg-red-400 pointer-events-none"
                    style={{
                        top: d.top,
                        left: d.left,
                        width: d.size,
                        height: d.size,
                        opacity: isHovered ? 0 : 0,
                        transform: isHovered ? "translateY(-28px) scale(0)" : "translateY(0) scale(1)",
                        transition: isHovered
                            ? `transform 0.7s ease ${d.delay}, opacity 0.7s ease ${d.delay}`
                            : "none",
                        animation: isHovered ? `particlePop 0.7s ease ${d.delay} forwards` : "none",
                    }}
                />
            ))}
        </>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────
function ViewPDFButton({
    href = "https://tu-link.pdf",
    label = "Ver archivo PDF",
    fileName = "Documento",
}: ViewPDFButtonProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    return (
        <>
            {/* Keyframes inyectados inline */}
            <style>{`
        @keyframes eyeBlink {
          0%, 88%, 100% { transform: scaleY(1) scale(1.1); }
          93%            { transform: scaleY(0.08) scale(1.1); }
        }
        @keyframes particlePop {
          0%   { transform: translateY(0) scale(1);   opacity: 0.7; }
          100% { transform: translateY(-30px) scale(0); opacity: 0; }
        }
        @keyframes ringPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.25); }
          50%       { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

            {/* Fondo de demostración */}
            <div className="bg-gradient-to-br from-slate-50 via-rose-50/30 to-orange-50/20 flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-8">

                    {/* ── BOTÓN PRINCIPAL ── */}
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
                        onMouseDown={() => setIsPressed(true)}
                        onMouseUp={() => setIsPressed(false)}
                        className={`
              relative inline-flex items-center gap-4
              bg-white border rounded-2xl px-6 py-4
              transition-all duration-300 ease-out
              cursor-pointer select-none overflow-hidden no-underline
              ${isHovered
                                ? "border-red-300 shadow-[0_8px_32px_rgba(239,68,68,0.18)]"
                                : "border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.07)]"}
              ${isPressed ? "scale-95" : "scale-100"}
            `}
                        style={{
                            animation: !isHovered ? "ringPulse 2.8s ease-in-out infinite" : "none",
                        }}
                    >
                        {/* Partículas */}
                        <Particles isHovered={isHovered} />

                        {/* Fondo shimmer en hover */}
                        <span
                            className="absolute inset-0 rounded-2xl pointer-events-none"
                            style={{
                                background: isHovered
                                    ? "linear-gradient(105deg, transparent 40%, rgba(254,226,226,0.5) 50%, transparent 60%)"
                                    : "none",
                                backgroundSize: "200% 100%",
                                animation: isHovered ? "shimmer 1.4s linear infinite" : "none",
                            }}
                        />

                        {/* Franja izquierda de color */}
                        <span
                            className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-red-400 transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0"
                                }`}
                        />

                        {/* Icono documento */}
                        <span className="relative z-10 flex-shrink-0">
                            <PDFDocIcon isHovered={isHovered} />
                        </span>

                        {/* Texto */}
                        <span className="relative z-10 flex flex-col min-w-0">
                            <span
                                className={`text-[12px] font-mono tracking-[0.18em] uppercase mb-0.5 transition-colors duration-300 ${isHovered ? "text-red-400" : "text-slate-600"
                                    }`}
                            >
                                {fileName}
                            </span>
                            <span
                                className={`text-sm font-semibold tracking-wide leading-tight transition-colors duration-300 ${isHovered ? "text-red-600" : "text-slate-700"
                                    }`}
                                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                            >
                                {label}
                            </span>
                        </span>

                        {/* Badge ojo */}
                        <span
                            className={`
                relative z-10 ml-1 flex-shrink-0 w-8 h-8 flex items-center justify-center
                rounded-full border transition-all duration-300
                ${isHovered
                                    ? "bg-red-50 border-red-300 text-red-500"
                                    : "bg-slate-50 border-slate-200 text-slate-400"}
              `}
                        >
                            <EyeIcon isHovered={isHovered} />
                        </span>

                        {/* Flecha externa */}
                        <span
                            className={`
                relative z-10 flex-shrink-0 transition-colors duration-300
                ${isHovered ? "text-red-400" : "text-slate-300"}
              `}
                        >
                            <ExternalArrow isHovered={isHovered} />
                        </span>
                    </a>
                </div>
            </div>
        </>
    );
}

const AsisPage: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 4000); // Cambia cada 4 segundos
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full bg-gray-50 min-h-screen">

            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16 transition-all duration-300 bg-white shadow-md py-3`}>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(-1)}>
                    <div className={`p-2 rounded-xl backdrop-blur-md border transition-colors bg-teal-700 border-teal-700`}>
                        <img src={logo} alt="RISCP Logo" className={`h-8 w-8 invert`} />
                    </div>
                    <span className={`text-2xl font-extrabold tracking-tight transition-colors text-gray-900 `}>RISCP</span>
                </div>

                <div className="hidden md:flex items-center gap-10 text-sm font-medium">
                    {[
                        { label: 'Diresa', href: 'https://www.diresaucayali.gob.pe/' },
                        { label: 'Porta de Transparencia', href: '#' },
                        { label: 'Página Institucional', href: 'https://www.gob.pe/regionucayali-riscoronelportillo' },
                        { label: 'Ubicación', href: 'https://maps.app.goo.gl/CoLM38VD8WAgTYHF9' }
                    ].map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            target="_blank" rel="noopener noreferrer"
                            className={`relative py-1 transition-colors group text-lg text-gray-700 hover:text-teal-600`}
                        >
                            {link.label}
                            <span className={`absolute bottom-1 left-0 w-full h-[2px] scale-x-0 origin-center transition-transform duration-300 ease-out group-hover:scale-x-100 bg-teal-600`} />
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        to="/login"
                        className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300 shadow-sm bg-teal-700 text-white hover:bg-teal-700`}
                    >
                        INICIAR SESIÓN
                    </Link>
                </div>
            </nav>

            {/* HERO */}
            <section className=" border-b relative overflow-hidden mt-14 max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-8 items-start">

                {/* Texto Hero */}
                <div className="z-10 bg-white/90 p-6 rounded-2xl lg:p-0 lg:bg-transparent">
                    <h1 className="text-4xl font-extrabold text-teal-700 mb-4">
                        Análisis de Situación de Salud 2024
                    </h1>

                    <p className="text-lg text-gray-600 max-w-3xl">
                        Red Integrada de Salud 1 Coronel Portillo.
                        El ASIS permite comprender el perfil de salud de la población,
                        sus determinantes sociales y los principales problemas sanitarios
                        que afectan al territorio.
                    </p>

                    {/* <a
                            href="https://drive.google.com/file/d/1PvIp0LVV9OvF_nfl3T0KgBvMBTMvnHwF/view"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
                        >
                            Ver documento completo
                        </a> */}
                    <ViewPDFButton href="https://drive.google.com/file/d/1PvIp0LVV9OvF_nfl3T0KgBvMBTMvnHwF/view" label="Ver Documento" fileName="ASIS 2024 RIS1CP.pdf" />
                </div>

                {/* Slider Hero de Derecha a Izquierda */}
                <div className="relative h-72 lg:h-[400px] w-full rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                    <div
                        className="absolute top-0 left-0 h-full flex transition-transform duration-1000 ease-in-out"
                        style={{
                            width: `${heroImages.length * 100}%`,
                            transform: `translateX(-${(currentSlide * 100) / heroImages.length}%)`
                        }}
                    >
                        {heroImages.map((src, index) => (
                            <div key={index} className="h-full relative" style={{ width: `${100 / heroImages.length}%` }}>
                                <img src={src} alt="Salud" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent"></div>
                            </div>
                        ))}
                    </div>

                    {/* Puntos de navegación del slider */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        {heroImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* INTRODUCCIÓN */}
            <section className="max-w-6xl mx-auto px-6 py-12">
                <h2 className="text-2xl font-bold text-teal-700 mb-6">Introducción</h2>

                <p className="text-gray-600 leading-relaxed mb-4">
                    El Análisis de Situación de Salud (ASIS) es considerado la primera
                    función esencial de salud pública. Es un proceso que analiza el perfil
                    salud-enfermedad de la población, identificando problemas sanitarios,
                    determinantes sociales y desigualdades en el acceso a los servicios de salud.
                </p>

                <p className="text-gray-600 leading-relaxed">
                    Este documento permite orientar la planificación de políticas,
                    estrategias y programas de salud para mejorar las condiciones
                    sanitarias de la población de la RIS 1 Coronel Portillo.
                </p>
            </section>

            {/* CAPÍTULOS */}
            <section className="max-w-6xl mx-auto px-6 pb-16 space-y-16">

                {/* CAPÍTULO 1 */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h3 className="text-xl font-extrabold text-teal-700 mb-4">Capítulo I: Entorno y Población</h3>
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-3 text-gray-600">
                            <p>
                                La RIS 1 Coronel Portillo abarca 6 distritos del departamento de
                                Ucayali: Manantay, Masisea, Iparia, Purús, Yurúa y Callería
                                (parcialmente).
                            </p>

                            <p>
                                La estructura poblacional presenta un patrón expansivo,
                                caracterizado por una población joven y alto potencial
                                de crecimiento demográfico.
                            </p>

                            <p>
                                Distritos como Yurúa, Purús e Iparia concentran una alta
                                presencia de población indígena.
                            </p>
                        </div>

                        {/* Imagen referencial */}
                        <div className="w-full h-64 rounded-lg overflow-hidden flex items-center justify-center">
                            <img
                                src={mapaPucallpa}
                                alt="Población y comunidad"
                                className="w-full h-full object-contain"
                            />
                        </div>

                    </div>
                </div>


                {/* CAPÍTULO 2 */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h3 className="text-xl font-extrabold text-teal-700 mb-4">Capítulo II: Determinantes Sociales de la Salud</h3>
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        {/* Imagen referencial */}
                        <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden shadow-inner flex items-center justify-center">
                            <img
                                src={ninios}
                                alt="Determinantes sociales"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="space-y-3 text-gray-600">
                            <p>
                                La pobreza monetaria en Ucayali alcanza el 27.1%, con
                                deficiencias en servicios básicos como agua potable
                                y saneamiento en distritos rurales.
                            </p>

                            <p>
                                La RIS1 Coronel Portillo cuenta con 6 microrredes
                                de salud y un total de 928 trabajadores,
                                mayoritariamente en funciones asistenciales.
                            </p>

                            <p>
                                Existen limitaciones en conectividad digital,
                                abastecimiento de medicamentos y logística
                                para mantener la cadena de frío en vacunas.
                            </p>
                        </div>

                    </div>
                </div>


                {/* CAPÍTULO 3 */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h3 className="text-xl font-extrabold text-teal-700 mb-4">Capítulo III: Estados de Salud</h3>
                    <ul className="list-disc ml-6 text-gray-600 space-y-2">
                        <li>Principales causas de morbilidad: infecciones respiratorias, enfermedades bucales y digestivas.</li>
                        <li>Principales causas de mortalidad: insuficiencia respiratoria y sepsis.</li>
                        <li>Alta incidencia de enfermedades transmisibles como dengue, malaria, tuberculosis y VIH.</li>
                        <li>Aumento de casos de violencia familiar y anemia en gestantes.</li>
                    </ul>

                </div>


                {/* CAPÍTULO 4 */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h3 className="text-xl font-extrabold text-teal-700 mb-4">Capítulo IV: Desigualdades en Salud</h3>

                    <p className="text-gray-600 mb-4">
                        Las comunidades rurales y pueblos originarios enfrentan
                        barreras geográficas, culturales y logísticas para acceder
                        a servicios de salud oportunos.
                    </p>

                    <p className="text-gray-600">
                        Los establecimientos de categoría I-1 representan
                        la mayoría, con limitaciones en equipamiento,
                        medicamentos y personal especializado.
                    </p>

                </div>


                {/* CAPÍTULO 5 */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h3 className="text-xl font-extrabold text-teal-700 mb-4">Capítulo V: Vulnerabilidad y Problemas Priorizados</h3>

                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        <ul className="list-disc ml-6 text-gray-600 space-y-2">
                            <li>Desnutrición y anemia infantil.</li>
                            <li>Mortalidad materna y embarazo adolescente.</li>
                            <li>Alta prevalencia de enfermedades transmisibles.</li>
                            <li>Infraestructura y servicios de salud insuficientes.</li>
                            <li>Comunidades rurales con difícil acceso geográfico.</li>
                        </ul>

                        {/* Imagen referencial */}
                        <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden shadow-inner flex items-center justify-center">
                            <img
                                src={bote}
                                alt="Determinantes sociales"
                                className="w-full h-full object-cover"
                            />
                        </div>

                    </div>

                </div>

            </section>


            {/* GALERÍA */}
            <section className="bg-white border-t py-16">
                <div className="max-w-6xl mx-auto px-6">

                    <h2 className="text-2xl font-bold text-teal-700 mb-8">Galería</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

                        <div className="h-40 bg-gray-200 rounded-lg overflow-hidden relative">
                            <img src={ninios2} alt="Galería 1" className="w-full h-full object-cover" />
                        </div>
                        <div className="h-40 bg-gray-200 rounded-lg overflow-hidden relative">
                            <img src={atencion1} alt="Galería 2" className="w-full h-full object-cover" />
                        </div>
                        <div className="h-40 bg-gray-200 rounded-lg overflow-hidden relative">
                            <img src={slider3} alt="Galería 3" className="w-full h-full object-cover" />
                        </div>
                        <div className="h-40 bg-gray-200 rounded-lg overflow-hidden relative">
                            <img src={octubre} alt="Galería 4" className="w-full h-full object-cover" />
                        </div>
                        <div className="h-40 bg-gray-200 rounded-lg overflow-hidden relative">
                            <img src={cs_salud_mental} alt="Galería 5" className="w-full h-full object-cover" />
                        </div>
                        <div className="h-40 bg-gray-200 rounded-lg overflow-hidden relative">
                            <img src={enfermera} alt="Galería 6" className="w-full h-full object-cover" />
                        </div>
                        <div className="h-40 bg-gray-200 rounded-lg overflow-hidden relative">
                            <img src={santa_elena} alt="Galería 7" className="w-full h-full object-cover" />
                        </div>
                        <div className="h-40 bg-gray-200 rounded-lg overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Galería 8" className="w-full h-full object-cover" />
                        </div>

                    </div>

                </div>
            </section>

        </div>
    );
};

export default AsisPage;