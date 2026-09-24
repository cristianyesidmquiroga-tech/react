import { useEffect } from 'react'
import VanillaTilt from 'vanilla-tilt'

const OPCIONES = [
  ['.card, .stat-card', { max: 5, speed: 400, glare: true, 'max-glare': 0.15 }],
  ['.glass-card:not(.carnet-card)', { max: 3, speed: 400, glare: true, 'max-glare': 0.2 }],
]

// Inclinación de tarjetas de Portería 2. Las vistas pintan tarjetas después de pedir datos,
// por eso se vigila el contenedor y se aplica a las que van apareciendo.
export function useTilt(contenedorRef) {
  useEffect(() => {
    const raiz = contenedorRef.current
    if (!raiz || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const aplicar = () => {
      OPCIONES.forEach(([selector, opciones]) => {
        const nuevas = [...raiz.querySelectorAll(selector)].filter((el) => !el.vanillaTilt)
        if (nuevas.length) VanillaTilt.init(nuevas, opciones)
      })
    }
    aplicar()
    const observador = new MutationObserver(aplicar)
    observador.observe(raiz, { childList: true, subtree: true })
    return () => {
      observador.disconnect()
      raiz.querySelectorAll('.card, .stat-card, .glass-card').forEach((el) => el.vanillaTilt?.destroy())
    }
  }, [contenedorRef])
}
