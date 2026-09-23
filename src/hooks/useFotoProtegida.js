import { useEffect, useState } from 'react'
import { perfilService } from '../services/api'

// La foto exige el token, así que no puede ir directo en <img src>: se pide y se muestra como blob
export function useFotoProtegida(usuarioId, version = 0) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!usuarioId) return undefined
    const controlador = new AbortController()
    let creada = null
    perfilService
      .foto(usuarioId, controlador.signal)
      .then((blob) => {
        creada = URL.createObjectURL(blob)
        setUrl(creada)
      })
      .catch(() => setUrl(null))
    return () => {
      controlador.abort()
      if (creada) URL.revokeObjectURL(creada)
    }
  }, [usuarioId, version])

  return url
}
