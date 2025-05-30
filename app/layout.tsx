import './globals.css'
import Image from 'next/image'
import Link from 'next/link'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'CODAR - PUNO | Gestión Deportiva',
  description: 'Plataforma avanzada para administración de torneos y árbitros',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="bg-gradient-to-br from-neutral-100 via-slate-200 to-slate-100 text-neutral-900">
        {/* Efectos de fondo abstractos */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-red-100/20 blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-red-200/10 blur-3xl"></div>
        </div>

        {/* Barra de navegación */}
        <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-4 border border-slate-300/30">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="p-1.5 bg-gradient-to-br from-rose-200 to-rose-400 rounded-xl shadow-md">
                  <Image 
                    src="/conar.jpg" 
                    alt="Logo CODAR" 
                    width={48} 
                    height={48} 
                    className="rounded-lg border-2 border-white/50"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-rose-700 to-rose-500 bg-clip-text text-transparent group-hover:from-rose-500 group-hover:to-rose-700 transition-all duration-500">
                  CODAR-PUNO
                </span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-1 bg-white/70 rounded-xl px-3 py-2 shadow-inner">
                {['Campeonatos', 'Árbitros', 'Reglamentos', 'Contacto'].map((item) => (
                  <Link 
                    key={item}
                    href={`/${item.toLowerCase()}`}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-rose-500 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    {item}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12">
            {/* Panel lateral */}
            <div className="hidden lg:block relative">
              <div className="sticky top-40 space-y-8">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-slate-300/30">
                  <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Próximos Eventos
                  </h3>
                  <div className="space-y-4">
                    {['Copa Perú', 'Seminario Arbitral', 'Capacitación FIFA'].map((evento) => (
                      <div key={evento} className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-rose-400"></div>
                        <div>
                          <p className="font-medium text-gray-700">{evento}</p>
                          <p className="text-sm text-gray-500">15 Nov 2025</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-rose-500 to-red-400 rounded-2xl p-6 shadow-xl text-white">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    ¿Necesitas ayuda?
                  </h3>
                  <p className="text-sm mb-4 text-rose-100">Consulta nuestro manual o contáctanos.</p>
                  <Link 
                    href="/contacto" 
                    className="inline-block px-4 py-2 bg-white text-rose-700 text-sm font-semibold rounded-lg hover:bg-rose-50 transition-all"
                  >
                    Contactar
                  </Link>
                </div>
              </div>
            </div>

            {/* Área de contenido */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-10 border border-slate-300/30">
              {children}
            </div>
          </div>
        </main>

        {/* Pie de página */}
        <footer className="relative bg-neutral-900 text-gray-300 pt-16 pb-8 px-6 border-t border-gray-700">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div>
                <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                  <span className="bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent">
                    CODAR
                  </span>
                  <span className="text-gray-400">PUNO</span>
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Innovación en la gestión deportiva con tecnología.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Navegación</h4>
                  <ul className="space-y-3">
                    {['Inicio', 'Campeonatos', 'Árbitros', 'Reglamentos'].map((item) => (
                      <li key={item}>
                        <Link 
                          href={`/${item === 'Inicio' ? '' : item.toLowerCase()}`} 
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Legal</h4>
                  <ul className="space-y-3">
                    {['Términos', 'Privacidad', 'Normativas', 'FAQ'].map((item) => (
                      <li key={item}>
                        <Link 
                          href={`/${item.toLowerCase()}`} 
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Conéctate</h4>
                <div className="flex gap-4 mb-6">
                  {['facebook', 'twitter', 'instagram'].map((red) => (
                    <Link 
                      key={red}
                      href="#"
                      className="w-10 h-10 rounded-full bg-gray-700 hover:bg-rose-500/60 flex items-center justify-center transition-all"
                      aria-label={red}
                    >
                      <span className="sr-only">{red}</span>
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        {/* Iconos SVG */}
                      </svg>
                    </Link>
                  ))}
                </div>
                <p className="text-sm text-gray-400">
                  contacto@codarpuno.org<br />
                  +51 988887766
                </p>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-12 pt-8 text-center text-sm text-gray-500">
              <p>© {new Date().getFullYear()} CODAR Puno. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>

        <Toaster 
          position="bottom-right"
          toastOptions={{
            className: '!bg-neutral-900 !text-white !rounded-xl !border !border-gray-700',
          }}
        />
      </body>
    </html>
  )
}
