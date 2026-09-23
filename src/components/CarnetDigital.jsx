import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import { Lock, UserRound } from 'lucide-react'
import './carnet.css'

// Code128 del documento, el mismo formato que lee el escáner de portería
export default function CarnetDigital({ carnet, fotoUrl }) {
  const barras = useRef(null)

  useEffect(() => {
    if (!carnet?.codigoBarras || !barras.current) return
    JsBarcode(barras.current, carnet.codigoBarras, {
      format: 'CODE128',
      displayValue: false,
      height: 60,
      margin: 0,
      background: 'transparent',
    })
  }, [carnet?.codigoBarras])

  if (!carnet) return null
  const aprendiz = carnet.perfil === 'APRENDIZ'

  return (
    <article className={`carnet${carnet.activo ? '' : ' carnet--inactivo'}`} aria-label="Carnet digital">
      <header className="carnet__cabecera">
        <strong>SENA</strong>
        <span className="carnet__perfil">{carnet.perfil}</span>
      </header>
      <div className="carnet__cuerpo">
        <div className="carnet__foto">
          {fotoUrl ? (
            <img src={fotoUrl} alt="Foto del carnet" width="112" height="140" />
          ) : (
            <UserRound size={56} aria-hidden="true" />
          )}
        </div>
        <dl className="carnet__datos">
          <dt className="solo-lectores">Nombres</dt>
          <dd className="carnet__nombres">{carnet.nombres}</dd>
          <dt className="solo-lectores">Apellidos</dt>
          <dd className="carnet__apellidos">{carnet.apellidos}</dd>
          <dt>Documento</dt>
          <dd>{carnet.documento || 'Sin registrar'}</dd>
          <dt>RH</dt>
          <dd>{carnet.tipoSangre || 'Sin registrar'}</dd>
          {aprendiz && (
            <>
              <dt>Ficha</dt>
              <dd>{carnet.ficha || 'Sin ficha'}</dd>
              <dt>Programa</dt>
              <dd>{carnet.programa || 'Sin programa'}</dd>
              <dt>Finaliza</dt>
              <dd>{carnet.fechaFinalizacion || 'Sin fecha'}</dd>
            </>
          )}
        </dl>
      </div>
      <footer className="carnet__pie">
        {carnet.activo ? (
          <svg ref={barras} className="carnet__barras" role="img" aria-label={`Código de barras ${carnet.codigoBarras}`} />
        ) : (
          <p className="carnet__bloqueo">
            <Lock size={16} aria-hidden="true" />
            Completa tu perfil y espera la aprobación de tu foto para activar el carnet
          </p>
        )}
      </footer>
    </article>
  )
}
