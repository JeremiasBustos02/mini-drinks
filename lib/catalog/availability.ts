export type StockComponent = {
  stock: number;
  quantity: number;
  available?: boolean;
};

export type ProductStockComponent = StockComponent & {
  productId: string;
};

export function getDerivedComboStock(components: StockComponent[]) {
  if (components.length === 0) return 0;

  return Math.min(
    ...components.map(({ stock, quantity, available = true }) =>
      available && Number.isInteger(quantity) && quantity > 0 ? Math.floor(stock / quantity) : 0,
    ),
  );
}

export function getDerivedProductStock(components: ProductStockComponent[]) {
  const grouped = new Map<string, StockComponent>();

  for (const component of components) {
    const current = grouped.get(component.productId);

    grouped.set(component.productId, {
      stock: current ? Math.min(current.stock, component.stock) : component.stock,
      quantity: (current?.quantity ?? 0) + component.quantity,
      available: (current?.available ?? true) && (component.available ?? true),
    });
  }

  return getDerivedComboStock([...grouped.values()]);
}
