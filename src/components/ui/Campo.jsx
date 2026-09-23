import { useId } from 'react'

// Etiqueta, control y mensaje de error enlazados para lectores de pantalla
export default function Campo({ etiqueta, error, ayuda, children, requerido }) {
  const id = useId()
  const idMensaje = `${id}-mensaje`
  const control = typeof children === 'function'
    ? children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': error || ayuda ? idMensaje : undefined })
    : children

  return (
    <div className={`campo${error ? ' campo--error' : ''}`}>
      <label htmlFor={id}>
        {etiqueta}
        {requerido && <span aria-hidden="true"> *</span>}
      </label>
      {control}
      {(error || ayuda) && (
        <small id={idMensaje} className={error ? 'campo__error' : 'campo__ayuda'}>
          {error || ayuda}
        </small>
      )}
    </div>
  )
}
