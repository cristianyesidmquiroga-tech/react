import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'
import Campo from '../components/ui/Campo'
import Captcha from '../components/ui/Captcha'
import { useAuth } from '../context/AuthContext'
import { useCaptcha } from '../hooks/useCaptcha'
import { authService } from '../services/api'

const VACIO = { nombre: '', correo: '', documento: '', password: '', confirmacion: '', aceptaDatos: false }

export default function RegistroPage() {
  const { usuario, login } = useAuth()
  const navegar = useNavigate()
  const captcha = useCaptcha()
  const [datos, setDatos] = useState(VACIO)
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  if (usuario) return <Navigate to="/perfil" replace />

  const cambiar = (e) => {
    const { name, type, checked, value } = e.target
    setDatos((d) => ({ ...d, [name]: type === 'checkbox' ? checked : value }))
  }

  const enviar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await authService.registrar({ ...datos, captcha: captcha.solucion })
      await login(datos.correo.trim(), datos.password)
      navegar('/verificar', { replace: true })
    } catch (err) {
      setError(err.message)
      captcha.renovar()
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
              <i className="fas fa-user-plus" aria-hidden="true" />
            </div>
            <h1 className="text-3d">Registro</h1>
            <p>Crea tu cuenta para usar el sistema.</p>
          </div>
          <form className="floating-form" onSubmit={enviar}>
            {error && (
              <div className="error-alert" role="alert">
                <i className="fas fa-exclamation-circle" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
            <Campo etiqueta="Nombre completo" requerido>
              {(p) => <input {...p} name="nombre" required maxLength={100} value={datos.nombre} onChange={cambiar} />}
            </Campo>
            <Campo etiqueta="Correo" requerido>
              {(p) => <input {...p} name="correo" type="email" required maxLength={100} value={datos.correo} onChange={cambiar} />}
            </Campo>
            <Campo etiqueta="Documento (sin puntos)" requerido>
              {(p) => <input {...p} name="documento" required maxLength={15} value={datos.documento} onChange={cambiar} />}
            </Campo>
            <Campo etiqueta="Contraseña" ayuda="Mínimo 8 caracteres, con letras y números" requerido>
              {(p) => <input {...p} name="password" type="password" required maxLength={72} autoComplete="new-password" value={datos.password} onChange={cambiar} />}
            </Campo>
            <Campo etiqueta="Confirmar contraseña" requerido>
              {(p) => <input {...p} name="confirmacion" type="password" required maxLength={72} autoComplete="new-password" value={datos.confirmacion} onChange={cambiar} />}
            </Campo>
            <div className="autorizacion-datos">
              <input type="checkbox" id="aceptaDatos" name="aceptaDatos" required checked={datos.aceptaDatos} onChange={cambiar} />
              <label htmlFor="aceptaDatos">
                Autorizo el tratamiento de mis datos personales según la{' '}
                <Link to="/politica-privacidad" target="_blank">
                  política de privacidad
                </Link>
                .
              </label>
            </div>
            <Captcha estado={captcha.estado} />
            <button type="submit" className="glass-btn btn-glow acceso-enviar" disabled={enviando || captcha.estado === 'cargando'}>
              <span>{enviando ? 'Procesando...' : 'Registrarme'}</span> <i className="fas fa-arrow-right" aria-hidden="true" />
            </button>
            <p className="pie-formulario">
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          </form>
        </div>
      </div>
    </AuthLayout>
  )
}
