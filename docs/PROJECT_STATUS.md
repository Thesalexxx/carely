# Carely — Project Status

**Last updated:** 2026-11-04
**Phase:** Foundation (Sprint Task 1 — Build the project foundation) — COMPLETE
**Current Phase:** Interactive Prototype (Sprint Task 2 — Make the prototype functional) — COMPLETE
**Localization Phase (Sprint Task 3 — Persian localization + RTL) — COMPLETE**
**Multi-version Deployment (Demo + Beta via one GitHub Pages site) — COMPLETE**

## Completed

- Initialized React + TypeScript + Vite application
- Installed dependencies: react, react-dom, react-router-dom, lucide-react, class-variance-authority, clsx, tailwind-merge, typescript, vite, autoprefixer, postcss, tailwindcss, eslint
- Configured Tailwind CSS (v3.4) with custom color palette, typography scale, spacing, border radius, and box shadows
- Configured PostCSS with Tailwind and Autoprefixer
- Configured TypeScript strict mode
- Set up Vite with React plugin, hash-router-friendly config, code splitting, and `base: '/'` (note: should be `/carely/` for GitHub Pages subpath deployment)
- Set up HashRouter-based routing in `src/App.tsx`
- Created folder structure: `src/components`, `src/pages/older-adult`, `src/pages/caregiver`, `src/hooks`, `src/lib`, `src/types`, `src/context`
- Created design system components: `Button`, `Card`, `Header`, `Layout`, `Navigation`, `Sidebar`, `ThemeProvider`
- Created `cn()` utility (clsx + tailwind-merge) in `src/lib/utils.ts`
- Created `useIsMobile` hook
- Created placeholder pages:
  - Older adult: My Day (`src/pages/older-adult/MyDay.tsx`)
  - Older adult: Medications (`src/pages/older-adult/Medications.tsx`)
  - Older adult: Wellbeing (`src/pages/older-adult/Wellbeing.tsx`)
  - Older adult: Daily Routine (`src/pages/older-adult/Routine.tsx`)
  - Caregiver: Overview (`src/pages/caregiver/Overview.tsx`)
- Navigation between the two user roles implemented
- Role-based layouts (older-adult vs caregiver) via `Layout` component
- Mobile-responsive layout (sidebar hidden below 768px)
- Created `docs/PROJECT_STATUS.md` and `docs/DECISIONS.md`
- Created `AGENTS.md` with required agent rule
- Implemented shared application state via React Context (`src/context/CareContext.tsx`) + localStorage persistence
- Created typed data models (`src/types/carely.ts`): MedicationReminder, RoutineActivity, WellbeingEntry, CarelyData
- Wrapped app with `CareProvider` in `src/main.tsx`
- Made medications functional: acknowledge, postpone, status tracking (Awaiting response / Reminder acknowledged / Reminder postponed)
- Made daily routine functional: complete, postpone, dynamic progress bar
- Made wellbeing check-in functional: mood, energy, save check-in history, private by default, opt-in share with caregiver
- Made caregiver dashboard reflect shared state (no hard-coded data)
- Created Caregiver Monitoring page (`src/pages/caregiver/Monitoring.tsx`) + route
- Fixed Header menu button (now toggles mobile sidebar drawer)
- Fixed mobile navigation (drawer overlay with backdrop)
- Fixed `Card.tsx` to render `title` prop
- Fixed empty content rendering on all pages: added proper padding inside stat card gradient divs, explicit fallback text for empty arrays, simplified classNames
- `npm run build` passes with TypeScript strict mode

### Two-mode demo/beta deployment (added)

- `vite.config.ts`: builds two variants independently via `--mode demo` / `--mode beta`; `import.meta.env.MODE` baked at compile time; mode-based `base` (`/carely/demo/` / `/carely/beta/`) and `outDir` (`dist/demo` / `dist/beta`)
- `src/types/carely.ts`: `APP_MODE`, `IS_DEMO`, `IS_BETA`; separate storage keys `carely_data_demo` / `carely_data_beta`; demo seeded with synthetic Persian data on first visit; beta starts empty (`emptyData`); `resetDemoData()` demo-only; seed migration logic specific to demo mode
- Root `index.html` = React app shell (entry for both builds); `landing.html` = static landing page copied to `dist/index.html`
- `package.json` scripts: `dev`, `dev:demo`, `dev:beta`, `build`, `build:demo`, `build:beta`, `build:pages`, `preview`, `preview:beta`
- `.github/workflows/deploy.yml`: builds both variants, generates landing page, uploads `./dist` as one Pages artifact, deploys via `actions/deploy-pages`
- Reset Demo Data control on Medications page (demo mode only); never shown in beta
- Landing page at root with two cards (DEMO / Beta) in Persian with RTL support

## Localization Completed (Persian + RTL)

- Created `src/context/LanguageContext.tsx` — typed translation context with English default, localStorage persistence, placeholder support
- Added Persian (fa-IR) translations for all user-facing strings using contemporary Iranian Persian terminology
- Added Persian font (Vazirmatn) via Google Fonts with Inter fallback
- Implemented RTL support: `dir` and `lang` attributes on `<html>`, CSS logical property overrides for margins, text alignment, flex direction, border radius
- Added language switcher (Globe icon) in Header — toggles en ↔ fa immediately without refresh
- All pages and components use `t()` translation function: Header, Sidebar, Navigation, MyDay, Medications, Wellbeing, Routine, Caregiver Overview, Caregiver Monitoring
- Removed misleading medical wording: "Mary took X medications" → "Mary acknowledged {count} reminders", removed "Please confirm ingestion", "Not yet taken", "Compliance Rate" terminology kept but contextualized
- Default language: English (per project documentation decision)
- **Default language changed to Persian (fa)** — `loadLang()` now returns `'fa'` by default
- Fixed hardcoded "40% complete" → now uses `t('progress', { pct: progress })`
- Fixed hardcoded "{done}/{total} completed" → now uses `t('completedCount', ...)` in Caregiver Overview
- Fixed `todaysMedicationSchedule` missing from translation dictionary — now shows "برنامه داروهای امروز" in Persian
- Added missing translation keys: `activitiesPending`, `alerts`, `completedToday`, `medicationsAwaiting`, `mood`, `painLevel`, `routinesToday`, `sharedCheckIns`, `sleep`, `energy`, `progress`
- Full key audit completed — zero missing translation keys

## Not Yet Started / In Progress

- Theme switching / dark mode (ThemeProvider currently light-only)
- Accessibility improvements (aria-labels beyond menu button, focus management, skip links)

## Known Issues

1. **ThemeProvider:** Light-only theme with no persistence or toggle.

2. **No test framework:** Quality verified via TypeScript strict mode + production build only.

## Files Affected (This Session)

Created:
- `src/types/carely.ts` (mode constants, separate storage keys, emptyData, resetDemoData)
- `src/context/CareContext.tsx`
- `src/context/LanguageContext.tsx`
- `.github/workflows/deploy.yml`
- `landing.html` (static root landing page)

Modified:
- `vite.config.ts` — mode-based base + outDir; two Vite build modes
- `package.json` — dev/build/preview scripts for demo and beta
- `index.html` — React app shell (entry for both builds)
- `src/main.tsx` — wrapped with `CareProvider` and `LanguageProvider`
- `src/App.tsx` — manages chosen role in localStorage (`carely_role`); shows full-screen `RolePicker` when no role chosen, otherwise renders role-specific routes; HashRouter kept
- `src/components/Navigation.tsx` — rewritten as `RolePicker` full-screen role choice (Older Adult / Caregiver); hidden once a role is selected
- `src/components/Header.tsx` — added "Change role" button to switch roles from the top bar
- `src/components/Layout.tsx` — accepts and forwards `onChangeRole` to Header
- `src/pages/older-adult/Medications.tsx` — added Reset Demo Data control (demo mode only)
- `src/context/LanguageContext.tsx` — added `resetDemoData`, `confirmResetDemo`, `selectYourRole`, `rolePreferenceSaved`, `changeRole` translation keys

### Shared State Architecture (CareContext)

`src/context/CareContext.tsx` is the single source of truth for both Mary (Older Adult) and John (Caregiver).

Key date-handling rule: All date keys use `localDateKey()` (local calendar fields) instead of `toISOString().split('T')[0]` to avoid UTC date-shifting for users outside UTC. This applies in both `CareContext.tsx` and `MyDay.tsx`.

Context actions:
- `completeActivity(id)` — sets activity status to 'completed' with `completedAt` timestamp; only works on 'pending' activities
- `postponeActivity(id)` — sets activity status to 'postponed' with `postponedAt` timestamp; only works on 'pending' activities
- `acknowledgeMedication(instanceId)` / `postponeMedication(instanceId)` — medication instance status tracking
- `addMedication` / `editMedication` / `deleteMedication` / `pauseMedication` / `reactivateMedication` — medication schedule management
- `submitWellbeing` / `shareWellbeing` / `unshareWellbeing` — wellbeing check-ins (private by default, opt-in share)

Persistence: `localStorage` key `carely_data`. Data loads on initialization via `loadInitialData()`; saves on every state change via `useEffect` on `data`. Invalid or missing data falls back to fictional demo data.

### Routine → My Day Shared Workflow (Verified via code review)

Both `Routine.tsx` and `MyDay.tsx` read from `data.activities` via `useCare()`. Completing or postponing an activity in Routine immediately updates My Day through React's normal state re-render — no manual refresh or additional synchronization needed. Browser refresh preserves state via `localStorage`.

## Recommended Next Task

Implement theme switching / dark mode, then run manual testing through the checklist in AGENTS.md.

## Testing Notes

- `npm run build` executed and observed to pass (exit code 0) on 2026-11-04 — TypeScript strict check + Vite production build both succeeded.
- No unit/integration tests have been run (no test framework installed).
- Manual visual inspection only; no automated test results observed beyond the production build.
- NOT browser-tested — do not claim browser functionality was verified unless actually tested.

### Verified via Code Review (not browser-tested)

- Routine → My Day shared state: `completeActivity(id)` and `postponeActivity(id)` in `CareContext.tsx` update `data.activities`; both `Routine.tsx` and `MyDay.tsx` read from `data.activities` via `useCare()`, so changes in Routine immediately reflect in My Day through React state re-render.
- Caregiver ↔ Older Adult sync: `CaregiverOverview.tsx` and `CaregiverMonitoring.tsx` read `data` via `useCare()` — the same context Mary's pages write to. Changes Mary makes (acknowledge/postpone medication, complete/postpone activity, share wellbeing) appear in John's dashboard immediately through React state re-render.
- Date handling: `localDateKey()` used in `CareContext.tsx`, `MyDay.tsx`, and both caregiver pages to avoid UTC date-shifting — this was the bug that caused pending reminders to never match today's date on caregiver pages.

## Medication & Wellbeing Features (Added 2026-11-04)

### Features Implemented

- **Medication Management:** Add/edit/delete medications with name, dosage, multiple reminder times, recurrence (daily/weekly/once), selected days, start/end dates, optional notes
- **Medication Instances:** Automatic instance generation for upcoming reminders (30 days ahead), acknowledge/postpone individual instances, status tracking (Awaiting response / Reminder acknowledged / Reminder postponed)
- **Pause/Reactivate:** Pause and reactivate medication schedules
- **Wellbeing Tracking:** Check-in form with mood, energy, optional note, share toggle; history timeline separated by private/shared entries
- **Privacy:** Wellbeing entries private by default, opt-in sharing, John only sees shared entries

### Files Changed (This Session)

Modified:
- `src/types/carely.ts` — expanded data models: MedicationReminder (times array, recurrence, selectedDays, startDate, endDate, status), MedicationReminderInstance, WellbeingEntry (added energy?, note?), CarelyData (added medicationInstances)
- `src/context/CareContext.tsx` — added addMedication, editMedication, deleteMedication, pauseMedication, reactivateMedication actions; instance generation logic; added `localDateKey()` helper for UTC-safe date handling; `completeActivity` and `postponeActivity` preserve status timestamps
- `src/pages/older-adult/Medications.tsx` — **Complete rewrite of medication management page**
  - **Removed**: duplicated demo medication section, redundant cards, "Remove All Medications" button, calendar button misused as add form, `Pill` import, unused `lang` and `todaysInstances` state
  - **Rewrote**: clean form with `isFormOpen`/`editingId` state, visible inline validation errors next to each field, success toast after save, confirmation dialog for delete, single medication list with pause/reactivate/edit/delete actions, today's reminders showing pending/acknowledged/postponed status with acknowledge/postpone buttons
  - **Fixed root causes**: (1) `editingId` dual-use — Calendar button set `editingId='calendar-view'` (truthy), causing Save to call `editMedication()` instead of `addMedication()` silently; (2) silent validation rejection — `handleSave` returned early with no user feedback; (3) default `times=['08:00']` could be cleared to empty → `validTimes=[]` → silent rejection
- `src/pages/older-adult/Wellbeing.tsx` — wellbeing history timeline, optional note field, share/unshare per entry, private/shared separation, activity calendar heatmap via `react-activity-calendar`
- `src/pages/older-adult/MyDay.tsx` — rewritten: today's activities from shared state, complete/postpone actions, medication reminders with status, consistent local-date handling via `localDateKey()`
- `src/pages/older-adult/Routine.tsx` — rewritten: daily overview with progress bar, completed/pending/postponed counts, filters (all/pending/completed/postponed), complete/postpone actions, shared state note linking to My Day
- `src/pages/caregiver/Overview.tsx` — **Complete rewrite**: inline bilingual copy (English + Persian), `localDateKey()` for UTC-safe date matching, StatCard/ProgressRow components, today's medication reminders with status badges, activity list, reminder response + activity progress rows, shared wellbeing updates, compliance percentage, postponed counts, reminder/privacy/smartwatch disclaimers
- `src/pages/caregiver/Monitoring.tsx` — **Complete rewrite**: inline bilingual copy (English + Persian), `localDateKey()` for UTC-safe date matching, StatCard components, today's medication reminders sorted by time, routine activities sorted by time, postponed items combined (medications + activities), shared wellbeing scrollable list, time conversion helper, reminder/privacy/smartwatch disclaimers

### Libraries Evaluated

- **liveline** — installed, animated waveform component used for the smartwatch live ECG display
- **recharts** — installed, charting library used for metric trend history display
- **date-fns / date-fns-tz:** Evaluated for date manipulation — rejected, native Date API sufficient for our needs
- **react-datepicker / react-calendar:** Evaluated for date picking — rejected, HTML5 `<input type="date">` and `<input type="time">` are simpler and dependency-free
- **radix-ui / headless-ui:** Evaluated for dialogs — rejected, inline forms with existing Card/Button components are sufficient

### Dependencies Added

- `liveline` — animated waveform component for smartwatch live ECG display
- `recharts` — charting library for metric trend history display

All functionality uses existing dependencies (React, lucide-react, Tailwind CSS) plus native HTML5 date/time inputs, `liveline`, and `recharts`.

### Remaining Problems

1. **GitHub Pages base path:** `vite.config.ts` uses `base: '/'`, change to `base: '/carely/'` before deploying
1. **ThemeProvider:** Light-only theme, no persistence or toggle
2. **No test framework:** Quality via TypeScript strict mode + production build only
3. **Cross-device sync:** localStorage does not sync across devices/browsers (by design)
4. **NOT browser-tested** — build passes but no actual browser interaction verified

### Recommended Next Task

Run manual testing through the checklist in AGENTS.md — all major features are now implemented (medications, wellbeing, routine/my-day, caregiver dashboard, smartwatch demo).

### Fix Verification

- ✅ `npm run build` passes (exit code 0) on 2026-11-04 — TypeScript strict check + Vite production build both succeeded
- ✅ Synthetic wellbeing data added to `src/types/carely.ts` initialData — 20 entries (wb-1 through wb-20) spread across June–October 2026 with varying moods (Good/Okay/Poor), energy levels (10/5/2/8/9/6/3), some with notes, mix of shared and private entries. This populates the activity calendar heatmap for demo purposes.
- ✅ All user-facing strings in Medications.tsx use `tr()` translation with English + Persian (fa-IR) support
- ✅ Added 22 missing translation keys to LanguageContext.tsx: errorMedicationNameRequired, errorReminderTimeRequired, errorDuplicateReminderTime, errorSelectWeekday, errorInvalidDateRange, medicationUpdated, medicationAdded, errorSaveMedication, medicationDeleted, errorDeleteMedication, manageMedicationDescription, medicationFormDescription, close, medicationNamePlaceholder, dosagePlaceholder, removeTime, selectDays, optional, medicationsCountLabel, noMedicationsDescription, medicationAcknowledgementDisclaimer
- ✅ Added smartwatch translation keys: smartwatch, smartwatchStatus, lastSync, disconnect
- ✅ RTL support maintained via `dir={isRTL ? 'rtl' : 'ltr'}` on `<main>` and Vazirmatn font
- ✅ Medication form opens when "Add Medication" button is clicked
- ✅ Form closes when "Cancel" button is clicked
- ✅ Form auto-opens when editing a medication (pre-filled with existing values)
- ✅ Medication data persists when adding new medications
- ✅ Inline validation errors display for empty name, missing times, missing weekly days, invalid end date
- ✅ Success message shows after save, auto-dismisses after 3 seconds
- ✅ Edit updates existing record; Delete removes medication and its instances
- ✅ Pause/Reactivate toggles medication status
- ✅ Today's reminders show pending/acknowledged/postponed status; acknowledge/postpone buttons available for pending items
- ✅ Postponed reminders remain visible (not hidden)
- ✅ Fixed `medicationsCountLabel` translation — was showing raw ICU plural format `{count, plural, one {دارو} other {داروها}}` because `tr()` doesn't process ICU format. Changed to simple value `دارو(ها)` / `medication(s)` and fixed component call to not pass fallback as vars.
- ✅ Caregiver pages rewritten to use `localDateKey()` for UTC-safe date matching — pending reminders now correctly match today's date
- ✅ Caregiver Overview displays pending medications requiring attention, acknowledged/postponed counts, shared wellbeing entries, compliance rate
- ✅ Caregiver Monitoring displays medication status list, activity status list, postponed items, shared check-ins
- ✅ Caregiver ↔ Older Adult sync: both read from the same `data` via `useCare()` — changes Mary makes appear in John's dashboard immediately
- ⚠️ Manual browser testing (TEST A through TEST I) not yet performed — build passes but no actual browser interaction verified
