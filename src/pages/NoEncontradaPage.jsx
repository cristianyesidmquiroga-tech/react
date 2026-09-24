import { Link } from 'react-router-dom'

export default function NoEncontradaPage() {
  return (
    <div className="glass-card estado-vacio estado-vacio--pagina">
      <i className="fas fa-map-signs" aria-hidden="true" />
      <h2>Página no encontrada</h2>
      <p>La dirección que buscas no existe o fue movida.</p>
      <Link to="/perfil" className="glass-btn">
        <i className="fas fa-home" aria-hidden="true" /> Volver al inicio
      </Link>
    </div>
  )
}
