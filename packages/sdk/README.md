# @veyro/sdk

Take payments in your app. One product ID, one button.

```bash
npm install @veyro/sdk
```

```tsx
import { VeyroCheckout } from "@veyro/sdk/react";

<VeyroCheckout productId="your-product-id" onSuccess={(id) => console.log(id)} />
```

Not using React:

```js
import { openCheckout } from "@veyro/sdk";

button.addEventListener("click", () => {
  openCheckout("your-product-id", {
    onSuccess: (transactionId) => { /* … */ },
    onError: (e) => console.error(e.message, e.fixPrompt),
  });
});
```

Card details are entered on Stripe's own checkout page, hosted by Veyro. They
never reach your site or your server, which is why this package has no
dependencies and asks for no keys.

Full guide: https://withveyro.com/docs/sdk
