import { useMemo, useState } from 'react'
import Skeleton from '../components/ui/Skeleton'
import { useConfirmar } from '../context/ConfirmContext'
import { useNotificacion } from '../context/NotificationContext'
import { useFetch } from '../hooks/useFetch'
import { comunicadoService } from '../services/api'

const COLORES = {
  'Llegada tarde': '#e67e22',
  'Llamado de atención': '#e74c3c',
  'Uniforme incorrecto': '#8e44ad',
  'Comunicado General': '#2c3e50',
}
const MINIMOS = [1, 2, 3, 5, 10]

const nivelFaltas = (n) => (n >= 5 ? 'alta' : n >= 3 ? 'media' : 'baja')

function alternarEn(conjunto, id) {
  const nuevo = new Set(conjunto)
  if (nuevo.has(id)) nuevo.delete(id)
  else nuevo.add(id)
  return nuevo
}

function useEnvio() {
  const { notificar } = useNotificacion()
  const confirmar = useConfirmar()
  const [enviando, setEnviando] = useState(false)

  const enviar = async (datos, pregunta) => {
    if (datos.destinatarios.length === 0) {
      notificar('Selecciona al menos un destinatario.', 'warning')
      return false
    }
    if (!(await confirmar('Confirmar Envío', pregunta, 'Sí, Enviar'))) return false
    setEnviando(true)
    try {
      const r = await comunicadoService.enviar(datos)
      notificar(r.errores.length ? `${r.mensaje} No se pudo enviar a ${r.errores.length}.` : r.mensaje, r.errores.length ? 'warning' : 'success')
      return true
    } catch (err) {
      notificar(err.message, 'error')
      return false
    } finally {
      setEnviando(false)
    }
  }
  return { enviar, enviando }
}

function ComunicadoManual({ usuarios }) {
  const { enviar, enviando } = useEnvio()
  const [tipo, setTipo] = useState('Llegada tarde')
  const [mensaje, setMensaje] = useState('')
  const [filtro, setFiltro] = useState({ texto: '', cargo: '', ficha: '' })
  const [seleccion, setSeleccion] = useState(new Set())
  const color = COLORES[tipo]

  const visibles = useMemo(() => {
    const texto = filtro.texto.toLowerCase()
    return usuarios.filter(
      (u) =>
        (u.nombre.toLowerCase().includes(texto) || (u.documento || '').includes(texto)) &&
        (!filtro.cargo || u.cargo === filtro.cargo) &&
        (!filtro.ficha || (u.ficha || '').toLowerCase().includes(filtro.ficha.toLowerCase())),
    )
  }, [usuarios, filtro])

  const cambiarFiltro = (e) => setFiltro((f) => ({ ...f, [e.target.name]: e.target.value }))

  const enviarManual = async () => {
    const ids = [...seleccion]
    if (await enviar({ tipo, mensaje, destinatarios: ids }, `¿Enviar comunicado de "${tipo}" a ${ids.length} persona(s)?`)) {
      setSeleccion(new Set())
    }
  }

  return (
    <div className="comunicado-manual">
      <div className="glass-card">
        <h3 className="glass-title">
          <i className="fas fa-cog" aria-hidden="true" /> Configurar Aviso
        </h3>
        <div className="form-group">
          <label htmlFor="tipo-aviso">Tipo de Aviso</label>
          <div className="input-icon-wrapper">
            <i className="fas fa-tag input-icon" aria-hidden="true" />
            <select id="tipo-aviso" className="glass-input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {Object.keys(COLORES).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="mensaje-manual">
            Observación / Mensaje <span className="texto-opcional">(opcional)</span>
          </label>
          <textarea
            id="mensaje-manual"
            className="glass-input"
            rows={5}
            maxLength={2000}
            placeholder="Escribe aquí detalles adicionales del aviso. Ej: El aprendiz llegó a las 8:45 AM sin justificación..."
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
          />
        </div>
        <span className="insignia-aviso" style={{ '--color-aviso': color }}>
          {tipo.toUpperCase()}
        </span>

        <h4 className="subtitulo-filtros">
          <i className="fas fa-filter" aria-hidden="true" /> Filtrar Destinatarios
        </h4>
        <div className="form-group">
          <input
            name="texto"
            className="glass-input"
            placeholder="Buscar por nombre o documento..."
            aria-label="Buscar por nombre o documento"
            value={filtro.texto}
            onChange={cambiarFiltro}
          />
        </div>
        <div className="filtros-destinatarios">
          <div>
            <label htmlFor="filtro-cargo">Cargo</label>
            <select id="filtro-cargo" name="cargo" className="glass-input" value={filtro.cargo} onChange={cambiarFiltro}>
              <option value="">Todos</option>
              <option>Aprendiz</option>
              <option>Instructor</option>
              <option>Administrativo</option>
            </select>
          </div>
          <div>
            <label htmlFor="filtro-ficha">Ficha</label>
            <input id="filtro-ficha" name="ficha" className="glass-input" placeholder="N° ficha..." value={filtro.ficha} onChange={cambiarFiltro} />
          </div>
        </div>
        <div className="acciones-seleccion">
          <button type="button" className="glass-btn" onClick={() => setSeleccion(new Set([...seleccion, ...visibles.map((u) => u.id)]))}>
            <i className="fas fa-check-double" aria-hidden="true" /> Seleccionar todos
          </button>
          <button type="button" className="glass-btn" onClick={() => setSeleccion(new Set())}>
            <i className="fas fa-times" aria-hidden="true" /> Limpiar
          </button>
        </div>
        <p className="contador-seleccion" aria-live="polite">
          {seleccion.size} destinatario(s) seleccionado(s)
        </p>
        <button type="button" className="glass-btn btn-primary btn-glow boton-enviar" onClick={enviarManual} disabled={enviando}>
          <i className={`fas ${enviando ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`} aria-hidden="true" />{' '}
          {enviando ? 'Enviando...' : 'Enviar Comunicado'}
        </button>
      </div>

      <div className="glass-card">
        <h3 className="glass-title">
          <i className="fas fa-users" aria-hidden="true" /> Seleccionar Destinatarios
        </h3>
        <div className="lista-destinatarios">
          {usuarios.length === 0 && <p className="sin-registros">No hay usuarios con correo verificado.</p>}
          {visibles.map((u) => (
            <label key={u.id} className="destinatario">
              <input type="checkbox" checked={seleccion.has(u.id)} onChange={() => setSeleccion((s) => alternarEn(s, u.id))} />
              <div className="destinatario__datos">
                <div className="destinatario__nombre">{u.nombre}</div>
                <div className="dato-secundario">
                  {u.correo}
                  {u.ficha && (
                    <>
                      {' '}
                      &bull; Ficha: <strong>{u.ficha}</strong>
                    </>
                  )}
                </div>
              </div>
              <span className={`badge ${u.cargo === 'Aprendiz' ? 'badge-info' : 'badge-primary'}`}>{u.cargo || 'N/A'}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

function Inasistencias({ inasistentes, mes }) {
  const { enviar, enviando } = useEnvio()
  const [minimo, setMinimo] = useState(3)
  const [mensaje, setMensaje] = useState('')
  const [seleccion, setSeleccion] = useState(new Set())
  const visibles = inasistentes.filter((e) => e.faltas >= minimo)
  const elegidos = [...seleccion].filter((id) => visibles.some((e) => e.id === id))
  const todos = visibles.length > 0 && elegidos.length === visibles.length

  const enviarReporte = async () => {
    if (
      await enviar(
        { tipo: 'Inasistencias', mensaje, destinatarios: elegidos },
        `¿Enviar reporte de inasistencias a ${elegidos.length} aprendiz(ces)?`,
      )
    ) {
      setSeleccion(new Set())
    }
  }

  return (
    <div>
      <div className="glass-card bloque-faltas cabecera-inasistencias">
        <div>
          <h3 className="glass-title">
            <i className="fas fa-calendar-times icono-faltas" aria-hidden="true" /> Inasistencias — {mes}
          </h3>
          <p className="dato-secundario">Aprendices con inasistencias registradas en clases este mes.</p>
        </div>
        <div className="minimo-faltas">
          <label htmlFor="min-faltas">Mostrar con al menos:</label>
          <select id="min-faltas" className="glass-input" value={minimo} onChange={(e) => setMinimo(Number(e.target.value))}>
            {MINIMOS.map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'falta' : 'faltas'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {inasistentes.length === 0 ? (
        <div className="glass-card sin-ambientes">
          <i className="fas fa-check-circle icono-ok" aria-hidden="true" />
          <h3>Sin inasistencias registradas</h3>
          <p>No hay aprendices con inasistencias registradas en {mes}.</p>
          <p className="dato-secundario">
            Las inasistencias se registran cuando el instructor marca a un aprendiz como ausente en el módulo{' '}
            <strong>Control de Clase</strong>.
          </p>
        </div>
      ) : (
        <>
          <div className="resumen-faltas">
            <div className="glass-card">
              <div className="resumen-faltas__numero resumen-faltas__numero--rojo">{inasistentes.length}</div>
              <div className="dato-secundario">Aprendices con faltas</div>
            </div>
            <div className="glass-card">
              <div className="resumen-faltas__numero resumen-faltas__numero--naranja">
                {inasistentes.reduce((t, e) => t + e.faltas, 0)}
              </div>
              <div className="dato-secundario">Total inasistencias</div>
            </div>
            <div className="glass-card">
              <div className="resumen-faltas__numero resumen-faltas__numero--verde">{elegidos.length}</div>
              <div className="dato-secundario">Seleccionados para notificar</div>
            </div>
          </div>

          <div className="glass-card bloque-faltas">
            <label htmlFor="mensaje-inasistencias" className="rotulo-mensaje">
              <i className="fas fa-comment-alt" aria-hidden="true" /> Mensaje adicional para el correo{' '}
              <span className="texto-opcional">(opcional)</span>
            </label>
            <textarea
              id="mensaje-inasistencias"
              className="glass-input"
              rows={3}
              maxLength={2000}
              placeholder="Ej: Le informamos que de continuar esta situación, se notificará al coordinador de formación..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            />
          </div>

          <div className="glass-card bloque-faltas">
            <div className="cabecera-lista-faltas">
              <h3 className="glass-title">
                <i className="fas fa-list" aria-hidden="true" /> Lista de Aprendices con Faltas
              </h3>
              <div className="acciones-seleccion">
                <button type="button" className="glass-btn" onClick={() => setSeleccion(new Set(visibles.map((e) => e.id)))}>
                  <i className="fas fa-check-double" aria-hidden="true" /> Todos visibles
                </button>
                <button type="button" className="glass-btn" onClick={() => setSeleccion(new Set())}>
                  <i className="fas fa-times" aria-hidden="true" /> Limpiar
                </button>
                <button type="button" className="glass-btn btn-primary boton-notificar" onClick={enviarReporte} disabled={enviando}>
                  <i className={`fas ${enviando ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`} aria-hidden="true" />{' '}
                  {enviando ? 'Enviando...' : 'Enviar Notificación'}
                </button>
              </div>
            </div>
            <div className="table-responsive">
              <table className="glass-table tabla-formacion">
                <thead>
                  <tr>
                    <th scope="col">
                      <input
                        type="checkbox"
                        aria-label="Seleccionar todos los visibles"
                        checked={todos}
                        onChange={(e) => setSeleccion(e.target.checked ? new Set(visibles.map((x) => x.id)) : new Set())}
                      />
                    </th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Documento</th>
                    <th scope="col">Ficha</th>
                    <th scope="col">Programa</th>
                    <th scope="col">Correo</th>
                    <th scope="col" className="celda-centro">
                      Faltas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Seleccionar a ${e.nombre}`}
                          checked={seleccion.has(e.id)}
                          onChange={() => setSeleccion((s) => alternarEn(s, e.id))}
                        />
                      </td>
                      <td>
                        <strong>{e.nombre}</strong>
                      </td>
                      <td>{e.documento || 'N/A'}</td>
                      <td>{e.ficha || 'N/A'}</td>
                      <td className="celda-pequena">{e.programa || 'N/A'}</td>
                      <td className="celda-pequena texto-tenue">{e.correo}</td>
                      <td className="celda-centro">
                        <span className={`conteo-faltas conteo-faltas--${nivelFaltas(e.faltas)}`}>{e.faltas}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function ComunicadosPage() {
  const [pestana, setPestana] = useState('manual')
  const { data, error, recargar } = useFetch((signal) => comunicadoService.obtener(signal), [])

  return (
    <div>
      <div className="header-actions">
        <div className="header-title">
          <h1>
            <i className="fas fa-envelope-open-text icono-titulo" aria-hidden="true" />
            Comunicados
          </h1>
          <p className="subtitle">Envía avisos de llegadas tarde, llamados de atención o reportes de inasistencias a los aprendices.</p>
        </div>
      </div>

      <div className="glass-card pestanas-comunicados" role="tablist" aria-label="Tipo de comunicado">
        {[
          ['manual', 'fa-exclamation-circle', 'Comunicado Manual'],
          ['inasistencias', 'fa-calendar-times', 'Inasistencias del Mes'],
        ].map(([clave, icono, texto]) => (
          <button
            key={clave}
            type="button"
            role="tab"
            aria-selected={pestana === clave}
            className={`pestana-comunicado${pestana === clave ? ' active' : ''}`}
            onClick={() => setPestana(clave)}
          >
            <i className={`fas ${icono}`} aria-hidden="true" /> {texto}
          </button>
        ))}
      </div>

      {!data && !error && <Skeleton filas={4} alto="4rem" />}
      {error && (
        <div className="glass-card estado-vacio" role="alert">
          <i className="fas fa-exclamation-triangle" aria-hidden="true" />
          <p>{error}</p>
          <button type="button" className="btn-outline" onClick={recargar}>
            Reintentar
          </button>
        </div>
      )}
      {data &&
        (pestana === 'manual' ? (
          <ComunicadoManual usuarios={data.usuarios} />
        ) : (
          <Inasistencias inasistentes={data.inasistentes} mes={data.mesActual} />
        ))}
    </div>
  )
}
