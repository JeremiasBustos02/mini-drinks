const arsFormatter = new Intl.NumberFormat("es-AR", {
  currency: "ARS",
  maximumFractionDigits: 0,
  style: "currency",
});

export function formatArsCents(cents: number) {
  // Prices remain integer cents; only the displayed peso value is rounded.
  return arsFormatter.format(Math.floor((cents + 50) / 100));
}
