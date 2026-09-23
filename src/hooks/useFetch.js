import { useCallback, useEffect, useRef, useState } from 'react'

// Los 4 estados de la interfaz: cargando, error, vacío y con datos. Cancela la petición si el componente se va
export function useFetch(funcion, dependencias = []) {
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const controlador = useRef(null)
  const funcionActual = useRef(funcion)
  const clave = JSON.stringify(dependencias)

  useEffect(() => {
    funcionActual.current = funcion
  })

  const ejecutar = useCallback(async () => {
    controlador.current?.abort()
    const actual = new AbortController()
    controlador.current = actual
    setCargando(true)
    setError(null)
    try {
      setData(await funcionActual.current(actual.signal))
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message || 'No se pudieron cargar los datos')
    } finally {
      if (!actual.signal.aborted) setCargando(false)
    }
  }, [])

  useEffect(() => {
    ejecutar()
    return () => controlador.current?.abort()
  }, [ejecutar, clave])

  const vacio = !cargando && !error && (!data || (Array.isArray(data) ? data.length === 0 : data.content?.length === 0))
  return { data, setData, cargando, error, vacio, recargar: ejecutar }
}
