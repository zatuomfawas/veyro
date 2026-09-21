// The React binding. Everything it does is in ../index; this is the button.

import { useCallback, useRef, useState } from "react";
import { openCheckout, type VeyroError, type VeyroOptions } from "./index";

export type VeyroCheckoutProps = VeyroOptions & {
  /** The product to sell, copied from your Veyro dashboard. */
  productId: string;
  /** Called once the payment is recorded against your account. */
  onSuccess?: (transactionId: string) => void;
  /** Called if it could not start, or the customer closed the window. */
  onError?: (error: VeyroError) => void;
  /** Button text. Defaults to "Buy now". */
  children?: React.ReactNode;
  className?: string;
  /** Shown while the customer is paying. Defaults to "Waiting for payment…". */
  pendingLabel?: string;
  disabled?: boolean;
};

export function VeyroCheckout({
  productId, onSuccess, onError, children, className, pendingLabel, disabled, ...options
}: VeyroCheckoutProps) {
  const [busy, setBusy] = useState(false);
  // Holds the open checkout so a second click cannot start a second payment.
  const active = useRef<{ cancel: () => void } | null>(null);

  const onClick = useCallback(() => {
    if (active.current) return;
    setBusy(true);
    // Not awaited: openCheckout must run synchronously inside the click or the
    // browser blocks the window it opens.
    const handle = openCheckout(productId, options);
    active.current = handle;
    handle.done
      .then((r) => onSuccess?.(r.transactionId))
      .catch((e) => onError?.(e as VeyroError))
      .finally(() => { active.current = null; setBusy(false); });
  }, [productId, onSuccess, onError, options]);

  return (
    <button type="button" onClick={onClick} className={className} disabled={disabled || busy} aria-busy={busy || undefined}>
      {busy ? (pendingLabel ?? "Waiting for payment…") : (children ?? "Buy now")}
    </button>
  );
}
