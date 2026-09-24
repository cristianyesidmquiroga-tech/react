import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import Grafica from '../components/ui/Grafica'
import Skeleton from '../components/ui/Skeleton'
import { useFetch } from '../hooks/useFetch'
import { panelService } from '../services/api'

const COLORES = [
  'rgba(57, 169, 0, 0.85)',
  'rgba(54, 162, 235, 0.85)',
  'rgba(255, 206, 86, 0.85)',
  'rgba(255, 99, 132, 0.85)',
  'rgba(153, 102, 255, 0.85)',
  'rgba(255, 159, 64, 0.85)',
]
const OPCIONES_DONA = { cutout: '60%', plugins: { legend: { position: 'bottom' } } }
const OPCIONES_POLAR = { plugins: { legend: { position: 'bottom' } } }

function datosDe(conteos, transparente = false) {
  const colores = conteos.map((_, i) => COLORES[i % COLORES.length])
  return {
    labels: conteos.map((c) => c.grupo),
    datasets: [
      {
        data: conteos.map((c) => c.total),
        backgroundColor: transparente ? colores.map((c) => c.replace('0.85', '0.6')) : colores,
        borderColor: transparente ? colores : '#ffffff',
        borderWidth: 2,
      },
    ],
  }
}

function TarjetaGrafica({ titulo, conteos, tipo, opciones, vacio, icono }) {
  const datos = useMemo(() => datosDe(conteos, tipo === 'polarArea'), [conteos, tipo])
  return (
    <div className="card reporte-grafica">
      <h2>{titulo}</h2>
      {conteos.length === 0 ? (
        <div className="estado-vacio">
          <i className={`fas ${icono}`} aria-hidden="true" />
          <p>{vacio}</p>
        </div>
      ) : (
        <>
          <Grafica tipo={tipo} datos={datos} opciones={opciones} etiqueta={titulo} />
          <ul className="solo-lectores">
            {conteos.map((c) => (
              <li key={c.grupo}>
                {c.grupo}: {c.total}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default function ReporteCargoPage() {
  const { cargo } = useParams()
  const { data, cargando, error, recargar } = useFetch((signal) => panelService.reporte(cargo, signal), [cargo])
  const esAprendiz = cargo === 'Aprendiz'

  if (cargando && !data) return <Skeleton filas={5} alto="5rem" />
  if (error) {
    return (
      <div className="glass-card estado-vacio" role="alert">
        <i className="fas fa-exclamation-triangle" aria-hidden="true" />
        <p>{error}</p>
        <button type="button" className="btn-outline" onClick={recargar}>
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="header-actions">
        <div className="header-title">
          <h2>Demografía: {cargo}</h2>
          <p className="texto-ayuda">
            Distribución de ingresos por {esAprendiz ? 'programa y ficha' : 'dependencia'} de hoy y los últimos 7 días.
          </p>
        </div>
        <div className="action-buttons">
          <Link to="/porteria/panel" className="glass-btn btn-primary">
            <i className="fas fa-arrow-left" aria-hidden="true" /> Volver al Panel
          </Link>
        </div>
      </div>

      <div className="reporte-rejilla">
        <TarjetaGrafica titulo="Ingresos de Hoy" conteos={data.hoy} tipo="doughnut" opciones={OPCIONES_DONA} vacio="No hay registros hoy" icono="fa-bed" />
        <TarjetaGrafica
          titulo="Flujo Últimos 7 Días"
          conteos={data.ultimos7Dias}
          tipo="polarArea"
          opciones={OPCIONES_POLAR}
          vacio="Sin datos históricos"
          icono="fa-folder-open"
        />
      </div>

      <div className="card panel-analisis">
        <h2>
          <i className="fas fa-brain" aria-hidden="true" /> Análisis Inteligente del Sistema
        </h2>
        <p>{data.analisis}</p>
      </div>

      <div className="card panel-tarjeta">
        <h2>
          <i className="fas fa-user-check" aria-hidden="true" /> {cargo} en la Institución ({data.adentro.length})
        </h2>
        {data.adentro.length === 0 ? (
          <div className="estado-vacio">
            <i className="fas fa-sign-out-alt" aria-hidden="true" />
            <p>No hay personas con este cargo dentro de la institución en este momento.</p>
          </div>
        ) : (
          <div className="table-responsive tabla-adentro">
            <table className="modern-table">
              <thead>
                <tr>
                  <th scope="col">Nombre y Documento</th>
                  <th scope="col">{esAprendiz ? 'Programa' : cargo === 'Personal' ? 'Cargo' : 'Área'}</th>
                  <th scope="col">Ficha</th>
                  <th scope="col">Hora Ingreso</th>
                </tr>
              </thead>
              <tbody>
                {data.adentro.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.nombre}</strong>
                      <small className="dato-secundario">ID: {p.documento || 'N/A'}</small>
                    </td>
                    <td>{p.programa || 'N/A'}</td>
                    <td>{p.ficha || 'N/A'}</td>
                    <td className="dato-hora">{new Date(p.horaIngreso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
