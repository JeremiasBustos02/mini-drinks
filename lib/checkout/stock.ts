export type StockRequirement = {
  productId: string;
  name: string;
  required: number;
  stock: number;
};

export function addStockRequirement(
  requirements: Map<string, StockRequirement>,
  product: { id: string; name: string; stock: number },
  componentQuantity: number,
  lineQuantity: number,
) {
  const consumed = componentQuantity * lineQuantity;
  const current = requirements.get(product.id);

  if (!Number.isSafeInteger(consumed) || consumed <= 0) {
    throw new Error("invalid_stock_requirement");
  }

  requirements.set(product.id, {
    productId: product.id,
    name: product.name,
    required: (current?.required ?? 0) + consumed,
    stock: product.stock,
  });

  if (!Number.isSafeInteger(requirements.get(product.id)!.required)) {
    throw new Error("invalid_stock_requirement");
  }
}

export function findInsufficientStock(requirements: Iterable<StockRequirement>) {
  return [...requirements].filter(
    ({ required, stock }) => !Number.isInteger(stock) || stock < 0 || required > stock,
  );
}
