import { LogOut, Menu, Moon, Sun, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTema } from '../../context/ThemeContext'

export default function Navbar({ menuAbierto, onAlternarMenu }) {
  const { usuario, logout } = useAuth()
  const { tema, alternar } = useTema()

  return (
    <header className="barra">
      <button
        type="button"
        className="boton-icono barra__hamburguesa"
        onClick={onAlternarMenu}
        aria-expanded={menuAbierto}
        aria-controls="menu-lateral"
        aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
      >
        {menuAbierto ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
      </button>
      <div className="barra__usuario">
        <strong>{usuario?.nombre}</strong>
        <span>{usuario?.cargo || usuario?.rol}</span>
      </div>
      <button
        type="button"
        className="boton-icono"
        onClick={alternar}
        aria-label={tema === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'}
      >
        {tema === 'dark' ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
      </button>
      <button type="button" className="boton boton--fantasma" onClick={logout}>
        <LogOut size={18} aria-hidden="true" />
        <span>Salir</span>
      </button>
    </header>
  )
}
