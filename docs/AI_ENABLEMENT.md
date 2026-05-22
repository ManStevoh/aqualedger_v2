# AquaERP AI Enablement

AquaERP is **AI-enabled** when statistical models, grounded LLM features, and automation run on your tenant data. Without `OPENAI_API_KEY`, the system still provides **rules + SQL analytics** (fully usable); with the key, you get **natural-language briefs, report narratives, and data-grounded chat**.

## Capability matrix

| Feature | Without LLM | With `OPENAI_API_KEY` |
|---------|-------------|------------------------|
| Demand forecast (moving avg) | Yes | Same + richer brief context |
| Price prediction (linear regression) | Yes | Same |
| Wallet fraud (z-score) | Yes | Same |
| Inventory reorder urgency | Yes | Same |
| **Business brief** | Rule-based from live KPIs | LLM narrative + recommendations |
| **Report email narrative** | Skipped | AI executive summary in HTML |
| **AquaERP Assistant** | Regex + KPI snippets | Full conversation with tenant JSON context |
| Daily automation cron | Yes | Yes |

## Environment variables

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Enables LLM (required for “full AI”) |
| `OPENAI_MODEL` | Default `gpt-4o-mini` |
| `OPENAI_API_BASE_URL` | Optional proxy / Azure-style endpoint |
| `AI_REPORT_NARRATIVE` | `false` to disable narratives; `always` to force rule+LLM attempt |
| `AI_CRON_SECRET` | Protects `POST /api/v2/ai/automation/run` for all tenants |

## APIs

| Endpoint | Permission | Description |
|----------|------------|-------------|
| `GET /api/v2/ai/insights` | `ai.insights.read` | Latest briefs + live tenant context |
| `POST /api/v2/ai/insights` | `ai.insights.write` | `action`: `brief`, `coldchain`, `inventory`, `run_all` |
| `POST /api/v2/ai/reports/narrative` | `ai.insights.read` | Narrative for a report type |
| `POST /api/v2/ai/automation/run` | `ai.insights.write` or cron secret | Recompute forecasts + all briefs |
| `GET/POST /api/v2/ai/chat` | `ai.chat.*` | Grounded assistant |
| Existing forecast/pricing/fraud/inventory | `ai.forecast.read` | Statistical models |

## Cron (daily AI)

```http
POST /api/v2/ai/automation/run
X-AquaERP-Cron-Secret: <AI_CRON_SECRET>
```

Runs for **all active tenants**: demand forecast, price model, fraud scan, business brief, cold-chain review, inventory review.

## How to say “AI-enabled” (marketing / RFP)

1. **Predictive operations** — demand, pricing, inventory days-of-stock, catch planning inputs  
2. **Risk detection** — wallet anomaly scoring, cold-chain alert correlation  
3. **Executive intelligence** — daily business brief with prioritized actions  
4. **Report augmentation** — scheduled emails include AI executive summary  
5. **Conversational ERP** — assistant answers with **your** orders, catch, GL, and alerts  
6. **Automation** — one-click or cron refresh of models and briefs  

## Data governance

- LLM prompts include **aggregated tenant metrics only** (no raw PII dump).  
- Chat history stored in `ai_chat_sessions` per user.  
- Insights stored in `ai_insights` with model version stamp.  
- Disable LLM anytime: unset `OPENAI_API_KEY` — statistical AI remains.

## In this monolith (shipped)

| Area | Status |
|------|--------|
| Demand forecast (moving average) | ✅ |
| Species / price signal (linear regression) | ✅ |
| Wallet anomaly (z-score) | ✅ |
| Inventory reorder urgency | ✅ |
| Business brief (rules; + LLM when keyed) | ✅ |
| Cold-chain & inventory AI reviews | ✅ |
| Report email narrative (LLM) | ✅ with `OPENAI_API_KEY` |
| Grounded copilot (`/api/v2/ai/chat`) | ✅ rules + LLM |
| One-click + cron automation | ✅ `POST /api/v2/ai/automation/run` |
| UI | ✅ `/dashboard/ai` (AI Command Center) |

**Positioning:** Without `OPENAI_API_KEY` → **AI-assisted analytics** (statistics + rule-based briefs). With the key → **AI-enabled vertical ERP** (narratives + conversational layer on the same data).

---

## Still Phase 5 (not in this pass)

These are **roadmap only** — do not claim in RFPs or homepage copy until built:

| Item | Notes |
|------|--------|
| **RAG over documents** | Contracts, HACCP PDFs, export certs — vector search + citations |
| **Agent tools** | Create PO, post journal, approve workflow steps from chat |
| **Per-tenant AI cost / usage dashboard** | Token spend, quotas, model selection per org |
| **Custom ML models** | Beyond moving average / regression (e.g. fine-tuned species demand) |

See also [`docs/PENDING_OVERALL.md`](PENDING_OVERALL.md) § Phase 5 and [`docs/MIGRATION_ROADMAP.md`](MIGRATION_ROADMAP.md).

---

## Database setup

AI tables (`ai_insights`, `ai_automation_runs`, chat sessions, etc.) come from migration **`20260605_ai_enablement.sql`**.

```bash
# Apply all pending migrations (includes 20260605)
node scripts/run-migrations.mjs

# Or full fresh DB
npm run db:setup
```

Then verify:

```bash
npm run db:verify
```

Enable LLM (optional):

```bash
# .env
OPENAI_API_KEY=sk-...
AI_CRON_SECRET=...   # for daily automation cron
```
