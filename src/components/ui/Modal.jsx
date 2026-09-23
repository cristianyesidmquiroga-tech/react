import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const ENFOCABLES = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

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
    const primerCampo = caja.current.querySelector('.modal__cuerpo input, .modal__cuerpo select, .modal__cuerpo textarea')
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
    <div className="modal-velo" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className={`modal modal--${ancho}`} role="dialog" aria-modal="true" aria-labelledby={idTitulo} ref={caja}>
        <header className="modal__cabecera">
          <h2 id={idTitulo}>{titulo}</h2>
          <button type="button" className="boton-icono" onClick={onCerrar} aria-label="Cerrar">
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="modal__cuerpo">{children}</div>
        {pie && <footer className="modal__pie">{pie}</footer>}
      </div>
    </div>,
    document.body,
  )
}
