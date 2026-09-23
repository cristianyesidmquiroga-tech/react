import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Skeleton from '../ui/Skeleton'

// La API es quien decide los permisos; esto solo evita mostrar pantallas que igual responderían 403
export default function RutaProtegida({ permiso }) {
  const { usuario, cargando } = useAuth()
  const { pathname } = useLocation()

  if (cargando) {
    return (
      <div className="pantalla-carga">
        <Skeleton filas={4} />
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
