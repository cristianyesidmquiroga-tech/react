import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

const ENFOCABLES = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

// Modal de cristal de Portería 2 (glass-modal) con el foco atrapado mientras está abierto
export default function Modal({ abierto, onCerrar, titulo, children, pie, ancho = 'md' }) {
  const caja = useRef(null)
  const idTitulo = useId()
  // En una referencia para que un onCerrar nuevo en cada render no reinicie el foco
  const cerrar = useRef(onCerrar)
  useEffect(() => {
    cerrar.current = onCerrar
  }, [onCerrar])

  useEffect(() => {
    if (!abierto) return undefined
    const anterior = document.activeElement
    const raiz = document.getElementById('root')
    // El resto de la página queda inerte: ni el teclado ni el lector de pantalla salen del modal
    raiz.inert = true
    const elementos = () => [...caja.current.querySelectorAll(ENFOCABLES)].filter((e) => !e.disabled)
    const primerCampo = caja.current.querySelector('.modal-body input, .modal-body select, .modal-body textarea')
    ;(primerCampo || elementos()[0])?.focus()

    const teclado = (e) => {
      if (e.key === 'Escape') cerrar.current()
      if (e.key !== 'Tab') return
      const lista = elementos()
      if (lista.length === 0) return
      const primero = lista[0]
      const ultimo = lista[lista.length - 1]
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primero.focus()
      }
    }
    document.addEventListener('keydown', teclado)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', teclado)
      document.body.style.overflow = ''
      raiz.inert = false
      anterior?.focus()
    }
  }, [abierto])

  if (!abierto) return null

  return createPortal(
    <div className="glass-modal active" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className={`modal-content glass-card modal-content--${ancho}`} role="dialog" aria-modal="true" aria-labelledby={idTitulo} ref={caja}>
        <div className="modal-header">
          <h2 id={idTitulo}>{titulo}</h2>
          <button type="button" className="close-btn" onClick={onCerrar} aria-label="Cerrar">
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {pie && <div className="modal-actions modal-actions--pie">{pie}</div>}
      </div>
    </div>,
    document.body,
  )
}
