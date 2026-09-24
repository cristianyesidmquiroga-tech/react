import { useFotoProtegida } from '../../hooks/useFotoProtegida'
import { avatarUrl } from '../../services/api'

// Sin foto propia la API devuelve la silueta del cargo; mientras carga se muestra la misma silueta
export default function FotoUsuario({ usuarioId, cargo, version, alt, ...props }) {
  const foto = useFotoProtegida(usuarioId, version)
  return <img src={foto || avatarUrl(cargo)} alt={alt} decoding="async" {...props} />
}
