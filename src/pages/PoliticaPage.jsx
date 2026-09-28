import { Link } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'

export default function PoliticaPage() {
  return (
    <AuthLayout>
      <article className="glass-card politica">
        <h1>Política de Tratamiento de Datos Personales</h1>
        <p className="texto-ayuda">Sistema de Acceso y Carnet Digital del SENA. Conforme a la Ley 1581 de 2012 y al Decreto 1074 de 2015.</p>

        <h2>1. Responsable</h2>
        <p>
          Servicio Nacional de Aprendizaje (SENA), Centro de Gestión Agroempresarial del Oriente, Vélez, Santander. Para ejercer tus derechos escribe
          al correo institucional del Centro con el asunto «Habeas Data — Sistema de Acceso».
        </p>

        <h2>2. Datos que se recolectan</h2>
        <ul>
          <li>Identificación: nombre, documento y correo.</li>
          <li>Cargo, programa de formación, ficha y jornada.</li>
          <li>Fotografía del rostro, solo para que portería verifique quién ingresa.</li>
          <li>Tipo de sangre (dato sensible y opcional), solo para atender emergencias.</li>
          <li>Registros de entrada y salida, y equipos declarados.</li>
        </ul>

        <h2>3. Finalidad</h2>
        <p>
          Controlar el ingreso y la salida de personas, vehículos y equipos, cuidar la seguridad de la sede y generar los reportes de asistencia y
          auditoría. No se usan con fines comerciales ni se comparten con terceros, salvo orden de autoridad competente.
        </p>

        <h2>4. Datos sensibles</h2>
        <p>
          La fotografía y el tipo de sangre son datos sensibles (art. 5, Ley 1581). No estás obligado a autorizar su tratamiento (art. 6). El tipo de
          sangre puede omitirse; sin fotografía el ingreso se gestiona de forma manual en portería.
        </p>

        <h2>5. Tus derechos</h2>
        <ul>
          <li>Conocer, actualizar y rectificar tus datos.</li>
          <li>Pedir prueba de tu autorización y saber el uso que se les ha dado.</li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
          <li>Revocar la autorización y pedir la supresión, salvo deber legal de conservarlos.</li>
        </ul>

        <h2>6. Conservación</h2>
        <p>
          Los registros de acceso y asistencia se conservan durante el mes en curso y se archivan cada mes en un respaldo bajo custodia del Centro.
          Los datos del perfil se conservan mientras haya vínculo activo con la institución.
        </p>

        <h2>7. Seguridad</h2>
        <p>
          Conexión HTTPS, contraseñas guardadas con hash, permisos por rol y registro de auditoría de las acciones administrativas sobre datos
          personales.
        </p>

        <p className="texto-ayuda">Última actualización: septiembre de 2026.</p>
        <Link to="/login" className="back-link-premium">
          <i className="fas fa-arrow-left" aria-hidden="true" /> Volver
        </Link>
      </article>
    </AuthLayout>
  )
}
