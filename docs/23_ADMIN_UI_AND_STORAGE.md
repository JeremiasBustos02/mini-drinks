# 23 - Admin UI y Supabase Storage

## Alcance

Las imágenes de producto pueden asignarse desde `/admin/productos` mediante una
URL HTTP(S) o un archivo. PostgreSQL conserva solamente `products.image_url`;
los binarios subidos se guardan en Supabase Storage.

No se usa `service_role`. La Server Action trabaja con el cliente Supabase SSR,
las cookies de la sesión administrativa y la publishable key existente.

## Arquitectura

- Bucket: `product-images`.
- Lectura: pública, porque las imágenes forman parte del catálogo público.
- Escritura: solo sesiones cuyo `auth.uid()` exista en `public.admin_users`.
- Path: `products/<product-id>/<uuid>.<extension>`.
- Extensión: se deriva del MIME validado, nunca del nombre original.
- Persistencia: URL pública estable devuelta por `getPublicUrl()`.
- Límite de aplicación: 2 MB.
- MIME permitidos: `image/webp`, `image/png` e `image/jpeg`.
- Server Actions aceptan `2.25mb` para incluir el archivo de 2 MB y el overhead
  de `multipart/form-data`; la validación de negocio continúa limitada a 2 MB.

El upload ocurre antes del insert/update de PostgreSQL. Si Storage falla, la DB
no cambia. Si el upload funciona y la escritura de DB falla, la acción informa
que puede haber quedado un objeto huérfano. No se elimina automáticamente la
imagen anterior al reemplazarla.

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

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

drop policy if exists "Admins insert product images" on storage.objects;
create policy "Admins insert product images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = 'products'
  and (select private.is_admin())
);

drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = 'products'
  and (select private.is_admin())
)
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = 'products'
  and (select private.is_admin())
);

drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = 'products'
  and (select private.is_admin())
);
```

La aplicación actual crea paths únicos y usa `upsert: false`, por lo que solo
necesita `INSERT` para su flujo normal. Las policies de `UPDATE` y `DELETE`
permiten gestión administrativa futura sin abrir el bucket a cualquier usuario.

## Cómo probar

1. Confirmar que el UUID del usuario de prueba existe en `admin_users`.
2. Iniciar sesión en `/admin/login`.
3. Abrir un producto existente o crear uno nuevo.
4. En **Imagen del producto**, elegir **Subir archivo**.
5. Probar un WebP menor a 2 MB y guardar.
6. Verificar el mensaje de éxito en el admin.
7. Abrir Storage y comprobar el objeto bajo `products/<product-id>/`.
8. Copiar su public URL y comprobar que abre sin sesión.
9. Verificar la miniatura en `/admin/productos`, `/productos`, la ficha y el
   constructor cuando el tipo corresponda.
10. Repetir con PNG y JPG.
11. Confirmar que PDF, GIF y archivos mayores a 2 MB se rechazan antes de enviar.
12. Probar reemplazar archivo por URL, URL por archivo y quitar la imagen.
13. Iniciar sesión con un usuario Auth que no esté en `admin_users`: el panel y
    la Server Action deben rechazarlo, y una llamada directa a Storage debe
    fallar por policy.

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
- Verificación automática de que ninguna URL está referenciada antes de borrar.
- Procesamiento de imagen, normalización a WebP y generación de variantes.
- Pruebas de integración contra un proyecto Supabase real para policies y
  fallos parciales.
- Eventual galería de múltiples imágenes; el modelo actual mantiene una URL por
  producto.
