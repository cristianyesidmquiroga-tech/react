import { useActionState, useCallback, useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { avatarDeCargo } from '../components/ui/FotoUsuario'
import { useNotificacion } from '../context/NotificationContext'
import { useFotoProtegida } from '../hooks/useFotoProtegida'
import { porteriaService } from '../services/api'

const ID_LECTOR = 'reader'
// Recuadro ancho y bajo para códigos de barras
const recuadroBarras = (ancho, alto) => ({ width: Math.floor(ancho * 0.9), height: Math.min(Math.max(80, Math.floor(alto * 0.35)), alto) })
const CONFIG_LECTOR = { fps: 20, qrbox: recuadroBarras }
const AVATAR_ENTIDAD = { Visitante: 'Visitante', Vehiculo: 'Vehiculo', ObjetoExterno: 'Objeto' }

function camaraTrasera(camaras) {
  return camaras.find((c) => /back|trasera|rear/i.test(c.label)) || camaras[0]
}

function Detalles({ datos }) {
  const filas =
    datos.tipo === 'Vehiculo'
      ? [['Placa', datos.documento], ['Clase/Tipo', datos.cargo], ['Rol', datos.rol]]
      : datos.tipo === 'ObjetoExterno'
        ? [['Serial', datos.documento], ['Propietario', datos.cargo], ['Rol', datos.rol]]
        : [['Documento', datos.documento], ['Rol', datos.rol]]
  return (
    <dl className="res-details__datos">
      {filas.map(([etiqueta, valor]) => (
        <div key={etiqueta}>
          <dt>{etiqueta}</dt>
          <dd>{valor || 'N/A'}</dd>
        </div>
      ))}
    </dl>
  )
}

function Resultado({ datos, onRegistrado, onVolver }) {
  const { notificar } = useNotificacion()
  const foto = useFotoProtegida(datos.tipo === 'Usuario' && datos.tieneFoto ? datos.id : null)
  const [equipos, setEquipos] = useState(() => (datos.equipos || []).filter((e) => e.estado === 'Adentro').map((e) => e.id))
  const [enviando, setEnviando] = useState(false)
  const adentro = datos.estado === 'Entrada'

  const alternarEquipo = (id) =>
    setEquipos((lista) => (lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id].slice(0, 5)))

  const registrar = async (tipo) => {
    setEnviando(true)
    try {
      const r = await porteriaService.registrarMovimiento({
        tipoEntidad: datos.tipo,
        entidadId: datos.id,
        tipo,
        equiposIds: datos.tipo === 'Usuario' ? equipos : null,
      })
      notificar(r.mensaje, 'success')
      onRegistrado()
    } catch (err) {
      notificar(err.message, 'error')
    } finally {
      setEnviando(false)
    }
  }

  // Acción de React 19 (guía, módulo 10)
  const [, reportar, reportando] = useActionState(async (_previo, formulario) => {
    const detalles = String(formulario.get('detalles') || '').trim()
    if (!detalles) return null
    try {
      const r = await porteriaService.registrarIncidente({ tipoEntidad: datos.tipo, entidadId: datos.id, detalles })
      notificar(r.mensaje, 'success')
    } catch (err) {
      notificar(err.message, 'error')
    }
    return null
  }, null)

  return (
    <section className="scanner-result-card" aria-labelledby="res-nombre">
      <div className={`status-pill ${adentro ? 'status-entrada' : 'status-afuera'}`}>Estado actual: {adentro ? 'En sede' : 'Afuera'}</div>

      <div className="res-warnings">
        {datos.tipo === 'Visitante' && adentro && (
          <div className={`aviso-escaneo aviso-escaneo--ok${datos.tiempoExcedido ? ' aviso-escaneo--excedido' : ''}`}>
            <span>
              <i className="fas fa-clock" aria-hidden="true" /> <strong>Permanencia:</strong> {datos.tiempoAdentro || 'Menos de 1 min'}
            </span>
            {datos.tiempoExcedido && <span className="aviso-escaneo__etiqueta">TIEMPO EXCEDIDO</span>}
          </div>
        )}
        {datos.tipo === 'Usuario' && datos.fotoAprobada === false && (
          <div className="aviso-escaneo">
            <i className="fas fa-user-clock" aria-hidden="true" />
            <div>
              <strong>Foto sin verificar:</strong> esta foto todavía no fue aprobada por un administrador. Pide el documento físico
              para confirmar la identidad.
            </div>
          </div>
        )}
        {datos.tipo === 'Usuario' && datos.carnetActivo === false && (
          <div className="aviso-escaneo">
            <i className="fas fa-id-card" aria-hidden="true" />
            <div>
              <strong>Carnet inactivo:</strong> el perfil de esta persona está incompleto.
            </div>
          </div>
        )}
        {!adentro && (
          <div className="aviso-escaneo">
            <i className="fas fa-exclamation-triangle" aria-hidden="true" />
            <div>
              <strong>Alerta de flujo:</strong> figura como <strong>AFUERA</strong>. Una salida sin ingreso previo queda registrada
              en la auditoría como flujo irregular.
            </div>
          </div>
        )}
      </div>

      <img
        src={foto || avatarDeCargo(AVATAR_ENTIDAD[datos.tipo] || datos.cargo)}
        alt={`Foto o avatar de ${datos.nombre}`}
        className="result-photo"
        width="200"
        height="200"
        decoding="async"
      />
      <h2 id="res-nombre" className="result-name">
        {datos.nombre}
      </h2>
      <p className="result-cargo">{datos.cargo || datos.tipo}</p>

      <div className="res-details">
        <Detalles datos={datos} />
        {datos.equipos?.length > 0 && (
          <fieldset className="equipos-escaneo">
            <legend className="equipos-escaneo__titulo">
              <i className="fas fa-laptop" aria-hidden="true" /> Equipos registrados (marca los que trae consigo)
            </legend>
            {datos.equipos.map((eq) => (
              <label key={eq.id} className="equipo-check">
                <span className="equipo-check__nombre">
                  <input type="checkbox" checked={equipos.includes(eq.id)} onChange={() => alternarEquipo(eq.id)} />
                  <i className={`fas ${eq.tipo === 'Tablet' ? 'fa-tablet-alt' : 'fa-laptop'}`} aria-hidden="true" />
                  {eq.nombre} <small>({eq.tipo})</small>
                </span>
                <span className={`equipo-check__estado${eq.estado === 'Adentro' ? ' equipo-check__estado--adentro' : ''}`}>{eq.estado}</span>
              </label>
            ))}
          </fieldset>
        )}
      </div>

      <div className="botones-movimiento">
        <button type="button" className="btn-movimiento btn-movimiento--entrada" disabled={adentro || enviando} onClick={() => registrar('Entrada')}>
          <i className="fas fa-sign-in-alt" aria-hidden="true" /> ENTRADA
        </button>
        <button type="button" className="btn-movimiento btn-movimiento--salida" disabled={datos.estado === 'Salida' || enviando} onClick={() => registrar('Salida')}>
          <i className="fas fa-sign-out-alt" aria-hidden="true" /> SALIDA
        </button>
      </div>

      <form className="incidente-rapido" action={reportar} autoComplete="off">
        <label htmlFor="incidente">
          <i className="fas fa-exclamation-circle" aria-hidden="true" /> Reportar anomalía en este escaneo:
        </label>
        <div className="incidente-rapido__fila">
          <input id="incidente" name="detalles" required maxLength={1000} placeholder="Describa la novedad o anomalía..." />
          <button type="submit" disabled={reportando}>
            {reportando ? 'Enviando...' : 'Reportar'}
          </button>
        </div>
      </form>

      <button type="button" className="btn-outline btn-volver-escaner" onClick={onVolver}>
        <i className="fas fa-redo-alt" aria-hidden="true" /> VOLVER AL ESCÁNER
      </button>
    </section>
  )
}

export default function EscanerPage() {
  const { notificar } = useNotificacion()
  const lector = useRef(null)
  const camaras = useRef([])
  const camaraActual = useRef(null)
  const [activo, setActivo] = useState(false)
  const [varias, setVarias] = useState(false)
  const [destello, setDestello] = useState(false)
  const [errorCamara, setErrorCamara] = useState(null)
  const [manual, setManual] = useState(false)
  const [documento, setDocumento] = useState('')
  const [resultado, setResultado] = useState(null)

  const detener = useCallback(async () => {
    try {
      if (lector.current?.isScanning) await lector.current.stop()
    } catch {
      // la cámara ya estaba liberada
    }
    setActivo(false)
  }, [])

  // Libera la cámara al salir de la página
  useEffect(() => () => void detener(), [detener])

  const validar = async (codigo) => {
    const limpio = codigo.trim()
    if (!limpio) return
    try {
      const datos = await porteriaService.verificar(limpio.slice(0, 100))
      if (!datos.encontrado) {
        notificar('El documento o código no coincide con ningún perfil registrado.', 'error', 'No Encontrado')
        return
      }
      setResultado(datos)
    } catch (err) {
      notificar(err.message, 'error')
    }
  }

  const alLeer = async (texto) => {
    setDestello(true)
    await detener()
    setTimeout(() => {
      setDestello(false)
      validar(texto)
    }, 1000)
  }

  const iniciar = async () => {
    setErrorCamara(null)
    if (!window.isSecureContext) {
      setErrorCamara('El navegador bloquea la cámara en conexiones HTTP externas. Usa localhost o activa HTTPS.')
      return
    }
    try {
      lector.current ??= new Html5Qrcode(ID_LECTOR, { formatsToSupport: [Html5QrcodeSupportedFormats.CODE_128], verbose: false })
      camaras.current = await Html5Qrcode.getCameras()
      if (!camaras.current.length) throw new Error('sin cámaras')
      camaraActual.current = camaraTrasera(camaras.current).id
      await lector.current.start(camaraActual.current, CONFIG_LECTOR, alLeer)
      setActivo(true)
      setVarias(camaras.current.length > 1)
      notificar('Puedes comenzar a escanear.', 'success', 'Cámara Iniciada')
    } catch {
      setErrorCamara('No pudimos conectar con la cámara. Verifica los permisos, que ninguna otra app la esté usando y recarga la página.')
    }
  }

  const cambiarCamara = async () => {
    const lista = camaras.current
    const siguiente = lista[(lista.findIndex((c) => c.id === camaraActual.current) + 1) % lista.length]
    camaraActual.current = siguiente.id
    try {
      await lector.current.stop()
      await lector.current.start(siguiente.id, CONFIG_LECTOR, alLeer)
    } catch {
      notificar('No se pudo cambiar de cámara', 'error')
    }
  }

  const volver = () => {
    setResultado(null)
    setDocumento('')
    setManual(false)
  }

  return (
    <div>
      <div className="page-hero">
        <h2 className="text-3d">Validación de Acceso</h2>
        <p>Escanea el carnet o el pase, o busca por documento.</p>
      </div>

      <div className="scanner-layout">
        <div className="scanner-view-container" hidden={Boolean(resultado)}>
          <div id={ID_LECTOR} />
          {activo && <div className="laser-scanner" />}
          <div className="scanner-corners" aria-hidden="true">
            <div className="corner tl" />
            <div className="corner tr" />
            <div className="corner bl" />
            <div className="corner br" />
          </div>

          <div className={`scanner-ui-overlay${activo ? ' hidden' : ''}`}>
            <i className="fas fa-video-slash scanner-ui-overlay__icono" aria-hidden="true" />
            <h2>Cámara Lista</h2>
            <p className={`scanner-ui-overlay__mensaje${errorCamara ? ' scanner-ui-overlay__mensaje--error' : ''}`} role={errorCamara ? 'alert' : undefined}>
              {errorCamara || 'Presiona el botón para iniciar el escáner.'}
            </p>
            <div className="scanner-ui-overlay__botones">
              <button type="button" className="btn-power-camera" onClick={iniciar}>
                <i className="fas fa-power-off" aria-hidden="true" /> Iniciar escáner
              </button>
            </div>
          </div>
          {activo && varias && (
            <div className="scanner-ui-overlay__botones cambiar-camara">
              <button type="button" className="btn-power-camera btn-power-camera--secundario" onClick={cambiarCamara}>
                <i className="fas fa-sync-alt" aria-hidden="true" /> Cambiar cámara
              </button>
            </div>
          )}

          <div className={`scanner-ui-overlay success-flash${destello ? '' : ' hidden'}`} aria-hidden={!destello}>
            <i className="fas fa-check-circle" aria-hidden="true" />
            <h2>IDENTIFICADO</h2>
          </div>
        </div>

        {!resultado && (
          <div className="manual-trigger-group">
            <button type="button" className="btn-manual-toggle" aria-expanded={manual} onClick={() => setManual((v) => !v)}>
              <i className="fas fa-keyboard" aria-hidden="true" /> ¿Cámara con problemas? Usar búsqueda manual
            </button>
            {manual && (
              <form
                className="floating-form manual-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  validar(documento)
                }}
              >
                <div className="floating-group">
                  <input id="manualDoc" placeholder=" " maxLength={100} autoFocus value={documento} onChange={(e) => setDocumento(e.target.value)} />
                  <label htmlFor="manualDoc">Documento o código del pase</label>
                  <div className="floating-border" />
                </div>
                <button type="submit" className="glass-btn btn-glow">
                  <i className="fas fa-search" aria-hidden="true" /> Verificar Documento
                </button>
              </form>
            )}
          </div>
        )}

        {resultado && <Resultado key={`${resultado.tipo}-${resultado.id}`} datos={resultado} onRegistrado={volver} onVolver={volver} />}
      </div>
    </div>
  )
}
