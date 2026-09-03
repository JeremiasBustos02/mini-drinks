# 20 - Administración y autenticación

## Alcance

El panel administrativo vive en `/admin` dentro del monolito Next.js. Supabase
Auth administra identidad, contraseña, sesión y renovación de tokens. Drizzle y
la conexión PostgreSQL privada siguen siendo la única vía de acceso al catálogo.

No se implementan registro público, OAuth, recuperación de contraseña ni auth de
clientes.

## Variables

- `NEXT_PUBLIC_SUPABASE_URL`: URL pública del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publishable key pública recomendada por
  Supabase para los clientes SSR/browser actuales.
- `DATABASE_URL`: conexión privada server-side usada por la aplicación y Drizzle.
- `DATABASE_MIGRATION_URL`: conexión server-only usada por Drizzle Kit.

No se usa ni se necesita una service role key. Las variables públicas permiten
hablar con Supabase Auth, pero no conceden acceso administrativo.

## Sesión SSR

- `lib/supabase/client.ts` crea el cliente browser.
- `lib/supabase/server.ts` crea el cliente asociado a las cookies de la request.
- `proxy.ts` ejecuta solo para `/admin/:path*`, renueva cookies mediante
  `getClaims()` y realiza una redirección temprana si no hay identidad.
- Los layouts y Server Actions vuelven a validar la identidad con `getUser()`.

El proxy mejora persistencia y UX, pero no es la barrera de seguridad final.

## Autorización

La autorización usa la tabla `admin_users`:

- `auth_user_id` contiene el UUID de `auth.users` de Supabase Auth;
- tiene restricción única;
- no almacena email ni contraseña;
- la comprobación se realiza server-side con Drizzle después de validar la
  identidad con Supabase.

Se eligió una tabla explícita porque el rol es persistente, auditable y no queda
hardcodeado en componentes, emails o variables de entorno. No se agregó una FK
hacia `auth.users` para mantener las migraciones de la aplicación desacopladas
del schema interno administrado por Supabase.

## Bootstrap de administradores

1. Aplicar migraciones con `npm run db:migrate`.
2. En Supabase Dashboard, abrir Authentication > Users y crear el usuario con
   email y contraseña. No habilitar un formulario público de registro.
3. Copiar el UUID del usuario, no su email.
4. Ejecutar `npm run db:add-admin -- <SUPABASE_AUTH_USER_UUID>` en un entorno con
   `DATABASE_URL` configurada.
5. Repetir los pasos 2 a 4 para el segundo administrador.

El script es idempotente y no contiene credenciales ni identificadores reales.
Alternativamente puede ejecutarse SQL controlado:

```sql
insert into public.admin_users (auth_user_id)
values ('<SUPABASE_AUTH_USER_UUID>')
on conflict (auth_user_id) do nothing;
```

## Protección de mutaciones

Cada Server Action llama a la verificación completa de identidad y rol antes de
validar o escribir datos. La protección del layout no se considera suficiente,
porque una Server Action es un endpoint independiente. Las mutaciones validan
payloads con Zod, respetan constraints y revalidan las rutas administrativas y
públicas afectadas.

Productos y combos no se borran físicamente: se desactivan y despublican. Las
categorías con productos tampoco se eliminan; se desactivan.

## RLS y conexión a datos

`admin_users` y las tablas comerciales mantienen RLS habilitado sin políticas
del Data API. No se crean políticas públicas. Supabase Auth solo valida la
identidad; las lecturas y escrituras administrativas se ejecutan con la conexión
PostgreSQL privada de `DATABASE_URL` desde el servidor.

La publishable key nunca sustituye la autorización de aplicación y la conexión
PostgreSQL nunca debe exponerse al navegador.
