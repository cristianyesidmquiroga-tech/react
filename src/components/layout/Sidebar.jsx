import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logoSena from '../../assets/img/logoSena.png'
import { mensajeService } from '../../services/api'

// Solo se muestran los enlaces permitidos para el usuario
const ENLACES = [
  { a: '/porteria/panel', texto: 'Panel General', icono: 'fa-chart-line', permiso: 'operarPorteria' },
  { a: '/porteria/escaner', texto: 'Escáner', icono: 'fa-barcode', permiso: 'operarPorteria' },
  { a: '/porteria/pases', texto: 'Pases Manuales', icono: 'fa-ticket-alt', permiso: 'operarPorteria' },
  { a: '/admin/usuarios', texto: 'Gestión Perfiles', icono: 'fa-users-cog', permiso: 'admin' },
  { a: '/admin/fichas', texto: 'Fichas de Formación', icono: 'fa-layer-group', permiso: 'admin' },
  { a: '/admin/fotos', texto: 'Revisar Fotos', icono: 'fa-user-check', permiso: 'admin', contador: 'fotosPendientes', leyenda: 'fotos pendientes de revisión' },
]
// Van después del menú de reportes, como en Portería 2
const ENLACES_FORMACION = [
  { a: '/admin/clases', texto: 'Historial Clases', icono: 'fa-tasks', permiso: 'admin' },
  { a: '/admin/historial', texto: 'Historial de Cambios', icono: 'fa-history', permiso: 'admin' },
  { a: '/admin/respaldos', texto: 'Respaldos del Sistema', icono: 'fa-archive', permiso: 'admin' },
  { a: '/asistencia', texto: 'Mi Ficha', icono: 'fa-users', permiso: 'gestionarAsistencia' },
  { a: '/comunicados', texto: 'Comunicados', icono: 'fa-bullhorn', permiso: 'gestionarAsistencia' },
  { a: '/ambientes', texto: 'Ambientes', icono: 'fa-chalkboard-teacher', permiso: 'verAmbientes' },
]
// Después de Mi Perfil y el historial; todos tienen ayuda y mensajes
const ENLACES_SOPORTE = [
  { a: '/ayuda', texto: 'Centro de Ayuda', icono: 'fa-question-circle' },
  { a: '/mensajes', texto: 'Mensajes', icono: 'fa-comments', contador: 'mensajesSinLeer', leyenda: 'mensajes sin leer' },
  {
    a: '/bandeja',
    texto: 'Bandeja de Mensajes',
    icono: 'fa-inbox',
    permiso: 'asesorar',
    contador: 'hilosPendientes',
    leyenda: 'conversaciones esperando respuesta',
  },
]
const REPORTES = [
  ['Aprendiz', 'Aprendices'],
  ['Instructor', 'Instructores'],
  ['Personal', 'Personal Admin'],
]

export default function Sidebar({ abierto, onCerrar }) {
  const { usuario, logout } = useAuth()
  const { pathname } = useLocation()
  const permisos = usuario?.permisos || {}
  const enReportes = pathname.startsWith('/porteria/reportes/')
  const [reportesAbierto, setReportesAbierto] = useState(enReportes)
  const consultaTerceros = permisos.operarPorteria || permisos.gestionarAsistencia
  const [avisos, setAvisos] = useState({})
  // Se refrescan al cambiar de página: así el contador baja apenas se lee un hilo
  useEffect(() => {
    const control = new AbortController()
    mensajeService.avisos(control.signal).then(setAvisos).catch(() => {})
    return () => control.abort()
  }, [pathname])
  // Como en Portería 2: el cargo Administrador ve los reportes aunque no sea admin
  const veReportes = permisos.admin || usuario?.cargo === 'Administrador'
  const enlaces = (lista) =>
    lista
      .filter((e) => !e.permiso || permisos[e.permiso])
      .map(({ a, texto, icono, contador, leyenda }) => (
        <NavLink key={a} to={a} className="stagger-item" onClick={onCerrar}>
          <i className={`fas ${icono}`} aria-hidden="true" /> <span>{texto}</span>
          {avisos[contador] > 0 && (
            <span className="contador-menu" aria-label={`${avisos[contador]} ${leyenda}`}>
              {avisos[contador]}
            </span>
          )}
        </NavLink>
      ))

  return (
    <aside id="sidebar-main" className={`sidebar${abierto ? ' active' : ''}`} aria-label="Menú principal">
      <button type="button" className="sidebar-close" onClick={onCerrar} aria-label="Cerrar menú">
        <i className="fas fa-times" aria-hidden="true" />
      </button>
      <div className="sidebar-header">
        <img src={logoSena} alt="SENA" className="sidebar-logo" />
        <p className="highlight-rainbow">Centro de formación SENA</p>
      </div>
      <nav className="sidebar-nav">
        {enlaces(ENLACES)}
        {veReportes && (
          <div className={`sidebar-dropdown stagger-item${reportesAbierto ? ' open' : ''}`}>
            <button
              type="button"
              className={`dropdown-btn${enReportes ? ' active' : ''}`}
              aria-expanded={reportesAbierto}
              onClick={() => setReportesAbierto((v) => !v)}
            >
              <i className="fas fa-users" aria-hidden="true" /> <span>Reporte Usuarios</span>
              <i className="fas fa-chevron-down caret" aria-hidden="true" />
            </button>
            <div className="dropdown-content">
              {REPORTES.map(([cargo, texto]) => (
                <NavLink key={cargo} to={`/porteria/reportes/${cargo}`} onClick={onCerrar} tabIndex={reportesAbierto ? undefined : -1}>
                  {texto}
                </NavLink>
              ))}
            </div>
          </div>
        )}
        {enlaces(ENLACES_FORMACION)}
        <NavLink to="/perfil" className="stagger-item" onClick={onCerrar}>
          <i className="fas fa-id-card" aria-hidden="true" /> <span>Mi Perfil</span>
        </NavLink>
        <NavLink to="/historial" className="stagger-item" onClick={onCerrar}>
          <i className="fas fa-user-clock" aria-hidden="true" /> <span>{consultaTerceros ? 'Historial de Ingresos' : 'Mis Ingresos'}</span>
        </NavLink>
        {enlaces(ENLACES_SOPORTE)}
        {/* Separado y en rojo porque saca del sistema */}
        <Link to="/login" className="stagger-item enlace-cerrar-sesion" onClick={logout}>
          <i className="fas fa-sign-out-alt" aria-hidden="true" /> <span>Cerrar Sesión</span>
        </Link>
      </nav>
    </aside>
  )
}
