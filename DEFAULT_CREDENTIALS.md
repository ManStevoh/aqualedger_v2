# 🔑 AquaLedger V2 - Default Seed Credentials

This document lists the default seed user accounts created during database setup. These credentials can be used for local development, testing, and team review.

> [!WARNING]
> These credentials are for local development and testing purposes only. Change these passwords immediately in production.

---

## 👥 Seeded User Accounts (Core Monolith)

These accounts are created via the standard seeder scripts:

| Role | Name | Email Address | Default Password | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Admin User | `admin@aqualedger.co.ke` | `Admin@123` | `active` |
| **Investor** | John Investor | `investor@test.com` | `Test@123` | `active` |
| **Boat Owner** | Mary Boat | `boatowner@test.com` | `Test@123` | `active` |
| **Fisherman** | Peter Fisher | `fisherman@test.com` | `Test@123` | `active` |
| **Fish Buyer** | Jane Buyer | `buyer@test.com` | `Test@123` | `active` |
| **BMU Official** | Samuel BMU | `bmu@test.com` | `Test@123` | `active` |

---

## 🏢 Demo Tenant Accounts (Enterprise Multi-Tenant ERP)

These accounts are provisioned via the enterprise demo tenant seeder for testing workflows across different organizational roles and modules (commerce, CRM, HR, accounting, logistics, etc.).

* **Default Password for All Demo Accounts**: `Demo@123`
* **Shared Buyer**: `buyer@demo.aquaerp.local` (Accesses the public marketplace storefronts)
* **Tenant Owners**: `owner-{slug}@demo.aquaerp.local` (Full owner access to the specific tenant's `/dashboard`)

### 📌 Selected Demo Tenant Slugs & Subdomains

| Tenant Name | Slug | Subdomain / Local URL | Owner Email Address | Business Type |
| :--- | :--- | :--- | :--- | :--- |
| **Coast Fish Cooperative** | `coastfish` | `http://coastfish.localhost:3000` | `owner-coastfish@demo.aquaerp.local` | cooperative |
| **Lamu Sea Ventures** | `lamusea` | `http://lamusea.localhost:3000` | `owner-lamusea@demo.aquaerp.local` | fisherman |
| **Kilifi Processors Ltd** | `kilifiprocess` | `http://kilifiprocess.localhost:3000` | `owner-kilifiprocess@demo.aquaerp.local` | processor |
| **Mombasa Marine Market** | `mombasamarine` | `http://mombasamarine.localhost:3000` | `owner-mombasamarine@demo.aquaerp.local` | market |
| **Indian Ocean Exporters** | `indianexport` | `http://indianexport.localhost:3000` | `owner-indianexport@demo.aquaerp.local` | exporter |
| **Sea Breeze Grill Group** | `seabreezegrill` | `http://seabreezegrill.localhost:3000` | `owner-seabreezegrill@demo.aquaerp.local` | restaurant |
| **Swahili Coast Logistics** | `swahililogistics` | `http://swahililogistics.localhost:3000` | `owner-swahililogistics@demo.aquaerp.local` | logistics |
| **AquaERP Showcase Tenant** | `aquaerp-demo` | `http://aquaerp-demo.localhost:3000` | `owner-aquaerp-demo@demo.aquaerp.local` | cooperative |

*Note: Access subdomains locally by matching the subdomain slug (e.g. `http://{slug}.localhost:3000` or via sub-path routes).*

---

## 🚀 How to Log In

1. Open the login page at [http://localhost:3000/login](http://localhost:3000/login).
2. Choose one of the roles or enterprise tenants above depending on the dashboard workflows you want to test.
3. Enter the corresponding **Email Address** and **Default Password**.
4. Upon successful login, you will be redirected to the secure `/dashboard` matching the authenticated role or tenant's space.

---

## 🛠️ Seeding Commands

If you need to reseed the database to restore these accounts and transactions to their clean default state, run the following commands:

### Standard Core Seed
```bash
npx ts-node database/seed.ts
npx ts-node database/seed-admin.ts
```

### Enterprise Demo Tenants Seed
```bash
npm run db:seed:demo          # Incremental demo tenants seed (skips existing)
npm run db:seed:demo:fresh    # Fresh demo tenants seed (wipes and recreates all 20 tenants)
```

