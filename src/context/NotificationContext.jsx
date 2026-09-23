import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Toast from '../components/ui/Toast'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [avisos, setAvisos] = useState([])

  const cerrar = useCallback((id) => {
    setAvisos((lista) => lista.filter((a) => a.id !== id))
  }, [])

  const notificar = useCallback((mensaje, tipo = 'info') => {
    const id = crypto.randomUUID()
    setAvisos((lista) => [...lista.slice(-3), { id, mensaje, tipo }])
  }, [])

  const valor = useMemo(() => ({ notificar }), [notificar])

  return (
    <NotificationContext.Provider value={valor}>
      {children}
      {/* Fuera de #root para que los avisos sigan activos aunque un modal deje la página inerte */}
      {createPortal(
        <div className="toasts" aria-live="polite" aria-atomic="false">
          {avisos.map((a) => (
            <Toast key={a.id} {...a} onClose={cerrar} />
          ))}
        </div>,
        document.body,
      )}
    </NotificationContext.Provider>
  )
}

export const useNotificacion = () => useContext(NotificationContext)
