import { useEffect, useId, useRef, useState } from 'react'
import { useNotificacion } from '../context/NotificationContext'

const fecha = (iso) =>
  new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

// Lo propio a la derecha y lo de la otra parte a la izquierda, como en cualquier chat
export default function Conversacion({ mensajes, vistaAsesor, vacio, etiqueta, placeholder, onEnviar }) {
  const { notificar } = useNotificacion()
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const hilo = useRef(null)
  const id = useId()

  useEffect(() => {
    if (hilo.current) hilo.current.scrollTop = hilo.current.scrollHeight
  }, [mensajes])

  const enviar = async (e) => {
    e.preventDefault()
    if (!texto.trim()) {
      notificar('Escribe algo antes de enviar.', 'warning')
      return
    }
    setEnviando(true)
    try {
      await onEnviar(texto.trim())
      setTexto('')
    } catch (err) {
      notificar(err.campos?.[0]?.mensaje || err.message, 'error')
    } finally {
      setEnviando(false)
    }
  }

  const clase = (m) => {
    if (m.automatico) return 'automatico'
    return (vistaAsesor ? m.autorEsAdmin : m.propio) ? 'mio' : 'otro'
  }

  return (
    <div className="glass-card tarjeta-mensajes">
      {mensajes.length === 0 ? (
        <p className="sin-mensajes">{vacio}</p>
      ) : (
        <div className="hilo" ref={hilo}>
          {mensajes.map((m) => (
            <div key={m.id} className={`burbuja ${clase(m)}`}>
              {m.texto}
              <span className="firma">
                {m.automatico && (
                  <>
                    <i className="fas fa-robot" aria-hidden="true" /> Aviso del sistema ·{' '}
                  </>
                )}
                {m.autorNombre}
                {m.autorEsAdmin && !m.automatico && ' (administrador)'} · {fecha(m.fecha)}
              </span>
            </div>
          ))}
        </div>
      )}
      <hr className="separador-mensajes" />
      <form onSubmit={enviar}>
        <label htmlFor={id} className="rotulo-mensaje-chat">
          {etiqueta}
        </label>
        <textarea
          id={id}
          rows={3}
          required
          maxLength={2000}
          className="campo-mensaje-chat"
          placeholder={placeholder}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <div className="acciones-mensaje">
          <button type="submit" className="btn-enviar" disabled={enviando}>
            <i className="fas fa-paper-plane" aria-hidden="true" /> Enviar
          </button>
        </div>
      </form>
    </div>
  )
}
