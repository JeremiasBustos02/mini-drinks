export type StockComponent = {
  stock: number;
  quantity: number;
  available?: boolean;
};

export function getDerivedComboStock(components: StockComponent[]) {
  if (components.length === 0) return 0;

  return Math.min(
    ...components.map(({ stock, quantity, available = true }) =>
      available && Number.isInteger(quantity) && quantity > 0 ? Math.floor(stock / quantity) : 0,
    ),
  );
}
