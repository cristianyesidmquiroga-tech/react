import { useEffect, useState } from 'react'

const ICONOS = { success: 'fa-check-circle', danger: 'fa-exclamation-circle', warning: 'fa-align-left', info: 'fa-info-circle' }

export default function Toast({ id, titulo, mensaje, tipo = 'info', onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const entrar = requestAnimationFrame(() => setVisible(true))
    const salir = setTimeout(() => setVisible(false), 4000)
    const quitar = setTimeout(() => onClose(id), 4500)
    return () => {
      cancelAnimationFrame(entrar)
      clearTimeout(salir)
      clearTimeout(quitar)
    }
  }, [id, onClose])

  return (
    <div className={`toast toast-${tipo}${visible ? ' show' : ''}`} role={tipo === 'danger' ? 'alert' : 'status'}>
      <div className="toast-icon">
        <i className={`fas ${ICONOS[tipo] || ICONOS.info}`} aria-hidden="true" />
      </div>
      <div className="toast-content">
        <span className="toast-title">{titulo}</span>
        <p className="toast-message">{mensaje}</p>
      </div>
      <div className="toast-progress">
        <div className="toast-progress-bar" />
      </div>
    </div>
  )
}
