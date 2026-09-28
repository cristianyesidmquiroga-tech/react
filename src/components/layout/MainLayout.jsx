import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTilt } from '../../hooks/useTilt'
import { mensajeService } from '../../services/api'
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
  '/admin/fichas': 'Fichas de Formación - SENA',
  '/admin/clases': 'Historial Clases',
  '/admin/historial': 'Historial de Cambios',
  '/admin/respaldos': 'Respaldos del Sistema',
  '/asistencia': 'Control de Asistencia - Instructor',
  '/comunicados': 'Comunicados - SENA',
  '/ambientes': 'Panel de Ambientes',
  '/mensajes': 'Mensajes',
  '/bandeja': 'Bandeja de mensajes',
  '/ayuda': 'Centro de ayuda',
  '/tutorial': 'Tutorial de primeros pasos',
}

function titulo(pathname) {
  if (TITULOS[pathname]) return TITULOS[pathname]
  if (pathname.startsWith('/porteria/reportes/')) return 'Reporte de Usuarios'
  if (pathname.startsWith('/ambientes/')) return `Ambiente – Ficha ${decodeURIComponent(pathname.split('/')[2])}`
  if (pathname.startsWith('/bandeja/')) return 'Mensajes'
  return 'Portería SENA'
}

export default function MainLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { pathname } = useLocation()
  const { usuario } = useAuth()
  const contenido = useRef(null)
  const [avisoRespaldo, setAvisoRespaldo] = useState(null)
  useTilt(contenido)

  useEffect(() => {
    if (!usuario?.permisos?.admin) return
    mensajeService.avisos().then((a) => setAvisoRespaldo(a.avisoRespaldo)).catch(() => {})
  }, [usuario, pathname])

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
        <Navbar titulo={titulo(pathname)} menuAbierto={menuAbierto} onAbrirMenu={() => setMenuAbierto(true)} />
        <main id="contenido" ref={contenido} className="content-area animate-in" tabIndex={-1}>
          {avisoRespaldo && (
            <div className="aviso-sistema aviso-sistema--peligro" role="status">
              <i className="fas fa-database" aria-hidden="true" />
              <div>
                <p>{avisoRespaldo}</p>
              </div>
            </div>
          )}
          {usuario && !usuario.perfilCompleto && pathname !== '/perfil' && (
            <div className="aviso-sistema aviso-sistema--peligro">
              <i className="fas fa-exclamation-circle" aria-hidden="true" />
              <div>
                <h2>¡Perfil Incompleto!</h2>
                <p>
                  Para activar tu código de barras de acceso y utilizar el sistema correctamente, debes{' '}
                  <Link to="/perfil">completar todos los campos obligatorios de tu perfil</Link>.
                </p>
                {/* Solo mientras el perfil esté incompleto: después ya no hace falta la guía */}
                <Link to="/tutorial" className="boton-tutorial">
                  <i className="fas fa-map-signs" aria-hidden="true" /> Ver tutorial de primeros pasos
                </Link>
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
