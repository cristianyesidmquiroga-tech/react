import Skeleton from '../components/ui/Skeleton'
import { useNotificacion } from '../context/NotificationContext'
import { useFetch } from '../hooks/useFetch'
import { adminService } from '../services/api'

export default function RespaldosPage() {
  const { notificar } = useNotificacion()
  const { data, cargando, error } = useFetch((signal) => adminService.respaldos(signal), [])

  const descargar = async (nombre) => {
    try {
      const url = URL.createObjectURL(await adminService.descargarRespaldo(nombre))
      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = nombre
      enlace.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      notificar(err.message, 'error')
    }
  }

  return (
    <div className="profile-container">
      <div className="welcome-section cabecera-centrada">
        <h1 className="text-3d">Respaldos del Sistema</h1>
        <p>Archivos de Excel que se generan el día 1 de cada mes.</p>
      </div>

      <div className="glass-card table-responsive">
        {cargando ? (
          <Skeleton />
        ) : error ? (
          <p className="error-alert" role="alert">
            {error}
          </p>
        ) : data.length === 0 ? (
          <div className="sin-registros">
            <i className="fas fa-folder-open" aria-hidden="true" />
            <p>Aún no hay respaldos. El primero se crea el día 1 del próximo mes.</p>
          </div>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th scope="col">Archivo</th>
                <th scope="col" className="celda-centro">
                  Descarga
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((nombre) => (
                <tr key={nombre}>
                  <td>
                    <i className="fas fa-file-excel" aria-hidden="true" /> {nombre}
                  </td>
                  <td className="celda-centro">
                    <button type="button" className="glass-btn btn-primary" onClick={() => descargar(nombre)}>
                      <i className="fas fa-download" aria-hidden="true" /> Descargar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
