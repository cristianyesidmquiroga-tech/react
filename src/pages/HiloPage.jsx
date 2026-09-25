import { Link, useParams } from 'react-router-dom'
import Conversacion from '../components/Conversacion'
import Skeleton from '../components/ui/Skeleton'
import { useNotificacion } from '../context/NotificationContext'
import { useFetch } from '../hooks/useFetch'
import { mensajeService } from '../services/api'

const ESTADOS_FOTO = { sin_foto: 'Sin foto', pendiente: 'Pendiente de revisión', aprobada: 'Aprobada', rechazada: 'Rechazada' }

export default function HiloPage() {
  const { usuarioId } = useParams()
  const { notificar } = useNotificacion()
  const { data, error, recargar } = useFetch((signal) => mensajeService.hilo(usuarioId, signal), [usuarioId])
  const persona = data?.persona

  const enviar = async (texto) => {
    const r = await mensajeService.responder(usuarioId, texto)
    notificar(r.mensaje, 'success')
    recargar()
  }

  return (
    <div>
      <div className="glass-card cabecera-mensajes">
        <h1 className="text-3d">
          <i className="fas fa-comments" aria-hidden="true" /> Conversación{persona && ` con ${persona.nombre}`}
        </h1>
        {persona && (
          <p>
            {persona.cargo || 'Sin cargo'} · Doc. {persona.documento}
            <br />
            Estado de la foto: <strong>{ESTADOS_FOTO[persona.fotoEstado] || 'Sin foto'}</strong>
          </p>
        )}
        <p className="volver-bandeja">
          <Link to="/bandeja">&larr; Volver a la bandeja</Link>
        </p>
      </div>
      {!data && !error && <Skeleton filas={3} alto="4rem" />}
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
        <Conversacion
          mensajes={data.mensajes}
          vistaAsesor
          vacio="Todavía no hay mensajes con esta persona."
          etiqueta={`Escribir a ${persona.nombre}`}
          placeholder="Explícale qué le falta o respóndele su pregunta"
          onEnviar={enviar}
        />
      )}
    </div>
  )
}
