import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logoSena from '../../assets/img/logoSena.png'

// Solo se muestran los enlaces permitidos para el usuario
const ENLACES = [
  { a: '/admin/usuarios', texto: 'Gestión Perfiles', icono: 'fa-users-cog', permiso: 'admin' },
  { a: '/admin/fotos', texto: 'Revisar Fotos', icono: 'fa-user-check', permiso: 'admin' },
  { a: '/perfil', texto: 'Mi Perfil', icono: 'fa-id-card' },
]

export default function Sidebar({ abierto, onCerrar }) {
  const { usuario, logout } = useAuth()
  const visibles = ENLACES.filter((e) => !e.permiso || usuario?.permisos?.[e.permiso])

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
        {/* Separado y en rojo porque saca del sistema */}
        <Link to="/login" className="stagger-item enlace-cerrar-sesion" onClick={logout}>
          <i className="fas fa-sign-out-alt" aria-hidden="true" /> <span>Cerrar Sesión</span>
        </Link>
      </nav>
    </aside>
  )
}
