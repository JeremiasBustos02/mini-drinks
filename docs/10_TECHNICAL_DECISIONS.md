# 10 — Decisiones técnicas

## Estado

Arquitectura técnica base definida para el MVP.

---

# Stack seleccionado

## Aplicación web

- Next.js
- TypeScript

Se utilizará Next.js como aplicación full-stack para:

- frontend;
- rendering;
- rutas;
- lógica server-side;
- endpoints;
- checkout;
- integración con pagos;
- área administrativa.

No se utilizará un backend Spring Boot separado en el MVP.

## UI

- Tailwind CSS
- shadcn/ui

shadcn/ui se utilizará principalmente para componentes funcionales.

La identidad visual comercial deberá ser personalizada y no depender de un estilo SaaS genérico.

## Base de datos

- PostgreSQL
- Supabase como proveedor inicial

## ORM

- Drizzle ORM

## Autenticación

- checkout invitado en MVP;
- Supabase Auth previsto para V1.

## Formularios y validación

- React Hook Form
- Zod

## Estado del carrito

- Zustand
- persistencia local mediante localStorage

El precio enviado desde cliente nunca será considerado fuente de verdad.

Antes de crear/cobrar un pedido, el servidor deberá recalcular:

- precios;
- promociones;
- disponibilidad;
- combos;
- stock.

## Pagos

- Mercado Pago

La confirmación del pago debe verificarse del lado servidor.

No debe confiarse únicamente en una redirección de éxito del navegador.

## Archivos e imágenes

- Supabase Storage

## Hosting

- Vercel

## Analytics

- PostHog como candidato inicial.

La implementación podrá confirmarse más adelante.

## WhatsApp

Integración simple mediante enlaces/contacto en MVP.

Una integración avanzada queda fuera de alcance inicial.

---

# Principios de arquitectura

## 1. Monolito modular

La aplicación comenzará como un monolito modular en Next.js.

No se dividirá prematuramente en:

- frontend separado;
- backend separado;
- microservicios.

## 2. PostgreSQL como fuente de verdad

Toda información crítica deberá persistirse en PostgreSQL:

- productos;
- stock;
- combos;
- pedidos;
- pagos;
- configuración comercial.

## 3. Lógica crítica en servidor

Debe ejecutarse server-side:

- cálculo definitivo de precios;
- validación de stock;
- aplicación de promociones;
- creación de pedidos;
- integración de pagos;
- actualización de estados;
- descuento de stock.

## 4. Stock por componentes

Los combos y packs no mantienen stock físico independiente.

El stock se deriva de sus componentes.

## 5. Escalabilidad sin sobrearquitectura

Si el negocio crece, la arquitectura podrá evolucionar hacia:

- backend dedicado;
- servicios separados;
- integraciones logísticas más complejas.

El MVP no debe anticipar problemas de escala inexistentes.

---

# Administración

El panel administrativo vive dentro de la misma aplicación.

Rutas conceptuales:

- `/admin`
- `/admin/products`
- `/admin/categories`
- `/admin/combos`
- `/admin/orders`
- `/admin/stock`

Objetivo:

- simple;
- rápido;
- usable por dos personas;
- sin intentar construir un ERP.

---

# Seguridad mínima

- validación server-side;
- secretos solo en entorno servidor;
- no confiar en precios enviados por cliente;
- proteger rutas administrativas;
- validar webhooks;
- evitar doble procesamiento de pagos;
- registrar cambios críticos de estado cuando sea necesario.

---

# Decisiones aplazadas

- proveedor final de analytics;
- estrategia definitiva de emails;
- integración avanzada con logística;
- observabilidad;
- caché avanzada;
- CDN adicional;
- backend dedicado.
