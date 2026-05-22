# Communications & report delivery

## Channels

| Channel | Configuration |
|---------|----------------|
| **Email** | `EMAIL_PROVIDER` = `smtp` \| `resend` \| `sendgrid` (auto-detect if unset) |
| **SMS** | Africa's Talking (`SMS_API_KEY`, `AFRICASTALKING_USERNAME`) or Twilio |
| **WhatsApp** | `WHATSAPP_API_URL` + token (see `lib/channels/whatsapp.ts`) |
| **Webhook** | Tenant webhook endpoints under Integrations |
| **In-app** | Notification outbox + dashboard inbox |

## Email providers

### SMTP (Gmail, Office 365, custom)

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=reports@yourco.com
```

### Resend

```
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
RESEND_FROM=reports@yourco.com
RESEND_API_BASE_URL=https://api.resend.com
```

### SendGrid

```
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG...
SENDGRID_FROM=reports@yourco.com
```

## Report delivery flow

1. **Reports hub** (`/dashboard/analytics/reports`) — send now with CSV/HTML/JSON attachment + 7-day share link
2. **Scheduled reports** — daily / weekly / monthly via `scheduled_reports` + cron or **Run due schedules**
3. **Communications** (`/dashboard/communications`) — tenant branding, templates, BCC defaults, message log
4. **CRM campaigns** — `POST /api/v2/crm/campaigns/{id}/send` uses branded templates

## API

| Endpoint | Purpose |
|----------|---------|
| `POST /api/v2/analytics/reports` `action: deliver` | Multi-channel report send |
| `POST /api/v2/analytics/reports/deliveries/{id}/retry` | Retry failed delivery |
| `GET /api/v2/analytics/reports?view=config` | Catalog + tenant comm defaults |
| `PUT /api/v2/communications/settings` | Brand, reply-to, default recipients |
| `GET/PATCH /api/v2/communications/templates` | Email templates with `{{variables}}` |
| `POST /api/v2/communications/messages` | Ad-hoc email/SMS/WhatsApp |

## Templates

Default keys: `report_delivery`, `alert_coldchain`, `crm_campaign`. Variables include `{{brand}}`, `{{reportTitle}}`, `{{periodStart}}`, `{{periodEnd}}`, `{{shareUrl}}`, `{{rowCount}}`, `{{standards}}`.

## Standards

- UTF-8 CSV with BOM for Excel
- HTML emails with tenant gradient header
- ISO 8601 date periods in report metadata
- Delivery audit in `report_deliveries` and `communication_messages`
