const BASE_URL = import.meta.env.VITE_API_URL || '/api'
const CLAVE_TOKEN = 'jwt_token'

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
    if (valor !== undefined && valor !== null && valor !== '') busqueda.set(clave, valor)
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
  fotosPendientes: () => peticion('/admin/fotos/pendientes'),
  revisarFoto: (usuarioId, aprobada, motivo) =>
    peticion(`/admin/fotos/${usuarioId}/revision`, { metodo: 'POST', cuerpo: { aprobada, motivo } }),
}
