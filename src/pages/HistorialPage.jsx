import { useState } from 'react'
import FotoUsuario from '../components/ui/FotoUsuario'
import Skeleton from '../components/ui/Skeleton'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { catalogoService, historialService } from '../services/api'

const VACIO = { busqueda: '', ficha: '', cargo: '', desde: '', hasta: '', soloHabiles: 'true' }
const MOTIVOS_VENTANA = {
  vinculacion: 'Empieza en su primer ingreso registrado: antes de esa fecha no se le cuentan faltas.',
  fin_de_ficha: 'Termina con la fecha de finalización de su ficha.',
  sin_referencia_de_vinculacion: 'Sin ningún ingreso registrado: no se pudo acotar a su fecha de vinculación real.',
}

const fecha = (texto) => (texto ? new Date(`${texto}T00:00:00`).toLocaleDateString('es-CO') : '—')
const hora = (texto) => (texto ? new Date(texto).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '—')
const permanencia = (min) => (min == null ? '—' : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} m`)
const plural = (n, palabra) => `${n} ${palabra}${n === 1 ? '' : 's'}`

const faltasDe = (r, dia) => `${r.detalleDiasSemana[dia].faltas} de ${r.detalleDiasSemana[dia].oportunidades}`

function DiaMasFaltado({ r }) {
  if (r.diaMasFaltado) return `Día que más falta (${faltasDe(r, r.diaMasFaltado)})`
  if (r.motivoSinDia === 'empate') return `Sin día destacado: empatan ${r.diasEmpatados.join(', ')}`
  if (r.motivoSinDia === 'sin_faltas') return 'Sin faltas en el periodo evaluado'
  return 'Periodo demasiado corto para afirmar un patrón'
}

function BloquePersona({ bloque }) {
  const r = bloque.resumen
  const faltas = Object.keys(r.faltasPorDia || {})
  const indicadores = [
    [r.diasAsistidos, 'Días asistidos', 'historial-kpi--verde'],
    [r.diasFaltados, `Días sin registro (de ${r.diasEsperados})`, 'historial-kpi--rojo'],
    [r.porcentajeAsistencia == null ? '—' : `${r.porcentajeAsistencia}%`, r.porcentajeAsistencia == null ? 'Sin días exigibles' : 'Asistencia', 'historial-kpi--azul'],
    [r.diaMasFaltado || '—', <DiaMasFaltado key="d" r={r} />],
    [permanencia(r.promedioPermanenciaMinutos), 'Permanencia promedio'],
  ]

  return (
    <section className="glass-card historial-bloque" aria-labelledby={`persona-${bloque.id}`}>
      <div className="historial-persona">
        <FotoUsuario usuarioId={bloque.id} cargo={bloque.cargo} alt={`Foto de ${bloque.nombre}`} className="historial-persona__foto" width="56" height="56" />
        <div>
          <h2 id={`persona-${bloque.id}`}>{bloque.nombre}</h2>
          <small className="dato-secundario">
            {bloque.cargo || 'Sin cargo'}
            {bloque.documento && ` · Doc. ${bloque.documento}`}
            {bloque.ficha && ` · Ficha ${bloque.ficha}`}
          </small>
        </div>
      </div>

      <div className="historial-kpis">
        {indicadores.map(([valor, texto, clase], i) => (
          <div key={i} className={`historial-kpi ${clase || ''}`}>
            <strong>{valor}</strong>
            <small>{texto}</small>
          </div>
        ))}
      </div>

      <p className="historial-nota">
        <i className="fas fa-calendar-day" aria-hidden="true" />{' '}
        {r.periodoEvaluadoInicio ? (
          <>
            Periodo evaluado: <strong>{fecha(r.periodoEvaluadoInicio)}</strong> a <strong>{fecha(r.periodoEvaluadoFin)}</strong>.
          </>
        ) : (
          'No hay días exigibles para esta persona dentro del rango consultado.'
        )}{' '}
        {r.motivosVentana.map((m) => MOTIVOS_VENTANA[m]).filter(Boolean).join(' ')}
      </p>
      {r.diasFueraDeComputo > 0 && (
        <p className="historial-nota">
          <i className="fas fa-calendar-plus" aria-hidden="true" /> Asistió además {plural(r.diasFueraDeComputo, 'día')} fuera del calendario
          evaluado. No entran en el porcentaje.
        </p>
      )}
      {faltas.length > 0 && (
        <p className="historial-nota">
          <i className="fas fa-calendar-times" aria-hidden="true" /> Faltas por día: {faltas.map((dia) => `${dia} (${faltasDe(r, dia)})`).join(' · ')}
        </p>
      )}
      {r.sinSalida > 0 && (
        <p className="historial-nota historial-nota--aviso">
          <i className="fas fa-exclamation-circle" aria-hidden="true" /> {plural(r.sinSalida, 'movimiento')} sin salida registrada.
        </p>
      )}
      {r.abiertos > 0 && (
        <p className="historial-nota">
          <i className="fas fa-door-open" aria-hidden="true" /> {plural(r.abiertos, 'ingreso')} todavía abierto: la persona figura dentro de la sede.
        </p>
      )}

      {bloque.movimientos.length === 0 ? (
        <p className="celda-vacia">Sin movimientos registrados en este periodo.</p>
      ) : (
        <div className="table-responsive">
          <table className="modern-table">
            <caption className="solo-lectores">Movimientos de {bloque.nombre}</caption>
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Entrada</th>
                <th scope="col">Salida</th>
                <th scope="col">Permanencia</th>
                <th scope="col">Equipos ingresados</th>
              </tr>
            </thead>
            <tbody>
              {[...bloque.movimientos].reverse().map((m, i) => (
                <tr key={i}>
                  <td>
                    {fecha(m.fecha)}
                    {m.entrada && m.salida && m.salida.slice(0, 10) !== m.entrada.slice(0, 10) && (
                      <small className="dato-secundario">al {fecha(m.salida.slice(0, 10))}</small>
                    )}
                  </td>
                  <td className="text-entrada">
                    {hora(m.entrada)}
                    {m.entradaFueraDeVentana && <small className="dato-secundario">entrada anterior al periodo</small>}
                  </td>
                  <td className="text-salida">
                    {hora(m.salida)}
                    {m.cierreAutomatico && <small className="dato-secundario">cierre automático</small>}
                    {!m.cierreAutomatico && m.abierto && <small className="dato-secundario">todavía adentro</small>}
                    {!m.cierreAutomatico && !m.abierto && !m.salida && <small className="dato-secundario">sin salida</small>}
                  </td>
                  <td>{permanencia(m.permanenciaMinutos)}</td>
                  <td>
                    {m.equipos.length ? (
                      m.equipos.map((e) => (
                        <span key={e} className="etiqueta-equipo">
                          {e}
                        </span>
                      ))
                    ) : (
                      <span className="dato-vacio">Ninguno</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default function HistorialPage() {
  const { usuario } = useAuth()
  const terceros = Boolean(usuario?.permisos?.operarPorteria || usuario?.permisos?.gestionarAsistencia)
  const [borrador, setBorrador] = useState(VACIO)
  const [filtros, setFiltros] = useState(terceros ? null : VACIO)
  const { data: catalogos } = useFetch((signal) => (terceros ? catalogoService.obtener(signal) : Promise.resolve(null)), [terceros])
  const { data, cargando, error, recargar } = useFetch(
    (signal) =>
      filtros
        ? historialService.consultar({ ...filtros, usuarioId: terceros ? undefined : usuario.id }, signal)
        : Promise.resolve(null),
    [filtros],
  )

  const cambiar = (e) => setBorrador((b) => ({ ...b, [e.target.name]: e.target.value }))
  const consultar = (e) => {
    e.preventDefault()
    setFiltros({ ...borrador, busqueda: borrador.busqueda.trim(), ficha: borrador.ficha.trim() })
  }

  return (
    <div className="profile-container">
      <div className="page-hero">
        <h2 className="text-3d">{terceros ? 'Historial de ingresos' : 'Mis ingresos'}</h2>
        <p>
          {terceros
            ? 'Entradas, salidas, equipos y ausencias de una persona o de un grupo completo.'
            : 'Tus entradas, salidas y equipos registrados en portería.'}
        </p>
      </div>

      <form className="glass-card historial-filtros modal-body" onSubmit={consultar}>
        <div className="historial-filtros__campos">
          {terceros && (
            <>
              <div className="form-group historial-filtros__ancho">
                <label htmlFor="h-busqueda">Nombre o documento</label>
                <input id="h-busqueda" name="busqueda" className="glass-input" maxLength={100} placeholder="Ej: Ana Rodríguez o 1098765432" value={borrador.busqueda} onChange={cambiar} />
              </div>
              <div className="form-group">
                <label htmlFor="h-ficha">Ficha</label>
                <input id="h-ficha" name="ficha" className="glass-input" maxLength={20} placeholder="Toda la ficha" value={borrador.ficha} onChange={cambiar} />
              </div>
              <div className="form-group">
                <label htmlFor="h-cargo">Cargo</label>
                <select id="h-cargo" name="cargo" className="glass-input" value={borrador.cargo} onChange={cambiar}>
                  <option value="">Cualquiera</option>
                  {catalogos?.cargos.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div className="form-group">
            <label htmlFor="h-desde">Desde</label>
            <input id="h-desde" type="date" name="desde" className="glass-input" value={borrador.desde} onChange={cambiar} />
          </div>
          <div className="form-group">
            <label htmlFor="h-hasta">Hasta</label>
            <input id="h-hasta" type="date" name="hasta" className="glass-input" min={borrador.desde || undefined} value={borrador.hasta} onChange={cambiar} />
          </div>
          <div className="form-group historial-filtros__ancho">
            <label htmlFor="h-habiles">Días en los que se cuenta la falta</label>
            <select id="h-habiles" name="soloHabiles" className="glass-input" value={borrador.soloHabiles} onChange={cambiar}>
              <option value="true">Solo de lunes a viernes</option>
              <option value="false">Todos los días de la semana</option>
            </select>
          </div>
        </div>
        <button type="submit" className="glass-btn btn-glow historial-filtros__enviar">
          <span>Consultar</span> <i className="fas fa-search" aria-hidden="true" />
        </button>
      </form>

      {cargando && filtros && <Skeleton filas={4} alto="4rem" />}
      {error && (
        <div className="glass-card estado-vacio" role="alert">
          <i className="fas fa-exclamation-triangle" aria-hidden="true" />
          <p>{error}</p>
          <button type="button" className="btn-outline" onClick={recargar}>
            Reintentar
          </button>
        </div>
      )}
      {!filtros && (
        <div className="glass-card estado-vacio">
          <i className="fas fa-clipboard-list" aria-hidden="true" />
          <p>Escribe un nombre, un documento, una ficha o un cargo para ver el historial.</p>
        </div>
      )}
      {!error && data && data.personas.length === 0 && (
        <div className="glass-card estado-vacio">
          <i className="fas fa-user-slash" aria-hidden="true" />
          <p>Ninguna persona coincide con esos filtros.</p>
        </div>
      )}
      {!error && data?.personas.length > 0 && (
        <>
          {data.omitidas.length > 0 && (
            <p className="historial-nota historial-nota--aviso historial-centro">
              <i className="fas fa-exclamation-triangle" aria-hidden="true" /> {plural(data.omitidas.length, 'persona')} quedaron sin analizar (
              {data.omitidas.join(', ')}). Acorta el periodo o filtra por menos gente.
            </p>
          )}
          <p className="historial-nota historial-centro">
            Periodo consultado: <strong>{fecha(data.fechaInicio)}</strong> a <strong>{fecha(data.fechaFin)}</strong> —{' '}
            {plural(data.personas.length, 'persona')}.
            {data.rangoRecortado && ' El rango se limitó a 120 días; consulta por tramos si necesitas más.'}
          </p>
          {data.personas.map((b) => (
            <BloquePersona key={b.id} bloque={b} />
          ))}
        </>
      )}
    </div>
  )
}
