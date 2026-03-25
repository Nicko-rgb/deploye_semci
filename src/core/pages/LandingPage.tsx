
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import slider1 from '../../assets/img/slider1.png'
import slider2 from '../../assets/img/slider2.png'
import slider3 from '../../assets/img/slider3.png'
import logo from '../../assets/img/logo.png'
import { Book, TicketCheck, BarChartBig, NotebookPen } from 'lucide-react'

const backgroundImages = [slider3, slider2, slider1];

export default function LandingPage() {
    const [currentImage, setCurrentImage] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
        }, 5000);

        const handleScroll = () => {
            if (window.scrollY > 500) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            clearInterval(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const accesDirect = [
        {
            title: 'Seguimiento de Trámites',
            desc: 'Consulta el estado actual de tus solicitudes y expedientes en tiempo real.',
            link: '',
            icon: Book,
            external: true
        },
        {
            title: 'Boletas de Pago',
            desc: 'Accede y descarga tus comprobantes de pago de forma rápida y segura.',
            link: '',
            icon: TicketCheck,
            external: true,
        },
        {
            title: 'Boletín Epidemiológico',
            desc: 'Información actualizada sobre la situación sanitaria y alertas regionales.',
            link: '',
            icon: NotebookPen,
            external: true,
        },
        {
            title: 'Indicadores SIS',
            desc: 'Vea los indicadores del Seguro Integral de Salud.',
            link: 'http://192.168.100.90:5174/',
            icon: BarChartBig,
            external: true,
        },
        {
            title: 'ASIS',
            desc: 'Análisis de situación de salud de la Red Integrada de Salud 1 Coronel Portillo',
            link: '/riscp/asis',
            icon: Book,
            external: false,
        }
    ]

    return (
        <div className="relative min-h-screen font-sans bg-gray-900 text-white">
            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 lg:px-16 transition-all duration-300 ${isScrolled
                ? 'bg-white shadow-md py-3'
                : 'bg-transparent py-6'
                }`}>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
                    <div className={`p-2 rounded-xl backdrop-blur-md border transition-colors ${isScrolled ? 'bg-teal-700 border-teal-700' : 'bg-white/10 border-white/20'
                        }`}>
                        <img src={logo} alt="RISCP Logo" className={`h-8 w-8 ${isScrolled ? 'brightness-0 invert' : 'invert'}`} />
                    </div>
                    <span className={`text-2xl font-extrabold tracking-tight transition-colors ${isScrolled ? 'text-gray-900 font-extrabold' : 'text-white'}`}>RISCP</span>
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
                            className={`relative py-1 transition-colors group text-lg ${isScrolled ? 'text-gray-600 hover:text-teal-600' : 'text-white/80 hover:text-white'
                                }`}
                        >
                            {link.label}
                            <span className={`absolute bottom-1 left-0 w-full h-[2px] scale-x-0 origin-center transition-transform duration-300 ease-out group-hover:scale-x-100 ${isScrolled ? 'bg-teal-700' : 'bg-white'
                                }`} />
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        to="/login"
                        className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300 shadow-sm ${isScrolled
                            ? 'bg-teal-700 text-white hover:bg-teal-700'
                            : 'bg-white text-gray-900 hover:bg-gray-100'
                            }`}
                    >
                        INICIAR SESIÓN
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative h-screen overflow-hidden flex flex-col">
                {/* Background Slider */}
                {backgroundImages.map((img, index) => (
                    <div
                        key={img}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImage ? 'opacity-100' : 'opacity-0'
                            }`}
                        style={{
                            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url(${img})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                ))}

                {/* Hero Content */}
                <main style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '0 4rem', marginTop: 90 }}>
                    <div className="max-w-3xl text-white">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="h-[1px] w-12 bg-teal-400"></div>
                            <span className="text-teal-400 font-bold tracking-[0.2em] text-xs uppercase">Sistema de Gestión de Salud</span>
                        </div>
                        <h1 className="text-6xl lg:text-8xl font-serif font-light leading-[1.1] mb-8">
                            EL FUTURO DE LA
                            <span className="font-bold italic"> SALUD PÚBLICA</span>
                        </h1>

                        <Link
                            to="/login"
                            className="group relative inline-flex items-center gap-3 px-10 py-4 text-lg font-bold text-white bg-teal-700 rounded-full hover:bg-teal-500 transition-all duration-300 shadow-2xl overflow-hidden"
                        >
                            <span className="relative z-10">INICIAR SESIÓN</span>
                            <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Link>
                    </div>

                    {/* Floating Interactive Card */}
                    <div className="hidden lg:block relative mt-20 lg:mt-0">
                        <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/20 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] max-w-sm">
                            <div className="flex gap-3 mb-8">
                                <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">Gestión</span>
                                <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">Análisis</span>
                                <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">En Vivo</span>
                            </div>
                            <h3 className="text-3xl font-semibold text-white mb-4 leading-snug">Monitoreo & Análisis en Tiempo Real</h3>
                            <p className="text-white/60 text-base leading-relaxed mb-8">
                                Visualice indicadores clave de desempeño y optimice la toma de decisiones con nuestra plataforma integrada.
                            </p>
                            <div className="flex items-center gap-5 group cursor-pointer">
                                <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                                    <svg className="w-6 h-6 text-white group-hover:text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                                <span className="text-white font-bold tracking-wide uppercase text-xs">Ver Video Demo</span>
                            </div>
                        </div>
                    </div>
                </main>
                {/* Stats & Trust Section (Inside Hero) */}
                <div className="z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent pb-12 px-8 lg:px-16 flex flex-col lg:flex-row items-end justify-between gap-8">
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                            <span className="text-4xl font-bold text-white tracking-tighter">12m+</span>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">Atenciones</span>
                        </div>
                        <div className="h-10 w-[1px] bg-white/20"></div>
                        <div className="flex flex-col">
                            <span className="text-4xl font-bold text-white tracking-tighter">98%</span>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">Eficiencia</span>
                        </div>
                    </div>

                    <div className="max-w-md text-right">
                        <h4 className="text-white text-lg font-semibold mb-2">Comprometidos con la excelencia</h4>
                        <p className="text-white/40 text-sm leading-relaxed">
                            Trabajamos con las redes de salud más importantes para transformar la atención primaria en el país.
                        </p>
                    </div>
                </div>
            </section>

            {/* Servicios Section */}
            <section className="py-24 px-8 lg:px-16 bg-white text-gray-900">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-12">Accesos Directos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {accesDirect.map((service, i) => (
                            <a key={i} href={service.link} target={service.external ? '_blank' : '_self'} rel={service.external ? 'noopener noreferrer' : ''} className="group p-8 border border-gray-100 rounded-3xl hover:shadow-2xl transition-all duration-300 bg-gray-50 hover:bg-white hover:-translate-y-2 cursor-pointer">
                                <div className="h-14 w-14 bg-teal-600/10 text-teal-600 rounded-2xl mb-6 mx-auto flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                                    {<service.icon />}
                                </div>
                                <h3 className="text-xl font-bold mb-4 group-hover:text-teal-600 transition-colors">{service.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{service.desc}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Nosotros Section */}
            <section id="nosotros" className="py-24 px-8 lg:px-16 bg-gray-50 text-gray-900">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2">
                        <h2 className="text-4xl font-bold mb-8">Sobre Nosotros</h2>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            En RISCP, nos dedicamos a transformar la salud pública mediante el uso inteligente de la tecnología.
                            Creemos que la eficiencia operativa es clave para salvar vidas y mejorar la calidad de atención.
                        </p>
                    </div>
                    <div className="lg:w-1/2 w-full h-80 bg-gray-300 rounded-[3rem] overflow-hidden shadow-2xl">
                        <img
                            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070"
                            alt="Sobre Nosotros"
                            className="w-full h-full object-cover opacity-80"
                        />
                    </div>
                </div>
            </section>

            {/* Indicadores Section */}
            <section id="indicadores" className="py-24 px-8 lg:px-16 bg-white text-gray-900">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-16 text-gray-900">Indicadores Clave</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { label: 'Pacientes Satisfechos', value: '95%' },
                            { label: 'Reducción de Costos', value: '30%' },
                            { label: 'Tiempo de Espera', value: '-40%' },
                            { label: 'Centros Conectados', value: '500+' }
                        ].map((stat) => (
                            <div key={stat.label}>
                                <div className="text-5xl font-bold text-teal-600 mb-2">{stat.value}</div>
                                <div className="text-gray-500 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contacto Section */}
            <section id="ibicacion" className="py-24 px-8 lg:px-16 bg-teal-900 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        {/* Info & Map */}
                        <div className="space-y-10">
                            <div>
                                <h2 className="text-4xl font-bold mb-6 italic">RED INTEGRAL DE SALUD 1 <br />CORONEL PORTILLO</h2>
                                <p className="text-teal-100 text-lg mb-8 leading-relaxed">
                                    Estamos a su servicio. Visítenos en nuestra sede central o contáctenos a través de nuestros canales oficiales.
                                </p>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 bg-teal-700/50 rounded-2xl flex items-center justify-center shrink-0 border border-teal-700">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Dirección</h4>
                                            <p className="text-teal-100/70">Jr. 7 de Junio N° 556, Pucallpa - Ucayali</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 bg-teal-700/50 rounded-2xl flex items-center justify-center shrink-0 border border-teal-700">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Correo Electrónico</h4>
                                            <p className="text-teal-100/70">mesadepartes@redsaludcoronelportillo.gob.pe</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 bg-teal-700/50 rounded-2xl flex items-center justify-center shrink-0 border border-teal-700">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Teléfono</h4>
                                            <p className="text-teal-100/70">(061) 571020</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Redes Sociales */}
                                <div className="mt-10">
                                    <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Síguenos en nuestras redes</h4>
                                    <div className="flex gap-4">
                                        {[
                                            { name: 'Facebook', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z', color: 'hover:bg-blue-600', href: 'https://www.facebook.com/RedCoronelPortillo' },
                                            // { name: 'YouTube', icon: 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 00-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 001.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 001.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z M9.75 15.02V8.98L15.45 12l-5.7 3.02z', color: 'hover:bg-red-600' },
                                            // { name: 'Instagram', icon: 'M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10.5 4.5a1 1 0 100-2 1 1 0 000 2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z', color: 'hover:bg-pink-600' }
                                        ].map((social) => (
                                            <a
                                                key={social.name}
                                                href={social.href}
                                                className={`h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center transition-all duration-300 border border-white/10 ${social.color}`}
                                                title={social.name}
                                            >
                                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                                    <path d={social.icon} />
                                                </svg>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Google Maps Embed */}
                        <div className="w-full h-full rounded-[1rem] overflow-hidden border-4 border-white/10 shadow-2xl">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d5451.416743255246!2d-74.5474693210611!3d-8.401653737056801!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91a3bdad20f03831%3A0x112dad2027e66932!2sCENTRO%20DE%20SALUD%207%20DE%20JUNIO%20CLAS!5e1!3m2!1ses-419!2spe!4v1768851062590!5m2!1ses-419!2spe"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-8 lg:px-16 bg-gray-950 text-white border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3 grayscale">
                        <img src={logo} alt="RISCP Logo" className="h-6 w-6 invert" />
                        <span className="text-lg font-bold tracking-tight">RISCP</span>
                    </div>
                    <p className="text-sm">© 2026 Sistema de Gestión de Salud. Todos los derechos reservados.</p>
                    <div className="flex gap-6 text-xs font-bold uppercase tracking-widest">
                        <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-white transition-colors">Términos</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}