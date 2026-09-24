import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const ConfirmContext = createContext(null)

/**
 * Confirmación global con el mismo diseño de Portería 2. Arranca en la opción segura (cancelar),
 * atrapa el foco entre sus dos botones y lo devuelve a quien la abrió.
 */
export function ConfirmProvider({ children }) {
  const [pedido, setPedido] = useState(null)
  const cancelar = useRef(null)
  const aceptar = useRef(null)
  const focoPrevio = useRef(null)

  const confirmar = useCallback(
    (titulo, mensaje, textoAceptar = 'Si, Eliminar') =>
      new Promise((resolver) => {
        focoPrevio.current = document.activeElement
        setPedido({ titulo, mensaje, textoAceptar, resolver })
      }),
    [],
  )

  const cerrar = useCallback(
    (respuesta) => {
      pedido?.resolver(respuesta)
      setPedido(null)
      focoPrevio.current?.focus?.()
    },
    [pedido],
  )

  useEffect(() => {
    if (!pedido) return undefined
    const raiz = document.getElementById('root')
    raiz.inert = true
    cancelar.current?.focus()
    const teclado = (e) => {
      if (e.key === 'Escape') cerrar(false)
      if (e.key !== 'Tab') return
      e.preventDefault()
      const siguiente = document.activeElement === cancelar.current ? aceptar.current : cancelar.current
      siguiente?.focus()
    }
    window.addEventListener('keydown', teclado)
    return () => {
      window.removeEventListener('keydown', teclado)
      raiz.inert = false
    }
  }, [pedido, cerrar])

  const valor = useMemo(() => ({ confirmar }), [confirmar])

  return (
    <ConfirmContext.Provider value={valor}>
      {children}
      {pedido &&
        createPortal(
          <div className="confirm-modal-overlay active" style={{ display: 'flex' }}>
            <div className="confirm-modal-card glass-card" role="alertdialog" aria-modal="true" aria-labelledby="confirm-modal-title" aria-describedby="confirm-modal-message">
              <div className="confirm-modal-header">
                <div className="confirm-icon-outer">
                  <i className="fas fa-exclamation-triangle" aria-hidden="true" />
                </div>
                <h3 id="confirm-modal-title" className="text-3d">{pedido.titulo}</h3>
              </div>
              <div className="confirm-modal-body">
                <p id="confirm-modal-message">{pedido.mensaje}</p>
              </div>
              <div className="confirm-modal-actions">
                <button ref={cancelar} type="button" className="glass-btn btn-cancel" onClick={() => cerrar(false)}>
                  <i className="fas fa-times" aria-hidden="true" /> No, Cancelar
                </button>
                <button ref={aceptar} type="button" className="glass-btn btn-danger-action" onClick={() => cerrar(true)}>
                  <i className="fas fa-trash-alt" aria-hidden="true" /> {pedido.textoAceptar}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </ConfirmContext.Provider>
  )
}

export const useConfirmar = () => useContext(ConfirmContext).confirmar
