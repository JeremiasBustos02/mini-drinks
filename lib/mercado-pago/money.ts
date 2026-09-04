export function centsToMercadoPagoAmount(cents: number) {
  if (!Number.isSafeInteger(cents) || cents <= 0) {
    throw new Error("Mercado Pago amounts require positive safe integer cents.");
  }
  return Number(`${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`);
}

export function mercadoPagoAmountToCents(amount: number) {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Invalid Mercado Pago amount.");
  }
  const cents = Math.round(amount * 100);
  if (!Number.isSafeInteger(cents) || Math.abs(amount - cents / 100) > 1e-9) {
    throw new Error("Mercado Pago amount has unsupported precision.");
  }
  return cents;
}
