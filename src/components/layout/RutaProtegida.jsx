import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logoSena from '../../assets/img/logoSena.png'

// La API es quien decide los permisos; esto solo evita mostrar pantallas que igual responderían 403
export default function RutaProtegida({ permiso }) {
  const { usuario, cargando } = useAuth()
  const { pathname } = useLocation()

  if (cargando) {
    return (
      <div id="global-loader" role="status" aria-label="Cargando">
        <div className="loader-content">
          <div className="loader-spinner" />
          <img src={logoSena} alt="" />
        </div>
      </div>
    )
  }
  if (!usuario) return <Navigate to="/login" replace state={{ desde: pathname }} />
  if (usuario.debeCambiarContrasena && pathname !== '/cambiar-contrasena') {
    return <Navigate to="/cambiar-contrasena" replace />
  }
  if (permiso && !usuario.permisos?.[permiso]) return <Navigate to="/perfil" replace />
  return <Outlet />
}
