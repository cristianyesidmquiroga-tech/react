import { Link } from 'react-router-dom'
import FotoUsuario from '../components/ui/FotoUsuario'
import Skeleton from '../components/ui/Skeleton'
import { useFetch } from '../hooks/useFetch'
import { mensajeService } from '../services/api'

export default function BandejaPage() {
  const { data: hilos, error, recargar } = useFetch((signal) => mensajeService.bandeja(signal), [])

  return (
    <div>
      <div className="glass-card cabecera-mensajes">
        <h1 className="text-3d">
          <i className="fas fa-inbox" aria-hidden="true" /> Bandeja de mensajes
        </h1>
        <p>Conversaciones con las personas del sistema. Primero aparecen quienes están esperando respuesta.</p>
      </div>
      {!hilos && !error && <Skeleton filas={4} alto="4.5rem" />}
      {error && (
        <div className="glass-card estado-vacio" role="alert">
          <i className="fas fa-exclamation-triangle" aria-hidden="true" />
          <p>{error}</p>
          <button type="button" className="btn-outline" onClick={recargar}>
            Reintentar
          </button>
        </div>
      )}
      {hilos && hilos.length === 0 && (
        <div className="glass-card bandeja-vacia">
          <i className="fas fa-comment-slash" aria-hidden="true" />
          <h2>No hay conversaciones</h2>
          <p>Puedes iniciar una desde la cola de revisión de fotos.</p>
        </div>
      )}
      {hilos && hilos.length > 0 && (
        <div className="lista-hilos">
          {hilos.map((h) => (
            <Link key={h.usuarioId} to={`/bandeja/${h.usuarioId}`} className={`glass-card hilo-fila${h.sinLeer ? ' hilo-fila--pendiente' : ''}`}>
              <FotoUsuario
                usuarioId={h.tieneFoto ? h.usuarioId : null}
                cargo={h.cargo}
                alt=""
                className="hilo-fila__foto"
                loading="lazy"
                width="52"
                height="52"
              />
              <div className="hilo-fila__datos">
                <p className="hilo-fila__nombre">
                  {h.nombre}
                  {h.sinLeer > 0 && <span className="insignia-sin-leer">{h.sinLeer} sin leer</span>}
                </p>
                <p className="hilo-fila__detalle">
                  {h.cargo || 'Sin cargo'} · Doc. {h.documento}
                </p>
                <p className="hilo-fila__ultimo">
                  {h.ultimoEsAdmin && <strong>Tú: </strong>}
                  {h.ultimoTexto}
                </p>
              </div>
              <span className="hilo-fila__fecha">{new Date(h.ultimaFecha).toLocaleDateString('es-CO')}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
