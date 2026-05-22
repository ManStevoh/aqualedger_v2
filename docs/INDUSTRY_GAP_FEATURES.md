# Industry Gap Features (beyond original blueprint)

Features required for a world-class seafood vertical SaaS but not explicitly in early docs — now implemented.

| Feature | Why needed | Path |
|---------|------------|------|
| Delivery slot scheduling | Cold-chain seafood needs timed delivery | `/dashboard/commerce/delivery-slots`, public API |
| Order returns/refunds | EU consumer rights, spoilage claims | `/dashboard/commerce/returns` |
| Abandoned cart recovery | E-commerce revenue recovery | `POST /api/v2/commerce/abandoned-carts` |
| B2B wholesale tiers | Restaurants/exporters buy by kg | `/dashboard/commerce/wholesale` |
| Weight unit conversion | International trade lb/kg/ton | `/api/v2/inventory/unit-conversions` |
| Landing quality inspection | Grade A/B/C at landing | `/dashboard/fishing/quality` |
| Cooperative revenue share | Fisher cooperatives profit split | `/dashboard/fishing/cooperative` |
| Offline sync queue | Coastal low-network operations | `/dashboard/mobile/fisherman`, `/api/v2/offline/sync` |
| Public traceability verify | Buyer/regulator proof | `/api/public/traceability/verify?lot=&tenant=` |
| Fishing zone weather | Safety & trip planning | `/api/v2/fishing-ops/weather` |
| Vendor dashboard | Marketplace seller hub | `/dashboard/vendor` |
| Audit trail UI | SOC2/GDPR accountability | `/dashboard/admin/audit` |
| Driver + Fisherman PWAs | Mobile-first without Flutter | `/dashboard/mobile/*` |

Migration: `20260530_industry_gaps.sql`
