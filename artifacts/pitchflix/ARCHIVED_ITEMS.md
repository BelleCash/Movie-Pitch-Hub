# ARCHIVED ITEMS — PitchFlix
Generated: 2026-06-04

## Summary

No files were archived during this audit and refactor pass.

The current file structure already matches the target structure defined in the directive.
No orphaned folders, no irrelevant files, no duplicate components were found.

---

## Files Considered for Archival

| File | Verdict | Reason |
|------|---------|--------|
| `src/services/billing/providers/paddleProvider.ts` | **KEPT** | Paddle is a valid payment provider; not in directive's primary list but also not excluded. Registered in billingService. |
| `src/hooks/use-toast.ts` | **KEPT** | Used by shadcn/ui toast component ecosystem; not deprecated |
| `src/hooks/use-mobile.tsx` | **KEPT** | Used by sidebar component; valid utility |

---

## Archive Folder
`/archive` was not created because no files required archival.

If archival is needed in the future:
1. Move file to `/archive/<original-path>/`
2. Add entry to this file with: folder name, original location, reason, and any remaining references
3. Request approval before deletion
