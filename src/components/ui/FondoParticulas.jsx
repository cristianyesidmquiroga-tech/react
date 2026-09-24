import { useEffect } from 'react'
import urlParticulas from 'particles.js/particles.js?url'
import { useTema } from '../../context/ThemeContext'

// particles.js usa arguments.callee y falla como módulo ES
let cargaParticulas = null
function cargarParticulas() {
  cargaParticulas ??= new Promise((resolver, rechazar) => {
    const script = document.createElement('script')
    script.src = urlParticulas
    script.onload = resolver
    script.onerror = rechazar
    document.head.appendChild(script)
  })
  return cargaParticulas
}

// Verde SENA en claro, blanco en oscuro
function configuracion(color) {
  return {
    particles: {
      number: { value: 60, density: { enable: true, value_area: 800 } },
      color: { value: color },
      shape: { type: 'circle' },
      opacity: { value: 0.5, random: true },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, color, opacity: 0.3, width: 1 },
      move: { enable: true, speed: 1.5, direction: 'none', random: true, out_mode: 'out' },
    },
    interactivity: {
      detect_on: 'window',
      events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' } },
      modes: { grab: { distance: 200, line_linked: { opacity: 0.5 } }, push: { particles_nb: 4 } },
    },
    retina_detect: true,
  }
}

// destroypJS deja pJSDom en null, por eso se reinicia a mano
function destruir() {
  ;(window.pJSDom || []).forEach((p) => p?.pJS?.fn?.vendors?.destroypJS())
  window.pJSDom = []
}

export default function FondoParticulas() {
  const { tema } = useTema()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    let vigente = true
    cargarParticulas()
      .then(() => vigente && window.particlesJS('particles-js', configuracion(tema === 'dark' ? '#ffffff' : '#39A900')))
      .catch(() => {})
    return () => {
      vigente = false
      destruir()
    }
  }, [tema])

  return <div id="particles-js" aria-hidden="true" />
}
