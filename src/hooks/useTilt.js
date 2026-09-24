import { useEffect } from 'react'
import VanillaTilt from 'vanilla-tilt'

const OPCIONES = [
  ['.card, .stat-card', { max: 5, speed: 400, glare: true, 'max-glare': 0.15 }],
  ['.glass-card:not(.carnet-card)', { max: 3, speed: 400, glare: true, 'max-glare': 0.2 }],
]

// Aplica la inclinación también a las tarjetas que aparecen después de cargar datos
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
      raiz.querySelectorAll('.card, .stat-card, .glass-card').forEach((el) => {
        const tilt = el.vanillaTilt
        if (!tilt) return
        tilt.destroy()
        // destroy() vuelve a programar este temporizador, que fallaría con el elemento ya borrado
        clearTimeout(tilt.transitionTimeout)
      })
    }
  }, [contenedorRef])
}
