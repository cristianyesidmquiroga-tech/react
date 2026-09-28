import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'
import Campo from '../components/ui/Campo'
import Captcha from '../components/ui/Captcha'
import { useAuth } from '../context/AuthContext'
import { useNotificacion } from '../context/NotificationContext'
import { useCaptcha } from '../hooks/useCaptcha'
import { authService } from '../services/api'

const TITULOS = { 1: 'Recuperar cuenta', 2: 'Código de verificación', 3: 'Nueva contraseña' }

export default function RecuperarPage() {
  const { usuario } = useAuth()
  const { notificar } = useNotificacion()
  const navegar = useNavigate()
  const captcha = useCaptcha()
  const [paso, setPaso] = useState(1)
  const [datos, setDatos] = useState({ correo: '', codigo: '', permiso: '', password: '', confirmacion: '' })
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  if (usuario) return <Navigate to="/perfil" replace />

  const poner = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }))

  const enviar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    const correo = datos.correo.trim()
    try {
      if (paso === 1) {
        await authService.pedirRecuperacion(correo, captcha.solucion)
        setPaso(2)
      } else if (paso === 2) {
        const r = await authService.verificarRecuperacion(correo, datos.codigo)
        setDatos((d) => ({ ...d, permiso: r.permiso }))
        setPaso(3)
      } else {
        const r = await authService.cambiarRecuperacion({ correo, permiso: datos.permiso, password: datos.password, confirmacion: datos.confirmacion })
        notificar(r.mensaje, 'success')
        navegar('/login', { replace: true })
      }
    } catch (err) {
      setError(err.message)
      if (paso === 1) captcha.renovar()
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout>
      <div className="glass-container acceso-contenedor">
        <div className="glass-card acceso-tarjeta">
          <div className="auth-header">
            <div className="auth-icon-wrapper">
              <i className="fas fa-key" aria-hidden="true" />
            </div>
            <h1 className="text-3d">{TITULOS[paso]}</h1>
            <p>Paso {paso} de 3</p>
          </div>
          <form className="floating-form" onSubmit={enviar}>
            {error && (
              <div className="error-alert" role="alert">
                <i className="fas fa-exclamation-circle" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
            {paso === 1 && (
              <>
                <Campo etiqueta="Correo" requerido>
                  {(p) => <input {...p} type="email" required maxLength={100} value={datos.correo} onChange={poner('correo')} />}
                </Campo>
                <Captcha estado={captcha.estado} />
              </>
            )}
            {paso === 2 && (
              <Campo etiqueta="Código de 6 dígitos" requerido>
                {(p) => (
                  <input {...p} inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={datos.codigo} onChange={(e) => setDatos((d) => ({ ...d, codigo: e.target.value.replace(/\D/g, '') }))} />
                )}
              </Campo>
            )}
            {paso === 3 && (
              <>
                <Campo etiqueta="Nueva contraseña" ayuda="Mínimo 8 caracteres, con letras y números" requerido>
                  {(p) => <input {...p} type="password" required maxLength={72} autoComplete="new-password" value={datos.password} onChange={poner('password')} />}
                </Campo>
                <Campo etiqueta="Confirmar contraseña" requerido>
                  {(p) => <input {...p} type="password" required maxLength={72} autoComplete="new-password" value={datos.confirmacion} onChange={poner('confirmacion')} />}
                </Campo>
              </>
            )}
            <button type="submit" className="glass-btn btn-glow acceso-enviar" disabled={enviando || (paso === 1 && captcha.estado === 'cargando')}>
              <span>{paso === 1 ? 'Enviar código' : paso === 2 ? 'Verificar' : 'Cambiar contraseña'}</span> <i className="fas fa-arrow-right" aria-hidden="true" />
            </button>
            <p className="pie-formulario">
              <Link to="/login">Volver al inicio de sesión</Link>
            </p>
          </form>
        </div>
      </div>
    </AuthLayout>
  )
}
