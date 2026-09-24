import { useActionState, useEffect, useRef, useState } from 'react'
import JsBarcode from 'jsbarcode'
import Campo from '../components/ui/Campo'
import Modal from '../components/ui/Modal'
import Skeleton from '../components/ui/Skeleton'
import { useConfirmar } from '../context/ConfirmContext'
import { useNotificacion } from '../context/NotificationContext'
import { useFetch } from '../hooks/useFetch'
import { paseService } from '../services/api'

const PESTANAS = [
  { clave: 'visitantes', texto: 'Personas (Visitantes)' },
  { clave: 'vehiculos', texto: 'Vehículos (Logística)' },
  { clave: 'objetos', texto: 'Objetos Externos' },
]

const texto = (formulario, campo) => String(formulario.get(campo) || '').trim() || null

function CodigoPase({ pase, onCerrar }) {
  const svg = useRef(null)

  useEffect(() => {
    if (pase && svg.current) {
      JsBarcode(svg.current, pase.codigo, { format: 'CODE128', height: 110, margin: 10, displayValue: true, fontSize: 14 })
    }
  }, [pase])

  return (
    <Modal abierto={Boolean(pase)} onCerrar={onCerrar} titulo={pase?.titulo || 'Pase de acceso'} ancho="sm">
      <p className="texto-ayuda">Toma una foto o imprime este código. El escáner de portería lo lee directamente.</p>
      <div className="caja-barras">
        <svg ref={svg} role="img" aria-label={`Código ${pase?.codigo}`} />
      </div>
      <button type="button" className="glass-btn btn-glow boton-bloque" onClick={() => window.print()}>
        <i className="fas fa-print" aria-hidden="true" /> Imprimir pase
      </button>
    </Modal>
  )
}

// Guarda con una acción de React 19 y avisa al padre para refrescar la lista
function useRegistro(guardar, onGuardado, objetoEditado = null) {
  const { notificar } = useNotificacion()
  return useActionState(async (_previo, formulario) => {
    try {
      const creado = await guardar(formulario)
      notificar(objetoEditado ? 'Cambios guardados' : 'Pase generado', 'success')
      onGuardado(creado)
      return {}
    } catch (err) {
      notificar(err.message, 'error')
      return Object.fromEntries(err.campos.map((c) => [c.campo, c.mensaje]))
    }
  }, {})
}

function FormVisitante({ onGuardado }) {
  const [errores, accion, enviando] = useRegistro(
    (f) => paseService.registrarVisitante({ nombre: texto(f, 'nombre'), documento: texto(f, 'documento'), motivo: texto(f, 'motivo') }),
    onGuardado,
  )
  return (
    <form action={accion} className="floating-form" autoComplete="off">
      <Campo etiqueta="Nombre Completo" error={errores.nombre} requerido>
        {(p) => <input {...p} name="nombre" required maxLength={100} />}
      </Campo>
      <Campo etiqueta="Documento" error={errores.documento} requerido>
        {(p) => <input {...p} name="documento" required minLength={5} maxLength={20} />}
      </Campo>
      <Campo etiqueta="Entidad / Motivo de la visita" error={errores.motivo}>
        {(p) => <input {...p} name="motivo" maxLength={255} />}
      </Campo>
      <button type="submit" className="glass-btn btn-glow" disabled={enviando}>
        <i className="fas fa-plus" aria-hidden="true" /> {enviando ? 'Generando...' : 'Generar pase'}
      </button>
    </form>
  )
}

function FormVehiculo({ onGuardado }) {
  const [errores, accion, enviando] = useRegistro(
    (f) =>
      paseService.registrarVehiculo({
        placa: texto(f, 'placa')?.toUpperCase(),
        tipo: texto(f, 'tipo'),
        propietario: texto(f, 'propietario'),
        motivo: texto(f, 'motivo'),
      }),
    onGuardado,
  )
  return (
    <form action={accion} className="floating-form" autoComplete="off">
      <Campo etiqueta="Placa" error={errores.placa} requerido>
        {(p) => <input {...p} name="placa" required minLength={5} maxLength={8} className="texto-mayusculas" />}
      </Campo>
      <Campo etiqueta="Tipo de Vehículo" error={errores.tipo} requerido>
        {(p) => (
          <select {...p} name="tipo" required defaultValue="">
            <option value="" disabled>
              -- Selecciona Tipo --
            </option>
            <option value="Externo">Externo (Visitante)</option>
            <option value="SENA">SENA (Oficial)</option>
          </select>
        )}
      </Campo>
      <Campo etiqueta="Propietario / Conductor" error={errores.propietario}>
        {(p) => <input {...p} name="propietario" maxLength={100} />}
      </Campo>
      <Campo etiqueta="Motivo de Ingreso" error={errores.motivo}>
        {(p) => <textarea {...p} name="motivo" rows={3} maxLength={255} />}
      </Campo>
      <button type="submit" className="glass-btn btn-glow" disabled={enviando}>
        <i className="fas fa-plus" aria-hidden="true" /> {enviando ? 'Registrando...' : 'Registrar y generar pase'}
      </button>
    </form>
  )
}

function FormObjeto({ objeto, onGuardado }) {
  const [errores, accion, enviando] = useRegistro((f) => {
    const datos = { descripcion: texto(f, 'descripcion'), serial: texto(f, 'serial'), propietario: texto(f, 'propietario'), motivo: texto(f, 'motivo') }
    return objeto ? paseService.actualizarObjeto(objeto.id, datos) : paseService.registrarObjeto(datos)
  }, onGuardado, objeto)
  return (
    <form action={accion} className="floating-form" autoComplete="off">
      <Campo etiqueta="Descripción del Objeto (ej. Portátil, Taladro)" error={errores.descripcion} requerido>
        {(p) => <input {...p} name="descripcion" required maxLength={150} defaultValue={objeto?.descripcion} />}
      </Campo>
      <Campo etiqueta="Serial / Placa de Control (Opcional)" error={errores.serial}>
        {(p) => <input {...p} name="serial" maxLength={60} defaultValue={objeto?.serial} />}
      </Campo>
      <Campo etiqueta="Propietario / Portador" error={errores.propietario}>
        {(p) => <input {...p} name="propietario" maxLength={100} defaultValue={objeto?.propietario} />}
      </Campo>
      <Campo etiqueta="Motivo de Ingreso" error={errores.motivo}>
        {(p) => <textarea {...p} name="motivo" rows={3} maxLength={255} defaultValue={objeto?.motivo} />}
      </Campo>
      <button type="submit" className="glass-btn btn-glow" disabled={enviando}>
        <i className={`fas ${objeto ? 'fa-save' : 'fa-plus'}`} aria-hidden="true" />{' '}
        {enviando ? 'Guardando...' : objeto ? 'Guardar Cambios' : 'Registrar y generar pase'}
      </button>
    </form>
  )
}

function Tabla({ titulo, columnas, filas, vacio, render }) {
  return (
    <div className="card tabla-pases">
      <h3>{titulo}</h3>
      <div className="table-responsive">
        <table className="glass-table">
          <thead>
            <tr>
              {columnas.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr>
                <td colSpan={columnas.length} className="celda-vacia">
                  {vacio}
                </td>
              </tr>
            ) : (
              filas.map(render)
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BotonCodigo({ onClick }) {
  return (
    <button type="button" className="action-btn-glass action-btn-edit" onClick={onClick}>
      <i className="fas fa-barcode" aria-hidden="true" /> Ver código
    </button>
  )
}

export default function PasesPage() {
  const { notificar } = useNotificacion()
  const confirmar = useConfirmar()
  const [pestana, setPestana] = useState('visitantes')
  const [pase, setPase] = useState(null)
  const [editando, setEditando] = useState(null)
  const { data, cargando, error, recargar } = useFetch((signal) => paseService.listar(signal), [])

  const alGuardar = (creado) => {
    recargar()
    setPase({ codigo: creado.codigo, titulo: creado.nombre || (creado.placa && `Vehículo ${creado.placa}`) || creado.descripcion })
  }

  const alEditar = () => {
    recargar()
    setEditando(null)
  }

  const desactivar = async (obj) => {
    if (!(await confirmar('¿Retirar este objeto?', `El pase de "${obj.descripcion}" dejará de funcionar en portería.`, 'Sí, Retirar'))) return
    try {
      await paseService.desactivarObjeto(obj.id)
      notificar('Objeto retirado', 'warning')
      recargar()
    } catch (err) {
      notificar(err.message, 'error')
    }
  }

  const contenido = () => {
    if (cargando && !data) return <Skeleton filas={6} alto="2.4rem" />
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
    if (pestana === 'visitantes') {
      return (
        <div className="pases-rejilla">
          <div className="glass-card pases-formulario">
            <FormVisitante onGuardado={alGuardar} />
          </div>
          <Tabla
            titulo="Visitantes Recientes"
            columnas={['Nombre / Documento', 'Motivo', 'Acciones']}
            filas={data.visitantes}
            vacio="No hay visitantes registrados."
            render={(v) => (
              <tr key={v.id}>
                <td>
                  <strong>{v.nombre}</strong>
                  <small className="dato-secundario">{v.documento}</small>
                </td>
                <td>{v.motivo || 'N/A'}</td>
                <td>
                  <BotonCodigo onClick={() => setPase({ codigo: v.codigo, titulo: v.nombre })} />
                </td>
              </tr>
            )}
          />
        </div>
      )
    }
    if (pestana === 'vehiculos') {
      return (
        <div className="pases-rejilla">
          <div className="glass-card pases-formulario">
            <FormVehiculo onGuardado={alGuardar} />
          </div>
          <Tabla
            titulo="Listado de Vehículos"
            columnas={['Placa / Tipo', 'Dueño / Motivo', 'Acciones']}
            filas={data.vehiculos}
            vacio="No hay vehículos registrados."
            render={(veh) => (
              <tr key={veh.id}>
                <td>
                  <strong className="dato-destacado">{veh.placa}</strong>
                  <span className={`badge ${veh.tipo === 'SENA' ? 'badge-success' : 'badge-info'}`}>{veh.tipo}</span>
                </td>
                <td>
                  {veh.propietario || 'Anónimo'}
                  <small className="dato-secundario">{veh.motivo || '-'}</small>
                </td>
                <td>
                  <BotonCodigo onClick={() => setPase({ codigo: veh.codigo, titulo: `Vehículo ${veh.placa}` })} />
                </td>
              </tr>
            )}
          />
        </div>
      )
    }
    return (
      <div className="pases-rejilla">
        <div className="glass-card pases-formulario">
          <FormObjeto onGuardado={alGuardar} />
        </div>
        <Tabla
          titulo="Equipos y Objetos de Terceros"
          columnas={['Descripción / Serial', 'Dueño / Motivo', 'Acciones']}
          filas={data.objetos.filter((o) => o.activo)}
          vacio="No hay objetos externos registrados."
          render={(obj) => (
            <tr key={obj.id}>
              <td>
                <strong className="dato-destacado">{obj.descripcion}</strong>
                <span className="badge badge-primary">S/N: {obj.serial || 'Sin serial'}</span>
              </td>
              <td>
                {obj.propietario || 'Anónimo'}
                <small className="dato-secundario">{obj.motivo || '-'}</small>
              </td>
              <td className="action-cells">
                <BotonCodigo onClick={() => setPase({ codigo: obj.codigo, titulo: obj.descripcion })} />
                <button type="button" className="action-btn-glass action-btn-edit" onClick={() => setEditando(obj)}>
                  <i className="fas fa-edit" aria-hidden="true" /> Editar
                </button>
                <button type="button" className="action-btn-glass action-btn-delete" onClick={() => desactivar(obj)}>
                  <i className="fas fa-trash" aria-hidden="true" /> Retirar
                </button>
              </td>
            </tr>
          )}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="page-hero">
        <h2 className="text-3d">Gestión de Pases</h2>
        <p>Control de visitantes y logística externa.</p>
      </div>

      <div className="top-tabs" role="tablist" aria-label="Tipo de pase">
        {PESTANAS.map((p) => (
          <button
            key={p.clave}
            type="button"
            role="tab"
            aria-selected={pestana === p.clave}
            className={`tab-btn${pestana === p.clave ? ' active' : ''}`}
            onClick={() => setPestana(p.clave)}
          >
            {p.texto}
          </button>
        ))}
      </div>

      <div role="tabpanel">{contenido()}</div>

      <CodigoPase pase={pase} onCerrar={() => setPase(null)} />

      <Modal abierto={Boolean(editando)} onCerrar={() => setEditando(null)} titulo="Editar Objeto Externo">
        {editando && <FormObjeto key={editando.id} objeto={editando} onGuardado={alEditar} />}
      </Modal>
    </div>
  )
}
