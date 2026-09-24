import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import logoSena from '../assets/img/logoSena.png'
import { avatarDeCargo } from './ui/FotoUsuario'

// Datos del centro, configurables por .env
const REGIONAL = import.meta.env.VITE_CARNET_REGIONAL || 'Regional Santander'
const CENTRO = import.meta.env.VITE_CARNET_CENTRO || 'Centro de Gestión Agroempresarial del Oriente'
const ASEGURADORA = import.meta.env.VITE_CARNET_ASEGURADORA || ''
const ASEGURADORA_TEL = import.meta.env.VITE_CARNET_ASEGURADORA_TEL || ''
const POLIZA = import.meta.env.VITE_CARNET_POLIZA || ''

// Formato oficial del SENA; el código de barras es Code128 del documento
export default function CarnetDigital({ carnet, fotoUrl, cargo }) {
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
  const [abreviatura, ...numero] = (carnet.documento || '').split(' ')

  return (
    <div className={`carnet-oficial carnet-oficial--${carnet.perfil.toLowerCase()}`} id="carnet-capture">
      <div className="carnet-of-cabecera">
        <img className="carnet-of-logo" src={logoSena} alt="SENA" width="64" height="64" />
        <div className="carnet-of-foto">
          <img src={fotoUrl || avatarDeCargo(cargo)} alt={`Fotografía de ${carnet.nombres}`} width="120" height="150" decoding="async" />
        </div>
      </div>

      <h2 className="carnet-of-perfil">{carnet.perfil}</h2>

      <dl className="carnet-of-datos">
        <div className="carnet-of-fila">
          <dt>Nombres</dt>
          <dd>{carnet.nombres || '—'}</dd>
        </div>
        <div className="carnet-of-fila">
          <dt>Apellidos</dt>
          <dd>{carnet.apellidos || '—'}</dd>
        </div>
        <div className="carnet-of-fila carnet-of-documento">
          <dt>{abreviatura || (aprendiz ? 'Tip.' : 'C.C.')}</dt>
          <dd>{numero.join(' ') || '—'}</dd>
        </div>
        <div className="carnet-of-fila">
          <dt>RH</dt>
          <dd className="carnet-of-rh">{carnet.tipoSangre || '—'}</dd>
        </div>
        {aprendiz && (
          <>
            <div className="carnet-of-fila">
              <dt>Ficha de Formación No.</dt>
              <dd>{carnet.ficha || '—'}</dd>
            </div>
            <div className="carnet-of-fila">
              <dt>Fecha de Finalización</dt>
              <dd>{carnet.fechaFinalizacion || '—'}</dd>
            </div>
            <div className="carnet-of-fila carnet-of-programa">
              <dd>{carnet.programa || 'Programa sin asignar'}</dd>
            </div>
          </>
        )}
      </dl>

      {aprendiz && ASEGURADORA && (
        <div className="carnet-of-poliza">
          <p>{ASEGURADORA}</p>
          {ASEGURADORA_TEL && <p>Tel: {ASEGURADORA_TEL}</p>}
          {POLIZA && <p>Póliza No. {POLIZA}</p>}
        </div>
      )}

      <div className="carnet-of-barras">
        {carnet.activo ? (
          <>
            <div className="carnet-of-barras-caja">
              <svg ref={barras} role="img" aria-label={`Código de barras ${carnet.codigoBarras}`} />
            </div>
            <span className="carnet-of-barras-texto">{carnet.codigoBarras}</span>
          </>
        ) : (
          <p className="carnet-of-bloqueado">
            <i className="fas fa-lock" aria-hidden="true" /> Carnet bloqueado: completa tu perfil y espera la aprobación de tu foto.
          </p>
        )}
      </div>

      <div className="carnet-of-pie">
        <strong>{REGIONAL}</strong>
        <em>{CENTRO}</em>
      </div>
    </div>
  )
}
