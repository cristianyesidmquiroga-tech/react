import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Skeleton from '../components/ui/Skeleton'
import { useNotificacion } from '../context/NotificationContext'
import { useFetch } from '../hooks/useFetch'
import { ayudaService } from '../services/api'

export default function AyudaPage() {
  const { notificar } = useNotificacion()
  const navegar = useNavigate()
  const { data, error, recargar } = useFetch((signal) => ayudaService.obtener(signal), [])
  const [asunto, setAsunto] = useState('')
  const [detalle, setDetalle] = useState('')
  const [enviando, setEnviando] = useState(false)

  const contactar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    try {
      const r = await ayudaService.contactar({ asunto: asunto || data.asuntos[0], detalle })
      notificar(r.mensaje, 'success')
      navegar('/mensajes')
    } catch (err) {
      notificar(err.campos?.[0]?.mensaje || err.message, 'error')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div>
      <div className="glass-card cabecera-mensajes">
        <h1 className="text-3d">
          <i className="fas fa-question-circle" aria-hidden="true" /> Centro de ayuda
        </h1>
        <p>Busca tu duda aquí abajo. Si no la encuentras o tu caso es distinto, escríbele a un asesor al final de la página.</p>
      </div>
      {!data && !error && <Skeleton filas={4} alto="4rem" />}
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
          {data.categorias.map((c) => (
            <div key={c.nombre} className="glass-card categoria-ayuda">
              <h2>{c.nombre}</h2>
              {c.preguntas.map((p) => (
                <details key={p.pregunta} className="pregunta">
                  <summary>{p.pregunta}</summary>
                  <div className="respuesta">{p.respuesta}</div>
                </details>
              ))}
            </div>
          ))}

          <div className="glass-card contacto-asesor" id="asesor">
            <h2>
              <i className="fas fa-headset" aria-hidden="true" /> Hablar con un asesor
            </h2>
            <p>
              Escríbenos y te respondemos en <Link to="/mensajes">Mensajes</Link>, dentro del sistema. Nos llega tu nombre,
              documento y el estado de tu perfil, así que no hace falta que los repitas.
            </p>
            <form onSubmit={contactar}>
              <label htmlFor="asunto">¿Con qué necesitas ayuda?</label>
              <select id="asunto" value={asunto || data.asuntos[0]} onChange={(e) => setAsunto(e.target.value)}>
                {data.asuntos.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
              <label htmlFor="detalle">Cuéntanos qué pasa</label>
              <textarea
                id="detalle"
                rows={4}
                required
                maxLength={2000}
                placeholder="Por ejemplo: subo mi foto y me dice que está borrosa, pero se ve bien en mi celular."
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
              />
              <div className="acciones-mensaje">
                <button type="submit" className="btn-enviar" disabled={enviando}>
                  <i className="fas fa-paper-plane" aria-hidden="true" /> Enviar a un asesor
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
