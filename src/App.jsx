import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import RutaProtegida from './components/layout/RutaProtegida'
import CambioContrasenaPage from './pages/CambioContrasenaPage'
import LoginPage from './pages/LoginPage'
import NoEncontradaPage from './pages/NoEncontradaPage'
import PerfilPage from './pages/PerfilPage'
import RevisionFotosPage from './pages/RevisionFotosPage'
import UsuariosPage from './pages/UsuariosPage'
import './pages/admin.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RutaProtegida />}>
          <Route path="/cambiar-contrasena" element={<CambioContrasenaPage />} />
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to="/perfil" replace />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route element={<RutaProtegida permiso="admin" />}>
              <Route path="/admin/usuarios" element={<UsuariosPage />} />
              <Route path="/admin/fotos" element={<RevisionFotosPage />} />
            </Route>
            <Route path="*" element={<NoEncontradaPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
