# 13 — Auditoría de alcance MVP

## Objetivo

Reducir el riesgo de desarrollar demasiadas funciones antes de validar si el producto vende.

La visión general es coherente, pero el alcance funcional original mezcla tres etapas distintas:

- ecommerce necesario para vender;
- fidelización digital;
- expansión comercial B2B/eventos.

La recomendación es separar explícitamente **MVP**, **V1** y **FUTURO**.

---

# 1. Alcance recomendado

## MVP — necesario para salir a vender

### Ecommerce

- Home.
- Catálogo.
- Categorías.
- Productos individuales.
- Combos predeterminados.
- Constructor de combo.
- Packs predeterminados.
- Ficha de producto.
- Carrito.
- Checkout como invitado.
- Pago online.
- Delivery propio en zonas habilitadas.
- Retiro.
- Estado básico de stock.
- Confirmación de pedido.
- WhatsApp como canal secundario.

### Catálogo y stock

- Miniaturas.
- Vasos.
- Mixers.
- Extras.
- Combos.
- Componentes de combo.
- Stock descontado por componente.

### Administración

Los dos administradores deben poder:

- crear/editar/ocultar productos;
- actualizar precios;
- actualizar stock;
- ver pedidos;
- cambiar estado de pedidos;
- gestionar combos;
- gestionar categorías.

### Comercial

- CTA de mayoristas.
- Formulario o WhatsApp mayorista.
- CTA de eventos.
- Formulario o WhatsApp para eventos.

No hace falta un portal mayorista ni cotización automática.

### Marca

El MVP físico sí debe contemplar:

- packaging base;
- sticker;
- tarjeta/sorpresa.

El sistema digital de puntos no bloquea el lanzamiento.

---

## V1 — después de validar las primeras ventas

### Cuenta de cliente

- registro;
- login;
- recuperación;
- direcciones;
- historial de pedidos.

### Fidelización

- códigos únicos;
- canje de código;
- saldo de puntos;
- historial de movimientos;
- recompensas;
- cupones.

### Packs avanzados

- x4/x6/x12 completamente configurables;
- edición/duplicado de configuraciones;
- recomendaciones dentro del constructor.

### Operación

- mejores reglas de envío;
- automatizaciones de estados;
- analítica comercial;
- recuperación de carrito si vale la pena.

---

## V1.1 / V2 — gamificación

### Ruleta

- consumo de puntos o tickets;
- probabilidades;
- premios;
- límites;
- historial;
- antifraude.

La ruleta es atractiva como marketing, pero no debería retrasar el ecommerce.

### Coleccionabilidad digital

- colección de stickers;
- temporadas;
- progreso;
- recompensas por colección.

---

## FUTURO

- portal mayorista con login;
- precios B2B dinámicos;
- checkout mayorista;
- facturación automática;
- integración logística avanzada;
- múltiples depósitos/puntos de stock;
- personalización automática de eventos;
- cotizador de eventos;
- red de revendedores;
- expansión nacional automatizada;
- sistema avanzado de referidos;
- app móvil nativa.

---

# 2. Decisiones que quedan cerradas

## Posicionamiento

B2C es la experiencia principal.

B2B debe existir, pero con jerarquía secundaria.

## Compra

El cliente puede comprar:

- productos individuales;
- combos predeterminados;
- combos personalizados;
- packs.

## Constructor

La combinación será libre y estará limitada únicamente por stock y por reglas técnicas necesarias.

## Checkout

Debe existir checkout completo en la web.

WhatsApp es complementario.

## Cuenta

Comprar no requerirá cuenta.

La cuenta será útil posteriormente para historial y fidelización.

## Administración

Dos personas operarán el sistema.

La administración debe priorizar simplicidad sobre funciones empresariales complejas.

---

# 3. Inconsistencias detectadas

## A. Sorpresa obligatoria

`03_BRAND_CONCEPT.md` establece que todos los packs/combos incluyen sticker + tarjeta + QR/código.

`02_PRODUCT_CATALOG.md` dice “cuando corresponda”.

### Resolución

La regla recomendada es:

> Todo combo o pack de marca incluye sticker y tarjeta/sorpresa. Los productos individuales no están obligados a incluirla.

---

## B. Catálogo completo vs catálogo exacto pendiente

`02_PRODUCT_CATALOG.md` indica que el lanzamiento puede incluir todas las miniaturas disponibles del distribuidor.

`12_OPEN_QUESTIONS.md` deja pendiente el listado exacto de lanzamiento.

### Resolución

No es necesario limitar artificialmente las miniaturas si la carga administrativa es baja.

Se define:

> El sistema debe soportar todo el catálogo del distribuidor, pero solo se publicarán productos que realmente hayan sido comprados y estén disponibles.

Esto evita prometer stock inexistente.

---

## C. Cuenta en MVP

`05_WEB_REQUIREMENTS.md` incluye cuenta, pedidos, puntos y recompensas como requerimientos generales.

`11_ROADMAP.md` también incluye cuenta dentro del MVP.

Sin embargo, la compra como invitado ya resuelve el flujo comercial principal.

### Resolución

Mover cuenta completa a V1.

En MVP, guardar los datos necesarios del pedido sin exigir registro.

---

## D. Fidelización mezclada con ecommerce

El sistema original trata puntos, códigos y ruleta como parte de los requerimientos base.

Eso agrega:

- usuarios;
- ledger de puntos;
- códigos únicos;
- seguridad contra doble canje;
- reglas de premios;
- lógica de ruleta;
- administración;
- estados y vencimientos.

### Resolución

Separar:

- packaging/sorpresa física → MVP;
- puntos/códigos → V1;
- ruleta → V1.1/V2.

---

## E. Mayoristas/eventos

La visión los incluye desde el comienzo, pero el roadmap los movía a una fase muy posterior.

### Resolución

MVP:

- landing/sección;
- CTA;
- formulario o WhatsApp;
- gestión manual.

Futuro:

- herramientas comerciales automatizadas.

---

# 4. Riesgos de alcance

## Riesgo 1 — Constructor de combos

Es una función central y sí vale la pena mantenerla en MVP.

Pero debe empezar simple:

- miniatura;
- mixer;
- vaso;
- extras;
- precio;
- stock.

No agregar recomendaciones inteligentes, reglas complejas ni personalización visual avanzada en la primera versión.

## Riesgo 2 — Stock compuesto

Es obligatorio resolverlo correctamente.

Ejemplo:

Si un combo contiene:

- 1 Fernet;
- 1 Coca;
- 1 vaso;

una venta debe descontar los tres componentes.

No conviene manejar el stock del combo como si fuera un producto completamente independiente.

## Riesgo 3 — “Todo el catálogo”

Publicar todo lo que figura en una lista del proveedor sin tenerlo físicamente puede generar problemas de disponibilidad.

La web debe distinguir:

- catálogo posible;
- stock propio;
- producto publicado.

## Riesgo 4 — Logística externa

El alcance inicial debe priorizar Mar del Plata y Balcarce.

Antes de automatizar envíos a otras zonas hay que definir operativa, costos y requisitos aplicables.

## Riesgo 5 — Admin sobredimensionado

No construir un ERP.

Para dos administradores alcanza inicialmente con:

- productos;
- stock;
- pedidos;
- precios;
- combos;
- categorías.

---

# 5. Definición final del MVP

El MVP queda definido como:

> Ecommerce mobile-first de mini bebidas que permite comprar productos individuales, elegir combos preparados por la marca o construir un combo personalizado, pagar online y seleccionar entrega o retiro, con una administración simple de catálogo, stock compuesto y pedidos.

## Incluye

- marca/home;
- catálogo;
- individuales;
- combos;
- constructor;
- packs simples;
- carrito;
- checkout invitado;
- pagos;
- delivery/retiro;
- stock;
- pedidos;
- panel admin básico;
- WhatsApp;
- contacto mayorista;
- contacto eventos;
- packaging físico + sticker + sorpresa.

## No bloquea el lanzamiento

- cuenta de usuario;
- puntos;
- QR con canje;
- ruleta;
- colección digital;
- portal mayorista;
- facturación automática;
- logística avanzada.

---

# 6. Criterio de éxito del MVP

El primer objetivo no es validar la tecnología.

Es validar:

1. si la gente compra;
2. qué productos compra;
3. qué combos convierten mejor;
4. ticket promedio;
5. recompra;
6. costo real de preparación y entrega;
7. si el packaging genera interés;
8. si existe demanda mayorista.

La tecnología debe facilitar esa prueba, no retrasarla.
