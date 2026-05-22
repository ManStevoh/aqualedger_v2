# AquaERP Reporting & Notification Standards

## Report catalog (10 types)

| ID | Standards |
|----|-----------|
| `kpi-summary` | ISO 8601, UTF-8 CSV BOM |
| `executive-summary` | IFRS management reporting |
| `traceability` | EU 1224/2009, MSC |
| `financial` | IFRS, ISO 4217 |
| `profit-loss` | IFRS IAS 1 |
| `trial-balance` | Double-entry GAAP-ready |
| `commerce-orders` | PCI metadata only |
| `coldchain-compliance` | HACCP, FSMA |
| `procurement` | ISO 9001 supplier trace |
| `fishing-operations` | FAO area codes |

## Export formats

- **CSV** — RFC 4180, UTF-8 BOM (Excel international)
- **HTML** — WCAG tables, print-friendly, GDPR footer
- **JSON** — machine-readable API integration

## Delivery channels

| Channel | Implementation |
|---------|----------------|
| **Email** | SMTP, Resend, or SendGrid + branded HTML + attachment (`lib/channels/email.ts`, `docs/COMMUNICATIONS.md`) |
| **SMS** | Africa's Talking or Twilio (`SMS_API_KEY`, `AFRICASTALKING_*`, `TWILIO_*`) |
| **WhatsApp** | Outbox + gateway env |
| **Webhook** | HMAC-SHA256 `X-AquaERP-Signature` (`lib/modules/integrations/webhook-dispatch.ts`) |
| **Share link** | Token URL `/api/public/reports/share/{token}` · 7-day default expiry |

## APIs

- `GET /api/v2/analytics/reports` — catalog
- `GET /api/v2/analytics/reports?view=deliveries` — delivery log
- `POST /api/v2/analytics/reports` — `action: deliver` or download body
- `GET /api/v2/analytics/export?type=&format=&periodDays=`
- `POST /api/v2/analytics/reports/run-scheduled` — cron / manual
- `GET /api/public/reports/share/{token}?format=csv|html|json`

## Webhook events

Subscribe endpoints to: `report.kpi.generated`, `report.traceability.generated`, `report.financial.generated`, or `report.*`

## UI

- **Reports hub** — `/dashboard/analytics/reports`
- **Scheduled** — `/dashboard/analytics/scheduled`
- **Process queue** — Notifications page runs outbox + scheduled reports

## Environment

```
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM — or RESEND_API_KEY / SENDGRID_API_KEY (see COMMUNICATIONS.md)
SMS_API_KEY
AFRICASTALKING_USERNAME, AFRICASTALKING_API_KEY
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM
WEBHOOK_SIGNING_SECRET
NEXT_PUBLIC_APP_URL
```

## Migration

`database/migrations/20260529_reporting_delivery.sql`
