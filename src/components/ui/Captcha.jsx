const MENSAJES = {
  cargando: 'Verificando que eres una persona...',
  listo: 'Verificado. Ya puedes enviar el formulario.',
  error: 'No se pudo completar la verificación. Recarga la página.',
}

// Sin desafío activo en el servidor no se pinta nada
export default function Captcha({ estado }) {
  if (estado === 'inactivo') return null
  return (
    <div className={`captcha-caja${estado === 'listo' ? ' captcha-listo' : ''}`}>
      <i className="fas fa-shield-alt" aria-hidden="true" />
      <span role="status" aria-live="polite">
        {MENSAJES[estado]}
      </span>
    </div>
  )
}
