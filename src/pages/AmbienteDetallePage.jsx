import { Link, useParams } from 'react-router-dom'
import FotoUsuario from '../components/ui/FotoUsuario'
import Skeleton from '../components/ui/Skeleton'
import { useFetch } from '../hooks/useFetch'
import { ambienteService } from '../services/api'

const hora = (iso) => new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })

function Asistencia({ presente }) {
  if (presente === null) return <span className="asistencia-sin-marcar">Sin marcar</span>
  return presente ? (
    <span className="asistencia-presente">
      <i className="fas fa-check-circle" aria-hidden="true" /> Presente
    </span>
  ) : (
    <span className="asistencia-ausente">
      <i className="fas fa-times-circle" aria-hidden="true" /> Ausente
    </span>
  )
}

export default function AmbienteDetallePage() {
  const { ficha } = useParams()
  const { data, error, recargar } = useFetch((signal) => ambienteService.detalle(ficha, signal), [ficha])
  const hoy = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="profile-container">
      <div className="header-actions cabecera-ambiente">
        <Link to="/ambientes" className="volver-ambientes" aria-label="Volver a ambientes">
          <i className="fas fa-arrow-left" aria-hidden="true" />
        </Link>
        <div className="header-title">
          <h1>
            <i className="fas fa-chalkboard-teacher" aria-hidden="true" /> Ficha {ficha}
          </h1>
          <p className="subtitle">
            {data?.programa} &mdash; {hoy}
          </p>
        </div>
      </div>

      {!data && !error && <Skeleton filas={3} alto="5rem" />}
      {error && (
        <div className="glass-card estado-vacio" role="alert">
          <i className="fas fa-exclamation-triangle" aria-hidden="true" />
          <p>{error}</p>
          <button type="button" className="btn-outline" onClick={recargar}>
            Reintentar
          </button>
        </div>
      )}

      {data && (
        <>
          <div className="resumen-ambiente">
            <div className="glass-card resumen-ambiente__conteo">
              <div className="resumen-ambiente__numero">{data.aprendices.length}</div>
              <div className="ambiente-card__rotulo">Aprendices en campus</div>
            </div>
            <div className="glass-card resumen-ambiente__instructor">
              <div className="ambiente-card__rotulo">Instructor</div>
              {data.instructor ? (
                <div className="persona-ambiente">
                  <FotoUsuario
                    usuarioId={data.instructor.tieneFoto ? data.instructor.id : null}
                    cargo={data.instructor.cargo}
                    alt=""
                    className="foto-ambiente foto-ambiente--grande"
                    width="44"
                    height="44"
                  />
                  <div>
                    <div className="persona-ambiente__nombre">{data.instructor.nombre}</div>
                    <div className="dato-secundario">{data.instructor.programa || 'Sin especialidad'}</div>
                  </div>
                </div>
              ) : (
                <div className="sin-lista-ambiente">
                  <i className="fas fa-exclamation-triangle" aria-hidden="true" /> Sin lista de asistencia registrada hoy
                </div>
              )}
            </div>
          </div>

          {data.aprendices.length > 0 ? (
            <div className="glass-card resultado-ficha">
              <h2 className="glass-title text-3d">
                <i className="fas fa-users" aria-hidden="true" /> Aprendices en el Ambiente
              </h2>
              <div className="table-responsive">
                <table className="glass-table tabla-formacion">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Nombre</th>
                      <th scope="col">Documento</th>
                      <th scope="col">Hora de llegada</th>
                      <th scope="col" className="celda-centro">
                        Asistencia
                      </th>
                      <th scope="col">Comentario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.aprendices.map((a, i) => (
                      <tr key={a.id}>
                        <td>{i + 1}</td>
                        <td>
                          <div className="persona-ambiente">
                            <FotoUsuario
                              usuarioId={a.tieneFoto ? a.id : null}
                              cargo={a.cargo}
                              alt=""
                              className="foto-ambiente"
                              loading="lazy"
                              width="36"
                              height="36"
                            />
                            <strong>{a.nombre}</strong>
                          </div>
                        </td>
                        <td>{a.documento || 'N/A'}</td>
                        <td>
                          {a.llegada ? (
                            <>
                              <strong>{hora(a.llegada)}</strong> <span className="texto-tenue">hrs</span>
                            </>
                          ) : (
                            <span className="texto-tenue">—</span>
                          )}
                        </td>
                        <td className="celda-centro">
                          <Asistencia presente={a.presente} />
                        </td>
                        <td>
                          {a.evaluacion ? <em className="texto-tenue">{a.evaluacion}</em> : <span className="texto-tenue">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="glass-card sin-ambientes">
              <i className="fas fa-user-slash" aria-hidden="true" />
              <h3>Sin aprendices en el campus</h3>
              <p>
                Ningún aprendiz de la ficha <strong>{ficha}</strong> ha ingresado hoy.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
