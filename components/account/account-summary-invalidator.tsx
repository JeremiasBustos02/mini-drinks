"use client";

import { useEffect } from "react";

export function AccountSummaryInvalidator() {
  useEffect(() => {
    window.dispatchEvent(new Event("mini-account-summary-invalidated"));
  }, []);

  return null;
}
