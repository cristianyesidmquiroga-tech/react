import { Link } from 'react-router-dom'
import Skeleton from '../components/ui/Skeleton'
import { useFetch } from '../hooks/useFetch'
import { ambienteService } from '../services/api'

const hoyTexto = () => new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function AmbientesPage() {
  const { data: ambientes, error, recargar } = useFetch((signal) => ambienteService.listar(signal), [])

  return (
    <div className="profile-container">
      <div className="header-actions">
        <div className="header-title">
          <h1>
            <i className="fas fa-door-open" aria-hidden="true" /> Ambientes Activos
          </h1>
          <p className="subtitle">
            Fichas con aprendices en el campus hoy &mdash; <strong>{hoyTexto()}</strong>
          </p>
        </div>
      </div>

      {!ambientes && !error && <Skeleton filas={3} alto="8rem" />}
      {error && (
        <div className="glass-card estado-vacio" role="alert">
          <i className="fas fa-exclamation-triangle" aria-hidden="true" />
          <p>{error}</p>
          <button type="button" className="btn-outline" onClick={recargar}>
            Reintentar
          </button>
        </div>
      )}
      {ambientes && ambientes.length === 0 && (
        <div className="glass-card sin-ambientes">
          <i className="fas fa-school" aria-hidden="true" />
          <h3>Sin ambientes activos hoy</h3>
          <p>No hay aprendices registrados en el campus aún.</p>
        </div>
      )}
      {ambientes && ambientes.length > 0 && (
        <div className="ambientes-grid">
          {ambientes.map((a) => (
            <Link key={a.ficha} to={`/ambientes/${encodeURIComponent(a.ficha)}`} className="ambiente-card glass-card">
              <div className="ambiente-card__cabecera">
                <span className="ambiente-card__ficha">
                  <i className="fas fa-chalkboard-teacher" aria-hidden="true" /> Ficha {a.ficha}
                </span>
                <span className={`badge ${a.asistenciaTomada ? 'badge-lista' : 'badge-sin-lista'}`}>
                  <i className={`fas ${a.asistenciaTomada ? 'fa-check-circle' : 'fa-clock'}`} aria-hidden="true" />{' '}
                  {a.asistenciaTomada ? 'Lista tomada' : 'Sin lista'}
                </span>
              </div>
              <p className="ambiente-card__programa">
                <i className="fas fa-book" aria-hidden="true" /> {a.programa}
              </p>
              <div className="ambiente-card__datos">
                <div className="ambiente-card__conteo">
                  <div className="ambiente-card__numero">{a.aprendices}</div>
                  <div className="ambiente-card__rotulo">Aprendices</div>
                </div>
                <div className="ambiente-card__instructor">
                  <div className="ambiente-card__rotulo">Instructor</div>
                  <div className="ambiente-card__nombre">{a.instructor}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
