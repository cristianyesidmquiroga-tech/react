# Portería SENA - Frontend

Interfaz en React 19 del sistema de control de acceso del centro. Consume la API del repositorio
`spring` y sigue la estructura de la guía de React (componentes, contextos, hooks, páginas y servicios).

## Qué se necesita

- Node.js 20 o superior
- La API de Spring Boot corriendo en `http://localhost:31026`

## Cómo ponerlo a correr

```
npm install
copy .env.example .env
npm run dev
```

Abre http://localhost:5173. En desarrollo Vite reenvía `/api` a Spring Boot, así el navegador
no hace peticiones a otro origen y no hay problemas de CORS.

## Estructura

```
src/
├── assets/
├── components/
│   ├── ui/          Modal, Toast, Skeleton, Campo, Insignia, ErrorBoundary
│   ├── layout/      MainLayout, Navbar, Sidebar, RutaProtegida
│   ├── CarnetDigital.jsx
│   └── UsuarioForm.jsx
├── context/         AuthContext, NotificationContext, ThemeContext
├── hooks/           useFetch, useDebounce, useFotoProtegida
├── pages/           Login, cambio de contraseña, perfil, usuarios, revisión de fotos
├── services/        api.js (cliente HTTP hacia Spring Boot)
├── App.jsx          rutas
├── main.jsx         punto de montaje
└── index.css        tokens de diseño y estilos base
```

## Cómo funciona la sesión

- El login devuelve un token JWT que se guarda y se envía como `Authorization: Bearer`.
- Mientras la persona está activa el token se renueva antes de vencer. Si la API responde 401
  (sesión vencida o iniciada en otro equipo) se vuelve al login.
- Con contraseña temporal la única pantalla disponible es la de cambiarla.
- El menú y las rutas se muestran según los permisos que envía la API; la API vuelve a validar cada petición.

## Accesibilidad y diseño

- Móvil primero: el menú lateral es un cajón con botón hamburguesa y las tablas pasan a tarjetas.
- Tema claro y oscuro con tokens de color revisados para contraste AA.
- Modales con foco atrapado, cierre con Escape y el resto de la página inerte mientras están abiertos.
- Todos los campos tienen límite de caracteres y etiqueta asociada.

## Scripts

```
npm run dev      servidor de desarrollo
npm run build    compilación de producción en dist/
npm run lint     revisión con oxlint
```
