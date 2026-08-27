# 17 — Plan técnico del MVP

## Objetivo

Traducir los documentos de negocio a un orden de implementación seguro y manejable.

---

# Etapa 1 — Bootstrap

- crear proyecto Next.js + TypeScript;
- Tailwind;
- shadcn/ui;
- variables de entorno;
- conexión a Supabase/PostgreSQL;
- Drizzle;
- estructura de módulos;
- lint/format;
- README técnico.

## Resultado

Aplicación ejecutando localmente y conectada a DB.

---

# Etapa 2 — Catálogo base

Implementar:

- Category;
- Product;
- listado;
- detalle;
- stock;
- publicación;
- imágenes.

Primero con datos de prueba.

## Resultado

Se pueden navegar y comprar conceptualmente productos individuales.

---

# Etapa 3 — Admin básico

Implementar acceso admin y CRUD mínimo de:

- categorías;
- productos;
- precios;
- stock.

## Resultado

Los dos operadores pueden mantener catálogo sin tocar DB manualmente.

---

# Etapa 4 — Combos

Implementar:

- Combo;
- ComboItem;
- disponibilidad derivada;
- precio promocional;
- ficha/listado.

## Resultado

Los combos reutilizan stock real de productos.

---

# Etapa 5 — Constructor

Implementar:

- miniatura;
- mixer;
- vaso;
- extras;
- resumen;
- precio en vivo;
- detección de combo equivalente;
- mejor precio.

## Resultado

La función diferencial principal ya existe.

---

# Etapa 6 — Carrito

Implementar:

- Zustand;
- localStorage;
- productos;
- combos;
- personalizados;
- edición/remoción;
- cantidades.

Regla crítica:

El carrito del navegador es UX, no fuente de verdad de precios.

---

# Etapa 7 — Checkout

Implementar:

- datos del cliente;
- modalidad de entrega;
- retiro;
- validaciones;
- resumen final.

El servidor debe recalcular:

- precios;
- stock;
- descuentos;
- total.

---

# Etapa 8 — Pedidos

Implementar:

- Order;
- OrderItem;
- snapshots;
- estados;
- número público.

## Resultado

Un checkout válido produce un pedido consistente.

---

# Etapa 9 — Mercado Pago

Implementar:

- creación de pago/preferencia;
- referencia con pedido;
- URLs de retorno;
- webhook;
- validación;
- idempotencia;
- actualización de estado.

## Resultado

Pago confirmado server-side.

---

# Etapa 10 — Stock transaccional

Implementar descuento de componentes cuando corresponda.

Debe evitar:

- stock negativo;
- doble descuento por webhook repetido;
- pedidos inconsistentes.

Definir exactamente en qué evento se reserva/descuenta stock antes de producción.

---

# Etapa 11 — Operación

Admin:

- pedidos;
- estados;
- stock;
- detalle;
- filtros básicos.

Frontend:

- confirmación;
- WhatsApp;
- instrucciones de retiro/delivery.

---

# Etapa 12 — Mayoristas y eventos

Implementar páginas simples:

- propuesta;
- formulario;
- CTA WhatsApp.

Gestión manual.

---

# Etapa 13 — Analytics

Registrar eventos relevantes:

- product_view;
- add_to_cart;
- combo_builder_started;
- combo_builder_completed;
- checkout_started;
- purchase_completed.

El objetivo es aprender, no llenar dashboards.

---

# Criterios de finalización MVP

El MVP está listo cuando se puede:

1. publicar un producto;
2. controlar stock;
3. crear un combo;
4. armar uno personalizado;
5. agregar al carrito;
6. hacer checkout;
7. pagar;
8. registrar pedido;
9. descontar stock correctamente;
10. gestionar el pedido desde admin.

---

# OpenCode — estrategia de modelos

## Sol High

Usar para:

- arquitectura;
- modelo de datos;
- Mercado Pago;
- stock;
- transacciones;
- seguridad;
- bugs difíciles;
- revisión final.

## Terra Medium

Usar para:

- implementación habitual;
- CRUD;
- componentes;
- formularios;
- páginas;
- tests;
- refactors acotados.

## Luna Low/Medium

Usar para:

- cambios pequeños;
- documentación;
- renombres;
- estilos simples;
- tareas repetitivas.

## Regla

No pedir a un agente que “haga toda la aplicación”.

Trabajar por etapas pequeñas, cada una con:

1. contexto;
2. objetivo;
3. restricciones;
4. criterios de aceptación;
5. revisión antes de continuar.
