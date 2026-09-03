const arsFormatter = new Intl.NumberFormat("es-AR", {
  currency: "ARS",
  maximumFractionDigits: 0,
  style: "currency",
});

export function formatArsCents(cents: number) {
  // Prices remain integer cents; only the displayed peso value is rounded.
  return arsFormatter.format(Math.floor((cents + 50) / 100));
}

export function formatArsInput(cents: number) {
  if (!Number.isSafeInteger(cents) || cents < 0) {
    throw new Error("El importe en centavos debe ser un entero seguro no negativo.");
  }

  const pesos = Math.floor(cents / 100);
  const remainder = cents % 100;
  return remainder === 0 ? String(pesos) : `${pesos},${String(remainder).padStart(2, "0")}`;
}

export function parseArsToCents(value: string) {
  const normalized = value.trim().replace(/\s/g, "");
  const match = /^(0|[1-9]\d*)(?:[,.](\d{1,2}))?$/.exec(normalized);

  if (!match) {
    throw new Error("Ingresá un importe válido en pesos, con hasta dos decimales.");
  }

  const pesos = Number(match[1]);
  const decimalPart = (match[2] ?? "").padEnd(2, "0");
  const cents = pesos * 100 + Number(decimalPart || 0);

  if (!Number.isSafeInteger(cents)) {
    throw new Error("El importe supera el máximo permitido.");
  }

  return cents;
}
