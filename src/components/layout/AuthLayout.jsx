import { BotonTema } from './Navbar'

// Pantallas sin sesión completa (login, cambio obligatorio): sin menú, con el botón de tema flotante
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
