export async function updateCategoryWithVersion(
  updateCategory: () => Promise<boolean>,
) {
  return (await updateCategory()) ? ("success" as const) : ("conflict" as const);
}
