import type { ProductType } from "@/types/domain";

export type CheckoutComponentRole = "miniature" | "mixer" | "glass" | "extra";

export type CheckoutProductLine = {
  type: "product";
  productId: string;
  quantity: number;
  displayedUnitPrice?: number;
};

export type CheckoutComboLine = {
  type: "combo";
  comboId: string;
  quantity: number;
  displayedUnitPrice?: number;
};

export type CheckoutCustomComboLine = {
  type: "custom_combo";
  components: {
    role: CheckoutComponentRole;
    productId: string;
    quantity: number;
  }[];
  quantity: number;
  displayedUnitPrice?: number;
};

export type CheckoutCartLine =
  | CheckoutProductLine
  | CheckoutComboLine
  | CheckoutCustomComboLine;

export type CheckoutCustomer = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

export type CheckoutFulfillment =
  | { type: "pickup" }
  | {
      type: "delivery";
      address: {
        street: string;
        number: string;
        locality: string;
        reference?: string;
      };
    };

export type CheckoutPayload = {
  checkoutAttemptId: string;
  accessToken: string;
  customer: CheckoutCustomer;
  fulfillment: CheckoutFulfillment;
  notes?: string;
  lines: CheckoutCartLine[];
};

export type OrderSnapshotComponent = {
  productId: string;
  name: string;
  productType: ProductType;
  quantity: number;
  unitPrice: number;
};

export type PresetComboConfigurationSnapshot = {
  version: 1;
  kind: "preset_combo";
  components: OrderSnapshotComponent[];
  referencePrice: number;
  promotionalPrice: number | null;
};

export type CustomComboConfigurationSnapshot = {
  version: 1;
  kind: "custom_combo";
  baseComponents: OrderSnapshotComponent[];
  extras: OrderSnapshotComponent[];
  individualBasePrice: number;
  extrasPrice: number;
  matchedCombo: { id: string; name: string } | null;
  savings: number;
};

export type OrderItemConfigurationSnapshot =
  | PresetComboConfigurationSnapshot
  | CustomComboConfigurationSnapshot;

export type ResolvedCheckoutLine = {
  lineIndex: number;
  itemType: "product" | "combo" | "custom_combo";
  referenceId: string | null;
  displayName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  configurationJson: OrderItemConfigurationSnapshot | null;
  priceChanged: boolean;
  previousUnitPrice: number | null;
};

export type ResolvedCheckout = {
  lines: ResolvedCheckoutLine[];
  subtotal: number;
  discountTotal: number;
  deliveryTotal: number;
  total: number;
  hasPriceChanges: boolean;
};

export type ResolvedStockRequirement = {
  productId: string;
  name: string;
  quantity: number;
};

export type CheckoutErrorCode =
  | "invalid_payload"
  | "empty_cart"
  | "product_not_found"
  | "product_unavailable"
  | "combo_not_found"
  | "combo_unavailable"
  | "invalid_custom_combo"
  | "insufficient_stock"
  | "invalid_money"
  | "price_changed"
  | "idempotency_conflict"
  | "payment_not_ready"
  | "rate_limited"
  | "order_not_created";

export type CheckoutFailure = {
  ok: false;
  code: CheckoutErrorCode;
  message: string;
  fieldErrors?: Record<string, string[]>;
  quote?: ResolvedCheckout;
  quoteHash?: string;
  correlationId?: string;
  retryAfterSeconds?: number;
};

export type CheckoutQuoteResult =
  | CheckoutFailure
  | { ok: true; quote: ResolvedCheckout; quoteHash: string };

export type CheckoutCreationResult =
  | CheckoutFailure
  | {
      ok: true;
      publicNumber: string;
      confirmationUrl: string;
      paymentUrl: string;
      reservationExpiresAt: string;
      alreadyCreated: boolean;
    };
