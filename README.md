# 🌱 AgroVision

Plataforma web full-stack de monitoreo agrícola en tiempo real que simula un sistema IoT inteligente para supervisión de cultivos.

AgroVision permite visualizar datos de sensores, generar alertas automáticas cuando se superan umbrales críticos y gestionarlas desde un dashboard seguro con autenticación basada en roles.

---

## 🚀 Características Principales

- 📡 Monitoreo de sensores en tiempo real (humedad y temperatura)
- 📈 Visualización dinámica con Chart.js
- 🚨 Generación automática de alertas por umbrales críticos
- ✅ Resolución manual de alertas
- 📜 Historial de alertas resueltas
- 🌾 Filtro por cultivo
- 🔐 Autenticación con JWT en cookies HTTP-only
- 👤 Control de acceso por roles (admin / usuario)
- 📦 Arquitectura modular y escalable

---

## 🏗 Arquitectura del Sistema

### Flujo General

1. El sistema simula sensores cada 5 segundos.
2. Los datos se almacenan en MongoDB.
3. Se evalúan reglas de umbral:
   - Humedad < 65%
   - Temperatura > 30°C
4. Si se detecta una condición crítica → se genera una alerta.
5. Los datos y alertas se envían al frontend mediante WebSockets.
6. El dashboard se actualiza en tiempo real sin necesidad de recargar la página.

---

## ⚙️ Stack Tecnológico

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.io
- JWT (cookies HTTP-only)
- Arquitectura REST

### Frontend
- Next.js (App Router)
- React
- Chart.js
- TailwindCSS
- Socket.io-client

---

## 🔐 Seguridad

- JWT almacenado en cookies HTTP-only
- Middleware de protección de rutas
- Control de acceso basado en roles
- Variables de entorno gestionadas mediante `.env`
- Separación clara entre controladores, modelos y middleware

---

## 📊 Funcionalidades del Dashboard

- Visualización en tiempo real de métricas
- Tarjetas con valores actuales
- Gráficas dinámicas de sensores
- Panel de alertas activas con indicador de severidad
- Resolución manual de alertas
- Historial de alertas resueltas
- Panel exclusivo para administrador

---

## 📂 Estructura del Proyecto

Agrovision/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── context/
│   └── services/
│
└── docker-compose.yml

---

## ⚙️ Instalación y Configuración

### 1️⃣ Clonar repositorio

git clone https://github.com/Franciscooxz/Agrovision.git
cd Agrovision

---

### 2️⃣ Configurar Backend

cd backend  
npm install  

Crear archivo `.env`:

PORT=5000  
MONGO_URI=tu_mongo_uri  
JWT_SECRET=tu_jwt_secret  

Ejecutar servidor:

npm run dev  

---

### 3️⃣ Configurar Frontend

cd frontend  
npm install  
npm run dev  

---

## 🧠 Decisiones de Arquitectura

- Uso de WebSockets en lugar de polling para mayor eficiencia.
- JWT en cookies HTTP-only para reducir riesgo de XSS.
- Arquitectura modular para facilitar mantenimiento y escalabilidad.
- Sistema de alertas basado en eventos.
- Estructura preparada para futura integración con sensores físicos reales.

---

## 🚀 Posibles Extensiones

- Integración con sensores reales (MQTT / hardware IoT)
- Automatización de riego
- Análisis predictivo
- Arquitectura multi-tenant
- Escalado horizontal con Redis para WebSockets

---

## 👨‍💻 Autor

Francisco
