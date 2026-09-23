import { Link } from 'react-router-dom'
import { MapPinOff } from 'lucide-react'

export default function NoEncontradaPage() {
  return (
    <div className="estado">
      <MapPinOff size={40} aria-hidden="true" />
      <h1>Página no encontrada</h1>
      <p>La dirección no existe o ya no está disponible.</p>
      <Link className="boton boton--secundario" to="/perfil">
        Ir a mi perfil
      </Link>
    </div>
  )
}
