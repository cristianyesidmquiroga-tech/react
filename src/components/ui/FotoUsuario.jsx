import { useFotoProtegida } from '../../hooks/useFotoProtegida'

const AVATARES = import.meta.glob('../../assets/img/perfiles/*.svg', { eager: true, import: 'default' })

// Mientras no haya foto aprobada se muestra la silueta del cargo, como en Portería 2
export function avatarDeCargo(cargo) {
  const nombre = (cargo || '').toLowerCase()
  return AVATARES[`../../assets/img/perfiles/${nombre}.svg`] || AVATARES['../../assets/img/perfiles/generico.svg']
}

export default function FotoUsuario({ usuarioId, cargo, version, alt, ...props }) {
  const foto = useFotoProtegida(usuarioId, version)
  return <img src={foto || avatarDeCargo(cargo)} alt={alt} decoding="async" {...props} />
}
