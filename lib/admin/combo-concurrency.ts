export async function updateComboAndReplaceItems(
  updateCombo: () => Promise<boolean>,
  replaceItems: () => Promise<void>,
) {
  if (!(await updateCombo())) return "conflict" as const;

  await replaceItems();
  return "success" as const;
}
