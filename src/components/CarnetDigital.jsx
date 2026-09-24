import logoSena from '../assets/img/logoSena.png'
import { avatarUrl } from '../services/api'

// Formato oficial del SENA; el código de barras Code128 lo dibuja la API
export default function CarnetDigital({ carnet, fotoUrl, cargo }) {
  if (!carnet) return null
  const aprendiz = carnet.perfil === 'APRENDIZ'
  const [abreviatura, ...numero] = (carnet.documento || '').split(' ')

  return (
    <div className={`carnet-oficial carnet-oficial--${carnet.perfil.toLowerCase()}`} id="carnet-capture">
      <div className="carnet-of-cabecera">
        <img className="carnet-of-logo" src={logoSena} alt="SENA" width="64" height="64" />
        <div className="carnet-of-foto">
          <img src={fotoUrl || avatarUrl(cargo)} alt={`Fotografía de ${carnet.nombres}`} width="120" height="150" decoding="async" />
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

      {carnet.aseguradora && (
        <div className="carnet-of-poliza">
          <p>{carnet.aseguradora}</p>
          {carnet.aseguradoraTel && <p>Tel: {carnet.aseguradoraTel}</p>}
          {carnet.poliza && <p>Póliza No. {carnet.poliza}</p>}
        </div>
      )}

      <div className="carnet-of-barras">
        {carnet.activo ? (
          <>
            <div className="carnet-of-barras-caja">
              <img
                src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(carnet.codigoBarrasSvg)}`}
                alt={`Código de barras ${carnet.codigoBarras}`}
              />
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
        <strong>{carnet.regional}</strong>
        <em>{carnet.centro}</em>
      </div>
    </div>
  )
}
