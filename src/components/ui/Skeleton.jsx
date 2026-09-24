export default function Skeleton({ filas = 5, alto = '1.1rem' }) {
  return (
    <div className="skeleton" role="status" aria-label="Cargando">
      {Array.from({ length: filas }, (_, i) => (
        <span key={i} className="skeleton__linea" style={{ height: alto }} />
      ))}
    </div>
  )
}
