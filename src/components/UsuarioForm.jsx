import { useState } from 'react'
import Campo from './ui/Campo'

const VACIO = {
  nombre: '',
  correo: '',
  contrasena: '',
  rolId: '',
  cargo: '',
  tipoDocumento: 'CC',
  documento: '',
  ficha: '',
  programa: '',
  horario: '',
  autorizadoPor: '',
  motivo: '',
}

function desdeUsuario(u) {
  if (!u) return VACIO
  return {
    ...VACIO,
    nombre: u.nombre,
    correo: u.correo,
    rolId: String(u.rolId),
    cargo: u.cargo || '',
    tipoDocumento: u.tipoDocumento || 'CC',
    documento: u.documento || '',
    ficha: u.ficha || '',
    programa: u.programa || '',
    horario: u.horario || '',
  }
}

function validar(d, esNuevo) {
  const e = {}
  if (!d.nombre.trim()) e.nombre = 'El nombre es obligatorio'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo.trim())) e.correo = 'Escribe un correo válido'
  if (!d.rolId) e.rolId = 'Selecciona un rol'
  if (esNuevo && !d.contrasena) e.contrasena = 'La contraseña temporal es obligatoria'
  if (d.contrasena && (d.contrasena.length < 8 || !/[a-zA-Z]/.test(d.contrasena) || !/\d/.test(d.contrasena))) {
    e.contrasena = 'Mínimo 8 caracteres con letras y números'
  }
  return e
}

export default function UsuarioForm({ id, usuario, catalogos, errorServidor, onGuardar }) {
  const [datos, setDatos] = useState(() => desdeUsuario(usuario))
  const [errores, setErrores] = useState({})
  const esNuevo = !usuario
  const erroresVisibles = { ...errores, ...errorServidor }

  const cambiar = (e) => setDatos((d) => ({ ...d, [e.target.name]: e.target.value }))

  const enviar = (e) => {
    e.preventDefault()
    const encontrados = validar(datos, esNuevo)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return
    const limpio = Object.fromEntries(
      Object.entries(datos).map(([k, v]) => [k, typeof v === 'string' && v.trim() === '' ? null : v]),
    )
    onGuardar({ ...limpio, rolId: Number(datos.rolId) })
  }

  return (
    <form id={id} className="form-grid" onSubmit={enviar} noValidate>
      <Campo variante="grupo" etiqueta="Nombre Completo" error={erroresVisibles.nombre} requerido>
        {(p) => <input {...p} name="nombre" maxLength={100} value={datos.nombre} onChange={cambiar} />}
      </Campo>
      <Campo variante="grupo" etiqueta="Correo Electrónico" error={erroresVisibles.correo} requerido>
        {(p) => <input {...p} name="correo" type="email" maxLength={100} value={datos.correo} onChange={cambiar} />}
      </Campo>
      <Campo variante="grupo" etiqueta="Rol de Sistema" error={erroresVisibles.rolId} requerido>
        {(p) => (
          <select {...p} name="rolId" value={datos.rolId} onChange={cambiar}>
            <option value="">Selecciona</option>
            {catalogos.roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        )}
      </Campo>
      <Campo variante="grupo" etiqueta="Cargo / Dependencia" error={erroresVisibles.cargo}>
        {(p) => (
          <select {...p} name="cargo" value={datos.cargo} onChange={cambiar}>
            <option value="">Sin cargo</option>
            {catalogos.cargos.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </Campo>
      <Campo variante="grupo" etiqueta="Tipo de documento">
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
      <Campo variante="grupo" etiqueta="Documento" error={erroresVisibles.documento}>
        {(p) => <input {...p} name="documento" maxLength={20} value={datos.documento} onChange={cambiar} />}
      </Campo>
      <Campo variante="grupo" etiqueta="Ficha" ayuda="Si la ficha ya existe, el programa se toma de ella">
        {(p) => <input {...p} name="ficha" maxLength={20} value={datos.ficha} onChange={cambiar} />}
      </Campo>
      <Campo variante="grupo" etiqueta="Programa o área">
        {(p) => <input {...p} name="programa" maxLength={100} value={datos.programa} onChange={cambiar} />}
      </Campo>
      <Campo variante="grupo" etiqueta="Jornada">
        {(p) => <input {...p} name="horario" maxLength={20} value={datos.horario} onChange={cambiar} />}
      </Campo>
      <Campo
      variante="grupo"
      ancho="completo"
      etiqueta={esNuevo ? 'Contraseña temporal' : 'Nueva contraseña'}
      error={erroresVisibles.contrasena}
      ayuda={esNuevo ? 'La persona deberá cambiarla en su primer ingreso' : 'Déjala vacía para no cambiarla'}
      requerido={esNuevo}
      >
      {(p) => <input {...p} name="contrasena" type="password" autoComplete="new-password" maxLength={72} value={datos.contrasena} onChange={cambiar} />}
      </Campo>
      <Campo variante="grupo" etiqueta="Autorizado por" ayuda="Queda en el historial de cambios">
        {(p) => <input {...p} name="autorizadoPor" maxLength={100} value={datos.autorizadoPor} onChange={cambiar} />}
      </Campo>
      <Campo variante="grupo" etiqueta="Motivo">
        {(p) => <input {...p} name="motivo" maxLength={500} value={datos.motivo} onChange={cambiar} />}
      </Campo>
    </form>
  )
}
