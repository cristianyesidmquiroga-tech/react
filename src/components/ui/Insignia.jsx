export default function Insignia({ tipo = 'info', children }) {
  return <span className={`insignia insignia--${tipo}`}>{children}</span>
}
