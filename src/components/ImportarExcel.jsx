import { useState } from 'react'
import { adminService } from '../services/api'
import Modal from './ui/Modal'

export default function ImportarExcel({ abierto, onCerrar, onImportado }) {
  const [archivo, setArchivo] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const cerrar = () => {
    setArchivo(null)
    setResultado(null)
    setError(null)
    onCerrar()
  }

  const enviar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      setResultado(await adminService.importarUsuarios(archivo))
      onImportado()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const detalles = resultado?.detalles

  return (
    <Modal abierto={abierto} onCerrar={cerrar} titulo="Importar desde Excel">
      <p className="texto-ayuda">
        Archivo .xlsx con las columnas Nombre y Correo (obligatorias); Documento, Cargo, Rol, Ficha, Programa y Horario (opcionales).
      </p>
      <form onSubmit={enviar}>
        <input type="file" accept=".xlsx" required onChange={(e) => setArchivo(e.target.files[0])} aria-label="Archivo Excel" />
        {error && (
          <p className="error-alert" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="glass-btn btn-primary" disabled={!archivo || enviando}>
          <i className="fas fa-upload" aria-hidden="true" /> {enviando ? 'Importando...' : 'Subir e importar'}
        </button>
      </form>
      {resultado && (
        <div role="status">
          <p>{resultado.mensaje}</p>
          <p>
            Creados: {detalles.creados} - Omitidos: {detalles.omitidos}
          </p>
          {detalles.errores.length > 0 && (
            <ul>
              {detalles.errores.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  )
}
