# 23 - Admin UI y Supabase Storage

## Alcance

Las imágenes de productos, combos y contenido editorial pueden asignarse
mediante URL HTTP(S) o archivo. Los binarios subidos se guardan en Supabase
Storage y PostgreSQL conserva sus URLs públicas y paths administrados.

No se usa `service_role`. La Server Action trabaja con el cliente Supabase SSR,
las cookies de la sesión administrativa y la publishable key existente.

## Arquitectura

- Bucket: `product-images`.
- Lectura: pública, porque las imágenes forman parte del catálogo público.
- Escritura: solo sesiones cuyo `auth.uid()` exista en `public.admin_users`.
- Paths: `products/<product-id>/...`, `combos/<combo-id>/...` y
  `storefront/<asset-key>/...`.
- Extensión: se deriva del MIME confirmado mediante magic bytes, nunca del
  nombre original ni solo del MIME declarado.
- Persistencia: URL pública estable devuelta por `getPublicUrl()`.
- Límite de aplicación: 2 MB.
- MIME permitidos: `image/webp`, `image/png` e `image/jpeg`.
- Server Actions aceptan `2.25mb` para incluir el archivo de 2 MB y el overhead
  de `multipart/form-data`; la validación de negocio continúa limitada a 2 MB.

El upload ocurre antes del insert/update de PostgreSQL. Si Storage falla, la DB
no cambia. Si el upload funciona y la escritura de DB falla, se intenta borrar
el objeto inmediatamente. Si ese delete también falla, se registra un evento
estructurado sin URL, token ni PII. No hay reintento persistente automático.

## Crear el bucket

1. Entrar al proyecto en Supabase Dashboard.
2. Abrir **Storage** y elegir **New bucket**.
3. Usar exactamente el nombre `product-images`.
4. Marcar el bucket como **Public**.
5. Configurar **File size limit** en `2 MB`.
6. Configurar **Allowed MIME types** con:
   - `image/webp`
   - `image/png`
   - `image/jpeg`
7. Guardar el bucket.

El límite y los MIME del bucket son defensa adicional. La aplicación vuelve a
validarlos en cliente y servidor.

## Policies

Ser una sesión `authenticated` no alcanza para escribir: en el futuro podría
haber clientes autenticados que no sean administradores. `admin_users` mantiene
RLS habilitado sin policies del Data API, por lo que las policies de Storage no
deben consultarla directamente.

Ejecutar el siguiente SQL desde **SQL Editor** con el propietario administrativo
del proyecto. La función vive en un schema no expuesto, usa nombres calificados
y solo devuelve si el usuario actual es administrador.

```sql
create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where auth_user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

drop policy if exists "admin writes managed storefront images" on storage.objects;
drop policy if exists "Public read product images" on storage.objects;
drop policy if exists "Admins insert product images" on storage.objects;
drop policy if exists "Admins update product images" on storage.objects;
drop policy if exists "Admins delete product images" on storage.objects;
drop policy if exists "Admins insert managed images" on storage.objects;
drop policy if exists "Admins update managed images" on storage.objects;
drop policy if exists "Admins delete managed images" on storage.objects;

create policy "Public read product images"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

create policy "Admins insert managed images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] in ('products', 'combos', 'storefront')
  and (select private.is_admin())
);

create policy "Admins update managed images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] in ('products', 'combos', 'storefront')
  and (select private.is_admin())
)
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] in ('products', 'combos', 'storefront')
  and (select private.is_admin())
);

create policy "Admins delete managed images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] in ('products', 'combos', 'storefront')
  and (select private.is_admin())
);
```

La aplicación actual crea paths únicos y usa `upsert: false`, por lo que solo
necesita `INSERT` para su flujo normal. Las policies de `UPDATE` y `DELETE`
permiten gestión administrativa futura sin abrir el bucket a cualquier usuario.

## Checklist administrativo

- Producto: subir archivo, usar URL y reemplazar la imagen.
- Combo: subir archivo, usar URL, agregar varias imágenes, cambiar principal,
  reordenar y eliminar.
- Contenido: reemplazar Hero, Builder y Mayoristas; quitar un asset y confirmar
  que se restaura su fallback.
- Seguridad: confirmar lectura pública y rechazo de escritura para una sesión
  autenticada que no figure en `admin_users`.

## URL externa y render

Las URLs externas deben usar `http://` o `https://`; se recomienda HTTPS. El
servidor no descarga ni inspecciona la URL para evitar SSRF. La preview la carga
el navegador y muestra un placeholder ante error.

El catálogo ya renderiza `imageUrl` con `<img>`. Se conserva esa estrategia para
admitir tanto la URL pública de Storage como hosts externos arbitrarios, sin
abrir `next/image.remotePatterns` globalmente. El admin usa `object-fit: contain`
para no deformar botellas ni recortes verticales.

## Deuda técnica

- Limpieza periódica de objetos huérfanos después de reemplazos o fallos de DB.
- Job persistente o garbage collector para reintentar deletes que fallen; por
  ahora solo hay cleanup inmediato best-effort y logging estructurado.
- Verificación automática de que ninguna URL está referenciada antes de borrar.
- Procesamiento de imagen, normalización a WebP y generación de variantes.
- Pruebas de integración contra un proyecto Supabase real para policies y
  fallos parciales.
- Extender `product_images` si los productos individuales requieren varias
  tomas; actualmente la galería normalizada está implementada para combos.
