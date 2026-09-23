import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import ErrorBoundary from '../ui/ErrorBoundary'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import './layout.css'

export default function MainLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    if (!menuAbierto) return undefined
    const escape = (e) => e.key === 'Escape' && setMenuAbierto(false)
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [menuAbierto])

  return (
    <div className="marco">
      <a className="saltar" href="#contenido">
        Saltar al contenido
      </a>
      <Sidebar abierto={menuAbierto} onNavegar={() => setMenuAbierto(false)} />
      {menuAbierto && <div className="menu-velo" onClick={() => setMenuAbierto(false)} aria-hidden="true" />}
      <div className="marco__principal">
        <Navbar menuAbierto={menuAbierto} onAlternarMenu={() => setMenuAbierto((v) => !v)} />
        <main id="contenido" className="contenido" tabIndex={-1}>
          <ErrorBoundary key={pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
        <footer className="pie">SENA · Sistema de control de acceso</footer>
      </div>
    </div>
  )
}
