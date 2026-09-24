import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Toast from '../components/ui/Toast'

const NotificationContext = createContext(null)

const TITULOS = { success: 'Éxito', danger: 'Atención', warning: 'Aviso', info: 'Aviso del Sistema' }

export function NotificationProvider({ children }) {
  const [avisos, setAvisos] = useState([])

  const cerrar = useCallback((id) => {
    setAvisos((lista) => lista.filter((a) => a.id !== id))
  }, [])

  // tipo: success | danger | warning | info (también acepta "error")
  const notificar = useCallback((mensaje, tipo = 'info', titulo) => {
    const normalizado = tipo === 'error' ? 'danger' : tipo
    const id = crypto.randomUUID()
    setAvisos((lista) => [...lista.slice(-3), { id, mensaje, tipo: normalizado, titulo: titulo || TITULOS[normalizado] }])
  }, [])

  const valor = useMemo(() => ({ notificar }), [notificar])

  return (
    <NotificationContext.Provider value={valor}>
      {children}
      {/* Fuera de #root para que sigan activos aunque un modal deje la página inerte */}
      {createPortal(
        <div id="toast-container" aria-live="polite">
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
