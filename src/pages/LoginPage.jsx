import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'
import Campo from '../components/ui/Campo'
import { useAuth } from '../context/AuthContext'
import logoSena from '../assets/img/logoSena.png'

export default function LoginPage() {
  const { usuario, login, aviso } = useAuth()
  const navegar = useNavigate()
  const { state } = useLocation()
  const [identificador, setIdentificador] = useState('')
  const [password, setPassword] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [bloqueo, setBloqueo] = useState(0)

  useEffect(() => {
    if (bloqueo <= 0) return undefined
    const reloj = setInterval(() => setBloqueo((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(reloj)
  }, [bloqueo])

  if (usuario) return <Navigate to={state?.desde || '/perfil'} replace />

  const enviar = async (e) => {
    e.preventDefault()
    if (!identificador.trim() || !password) {
      setError('Escribe tu correo o documento y tu contraseña')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      const u = await login(identificador.trim(), password)
      navegar(u.debeCambiarContrasena ? '/cambiar-contrasena' : state?.desde || '/perfil', { replace: true })
    } catch (err) {
      setError(err.message)
      if (err.bloqueadoSegundos) setBloqueo(err.bloqueadoSegundos)
      setPassword('')
    } finally {
      setEnviando(false)
    }
  }

  const minutos = Math.floor(bloqueo / 60)
  const segundos = String(bloqueo % 60).padStart(2, '0')

  return (
    <AuthLayout>
      <div className="auth-split-wrapper">
        <div className="branding-section">
          <img src={logoSena} alt="SENA Logo" className="branding-logo" />
          <h2 className="branding-title">
            Únete al <span className="text-accent-green">Centro de Gestión</span>{' '}
            <span className="text-accent-orange">Agroempresarial</span> <span className="text-accent-green">del Oriente</span>
          </h2>
          <p className="branding-description">
            Gestiona tu acceso, equipos y carnet digital de forma fluida, rápida y segura con nuestro sistema dinámico.
          </p>
        </div>

        <div className="form-section">
          <div className="glass-container acceso-contenedor">
            <div className="glass-card acceso-tarjeta">
              <div className="auth-header">
                <div className="auth-icon-wrapper">
                  <i className="fas fa-shield-alt" aria-hidden="true" />
                </div>
                <h1 className="text-3d">Bienvenido</h1>
                <p>Acceso unificado al sistema de identidad institucional.</p>
              </div>

              <form className="floating-form" onSubmit={enviar} noValidate>
                {aviso && !error && (
                  <div className="error-alert error-alert--info" role="status">
                    <i className="fas fa-info-circle" aria-hidden="true" />
                    <span>{aviso}</span>
                  </div>
                )}
                {error && (
                  <div className="error-alert" role="alert">
                    <i className={`fas ${bloqueo > 0 ? 'fa-lock' : 'fa-exclamation-circle'}`} aria-hidden="true" />
                    <span>
                      {error}
                      {bloqueo > 0 && ` Intenta de nuevo en ${minutos}:${segundos}.`}
                    </span>
                  </div>
                )}

                <Campo etiqueta="Correo o Documento">
                  {(props) => (
                    <input
                      {...props}
                      className={bloqueo > 0 ? 'input-error' : undefined}
                      autoComplete="username"
                      maxLength={100}
                      value={identificador}
                      onChange={(e) => setIdentificador(e.target.value)}
                    />
                  )}
                </Campo>
                <Campo
                  etiqueta="Contraseña"
                  extra={
                    <button
                      type="button"
                      className={`password-toggle-btn${verClave ? ' active' : ''}`}
                      onClick={() => setVerClave((v) => !v)}
                      aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      <i className={`far ${verClave ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
                    </button>
                  }
                >
                  {(props) => (
                    <input
                      {...props}
                      className="input-con-boton"
                      type={verClave ? 'text' : 'password'}
                      autoComplete="current-password"
                      maxLength={72}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  )}
                </Campo>

                <button type="submit" className="glass-btn btn-glow acceso-enviar" disabled={enviando || bloqueo > 0}>
                  {enviando ? (
                    <>
                      <i className="fas fa-spinner fa-spin" aria-hidden="true" /> <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span>Ingresar de Forma Segura</span> <i className="fas fa-arrow-right" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
