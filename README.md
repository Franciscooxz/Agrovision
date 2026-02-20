🌱 AgroVision – Plataforma IoT de Monitoreo Agrícola en Tiempo Real
📌 Descripción General

AgroVision es una plataforma full-stack de monitoreo agrícola en tiempo real que simula un sistema IoT inteligente.

El sistema procesa datos de sensores, genera alertas automáticas basadas en umbrales críticos y proporciona un dashboard seguro multiusuario para su gestión.

Este proyecto demuestra:

Arquitectura basada en eventos

Comunicación en tiempo real con WebSockets

Autenticación segura con JWT en cookies HTTP-only

Control de acceso basado en roles

Diseño modular backend

Dashboard interactivo con visualización dinámica de datos

🏗 Arquitectura del Sistema
Flujo general

Se simulan sensores cada 5 segundos.

Los datos se almacenan en MongoDB.

Se evalúan reglas de umbral:

Humedad < 65%

Temperatura > 30°C

Si se detecta condición crítica → se genera alerta.

Los datos y alertas se emiten por WebSockets.

El frontend actualiza la interfaz en tiempo real sin recargar.

⚙️ Stack Tecnológico
Backend

Node.js

Express.js

MongoDB + Mongoose

JWT (cookies HTTP-only)

Socket.io

Arquitectura REST

Frontend

Next.js (App Router)

React

Chart.js

TailwindCSS

Socket.io-client

🔐 Seguridad

JWT almacenado en cookies HTTP-only

Middleware de protección de rutas

Control de acceso por roles (admin / usuario)

Variables de entorno gestionadas con .env

Separación clara entre capas (controladores, modelos, middleware)

🚨 Sistema de Alertas

Modelo basado en eventos:

Persistencia en base de datos

Emisión en tiempo real

Resolución manual

Historial de alertas

Filtro por cultivo

Aislamiento por usuario

📊 Funcionalidades del Dashboard

Visualización en tiempo real

Gráficas dinámicas

Panel de alertas activas

Historial de alertas resueltas

Filtro por cultivo

Panel exclusivo para administrador

🧠 Decisiones de Arquitectura

WebSockets en lugar de polling para eficiencia y escalabilidad.

JWT en cookies en vez de localStorage para reducir riesgo XSS.

Separación de responsabilidades en backend.

Sistema preparado para escalar hacia microservicios.

Modelo adaptable a sensores reales (MQTT / hardware físico).

🚀 Potencial de Escalabilidad

La arquitectura permite:

Integración con sensores reales

Automatización de riego

Análisis predictivo

Multi-tenancy real

Escalado horizontal con Redis para WebSockets

👨‍💻 Autor

Francisco
