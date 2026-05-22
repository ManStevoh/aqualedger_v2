# Working safely — preserving your code

## Before large changes

```bash
git status
git stash push -m "my WIP" -- app/dashboard/wallet/page.tsx  # optional per-file
git diff > backup-$(Get-Date -Format yyyyMMdd-HHmm).patch   # PowerShell snapshot
```

## Your current WIP (do not overwrite)

These files have **local edits** — avoid bulk refactors or script runs that rewrite them:

- `app/dashboard/wallet/page.tsx`
- `components/dashboard/header.tsx`
- `app/dashboard/layout.tsx` (uses `DashboardChrome` + `DashboardModuleServerGate`)
- Several forecast / HR / communications pages (see `git status`)

## Safe automation

- `scripts/fix-dashboard-layout.mjs` — **review diff before commit**; it edits many pages.
- Prefer `npm run typecheck` and `npm test` over mass search-replace.

## Restore a file from last commit

```bash
git checkout HEAD -- path/to/file   # only if you intend to discard local edits
```

## Verify without losing work

```bash
npm run typecheck
npm test
npm run smoke
```
