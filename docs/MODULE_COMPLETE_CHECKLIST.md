# AquaERP — Enterprise Module Completion Checklist

Last updated after **20260531** full-feature enhancement pass.  
✅ Production-ready · 🟡 Wire `.env` to go live · ⬜ Phase 5 (Flutter, Kafka, blockchain)

---

## A. Authentication & Access Control
| Feature | Status |
|---------|--------|
| JWT + refresh + Remember me | ✅ |
| RBAC (50+ permissions) | ✅ |
| API tokens | ✅ |
| Audit logs | ✅ |
| Rate limiting | ✅ |
| MFA TOTP (enroll + confirm) | ✅ `/dashboard/settings/security` |
| Session list / revoke all | ✅ |
| Login alerts | ✅ |
| Google OAuth | ✅ `/api/auth/oauth/google` (set `GOOGLE_OAUTH_*`) |
| Keycloak SSO | ⬜ Phase 5 |

## B. Tenant & Store Management
| Feature | Status |
|---------|--------|
| Multi-tenant isolation | ✅ |
| Org signup → auto tenant | ✅ |
| Onboarding wizard | ✅ |
| Branding, VAT/TIN, currency | ✅ |
| Multi-branch | ✅ |
| Subscription plan display | ✅ |
| Tenant analytics API | ✅ `/api/v2/tenant/analytics` |
| Custom domain + DNS verify | ✅ `/dashboard/organization/domains`, `resolve-host` |

## C. E-Commerce & Marketplace
| Feature | Status |
|---------|--------|
| Product catalog + variants | ✅ |
| Shopping cart (auth) | ✅ |
| **Guest cart + checkout** | ✅ `/store/{slug}/cart` + public API |
| Checkout + coupons | ✅ |
| Wishlist, reviews, loyalty | ✅ |
| Multi-vendor + commissions + payouts | ✅ |
| M-Pesa Daraja STK (wallet + **guest** + **dashboard cart** + order pay) | 🟡 `MPESA_*` env → live; else stub |
| Stripe Payment Intents | 🟡 `STRIPE_SECRET_KEY` |
| Dynamic pricing (AI) | ✅ |
| 14 storefront themes | ✅ |
| Public storefront | ✅ |
| SEO sitemap | ✅ `app/sitemap.ts` |
| Order confirmation email | ✅ outbox on guest checkout |

## D. Inventory Management
| Feature | Status |
|---------|--------|
| Batches, FEFO, transfers, spoilage | ✅ |
| Traceability lots | ✅ |
| **Barcode / QR scan** | ✅ `/dashboard/inventory/scan` |

## E. Cold Storage — ✅ (full)

## F. Procurement
| Feature | Status |
|---------|--------|
| PR → RFQ → PO → GRN | ✅ |
| **Smart procurement suggestions** | ✅ `/api/v2/procurement/suggestions` |

## G. Sales & CRM
| Feature | Status |
|---------|--------|
| Customers, campaigns, segments | ✅ |
| Leads pipeline + **Kanban board** (drag stage) | ✅ `PATCH /api/v2/crm/leads/[id]` |
| **Sales tracking** (orders revenue, trends, top buyers/products) | ✅ `/dashboard/commerce/sales` · `GET /api/v2/commerce/sales` |
| Forward sales contracts | ✅ `/dashboard/commerce/contracts` |
| Campaign send | 🟡 SMTP/SMS env |

## H. Accounting & Finance — ✅ (payment intents 🟡)

## I. Fishing Operations — ✅

## J. Logistics & Delivery
| Feature | Status |
|---------|--------|
| Deliveries, POD, routes | ✅ |
| **Driver mobile PWA** | ✅ `/dashboard/mobile/delivery` |

## K. Human Resources — ✅

## L. Reporting & BI
| Feature | Status |
|---------|--------|
| Command center, KPIs, scheduled | ✅ |
| Commerce revenue analytics | ✅ (replaces deprecated investments) |
| Data warehouse | ⬜ Phase 5 |

## M. Mobile & Offline
| Feature | Status |
|---------|--------|
| PWA + offline page + bottom nav | ✅ |
| Native Flutter apps | ⬜ Phase 5 |

## N. API & Integrations
| Feature | Status |
|---------|--------|
| REST `/api/v2/*` + `/api/public/*` | ✅ |
| Government fisheries lookup | ✅ `/api/v2/integrations/fisheries` |
| IoT webhook | ✅ |
| ERP connectors | ⬜ Phase 5 |

## O. Notification Engine
| Feature | Status |
|---------|--------|
| In-app, preferences, workflows | ✅ |
| Email / SMS / WhatsApp | 🟡 channel env |
| **Push (FCM)** | 🟡 `FCM_SERVER_KEY` |

## P. AI & Automation
| Feature | Status |
|---------|--------|
| Forecast, pricing, fraud | ✅ |
| Chatbot (rules + **OpenAI** optional) | ✅ `OPENAI_API_KEY` |
| Smart procurement | ✅ |

## Q. Industry-Specific Gaps (seafood vertical)
| Feature | Status |
|---------|--------|
| Delivery slot scheduling | ✅ `/dashboard/commerce/delivery-slots` + guest checkout |
| Returns & refunds | ✅ `/dashboard/commerce/returns` |
| Abandoned cart recovery | ✅ API `POST /api/v2/commerce/abandoned-carts` |
| B2B wholesale tiers | ✅ `/dashboard/commerce/wholesale` |
| Unit conversion (kg/lb/ton) | ✅ `/api/v2/inventory/unit-conversions` |
| Landing quality inspection | ✅ `/dashboard/fishing/quality` |
| Cooperative revenue share | ✅ `/dashboard/fishing/cooperative` |
| Offline sync queue | ✅ fisherman PWA + `/api/v2/offline/sync` |
| Public traceability verify | ✅ `/api/public/traceability/verify` |
| Fishing zone weather | 🟡 `OPENWEATHER_API_KEY` |
| Vendor hub | ✅ `/dashboard/vendor` |
| Tenant audit trail UI | ✅ `/dashboard/admin/audit` |
| Driver / Fisherman PWAs | ✅ `/dashboard/mobile/*` |

See [`INDUSTRY_GAP_FEATURES.md`](INDUSTRY_GAP_FEATURES.md).

## R. Full-feature enhancements (20260531)
| Feature | Status |
|---------|--------|
| Subscription plan limits (enforcement helpers) | ✅ `lib/modules/tenant/plan-limits.ts` |
| Procurement 3-way match | ✅ `/dashboard/procurement/match` |
| Supplier scorecards (automated) | ✅ API `supplier-scorecards` |
| CRM RFM segmentation | ✅ `/dashboard/crm/segments` |
| CRM sales forecasting | ✅ `/dashboard/crm/forecast` |
| IFRS cash flow report | ✅ `report=cash_flow` |
| Shelf-life alert job | ✅ `POST /api/v2/inventory/expiry-alerts/run` |
| AI inventory reorder prediction | ✅ `/api/v2/ai/inventory` |
| Catch yield forecast | ✅ `/dashboard/fishing/forecast` |
| Custom domains UI | ✅ `/dashboard/organization/domains` |
| ERP / shipping connectors | ✅ `/api/v2/integrations/connectors` |
| Public store search & categories | ✅ `/api/public/store/{slug}/products` |
| Guest order portal | ✅ `/store/{slug}/account` |
| Returns CRUD UI | ✅ create + approve/refund |
| Wholesale tier CRUD UI | ✅ full form |
| Keycloak SSO | ⬜ Phase 5 |
| Native Flutter apps | ⬜ Phase 5 |

---

## Run migrations

```bash
mysql -u root -p aqualedger32 < database/schema.sql
node scripts/run-migrations.mjs
```

Includes through **`20260531_enterprise_enhancements.sql`**.

## Key environment variables

| Variable | Purpose |
|----------|---------|
| `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY` | Live STK push |
| `STRIPE_SECRET_KEY` | Card payments |
| `SMTP_*` | Email outbox |
| `SMS_API_KEY`, `WHATSAPP_API_KEY` | SMS / WhatsApp |
| `FCM_SERVER_KEY` | Push notifications |
| `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` | Google sign-in |
| `OPENAI_API_KEY` | LLM chatbot |
| `FISHERIES_GOV_API_URL`, `FISHERIES_GOV_API_KEY` | Government registry |
| `OPENWEATHER_API_KEY` | Fishing zone weather |
| `AFRICASTALKING_*` / `TWILIO_*` | SMS report delivery |
