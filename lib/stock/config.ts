const DEFAULT_STOCK_RESERVATION_MINUTES = 15;

export function getStockReservationMinutes(value = process.env.STOCK_RESERVATION_MINUTES) {
  if (value === undefined || value.trim() === "") return DEFAULT_STOCK_RESERVATION_MINUTES;
  const minutes = Number(value);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 120) {
    throw new Error("STOCK_RESERVATION_MINUTES must be an integer between 1 and 120.");
  }
  return minutes;
}

export function getReservationExpiresAt(now = new Date(), minutes = getStockReservationMinutes()) {
  return new Date(now.getTime() + minutes * 60_000);
}
