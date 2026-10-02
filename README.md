# Access Control Frontend (React)

Single-page app for the access control system, built with React 19 and Vite. It consumes the REST API in [`spring`](https://github.com/cristianyesidmquiroga-tech/spring).

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

## Highlights

- Protected routes and navigation that follow the permissions sent by the API (the API validates every request again).
- JWT session with automatic renewal while the user is active, and a clean return to login when the session expires.
- Digital ID card, QR/barcode scanner view for the gate, passes and reports, class attendance, messaging, bulk Excel import and a guided tour.
- Self-hosted anti-bot challenge (SHA-256 in the browser, no third-party service).
- Mobile first: the sidebar becomes a drawer and tables turn into cards. Light and dark themes with AA-checked contrast.
- Accessible modals (focus trap, Escape to close, inert page behind) and labeled fields with length limits.
- Structure: components (`ui`, `layout`), context, hooks, pages and services, with design tokens in `index.css`.

## Quick start

```bash
git clone https://github.com/cristianyesidmquiroga-tech/react.git
cd react
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev
```

Open http://localhost:5173. In development Vite proxies `/api` to the Spring Boot API on `localhost:31026`, so there are no CORS issues.

The full documentation, in Spanish, follows.

---

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
│   ├── CarnetDigital.jsx, Conversacion.jsx, RecorridoGuiado.jsx
│   └── ImportarExcel.jsx, MisEquipos.jsx, UsuarioForm.jsx
├── context/         AuthContext, NotificationContext, ThemeContext
├── hooks/           useFetch, useDebounce, useCaptcha, useFotoProtegida
├── pages/           una por pantalla (ver tabla de rutas)
├── services/        api.js (cliente HTTP hacia Spring Boot)
├── App.jsx          rutas
├── main.jsx         punto de montaje
└── index.css        tokens de diseño y estilos base
```

## Rutas

| Ruta | Quién | Pantalla |
|---|---|---|
| /login, /registro, /recuperar, /politica-privacidad | público | acceso y política de datos |
| /verificar | sesión con correo sin verificar | código de 6 dígitos |
| /cambiar-contrasena | contraseña temporal | cambio obligatorio |
| /perfil, /historial, /mensajes, /ayuda, /tutorial | con sesión | cuenta y soporte |
| /porteria/* | portería | panel, escáner, pases y reportes |
| /asistencia, /comunicados | instructores y admin | formación |
| /ambientes | coordinación, subdirección y admin | ambientes |
| /bandeja | asesores | mensajes de los usuarios |
| /admin/usuarios, /fotos, /fichas, /clases | admin | gestión |
| /admin/historial, /admin/respaldos | admin | auditoría y respaldos mensuales |

## Cómo funciona la sesión

- El login devuelve un token JWT que se guarda y se envía como `Authorization: Bearer`.
- Mientras la persona está activa el token se renueva antes de vencer. Si la API responde 401
  (sesión vencida o iniciada en otro equipo) se vuelve al login.
- Con contraseña temporal la única pantalla disponible es la de cambiarla.
- Con el correo sin verificar la API responde 403 y la app manda a /verificar. El registro inicia sesión solo y lleva allí.
- El registro y la recuperación piden una prueba anti-bot (SHA-256 en el navegador, sin servicios de terceros) cuando la API la tiene activa.
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
