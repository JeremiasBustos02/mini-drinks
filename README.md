# Mini Drinks

Base frontend mobile-first para una tienda de mini bebidas, combos y accesorios.

## Stack

- Next.js con App Router
- TypeScript estricto
- Tailwind CSS
- Fuentes Bowlby One SC y Roboto mediante `next/font`

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Verificación

```bash
npm run lint
npm run typecheck
npm run build
```

## Alcance actual

Esta etapa implementa la base técnica, el sistema visual inicial y una Home
estática con placeholders de producto. No incluye base de datos, autenticación,
carrito, checkout ni lógica backend.

La carpeta `docs/` es la fuente de verdad del producto. Ante diferencias de
alcance, se aplica el orden de prioridad definido por la documentación, con
`13_MVP_AUDIT.md` y `14_PRODUCT_RULES.md` como referencias principales.
