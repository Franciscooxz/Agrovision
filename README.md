# 🌱 AgroVision

> **Plataforma inteligente de monitoreo agrícola IoT en tiempo real**

AgroVision es una aplicación web full-stack que simula un sistema de sensores IoT para monitoreo de cultivos. Permite visualizar temperatura y humedad en tiempo real, analizar el estado de salud de los cultivos mediante inteligencia artificial, recibir alertas automáticas ante condiciones críticas y gestionar todo desde un dashboard moderno con autenticación segura y control de acceso por roles.

---

## ✨ Características

| Categoría | Funcionalidad |
|-----------|--------------|
| 📡 **Sensores** | Lecturas automáticas de temperatura y humedad cada 30 segundos vía simulador |
| ⚡ **Tiempo Real** | WebSockets con Socket.io — el dashboard se actualiza sin recargar la página |
| 🤖 **IA** | Análisis automático de salud del cultivo al crearlo (FastAPI + Python) |
| 🚨 **Alertas** | Generación y resolución de alertas automáticas ante condiciones críticas |
| 🔐 **Auth** | JWT en cookies HTTP-only con Access Token (15 min) + Refresh Token (30 días) |
| 👥 **Roles** | Admin · Agricultor · Técnico — cada uno con acceso diferenciado |
| 💎 **Planes** | FREE (máx. 3 cultivos) · PRO (ilimitado) |
| 🐳 **Docker** | Un solo comando levanta toda la infraestructura |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    NAVEGADOR                        │
│         Next.js 16 + React 19 + TypeScript          │
│              http://localhost:3000                  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / WebSocket
          ┌────────────▼────────────┐
          │   Backend (Express.js)  │
          │   http://localhost:5000 │
          └────┬────────────┬───────┘
               │            │
    ┌──────────▼──┐   ┌─────▼──────────┐
    │   MongoDB   │   │  AI Service    │
    │  (puerto    │   │  (FastAPI)     │
    │   27017)    │   │  puerto 8000   │
    └─────────────┘   └────────────────┘
```

### Flujo de datos de sensores

```
Simulador (cada 30s)
    ↓ genera lecturas de temp/humedad
Backend → guarda en MongoDB
    ↓ evalúa umbrales:
    │  • Temperatura > 35°C → alerta
    │  • Humedad < 45%      → alerta
    ↓
Socket.io → emite al frontend en tiempo real
    ↓
Dashboard se actualiza instantáneamente
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 16.1.6** — App Router, Server Components, SSR
- **React 19** — UI con hooks modernos
- **TypeScript** — tipado estático
- **Tailwind CSS 4** — estilos utilitarios
- **Socket.io-client** — WebSockets en tiempo real
- **CSS Variables** — tema oscuro estilo Instagram

### Backend
- **Node.js + Express.js 5** — API REST
- **MongoDB + Mongoose 9** — base de datos NoSQL
- **Socket.io** — comunicación en tiempo real
- **JWT** — autenticación con access + refresh tokens
- **bcryptjs** — hash de contraseñas
- **cookie-parser** — cookies HTTP-only seguras

### IA / Microservicio
- **Python 3.11 + FastAPI** — microservicio de análisis
- **uvicorn** — servidor ASGI

### DevOps
- **Docker + Docker Compose** — contenedorización completa
- **Multi-stage builds** — imagen de producción optimizada

---

## 🚀 Instalación

### Requisitos previos

| Herramienta | Versión mínima | Verificar |
|-------------|---------------|-----------|
| Docker Desktop | 24+ | `docker --version` |
| Docker Compose | 2.20+ | `docker compose version` |
| Git | cualquiera | `git --version` |

> **Node.js NO es necesario** — todo corre dentro de Docker.

---

### 1. Clonar el repositorio

```bash
git clone https://github.com/Franciscooxz/Agrovision.git
cd Agrovision
```

### 2. Levantar con un solo comando

```bash
docker compose up -d
```

Esto construye y arranca automáticamente los 4 servicios:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| 🌐 Frontend | http://localhost:3000 | Aplicación web |
| ⚙️ Backend API | http://localhost:5000 | REST API + WebSockets |
| 🤖 AI Service | http://localhost:8000 | Microservicio de IA |
| 🍃 MongoDB | localhost:27017 | Base de datos |

> La primera vez tarda ~2-3 minutos en construir las imágenes Docker.

### 3. Verificar que todo está corriendo

```bash
docker compose ps
```

Deberías ver los 4 contenedores en estado `Up` o `Up (healthy)`.

### 4. Ver logs en tiempo real

```bash
# Todos los servicios
docker compose logs -f

# Solo backend
docker compose logs -f backend

# Solo frontend
docker compose logs -f frontend
```

### Detener el proyecto

```bash
docker compose down
```

### Reinicio limpio (borra datos de MongoDB)

```bash
docker compose down -v
docker compose up -d
```

---

## 🔑 Primer acceso

### 1. Crear tu cuenta (primer usuario = Admin automático)

Ve a **http://localhost:3000/register**

> ⭐ El **primer usuario registrado** en el sistema se convierte automáticamente en **Administrador**. Los siguientes usuarios serán Agricultores por defecto.

### 2. Iniciar sesión

Ve a **http://localhost:3000/login** con tu email y contraseña.

---

## 📱 Guía de Uso por Sección

### 🏠 Dashboard — `/dashboard`

La pantalla principal. Muestra en tiempo real:

- **Temperatura actual** — última lectura del simulador
- **Humedad actual** — última lectura del simulador
- **Total de cultivos** registrados
- **Alertas activas** — condiciones críticas sin resolver
- **Análisis de IA** realizados
- **Total de lecturas** en la sesión

En la parte inferior hay dos paneles en vivo:
- **Feed de Sensores** — últimas 12 lecturas (se actualiza solo vía WebSocket)
- **Panel de Alertas** — alertas activas con botón de resolución

---

### 🌡️ Sensores — `/sensors`

Historial completo de todas las lecturas del simulador:

- Promedio de temperatura de las últimas 5 lecturas
- Promedio de humedad de las últimas 5 lecturas
- Lista completa con tipo, valor y timestamp de cada lectura
- Actualizaciones en tiempo real vía WebSocket

---

### 🌿 Cultivos — `/crops`

Gestión de tus parcelas y cultivos:

- **Crear cultivo** con nombre, tipo y ubicación
- Al crear, la **IA analiza automáticamente** el cultivo y asigna un estado de salud:
  - ✅ Saludable
  - ⚠️ Estrés hídrico
  - 🚨 Posible plaga
  - 🟣 Deficiencia de nutrientes
- Si detecta **Posible plaga**, crea una alerta crítica automáticamente
- **Plan FREE**: máximo 3 cultivos
- **Plan PRO**: cultivos ilimitados
- Eliminar cultivo (borra también su historial de análisis y alertas)

---

### 🔔 Alertas — `/alerts`

Centro de notificaciones del sistema:

- **Pestaña Activas** — alertas pendientes de resolver
- **Pestaña Resueltas** — historial de alertas ya gestionadas
- Indicador de severidad: **Alta** (roja), **Media** (amarilla), **Baja** (verde)
- Botón para resolver alertas individualmente
- Las nuevas alertas llegan en tiempo real sin recargar

**Condiciones que generan alerta automática:**
| Condición | Umbral | Severidad |
|-----------|--------|-----------|
| Temperatura alta | > 35°C | Alta |
| Humedad baja | < 45% | Alta |
| Posible plaga (IA) | Detección IA | Alta |

---

### 🛡️ Admin — `/admin` *(solo Administradores)*

Panel exclusivo para gestión del sistema:

- **Estadísticas globales**: usuarios totales, cultivos, alertas, sensores
- **Gestión de usuarios**: tabla completa con todos los usuarios registrados
  - Cambiar **rol**: Admin / Agricultor / Técnico (dropdown inline)
  - Cambiar **plan**: FREE / PRO (dropdown inline)
  - **Eliminar usuario** (excepto a ti mismo)

---

## 👥 Sistema de Roles

| Rol | Badge | Acceso |
|-----|-------|--------|
| **Admin** | 🟡 Amarillo | Todo + Panel Admin |
| **Farmer** (Agricultor) | 🟢 Verde | Dashboard, Sensores, Cultivos, Alertas |
| **Technician** (Técnico) | 🔵 Azul | Dashboard, Sensores, Alertas |

> El admin puede cambiar los roles y planes desde el Panel Admin.

---

## 🔐 Seguridad

- **Access Token**: JWT válido 15 minutos, almacenado en cookie `HttpOnly`
- **Refresh Token**: JWT válido 30 días, renueva el access token automáticamente
- **Sin `Secure` flag en desarrollo**: funciona sobre HTTP en localhost
- **SameSite=Lax**: compatible con peticiones cross-port en localhost
- **Contraseñas**: hasheadas con bcrypt (10 rounds)
- **Rutas protegidas**: el proxy de Next.js redirige al login si no hay sesión

---

## 📁 Estructura del Proyecto

```
agrovision/
├── docker-compose.yml              # Orquestación de servicios
│
├── agrovision-frontend/            # Next.js 16 (TypeScript)
│   ├── app/
│   │   ├── dashboard/page.tsx      # Dashboard principal
│   │   ├── sensors/page.tsx        # Página de sensores
│   │   ├── crops/page.tsx          # Gestión de cultivos
│   │   ├── alerts/page.tsx         # Centro de alertas
│   │   ├── admin/page.tsx          # Panel admin
│   │   ├── login/page.tsx          # Inicio de sesión
│   │   ├── register/page.tsx       # Registro
│   │   ├── globals.css             # Tema oscuro + animaciones
│   │   └── layout.tsx              # Layout raíz
│   ├── components/
│   │   ├── icons/index.tsx         # 18 iconos SVG personalizados
│   │   ├── Sidebar.tsx             # Barra lateral de navegación
│   │   └── AlertPanel.tsx          # Panel de alertas reutilizable
│   ├── context/
│   │   └── AuthContext.tsx         # Estado global de autenticación
│   ├── services/
│   │   └── socket.ts               # Cliente WebSocket singleton
│   ├── proxy.ts                    # Protección de rutas (Next.js 16)
│   └── Dockerfile                  # Build multi-stage Node 20
│
├── backend/api-gateway/            # Express.js (Node.js)
│   └── src/
│       ├── config/db.js            # Conexión MongoDB
│       ├── controllers/            # Lógica de negocio
│       │   ├── authController.js   # Login, register, refresh, logout
│       │   ├── cropController.js   # CRUD cultivos + IA
│       │   ├── alertController.js  # CRUD alertas
│       │   ├── sensorController.js # CRUD sensores
│       │   └── adminController.js  # Gestión de usuarios (admin)
│       ├── models/                 # Schemas Mongoose
│       │   ├── User.js             # Usuario con roles y plan
│       │   ├── Crop.js             # Cultivo con estado de salud
│       │   ├── Alert.js            # Alerta con severidad
│       │   ├── Sensor.js           # Lectura de sensor
│       │   └── Analysis.js         # Historial de análisis IA
│       ├── routes/                 # Endpoints REST
│       ├── middleware/
│       │   └── authMiddleware.js   # Verificación JWT + roles
│       ├── services/
│       │   ├── aiService.js        # Cliente del microservicio IA
│       │   └── emailService.js     # Notificaciones por email
│       ├── utils/
│       │   ├── simulator.js        # Simulador de sensores IoT
│       │   └── sendResponse.js     # Respuesta estandarizada
│       ├── app.js                  # Configuración Express
│       └── server.js               # Servidor HTTP + Socket.io
│
└── ai-service/                     # FastAPI (Python 3.11)
    ├── main.py                     # Endpoints de análisis IA
    ├── requirements.txt
    └── Dockerfile
```

---

## 🌐 API Endpoints

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Crear cuenta |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `POST` | `/api/auth/refresh` | Renovar access token |
| `POST` | `/api/auth/logout` | Cerrar sesión |
| `GET` | `/api/auth/me` | Obtener usuario actual |

### Cultivos *(requiere auth)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/crops` | Listar mis cultivos |
| `POST` | `/api/crops` | Crear cultivo + análisis IA |
| `GET` | `/api/crops/:id` | Obtener cultivo por ID |
| `DELETE` | `/api/crops/:id` | Eliminar cultivo |

### Sensores *(requiere auth)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/sensors` | Historial de lecturas |

### Alertas *(requiere auth)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/alerts` | Listar alertas |
| `PUT` | `/api/alerts/:id/resolve` | Resolver alerta |

### Admin *(requiere rol Admin)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/admin/users` | Listar todos los usuarios |
| `GET` | `/api/admin/stats` | Estadísticas globales |
| `PUT` | `/api/admin/users/:id/role` | Cambiar rol |
| `PUT` | `/api/admin/users/:id/plan` | Cambiar plan |
| `DELETE` | `/api/admin/users/:id` | Eliminar usuario |

---

## ⚙️ Variables de entorno

El proyecto funciona **sin configuración adicional** usando los valores por defecto. Para personalizar, crea un archivo `.env` en la raíz:

```env
# JWT (cambiar en producción)
JWT_SECRET=tu_jwt_secret_seguro
JWT_REFRESH_SECRET=tu_refresh_secret_seguro

# Email (opcional — para alertas por correo)
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_app_password_de_gmail
```

---

## 🔮 Posibles extensiones futuras

- [ ] Integración con sensores físicos reales (Arduino, Raspberry Pi, LoRa)
- [ ] App móvil (React Native con la misma API)
- [ ] Mapas interactivos con geolocalización de parcelas
- [ ] Pasarela de pago (Stripe) para el plan PRO
- [ ] Reportes PDF exportables
- [ ] Automatización de riego basada en alertas
- [ ] HTTPS + dominio propio para producción
- [ ] Análisis predictivo con histórico de datos

---

## 👨‍💻 Autor

**Francisco** — [GitHub](https://github.com/Franciscooxz)
