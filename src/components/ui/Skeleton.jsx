export default function Skeleton({ filas = 5, alto = '1.1rem' }) {
  return (
    <div className="skeleton" aria-hidden="true">
      {Array.from({ length: filas }, (_, i) => (
        <span key={i} className="skeleton__linea" style={{ height: alto }} />
      ))}
    </div>
  )
}
