import { useState } from 'react'
import Skeleton from '../components/ui/Skeleton'
import { useFetch } from '../hooks/useFetch'
import { adminService } from '../services/api'

const fecha = (iso) =>
  new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })

export default function HistorialCambiosPage() {
  const [pagina, setPagina] = useState(0)
  const { data, cargando, error } = useFetch((signal) => adminService.auditoria(pagina, signal), [pagina])

  return (
    <div className="profile-container">
      <div className="welcome-section cabecera-centrada">
        <h1 className="text-3d">Historial de Cambios</h1>
        <p>Acciones administrativas sobre perfiles y datos.</p>
      </div>

      <div className="glass-card table-responsive">
        {cargando && !data ? (
          <Skeleton />
        ) : error ? (
          <p className="error-alert" role="alert">
            {error}
          </p>
        ) : data.content.length === 0 ? (
          <div className="sin-registros">
            <i className="fas fa-clipboard-list" aria-hidden="true" />
            <p>No hay registros de auditoría todavía.</p>
          </div>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Administrador</th>
                <th scope="col">Acción</th>
                <th scope="col">Autorizado por</th>
                <th scope="col">Motivo y detalles</th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((a) => (
                <tr key={a.id}>
                  <td>{fecha(a.fecha)}</td>
                  <td>{a.nombreUsuario}</td>
                  <td>{a.accion}</td>
                  <td>{a.autorizadoPor || 'N/A'}</td>
                  <td>
                    {a.motivo || 'Sin motivo'}
                    <br />
                    <small className="dato-secundario">{a.detalles}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <nav className="paginador" aria-label="Paginación">
          <span>
            Página {data.number + 1} de {data.totalPages}
          </span>
          <div className="paginador__botones">
            <button type="button" className="glass-btn" disabled={data.first} onClick={() => setPagina((p) => p - 1)}>
              Anterior
            </button>
            <button type="button" className="glass-btn" disabled={data.last} onClick={() => setPagina((p) => p + 1)}>
              Siguiente
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}
