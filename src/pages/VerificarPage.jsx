import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'
import Campo from '../components/ui/Campo'
import { useAuth } from '../context/AuthContext'
import { useNotificacion } from '../context/NotificationContext'
import { authService } from '../services/api'

export default function VerificarPage() {
  const { usuario, verificarCorreo, logout } = useAuth()
  const { notificar } = useNotificacion()
  const navegar = useNavigate()
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  if (!usuario) return <Navigate to="/login" replace />
  if (usuario.correoVerificado !== false) return <Navigate to="/perfil" replace />

  const enviar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await verificarCorreo(codigo)
      notificar('Correo verificado', 'success')
      navegar('/perfil', { replace: true })
    } catch (err) {
      setError(err.message)
      setCodigo('')
    } finally {
      setEnviando(false)
    }
  }

  const reenviar = async () => {
    setError(null)
    try {
      notificar((await authService.reenviarCodigo()).mensaje, 'success')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <AuthLayout>
      <div className="glass-container acceso-contenedor">
        <div className="glass-card acceso-tarjeta">
          <div className="auth-header">
            <div className="auth-icon-wrapper">
              <i className="fas fa-user-shield" aria-hidden="true" />
            </div>
            <h1 className="text-3d">Verifica tu correo</h1>
            <p>Escribe el código de 6 dígitos que te enviamos.</p>
          </div>
          <form className="floating-form" onSubmit={enviar}>
            {error && (
              <div className="error-alert" role="alert">
                <i className="fas fa-exclamation-circle" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
            <Campo etiqueta="Código" requerido>
              {(p) => (
                <input {...p} inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))} />
              )}
            </Campo>
            <button type="submit" className="glass-btn btn-glow acceso-enviar" disabled={enviando || codigo.length !== 6}>
              <span>Verificar</span> <i className="fas fa-shield-alt" aria-hidden="true" />
            </button>
            <button type="button" className="btn-outline cambio-clave__salir" onClick={reenviar}>
              <i className="fas fa-sync-alt" aria-hidden="true" /> Enviar código nuevo
            </button>
            <p className="pie-formulario">
              <Link to="/login" onClick={logout}>
                Salir
              </Link>
            </p>
          </form>
        </div>
      </div>
    </AuthLayout>
  )
}
