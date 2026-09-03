# Mini Drinks

Ecommerce mobile-first para una tienda de mini bebidas, combos y accesorios.

## Stack

- Next.js con App Router
- TypeScript estricto
- Tailwind CSS
- PostgreSQL en Supabase
- Drizzle ORM y Postgres.js
- Fuentes Bowlby One SC y Roboto mediante `next/font`

## Desarrollo local

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abrir `http://localhost:3000`.

En macOS o Linux, reemplazar `Copy-Item` por `cp`.

## Base de datos

### Variables de entorno

Las dos variables son exclusivas del servidor y nunca deben llevar un prefijo
`NEXT_PUBLIC_`:

- `DATABASE_URL`: URL del transaction pooler de Supabase (puerto `6543`) para
  las consultas de Next.js en Vercel/serverless.
- `DATABASE_MIGRATION_URL`: URL directa de Supabase o URL del session pooler
  (puerto `5432`) para Drizzle Kit y migraciones.

Crear `.env.local` a partir de `.env.example` y reemplazar sus placeholders. Las
credenciales reales no deben versionarse.

### Setup en Supabase

1. Crear un proyecto y guardar de forma segura la contraseña de PostgreSQL.
2. En la sección de conexión de la base, copiar la URL de transaction pooler
   para `DATABASE_URL` y la URL directa o de session pooler para
   `DATABASE_MIGRATION_URL`.
3. Configurar ambas variables en `.env.local` y también en Vercel para los
   entornos que correspondan. No crear variantes `NEXT_PUBLIC_`.
4. Ejecutar `npm run db:migrate` y luego `npm run db:seed` sólo en el entorno de
   desarrollo que deba recibir datos de ejemplo.
5. Versionar siempre los cambios futuros mediante Drizzle; no editar la
   estructura manualmente desde Supabase.

### Migraciones

El schema fuente está en `lib/db/schema/index.ts` y las migraciones versionadas
en `drizzle/`. Todo cambio de estructura debe seguir este flujo; no se modifica
la base manualmente desde el dashboard:

```bash
npm run db:generate
npm run db:check
npm run db:migrate
```

`db:generate` crea una migración a partir del schema y `db:migrate` aplica las
migraciones pendientes usando `DATABASE_MIGRATION_URL`.

### Seed de desarrollo

Después de aplicar las migraciones:

```bash
npm run db:seed
```

El seed carga cuatro categorías, ocho productos y cuatro combos basados en los
mocks actuales. Usa upserts por slug y la restricción única de componentes, por
lo que se puede ejecutar nuevamente sin duplicar registros. Está pensado sólo
para desarrollo y usa `DATABASE_URL`.

### Convenciones

- El dinero se persiste como enteros `bigint` en centavos. Por ejemplo, `5900`
  representa ARS 59,00. Los mocks y el carrito usan la misma unidad, y los
  importes quedan limitados al rango entero seguro de JavaScript. No se usan
  valores de punto flotante para cálculos monetarios.
- Las claves primarias son UUID generados por PostgreSQL. Los slugs son claves
  únicas para URLs, no identificadores primarios.
- Los valores controlados se definen una sola vez en `types/domain.ts` y se
  aplican como enums PostgreSQL. Aportan integridad para conjuntos pequeños y
  estables de estados y tipos; cualquier cambio se realiza mediante migración.
- Todas las tablas tienen RLS habilitado sin políticas para impedir acceso por
  el Data API de Supabase. En esta etapa sólo se accede con la conexión privada
  server-side.
- `lib/db/index.ts` y `lib/db/queries/` son server-only. No deben importarse
  desde Client Components ni desde el store del carrito.
- Los precios y totales del carrito siguen siendo datos de UX. Un checkout
  futuro deberá consultar la base y recalcular precio, promociones y stock en
  el servidor antes de crear un pedido.

## Verificación

```bash
npm run lint
npm run typecheck
npm test
npm run build
git diff --check
```

## Alcance actual

La interfaz aprobada conserva mocks para Home, catálogo, fichas y constructor,
mientras la persistencia real se incorpora de manera gradual. Ya existen el
schema, migraciones, seed y consultas server-side; todavía no hay checkout,
autenticación, administración ni integración de pagos.

La carpeta `docs/` es la fuente de verdad del producto. Ante diferencias de
alcance, se aplica el orden de prioridad definido por la documentación, con
`13_MVP_AUDIT.md` y `14_PRODUCT_RULES.md` como referencias principales.
