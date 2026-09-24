import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'
import Campo from '../components/ui/Campo'
import { useAuth } from '../context/AuthContext'
import { useNotificacion } from '../context/NotificationContext'

const VACIO = { actual: '', nueva: '', confirmacion: '' }

function validar(datos) {
  const errores = {}
  if (!datos.actual) errores.actual = 'Escribe tu contraseña actual'
  if (datos.nueva.length < 8) errores.nueva = 'Mínimo 8 caracteres'
  else if (!/[a-zA-Z]/.test(datos.nueva) || !/\d/.test(datos.nueva)) errores.nueva = 'Combina letras y números'
  if (datos.confirmacion !== datos.nueva) errores.confirmacion = 'Las contraseñas no coinciden'
  return errores
}

export default function CambioContrasenaPage() {
  const { usuario, cambiarContrasena, logout } = useAuth()
  const { notificar } = useNotificacion()
  const navegar = useNavigate()
  const [datos, setDatos] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  if (!usuario) return <Navigate to="/login" replace />
  // Esta pantalla solo cambia la contraseña temporal; la API responde 403 a quien no la tiene
  if (!usuario.debeCambiarContrasena) return <Navigate to="/perfil" replace />

  const cambiar = (e) => setDatos((d) => ({ ...d, [e.target.name]: e.target.value }))
  const { permisos = {} } = usuario

  const enviar = async (e) => {
    e.preventDefault()
    const encontrados = validar(datos)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return
    setEnviando(true)
    setError(null)
    try {
      await cambiarContrasena(datos)
      notificar('Contraseña actualizada', 'success')
      navegar('/perfil', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout>
      <div className="auth-wrapper cambio-clave">
        <section className="glass-card cambio-clave__tarjeta" aria-labelledby="titulo-cambio">
          <div className="cambio-clave__cabecera">
            <i className="fas fa-lock" aria-hidden="true" />
            <h1 id="titulo-cambio" className="text-3d">
              Seguridad Institucional
            </h1>
            <p>
              Hola <strong>{usuario.nombre}</strong>, por normativas de seguridad del SENA, debes cambiar la contraseña temporal
              que te enviamos por una personal y secreta.
            </p>
          </div>

          <form className="floating-form" onSubmit={enviar} noValidate>
            {error && (
              <div className="error-alert" role="alert">
                <i className="fas fa-exclamation-circle" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
            <Campo etiqueta="Contraseña Actual (la temporal)" icono="fa-lock" error={errores.actual}>
              {(p) => <input {...p} name="actual" type="password" autoComplete="current-password" maxLength={72} value={datos.actual} onChange={cambiar} />}
            </Campo>
            <Campo etiqueta="Nueva Contraseña" icono="fa-key" error={errores.nueva} ayuda="Mínimo 8 caracteres, con letras y números">
              {(p) => <input {...p} name="nueva" type="password" autoComplete="new-password" maxLength={72} value={datos.nueva} onChange={cambiar} />}
            </Campo>
            <Campo etiqueta="Confirmar Contraseña" icono="fa-check-double" error={errores.confirmacion}>
              {(p) => <input {...p} name="confirmacion" type="password" autoComplete="new-password" maxLength={72} value={datos.confirmacion} onChange={cambiar} />}
            </Campo>

            <button type="submit" className="btn-glow cambio-clave__enviar" disabled={enviando}>
              {enviando ? 'Guardando...' : 'Guardar Contraseña y Continuar'} <i className="fas fa-arrow-right" aria-hidden="true" />
            </button>
            <button type="button" className="btn-outline cambio-clave__salir" onClick={logout}>
              <i className="fas fa-sign-out-alt" aria-hidden="true" /> Salir
            </button>
          </form>
        </section>

        <section className="glass-card cambio-clave__guia" aria-labelledby="titulo-guia">
          <h2 id="titulo-guia">
            <i className="fas fa-book-open" aria-hidden="true" /> Guía Rápida de Uso
          </h2>
          <p>Para garantizar tu ingreso a la institución, sigue estos pasos:</p>
          <div className="guia-pasos">
            <div className="guia-paso guia-paso--azul">
              <h3>
                <i className="fas fa-id-card" aria-hidden="true" /> 1. Completar tu Perfil (¡Obligatorio!)
              </h3>
              <p>
                Una vez cambies tu contraseña, irás a <strong>Mi Perfil</strong>. Debes rellenar todos tus datos (foto, tipo de
                sangre, documento, etc.). Solo así se generará tu <strong>código de barras</strong> personal que usarás en portería.
              </p>
            </div>
            {(permisos.operarPorteria || permisos.gestionarAsistencia || permisos.admin) && (
              <div className="guia-paso guia-paso--morado">
                <h3>
                  <i className="fas fa-layer-group" aria-hidden="true" /> 2. Tus Interfaces Especiales
                </h3>
                <p>Debido a tu rol, verás opciones adicionales en el menú lateral:</p>
                <ul>
                  {permisos.operarPorteria && (
                    <li>
                      <strong>Escáner Portería:</strong> para leer los códigos de barras de personas y equipos al ingresar o salir.
                    </li>
                  )}
                  {permisos.gestionarAsistencia && (
                    <li>
                      <strong>Asistencia:</strong> para gestionar o revisar las asistencias dentro de la institución.
                    </li>
                  )}
                  {permisos.admin && (
                    <li>
                      <strong>Gestión de Usuarios:</strong> para crear, editar y bloquear accesos a otras personas.
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </section>
      </div>
    </AuthLayout>
  )
}
