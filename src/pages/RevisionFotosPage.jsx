import { useState } from 'react'
import { Check, ImageOff, UserRound, X } from 'lucide-react'
import Campo from '../components/ui/Campo'
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
    <li className="tarjeta revision">
      <div className="revision__foto">
        {url ? <img src={url} alt={`Foto enviada por ${pendiente.nombre}`} width="160" height="200" /> : <UserRound size={48} aria-hidden="true" />}
      </div>
      <div className="revision__datos">
        <strong>{pendiente.nombre}</strong>
        <span>{pendiente.cargo || 'Sin cargo'}</span>
        <span>Documento: {pendiente.documento || 'Sin registrar'}</span>
        <span>Enviada: {fecha}</span>
      </div>
      <div className="revision__acciones">
        <button type="button" className="boton boton--primario" disabled={ocupado} onClick={() => onAprobar(pendiente)}>
          <Check size={18} aria-hidden="true" />
          Aprobar
        </button>
        <button type="button" className="boton boton--secundario" disabled={ocupado} onClick={() => onRechazar(pendiente)}>
          <X size={18} aria-hidden="true" />
          Rechazar
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
      <header className="pagina-cabecera">
        <div>
          <h1>Revisar fotos</h1>
          <p>Confirma que cada foto sea de la persona antes de activar su carnet</p>
        </div>
      </header>

      {cargando && <Skeleton filas={3} alto="8rem" />}
      {error && (
        <div className="estado estado--error" role="alert">
          <p>{error}</p>
          <button type="button" className="boton boton--secundario" onClick={recargar}>
            Reintentar
          </button>
        </div>
      )}
      {!cargando && !error && data?.length === 0 && (
        <div className="estado">
          <ImageOff size={32} aria-hidden="true" />
          <p>No hay fotos pendientes de revisión</p>
        </div>
      )}
      {data?.length > 0 && (
        <ul className="revisiones">
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
            <button type="button" className="boton boton--secundario" onClick={() => setRechazando(null)}>
              Cancelar
            </button>
            <button type="button" className="boton boton--peligro" onClick={confirmarRechazo} disabled={Boolean(ocupado)}>
              Rechazar
            </button>
          </>
        }
      >
        <Campo etiqueta="Motivo del rechazo" error={errorMotivo} ayuda="La persona verá este mensaje en su perfil" requerido>
          {(p) => <textarea {...p} maxLength={500} value={motivo} onChange={(e) => setMotivo(e.target.value)} />}
        </Campo>
      </Modal>
    </div>
  )
}
