# Carely — AGENTS.md

## Required Rule

Before starting any task, read `docs/PROJECT_STATUS.md` and any other relevant project documentation to understand the current state, architectural decisions, and outstanding work.

After completing a task, update `docs/PROJECT_STATUS.md` with:
- What changed
- Which files were affected
- What was actually tested (only claim a test passed if you ran it and observed the result)
- Any remaining issues
- The recommended next task

Never claim a test passed unless you ran it and observed the result.

## Current Task: Fix Medications Add Button

### Issue Identified
The "Add Medication" button in the medications tab was not working properly. The form would open but typing details and clicking Save would not create a medication ("empty blob").

### Root Causes Found & Fixed

**Bug 1 — `editingId` dual-use:**
The Calendar button's `onClick` set `editingId` to the string `'calendar-view'` (a truthy value). When the form was saved, `handleSave` checked `if (editingId)` which was truthy, so it called `editMedication('calendar-view', med)` instead of `addMedication(med)`. Since no medication has id `'calendar-view'`, nothing was added — the "empty blob" symptom.

**Bug 2 — Silent validation rejection:**
`handleSave` returned early with no user feedback when name was empty or no valid times existed. The user saw nothing happen.

**Bug 3 — Default time could be cleared to empty:**
`times=['08:00']` could be cleared by the user → `validTimes=[]` → `handleSave` returned early silently.

### Solution Implemented
**Complete rewrite of `src/pages/older-adult/Medications.tsx`:**
- Removed: duplicated demo medication section, redundant cards, "Remove All Medications" button, calendar button misused as add form
- Rewrote: clean form with `isFormOpen`/`editingId` state, visible inline validation errors next to each field, success feedback toast after save, confirmation dialog for delete, single medication list with pause/reactivate/edit/delete actions, today's reminders showing pending/acknowledged/postponed status with acknowledge/postpone buttons
- Added: `useRef` for name input auto-focus on form open, `useMemo` for today's instances, duplicate time detection, end-date min constraint on HTML5 date input, local date key helper (no UTC shifting), acknowledgement disclaimer

Also updated `src/context/LanguageContext.tsx` — added all translation keys needed by the new page; removed `confirmRemoveAllMedications` and `removeAllMedications` (feature removed).

### Expected Behavior After Fix
- ✅ "Add Medication" button opens form for typing details (name, dosage, times, recurrence, dates, notes)
- ✅ Clicking Save creates the medication with all entered details
- ✅ Medication appears in the medication list immediately
- ✅ Form closes properly when "Cancel" button is clicked
- ✅ Form can be reopened by clicking "Add Medication" again
- ✅ Form automatically opens when editing an existing medication (pre-filled with current data)
- ✅ Edit button opens form pre-filled with medication data
- ✅ Remove/Delete button removes individual medication with confirmation
- ✅ Validation errors display inline for empty name, missing times, missing weekly days, invalid end date
- ✅ Success message appears after save, auto-dismisses after 3.5 seconds
- ✅ Calendar button removed — no longer interferes with add mode
- ✅ Fixed `medicationsCountLabel` translation — was showing raw ICU plural format `{count, plural, one {دارو} other {داروها}}` because `tr()` doesn't process ICU format. Changed to simple value `دارو(ها)` / `medication(s)` and fixed component call.
- ✅ All user-facing strings use `tr()` translation — English + Persian (fa-IR) with RTL support

### Testing Status
- ✅ TypeScript build passes (`npm run build`) — exit code 0
- ⚠️ Manual browser testing (TEST A through TEST I) not yet performed — build passes but no actual browser interaction verified

### Files Modified
- `src/pages/older-adult/Medications.tsx` - Complete rewrite of medication management page
- `src/context/LanguageContext.tsx` - Added missing translation keys

### Dependencies Added/Removed
- None - no new dependencies required

## Project Overview

Carely is a university entrepreneurship project: a web application to help older adults maintain independence while allowing trusted family members/caregivers to coordinate and monitor agreed-upon care tasks.

**Roles:** Older Adult (Mary) and Caregiver (John) — both share the same underlying data.

**Tech Stack:** React 18, TypeScript, Vite 5, Tailwind CSS 3.4, React Router 6 (HashRouter), Lucide React icons, localStorage for demo data persistence, Git for version control.

**Deployment target:** GitHub Pages (compatible with HashRouter; `base` configured for `/carely/` subpath).

**Product boundaries:** Demo prototype only. Fictional demo data. No real patient information. No AI medical advice/diagnosis. No backend or authentication for v1. No real medication notifications. Do not claim medication acknowledgment proves ingestion.

## Folder Structure

```
carely/
├── AGENTS.md
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── docs/
│   ├── PROJECT_STATUS.md
│   └── DECISIONS.md
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   ├── Navigation.tsx
│   │   ├── Sidebar.tsx
│   │   └── ThemeProvider.tsx
│   ├── hooks/
│   │   └── useIsMobile.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/
│   │   ├── older-adult/
│   │   │   ├── MyDay.tsx
│   │   │   ├── Medications.tsx
│   │   │   ├── Wellbeing.tsx
│   │   │   ├── Routine.tsx
│   │   │   ├── Smartwatch.tsx
│   │   │   └── Meditation.tsx
│   │   └── caregiver/
│   │       └── Overview.tsx
│   └── types/   (empty — to be created)
├── dist/        (build output, gitignored)
└── .gitignore
```

## Key Commands

- `npm install` — install dependencies
- `npm run dev` — start dev server on port 3000
- `npm run build` — TypeScript check + Vite production build to `dist/`
- `npm run preview` — serve the production build locally
- `npm run lint` — run ESLint

## Current State

- Foundation complete: routing, layout, navigation, design system components, placeholder pages.
- Shared data layer implemented: React Context + localStorage, both roles share the same data.
- Interactive functionality: medications (acknowledge/postpone), routine (complete/postpone), wellbeing (check-in + opt-in share), caregiver dashboard reflects shared state.
- **Routine ↔ My Day shared workflow:** Both pages read `data.activities` via `useCare()`. Completing or postponing an activity in Routine immediately updates My Day through React's normal state re-render. Browser refresh preserves state via `localStorage`.
- TypeScript strict mode enabled; production build passes `tsc && vite build` (observed exit code 0 on 2026-11-04).
- Synthetic wellbeing data added to `src/types/carely.ts` initialData (20 entries, wb-1 through wb-20, June–October 2026) so the activity calendar heatmap is populated for demo purposes.
- Smartwatch demo page added (`src/pages/older-adult/Smartwatch.tsx`) — connect/disconnect toggle, device status, simulated health metrics, route `/#/older-adult/smartwatch`, sidebar link added.

## Manual Testing Checklist

**Essential workflows to verify:**

A. Mary acknowledges a medication reminder → John sees "Reminder acknowledged"
   1. Navigate to `/#/older-adult/medications`
   2. Click "Acknowledge" on a pending medication
   3. Navigate to `/#/caregiver/overview`
   4. Verify the medication count reflects the acknowledgment

B. Mary completes a routine activity → My Day immediately shows it as completed
   1. Navigate to `/#/older-adult/routine`
   2. Click "Complete" on a pending activity
   3. Navigate to `/#/older-adult/my-day`
   4. Verify the same activity shows as "Completed"
   5. Return to `/#/older-adult/routine`
   6. Verify the activity remains completed

C. Mary postpones a routine activity → My Day shows it as postponed
   1. Navigate to `/#/older-adult/routine`
   2. Click "Postpone" on a pending activity
   3. Navigate to `/#/older-adult/my-day`
   4. Verify the same activity shows as "Postponed"

D. Mary acknowledges a medication or completes/postpones an activity → Caregiver Overview and Monitoring reflect it
   1. Navigate to `/#/older-adult/medications` or `/#/older-adult/routine`
   2. Acknowledge/postpone a medication or complete/postpone an activity
   3. Navigate to `/#/caregiver/overview`
   4. Verify the counts reflect the change (acknowledged, pending, postponed)
   5. Navigate to `/#/caregiver/monitoring`
   6. Verify the item shows with correct status

D. Mary records a private wellbeing check-in → John cannot see it
   1. Navigate to `/#/older-adult/wellbeing`
   2. Select mood and energy, leave "Share with caregiver" unchecked
   3. Click "Submit Check-in"
   4. Navigate to `/#/caregiver/overview`
   5. Verify no new shared check-in appears

E. Mary explicitly shares a wellbeing check-in → John can see it
   1. Navigate to `/#/older-adult/wellbeing`
   2. Select mood and energy, check "Share with caregiver"
   3. Click "Submit Check-in"
   4. Navigate to `/#/caregiver/overview`
   5. Verify shared check-in appears under "Wellbeing Shared by Mary"

F. Mary postpones an activity or medication reminder → John sees the corresponding status
   1. Navigate to `/#/older-adult/medications` or `/#/older-adult/routine`
   2. Click "Postpone" on a pending item
   3. Navigate to `/#/caregiver/monitoring`
   4. Verify item shows as "Postponed"

G. Refreshing the browser does not erase changes
   1. Make any change (acknowledge medication, complete activity, submit wellbeing)
   2. Refresh the browser (F5)
   3. Verify the change persists

**Navigation checks:**
- Header menu button opens/closes mobile sidebar drawer
- Role-switching navigation (Older Adult ↔ Caregiver) works
- Sidebar links navigate to correct pages
- `/#/caregiver/monitoring` route loads without error
- All buttons either perform their action or are disabled with explanation

**Language switching checks:**
- Globe button in Header toggles between English and Persian
- Switching to Persian sets `dir="rtl"` and `lang="fa"` on `<html>`
- All visible text is translated in Persian mode (no untranslated English fragments except brand name)
- Persian font (Vazirmatn) renders correctly
- Layout mirrors correctly in RTL (sidebar on right, text right-aligned)
- Switching back to English restores `dir="ltr"` and `lang="en"`
- Language preference persists in localStorage across refreshes

**Medication workflow checks:**
- Add a medication scheduled for every day → appears in today's schedule
- Add a medication for selected weekdays → appears on correct days
- Edit a medication → changes reflected across all pages
- Delete a medication → removed from all views
- Pause/reactivate a medication → status changes accordingly
- Acknowledge a reminder → status changes to "Reminder acknowledged"
- Postpone a reminder → status changes to "Reminder postponed"
- John's Overview shows pending medications requiring attention

**Wellbeing workflow checks:**
- Add a mood entry → appears in wellbeing history
- Share a wellbeing entry → appears in John's Overview under "Wellbeing Shared by Mary"
- Keep a wellbeing entry private → invisible to John
- Share then unshare an entry → removed from John's view

## OpenCode Settings Notes

No special OpenCode configuration is required beyond the defaults. If you want to use a specific model provider for agentic work, configure it via the OpenCode CLI or settings. The project itself is a standard React/Vite/TypeScript repo — no custom OpenCode plugins, skills, or MCP servers are needed.

## Two-Mode Build: Demo & Beta

Carely builds two independent public versions from the same source code, selected via `import.meta.env.MODE` (Vite `--mode`):

| Mode | Storage key | Seed data | Vite base | Output dir | Use |
|------|-------------|-----------|-----------|------------|-----|
| `demo` | `carely_data_demo` | Synthetic Persian demo dataset (populated on first visit) | `/carely/demo/` | `dist/demo` | Fully populated demonstration |
| `beta` | `carely_data_beta` | Empty (`[]` for all arrays); user supplies data | `/carely/beta/` | `dist/beta` | Empty version for trying the app |

Both versions are hosted under the same GitHub Pages origin on different paths and use **separate localStorage keys**, so demo data never mixes with beta data. Beta mode is never seeded with synthetic records.

### NPM scripts

- `npm run dev` — dev server (default/demo data)
- `npm run dev:demo` — dev server in demo mode
- `npm run dev:beta` — dev server in beta mode
- `npm run build` — type-check + build **both** variants (`dist/demo` and `dist/beta`)
- `npm run build:demo` — build demo only
- `npm run build:beta` — build beta only
- `npm run build:pages` — build both + generate root landing page (`dist/index.html`)
- `npm run preview` — preview demo build (`dist/demo`)
- `npm run preview:beta` — preview beta build (`dist/beta`)

### Local development

- Demo locally: `npm run dev:demo` (opens on http://localhost:3000, seeded with synthetic data)
- Beta locally: `npm run dev:beta` (opens on http://localhost:3000, starts empty)
- Build both: `npm run build` → `dist/demo` and `dist/beta`
- Preview demo: `npm run build && npm run preview` (serves `dist/demo`)
- Preview beta: `npm run build:beta && npm run preview:beta` (serves `dist/beta`)

### Deployment URLs (once GitHub Pages is configured)

Assuming repository `USERNAME/carely`:
- Landing page: `https://USERNAME.github.io/carely/`
- Demo: `https://USERNAME.github.io/carely/demo/`
- Beta: `https://USERNAME.github.io/carely/beta/`

### Reset demo data

Demo mode only: a "Reset demo data" button appears on the Medications page. It restores the original synthetic dataset and reloads the page. Beta mode never shows this button, and beta user data is never affected.

### Beta limitations

- Beta starts completely empty (no medications, activities, wellbeing entries, or reminders).
- The user must create their own entries; nothing is pre-populated.
- No synthetic records ever appear in beta.
- Demo reset control is not available in beta.

### Deployment (GitHub Pages)

1. Create the repository on GitHub (name determines the subpath, e.g. `carely` → `/carely/`).
2. Set the git remote: `git remote add origin https://github.com/USERNAME/carely.git`
3. Enable GitHub Pages in repo Settings → Pages, build source = GitHub Actions.
4. Push to `main` (or run the workflow manually via `workflow_dispatch`).
5. The `.github/workflows/deploy.yml` workflow builds both variants, generates the landing page, uploads `./dist` as a single Pages artifact, and deploys.

Do not deploy separate artifacts that overwrite one another — both versions are included in the same `dist` directory deployment.
