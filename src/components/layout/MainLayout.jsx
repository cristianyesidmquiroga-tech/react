import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTilt } from '../../hooks/useTilt'
import ErrorBoundary from '../ui/ErrorBoundary'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const TITULOS = {
  '/porteria/panel': 'Panel General',
  '/porteria/escaner': 'Escáner',
  '/porteria/pases': 'Pases Manuales',
  '/historial': 'Historial de Ingresos',
  '/perfil': 'Mi Perfil',
  '/admin/usuarios': 'Gestión de Perfiles',
  '/admin/fotos': 'Revisión de Fotos',
}

export default function MainLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { pathname } = useLocation()
  const { usuario } = useAuth()
  const contenido = useRef(null)
  useTilt(contenido)

  useEffect(() => {
    document.body.classList.add('with-sidebar')
    return () => document.body.classList.remove('with-sidebar')
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuAbierto ? 'hidden' : ''
    if (!menuAbierto) return undefined
    const escape = (e) => e.key === 'Escape' && setMenuAbierto(false)
    const escritorio = () => window.innerWidth > 1024 && setMenuAbierto(false)
    document.addEventListener('keydown', escape)
    window.addEventListener('resize', escritorio)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', escape)
      window.removeEventListener('resize', escritorio)
    }
  }, [menuAbierto])

  return (
    <>
      <a className="saltar-contenido" href="#contenido">
        Saltar al contenido
      </a>
      <div className={`sidebar-overlay${menuAbierto ? ' active' : ''}`} onClick={() => setMenuAbierto(false)} aria-hidden="true" />
      <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
      <div className="main-wrapper">
        <Navbar titulo={TITULOS[pathname] || (pathname.startsWith('/porteria/reportes/') ? 'Reporte de Usuarios' : 'Portería SENA')} menuAbierto={menuAbierto} onAbrirMenu={() => setMenuAbierto(true)} />
        <main id="contenido" ref={contenido} className="content-area animate-in" tabIndex={-1}>
          {usuario && !usuario.perfilCompleto && pathname !== '/perfil' && (
            <div className="aviso-sistema aviso-sistema--peligro">
              <i className="fas fa-exclamation-circle" aria-hidden="true" />
              <div>
                <h2>¡Perfil Incompleto!</h2>
                <p>
                  Para activar tu código de barras de acceso y utilizar el sistema correctamente, debes{' '}
                  <Link to="/perfil">completar todos los campos obligatorios de tu perfil</Link>.
                </p>
              </div>
            </div>
          )}
          <ErrorBoundary key={pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
        <footer className="pie-sistema">
          <p>&copy; 2026 SENA - Centro de formación. Gestión de Acceso.</p>
        </footer>
      </div>
    </>
  )
}
