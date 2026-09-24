import { useState } from 'react'
import Campo from '../components/ui/Campo'
import { useNotificacion } from '../context/NotificationContext'
import { asistenciaService } from '../services/api'

export default function AsistenciaPage() {
  const { notificar } = useNotificacion()
  const [ficha, setFicha] = useState('')
  const [resultado, setResultado] = useState(null)
  const [presentes, setPresentes] = useState(new Set())
  const [ocupado, setOcupado] = useState(false)

  const buscar = async (e) => {
    e.preventDefault()
    setOcupado(true)
    try {
      const datos = await asistenciaService.buscar(ficha.trim())
      setResultado(datos)
      // Marcados por defecto: si cruzaron portería, lo más probable es que estén en clase
      setPresentes(new Set(datos.aprendices.map((a) => a.id)))
    } catch (err) {
      notificar(err.message, 'error')
    } finally {
      setOcupado(false)
    }
  }

  const limpiar = () => {
    setFicha('')
    setResultado(null)
  }

  const alternar = (id) =>
    setPresentes((actual) => {
      const nuevo = new Set(actual)
      if (nuevo.has(id)) nuevo.delete(id)
      else nuevo.add(id)
      return nuevo
    })

  const guardar = async (e) => {
    e.preventDefault()
    setOcupado(true)
    try {
      const r = await asistenciaService.guardar(resultado.ficha, [...presentes])
      notificar(r.mensaje, 'success')
      limpiar()
    } catch (err) {
      notificar(err.message, 'error')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="profile-container">
      <div className="header-actions">
        <div className="header-title">
          <h1>Control de Clase</h1>
          <p className="subtitle">
            Busca tu Ficha. Solo se listarán los estudiantes de esta ficha que ya hayan cruzado portería el día de hoy.
          </p>
        </div>
      </div>

      <div className="glass-card buscador-ficha">
        <form className="floating-form" onSubmit={buscar}>
          <Campo etiqueta="Código de Ficha a impartir" icono="fa-search" requerido>
            {(p) => <input {...p} maxLength={20} required value={ficha} onChange={(e) => setFicha(e.target.value)} />}
          </Campo>
          <div className="acciones-buscador">
            <button type="submit" className="glass-btn btn-glow" disabled={ocupado}>
              <span>Buscar Aprendices en Campus</span> <i className="fas fa-search" aria-hidden="true" />
            </button>
            <button type="button" className="glass-btn" onClick={limpiar}>
              <i className="fas fa-eraser" aria-hidden="true" /> Limpiar
            </button>
          </div>
        </form>
      </div>

      {resultado && resultado.aprendices.length > 0 && (
        <div className="glass-card resultado-ficha">
          <h2 className="glass-title text-3d">
            <i className="fas fa-users" aria-hidden="true" /> Aprendices de Ficha: {resultado.ficha}
          </h2>
          <form onSubmit={guardar}>
            <div className="table-responsive">
              <table className="glass-table tabla-formacion">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Nombre Completo</th>
                    <th scope="col">Documento</th>
                    <th scope="col">Programa</th>
                    <th scope="col">Horario</th>
                    <th scope="col" className="celda-centro">
                      Asistió a Clase
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.aprendices.map((a, i) => (
                    <tr key={a.id}>
                      <td>{i + 1}</td>
                      <td>
                        <strong>{a.nombre}</strong>
                      </td>
                      <td>{a.documento}</td>
                      <td>{a.programa}</td>
                      <td>{a.horario || 'N/A'}</td>
                      <td className="celda-centro">
                        <input
                          type="checkbox"
                          className="casilla-asistencia"
                          checked={presentes.has(a.id)}
                          onChange={() => alternar(a.id)}
                          aria-label={`${a.nombre} asistió a clase`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="guardar-asistencia">
              <button type="submit" className="glass-btn gradient-green btn-glow" disabled={ocupado}>
                <span>Guardar Checklist en Historial</span> <i className="fas fa-save" aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>
      )}

      {resultado && resultado.aprendices.length === 0 && (
        <div className="glass-card sin-resultados-ficha">
          <i className="fas fa-exclamation-triangle" aria-hidden="true" />
          <h3>No hay resultados</h3>
          <p>
            No se encontraron estudiantes de la Ficha <strong>{resultado.ficha}</strong> registrados por portería hoy, o la
            ficha no existe.
          </p>
        </div>
      )}
    </div>
  )
}
