# 14 — Reglas de producto

## Objetivo

Definir cómo se comportan los productos, combos, packs, precios y stock desde el punto de vista del negocio.

Este documento describe reglas funcionales. No define todavía tablas, entidades ni implementación técnica.

---

# 1. Tipos de producto

La tienda puede vender componentes de forma individual.

Tipos iniciales:

- miniatura;
- mixer;
- vaso;
- extra;
- accesorio;
- insumo.

Todos pueden tener:

- nombre;
- descripción;
- precio individual;
- stock;
- estado de publicación;
- imágenes;
- categoría.

Ejemplos:

- Fernet Branca 50 ml;
- Coca-Cola;
- vaso mini;
- sorbete;
- golosina.

---

# 2. Venta individual

Cualquier producto publicado puede venderse por separado.

Ejemplos:

- una miniatura sola;
- una Coca sola;
- un vaso solo;
- un mixer solo;
- un accesorio solo.

La compra individual no requiere formar parte de un combo.

---

# 3. Vaso

Inicialmente existe un único modelo de vaso para todos los combos.

El vaso:

- es un producto independiente;
- tiene precio propio;
- tiene stock propio;
- puede venderse por separado;
- puede formar parte de cualquier cantidad de combos.

En una etapa posterior podrá reemplazarse o complementarse por un vaso mini exclusivo de la marca.

---

# 4. Combo predeterminado

Un combo predeterminado no se considera stock físico independiente.

Es una agrupación comercial de productos existentes.

Ejemplo:

## Combo Fernet

Componentes:

- 1 Fernet Branca 50 ml;
- 1 Coca-Cola;
- 1 vaso mini.

Puede además incluir:

- packaging;
- sticker;
- tarjeta/sorpresa.

El combo puede tener:

- nombre propio;
- descripción;
- imágenes;
- precio promocional;
- estado activo/inactivo;
- componentes y cantidades.

---

# 5. Stock de combos

El stock de un combo se obtiene a partir del stock de sus componentes.

Ejemplo:

- Fernet: 18;
- Coca-Cola: 30;
- vaso: 50.

Si el combo requiere 1 unidad de cada componente:

`stock disponible del combo = min(18, 30, 50) = 18`

No debe mantenerse manualmente un segundo stock independiente del combo.

---

# 6. Descuento de stock

Al vender un combo deben descontarse sus componentes.

Ejemplo:

Venta:

- 1 Combo Fernet.

Resultado:

- Fernet: -1;
- Coca-Cola: -1;
- vaso: -1.

Lo mismo aplica a combos personalizados y packs.

---

# 7. Armá tu combo

El cliente podrá crear una combinación libre.

Flujo base:

1. elegir miniatura;
2. elegir mixer;
3. elegir vaso;
4. elegir extras;
5. elegir cantidad;
6. agregar al carrito.

No se impondrán reglas gastronómicas.

Las únicas restricciones iniciales son:

- stock;
- productos publicados;
- cantidades válidas;
- reglas comerciales explícitas.

---

# 8. Precio de un combo personalizado

La regla base es:

`precio personalizado = suma de precios individuales de los componentes`

Ejemplo:

- Fernet: $3.900;
- Coca: $1.500;
- vaso: $1.200.

Total:

`$6.600`

---

# 9. Coincidencia con un combo predeterminado

Si el cliente arma exactamente la misma combinación que un combo predeterminado activo, el sistema debe detectar la coincidencia.

Regla:

`precio final = menor entre precio por componentes y precio promocional del combo`

Ejemplo:

Precio por componentes:

`$6.600`

Combo predeterminado:

`$5.990`

Resultado:

`$5.990`

La interfaz puede comunicar:

> Esta combinación coincide con nuestro combo y te aplicamos automáticamente el mejor precio.

No se debe penalizar al cliente por haber llegado a la misma combinación mediante el constructor.

---

# 10. Qué significa “coincidir exactamente”

Para que una selección coincida con un combo predeterminado deben coincidir:

- productos;
- cantidades;
- variantes relevantes.

No debe considerarse coincidencia si:

- falta un componente;
- sobra un componente;
- cambia una cantidad;
- cambia una variante que afecta el producto.

Los extras opcionales agregados después pueden sumarse al precio promocional si la base del combo coincide.

Ejemplo:

Combo Fernet:

- Fernet;
- Coca;
- vaso.

Cliente arma:

- Fernet;
- Coca;
- vaso;
- golosina extra.

Regla sugerida:

`precio Combo Fernet + precio individual de golosina`

---

# 11. Precio de combos predeterminados

Cada combo predeterminado podrá tener un precio promocional propio.

Ese precio no tiene que calcularse automáticamente como un porcentaje fijo.

Esto permite controlar:

- margen;
- campañas;
- percepción de valor;
- promociones.

Para el MVP se recomienda precio cerrado por combo.

---

# 12. Packs

Los packs agrupan varias unidades o combinaciones.

Formatos previstos:

- Duo;
- x4;
- x6;
- x12.

Pueden existir dos variantes:

## Pack predeterminado

La marca define el contenido.

## Pack personalizado

El cliente elige el contenido.

---

# 13. Precio de packs

Regla inicial:

`precio base del pack = suma de las unidades/combinaciones seleccionadas`

Luego puede aplicarse un beneficio comercial.

Tipos posibles:

- porcentaje de descuento;
- monto fijo;
- precio cerrado;
- promoción puntual.

Para MVP, la regla debe mantenerse simple y configurable.

No es obligatorio que todos los packs tengan descuento.

---

# 14. Mejor precio disponible

Principio general:

> Ante dos caminos de compra que producen exactamente el mismo contenido, el cliente debe recibir el mejor precio vigente aplicable.

Esto evita inconsistencias entre:

- catálogo;
- constructor;
- combos;
- packs.

---

# 15. Productos sin stock

Un producto sin stock:

- no puede agregarse al carrito;
- no puede seleccionarse en el constructor;
- reduce o elimina la disponibilidad de combos que lo usan.

Puede mostrarse como “Sin stock” o quedar oculto según configuración.

---

# 16. Productos ocultos

Un producto puede existir internamente sin estar publicado.

Ejemplos:

- producto discontinuado;
- producto futuro;
- stock reservado;
- producto temporalmente no vendido online.

Los combos que dependan de un producto oculto deberán revisarse antes de mantenerse activos.

---

# 17. Cambios de precio

Cada producto individual puede cambiar de precio.

Los combos predeterminados pueden conservar su precio promocional propio hasta que un administrador lo modifique.

Esto permite que:

- los componentes cambien;
- el combo mantenga temporalmente una promoción;
- el negocio controle margen manualmente.

La administración debería advertir cuando un precio promocional quede demasiado cerca o por debajo del costo definido, si más adelante se implementa control de costos.

---

# 18. Packaging y sorpresa

Todo combo o pack propio de la marca incluye como estándar:

- packaging;
- sticker;
- tarjeta/sorpresa.

Los productos comprados individualmente no están obligados a incluir estos elementos.

El costo del packaging debe contemplarse al definir el precio comercial del combo aunque no se muestre como componente seleccionable.

---

# 19. Extras

Los extras pueden ser:

- seleccionables;
- incluidos;
- promocionales.

Ejemplos:

- golosina;
- sorbete;
- segundo vaso;
- tarjeta;
- packaging especial.

Un extra seleccionable agrega su precio salvo promoción explícita.

Decisión inicial del constructor: se muestran productos publicados y disponibles de tipo `extra` y
`accessory`. Los productos `supply` quedan excluidos por defecto hasta definir cuáles son insumos
operativos implícitos y cuáles pueden ser elegidos por el consumidor.

---

# 20. Carrito

El carrito debe distinguir claramente:

- producto individual;
- combo predeterminado;
- combo personalizado;
- pack.

Para combos y packs, debe poder mostrarse su contenido.

El usuario no debería tener que comprender la lógica interna de stock.

---

# 21. Modificación de combos en carrito

Regla recomendada para MVP:

- combo predeterminado: se agregan extras permitidos, pero no se reestructura desde el carrito;
- combo personalizado: se puede volver al constructor para editarlo;
- pack personalizado: se puede volver al configurador para editarlo.

Esto evita una lógica de edición compleja dentro del propio carrito.

---

# 22. Sustituciones

No realizar sustituciones automáticas.

Si un componente se queda sin stock:

- bloquear la combinación;
- pedir al usuario que elija otro producto.

Nunca reemplazar automáticamente una marca o producto por otro.

---

# 23. Disponibilidad de catálogo

La tienda puede soportar todo el catálogo potencial del distribuidor.

Sin embargo:

> solo se publicarán como comprables los productos que la operación haya decidido ofrecer y tenga disponibles.

La lista del proveedor no equivale al stock real de la tienda.

---

# 24. Regla de prioridad comercial

La tienda debe favorecer:

1. combos predeterminados;
2. constructor;
3. packs;
4. productos individuales.

Los individuales siguen siendo totalmente comprables, pero la experiencia de marca debe impulsar combinaciones y packs porque concentran mejor el diferencial comercial.

---

# 25. Decisiones pendientes

Todavía falta definir:

- descuento concreto de cada combo;
- reglas comerciales de packs;
- precios finales;
- costo que se asigna al packaging;
- si mixer/vaso son obligatorios en el constructor;
- qué extras entran al lanzamiento;
- cantidades máximas por pedido;
- tratamiento de reservas de stock durante checkout;
- reglas de cancelación;
- promociones acumulables o no.
