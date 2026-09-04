# 25 — Imágenes del storefront

## Criterio general

Priorizar fotografías claras, luminosas y con contraste contra fondos crema, blanco o verde. Evitar escenas de bar oscuro, madera, humo y botellas grandes. Reservar área libre para texto cuando la imagen conviva con copy.

## Home

| Sección | Lugar en código | Proporción recomendada | Tipo de imagen |
| --- | --- | --- | --- |
| Hero | `components/home/hero.tsx` | 4:3 horizontal | Recorte de producto y packaging sobre fondo gráfico o transparente. Dejar aire en un lateral. |
| Combos destacados | Datos de combo, `imageUrl` | 3:4 vertical | Recorte de combo armado, preferentemente fondo transparente o liso. |
| Armá tu combo | `components/home/combo-builder-promo.tsx` | 4:3 horizontal | Recorte de miniaturas, mixer y vaso. No lifestyle. |
| Sorpresa | `components/home/surprise-section.tsx` | 1:1 o 4:3 | Unboxing o tarjeta/sticker en mano; composición editorial. |
| Regalos | `components/home/gifts-events.tsx` | 4:5 vertical | Lifestyle luminoso: caja o pack entregado/en mano. Mantener espacio abajo para el badge. |
| Eventos | `components/home/gifts-events.tsx` | 4:5 vertical | Lifestyle de mesa, souvenirs o repetición de packs; no fiesta nocturna. |
| Mayoristas | `components/home/wholesale-cta.tsx` | 4:3 horizontal | Foto de producto para reventa: minis y combos ordenados en mostrador o estante. Reemplaza `wholesale-visual`. |

## Catálogo y fichas

| Sección | Lugar en código | Proporción recomendada | Tipo de imagen |
| --- | --- | --- | --- |
| Card de producto o combo | `imageUrl` de catálogo, `components/products/product-visual.tsx` | 3:4 vertical | Recorte frontal de producto con fondo transparente o plano. Sin texto incrustado. |
| Ficha de producto | `components/products/product-detail.tsx` | 3:4 vertical | Misma imagen principal del catálogo, en mayor resolución. Opcional segunda toma de packaging o componentes. |
| Relacionados | `components/products/related-products.tsx` | 3:4 vertical | Reutilizar el recorte de card para consistencia y carga estable. |

## Entrega de assets

- Exportar WebP o AVIF cuando sea posible, con JPEG como alternativa de origen.
- Hero y Mayoristas: mínimo 1600 px en el lado largo.
- Cards y fichas: mínimo 1200 px de alto para sostener pantallas retina.
- Mantener el producto entero visible y evitar márgenes transparentes excesivos.
- Cargar una imagen real en `imageUrl` reemplaza las ilustraciones CSS de fallback actuales.
