# M-Pesa Daraja (sandbox & production)

## Quick wire (local)

```bash
npm run mpesa:wire    # sets MPESA_ENV + MPESA_CALLBACK_URL from NEXT_PUBLIC_APP_URL
# Add Daraja keys to .env, then:
npm run mpesa:check
```

## Environment

```env
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=https://your-public-host/api/payments/mpesa/callback
MPESA_TEST_PHONE=2547XXXXXXXX
MPESA_TEST_AMOUNT=1
```

Without `MPESA_*` credentials, STK runs in **stub mode** and auto-completes (`MPESA_STUB_AUTO_COMPLETE`, default `true`).

## Flow

1. **STK** — `POST /api/v2/payments/mpesa` or wallet deposit with `paymentMethod: mpesa`
2. **Callback** — Safaricom posts to `/api/payments/mpesa/callback` (public, no JWT)
3. **Wallet credit** — On `ResultCode: 0`, `payment_intents` → `completed` and wallet balance updated when `metadata.purpose = wallet_deposit`

## Local development

Expose your app with ngrok (or similar) and set:

`MPESA_CALLBACK_URL=https://xxxx.ngrok-free.app/api/payments/mpesa/callback`

Test from **Integrations** → M-Pesa → **Test** (uses `MPESA_TEST_PHONE`).

## Wallet UI

`/dashboard/wallet` → Deposit → M-Pesa sends STK and polls intent status until credited.
