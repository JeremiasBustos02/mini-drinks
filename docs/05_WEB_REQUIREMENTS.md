# 05 — Requerimientos de la web

## Objetivo

Crear un ecommerce mobile-first que permita vender productos individuales, combos y packs, incluyendo un constructor de combos, con la menor fricción posible desde Instagram hasta la compra.

---

# Alcance MVP

## Navegación y catálogo

La web debe permitir:

- navegar sin login;
- ver catálogo;
- navegar categorías;
- consultar disponibilidad;
- ver fichas de producto;
- agregar productos al carrito;
- comprar productos individuales;
- comprar combos predeterminados;
- comprar packs simples;
- crear un combo personalizado.

## Constructor de combo

Debe permitir:

1. seleccionar miniatura;
2. seleccionar mixer;
3. seleccionar vaso;
4. seleccionar extras;
5. visualizar precio actualizado;
6. seleccionar cantidad;
7. agregar al carrito.

La selección será libre.

Las únicas restricciones iniciales serán las necesarias por disponibilidad de stock y consistencia técnica.

## Stock compuesto

Los combos no deben manejarse únicamente como stock independiente.

Ejemplo:

`Combo Fernet = 1 mini Fernet + 1 Coca + 1 vaso`

Al venderlo deben descontarse sus componentes.

Esto aplica también a combos personalizados.

## Carrito

Debe mostrar:

- productos;
- combos;
- componentes de combos cuando sea útil para el cliente;
- cantidades;
- subtotal;
- descuentos aplicables;
- costo de entrega cuando esté disponible;
- total.

## Checkout

La cuenta no será obligatoria.

Datos mínimos:

- nombre;
- apellido;
- contacto;
- datos requeridos para la operación/validación;
- dirección si corresponde;
- localidad;
- método de entrega;
- método de pago;
- observaciones.

## Pago

Debe existir pago online integrado.

Proveedor pendiente de decisión técnica.

## Entrega

Debe soportar inicialmente:

- delivery propio;
- retiro.

Los envíos externos quedan sujetos a definición operativa antes de automatizarlos.

## Confirmación

Después del pago/pedido:

- mostrar confirmación;
- mostrar número o referencia del pedido;
- informar modalidad de entrega;
- ofrecer contacto por WhatsApp si el cliente necesita ayuda.

## WhatsApp

Canal secundario para:

- consultas;
- ayuda;
- pedidos especiales;
- eventos;
- mayoristas.

No reemplaza al checkout.

## Mayoristas

MVP:

- CTA secundario visible;
- sección/página explicativa;
- formulario o WhatsApp;
- sin precios públicos;
- cotización manual.

## Eventos

MVP:

- sección/página;
- explicación de opciones;
- formulario o WhatsApp;
- cotización manual.

## Administración MVP

Dos administradores deben poder:

- crear productos;
- editar productos;
- ocultar productos;
- gestionar categorías;
- actualizar precios;
- actualizar stock;
- crear/editar combos predeterminados;
- ver pedidos;
- cambiar estados de pedido.

No se busca construir un ERP.

## Packaging / sorpresa

La web debe comunicar que los combos y packs de marca incluyen:

- packaging;
- sticker;
- tarjeta/sorpresa.

El sistema digital de canje no es requisito para lanzar.

## Mobile-first

Flujo prioritario:

Instagram → producto/landing → carrito → checkout.

La experiencia debe optimizarse primero para teléfono.

---

# Alcance V1

## Cuenta

- registro;
- login;
- recuperación;
- direcciones;
- historial de pedidos.

## Fidelización

- códigos únicos;
- QR/código de canje;
- puntos;
- movimientos;
- recompensas;
- cupones.

## Packs avanzados

Configuración completa de packs x4/x6/x12.

---

# V1.1 / V2

## Ruleta

- reglas;
- probabilidades;
- premios;
- límites;
- consumo de puntos/tickets;
- historial;
- controles antifraude.

## Coleccionabilidad digital

- colecciones;
- temporadas;
- progreso;
- recompensas.

---

# Futuro

- portal mayorista;
- checkout B2B;
- precios mayoristas automatizados;
- facturación automática;
- logística avanzada;
- personalización/cotización automática de eventos.
