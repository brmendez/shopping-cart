# Provisions

**A little of everything, restocked every two minutes.**

A small full-stack shop built around one idea: stock is real and it runs out. A few items start with only 3 units, so you can sell them out, watch the "Back in 1:42" countdown, and see them come back on the next drop. Checkout takes real (test-mode) card payments through Stripe.

<!-- Live demo: add the Render URL here once deployed -->

## Try it

1. Grab something from **Going fast** before it sells out.
2. Check out with Stripe's test card: `4242 4242 4242 4242`, any future date, any CVC.
3. Watch the stock drop, then come back when the countdown hits zero.

## What's interesting

- **Stock that behaves like stock.** Adding to cart checks availability, but stock only drops when an order is paid. A Postgres function locks the rows, so two buyers can't both get the last unit.
- **Timed restocks with no server job.** `pg_cron` runs inside Supabase and resets stock every 2 minutes. The UI counts down to the next drop and refreshes itself when it lands.
- **Payments done properly.** The server prices the cart (never the browser), creates a pending order, and only marks it paid after verifying the payment with Stripe. If an item sells out while you're paying, you're refunded automatically.
- **Safe to retry.** Confirming an order twice is harmless. Refreshing the confirmation page doesn't double-charge stock.
- **Calm, considered UI.** Live stock badges, a cart drawer, a product detail sheet with a gallery, and clear button states ("Added", "All in your cart", "Sold out · Back in 1:42").

## How checkout works

```
Cart ──► /checkout ──► pending order + Stripe PaymentIntent (server-priced)
                           │
                     card form (Stripe Elements)
                           │
         /order/:id ──► server verifies payment with Stripe
                           ├─ in stock  → lower stock, mark paid, clear cart
                           └─ sold out  → refund, mark refunded
```

## Stack

| | |
|---|---|
| **Client** | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, React Router |
| **Server** | Node + Express |
| **Database** | Supabase (Postgres), row-level security, `pg_cron` |
| **Payments** | Stripe (Payment Element, PaymentIntents, refunds) |

Product data is seeded from [DummyJSON](https://dummyjson.com).

## Run it locally

You'll need Node 22+, a free [Supabase](https://supabase.com) project and a [Stripe](https://stripe.com) account in test mode (sandbox).

1. **Database:** in the Supabase SQL editor, run [`server/db/schema.sql`](server/db/schema.sql). It creates the tables, functions, permissions and the restock job.
2. **Env files:** copy the examples and fill them in.
   ```bash
   cp server/.env.example server/.env   # Supabase keys + STRIPE_SECRET_KEY
   cp client/.env.example client/.env   # VITE_STRIPE_PUBLISHABLE_KEY
   ```
3. **Server** (http://localhost:3001):
   ```bash
   cd server && npm install
   npm run seed   # loads the products
   npm run dev
   ```
4. **Client** (http://localhost:5173):
   ```bash
   cd client && npm install && npm run dev
   ```

## Known trade-offs

- **No webhook.** Payment is confirmed when you land on the order page. If someone pays and closes the tab first, the order stays pending. A Stripe webhook calling the same confirm step would close that gap.
- **No accounts.** Each browser gets a random cart ID stored locally. Orders can only be viewed with the cart that placed them.
