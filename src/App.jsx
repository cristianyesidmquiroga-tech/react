import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import RutaProtegida from './components/layout/RutaProtegida'
import FondoParticulas from './components/ui/FondoParticulas'
import AmbienteDetallePage from './pages/AmbienteDetallePage'
import AmbientesPage from './pages/AmbientesPage'
import AsistenciaPage from './pages/AsistenciaPage'
import CambioContrasenaPage from './pages/CambioContrasenaPage'
import ComunicadosPage from './pages/ComunicadosPage'
import EscanerPage from './pages/EscanerPage'
import FichasPage from './pages/FichasPage'
import HistorialClasesPage from './pages/HistorialClasesPage'
import HistorialPage from './pages/HistorialPage'
import LoginPage from './pages/LoginPage'
import NoEncontradaPage from './pages/NoEncontradaPage'
import PanelPage from './pages/PanelPage'
import PasesPage from './pages/PasesPage'
import PerfilPage from './pages/PerfilPage'
import ReporteCargoPage from './pages/ReporteCargoPage'
import RevisionFotosPage from './pages/RevisionFotosPage'
import UsuariosPage from './pages/UsuariosPage'

export default function App() {
  return (
    <BrowserRouter>
      <FondoParticulas />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RutaProtegida />}>
          <Route path="/cambiar-contrasena" element={<CambioContrasenaPage />} />
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to="/perfil" replace />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/historial" element={<HistorialPage />} />
            <Route element={<RutaProtegida permiso="operarPorteria" />}>
              <Route path="/porteria/panel" element={<PanelPage />} />
              <Route path="/porteria/escaner" element={<EscanerPage />} />
              <Route path="/porteria/pases" element={<PasesPage />} />
              <Route path="/porteria/reportes/:cargo" element={<ReporteCargoPage />} />
            </Route>
            <Route element={<RutaProtegida permiso="admin" />}>
              <Route path="/admin/usuarios" element={<UsuariosPage />} />
              <Route path="/admin/fotos" element={<RevisionFotosPage />} />
              <Route path="/admin/fichas" element={<FichasPage />} />
              <Route path="/admin/clases" element={<HistorialClasesPage />} />
            </Route>
            <Route element={<RutaProtegida permiso="gestionarAsistencia" />}>
              <Route path="/asistencia" element={<AsistenciaPage />} />
              <Route path="/comunicados" element={<ComunicadosPage />} />
            </Route>
            <Route element={<RutaProtegida permiso="verAmbientes" />}>
              <Route path="/ambientes" element={<AmbientesPage />} />
              <Route path="/ambientes/:ficha" element={<AmbienteDetallePage />} />
            </Route>
            <Route path="*" element={<NoEncontradaPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
