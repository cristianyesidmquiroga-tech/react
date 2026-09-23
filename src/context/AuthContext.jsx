import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { authService, escucharSesion, sesionGuardada } from '../services/api'

const AuthContext = createContext(null)

// Se renueva el token cuando ya pasó la mitad de su vida y la persona sigue activa
const EVENTOS_ACTIVIDAD = ['pointerdown', 'keydown', 'scroll']

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(Boolean(sesionGuardada.leer()))
  const [aviso, setAviso] = useState(null)
  const vencimiento = useRef(0)
  const ultimaActividad = useRef(0)

  const aplicarSesion = useCallback((sesion) => {
    sesionGuardada.guardar(sesion.token)
    vencimiento.current = Date.now() + sesion.expiraEnMs
    setUsuario(sesion.usuario)
  }, [])

  const cerrarLocal = useCallback((mensaje) => {
    sesionGuardada.borrar()
    vencimiento.current = 0
    setUsuario(null)
    if (mensaje) setAviso(mensaje)
  }, [])

  useEffect(() => {
    if (!sesionGuardada.leer()) return
    authService
      .renovar()
      .then(aplicarSesion)
      .catch(() => cerrarLocal())
      .finally(() => setCargando(false))
  }, [aplicarSesion, cerrarLocal])

  useEffect(
    () =>
      escucharSesion((evento) => {
        if (evento.tipo === 'sesion-vencida') {
          cerrarLocal('Tu sesión se cerró por inactividad o porque se ingresó desde otro dispositivo')
        }
        if (evento.tipo === 'cambio-contrasena') {
          setUsuario((u) => (u ? { ...u, debeCambiarContrasena: true } : u))
        }
      }),
    [cerrarLocal],
  )

  useEffect(() => {
    if (!usuario) return undefined
    const marcar = () => {
      ultimaActividad.current = Date.now()
    }
    marcar()
    EVENTOS_ACTIVIDAD.forEach((e) => window.addEventListener(e, marcar, { passive: true }))
    const reloj = setInterval(() => {
      const restante = vencimiento.current - Date.now()
      const activo = Date.now() - ultimaActividad.current < 60_000
      if (restante > 0 && activo && restante < 5 * 60_000) {
        authService.renovar().then(aplicarSesion).catch(() => {})
      }
    }, 30_000)
    return () => {
      EVENTOS_ACTIVIDAD.forEach((e) => window.removeEventListener(e, marcar))
      clearInterval(reloj)
    }
  }, [usuario, aplicarSesion])

  const login = useCallback(
    async (identificador, password) => {
      const sesion = await authService.login(identificador, password)
      setAviso(null)
      aplicarSesion(sesion)
      return sesion.usuario
    },
    [aplicarSesion],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      cerrarLocal()
    }
  }, [cerrarLocal])

  const cambiarContrasena = useCallback(
    async (datos) => {
      const sesion = await authService.cambiarContrasena(datos)
      aplicarSesion(sesion)
    },
    [aplicarSesion],
  )

  const refrescarUsuario = useCallback(async () => {
    setUsuario(await authService.yo())
  }, [])

  const valor = useMemo(
    () => ({ usuario, cargando, aviso, login, logout, cambiarContrasena, refrescarUsuario }),
    [usuario, cargando, aviso, login, logout, cambiarContrasena, refrescarUsuario],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
