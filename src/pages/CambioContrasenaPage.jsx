import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CircleAlert, KeyRound } from 'lucide-react'
import Campo from '../components/ui/Campo'
import { useAuth } from '../context/AuthContext'
import { useNotificacion } from '../context/NotificationContext'
import './auth.css'

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

  const cambiar = (e) => setDatos((d) => ({ ...d, [e.target.name]: e.target.value }))

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
    <main className="acceso">
      <section className="acceso__tarjeta" aria-labelledby="titulo-cambio">
        <div className="acceso__marca">
          <KeyRound size={36} aria-hidden="true" />
          <div>
            <h1 id="titulo-cambio">Cambia tu contraseña</h1>
            <p>
              {usuario.debeCambiarContrasena
                ? 'Entraste con una contraseña temporal. Crea una propia para continuar.'
                : 'Crea una contraseña nueva para tu cuenta.'}
            </p>
          </div>
        </div>
        {error && (
          <p className="alerta alerta--peligro" role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
        <form className="formulario" onSubmit={enviar} noValidate>
          <Campo etiqueta="Contraseña actual" error={errores.actual} requerido>
            {(p) => <input {...p} name="actual" type="password" autoComplete="current-password" maxLength={72} value={datos.actual} onChange={cambiar} />}
          </Campo>
          <Campo etiqueta="Nueva contraseña" error={errores.nueva} ayuda="Mínimo 8 caracteres, con letras y números" requerido>
            {(p) => <input {...p} name="nueva" type="password" autoComplete="new-password" maxLength={72} value={datos.nueva} onChange={cambiar} />}
          </Campo>
          <Campo etiqueta="Confirmar contraseña" error={errores.confirmacion} requerido>
            {(p) => <input {...p} name="confirmacion" type="password" autoComplete="new-password" maxLength={72} value={datos.confirmacion} onChange={cambiar} />}
          </Campo>
          <button type="submit" className="boton boton--primario boton--bloque" disabled={enviando}>
            {enviando ? 'Guardando...' : 'Guardar contraseña'}
          </button>
          <button type="button" className="boton boton--fantasma boton--bloque" onClick={logout}>
            Salir
          </button>
        </form>
      </section>
    </main>
  )
}
