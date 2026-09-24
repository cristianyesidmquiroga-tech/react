// Etiqueta de estado con los colores de Portería 2 (contraste AA verificado en componentes.css)
export default function Insignia({ tipo = 'info', children }) {
  return <span className={`badge badge-${tipo}`}>{children}</span>
}
