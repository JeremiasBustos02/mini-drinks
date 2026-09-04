export type CheckoutQuoteDraft = {
  hasLines: boolean;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  fulfillment: "pickup" | "delivery";
  address?: {
    street: string;
    number: string;
    locality: string;
  };
};

export type CheckoutQuoteUiState =
  | "incomplete"
  | "validating"
  | "valid"
  | "price_changed"
  | "error";

function hasValue(value: string) {
  return value.trim().length > 0;
}

export function isCheckoutReadyForQuote(draft: CheckoutQuoteDraft) {
  const hasCustomer = Object.values(draft.customer).every(hasValue);
  const hasValidPhone = /^[+\d][\d\s().-]{5,39}$/.test(draft.customer.phone.trim());
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.customer.email.trim());
  if (!draft.hasLines || !hasCustomer || !hasValidPhone || !hasValidEmail) return false;
  if (draft.fulfillment === "pickup") return true;

  return Boolean(
    draft.address &&
      hasValue(draft.address.street) &&
      hasValue(draft.address.number) &&
      hasValue(draft.address.locality),
  );
}

export function isCurrentCheckoutQuote(quoteSignature: string, currentSignature: string) {
  return quoteSignature === currentSignature;
}

export function isLatestQuoteRequest(requestId: number, latestRequestId: number) {
  return requestId === latestRequestId;
}

export function getCheckoutQuoteUiState({
  ready,
  hasQuote,
  hasPriceChanges,
  hasError,
}: {
  ready: boolean;
  hasQuote: boolean;
  hasPriceChanges: boolean;
  hasError: boolean;
}): CheckoutQuoteUiState {
  if (!ready) return "incomplete";
  if (hasError) return "error";
  if (!hasQuote) return "validating";
  return hasPriceChanges ? "price_changed" : "valid";
}
