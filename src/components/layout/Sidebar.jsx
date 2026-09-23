import { NavLink } from 'react-router-dom'
import { ImageUp, ShieldCheck, UserRound, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

// Cada enlace dice qué permiso necesita; el menú solo pinta lo que la persona puede usar
const ENLACES = [
  { a: '/perfil', texto: 'Mi perfil', icono: UserRound },
  { a: '/admin/usuarios', texto: 'Gestión de usuarios', icono: Users, permiso: 'admin' },
  { a: '/admin/fotos', texto: 'Revisar fotos', icono: ImageUp, permiso: 'admin' },
]

export default function Sidebar({ abierto, onNavegar }) {
  const { usuario } = useAuth()
  const visibles = ENLACES.filter((e) => !e.permiso || usuario?.permisos?.[e.permiso])

  return (
    <aside id="menu-lateral" className={`menu${abierto ? ' menu--abierto' : ''}`} aria-label="Menú principal">
      <div className="menu__marca">
        <ShieldCheck size={30} aria-hidden="true" />
        <div>
          <strong>Portería SENA</strong>
          <span>Control de acceso</span>
        </div>
      </div>
      <nav>
        <ul className="menu__lista">
          {visibles.map(({ a, texto, icono: Icono }) => (
            <li key={a}>
              <NavLink to={a} className="menu__enlace" onClick={onNavegar}>
                <Icono size={20} aria-hidden="true" />
                {texto}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
