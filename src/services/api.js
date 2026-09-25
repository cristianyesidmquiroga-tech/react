const BASE_URL = import.meta.env.VITE_API_URL || '/api'
const CLAVE_TOKEN = 'jwt_token'

// Siluetas por cargo o tipo de pase; no son datos personales y no piden sesión
export const avatarUrl = (cargo) => `${BASE_URL}/avatares/${encodeURIComponent(cargo || 'generico')}`

export const sesionGuardada = {
  leer: () => localStorage.getItem(CLAVE_TOKEN),
  guardar: (token) => localStorage.setItem(CLAVE_TOKEN, token),
  borrar: () => localStorage.removeItem(CLAVE_TOKEN),
}

// AuthContext se suscribe para cerrar la sesión o mandar al cambio de contraseña
const oyentes = new Set()
export function escucharSesion(funcion) {
  oyentes.add(funcion)
  return () => oyentes.delete(funcion)
}
function avisar(evento) {
  oyentes.forEach((f) => f(evento))
}

export class ErrorApi extends Error {
  constructor(status, datos) {
    super(datos?.mensaje || `Error HTTP ${status}`)
    this.status = status
    this.campos = datos?.campos || []
    this.codigo = datos?.codigo
    this.bloqueadoSegundos = datos?.bloqueadoSegundos
  }
}

async function peticion(ruta, { metodo = 'GET', cuerpo, formulario, respuesta = 'json', signal } = {}) {
  const token = sesionGuardada.leer()
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (cuerpo !== undefined) headers['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(`${BASE_URL}${ruta}`, {
      method: metodo,
      headers,
      body: formulario ?? (cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined),
      signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ErrorApi(0, { mensaje: 'No hay conexión con el servidor' })
  }

  if (!res.ok) {
    const datos = await res.json().catch(() => ({}))
    if (res.status === 401 && token) avisar({ tipo: 'sesion-vencida' })
    if (res.status === 403 && datos.codigo === 'CAMBIO_CONTRASENA') avisar({ tipo: 'cambio-contrasena' })
    if (res.status === 429 && !datos.mensaje) datos.mensaje = 'Demasiadas solicitudes, espera un momento'
    throw new ErrorApi(res.status, datos)
  }
  if (res.status === 204) return null
  return respuesta === 'blob' ? res.blob() : res.json()
}

function consulta(parametros) {
  const busqueda = new URLSearchParams()
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (Array.isArray(valor)) valor.forEach((v) => busqueda.append(clave, v))
    else if (valor !== undefined && valor !== null && valor !== '') busqueda.set(clave, valor)
  })
  const texto = busqueda.toString()
  return texto ? `?${texto}` : ''
}

export const authService = {
  login: (identificador, password) => peticion('/auth/login', { metodo: 'POST', cuerpo: { identificador, password } }),
  logout: () => peticion('/auth/logout', { metodo: 'POST' }),
  renovar: () => peticion('/auth/renovar', { metodo: 'POST' }),
  yo: () => peticion('/auth/yo'),
  cambiarContrasena: (datos) => peticion('/auth/cambiar-contrasena', { metodo: 'POST', cuerpo: datos }),
}

export const perfilService = {
  obtener: () => peticion('/perfil'),
  actualizar: (datos) => peticion('/perfil', { metodo: 'PUT', cuerpo: datos }),
  subirFoto: (archivo) => {
    const formulario = new FormData()
    formulario.append('foto', archivo)
    return peticion('/perfil/foto', { metodo: 'POST', formulario })
  },
  carnet: () => peticion('/perfil/carnet'),
  foto: (usuarioId, signal) => peticion(`/usuarios/${usuarioId}/foto`, { respuesta: 'blob', signal }),
}

export const catalogoService = {
  obtener: () => peticion('/catalogos'),
}

export const adminService = {
  listarUsuarios: ({ texto, rolId, cargo, page = 0, size = 20 }, signal) =>
    peticion(`/admin/usuarios${consulta({ texto, rolId, cargo, page, size })}`, { signal }),
  crearUsuario: (datos) => peticion('/admin/usuarios', { metodo: 'POST', cuerpo: datos }),
  editarUsuario: (id, datos) => peticion(`/admin/usuarios/${id}`, { metodo: 'PUT', cuerpo: datos }),
  eliminarUsuario: (id, autorizacion) =>
    peticion(`/admin/usuarios/${id}`, { metodo: 'DELETE', cuerpo: autorizacion }),
  desbloquear: (id) => peticion(`/admin/usuarios/${id}/desbloquear`, { metodo: 'POST' }),
  fotos: ({ estado, pagina }, signal) => peticion(`/admin/fotos${consulta({ estado, pagina })}`, { signal }),
  revisarFoto: (usuarioId, aprobada, motivo) =>
    peticion(`/admin/fotos/${usuarioId}/revision`, { metodo: 'POST', cuerpo: { aprobada, motivo } }),
}

export const equipoService = {
  listar: (signal) => peticion('/equipos', { signal }),
  registrar: (datos) => peticion('/equipos', { metodo: 'POST', cuerpo: datos }),
  eliminar: (id) => peticion(`/equipos/${id}`, { metodo: 'DELETE' }),
}

export const porteriaService = {
  verificar: (codigo) => peticion(`/porteria/verificar${consulta({ codigo })}`),
  registrarMovimiento: (datos) => peticion('/porteria/movimientos', { metodo: 'POST', cuerpo: datos }),
  registrarIncidente: (datos) => peticion('/porteria/incidentes', { metodo: 'POST', cuerpo: datos }),
}

export const paseService = {
  listar: (signal) => peticion('/porteria/pases', { signal }),
  codigo: (texto) => peticion(`/porteria/pases/codigo${consulta({ texto })}`, { respuesta: 'blob' }),
  registrarVisitante: (datos) => peticion('/porteria/pases/visitantes', { metodo: 'POST', cuerpo: datos }),
  registrarVehiculo: (datos) => peticion('/porteria/pases/vehiculos', { metodo: 'POST', cuerpo: datos }),
  registrarObjeto: (datos) => peticion('/porteria/pases/objetos', { metodo: 'POST', cuerpo: datos }),
  actualizarObjeto: (id, datos) => peticion(`/porteria/pases/objetos/${id}`, { metodo: 'PUT', cuerpo: datos }),
  desactivarObjeto: (id) => peticion(`/porteria/pases/objetos/${id}/desactivar`, { metodo: 'POST' }),
}

export const panelService = {
  obtener: (signal) => peticion('/porteria/panel', { signal }),
  accesos: (filtros, signal) => peticion(`/porteria/panel/accesos${consulta(filtros)}`, { signal }),
  exportar: (filtros) => peticion(`/porteria/panel/exportar${consulta(filtros)}`, { respuesta: 'blob' }),
  reporte: (cargo, signal) => peticion(`/porteria/panel/reportes/${encodeURIComponent(cargo)}`, { signal }),
}

export const historialService = {
  consultar: (filtros, signal) => peticion(`/historial${consulta(filtros)}`, { signal }),
}

export const fichaService = {
  listar: (signal) => peticion('/admin/fichas', { signal }),
  crear: (datos) => peticion('/admin/fichas', { metodo: 'POST', cuerpo: datos }),
  editar: (id, datos) => peticion(`/admin/fichas/${id}`, { metodo: 'PUT', cuerpo: datos }),
  archivar: (id) => peticion(`/admin/fichas/${id}/archivar`, { metodo: 'PATCH' }),
}

export const asistenciaService = {
  buscar: (ficha, signal) => peticion(`/asistencia${consulta({ ficha })}`, { signal }),
  guardar: (ficha, presentes) => peticion('/asistencia', { metodo: 'POST', cuerpo: { ficha, presentes } }),
  historialClases: (ficha, signal) => peticion(`/admin/clases${consulta({ ficha })}`, { signal }),
}

export const ambienteService = {
  listar: (signal) => peticion('/ambientes', { signal }),
  detalle: (ficha, signal) => peticion(`/ambientes/${encodeURIComponent(ficha)}`, { signal }),
}

export const comunicadoService = {
  obtener: (signal) => peticion('/comunicados', { signal }),
  enviar: (datos) => peticion('/comunicados', { metodo: 'POST', cuerpo: datos }),
}

export const mensajeService = {
  mios: (signal) => peticion('/mensajes', { signal }),
  enviar: (texto) => peticion('/mensajes', { metodo: 'POST', cuerpo: { texto } }),
  avisos: (signal) => peticion('/avisos', { signal }),
  bandeja: (signal) => peticion('/bandeja', { signal }),
  hilo: (usuarioId, signal) => peticion(`/bandeja/${usuarioId}`, { signal }),
  responder: (usuarioId, texto) => peticion(`/bandeja/${usuarioId}`, { metodo: 'POST', cuerpo: { texto } }),
}

export const ayudaService = {
  obtener: (signal) => peticion('/ayuda', { signal }),
  contactar: (datos) => peticion('/ayuda/contacto', { metodo: 'POST', cuerpo: datos }),
  tutorial: (signal) => peticion('/tutorial', { signal }),
  completarTutorial: () => peticion('/tutorial/completar', { metodo: 'POST' }),
}
