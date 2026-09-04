# Checkout MVP

## Alcance

El checkout funciona como invitado y usa el carrito persistido en el navegador solo como intención de compra. El servidor valida el payload con Zod, carga productos, combos y componentes desde PostgreSQL, recalcula importes en centavos enteros, agrega el consumo de stock por Product ID y genera snapshots antes de insertar el pedido.

El flujo tiene dos pasos. La primera Server Action devuelve una cotización y un hash que cubre líneas, precios, cantidades, configuración, fulfillment y totales. La segunda vuelve a resolver el carrito dentro de la transacción y exige que el hash y el total sigan coincidiendo; si cambiaron, devuelve una nueva cotización para que el cliente confirme otra vez.

## Persistencia

`orders` guarda `checkout_attempt_id`, un hash del token de acceso y un hash canónico del request aceptado. `checkout_attempt_id` es único y un retry solo devuelve el pedido existente cuando también coinciden token y request.

`order_items.configuration_json` usa un contrato discriminado con `version: 1`:

- `preset_combo`: composición, precios individuales de componentes, precio de referencia y precio promocional vigente.
- `custom_combo`: componentes base, extras, suma individual, precio de extras, combo coincidente y ahorro.

Los productos individuales no necesitan `configuration_json`. Los pedidos históricos se leen desde estos snapshots y no se reconstruyen con el catálogo actual.

La confirmación pública exige `public_number` y un token UUID aleatorio. Solo se persiste SHA-256 del token y la consulta pública omite nombre, contacto, dirección y observaciones.

## Estado y pago

Este documento describe la base anterior a Mercado Pago. El flujo vigente de Preference, pagos y reservas está documentado en `22_MERCADO_PAGO_AND_STOCK.md`.

## Fulfillment

Retiro no requiere dirección. Envío local exige calle, número y localidad, con referencia opcional. Como todavía no existe una fuente documentada de zonas o tarifas, `delivery_total` queda en cero y no se aplican reglas geográficas inventadas. Antes de producción debe definirse si el envío será sin cargo, se cobrará online o se coordinará fuera del total del pedido.

## Pendientes operativos

- Definir zonas, tarifas y condiciones operativas de entrega.
- Agregar rate limiting distribuido para la mutación pública.
- Agregar pruebas de integración PostgreSQL para rollback, carreras de idempotencia y concurrencia de inventario.
