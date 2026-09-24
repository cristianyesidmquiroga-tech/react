import { useActionState, useOptimistic, useTransition } from 'react'
import Campo from './ui/Campo'
import Skeleton from './ui/Skeleton'
import { useConfirmar } from '../context/ConfirmContext'
import { useNotificacion } from '../context/NotificationContext'
import { useFetch } from '../hooks/useFetch'
import { equipoService } from '../services/api'
import logoSena from '../assets/img/logoSena.png'

const ICONOS = { Computador: 'fa-desktop', Portátil: 'fa-laptop', Tablet: 'fa-tablet-alt', Celular: 'fa-mobile-alt' }
const TIPOS = ['Computador', 'Portátil', 'Tablet', 'Celular', 'Otro']

export function ListaEquipos() {
  const { notificar } = useNotificacion()
  const confirmar = useConfirmar()
  const [, iniciar] = useTransition()
  const { data, setData, cargando, error, recargar } = useFetch((signal) => equipoService.listar(signal), [])
  // La fila sale al instante y vuelve si el servidor rechaza el borrado
  const [equipos, quitar] = useOptimistic(data || [], (lista, id) => lista.filter((e) => e.id !== id))

  const eliminar = async (equipo) => {
    if (!(await confirmar('¿Desvincular este equipo?', `"${equipo.nombre}" ya no aparecerá en portería.`, 'Sí, Desvincular'))) return
    iniciar(async () => {
      quitar(equipo.id)
      try {
        await equipoService.eliminar(equipo.id)
        setData((lista) => lista.filter((e) => e.id !== equipo.id))
        notificar('Equipo desvinculado', 'warning')
      } catch (err) {
        notificar(err.message, 'error')
      }
    })
  }

  return (
    <section className="glass-card perfil-seccion" aria-labelledby="titulo-equipos">
      <h2 id="titulo-equipos" className="text-3d perfil-seccion__titulo">
        <img src={logoSena} alt="" /> Equipos Vinculados
      </h2>
      {cargando && !data && <Skeleton filas={3} alto="3.5rem" />}
      {error && (
        <div className="estado-vacio" role="alert">
          <p>{error}</p>
          <button type="button" className="btn-outline" onClick={recargar}>
            Reintentar
          </button>
        </div>
      )}
      {data && equipos.length === 0 && <p className="celda-vacia">No hay equipos registrados.</p>}
      {equipos.length > 0 && (
        <ul className="device-list">
          {equipos.map((eq) => (
            <li key={eq.id} className="device-item glass-card">
              <i className={`fas ${ICONOS[eq.tipo] || 'fa-box'} device-icono`} aria-hidden="true" />
              <div className="device-info">
                <strong>{eq.nombre}</strong>
                <small className="dato-secundario">
                  S/N: {eq.serial || 'Sin serial'} · {eq.estado}
                </small>
              </div>
              <button type="button" className="device-borrar" onClick={() => eliminar(eq)} aria-label={`Desvincular ${eq.nombre}`}>
                <i className="fas fa-trash" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function NuevoEquipo({ onGuardado }) {
  const { notificar } = useNotificacion()
  const [errores, accion, enviando] = useActionState(async (_previo, f) => {
    const valor = (campo) => String(f.get(campo) || '').trim() || null
    try {
      await equipoService.registrar({ serial: valor('serial'), nombre: valor('nombre'), tipo: valor('tipo') })
      notificar('Equipo vinculado', 'success')
      onGuardado()
      return {}
    } catch (err) {
      notificar(err.message, 'error')
      return Object.fromEntries(err.campos.map((c) => [c.campo, c.mensaje]))
    }
  }, {})

  return (
    <section className="glass-card perfil-seccion" aria-labelledby="titulo-nuevo-equipo">
      <h2 id="titulo-nuevo-equipo" className="text-3d perfil-seccion__titulo">
        <img src={logoSena} alt="" /> Vincular Nuevo Equipo
      </h2>
      <form action={accion} className="floating-form" autoComplete="off">
        <Campo etiqueta="Serial / S/N" error={errores.serial} ayuda="Está en la parte inferior del equipo">
          {(p) => <input {...p} name="serial" maxLength={60} />}
        </Campo>
        <Campo etiqueta="Nombre del Equipo" error={errores.nombre} requerido>
          {(p) => <input {...p} name="nombre" required maxLength={100} />}
        </Campo>
        <Campo etiqueta="Tipo de Equipo" error={errores.tipo} requerido>
          {(p) => (
            <select {...p} name="tipo" required defaultValue="Computador">
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </Campo>
        <button type="submit" className="btn-glow boton-bloque" disabled={enviando}>
          {enviando ? 'Vinculando...' : 'Vincular Equipo'} <i className="fas fa-plus" aria-hidden="true" />
        </button>
      </form>
    </section>
  )
}
