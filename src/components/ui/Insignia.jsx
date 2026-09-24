export default function Insignia({ tipo = 'info', children }) {
  return <span className={`badge badge-${tipo}`}>{children}</span>
}
