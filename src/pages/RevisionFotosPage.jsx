import { useState } from 'react'
import Campo from '../components/ui/Campo'
import { avatarDeCargo } from '../components/ui/FotoUsuario'
import Modal from '../components/ui/Modal'
import Skeleton from '../components/ui/Skeleton'
import { useNotificacion } from '../context/NotificationContext'
import { useFetch } from '../hooks/useFetch'
import { useFotoProtegida } from '../hooks/useFotoProtegida'
import { adminService } from '../services/api'

function TarjetaFoto({ pendiente, onAprobar, onRechazar, ocupado }) {
  const url = useFotoProtegida(pendiente.usuarioId)
  const fecha = pendiente.fechaSubida ? new Date(pendiente.fechaSubida).toLocaleString('es-CO') : ''
  return (
    <li className="glass-card tarjeta-foto">
      <img
        src={url || avatarDeCargo(pendiente.cargo)}
        alt={`Foto de perfil de ${pendiente.nombre}`}
        className="foto-persona"
        loading="lazy"
        decoding="async"
        width="260"
        height="260"
      />
      <div className="datos-persona">
        <p className="datos-persona__nombre">{pendiente.nombre}</p>
        <p>
          {pendiente.cargo || 'Sin cargo'} · Doc. {pendiente.documento || 'N/A'}
        </p>
        {fecha && <p>Enviada: {fecha}</p>}
      </div>
      <div className="acciones-foto">
        <button type="button" className="btn-revision btn-aprobar" disabled={ocupado} onClick={() => onAprobar(pendiente)}>
          <i className="fas fa-check" aria-hidden="true" /> Aprobar
        </button>
        <button type="button" className="btn-revision btn-rechazar" disabled={ocupado} onClick={() => onRechazar(pendiente)}>
          <i className="fas fa-times" aria-hidden="true" /> Rechazar
        </button>
      </div>
    </li>
  )
}

export default function RevisionFotosPage() {
  const { notificar } = useNotificacion()
  const { data, setData, cargando, error, recargar } = useFetch(() => adminService.fotosPendientes(), [])
  const [ocupado, setOcupado] = useState(null)
  const [rechazando, setRechazando] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [errorMotivo, setErrorMotivo] = useState(null)

  const revisar = async (pendiente, aprobada, texto = null) => {
    setOcupado(pendiente.usuarioId)
    try {
      await adminService.revisarFoto(pendiente.usuarioId, aprobada, texto)
      setData((lista) => lista.filter((p) => p.usuarioId !== pendiente.usuarioId))
      notificar(aprobada ? `Foto de ${pendiente.nombre} aprobada` : `Foto de ${pendiente.nombre} rechazada`, aprobada ? 'success' : 'warning')
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

      {cargando && <Skeleton filas={3} alto="8rem" />}
      {error && (
        <div className="glass-card estado-vacio" role="alert">
          <i className="fas fa-exclamation-triangle" aria-hidden="true" />
          <p>{error}</p>
          <button type="button" className="btn-outline" onClick={recargar}>
            Reintentar
          </button>
        </div>
      )}
      {!cargando && !error && data?.length === 0 && (
        <div className="glass-card estado-vacio">
          <i className="fas fa-check-circle" aria-hidden="true" />
          <h2>No hay fotos en esta lista</h2>
          <p>Todas las fotos han sido revisadas.</p>
        </div>
      )}
      {data?.length > 0 && (
        <ul className="rejilla-fotos">
          {data.map((p) => (
            <TarjetaFoto
              key={p.usuarioId}
              pendiente={p}
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
          <Campo etiqueta="Motivo del rechazo" error={errorMotivo} ayuda="La persona verá este mensaje en su perfil" requerido>
            {(p) => <textarea {...p} rows={3} maxLength={500} value={motivo} onChange={(e) => setMotivo(e.target.value)} />}
          </Campo>
        </div>
      </Modal>
    </div>
  )
}
