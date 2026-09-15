"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn } from "@/app/_ui/form";

// DELETE /api/me revokes the session server-side, so the cookie is not the only
// thing standing between a copied session and the account.
export default function SignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <Btn
      type="button"
      variant="q"
      size="sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await fetch("/api/me", { method: "DELETE" });
        } finally {
          router.push("/");
          router.refresh();
        }
      }}
    >
      {busy ? "Signing out…" : "Sign out"}
    </Btn>
  );
}
