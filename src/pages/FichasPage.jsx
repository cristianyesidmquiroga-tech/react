import { useState } from 'react'
import Modal from '../components/ui/Modal'
import Skeleton from '../components/ui/Skeleton'
import { useNotificacion } from '../context/NotificationContext'
import { useFetch } from '../hooks/useFetch'
import { fichaService } from '../services/api'

const VACIA = { numero: '', programa: '', fechaFinalizacion: '' }

const fechaTexto = (iso) => (iso ? iso.split('-').reverse().join('/') : '—')

const mensajeDe = (err) => err.campos?.[0]?.mensaje || err.message

function CamposFicha({ datos, onCambio, prefijo }) {
  const cambiar = (e) => onCambio({ ...datos, [e.target.name]: e.target.value })
  return (
    <>
      <div>
        <label htmlFor={`${prefijo}-numero`}>Número de ficha</label>
        <input
          id={`${prefijo}-numero`}
          name="numero"
          inputMode="numeric"
          pattern="\d{4,12}"
          maxLength={12}
          required
          placeholder="2847513"
          value={datos.numero}
          onChange={cambiar}
          aria-describedby={`${prefijo}-ayuda-numero`}
        />
        <small id={`${prefijo}-ayuda-numero`}>Solo dígitos, entre 4 y 12.</small>
      </div>
      <div>
        <label htmlFor={`${prefijo}-programa`}>Programa de formación</label>
        <input
          id={`${prefijo}-programa`}
          name="programa"
          maxLength={150}
          required
          placeholder="Tecnólogo en Análisis y Desarrollo de Software"
          value={datos.programa}
          onChange={cambiar}
        />
      </div>
      <div>
        <label htmlFor={`${prefijo}-fecha`}>Fecha de finalización</label>
        <input id={`${prefijo}-fecha`} name="fechaFinalizacion" type="date" value={datos.fechaFinalizacion} onChange={cambiar} />
        <small>Se imprime en el carnet de todos sus aprendices.</small>
      </div>
    </>
  )
}

export default function FichasPage() {
  const { notificar } = useNotificacion()
  const { data: fichas, cargando, error, recargar } = useFetch((signal) => fichaService.listar(signal), [])
  const [nueva, setNueva] = useState(VACIA)
  const [editando, setEditando] = useState(null)
  const [ocupado, setOcupado] = useState(false)

  const cuerpo = (datos) => ({ ...datos, fechaFinalizacion: datos.fechaFinalizacion || null })

  const ejecutar = async (accion, exito) => {
    setOcupado(true)
    try {
      await accion()
      notificar(exito, 'success')
      recargar()
      return true
    } catch (err) {
      notificar(mensajeDe(err), 'error')
      return false
    } finally {
      setOcupado(false)
    }
  }

  const crear = async (e) => {
    e.preventDefault()
    if (await ejecutar(() => fichaService.crear(cuerpo(nueva)), `Ficha ${nueva.numero} creada.`)) setNueva(VACIA)
  }

  const guardarEdicion = async (e) => {
    e.preventDefault()
    const { id, ...datos } = editando
    if (await ejecutar(() => fichaService.editar(id, cuerpo(datos)), `Ficha ${datos.numero} actualizada.`)) setEditando(null)
  }

  const archivar = (f) =>
    ejecutar(() => fichaService.archivar(f.id), `Ficha ${f.numero} ${f.activa ? 'archivada' : 'reactivada'}.`)

  return (
    <div>
      <div className="header-actions">
        <div className="header-title">
          <h1>Fichas de Formación</h1>
          <p className="subtitle">
            El programa y la fecha de finalización se registran aquí una sola vez. Cada aprendiz los hereda al elegir su
            ficha, así que todos los carnets de una misma ficha salen con los mismos datos.
          </p>
        </div>
      </div>

      <div className="glass-card tarjeta-ficha">
        <h2 className="titulo-ficha">
          <i className="fas fa-plus-circle" aria-hidden="true" /> Registrar una ficha nueva
        </h2>
        <form className="formulario-ficha" onSubmit={crear}>
          <div className="campos-ficha">
            <CamposFicha datos={nueva} onCambio={setNueva} prefijo="nueva" />
          </div>
          <button type="submit" className="btn-primary boton-ficha" disabled={ocupado}>
            <i className="fas fa-save" aria-hidden="true" /> Crear ficha
          </button>
        </form>
      </div>

      <div className="glass-card tarjeta-ficha">
        <h2 className="titulo-ficha">
          <i className="fas fa-list" aria-hidden="true" /> Fichas registradas{' '}
          {fichas && <span className="titulo-ficha__conteo">({fichas.length})</span>}
        </h2>

        {cargando && !fichas && <Skeleton filas={4} alto="2.6rem" />}
        {error && (
          <div className="estado-vacio" role="alert">
            <i className="fas fa-exclamation-triangle" aria-hidden="true" />
            <p>{error}</p>
            <button type="button" className="btn-outline" onClick={recargar}>
              Reintentar
            </button>
          </div>
        )}
        {fichas && fichas.length === 0 && (
          <div className="fichas-vacio">
            <i className="fas fa-folder-open" aria-hidden="true" />
            <p>Todavía no hay fichas registradas. Crea la primera con el formulario de arriba.</p>
          </div>
        )}
        {fichas && fichas.length > 0 && (
          <div className="table-responsive tabla-fichas">
            <table className="glass-table">
              <thead>
                <tr>
                  <th scope="col">Ficha</th>
                  <th scope="col">Programa</th>
                  <th scope="col">Finaliza</th>
                  <th scope="col">Aprendices</th>
                  <th scope="col">Estado</th>
                  <th scope="col" className="celda-acciones">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {fichas.map((f) => (
                  <tr key={f.id} className={f.activa ? undefined : 'ficha-archivada'}>
                    <td>
                      <strong>{f.numero}</strong>
                    </td>
                    <td>{f.programa}</td>
                    <td>{fechaTexto(f.fechaFinalizacion)}</td>
                    <td>{f.aprendices}</td>
                    <td>
                      <span className={`badge ${f.activa ? 'badge-activa' : 'badge-archivada'}`}>
                        {f.activa ? 'Activa' : 'Archivada'}
                      </span>
                    </td>
                    <td className="celda-acciones">
                      <button
                        type="button"
                        className="boton-ficha-mini"
                        onClick={() =>
                          setEditando({
                            id: f.id,
                            numero: f.numero,
                            programa: f.programa,
                            fechaFinalizacion: f.fechaFinalizacion || '',
                          })
                        }
                      >
                        <i className="fas fa-pen" aria-hidden="true" /> Editar
                      </button>
                      <button type="button" className="boton-ficha-mini" disabled={ocupado} onClick={() => archivar(f)}>
                        <i className="fas fa-archive" aria-hidden="true" /> {f.activa ? 'Archivar' : 'Reactivar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal abierto={Boolean(editando)} onCerrar={() => setEditando(null)} titulo="Editar ficha" ancho="sm">
        {editando && (
          <form className="formulario-ficha formulario-ficha--modal" onSubmit={guardarEdicion}>
            <p className="texto-ayuda">El cambio se refleja de inmediato en el carnet de todos los aprendices de esta ficha.</p>
            <CamposFicha datos={editando} onCambio={setEditando} prefijo="editar" />
            <div className="acciones-ficha">
              <button type="button" className="boton-ficha-mini" onClick={() => setEditando(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary boton-ficha" disabled={ocupado}>
                <i className="fas fa-save" aria-hidden="true" /> Guardar
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
