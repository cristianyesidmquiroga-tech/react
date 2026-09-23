import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { CircleAlert, Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react'
import Campo from '../components/ui/Campo'
import { useAuth } from '../context/AuthContext'
import './auth.css'

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
    <main className="acceso">
      <section className="acceso__tarjeta" aria-labelledby="titulo-login">
        <div className="acceso__marca">
          <ShieldCheck size={40} aria-hidden="true" />
          <div>
            <h1 id="titulo-login">Portería SENA</h1>
            <p>Ingresa con tu correo o número de documento</p>
          </div>
        </div>

        {aviso && !error && (
          <p className="alerta alerta--info" role="status">
            {aviso}
          </p>
        )}
        {error && (
          <p className="alerta alerta--peligro" role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            <span>
              {error}
              {bloqueo > 0 && ` Intenta de nuevo en ${minutos}:${segundos}.`}
            </span>
          </p>
        )}

        <form className="formulario" onSubmit={enviar} noValidate>
          <Campo etiqueta="Correo o documento" requerido>
            {(props) => (
              <input
                {...props}
                autoComplete="username"
                maxLength={100}
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
              />
            )}
          </Campo>
          <Campo etiqueta="Contraseña" requerido>
            {(props) => (
              <div className="campo-clave">
                <input
                  {...props}
                  type={verClave ? 'text' : 'password'}
                  autoComplete="current-password"
                  maxLength={72}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="boton-icono"
                  onClick={() => setVerClave((v) => !v)}
                  aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {verClave ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            )}
          </Campo>
          <button type="submit" className="boton boton--primario boton--bloque" disabled={enviando || bloqueo > 0}>
            <LogIn size={18} aria-hidden="true" />
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </section>
    </main>
  )
}
