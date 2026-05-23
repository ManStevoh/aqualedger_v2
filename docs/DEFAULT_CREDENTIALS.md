# 🔑 AquaLedger V2 — Default Credentials & Seeded Accounts

This document contains a complete list of pre-seeded credentials and tenant configurations generated during `npm run db:setup` / `db:seed:super-admin:fresh`. 

You can use these credentials to log in at **`https://aqua.kenwafula.cv/login`** and test different roles and organizational modules!

---

## 👑 1. Platform Super Admin (Full Access)
Use this account to access the **Platform Command Center** (`/dashboard/admin`) where you can configure billing, toggle global modules, provision new tenants, and view system analytics.

* **Email:** `admin@aqualedger.co.ke`
* **Password:** `Admin@123`
* **Role:** `super_admin`

---

## 🛒 2. Shared Marketplace Buyer
Use this account to test the fish buyer storefront experience. This account is pre-loaded with **50,000 KES** in its digital wallet to test checkouts and STK payments.

* **Email:** `buyer@demo.aquaerp.local`
* **Password:** `Demo@123`
* **Role:** `fish_buyer`

---

## 🏢 3. Demo Tenants (20 Organizations)
Each demo tenant represents a fully provisioned cooperative, business, or logistics depot complete with their own landing sites, fleet records, temperature IoT sensors, payroll history, and financial ledgers.

* **Owner Password (All Tenants):** `Demo@123`
* **Owner Email Pattern:** `owner-{slug}@demo.aquaerp.local`

### 📋 Full Tenant List & Slugs

| Tenant Name | Subdomain Slug | Business Type | County | Owner Email |
|-------------|----------------|---------------|--------|-------------|
| **Coast Fish Cooperative** | `coastfish` | Cooperative | Kwale | `owner-coastfish@demo.aquaerp.local` |
| **Lamu Sea Ventures** | `lamusea` | Fisherman / Fleet | Lamu | `owner-lamusea@demo.aquaerp.local` |
| **Kilifi Processors Ltd** | `kilifiprocess` | Fish Processor | Kilifi | `owner-kilifiprocess@demo.aquaerp.local` |
| **Mombasa Marine Market** | `mombasamarine` | Local Fish Market | Mombasa | `owner-mombasamarine@demo.aquaerp.local` |
| **Indian Ocean Exporters** | `indianexport` | Seafood Exporter | Mombasa | `owner-indianexport@demo.aquaerp.local` |
| **Sea Breeze Grill Group** | `seabreezegrill` | Restaurant Chain | Nairobi | `owner-seabreezegrill@demo.aquaerp.local` |
| **Swahili Coast Logistics** | `swahililogistics`| Cold Chain Depot | Mombasa | `owner-swahililogistics@demo.aquaerp.local` |
| **Victoria Tilapia Union** | `victoriatilapia`| Cooperative | Kisumu | `owner-victoriatilapia@demo.aquaerp.local` |
| **Dunga Beach Operators** | `dungaoperators`| Fisherman / Fleet | Kisumu | `owner-dungaoperators@demo.aquaerp.local` |
| **Homa Bay Fresh Catch** | `homabayfresh` | Local Fish Market | Homa Bay| `owner-homabayfresh@demo.aquaerp.local` |
| **Naivasha Cold Chain Ltd** | `naivashacold`  | Cold Chain Depot | Nakuru | `owner-naivashacold@demo.aquaerp.local` |
| **Watamu Fisheries Enterprise**| `watamuenterprises`| Fisherman / Fleet | Kilifi | `owner-watamuenterprises@demo.aquaerp.local` |
| **Shimoni Catch Cooperative** | `shimonicatch`  | Cooperative | Kwale | `owner-shimonicatch@demo.aquaerp.local` |
| **Malindi Fish Hub** | `malindihub`    | Local Fish Market | Kilifi | `owner-malindihub@demo.aquaerp.local` |
| **Diani Reef Restaurant Supply**| `dianirestaurant`| Restaurant Chain | Kwale | `owner-dianirestaurant@demo.aquaerp.local` |
| **Kizingitini Fleet Owners** | `kizingitinifleet`| Cooperative | Lamu | `owner-kizingitinifleet@demo.aquaerp.local` |
| **Pwani Logistics & Ice** | `pwanalogistics` | Cold Chain Depot | Kilifi | `owner-pwanalogistics@demo.aquaerp.local` |
| **Nairobi Wholesale Fish Co** | `nairobiwholesale`| Local Fish Market | Nairobi | `owner-nairobiwholesale@demo.aquaerp.local` |
| **Lake Turkana Operations** | `turkanaoperations`| Fisherman / Fleet | Turkana | `owner-turkanaoperations@demo.aquaerp.local` |
| **AquaERP Showcase Tenant** | `aquaerp-demo`  | Cooperative | Mombasa | `owner-aquaerp-demo@demo.aquaerp.local` |

---

### 💡 Tips for testing Subdomain Routing:
When logged in as a **Tenant Owner**, you can explore specific organizational tools (Accounting, Cold Chain logs, Fleet GPS routes, and employee schedules). You can also publish storefront pages that automatically route customer portals:
* Main storefront: `https://aqua.kenwafula.cv/store/{slug}`
* Subdomain dashboard routing handles matching slugs natively!
