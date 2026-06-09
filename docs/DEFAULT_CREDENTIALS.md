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

## 🛒 2. B2B / Wholesale Buyer
Use this account to test the commercial purchasing and wholesale workflows. Logging in with this account redirects you to the **B2B Buyer Command Center** (`/dashboard`), where you can manage bulk orders, settle outstanding invoices, view credit scores, and track active forward contracts.
* **Email:** `buyer-b2b@demo.aquaerp.local`
* **Password:** `Demo@123`
* **Global Role:** `user`
* **Tenant Member Role:** `customer` (Wholesale Client)
* **Wallet Balance:** Pre-loaded with **100,000 KES** per tenant.

---

## 🛍️ 2b. Storefront / Retail Buyer
Use this account to test the customer-facing storefront experience. Since this account is not registered as an internal tenant team member, logging in directly will not grant access to the tenant dashboards, but it can be used to checkout on any public cooperative storefront (`/store/{slug}`).
* **Email:** `buyer@demo.aquaerp.local`
* **Password:** `Demo@123`
* **Global Role:** `user`
* **Tenant Member Role:** None (Storefront Guest/Retail Buyer)
* **Wallet Balance:** Pre-loaded with **50,000 KES** in its default wallet.

---

## 🏪 2c. Marketplace Vendor / Seller
Use this account to test the vendor selling and listing workflows. Logging in with this account redirects you to the **Vendor Command Center** (`/dashboard/vendor`), where you can manage your listings, view reviews, track commissions, and check payouts.
* **Email:** `vendor@demo.aquaerp.local`
* **Password:** `Demo@123`
* **Global Role:** `user`
* **Tenant Member Role:** `vendor` (Marketplace Seller)

---

## 🏢 3. Demo Tenants (3 Relevant Organizations)
Each demo tenant represents a fully provisioned cooperative, business, or logistics depot complete with their own landing sites, fleet records, temperature IoT sensors, payroll history, and financial ledgers.

* **Owner Password (All Tenants):** `Demo@123`

### 📋 Full Tenant List & Slugs

| Tenant Name | Subdomain Slug | Business Type | County | Owner Email |
|-------------|----------------|---------------|--------|-------------|
| **Coast Fish Cooperative** | `coastfish` | Cooperative | Kwale | `owner-coastfish@demo.aquaerp.local` |
| **Lamu Sea Ventures** | `lamusea` | Fisherman / Fleet | Lamu | `owner-lamusea@demo.aquaerp.local` |
| **AquaERP Showcase Tenant** | `aquaerp-demo`  | Cooperative | Mombasa | `owner-aquaerp-demo@demo.aquaerp.local` |

---

## ⚙️ 5. Default Global Platform Configurations
The seeder pre-configures the global application platform with the following settings (stored in the database under `platform_settings`):

| Setting Key | Default Value | Purpose |
|-------------|---------------|---------|
| **Maintenance Mode** (`maintenance`) | `enabled: false`, message: `"Scheduled maintenance completed..."` | Controls whether the maintenance screen is shown. |
| **Public Registrations** (`signup`) | `locked: false` | Controls whether new organizations can register. |
| **System Announcement** (`announcement`) | `enabled: true`, title: `"AquaERP platform demo"`, body: `"20 demo tenants..."` | Global alert banner visible on dashboards. |
| **Custom Branding** (`branding`) | `app_name: "AquaERP Fisheries OS"`, `primary_color: "#0d9488"` (Teal), `logo_url: ""` | Configures look-and-feel of the platform. |

### 🧩 6. Globally Enabled Modules
All core capabilities are pre-configured to be **globally active** (`Platform Module Flags` = `1` / `true`):
* 📦 **Core Operations:** Inventory, logs, and basic landing workflows.
* 🚢 **Vessel & Fleet Module:** GPS vessel logs and ship tracking.
* ❄️ **Cold Chain Module:** Telemetry monitoring for temperature IoT sensors.
* 🛍️ **Buyer Marketplace:** Global B2B storefront and Guest Checkout.
* 💳 **Finance & Wallets:** Multi-tenant ledger, digital credit scores, and STK integration.
* 👥 **Crew Payroll:** Automated salary scales, BMU compliance, and timesheets.

---

## 💳 7. Subscription Plans & Demo States
Demo organizations are pre-allocated across different subscription plans and statuses to facilitate billing limits, payroll calculations, and feature gate testing:

* **Enterprise Tier (`active`):** `coastfish`, `aquaerp-demo`
* **Trial Tier (`pending`):** `lamusea`

---

### 💡 Tips for testing Subdomain Routing:
When logged in as a **Tenant Owner**, you can explore specific organizational tools (Accounting, Cold Chain logs, Fleet GPS routes, and employee schedules). You can also publish storefront pages that automatically route customer portals:
* Main storefront: `https://aqua.kenwafula.cv/store/{slug}`
* Subdomain dashboard routing handles matching slugs natively!
