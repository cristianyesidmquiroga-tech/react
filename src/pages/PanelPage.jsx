import { useMemo, useState } from 'react'
import FotoUsuario from '../components/ui/FotoUsuario'
import Grafica from '../components/ui/Grafica'
import Skeleton from '../components/ui/Skeleton'
import { useNotificacion } from '../context/NotificationContext'
import { useFetch } from '../hooks/useFetch'
import { panelService } from '../services/api'

const INDICADORES = [
  { clave: 'aprendices', texto: 'Aprendices', icono: 'fa-user-graduate' },
  { clave: 'instructores', texto: 'Instructores', icono: 'fa-chalkboard-teacher', color: 'azul' },
  { clave: 'trabajadores', texto: 'Trabajadores', icono: 'fa-user-tie', color: 'naranja' },
  { clave: 'visitantesAdentro', texto: 'Visitantes adentro', icono: 'fa-users', color: 'morado' },
  { clave: 'vehiculosAdentro', texto: 'Vehículos adentro', icono: 'fa-car', color: 'turquesa' },
  { clave: 'objetosAdentro', texto: 'Objetos adentro', icono: 'fa-box', color: 'cafe' },
]

const SERIES = [
  ['aprendices', 'Aprendices', '#39A900', 'rgba(57, 169, 0, 0.1)'],
  ['instructores', 'Instructores', '#36A2EB', 'rgba(54, 162, 235, 0.1)'],
  ['otros', 'Trabajadores', '#FF9F40', 'rgba(255, 159, 64, 0.1)'],
]

const OPCIONES_TENDENCIA = {
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1, color: '#999' }, grid: { color: '#F0F0F0' } },
    x: { ticks: { color: '#999' }, grid: { display: false } },
  },
  plugins: { legend: { position: 'top', labels: { boxWidth: 12, usePointStyle: true } } },
  interaction: { mode: 'index', intersect: false },
}

const CLASES_ROL = { Aprendiz: 'aprendiz', Instructor: 'instructor', Visitante: 'visitante', Vehículo: 'vehiculo', 'Objeto externo': 'objeto' }
const FILTROS_VACIOS = { cargo: '', ficha: '', desde: '', hasta: '' }

function Resumen({ panel }) {
  const datos = useMemo(
    () => ({
      labels: panel.grafica.dias,
      datasets: SERIES.map(([clave, etiqueta, borde, fondo]) => ({
        label: etiqueta,
        data: panel.grafica[clave],
        borderColor: borde,
        backgroundColor: fondo,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: borde,
        pointBorderWidth: 2,
        pointRadius: 4,
      })),
    }),
    [panel],
  )

  return (
    <>
      <div className="page-hero">
        <h2 className="text-3d">Panel de Inteligencia</h2>
        <p>Métricas de flujo institucional de hoy y los últimos 7 días.</p>
      </div>
      <div className="dashboard-grid">
        {INDICADORES.map((i) => (
          <div key={i.clave} className="stat-card glass-card">
            <div className={`stat-icon${i.color ? ` stat-icon--${i.color}` : ''}`}>
              <i className={`fas ${i.icono}`} aria-hidden="true" />
            </div>
            <div className="stat-info">
              <h3 className="highlight-rainbow">{panel.indicadores[i.clave]}</h3>
              <p>{i.texto}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="card panel-tarjeta">
        <h2>Tendencias de Ingreso (Últimos 7 Días)</h2>
        <Grafica tipo="line" datos={datos} opciones={OPCIONES_TENDENCIA} alto={420} etiqueta="Ingresos por día de los últimos 7 días" />
      </div>
      <div className="card panel-analisis">
        <h2>
          <i className="fas fa-brain" aria-hidden="true" /> Análisis Inteligente
        </h2>
        <p>{panel.analisis}</p>
      </div>
    </>
  )
}

function HistorialAccesos({ cargos, fichas }) {
  const { notificar } = useNotificacion()
  const [borrador, setBorrador] = useState(FILTROS_VACIOS)
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [pagina, setPagina] = useState(0)
  const [exportando, setExportando] = useState(false)
  const { data, cargando, error, recargar } = useFetch((signal) => panelService.accesos({ ...filtros, pagina }, signal), [filtros, pagina])

  const cambiar = (e) => {
    const { name, value } = e.target
    setBorrador((b) => ({ ...b, [name]: value, ...(name === 'cargo' && value !== 'Aprendiz' ? { ficha: '' } : {}) }))
  }

  const aplicar = (e) => {
    e.preventDefault()
    setPagina(0)
    setFiltros(borrador)
  }

  const limpiar = () => {
    setBorrador(FILTROS_VACIOS)
    setFiltros(FILTROS_VACIOS)
    setPagina(0)
  }

  const exportar = async () => {
    setExportando(true)
    try {
      const archivo = await panelService.exportar(filtros)
      const enlace = document.createElement('a')
      enlace.href = URL.createObjectURL(archivo)
      enlace.download = `accesos_${filtros.desde}_${filtros.hasta}.csv`
      enlace.click()
      URL.revokeObjectURL(enlace.href)
    } catch (err) {
      notificar(err.message, 'error')
    } finally {
      setExportando(false)
    }
  }

  return (
    <div className="card panel-tarjeta">
      <h2>Historial de Accesos</h2>
      <form className="filter-form filtros-accesos" onSubmit={aplicar}>
        <div className="form-group">
          <label htmlFor="filtro-cargo">Filtrar por Cargo</label>
          <select id="filtro-cargo" name="cargo" value={borrador.cargo} onChange={cambiar}>
            <option value="">Todos los Cargos</option>
            {cargos.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {borrador.cargo === 'Aprendiz' && (
          <div className="form-group">
            <label htmlFor="filtro-ficha">Filtrar por Ficha</label>
            <select id="filtro-ficha" name="ficha" value={borrador.ficha} onChange={cambiar}>
              <option value="">Todas las Fichas</option>
              {fichas.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="form-group">
          <label htmlFor="filtro-desde">Desde</label>
          <input id="filtro-desde" type="date" name="desde" value={borrador.desde} onChange={cambiar} />
        </div>
        <div className="form-group">
          <label htmlFor="filtro-hasta">Hasta</label>
          <input id="filtro-hasta" type="date" name="hasta" min={borrador.desde || undefined} value={borrador.hasta} onChange={cambiar} />
        </div>
        <button type="submit" className="glass-btn btn-primary">
          <i className="fas fa-filter" aria-hidden="true" /> Aplicar
        </button>
        <button type="button" className="btn-outline" onClick={limpiar}>
          Limpiar
        </button>
        <button
          type="button"
          className="glass-btn btn-glow filtros-accesos__exportar"
          onClick={exportar}
          disabled={exportando || !filtros.desde || !filtros.hasta}
          title="Aplica un rango de fechas para exportar"
        >
          <i className="fas fa-file-excel" aria-hidden="true" /> {exportando ? 'Exportando...' : 'Exportar CSV'}
        </button>
      </form>

      {cargando && !data && <Skeleton filas={6} alto="2.6rem" />}
      {error && (
        <div className="estado-vacio" role="alert">
          <i className="fas fa-exclamation-triangle" aria-hidden="true" />
          <p>{error}</p>
          <button type="button" className="btn-outline" onClick={recargar}>
            Reintentar
          </button>
        </div>
      )}
      {!error && data && (
        <div className="table-responsive">
          <table className="modern-table" aria-busy={cargando}>
            <thead>
              <tr>
                <th scope="col">Usuario</th>
                <th scope="col">Documento</th>
                <th scope="col">Cargo</th>
                <th scope="col">Programa / Detalle</th>
                <th scope="col">Tipo</th>
                <th scope="col">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody>
              {data.content.length === 0 ? (
                <tr>
                  <td colSpan={6} className="celda-vacia">
                    <i className="fas fa-search" aria-hidden="true" /> No hay registros de acceso que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                data.content.map((a) => {
                  const rol = CLASES_ROL[a.clase] || 'trabajador'
                  return (
                    <tr key={a.id}>
                      <td>
                        <div className="celda-persona">
                          <FotoUsuario
                            usuarioId={a.tieneFoto ? a.referenciaId : null}
                            cargo={a.tipoReferencia === 'Usuario' ? a.clase : rol}
                            alt={`Foto de ${a.nombre}`}
                            className={`role-img role-border-${rol}`}
                            loading="lazy"
                            width="44"
                            height="44"
                          />
                          <strong>{a.nombre}</strong>
                        </div>
                      </td>
                      <td>{a.documento || 'N/A'}</td>
                      <td>
                        <span className={`role-badge role-badge-${rol}`}>{a.clase || 'Sin cargo'}</span>
                      </td>
                      <td>{a.detalle || <span className="dato-vacio">N/A</span>}</td>
                      <td>
                        <span className={a.tipo === 'Entrada' ? 'text-entrada' : 'text-salida'}>
                          <i className={`fas ${a.tipo === 'Entrada' ? 'fa-arrow-right' : 'fa-arrow-left'}`} aria-hidden="true" /> {a.tipo}
                        </span>
                      </td>
                      <td>{new Date(a.fecha).toLocaleString('es-CO')}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
      {data && data.totalPages > 1 && (
        <nav className="paginador" aria-label="Paginación">
          <span>
            Página {data.number + 1} de {data.totalPages}
          </span>
          <div className="paginador__botones">
            <button type="button" className="btn-outline" disabled={data.first} onClick={() => setPagina((p) => p - 1)}>
              <i className="fas fa-chevron-left" aria-hidden="true" /> Anterior
            </button>
            <button type="button" className="btn-outline" disabled={data.last} onClick={() => setPagina((p) => p + 1)}>
              Siguiente <i className="fas fa-chevron-right" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}

export default function PanelPage() {
  const [pestana, setPestana] = useState('panel')
  const { data, error, recargar } = useFetch((signal) => panelService.obtener(signal), [])

  return (
    <div>
      <div className="top-tabs" role="tablist" aria-label="Secciones del panel">
        {[
          ['panel', 'Panel General'],
          ['historial', 'Historial de Accesos'],
        ].map(([clave, texto]) => (
          <button
            key={clave}
            type="button"
            role="tab"
            aria-selected={pestana === clave}
            className={`tab-btn${pestana === clave ? ' active' : ''}`}
            onClick={() => setPestana(clave)}
          >
            {texto}
          </button>
        ))}
      </div>

      {error && (
        <div className="glass-card estado-vacio" role="alert">
          <i className="fas fa-exclamation-triangle" aria-hidden="true" />
          <p>{error}</p>
          <button type="button" className="btn-outline" onClick={recargar}>
            Reintentar
          </button>
        </div>
      )}
      {!data && !error && <Skeleton filas={5} alto="5rem" />}
      {data && (pestana === 'panel' ? <Resumen panel={data} /> : <HistorialAccesos cargos={data.cargos} fichas={data.fichas} />)}
    </div>
  )
}
