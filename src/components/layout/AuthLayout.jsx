import { BotonTema } from './Navbar'

// Login y cambio de contraseña: sin menú lateral
export default function AuthLayout({ children }) {
  return (
    <>
      <BotonTema className="floating-theme-switch" />
      <div className="main-wrapper">
        <main className="content-area animate-in">{children}</main>
        <footer className="pie-sistema">
          <p>&copy; 2026 SENA - Centro de formación. Gestión de Acceso.</p>
        </footer>
      </div>
    </>
  )
}
