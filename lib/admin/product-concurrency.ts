export async function updateProductWithVersion(
  updateProduct: () => Promise<boolean>,
) {
  return (await updateProduct()) ? ("success" as const) : ("conflict" as const);
}
