# 25 - Imagenes del storefront

## Estrategia

Las imagenes administrables usan el bucket publico `product-images` y tres prefijos:

```text
product-images/
  products/<product-id>/<uuid>.<ext>
  combos/<combo-id>/<uuid>.<ext>
  storefront/<asset-key>/<uuid>.<ext>
```

No se usa `service_role`. Las subidas se realizan con el cliente SSR y la sesion del administrador. Storage debe permitir lectura publica y restringir `insert`, `update` y `delete` a usuarios que cumplan `private.is_admin()`.

El bloque SQL completo y único para crear la función y las cuatro policies está
en `docs/23_ADMIN_UI_AND_STORAGE.md`, sección **Policies**.

## Modelo de datos

`combo_images` contiene la galeria normalizada de cada combo:

- `id`
- `combo_id`
- `image_url`
- `storage_path`, solo para archivos administrados en Storage
- `alt`
- `sort_order`
- `is_primary`
- `created_at`

Existe una unica imagen principal por combo. `combos.image_url` se conserva durante la transicion y refleja la imagen principal. Las lecturas priorizan `combo_images` y usan la columna anterior como fallback.

`storefront_assets` contiene una imagen por slot editorial:

- `key`
- `image_url`
- `storage_path`
- `alt`
- `created_at`
- `updated_at`

Keys administradas:

- `hero`
- `combo_builder_promo`
- `wholesale`
- `packs`
- `gifts_events`

Si una fila no existe, la seccion conserva su composicion incluida en codigo. `hero` usa `/background-hero.webp` como fallback local.

## Formatos y peso

- WebP es el formato preferido.
- PNG se recomienda cuando hace falta transparencia.
- JPEG se acepta para fotografia editorial.
- El maximo tecnico es 2 MB por archivo.
- Objetivo recomendado: 150-500 KB para catalogo y 300-900 KB para editoriales.
- No se aceptan SVG, GIF, PDF ni AVIF desde el panel actual.

## Producto catalogo

- Medida: 1200x1600 px.
- Proporcion: 3:4.
- Fondo transparente o limpio.
- Producto completo, centrado y con margen interno parejo.
- Evitar sombras cortadas y texto incrustado.
- El storefront usa `object-contain`; no hace falta una foto distinta por viewport.

## Ficha

- Medida recomendada: 1600x2000 px.
- Mantener el producto completo dentro del encuadre.
- Para combos, cargar multiples tomas cuando existan: frente, packaging y detalle de componentes.
- La imagen principal alimenta cards y metadata; el resto aparece en thumbnails y lightbox.

## Builder

- Medida: 1200x1600 px.
- Fondo transparente.
- Margen interno generoso alrededor del producto.
- La interfaz aplica una inclinacion visual de 20 grados; no subir archivos ya rotados.
- El recorte del panel puede tocar aire transparente, pero no debe cortar marca, tapa o base.

## Hero

- Fotografia lifestyle/editorial.
- Proporcion objetivo: 4:5 si la composicion se concentra en el centro-derecha; se admite horizontal si respeta safe areas.
- Resolucion minima: 1600 px en el lado largo.
- Safe area: mantener el sujeto principal en el 55% central y evitar informacion esencial en los bordes.
- El copy vive fuera de la imagen, pero mobile usa un recorte mas vertical.

## Mayoristas

- Fotografia editorial horizontal.
- Proporcion: 4:3 o 16:10.
- Minis y combos ordenados, con lectura clara aun en un bloque pequeno.
- Evitar texto incrustado y fondos demasiado oscuros.

## Packs

- Composicion limpia del pack completo.
- Preferir horizontal amplio, con todos los elementos separados del borde.
- Fondo transparente o superficie neutra.

## Regalos y eventos

- Fotografia lifestyle luminosa.
- Mostrar caja, entrega, mesa o repeticion de packs.
- Mantener una zona tranquila para que el overlay de texto siga legible.
- Evitar escenas nocturnas con bajo contraste.

## Operacion

- Los uploads se realizan de a uno para respetar el limite multipart del Server Action.
- Reemplazar o quitar un archivo administrado intenta eliminar el objeto anterior de Storage.
- Una URL externa solo se valida por sintaxis HTTP(S); no se descarga desde el servidor.
- Si Storage acepta un archivo pero falla la escritura en PostgreSQL, se intenta eliminar inmediatamente. Si ese delete falla, se registra un evento estructurado sin URL ni token.
- No borrar `combos.image_url` hasta completar y verificar la transicion de todos los entornos.
