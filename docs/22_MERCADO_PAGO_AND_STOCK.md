# Mercado Pago Checkout Pro y stock

## Alcance

La integración usa Checkout Pro alojado por Mercado Pago mediante el SDK oficial Node `mercadopago@3.6.0`. Toda creación de Preference, lectura de pagos y validación de webhook ocurre en servidor. No se usa SDK browser, Public Key, Bricks ni captura propia de tarjetas.

## Flujo completo

1. El navegador envía la intención del carrito y el servidor reconstruye precios, combos y consumo físico.
2. La primera acción devuelve una cotización; la segunda vuelve a resolverla dentro de una transacción.
3. La transacción bloquea los productos requeridos por UUID ordenado, calcula stock físico menos reservas activas vigentes y crea `order`, `order_items`, reserva e ítems de reserva.
4. Fuera de esa transacción se crea o reutiliza una Preference a partir del pedido persistido.
5. Solo con una Preference persistida y un `init_point` válido el navegador limpia el carrito y redirige a Mercado Pago.
6. Mercado Pago notifica `POST /api/webhooks/mercado-pago`.
7. El endpoint valida la firma y consulta el Payment real y, cuando existe, su Merchant Order para verificar la Preference.
8. Un pago aprobado consume reserva, descuenta stock físico y marca el pedido pagado dentro de una sola transacción.
9. Los retornos `/pago/exito`, `/pago/pendiente` y `/pago/error` solo muestran estado persistido. Nunca confirman pagos.

## Modelo de reservas

`stock_reservations` contiene una única reserva por pedido:

- `status`: `active`, `consumed` o `released`;
- `expires_at`;
- `created_at`;
- `consumed_at` y `released_at` opcionales.

`stock_reservation_items` guarda `reservation_id`, `product_id` y `quantity`, con unicidad por reserva/producto. Individuales, combos predeterminados y personalizados terminan agregados por Product ID físico. Los combos no tienen stock independiente.

`products.stock` continúa siendo stock físico. La disponibilidad pública es:

```text
max(products.stock - SUM(reservas active con expires_at > now()), 0)
```

Una reserva vencida deja de contar aunque todavía figure `active`. Esto libera inventario lógicamente sin depender de cron. Catálogo, ficha, relacionados, combos, constructor, cotización, checkout y métricas administrativas usan esa proyección. El admin diferencia stock físico de disponible.

## Concurrencia

La reserva final no depende de una lectura sin lock. Dentro de la transacción:

1. se agregan requerimientos por Product ID;
2. un advisory transaction lock por `checkout_attempt_id` serializa retries del mismo intento;
3. se ordenan los UUID;
4. se ejecuta `SELECT ... ORDER BY id FOR UPDATE` sobre esos productos;
5. se recalculan reservas activas vigentes;
6. se valida disponibilidad;
7. se insertan pedido y reserva.

Todos los creadores de reservas toman el mismo lock de producto. Dos intents por la última unidad se serializan: el segundo observa la reserva del primero y falla. El orden determinista reduce deadlocks.

Plan de integración PostgreSQL pendiente de automatizar:

1. crear un producto con stock físico 1;
2. abrir dos conexiones y dos transacciones;
3. ejecutar simultáneamente dos creaciones para pedidos distintos;
4. mantener la primera transacción abierta después del `FOR UPDATE`;
5. comprobar que la segunda espera;
6. confirmar la primera;
7. comprobar que la segunda devuelve `insufficient_stock`;
8. verificar una reserva activa, ningún stock negativo y rollback completo del pedido perdedor;
9. repetir con el mismo `checkout_attempt_id` y verificar un solo pedido/reserva.

## Duración y Preference

`STOCK_RESERVATION_MINUTES` admite enteros de 1 a 120 y por defecto vale 15. Se calcula un solo `expiresAt` por reserva. La Preference usa:

- `expires: true`;
- `expiration_date_from`: momento de creación;
- `expiration_date_to`: el mismo `expiresAt` de la reserva.

Esto es vigencia del Checkout Pro, no vencimiento de un cupón o medio offline.

La Preference se arma exclusivamente desde `orders` y `order_items` persistidos:

- líneas con `id`, `title`, `quantity`, `unit_price` y `currency_id: ARS`;
- `payer.email` si existe;
- UUID interno del Order en `external_reference`;
- el mismo UUID en `metadata.order_id`;
- tres `back_urls` protegidas por el token de acceso del pedido;
- `auto_return: approved`;
- `notification_url` derivada de `APP_URL`;
- ventana de expiración;
- exclusión explícita de medios offline/tardíos.

Se persisten en `orders`: Preference ID, `init_point`, fecha de creación, vencimiento, generación y un lease breve de creación. Una Preference completa y vigente se reutiliza. El SDK recibe una idempotency key estable `orderId:generation`; esto cubre la respuesta perdida entre Mercado Pago y la persistencia local. Una Preference vencida solo se reemplaza después de renovar atómicamente la reserva.

## Dinero

El dominio conserva centavos enteros. `centsToMercadoPagoAmount` valida un entero seguro positivo y convierte solo en el adapter externo:

```text
590000 centavos -> 5900 pesos para unit_price
```

La respuesta externa se convierte nuevamente a centavos con validación de precisión antes de comparar contra `orders.total`. No se guardan floats de Mercado Pago en el dominio.

## Métodos de pago

`binary_mode` no está activado. Se excluyen explícitamente:

- `ticket`, que incluye acreditaciones en efectivo como Pago Fácil/Rapipago;
- `atm`;
- `bank_transfer`.

Para este MVP quedan disponibles, según la cuenta y oferta que Mercado Pago determine, saldo de Mercado Pago (`account_money`), tarjetas de crédito, débito y prepagas. La decisión evita una acreditación offline posterior a una reserva de 15 minutos. Debe revisarse con negocio antes de habilitar transferencias/tickets; la API `/v1/payment_methods` es la fuente real por cuenta y país.

## Pagos y estados

`payments` persiste:

- Order y proveedor `mercado_pago`;
- Payment ID único;
- Preference ID conciliada mediante Merchant Order cuando está disponible;
- estado y detalle;
- monto en centavos y moneda;
- fecha de aprobación;
- metadata mínima: IDs de método/tipo y error de conciliación;
- referencia externa y timestamps.

No se almacena tarjeta, payer completo ni payload crudo.

Mapping de Mercado Pago:

| Mercado Pago | Payment | Order / efecto |
| --- | --- | --- |
| `pending`, `in_process`, `authorized` | mismo estado | `payment_pending`, conserva reserva hasta vencer |
| `approved` | `approved` | `paid`, consume reserva y stock una vez |
| `rejected`, `cancelled` | mismo estado | `payment_rejected`, libera si no hay otro pago vivo |
| `in_mediation` | `in_mediation` | `manual_review` |
| `refunded`, `charged_back` | mismo estado | `manual_review`, sin reingreso automático de stock |
| desconocido | `unknown` | `manual_review` |

`status_detail` se conserva como texto abierto porque Mercado Pago puede ampliarlo.

## Webhook y firma

El Route Handler público limita el body a 64 KiB y exige `data.id`, `x-signature` y `x-request-id`. Usa `WebhookSignatureValidator` del SDK oficial con el secreto server-only. El manifest oficial es conceptualmente:

```text
id:<data.id>;request-id:<x-request-id>;ts:<ts>;
```

Una firma inválida devuelve 401 y nunca consulta ni procesa el pago. Solo se procesa el tópico `payment`; otros tópicos firmados se ignoran con 2xx.

Después de validar la firma se consulta `Payment.get({ id })`. No se confía en el status del body. Si el Payment expone Merchant Order se consulta también para obtener `preference_id`. Antes de cualquier descuento se valida:

- `external_reference === orders.id`;
- `metadata.order_id`, si existe;
- Preference ID, si la API la permite conciliar;
- monto exacto en centavos;
- moneda `ARS`.

Una inconsistencia se guarda como metadata mínima, pone el pedido en `manual_review` y no descuenta stock.

## Idempotencia y aprobación

Payment ID tiene unique constraint, pero la garantía principal es transaccional. El procesador bloquea primero Order y luego reserva/productos. Si la reserva ya está `consumed`, un `approved` repetido se reconoce como duplicado y no vuelve a descontar. `pending -> approved` actualiza la misma fila.

Para `approved`:

1. lock de Order;
2. upsert del Payment conciliado;
3. lock de reserva;
4. carga y lock ordenado de productos;
5. validación de stock no comprometido;
6. decremento de `products.stock` según reservation items;
7. transición a `consumed`;
8. Order a `paid`;
9. commit.

## Aprobación tardía

Preference y reserva comparten vencimiento, pero el código no asume que eso elimina todos los eventos tardíos. Si llega `approved` con reserva vencida o `released`, vuelve a bloquear productos y solo consume si existe stock físico no reservado suficiente. Si no alcanza:

- Payment queda registrado como aprobado;
- Order pasa a `manual_review`;
- reserva queda `released`;
- no se miente mostrando pedido confirmado;
- no se hace reembolso automático.

La operación debe decidir manualmente cumplimiento o devolución.

## UX y carrito

El checkout no se considera terminado al crear el Order. Si falla Mercado Pago, devuelve error, conserva carrito e identificadores y permite retomar el mismo pedido. Solo limpia el carrito cuando Order, reserva y Preference están listos y justo antes de enviar al comprador a `init_point`.

`/pedido/[publicNumber]` mantiene el access token existente, no muestra PII y refleja esperando pago, pendiente, confirmado, rechazado, vencido y revisión manual. Mientras la Preference y reserva sigan vigentes permite reabrir Mercado Pago.

Las páginas de retorno leen el mismo estado persistido y aclaran que el webhook es la autoridad.

## Variables

`.env.local` de desarrollo:

```dotenv
MERCADO_PAGO_ACCESS_TOKEN=TEST-...
MERCADO_PAGO_WEBHOOK_SECRET=...
APP_URL=https://URL_HTTPS_ACCESIBLE
STOCK_RESERVATION_MINUTES=15
```

`APP_URL=http://localhost:3000` sirve para back URLs durante desarrollo de UI, pero Mercado Pago necesita una URL HTTPS públicamente accesible para entregar webhooks. Usar un túnel HTTPS y colocar su origin exacto en `APP_URL` para la prueba integral.

En Vercel:

| Variable | Tipo | Observación |
| --- | --- | --- |
| `MERCADO_PAGO_ACCESS_TOKEN` | Secret | token TEST durante esta fase |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Secret | firma de Webhooks |
| `APP_URL` | Config | origin HTTPS canónico, sin path/query |
| `STOCK_RESERVATION_MINUTES` | Config opcional | default 15 |

Producción debe usar el dominio canónico. Para Preview se necesita un `APP_URL` estable o específico de ese deployment y registrar ese endpoint de prueba en Mercado Pago. No se deriva de `Host` ni `X-Forwarded-Host`.

## Prueba real con credenciales TEST

1. Crear o seleccionar una aplicación en Mercado Pago Developers Argentina.
2. Obtener Access Token TEST. No cargar credenciales productivas.
3. Configurar las cuatro variables locales anteriores.
4. Exponer la app local con HTTPS o desplegar un Preview controlado.
5. En la aplicación de Mercado Pago, configurar Webhooks para `payment` apuntando a `https://ORIGIN/api/webhooks/mercado-pago`.
6. Copiar la firma secreta generada a `MERCADO_PAGO_WEBHOOK_SECRET`.
7. Crear/usar vendedor y comprador de prueba distintos si Mercado Pago lo requiere. No iniciar sesión con la cuenta vendedora para comprar.
8. Aplicar migraciones y cargar stock conocido.
9. Ejecutar un pago aprobado con datos de prueba y comprobar `payments`, Order `paid`, reserva `consumed` y decremento físico único.
10. Reenviar la misma notificación y comprobar que el stock no cambia.
11. Ejecutar un pago rechazado y comprobar Order `payment_rejected`, reserva `released` y stock físico intacto.
12. Ejecutar un estado pendiente disponible en TEST y comprobar que no figura pagado ni descuenta stock.

## Logging

Se registran eventos estructurados de Preference creada/reutilizada/fallida, reserva creada/liberada/consumida, webhook recibido, firma inválida, Payment consultado, conciliación fallida, duplicado y aprobación tardía sin stock. Los logs usan IDs técnicos y estados; no incluyen secretos, cookies, tarjeta ni PII completa.

## Deuda técnica

- Automatizar pruebas PostgreSQL de rollback y carrera real; los tests actuales cubren reglas puras y el plan reproducible anterior.
- Agregar rate limiting distribuido para evitar abuso de reservas en checkout público.
- Agregar un job opcional que marque reservas/pedidos vencidos para observabilidad; la disponibilidad ya es correcta sin ese job.
- Diseñar refunds/chargebacks y eventual reingreso de stock según preparación/entrega.
- Mejorar historial y acciones administrativas; el MVP solo lista número, estados y total.
- Evaluar un token de retorno separado del access token del pedido para minimizar exposición de bearer tokens a URLs de terceros.
- Definir tarifas y zonas antes de cobrar delivery.
- Incorporar monitoreo/alertas externo para webhooks en `manual_review` o con errores transitorios.
