import type { OrderItemType, ProductType } from "@/types/domain";

export const productTypeLabels: Record<ProductType, string> = {
  miniature: "Miniatura",
  mixer: "Mixer",
  glass: "Vaso",
  extra: "Extra",
  accessory: "Accesorio",
  supply: "Insumo",
};

export const orderItemTypeLabels: Record<OrderItemType, string> = {
  product: "Producto",
  combo: "Combo preset",
  custom_combo: "Combo personalizado",
  pack: "Pack",
};

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

export function formatAdminDateTime(value: Date | null) {
  return value ? dateTimeFormatter.format(value) : "No registrado";
}
