import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logoSena from '../../assets/img/logoSena.png'

// Solo se muestran los enlaces permitidos para el usuario
const ENLACES = [
  { a: '/porteria/panel', texto: 'Panel General', icono: 'fa-chart-line', permiso: 'operarPorteria' },
  { a: '/porteria/escaner', texto: 'Escáner', icono: 'fa-barcode', permiso: 'operarPorteria' },
  { a: '/porteria/pases', texto: 'Pases Manuales', icono: 'fa-ticket-alt', permiso: 'operarPorteria' },
  { a: '/admin/usuarios', texto: 'Gestión Perfiles', icono: 'fa-users-cog', permiso: 'admin' },
  { a: '/admin/fotos', texto: 'Revisar Fotos', icono: 'fa-user-check', permiso: 'admin' },
]
const REPORTES = [
  ['Aprendiz', 'Aprendices'],
  ['Instructor', 'Instructores'],
  ['Administrativo', 'Personal Admin'],
]

export default function Sidebar({ abierto, onCerrar }) {
  const { usuario, logout } = useAuth()
  const { pathname } = useLocation()
  const permisos = usuario?.permisos || {}
  const enReportes = pathname.startsWith('/porteria/reportes/')
  const [reportesAbierto, setReportesAbierto] = useState(enReportes)
  const visibles = ENLACES.filter((e) => permisos[e.permiso])
  const consultaTerceros = permisos.operarPorteria || permisos.gestionarAsistencia

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
        {visibles.map(({ a, texto, icono }) => (
          <NavLink key={a} to={a} className="stagger-item" onClick={onCerrar}>
            <i className={`fas ${icono}`} aria-hidden="true" /> <span>{texto}</span>
          </NavLink>
        ))}
        {permisos.admin && (
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
        <NavLink to="/perfil" className="stagger-item" onClick={onCerrar}>
          <i className="fas fa-id-card" aria-hidden="true" /> <span>Mi Perfil</span>
        </NavLink>
        <NavLink to="/historial" className="stagger-item" onClick={onCerrar}>
          <i className="fas fa-user-clock" aria-hidden="true" /> <span>{consultaTerceros ? 'Historial de Ingresos' : 'Mis Ingresos'}</span>
        </NavLink>
        {/* Separado y en rojo porque saca del sistema */}
        <Link to="/login" className="stagger-item enlace-cerrar-sesion" onClick={logout}>
          <i className="fas fa-sign-out-alt" aria-hidden="true" /> <span>Cerrar Sesión</span>
        </Link>
      </nav>
    </aside>
  )
}
