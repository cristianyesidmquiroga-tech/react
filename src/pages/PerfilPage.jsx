import { useEffect, useRef, useState } from 'react'
import CarnetDigital from '../components/CarnetDigital'
import Campo from '../components/ui/Campo'
import Insignia from '../components/ui/Insignia'
import Skeleton from '../components/ui/Skeleton'
import { useAuth } from '../context/AuthContext'
import { useNotificacion } from '../context/NotificationContext'
import { useFotoProtegida } from '../hooks/useFotoProtegida'
import { catalogoService, perfilService } from '../services/api'
import logoSena from '../assets/img/logoSena.png'

const ESTADOS_FOTO = {
  sin_foto: ['info', 'Sin foto'],
  pendiente: ['warning', 'En revisión'],
  aprobada: ['success', 'Aprobada'],
  rechazada: ['danger', 'Rechazada'],
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
  const [seccion, setSeccion] = useState(null)
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
      <div className="error-alert" role="alert">
        <i className="fas fa-exclamation-circle" aria-hidden="true" />
        <span>{errorCarga}</span>
      </div>
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
    <div className="profile-container">
      <div className="profile-quick-actions">
        <button
          type="button"
          className="btn-action gradient-blue stagger-item magnetic-btn"
          aria-pressed={seccion === 'info'}
          onClick={() => setSeccion('info')}
        >
          <i className="fas fa-user-edit" aria-hidden="true" /> Información
        </button>
      </div>

      <div className="profile-split-layout">
        <div className="left-wing">
          <CarnetDigital carnet={carnet} fotoUrl={fotoUrl} cargo={perfil.cargo} />
          {!carnet?.activo && (
            <p className="carnet-aviso">
              {perfil.fotoEstado === 'pendiente' ? (
                'Tu foto está en revisión. En cuanto un administrador la apruebe, el código de barras de tu carnet se activa.'
              ) : (
                <>
                  Completa tus datos en <strong>Información</strong> para activar el código de barras de tu carnet.
                </>
              )}
            </p>
          )}
        </div>

        <div className="right-wing">
          {seccion !== 'info' ? (
            <div className="glass-card perfil-bienvenida">
              <i className="fas fa-fingerprint" aria-hidden="true" />
              <h2 className="text-3d">Centro de Gestión</h2>
              <p>Selecciona una acción arriba para gestionar tus datos.</p>
            </div>
          ) : (
            <section className="glass-card perfil-seccion" aria-labelledby="titulo-datos">
              <h2 id="titulo-datos" className="text-3d perfil-seccion__titulo">
                <img src={logoSena} alt="" /> Actualizar Datos
              </h2>

              <div className="requisitos-foto">
                <p className="requisitos-foto__titulo">
                  <i className="fas fa-camera-retro" aria-hidden="true" /> Cómo debe ser tu foto
                  <Insignia tipo={tipoEstado}>{textoEstado}</Insignia>
                </p>
                <p className="requisitos-foto__texto">En portería el celador compara esta foto contigo para dejarte entrar.</p>
                <ul>
                  <li>
                    <strong>Solo tú.</strong> Nadie más puede aparecer en la imagen, ni siquiera de fondo.
                  </li>
                  <li>
                    <strong>El rostro despejado y bien visible.</strong> Sin gorra, capucha, mascarilla ni nada que tape la cara.
                  </li>
                  <li>
                    <strong>Con buena luz</strong>, de frente y de cerca, tipo foto de documento.
                  </li>
                </ul>
                {perfil.fotoEstado === 'rechazada' && perfil.fotoMotivo && (
                  <div className="error-alert">
                    <i className="fas fa-times-circle" aria-hidden="true" />
                    <span>Motivo del rechazo: {perfil.fotoMotivo}</span>
                  </div>
                )}
              </div>

              <div className="floating-group">
                <input ref={entradaFoto} id="foto" type="file" accept="image/jpeg,image/png,image/bmp" onChange={elegirFoto} aria-describedby="ayuda-foto" />
                <label htmlFor="foto">Foto de Perfil</label>
                <div className="floating-border" />
              </div>
              <p id="ayuda-foto" className="texto-ayuda">
                Formatos: JPG, PNG o BMP. Máximo 8 MB.
              </p>
              {vistaPrevia && (
                <div className="foto-previa">
                  <img src={vistaPrevia} alt="Vista previa de la foto nueva" width="120" height="150" />
                  <button type="button" className="btn-glow" disabled={subiendo} onClick={subirFoto}>
                    {subiendo ? 'Enviando...' : 'Enviar foto'} <i className="fas fa-upload" aria-hidden="true" />
                  </button>
                </div>
              )}

              <form className="floating-form" onSubmit={guardar} autoComplete="off" noValidate>
                <Campo etiqueta="Nombres (como van en el carnet)" error={errores.nombres}>
                  {(p) => <input {...p} name="nombres" maxLength={100} value={datos.nombres} onChange={cambiar} />}
                </Campo>
                <Campo etiqueta="Apellidos (como van en el carnet)" error={errores.apellidos}>
                  {(p) => <input {...p} name="apellidos" maxLength={100} value={datos.apellidos} onChange={cambiar} />}
                </Campo>
                <p className="texto-ayuda">Si los dejas vacíos, el carnet reparte tu nombre completo y puede equivocarse con apellidos compuestos.</p>

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
                <Campo
                  etiqueta="Número de Documento"
                  error={errores.documento}
                  ayuda={`Sin puntos ni espacios.${formato ? ` Debe tener ${formato}.` : ''}`}
                  requerido
                >
                  {(p) => <input {...p} name="documento" inputMode="numeric" maxLength={15} value={datos.documento} onChange={cambiar} />}
                </Campo>
                <Campo etiqueta="Tipo de Sangre" requerido>
                  {(p) => (
                    <select {...p} name="tipoSangre" value={datos.tipoSangre} onChange={cambiar}>
                      <option value="">-- Selecciona Tipo de Sangre --</option>
                      {catalogos.tiposSangre.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}
                </Campo>
                {esAprendiz ? (
                  <Campo etiqueta="Ficha de formación" ayuda="El programa y la fecha de finalización se toman de la ficha." requerido>
                    {(p) => (
                      <select {...p} name="fichaId" value={datos.fichaId} onChange={cambiar}>
                        <option value="">-- Selecciona tu ficha --</option>
                        {catalogos.fichas.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.numero} - {f.programa}
                          </option>
                        ))}
                      </select>
                    )}
                  </Campo>
                ) : (
                  <Campo etiqueta="Especialidad / Área" error={errores.programa}>
                    {(p) => <input {...p} name="programa" maxLength={100} value={datos.programa} onChange={cambiar} />}
                  </Campo>
                )}

                <button type="submit" className="btn-glow boton-bloque" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar Cambios'} <i className="fas fa-sync" aria-hidden="true" />
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
