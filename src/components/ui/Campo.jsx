import { useId } from 'react'

// Variantes "flotante" (etiqueta dentro del campo) y "grupo" (etiqueta arriba)
export default function Campo({ etiqueta, icono, error, ayuda, children, requerido, extra, variante = 'flotante', ancho }) {
  const id = useId()
  const idMensaje = `${id}-mensaje`
  const flotante = variante === 'flotante'
  const clases = [flotante ? null : 'glass-input', error ? 'input-error' : null].filter(Boolean).join(' ')
  const control =
    typeof children === 'function'
      ? children({
          id,
          placeholder: flotante ? ' ' : undefined,
          className: clases || undefined,
          'aria-invalid': Boolean(error),
          'aria-describedby': error || ayuda ? idMensaje : undefined,
        })
      : children
  const mensaje = (error || ayuda) && (
    <small id={idMensaje} className={error ? 'campo-mensaje campo-mensaje--error' : 'campo-mensaje'}>
      {error || ayuda}
    </small>
  )

  if (!flotante) {
    return (
      <div className={`form-group${ancho === 'completo' ? ' form-group--completo' : ''}`}>
        <label htmlFor={id}>
          {etiqueta}
          {requerido && <span aria-hidden="true"> *</span>}
        </label>
        {control}
        {mensaje}
      </div>
    )
  }

  return (
    <>
      <div className="floating-group">
        {control}
        <label htmlFor={id}>
          {icono && <i className={`fas ${icono}`} aria-hidden="true" />} {etiqueta}
          {requerido && <span aria-hidden="true"> *</span>}
        </label>
        {extra}
        <div className="floating-border" />
      </div>
      {mensaje}
    </>
  )
}
