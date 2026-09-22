"use client";

// Tells the server this checkout page was opened. Renders nothing.
//
// Mounted only when the product is actually purchasable, so the denominator of
// the conversion rate holds views a sale could have come from.
//
// Deduplicated per browser session, in the browser. One person opening a link,
// reading it, reloading and then paying is one view, not three, which keeps
// "conversion" close to "how many people who looked went on to buy". The key is
// per product, so a founder's two products are counted separately.
//
// sessionStorage, not localStorage: coming back tomorrow is a new look and
// should count again. And it is wrapped, because Safari's private mode and
// blocked site data both make the accessor throw — in that case the view is
// recorded without dedupe, which is a slightly high count rather than a broken
// page.

import { useEffect } from "react";

export default function RecordView({
  founderId, productId,
}: {
  founderId: string;
  productId: string;
}) {
  useEffect(() => {
    const key = `veyro-viewed:${productId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // No session storage available. Fall through and count it.
    }

    // keepalive so the request survives the customer clicking through
    // immediately; the response is empty and nothing waits on it.
    fetch(`/api/pay/${founderId}/${productId}/view`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {
      // A dropped beacon is a missing count, never a visible failure.
    });
  }, [founderId, productId]);

  return null;
}
