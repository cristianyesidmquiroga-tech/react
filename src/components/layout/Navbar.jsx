import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTema } from '../../context/ThemeContext'
import logoSena from '../../assets/img/logoSena.png'
import FotoUsuario from '../ui/FotoUsuario'

export function BotonTema({ className = 'theme-switch' }) {
  const { tema, alternar } = useTema()
  return (
    <button type="button" className={`${className} theme-icon-btn`} onClick={alternar} aria-label="Cambiar Tema" title="Cambiar Tema">
      <i className={`fas ${tema === 'dark' ? 'fa-sun' : 'fa-moon'}`} aria-hidden="true" />
    </button>
  )
}

export default function Navbar({ titulo, menuAbierto, onAbrirMenu }) {
  const { usuario } = useAuth()

  return (
    <header className="top-header">
      <div className="header-container">
        <button
          type="button"
          id="menu-toggle"
          className="menu-toggle"
          onClick={onAbrirMenu}
          aria-expanded={menuAbierto}
          aria-controls="sidebar-main"
          aria-label="Abrir menú"
        >
          <i className="fas fa-bars" aria-hidden="true" />
        </button>
        <div className="logo-header-group">
          <img src={logoSena} alt="SENA Logo" className="header-logo" />
          <h1 className="page-title highlight-rainbow text-3d">{titulo}</h1>
        </div>
        <div className="header-acciones">
          <BotonTema />
          <Link to="/perfil" className="user-pill user-pill--enlace">
            <FotoUsuario
              usuarioId={usuario && usuario.fotoEstado !== 'sin_foto' ? usuario.id : null}
              cargo={usuario?.cargo}
              alt="Tu foto de perfil"
              className="nav-user-photo"
              width="38"
              height="38"
            />
            <span>{usuario?.nombre}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
