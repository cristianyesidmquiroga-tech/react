import Conversacion from '../components/Conversacion'
import Skeleton from '../components/ui/Skeleton'
import { useNotificacion } from '../context/NotificationContext'
import { useFetch } from '../hooks/useFetch'
import { mensajeService } from '../services/api'

export default function MensajesPage() {
  const { notificar } = useNotificacion()
  const { data, error, recargar } = useFetch((signal) => mensajeService.mios(signal), [])

  const enviar = async (texto) => {
    const r = await mensajeService.enviar(texto)
    notificar(r.mensaje, 'success')
    recargar()
  }

  return (
    <div>
      <div className="glass-card cabecera-mensajes">
        <h1 className="text-3d">
          <i className="fas fa-comments" aria-hidden="true" /> Mensajes
        </h1>
        <p>
          Aquí puedes escribirle al administrador si algo no te funciona o no sabes qué hacer: por ejemplo, si te
          rechazaron la foto y no entiendes por qué, o si un dato de tu perfil está mal y no lo puedes cambiar.
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
          vacio="Todavía no tienes mensajes. Escribe abajo si necesitas ayuda."
          etiqueta="Escribe tu mensaje"
          placeholder="Cuéntanos qué problema tienes"
          onEnviar={enviar}
        />
      )}
    </div>
  )
}
