import { useCallback, useEffect, useOptimistic, useState, useTransition } from 'react'
import { ChevronLeft, ChevronRight, LockOpen, Pencil, Search, Trash2, UserPlus, Users } from 'lucide-react'
import UsuarioForm from '../components/UsuarioForm'
import Campo from '../components/ui/Campo'
import Insignia from '../components/ui/Insignia'
import Modal from '../components/ui/Modal'
import Skeleton from '../components/ui/Skeleton'
import { useAuth } from '../context/AuthContext'
import { useNotificacion } from '../context/NotificationContext'
import { useDebounce } from '../hooks/useDebounce'
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
      <header className="pagina-cabecera">
        <div>
          <h1>Gestión de usuarios</h1>
          <p>{data ? `${data.totalElements} personas registradas` : 'Cargando...'}</p>
        </div>
        <button type="button" className="boton boton--primario" onClick={() => setEditando(null)} disabled={!catalogos}>
          <UserPlus size={18} aria-hidden="true" />
          Nuevo usuario
        </button>
      </header>

      <section className="tarjeta">
        <div className="formulario__fila filtros">
          <Campo etiqueta="Buscar">
            {(p) => (
              <div className="campo-busqueda">
                <Search size={18} aria-hidden="true" />
                <input {...p} type="search" maxLength={100} placeholder="Nombre, correo o documento" value={texto} onChange={(e) => { setTexto(e.target.value); setPagina(0) }} />
              </div>
            )}
          </Campo>
          <Campo etiqueta="Rol">
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
          <Campo etiqueta="Cargo">
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

        {cargando && !data && <Skeleton filas={8} alto="2.4rem" />}
        {error && (
          <div className="estado estado--error" role="alert">
            <p>{error}</p>
            <button type="button" className="boton boton--secundario" onClick={recargar}>
              Reintentar
            </button>
          </div>
        )}
        {!error && data && filas.length === 0 && (
          <div className="estado">
            <Users size={32} aria-hidden="true" />
            <p>No hay usuarios que coincidan con la búsqueda</p>
          </div>
        )}
        {!error && filas.length > 0 && (
          <table className="tabla" aria-busy={cargando}>
            <caption className="solo-lectores">Usuarios registrados</caption>
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Documento</th>
                <th scope="col">Rol</th>
                <th scope="col">Cargo</th>
                <th scope="col">Estado</th>
                <th scope="col">
                  <span className="solo-lectores">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map((u) => (
                <tr key={u.id}>
                  <td data-titulo="Nombre">
                    <div className="celda-nombre">
                      <strong>{u.nombre}</strong>
                      <span>{u.correo}</span>
                    </div>
                  </td>
                  <td data-titulo="Documento">{u.documento || 'Sin registrar'}</td>
                  <td data-titulo="Rol">{u.rol}</td>
                  <td data-titulo="Cargo">{u.cargo || 'Sin cargo'}</td>
                  <td data-titulo="Estado">
                    {u.bloqueado ? (
                      <Insignia tipo="peligro">Bloqueado</Insignia>
                    ) : u.perfilCompleto ? (
                      <Insignia tipo="exito">Carnet activo</Insignia>
                    ) : (
                      <Insignia tipo="aviso">Perfil incompleto</Insignia>
                    )}
                  </td>
                  <td data-titulo="Acciones">
                    <div className="acciones">
                      {u.bloqueado && (
                        <button type="button" className="boton-icono" onClick={() => desbloquear(u)} aria-label={`Desbloquear a ${u.nombre}`}>
                          <LockOpen size={18} aria-hidden="true" />
                        </button>
                      )}
                      <button type="button" className="boton-icono" onClick={() => setEditando(u)} aria-label={`Editar a ${u.nombre}`}>
                        <Pencil size={18} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="boton-icono"
                        onClick={() => {
                          setAutorizacion({ autorizadoPor: '', motivo: '' })
                          setEliminando(u)
                        }}
                        disabled={u.rol === 'Admin' || u.id === yo?.id}
                        aria-label={`Eliminar a ${u.nombre}`}
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data && data.totalPages > 1 && (
          <nav className="paginador" aria-label="Paginación">
            <span>
              Página {data.number + 1} de {data.totalPages}
            </span>
            <div className="paginador__botones">
              <button type="button" className="boton boton--secundario" disabled={data.first} onClick={() => setPagina((p) => p - 1)}>
                <ChevronLeft size={18} aria-hidden="true" />
                Anterior
              </button>
              <button type="button" className="boton boton--secundario" disabled={data.last} onClick={() => setPagina((p) => p + 1)}>
                Siguiente
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </nav>
        )}
      </section>

      <Modal
        abierto={editando !== undefined && Boolean(catalogos)}
        onCerrar={cerrarFormulario}
        titulo={editando ? `Editar a ${editando.nombre}` : 'Nuevo usuario'}
        ancho="lg"
        pie={
          <>
            <button type="button" className="boton boton--secundario" onClick={cerrarFormulario}>
              Cancelar
            </button>
            <button type="submit" form="form-usuario" className="boton boton--primario" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
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
        titulo="Eliminar usuario"
        ancho="sm"
        pie={
          <>
            <button type="button" className="boton boton--secundario" onClick={() => setEliminando(null)}>
              Cancelar
            </button>
            <button type="button" className="boton boton--peligro" onClick={confirmarEliminacion}>
              Eliminar
            </button>
          </>
        }
      >
        <div className="formulario">
          <p>
            Se eliminará a <strong>{eliminando?.nombre}</strong> con su foto y sus datos. Esta acción no se puede deshacer.
          </p>
          <Campo etiqueta="Autorizado por">
            {(p) => (
              <input {...p} maxLength={100} value={autorizacion.autorizadoPor} onChange={(e) => setAutorizacion((a) => ({ ...a, autorizadoPor: e.target.value }))} />
            )}
          </Campo>
          <Campo etiqueta="Motivo">
            {(p) => (
              <textarea {...p} maxLength={500} value={autorizacion.motivo} onChange={(e) => setAutorizacion((a) => ({ ...a, motivo: e.target.value }))} />
            )}
          </Campo>
        </div>
      </Modal>
    </div>
  )
}
