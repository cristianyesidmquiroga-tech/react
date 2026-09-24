import { useState } from 'react'
import Campo from '../components/ui/Campo'
import Modal from '../components/ui/Modal'
import Skeleton from '../components/ui/Skeleton'
import { useNotificacion } from '../context/NotificationContext'
import { useFetch } from '../hooks/useFetch'
import { useFotoProtegida } from '../hooks/useFotoProtegida'
import { adminService, avatarUrl } from '../services/api'

const FILTROS = [
  ['pendiente', 'Pendientes'],
  ['aprobada', 'Aprobadas'],
  ['rechazada', 'Rechazadas'],
  ['todos', 'Todas'],
]
const ESTADOS = { aprobada: 'Aprobada', rechazada: 'Rechazada', pendiente: 'Pendiente' }

function TarjetaFoto({ persona, onAprobar, onRechazar, ocupado }) {
  const url = useFotoProtegida(persona.estado === 'rechazada' ? null : persona.usuarioId)
  const fecha = persona.fechaSubida ? new Date(persona.fechaSubida).toLocaleString('es-CO') : ''
  return (
    <li className="glass-card tarjeta-foto">
      <img
        src={url || avatarUrl(persona.cargo)}
        alt={`Foto de perfil de ${persona.nombre}`}
        className="foto-persona"
        loading="lazy"
        decoding="async"
        width="260"
        height="260"
      />
      <div className="datos-persona">
        <p className="datos-persona__nombre">{persona.nombre}</p>
        <p>
          {persona.cargo || 'Sin cargo'} · Doc. {persona.documento || 'N/A'}
        </p>
        {persona.ficha && (
          <p>
            Ficha {persona.ficha}
            {persona.programa && ` · ${persona.programa}`}
          </p>
        )}
        {fecha && <p>Enviada: {fecha}</p>}
      </div>
      {persona.estado === 'pendiente' ? (
        <div className="acciones-foto">
          <button type="button" className="btn-revision btn-aprobar" disabled={ocupado} onClick={() => onAprobar(persona)}>
            <i className="fas fa-check" aria-hidden="true" /> Aprobar
          </button>
          <button type="button" className="btn-revision btn-rechazar" disabled={ocupado} onClick={() => onRechazar(persona)}>
            <i className="fas fa-times" aria-hidden="true" /> Rechazar
          </button>
        </div>
      ) : (
        <div className={`estado-foto estado-foto--${persona.estado}`}>
          <strong>{ESTADOS[persona.estado]}</strong>
          {persona.motivo && <p>{persona.motivo}</p>}
        </div>
      )}
    </li>
  )
}

export default function RevisionFotosPage() {
  const { notificar } = useNotificacion()
  const [estado, setEstado] = useState('pendiente')
  const [pagina, setPagina] = useState(0)
  const { data, cargando, error, recargar } = useFetch((signal) => adminService.fotos({ estado, pagina }, signal), [estado, pagina])
  const [ocupado, setOcupado] = useState(null)
  const [rechazando, setRechazando] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [errorMotivo, setErrorMotivo] = useState(null)

  const revisar = async (persona, aprobada, texto = null) => {
    setOcupado(persona.usuarioId)
    try {
      const r = await adminService.revisarFoto(persona.usuarioId, aprobada, texto)
      notificar(`${r.mensaje}: ${persona.nombre}`, aprobada ? 'success' : 'warning')
      recargar()
      return true
    } catch (err) {
      notificar(err.message, 'error')
      return false
    } finally {
      setOcupado(null)
    }
  }

  const confirmarRechazo = async () => {
    if (!motivo.trim()) {
      setErrorMotivo('Escribe qué debe corregir la persona')
      return
    }
    if (await revisar(rechazando, false, motivo.trim())) setRechazando(null)
  }

  const filtrar = (clave) => {
    setEstado(clave)
    setPagina(0)
  }

  return (
    <div>
      <div className="glass-card cabecera-vista">
        <h2 className="text-3d">
          <i className="fas fa-user-check" aria-hidden="true" /> Revisión de fotos de perfil
        </h2>
        <p>
          Confirma que la persona de la foto sea quien dice ser.{' '}
          <strong>Hasta que apruebes la foto, esa persona no tiene carnet digital activo.</strong>
        </p>
      </div>

      <div className="filtros-estado" role="group" aria-label="Filtrar por estado">
        {FILTROS.map(([clave, texto]) => (
          <button
            key={clave}
            type="button"
            className={`filtro-estado${estado === clave ? ' filtro-estado--activo' : ''}`}
            aria-pressed={estado === clave}
            onClick={() => filtrar(clave)}
          >
            {texto}
            {clave === 'pendiente' && data?.pendientes > 0 && ` (${data.pendientes})`}
          </button>
        ))}
      </div>

      {cargando && !data && <Skeleton filas={3} alto="8rem" />}
      {error && (
        <div className="glass-card estado-vacio" role="alert">
          <i className="fas fa-exclamation-triangle" aria-hidden="true" />
          <p>{error}</p>
          <button type="button" className="btn-outline" onClick={recargar}>
            Reintentar
          </button>
        </div>
      )}
      {!error && data && data.content.length === 0 && (
        <div className="glass-card estado-vacio">
          <i className="fas fa-check-circle" aria-hidden="true" />
          <h2>No hay fotos en esta lista</h2>
          <p>{estado === 'pendiente' ? 'Todas las fotos han sido revisadas.' : 'Nada que mostrar con este filtro.'}</p>
        </div>
      )}
      {!error && data?.content.length > 0 && (
        <ul className="rejilla-fotos" aria-busy={cargando}>
          {data.content.map((p) => (
            <TarjetaFoto
              key={p.usuarioId}
              persona={p}
              ocupado={ocupado === p.usuarioId}
              onAprobar={(x) => revisar(x, true)}
              onRechazar={(x) => {
                setMotivo('')
                setErrorMotivo(null)
                setRechazando(x)
              }}
            />
          ))}
        </ul>
      )}

      {data && data.totalPages > 1 && (
        <nav className="paginador" aria-label="Paginación">
          <span>
            Página {data.number + 1} de {data.totalPages}
          </span>
          <div className="paginador__botones">
            <button type="button" className="btn-outline" disabled={data.first} onClick={() => setPagina((p) => p - 1)}>
              <i className="fas fa-chevron-left" aria-hidden="true" /> Anterior
            </button>
            <button type="button" className="btn-outline" disabled={data.last} onClick={() => setPagina((p) => p + 1)}>
              Siguiente <i className="fas fa-chevron-right" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}

      <Modal
        abierto={Boolean(rechazando)}
        onCerrar={() => setRechazando(null)}
        titulo="Rechazar foto"
        ancho="sm"
        pie={
          <>
            <button type="button" className="btn-outline" onClick={() => setRechazando(null)}>
              Cancelar
            </button>
            <button type="button" className="btn-revision btn-rechazar" onClick={confirmarRechazo} disabled={Boolean(ocupado)}>
              <i className="fas fa-times" aria-hidden="true" /> Rechazar
            </button>
          </>
        }
      >
        <div className="floating-form">
          <p className="texto-ayuda">La foto se borra y la persona verá el motivo en su perfil.</p>
          <Campo etiqueta="Motivo del rechazo" error={errorMotivo} requerido>
            {(p) => <textarea {...p} rows={3} maxLength={500} value={motivo} onChange={(e) => setMotivo(e.target.value)} />}
          </Campo>
        </div>
      </Modal>
    </div>
  )
}
