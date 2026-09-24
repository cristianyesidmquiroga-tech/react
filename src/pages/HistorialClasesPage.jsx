import { useState } from 'react'
import Campo from '../components/ui/Campo'
import { useNotificacion } from '../context/NotificationContext'
import { asistenciaService } from '../services/api'

const fecha = (iso) =>
  new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })

export default function HistorialClasesPage() {
  const { notificar } = useNotificacion()
  const [ficha, setFicha] = useState('')
  const [busqueda, setBusqueda] = useState(null)
  const [historial, setHistorial] = useState([])
  const [ocupado, setOcupado] = useState(false)

  const buscar = async (e) => {
    e.preventDefault()
    setOcupado(true)
    try {
      setHistorial(await asistenciaService.historialClases(ficha.trim()))
      setBusqueda(ficha.trim())
    } catch (err) {
      notificar(err.message, 'error')
    } finally {
      setOcupado(false)
    }
  }

  const quitarFiltro = () => {
    setFicha('')
    setBusqueda(null)
    setHistorial([])
  }

  return (
    <div className="profile-container">
      <div className="welcome-section cabecera-centrada">
        <h1 className="text-3d">Historial de Clases</h1>
        <p>Consultar registros de asistencia por número de ficha.</p>
      </div>

      <div className="glass-card buscador-ficha">
        <form className="floating-form" onSubmit={buscar}>
          <Campo etiqueta="Número de Ficha" icono="fa-hashtag" requerido>
            {(p) => <input {...p} maxLength={20} required value={ficha} onChange={(e) => setFicha(e.target.value)} />}
          </Campo>
          <div className="acciones-buscador">
            <button type="submit" className="glass-btn btn-glow" disabled={ocupado}>
              <span>Buscar Registros</span> <i className="fas fa-search" aria-hidden="true" />
            </button>
            {busqueda && (
              <button type="button" className="glass-btn" onClick={quitarFiltro}>
                Quitar Filtro
              </button>
            )}
          </div>
        </form>
      </div>

      {busqueda && (
        <div className="glass-card table-responsive resultado-ficha">
          {historial.length > 0 ? (
            <>
              <h2 className="titulo-resultados">
                <i className="fas fa-clipboard-list" aria-hidden="true" /> Resultados para Ficha: <strong>{busqueda}</strong>
              </h2>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th scope="col">Fecha/Hora</th>
                    <th scope="col">Ficha</th>
                    <th scope="col">Programa</th>
                    <th scope="col">Horario</th>
                    <th scope="col">Aprendiz (Documento)</th>
                    <th scope="col">Instructor a cargo</th>
                    <th scope="col" className="celda-centro">
                      Asistencia
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((h) => (
                    <tr key={h.id}>
                      <td>{fecha(h.fecha)}</td>
                      <td>
                        <strong>{h.ficha}</strong>
                      </td>
                      <td>{h.programa || 'N/A'}</td>
                      <td>{h.horario || 'N/A'}</td>
                      <td>
                        {h.aprendiz}
                        <br />
                        <small className="dato-secundario">cc: {h.documento}</small>
                      </td>
                      <td>{h.instructor || 'Cuenta eliminada'}</td>
                      <td className="celda-centro">
                        {h.presente ? (
                          <span className="role-badge role-badge-aprendiz">
                            <i className="fas fa-check" aria-hidden="true" /> Asistió
                          </span>
                        ) : (
                          <span className="role-badge badge-falla">
                            <i className="fas fa-times" aria-hidden="true" /> Falla
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div className="sin-registros">
              <i className="fas fa-search" aria-hidden="true" />
              <p>
                No hay reportes de clase para la ficha <strong>{busqueda}</strong>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
