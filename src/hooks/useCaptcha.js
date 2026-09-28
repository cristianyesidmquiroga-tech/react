import { useCallback, useEffect, useState } from 'react'
import { authService } from '../services/api'

const LOTE = 1000
const codificador = new TextEncoder()

async function huella(texto) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', codificador.encode(texto)))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

// Busca el número que reproduce el reto, por lotes para no congelar la página
async function resolver(desafio, cancelado) {
  for (let inicio = 0; inicio <= desafio.maxNumber; inicio += LOTE) {
    if (cancelado()) return null
    const fin = Math.min(inicio + LOTE - 1, desafio.maxNumber)
    const numeros = Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i)
    const huellas = await Promise.all(numeros.map((n) => huella(desafio.salt + n)))
    const indice = huellas.indexOf(desafio.challenge)
    if (indice >= 0) return numeros[indice]
  }
  return null
}

async function obtenerSolucion(cancelado) {
  const desafio = await authService.captcha()
  if (desafio.activo === false) return { estado: 'inactivo', solucion: null }
  const numero = await resolver(desafio, cancelado)
  if (numero === null) return { estado: 'error', solucion: null }
  const solucion = { algorithm: desafio.algorithm, challenge: desafio.challenge, number: numero, salt: desafio.salt, signature: desafio.signature }
  return { estado: 'listo', solucion: btoa(JSON.stringify(solucion)) }
}

// Cada solución sirve una sola vez: tras un intento fallido hay que llamar a renovar
export function useCaptcha() {
  const [resultado, setResultado] = useState({ estado: 'cargando', solucion: null })
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let cancelado = false
    obtenerSolucion(() => cancelado)
      .then((r) => !cancelado && setResultado(r))
      .catch(() => !cancelado && setResultado({ estado: 'error', solucion: null }))
    return () => {
      cancelado = true
    }
  }, [intento])

  const renovar = useCallback(() => {
    setResultado({ estado: 'cargando', solucion: null })
    setIntento((n) => n + 1)
  }, [])

  return { ...resultado, renovar }
}
