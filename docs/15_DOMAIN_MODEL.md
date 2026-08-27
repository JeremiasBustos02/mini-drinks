# 15 — Modelo de dominio

## Objetivo

Definir las piezas principales del negocio antes de diseñar tablas o escribir código.

---

# Entidades principales

## Product

Representa cualquier elemento vendible o utilizable como componente.

Ejemplos:

- miniatura;
- mixer;
- vaso;
- extra;
- accesorio;
- insumo.

Responsabilidades:

- identidad;
- nombre;
- tipo;
- precio;
- stock;
- publicación;
- imágenes;
- categoría.

## Category

Agrupa productos para navegación.

Ejemplos:

- miniaturas;
- whisky;
- gin;
- vodka;
- mixers;
- vasos;
- extras.

## Combo

Representa una agrupación comercial predeterminada.

No tiene stock físico independiente.

Contiene:

- nombre;
- descripción;
- precio promocional opcional;
- imagen;
- estado;
- componentes.

## ComboItem

Relaciona un Combo con un Product.

Contiene:

- producto;
- cantidad.

## CustomCombo

No necesita existir como catálogo permanente en MVP.

Es una configuración creada por el usuario durante la compra.

Contiene conceptualmente:

- miniatura seleccionada;
- mixer;
- vaso;
- extras;
- cantidades;
- precio calculado.

Al confirmar el pedido, su configuración debe quedar congelada dentro del pedido.

## Pack

Agrupa múltiples productos o combos.

Puede ser:

- predeterminado;
- personalizado.

En MVP se priorizan packs simples.

## Order

Representa una compra.

Contiene:

- identificador;
- fecha;
- datos del comprador;
- estado;
- modalidad de entrega;
- totales;
- pago;
- observaciones.

## OrderItem

Representa una línea del pedido.

Puede ser:

- producto individual;
- combo predeterminado;
- combo personalizado;
- pack.

Debe conservar una instantánea suficiente para reconstruir lo que el cliente compró aunque después cambien nombres o precios.

## Payment

Representa el estado del pago.

Debe permitir distinguir:

- pendiente;
- aprobado;
- rechazado;
- cancelado;
- reembolsado si aplica.

## DeliveryMethod

Representa la modalidad:

- delivery propio;
- retiro;
- envío externo futuro.

## AdminUser

Usuario con acceso a administración.

En MVP solo habrá dos operadores.

---

# Relaciones conceptuales

`Category 1 ── N Product`

`Combo 1 ── N ComboItem`

`ComboItem N ── 1 Product`

`Order 1 ── N OrderItem`

`Order 1 ── 1..N Payment` según integración y reintentos.

---

# Stock

La única fuente de stock físico son los productos/componentes.

Ejemplo:

- Fernet: 10;
- Coca: 8;
- vaso: 20.

Combo Fernet requiere:

- Fernet x1;
- Coca x1;
- vaso x1.

Disponibilidad teórica:

`min(10, 8, 20) = 8`

---

# Precios

## Product

Tiene precio individual.

## Combo

Puede tener precio promocional propio.

## CustomCombo

Se calcula como suma de componentes.

Si coincide exactamente con un Combo activo, obtiene el mejor precio aplicable.

## OrderItem

Guarda precio final aplicado al momento de compra.

---

# Snapshot de pedido

Nunca debe reconstruirse un pedido histórico usando únicamente los datos actuales del catálogo.

Cada OrderItem debe preservar al menos:

- nombre mostrado;
- tipo de línea;
- cantidad;
- precio unitario;
- subtotal;
- configuración/composición comprada.

Esto protege el historial si luego:

- cambia un nombre;
- cambia un precio;
- se modifica un combo;
- se oculta un producto.

---

# Estados sugeridos de pedido

Iniciales:

- pending_payment;
- paid;
- preparing;
- ready_for_pickup;
- out_for_delivery;
- completed;
- cancelled.

La lista final podrá ajustarse durante implementación.

---

# Fuera del modelo MVP

Se agregará más adelante:

- CustomerAccount;
- RewardCode;
- PointsLedger;
- Reward;
- Spin/RouletteEntry;
- WholesaleAccount;
- EventQuote.
