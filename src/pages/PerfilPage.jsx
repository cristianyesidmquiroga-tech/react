import { useEffect, useRef, useState } from 'react'
import { Camera, CircleAlert, Save } from 'lucide-react'
import CarnetDigital from '../components/CarnetDigital'
import Campo from '../components/ui/Campo'
import Insignia from '../components/ui/Insignia'
import Skeleton from '../components/ui/Skeleton'
import { useAuth } from '../context/AuthContext'
import { useNotificacion } from '../context/NotificationContext'
import { useFotoProtegida } from '../hooks/useFotoProtegida'
import { catalogoService, perfilService } from '../services/api'
import './perfil.css'

const ESTADOS_FOTO = {
  sin_foto: ['info', 'Sin foto'],
  pendiente: ['aviso', 'En revisión'],
  aprobada: ['exito', 'Aprobada'],
  rechazada: ['peligro', 'Rechazada'],
}
const TAMANO_MAXIMO = 8 * 1024 * 1024

function aFormulario(p) {
  return {
    nombres: p.nombres || '',
    apellidos: p.apellidos || '',
    tipoDocumento: p.tipoDocumento || 'CC',
    documento: p.documento || '',
    programa: p.programa || '',
    fichaId: p.fichaId ? String(p.fichaId) : '',
    tipoSangre: p.tipoSangre || '',
  }
}

export default function PerfilPage() {
  const { refrescarUsuario } = useAuth()
  const { notificar } = useNotificacion()
  const [perfil, setPerfil] = useState(null)
  const [carnet, setCarnet] = useState(null)
  const [catalogos, setCatalogos] = useState(null)
  const [datos, setDatos] = useState(null)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [archivo, setArchivo] = useState(null)
  const [vistaPrevia, setVistaPrevia] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [versionFoto, setVersionFoto] = useState(0)
  const [errorCarga, setErrorCarga] = useState(null)
  const entradaFoto = useRef(null)
  const fotoUrl = useFotoProtegida(perfil?.tieneFoto ? perfil.id : null, versionFoto)

  const cargar = async () => {
    const [p, c] = await Promise.all([perfilService.obtener(), perfilService.carnet()])
    setPerfil(p)
    setCarnet(c)
    setDatos(aFormulario(p))
  }

  useEffect(() => {
    Promise.all([cargar(), catalogoService.obtener().then(setCatalogos)]).catch((e) => setErrorCarga(e.message))
  }, [])

  // Libera la URL temporal de la vista previa al cambiarla o al salir de la página
  useEffect(() => () => vistaPrevia && URL.revokeObjectURL(vistaPrevia), [vistaPrevia])

  if (errorCarga) {
    return (
      <p className="alerta alerta--peligro" role="alert">
        <CircleAlert size={18} aria-hidden="true" />
        {errorCarga}
      </p>
    )
  }
  if (!perfil || !datos || !catalogos) return <Skeleton filas={8} alto="2.2rem" />

  const esAprendiz = perfil.cargo === 'Aprendiz'
  const [tipoEstado, textoEstado] = ESTADOS_FOTO[perfil.fotoEstado] || ESTADOS_FOTO.sin_foto
  const formato = catalogos.tiposDocumento.find((t) => t.codigo === datos.tipoDocumento)?.formato

  const cambiar = (e) => setDatos((d) => ({ ...d, [e.target.name]: e.target.value }))

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setErrores({})
    try {
      await perfilService.actualizar({
        nombres: datos.nombres || null,
        apellidos: datos.apellidos || null,
        tipoDocumento: datos.tipoDocumento,
        documento: datos.documento || null,
        programa: esAprendiz ? null : datos.programa || null,
        fichaId: esAprendiz && datos.fichaId ? Number(datos.fichaId) : null,
        tipoSangre: datos.tipoSangre || null,
      })
      await cargar()
      await refrescarUsuario()
      notificar('Perfil actualizado', 'success')
    } catch (err) {
      setErrores(Object.fromEntries(err.campos.map((c) => [c.campo, c.mensaje])))
      notificar(err.message, 'error')
    } finally {
      setGuardando(false)
    }
  }

  const elegirFoto = (e) => {
    const elegido = e.target.files?.[0]
    if (!elegido) return
    if (elegido.size > TAMANO_MAXIMO) {
      notificar('La imagen supera 8 MB', 'error')
      e.target.value = ''
      return
    }
    setArchivo(elegido)
    setVistaPrevia(URL.createObjectURL(elegido))
  }

  const subirFoto = async () => {
    setSubiendo(true)
    try {
      await perfilService.subirFoto(archivo)
      setArchivo(null)
      setVistaPrevia(null)
      if (entradaFoto.current) entradaFoto.current.value = ''
      await cargar()
      await refrescarUsuario()
      setVersionFoto((v) => v + 1)
      notificar('Foto enviada. Un administrador la revisará para activar tu carnet', 'info')
    } catch (err) {
      notificar(err.message, 'error')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="perfil">
      <header className="pagina-cabecera">
        <div>
          <h1>Mi perfil</h1>
          <p>{perfil.correo}</p>
        </div>
      </header>

      <div className="perfil__rejilla">
        <section className="perfil__carnet" aria-labelledby="titulo-carnet">
          <h2 id="titulo-carnet" className="solo-lectores">Carnet digital</h2>
          <CarnetDigital carnet={carnet} fotoUrl={fotoUrl} />

          <div className="tarjeta perfil__foto">
            <div className="perfil__foto-estado">
              <h2>Foto del carnet</h2>
              <Insignia tipo={tipoEstado}>{textoEstado}</Insignia>
            </div>
            {perfil.fotoEstado === 'rechazada' && perfil.fotoMotivo && (
              <p className="alerta alerta--peligro">
                <CircleAlert size={18} aria-hidden="true" />
                <span>Motivo del rechazo: {perfil.fotoMotivo}</span>
              </p>
            )}
            <p className="campo__ayuda">
              Foto de frente, solo tú, con buena luz y sin gafas oscuras. JPG, PNG o BMP de máximo 8 MB.
            </p>
            {vistaPrevia && <img className="perfil__vista-previa" src={vistaPrevia} alt="Vista previa de la foto nueva" width="140" height="175" />}
            <input
              ref={entradaFoto}
              id="entrada-foto"
              className="solo-lectores"
              type="file"
              accept="image/jpeg,image/png,image/bmp"
              onChange={elegirFoto}
            />
            <div className="perfil__foto-acciones">
              <label htmlFor="entrada-foto" className="boton boton--secundario">
                <Camera size={18} aria-hidden="true" />
                Elegir foto
              </label>
              <button type="button" className="boton boton--primario" disabled={!archivo || subiendo} onClick={subirFoto}>
                {subiendo ? 'Enviando...' : 'Enviar foto'}
              </button>
            </div>
          </div>
        </section>

        <section className="tarjeta" aria-labelledby="titulo-datos">
          <h2 id="titulo-datos" className="perfil__subtitulo">Datos personales</h2>
          <form className="formulario" onSubmit={guardar} noValidate>
            <div className="formulario__fila">
              <Campo etiqueta="Nombres" error={errores.nombres}>
                {(p) => <input {...p} name="nombres" maxLength={100} value={datos.nombres} onChange={cambiar} />}
              </Campo>
              <Campo etiqueta="Apellidos" error={errores.apellidos}>
                {(p) => <input {...p} name="apellidos" maxLength={100} value={datos.apellidos} onChange={cambiar} />}
              </Campo>
            </div>
            <div className="formulario__fila">
              <Campo etiqueta="Tipo de documento">
                {(p) => (
                  <select {...p} name="tipoDocumento" value={datos.tipoDocumento} onChange={cambiar}>
                    {catalogos.tiposDocumento.map((t) => (
                      <option key={t.codigo} value={t.codigo}>
                        {t.etiqueta}
                      </option>
                    ))}
                  </select>
                )}
              </Campo>
              <Campo etiqueta="Número de documento" error={errores.documento} ayuda={formato && `Debe tener ${formato}`} requerido>
                {(p) => <input {...p} name="documento" inputMode="numeric" maxLength={20} value={datos.documento} onChange={cambiar} />}
              </Campo>
            </div>
            <div className="formulario__fila">
              <Campo etiqueta="Tipo de sangre (RH)" requerido>
                {(p) => (
                  <select {...p} name="tipoSangre" value={datos.tipoSangre} onChange={cambiar}>
                    <option value="">Selecciona</option>
                    {catalogos.tiposSangre.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                )}
              </Campo>
              {esAprendiz ? (
                <Campo etiqueta="Ficha de formación" ayuda="El programa y la fecha de finalización salen de la ficha" requerido>
                  {(p) => (
                    <select {...p} name="fichaId" value={datos.fichaId} onChange={cambiar}>
                      <option value="">Selecciona tu ficha</option>
                      {catalogos.fichas.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.numero} - {f.programa}
                        </option>
                      ))}
                    </select>
                  )}
                </Campo>
              ) : (
                <Campo etiqueta="Programa o área" error={errores.programa}>
                  {(p) => <input {...p} name="programa" maxLength={100} value={datos.programa} onChange={cambiar} />}
                </Campo>
              )}
            </div>
            <div>
              <button type="submit" className="boton boton--primario" disabled={guardando}>
                <Save size={18} aria-hidden="true" />
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
