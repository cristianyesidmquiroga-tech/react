import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

// Si un elemento no está en pantalla (menú plegado, sin permiso de equipos) su paso se salta
const PASOS = [
  {
    selector: null,
    titulo: '¡Bienvenido al sistema de acceso del SENA!',
    texto:
      'Este recorrido te muestra en un minuto lo que necesitas hacer para activar tu carnet digital y poder entrar al centro con tu código de barras. Puedes avanzar con el botón "Continuar" o con la tecla Enter, y salir cuando quieras con "Saltar" o la tecla Escape.',
  },
  {
    selector: '.profile-quick-actions .gradient-blue',
    titulo: '1. Completa tu información',
    texto:
      'Con este botón abres el formulario de tus datos: tipo y número de documento, tipo de sangre, y si eres aprendiz también tu programa y tu ficha. Sin estos datos el carnet no se puede activar.',
  },
  {
    selector: '.profile-quick-actions .gradient-blue',
    titulo: '2. Sube tu foto',
    texto:
      'En ese mismo formulario subes tu foto de perfil. Debe salir solo tu rostro, despejado (sin gorra ni mascarilla; gafas sí se permiten), con buena luz, de frente y de cerca. En portería el celador la compara contigo para dejarte entrar.',
  },
  {
    selector: '.carnet-oficial',
    titulo: '3. Tu carnet digital',
    texto:
      'Este es tu carnet institucional. Se completa solo a medida que llenas tus datos. Tu foto la revisa un asesor: hasta que la apruebe, el carnet y el código de barras permanecen bloqueados.',
  },
  {
    selector: '.carnet-of-barras',
    titulo: '4. Tu código de barras de acceso',
    texto:
      'Aquí aparecerá tu código de barras cuando tu perfil esté completo y tu foto aprobada. Es el que presentas al escáner de portería para entrar y salir del centro.',
  },
  {
    selector: '.profile-quick-actions .gradient-orange',
    titulo: '5. Registra tus equipos',
    texto:
      'Si vas a entrar con portátil o tablet, regístralo aquí antes de traerlo: nombre, tipo y número de serial. El celador marca cuáles traes al entrar y al salir.',
  },
  {
    selector: '.sidebar-nav a[href="/ayuda"]',
    titulo: '6. Centro de Ayuda',
    texto:
      'Si algo falla (te rechazan la foto, el código de barras no aparece, tu ficha está mal), aquí están las respuestas a las dudas más comunes.',
  },
  {
    selector: '.sidebar-nav a[href="/mensajes"]',
    titulo: '7. Mensajes con un asesor',
    texto:
      'Y si la respuesta no está en el Centro de Ayuda, por aquí hablas directamente con un asesor sin tener que buscar a nadie en portería.',
  },
  {
    selector: null,
    titulo: '¡Listo!',
    texto:
      'Eso es todo. Recuerda el orden: completa tus datos, sube tu foto, espera la aprobación y usa tu código de barras en portería. Mientras tu perfil esté incompleto verás un botón para releer este tutorial con ejemplos, en el aviso rojo.',
  },
]

const MARGEN = 8
const reducirMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function visible(selector) {
  if (!selector) return true
  const el = document.querySelector(selector)
  if (!el) return false
  const caja = el.getBoundingClientRect()
  return caja.width > 0 && caja.height > 0 && caja.right > 0 && caja.left < window.innerWidth
}

export default function RecorridoGuiado({ onTerminar }) {
  const [pasos] = useState(() => PASOS.filter((p) => visible(p.selector)))
  const [indice, setIndice] = useState(0)
  const [caja, setCaja] = useState(null)
  const globo = useRef(null)
  const focoPrevio = useRef(document.activeElement)
  const paso = pasos[indice]
  const ultimo = indice === pasos.length - 1

  const terminar = useCallback(() => {
    onTerminar()
    focoPrevio.current?.focus?.()
  }, [onTerminar])

  // Guarda el recuadro del objetivo y el alto del globo para decidir si va debajo o encima
  const medir = useCallback(() => {
    const rect = paso?.selector ? document.querySelector(paso.selector)?.getBoundingClientRect() : null
    setCaja(rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height, bottom: rect.bottom, alto: globo.current?.offsetHeight || 200 } : null)
  }, [paso])

  useLayoutEffect(() => {
    if (paso?.selector) document.querySelector(paso.selector)?.scrollIntoView({ block: 'center', behavior: 'auto' })
    medir()
    globo.current?.querySelector('.tut-btn-primario')?.focus()
  }, [paso, medir])

  useEffect(() => {
    window.addEventListener('resize', medir)
    window.addEventListener('scroll', medir, true)
    return () => {
      window.removeEventListener('resize', medir)
      window.removeEventListener('scroll', medir, true)
    }
  }, [medir])

  useEffect(() => {
    const teclado = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        terminar()
      }
      if (e.key !== 'Tab' || !globo.current) return
      const focables = [...globo.current.querySelectorAll('button:not(:disabled), a[href]')]
      const primero = focables[0]
      const final = focables[focables.length - 1]
      if (!globo.current.contains(document.activeElement)) {
        e.preventDefault()
        primero.focus()
      } else if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault()
        final.focus()
      } else if (!e.shiftKey && document.activeElement === final) {
        e.preventDefault()
        primero.focus()
      }
    }
    document.addEventListener('keydown', teclado, true)
    return () => document.removeEventListener('keydown', teclado, true)
  }, [terminar])

  if (!paso) return null

  let estiloGlobo = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  if (caja) {
    const debajo = caja.bottom + MARGEN * 2 + caja.alto < window.innerHeight
    estiloGlobo = {
      top: debajo ? caja.bottom + MARGEN * 2 : Math.max(8, caja.top - caja.alto - MARGEN * 2),
      left: Math.max(16, Math.min(caja.left, window.innerWidth - 356)),
    }
  }

  return createPortal(
    <>
      <div
        className={`tut-resaltado${reducirMovimiento() ? '' : ' tut-anim'}${caja ? '' : ' tut-resaltado--centro'}`}
        style={
          caja
            ? { top: caja.top - MARGEN, left: caja.left - MARGEN, width: caja.width + MARGEN * 2, height: caja.height + MARGEN * 2 }
            : undefined
        }
        aria-hidden="true"
      />
      <div ref={globo} className="tut-globo" role="dialog" aria-modal="true" aria-labelledby="tut-titulo" aria-describedby="tut-texto" style={estiloGlobo}>
        <div className="tut-progreso">
          Paso {indice + 1} de {pasos.length}
        </div>
        <h2 id="tut-titulo">{paso.titulo}</h2>
        <p id="tut-texto">{paso.texto}</p>
        {ultimo && (
          <p className="tut-enlace">
            También puedes{' '}
            <Link to="/tutorial" onClick={terminar}>
              leer el tutorial completo con ejemplos
            </Link>
            .
          </p>
        )}
        <div className="tut-acciones">
          <button type="button" className="tut-btn tut-btn-secundario" onClick={terminar}>
            Saltar
          </button>
          <button type="button" className="tut-btn tut-btn-secundario" disabled={indice === 0} onClick={() => setIndice(indice - 1)}>
            Anterior
          </button>
          <button type="button" className="tut-btn tut-btn-primario" onClick={() => (ultimo ? terminar() : setIndice(indice + 1))}>
            {ultimo ? 'Finalizar' : 'Continuar'}
          </button>
        </div>
      </div>
      <div className="solo-lectores" aria-live="polite">
        Paso {indice + 1} de {pasos.length}. {paso.titulo}. {paso.texto}
      </div>
    </>,
    document.body,
  )
}
