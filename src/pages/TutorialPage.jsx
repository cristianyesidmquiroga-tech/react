import { Link } from 'react-router-dom'
import Skeleton from '../components/ui/Skeleton'
import { useFetch } from '../hooks/useFetch'
import { ayudaService } from '../services/api'

export default function TutorialPage() {
  const { data, error, recargar } = useFetch((signal) => ayudaService.tutorial(signal), [])

  return (
    <div>
      <div className="glass-card cabecera-mensajes">
        <h1 className="text-3d">
          <i className="fas fa-map-signs" aria-hidden="true" /> Tutorial: tus primeros pasos en el sistema
        </h1>
        <p>
          Para poder entrar al centro con tu código de barras necesitas completar estos pasos, en este orden. Cada uno trae
          un ejemplo de cómo hacerlo bien.
        </p>
      </div>
      {!data && !error && <Skeleton filas={4} alto="6rem" />}
      {error && (
        <div className="glass-card estado-vacio" role="alert">
          <i className="fas fa-exclamation-triangle" aria-hidden="true" />
          <p>{error}</p>
          <button type="button" className="btn-outline" onClick={recargar}>
            Reintentar
          </button>
        </div>
      )}
      {data?.pasos.map((p) => (
        <div key={p.titulo} className="glass-card categoria-ayuda">
          <div className="tut-paso-card">
            <div className="tut-paso-num" aria-hidden="true">
              <i className={`fas ${p.icono}`} />
            </div>
            <div>
              <h2 className="tut-paso-titulo">{p.titulo}</h2>
              <p className="tut-paso-texto">{p.descripcion}</p>
              <div className="tut-ejemplo">
                <strong>Ejemplo:</strong> {p.ejemplo}
              </div>
            </div>
          </div>
        </div>
      ))}
      {data && (
        <div className="glass-card contacto-asesor relanzar-tutorial">
          <p>
            ¿Prefieres que el sistema te lo muestre en la pantalla? El recorrido guiado resalta cada botón de tu perfil y te
            explica para qué sirve.
          </p>
          <Link to="/perfil?tutorial=1" className="btn-enviar">
            <i className="fas fa-play" aria-hidden="true" /> Ver el recorrido guiado
          </Link>
        </div>
      )}
    </div>
  )
}
