# Hardening pre-producción

## Estado

Este bloque endurece el MVP existente sin ampliar su alcance comercial. Mercado Pago continúa **pendiente de prueba integral con credenciales TEST** y luego de validación separada con credenciales productivas. No se activaron credenciales, pagos reales, refunds ni integraciones nuevas.

## Categorías y concurrencia

La migración `0007_exotic_sabra.sql` agrega `categories.version integer not null default 1`. Categorías, productos y combos usan el mismo contrato de optimistic locking:

- el formulario envía `expectedVersion`;
- el `UPDATE` compara `id + version`;
- una escritura exitosa incrementa `version + 1`;
- `updated_at` queda solo como metadata;
- cero filas actualizadas representa un conflicto y exige refrescar.

La migración debe aplicarse antes de desplegar el código que selecciona `categories.version`. No se modificaron migraciones aplicadas.

## Rate limiting

La abstracción de `lib/rate-limit` usa Redis por REST con un contador y expiración atómicos. En producción es fail-closed si Redis no está configurado o no responde en 1 segundo. El fallback en memoria existe solo fuera de producción; no brinda protección distribuida y se reinicia con el proceso.

Servicio externo requerido para producción: una base Redis de Upstash accesible por REST.

Variables manuales, sin inventar valores:

```dotenv
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Límites por ventana fija de un minuto:

| Operación | Identidad | Límite |
| --- | --- | ---: |
| Cotización | hash de IP de infraestructura | 60/min |
| Cotización | `checkoutAttemptId` | 30/min |
| Crear pedido/Preference | hash de IP de infraestructura | 20/min |
| Crear pedido/Preference | `checkoutAttemptId` | 10/min |
| Webhook, antes de firma | IP de infraestructura | 300/min |
| Webhook firmado | Payment ID | 120/min |

Checkout combina IP e intento para evitar depender de una sola identidad. El webhook mantiene umbrales altos para tolerar retries legítimos; firma, límite de body e idempotencia transaccional siguen siendo las defensas principales.

## Observabilidad

`lib/observability/logger.ts` emite una línea JSON por evento con `timestamp`, `level`, `event` y `environment`. Los flujos agregan, cuando existen, `correlationId`, `checkoutAttemptId`, `orderId`, `paymentId`, `preferenceId`, estado y duración.

El sanitizer elimina por nombre de campo passwords, tokens, cookies, secretos, authorization, email, teléfono, documento, dirección, body y payload. Los errores conservan solo su clase. No registrar objetos de Supabase, Mercado Pago, requests ni formularios completos.

Checkout crea o acepta un `x-request-id` con formato seguro. El webhook utiliza el `x-request-id` firmado por Mercado Pago como correlación y lo propaga al procesamiento del pago.

Alertas futuras recomendadas: `manual_review`, fallas reiteradas de Preference, 5xx del webhook, health `unavailable` y archivos huérfanos.

## Checkout y retries

- El carrito del browser sigue siendo intención; servidor recalcula precio y disponibilidad.
- Quote no borra ni resetea el formulario ante fallas y permite reintentar.
- La creación mantiene `checkoutAttemptId`, token y request hash hasta obtener una Preference válida.
- Un retry idéntico reutiliza el único Order y la misma clave idempotente de Mercado Pago.
- Una Preference solo se reutiliza si el Order sigue esperando pago y su reserva está active y vigente.
- Una reserva vencida o released se renueva bajo lock si todavía hay stock; no crea otro Order ni otra reserva.
- Si una edición produce conflicto con el intento ya persistido, la UI descarta únicamente los identificadores locales para que el siguiente submit abra un intento nuevo.
- Un Payment todavía no visible para la API de Mercado Pago devuelve 503 al webhook para solicitar retry, en vez de quedar confirmado como ignorado.

Errores públicos diferenciados: carrito/payload inválido, producto o combo no disponible, stock insuficiente, precio actualizado, reserva no renovable, fallo temporal, fallo de Preference y rate limit. Las páginas persistidas distinguen pago pendiente, rechazado, confirmado, vencido y revisión manual. Nunca se muestran SQL, tablas, stack traces, IDs internos ni errores raw de proveedores.

## Reservas vencidas

La expiración es lógica. Solo cuentan reservas `active` con `expires_at > now()`, por lo que una fila `active` vencida no resta stock en storefront, combos, checkout ni admin. `getEffectiveReservationStatus()` presenta esa fila como `expired` sin mutarla. Pedidos `pending_payment` y `payment_pending` también se presentan como vencidos cuando corresponde, y el filtro de admin incluye el estado derivado.

No se implementó cron porque no mejora la corrección de inventario actual. Un job futuro podría convertir `active + vencida` a `released` para limpieza y métricas, siempre preservando la capacidad de auditar el vencimiento y sin ser requisito para disponibilidad.

## PostgreSQL y build

Configuración runtime de postgres.js:

- `prepare: false`, requerido para Transaction Pooler;
- `connect_timeout: 10` segundos;
- `idle_timeout: 20` segundos;
- `max: 5` conexiones por instancia serverless.

Estos valores evitan timeouts agresivos y limitan presión por instancia. La capacidad total debe contrastarse con el plan/pool de Supabase y la concurrencia real de Vercel.

`DATABASE_MIGRATION_URL` solo es leída por `drizzle.config.ts`; no se usa en runtime y no debería cargarse en Vercel salvo que un job de CI dentro de ese entorno ejecute migraciones. Aplicar migraciones como etapa controlada separada.

Las consultas públicas usan APIs dinámicas/no-store y admin usa `connection()`. `/api/health` declara `force-dynamic`. El import de `lib/db` valida `DATABASE_URL` sin abrir conexión; por eso `DATABASE_URL` sigue siendo una variable runtime obligatoria en el deployment y debe estar disponible para el build de Vercel cuando Next evalúa módulos. El build no debe necesitar una DB alcanzable ni ejecutar consultas.

## Health y headers

`GET /api/health` no consulta Mercado Pago ni expone detalles. Hace `select 1` a DB y responde:

- `ok` con HTTP 200: DB y Redis del limiter responden;
- `degraded` con HTTP 200: DB disponible pero Redis no responde o no está configurado;
- `unavailable` con HTTP 503: DB no disponible.

Headers globales conservadores:

- `Referrer-Policy: strict-origin-when-cross-origin`;
- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: SAMEORIGIN`;
- `Permissions-Policy` sin cámara, micrófono ni geolocalización.

No se agregó CSP estricta todavía: debe levantarse primero en report-only y verificar Next.js, Supabase Auth, imágenes externas y redirects de Mercado Pago.

## Storage

Los errores de upload se registran sin archivo, URL, sesión ni respuesta raw. Si el upload funcionó pero la DB falla, o Storage no entrega URL válida, se emite `admin.product_image_orphaned` y el admin recibe una advertencia operativa. No se agregó garbage collector ni borrado automático: una limpieza futura debe comprobar referencias antes de eliminar.

## Variables de entorno

PUBLIC / CONFIG:

| Variable | Entornos | Nota |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Preview, Production | URL pública del proyecto correcto |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Preview, Production | publishable, no service role |
| `APP_URL` | Preview, Production | origin HTTPS canónico y registrado en MP |
| `STOCK_RESERVATION_MINUTES` | Preview, Production | entero 1..120; default 15 |

SECRET:

| Variable | Runtime Vercel | Nota |
| --- | --- | --- |
| `DATABASE_URL` | Sí | Transaction Pooler, server-only |
| `DATABASE_MIGRATION_URL` | No | solo CI/operador de migraciones |
| `MERCADO_PAGO_ACCESS_TOKEN` | Sí, pendiente | TEST antes de cualquier credencial productiva |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Sí, pendiente | secreto del endpoint del entorno |
| `UPSTASH_REDIS_REST_URL` | Sí | endpoint del limiter distribuido |
| `UPSTASH_REDIS_REST_TOKEN` | Sí | token server-only del limiter |

`TEST_DATABASE_URL` es solo local/CI para diagnóstico y nunca debe apuntar a producción.

## Checklist de producción

### Supabase

- [ ] Confirmar proyecto y región de Production.
- [ ] Aplicar todas las migraciones hasta `0007` con `DATABASE_MIGRATION_URL` controlada.
- [ ] Ejecutar `npx drizzle-kit check` antes de migrar.
- [ ] Verificar RLS habilitado en tablas públicas.
- [ ] Verificar que Data API no permita escrituras anónimas de catálogo, pedidos, pagos o reservas.
- [ ] Crear bucket público `product-images`, límite 2 MB y MIME WebP/PNG/JPEG.
- [ ] Aplicar y probar policies de Storage de `docs/23_ADMIN_UI_AND_STORAGE.md`.
- [ ] Confirmar que `private.is_admin()` y grants existen.
- [ ] Crear solo los admins operativos necesarios y probar usuario no admin.
- [ ] Confirmar backups y practicar una restauración en un entorno aislado.

### Vercel

- [ ] Cargar PUBLIC/CONFIG por separado para Preview y Production.
- [ ] Cargar secretos solo en los entornos que los necesitan.
- [ ] No cargar `DATABASE_MIGRATION_URL` en runtime.
- [ ] Configurar Upstash REST antes del deploy productivo.
- [ ] Confirmar dominio canónico y HTTPS.
- [ ] Confirmar `APP_URL` exacta por entorno, sin path ni query.
- [ ] Ejecutar build sin conectividad a DB y confirmar que no corre queries.
- [ ] Probar `/api/health` y monitorear respuestas 503.
- [ ] Revisar capacidad del pool considerando `max: 5` por instancia.

### Checkout

- [ ] Probar checkout guest retiro y delivery sin login.
- [ ] Confirmar recálculo server-side de precios y total.
- [ ] Confirmar que precio cambiado exige nueva aceptación.
- [ ] Confirmar que stock insuficiente no crea Order ni reserva.
- [ ] Confirmar un solo Order para retries con igual `checkoutAttemptId`.
- [ ] Confirmar que fallo de Preference conserva carrito, Order y reserva.
- [ ] Confirmar retry seguro de Preference sin duplicar Order/reserva.
- [ ] Confirmar que reserva vencida no resta disponibilidad.
- [ ] Confirmar que admin muestra reserva y pedido derivados como vencidos.
- [ ] Validar operativamente zonas/tarifas de delivery antes de cobrar.

### Mercado Pago

- [ ] Mantener Mercado Pago marcado como pendiente hasta completar prueba real TEST.
- [ ] Obtener y cargar credenciales TEST, no productivas.
- [ ] Registrar webhook TEST en `${APP_URL}/api/webhooks/mercado-pago`.
- [ ] Confirmar firma válida e inválida.
- [ ] Probar aprobado, pendiente y rechazado con comprador/vendedor TEST separados.
- [ ] Reenviar webhook aprobado y confirmar un único descuento de stock.
- [ ] Probar retry cuando Payment todavía devuelve not found.
- [ ] Confirmar conciliación de Order, Preference, monto y ARS.
- [ ] Revisar manualmente aprobación tardía sin stock y `manual_review`.
- [ ] Repetir todas las pruebas obligatorias con configuración productiva antes de live.
- [ ] No marcar la integración como validada ni aceptar pagos reales hasta cerrar el ticket de credenciales.

### Seguridad

- [ ] Confirmar que ningún secreto usa prefijo `NEXT_PUBLIC_`.
- [ ] Rotar credenciales que hayan sido compartidas fuera del gestor seguro.
- [ ] Confirmar rate limiting Redis en logs y no fallback local.
- [ ] Probar límites sin bloquear retries normales ni webhooks válidos.
- [ ] Verificar headers en dominio final y redirects de MP/Auth.
- [ ] Revisar logs para confirmar ausencia de PII y secretos.
- [ ] Configurar retención, alertas y acceso mínimo a logs.
- [ ] Evaluar CSP report-only después del smoke test.

### Testing

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `git diff --check`
- [ ] `npx drizzle-kit check`
- [ ] Ejecutar `npm run test:integration:postgres` con DB desechable.
- [ ] Ejecutar flujos manuales de checkout y admin en mobile y desktop.
- [ ] Ejecutar prueba integral Mercado Pago TEST pendiente.

## Deuda técnica explícita

- Automatizar el diagnóstico PostgreSQL en CI con una DB efímera y migraciones reales.
- Agregar paginación a `/admin/pedidos` antes de superar 100 pedidos operativos.
- Implementar reconciliación/alertas para webhooks con fallas persistentes.
- Evaluar job de liberación física de reservas solo por observabilidad/limpieza.
- Diseñar limpieza segura de imágenes huérfanas, sin garbage collector por ahora.
- Versionar infraestructura/policies de Storage para evitar drift entre entornos.
- Evaluar CSP en report-only.
- Mercado Pago: pruebas reales TEST y productivas siguen pendientes.
