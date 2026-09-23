import { useEffect } from 'react'
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react'

const ICONOS = { success: CircleCheck, error: CircleAlert, warning: TriangleAlert, info: Info }

export default function Toast({ id, mensaje, tipo = 'info', onClose, duracion = 4500 }) {
  useEffect(() => {
    const temporizador = setTimeout(() => onClose(id), duracion)
    return () => clearTimeout(temporizador)
  }, [id, onClose, duracion])

  const Icono = ICONOS[tipo] || Info
  return (
    <div className={`toast toast--${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <Icono size={20} aria-hidden="true" />
      <p>{mensaje}</p>
      <button type="button" className="boton-icono" onClick={() => onClose(id)} aria-label="Cerrar aviso">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
