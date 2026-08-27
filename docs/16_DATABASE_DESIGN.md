# 16 — Diseño inicial de base de datos

## Objetivo

Proponer un esquema relacional inicial coherente con el modelo de dominio.

No representa una migración definitiva.

---

# Tablas MVP

## categories

Campos sugeridos:

- id
- name
- slug
- description
- active
- sort_order
- created_at
- updated_at

## products

Campos sugeridos:

- id
- category_id
- name
- slug
- description
- product_type
- price
- stock
- active
- published
- image_url
- created_at
- updated_at

`product_type` puede distinguir:

- miniature
- mixer
- glass
- extra
- accessory
- supply

## combos

Campos sugeridos:

- id
- name
- slug
- description
- promotional_price
- active
- published
- image_url
- created_at
- updated_at

## combo_items

Campos sugeridos:

- id
- combo_id
- product_id
- quantity

Restricciones:

- quantity > 0
- evitar duplicados innecesarios de combo/producto

## orders

Campos sugeridos:

- id
- public_number
- status
- customer_name
- customer_last_name
- customer_phone
- customer_email
- customer_document
- delivery_type
- delivery_address
- city
- notes
- subtotal
- discount_total
- delivery_total
- total
- created_at
- updated_at

## order_items

Campos sugeridos:

- id
- order_id
- item_type
- reference_id nullable
- display_name
- quantity
- unit_price
- subtotal
- configuration_json
- created_at

`item_type`:

- product
- combo
- custom_combo
- pack

`configuration_json` guarda una instantánea de composición cuando corresponda.

## payments

Campos sugeridos:

- id
- order_id
- provider
- provider_payment_id
- status
- amount
- raw_reference
- created_at
- updated_at

## admin_users

Según el mecanismo de auth elegido.

Puede mantenerse fuera de estas tablas si se utiliza un proveedor externo de autenticación.

---

# Stock

## MVP simple

`products.stock` mantiene cantidad disponible.

Al confirmar la operación correspondiente, el servidor debe descontar stock dentro de una transacción.

## Recomendación

Evitar en MVP un sistema complejo de movimientos si todavía no existe necesidad operativa.

Si luego hace falta trazabilidad, agregar:

`stock_movements`

con:

- id
- product_id
- movement_type
- quantity
- reason
- order_id nullable
- created_at

---

# Integridad

Reglas importantes:

- precios monetarios con tipo decimal/numeric apropiado;
- stock nunca negativo;
- slugs únicos;
- IDs internos no expuestos como único identificador comercial;
- payment provider id único cuando corresponda;
- procesamiento idempotente de webhooks.

---

# Índices sugeridos

- products.slug
- products.category_id
- products.active/published
- combos.slug
- orders.public_number
- orders.status
- orders.created_at
- payments.provider_payment_id

---

# Datos históricos

No borrar físicamente productos/combo utilizados en pedidos históricos.

Preferir:

- active = false;
- published = false.

Así los pedidos anteriores siguen siendo consistentes.

---

# Futuras tablas V1

- customer_profiles
- addresses
- reward_codes
- points_ledger
- rewards
- coupons

# Futuras tablas V2

- roulette_spins
- reward_inventory
- collections
- collectibles
- user_collectibles
