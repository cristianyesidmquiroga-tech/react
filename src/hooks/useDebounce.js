import { useEffect, useState } from 'react'

export function useDebounce(valor, espera = 300) {
  const [retrasado, setRetrasado] = useState(valor)

  useEffect(() => {
    const temporizador = setTimeout(() => setRetrasado(valor), espera)
    return () => clearTimeout(temporizador)
  }, [valor, espera])

  return retrasado
}
