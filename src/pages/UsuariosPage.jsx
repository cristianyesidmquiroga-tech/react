import { useCallback, useEffect, useOptimistic, useState, useTransition } from 'react'
import UsuarioForm from '../components/UsuarioForm'
import Campo from '../components/ui/Campo'
import Insignia from '../components/ui/Insignia'
import Modal from '../components/ui/Modal'
import Skeleton from '../components/ui/Skeleton'
import { useAuth } from '../context/AuthContext'
import { useNotificacion } from '../context/NotificationContext'
import { useDebounce } from '../hooks/useDebounce'
import ImportarExcel from '../components/ImportarExcel'
import { useFetch } from '../hooks/useFetch'
import { adminService, catalogoService } from '../services/api'

const TAMANO = 15

export default function UsuariosPage() {
  const { usuario: yo } = useAuth()
  const { notificar } = useNotificacion()
  const [texto, setTexto] = useState('')
  const [rolId, setRolId] = useState('')
  const [cargo, setCargo] = useState('')
  const [pagina, setPagina] = useState(0)
  const [catalogos, setCatalogos] = useState(null)
  const [editando, setEditando] = useState(undefined)
  const [erroresForm, setErroresForm] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [eliminando, setEliminando] = useState(null)
  const [autorizacion, setAutorizacion] = useState({ autorizadoPor: '', motivo: '' })
  const [, iniciarTransicion] = useTransition()
  const busqueda = useDebounce(texto.trim(), 350)

  useEffect(() => {
    catalogoService.obtener().then(setCatalogos).catch((e) => notificar(e.message, 'error'))
  }, [notificar])

  const [importando, setImportando] = useState(false)
  const { data, setData, cargando, error, recargar } = useFetch(
    (signal) => adminService.listarUsuarios({ texto: busqueda, rolId, cargo, page: pagina, size: TAMANO }, signal),
    [busqueda, rolId, cargo, pagina],
  )

  // La fila desaparece al instante y vuelve si el servidor rechaza la eliminación
  const [filas, quitarFila] = useOptimistic(data?.content || [], (actuales, id) => actuales.filter((u) => u.id !== id))

  const cerrarFormulario = useCallback(() => {
    setEditando(undefined)
    setErroresForm({})
  }, [])

  const guardar = async (datos) => {
    setGuardando(true)
    setErroresForm({})
    try {
      if (editando) {
        await adminService.editarUsuario(editando.id, datos)
        notificar('Usuario actualizado', 'success')
      } else {
        await adminService.crearUsuario(datos)
        notificar('Usuario creado. Deberá cambiar la contraseña temporal al entrar', 'success')
      }
      cerrarFormulario()
      recargar()
    } catch (err) {
      setErroresForm(Object.fromEntries(err.campos.map((c) => [c.campo, c.mensaje])))
      notificar(err.message, 'error')
    } finally {
      setGuardando(false)
    }
  }

  const confirmarEliminacion = () => {
    const objetivo = eliminando
    setEliminando(null)
    iniciarTransicion(async () => {
      quitarFila(objetivo.id)
      try {
        await adminService.eliminarUsuario(objetivo.id, {
          autorizadoPor: autorizacion.autorizadoPor.trim() || null,
          motivo: autorizacion.motivo.trim() || null,
        })
        setData((d) => ({ ...d, content: d.content.filter((u) => u.id !== objetivo.id), totalElements: d.totalElements - 1 }))
        notificar(`Se eliminó a ${objetivo.nombre}`, 'warning')
      } catch (err) {
        notificar(err.message, 'error')
      }
    })
  }

  const desbloquear = async (u) => {
    try {
      const actualizado = await adminService.desbloquear(u.id)
      setData((d) => ({ ...d, content: d.content.map((x) => (x.id === u.id ? actualizado : x)) }))
      notificar(`${u.nombre} ya puede iniciar sesión`, 'success')
    } catch (err) {
      notificar(err.message, 'error')
    }
  }

  return (
    <div>
      <div className="header-actions">
        <div className="header-title">
          <h2>Gestión de Perfiles</h2>
          <p className="texto-ayuda">{data ? `${data.totalElements} personas registradas` : 'Cargando...'}</p>
        </div>
        <div className="action-buttons">
          <button type="button" className="glass-btn" onClick={() => setImportando(true)}>
            <i className="fas fa-file-excel" aria-hidden="true" /> Importar Excel
          </button>
          <button type="button" className="glass-btn btn-primary" onClick={() => setEditando(null)} disabled={!catalogos}>
            <i className="fas fa-plus" aria-hidden="true" /> Nuevo Perfil
          </button>
        </div>
      </div>

      <div className="glass-card filtros-tabla modal-body">
        <div className="form-grid form-grid--tres">
          <Campo variante="grupo" etiqueta="Buscar">
            {(p) => (
              <input {...p} type="search" maxLength={100} placeholder="Nombre, correo o documento" value={texto} onChange={(e) => { setTexto(e.target.value); setPagina(0) }} />
            )}
          </Campo>
          <Campo variante="grupo" etiqueta="Rol">
            {(p) => (
              <select {...p} value={rolId} onChange={(e) => { setRolId(e.target.value); setPagina(0) }}>
                <option value="">Todos</option>
                {catalogos?.roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            )}
          </Campo>
          <Campo variante="grupo" etiqueta="Cargo">
            {(p) => (
              <select {...p} value={cargo} onChange={(e) => { setCargo(e.target.value); setPagina(0) }}>
                <option value="">Todos</option>
                {catalogos?.cargos.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </Campo>
        </div>
      </div>

      <div className="glass-container">
        {cargando && !data && <Skeleton filas={8} alto="2.4rem" />}
        {error && (
          <div className="estado-vacio" role="alert">
            <i className="fas fa-exclamation-triangle" aria-hidden="true" />
            <p>{error}</p>
            <button type="button" className="btn-outline" onClick={recargar}>
              Reintentar
            </button>
          </div>
        )}
        {!error && data && filas.length === 0 && (
          <div className="estado-vacio">
            <i className="fas fa-users" aria-hidden="true" />
            <p>No hay usuarios que coincidan con la búsqueda</p>
          </div>
        )}
        {!error && filas.length > 0 && (
          <div className="table-responsive">
            <table className="glass-table" aria-busy={cargando}>
              <caption className="solo-lectores">Usuarios registrados</caption>
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Documento</th>
                  <th scope="col">Correo</th>
                  <th scope="col">Cargo</th>
                  <th scope="col">Rol</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nombre}</td>
                    <td>{u.documento || 'N/A'}</td>
                    <td>{u.correo}</td>
                    <td>
                      <Insignia tipo={u.cargo === 'Aprendiz' ? 'info' : 'primary'}>{u.cargo || 'Sin Cargo'}</Insignia>
                    </td>
                    <td>{u.rol}</td>
                    <td>
                      {u.bloqueado ? (
                        <Insignia tipo="danger">Bloqueado</Insignia>
                      ) : u.perfilCompleto ? (
                        <Insignia tipo="success">Carnet activo</Insignia>
                      ) : (
                        <Insignia tipo="warning">Perfil incompleto</Insignia>
                      )}
                    </td>
                    <td className="action-cells">
                      {u.bloqueado && (
                        <button type="button" className="action-btn-glass action-btn-edit" onClick={() => desbloquear(u)} aria-label={`Desbloquear a ${u.nombre}`}>
                          <i className="fas fa-lock-open" aria-hidden="true" /> Desbloquear
                        </button>
                      )}
                      <button type="button" className="action-btn-glass action-btn-edit" onClick={() => setEditando(u)} aria-label={`Editar a ${u.nombre}`}>
                        <i className="fas fa-edit" aria-hidden="true" /> Editar
                      </button>
                      {u.rol !== 'Admin' && u.id !== yo?.id && (
                        <button
                          type="button"
                          className="action-btn-glass action-btn-delete"
                          onClick={() => {
                            setAutorizacion({ autorizadoPor: '', motivo: '' })
                            setEliminando(u)
                          }}
                          aria-label={`Eliminar a ${u.nombre}`}
                        >
                          <i className="fas fa-trash-alt" aria-hidden="true" /> Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
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

      <Modal
        abierto={editando !== undefined && Boolean(catalogos)}
        onCerrar={cerrarFormulario}
        titulo={editando ? 'Editar Perfil' : 'Nuevo Perfil'}
        ancho="lg"
        pie={
          <>
            <button type="button" className="btn-outline" onClick={cerrarFormulario}>
              Cancelar
            </button>
            <button type="submit" form="form-usuario" className="glass-btn btn-primary" disabled={guardando}>
              <i className="fas fa-save" aria-hidden="true" /> {guardando ? 'Guardando...' : editando ? 'Guardar Cambios' : 'Guardar Usuario'}
            </button>
          </>
        }
      >
        {editando !== undefined && catalogos && (
          <UsuarioForm
            key={editando?.id || 'nuevo'}
            id="form-usuario"
            usuario={editando}
            catalogos={catalogos}
            errorServidor={erroresForm}
            onGuardar={guardar}
          />
        )}
      </Modal>

      <Modal
        abierto={Boolean(eliminando)}
        onCerrar={() => setEliminando(null)}
        titulo="Autorización de Cambio"
        ancho="sm"
        pie={
          <>
            <button type="button" className="glass-btn btn-cancel" onClick={() => setEliminando(null)}>
              <i className="fas fa-times" aria-hidden="true" /> No, Cancelar
            </button>
            <button type="button" className="glass-btn btn-danger-action" onClick={confirmarEliminacion}>
              <i className="fas fa-trash-alt" aria-hidden="true" /> Sí, Eliminar
            </button>
          </>
        }
      >
        <div className="floating-form">
          <p className="texto-ayuda">
            Se eliminará a <strong>{eliminando?.nombre}</strong> con su foto y sus datos. Esta acción no se puede deshacer.
          </p>
          <Campo etiqueta="¿Quién autoriza el cambio?">
            {(p) => (
              <input {...p} maxLength={100} value={autorizacion.autorizadoPor} onChange={(e) => setAutorizacion((a) => ({ ...a, autorizadoPor: e.target.value }))} />
            )}
          </Campo>
          <Campo etiqueta="Motivo o Descripción">
            {(p) => (
              <textarea {...p} maxLength={500} value={autorizacion.motivo} onChange={(e) => setAutorizacion((a) => ({ ...a, motivo: e.target.value }))} />
            )}
          </Campo>
        </div>
      </Modal>
      <ImportarExcel abierto={importando} onCerrar={() => setImportando(false)} onImportado={recargar} />
    </div>
  )
}
