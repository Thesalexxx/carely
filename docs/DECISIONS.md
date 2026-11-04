# Carely — Architectural Decisions

## 1. Tech Stack

**Decision:** React 18 + TypeScript + Vite 5 + Tailwind CSS 3.4 + React Router 6 + Lucide React + localStorage.

**Rationale:** Matches the project's required tech stack. Vite provides fast dev and build; Tailwind enables a custom warm healthcare design system; React Router with HashRouter avoids GitHub Pages refresh routing issues; Lucide React provides consistent, accessible icons.

**Alternatives considered:** Next.js (rejected — requires more setup, SSR not needed for a static demo), plain CSS (rejected — Tailwind speeds up custom design), BrowserRouter (rejected — HashRouter is required for GitHub Pages compatibility).

## 2. Routing: HashRouter

**Decision:** Use `HashRouter` from `react-router-dom` instead of `BrowserRouter`.

**Rationale:** GitHub Pages serves static files from a subpath (`/carely/`). HashRouter keeps all routes behind the `#` fragment, so page refreshes and direct links work without server-side redirect configuration.

**Trade-off:** URLs contain `#` (e.g., `/carely/#/older-adult/medications`), which is slightly less clean but acceptable for a demo prototype.

## 3. Shared Data Architecture

**Decision:** Both roles (Older Adult and Caregiver) use the same underlying data via a centralized React Context (`CareProvider`) backed by `localStorage`.

**Implementation:** `src/context/CareContext.tsx` provides `CareProvider` and `useCare` hook. `src/types/carely.ts` defines typed interfaces: `MedicationReminder`, `RoutineActivity`, `WellbeingEntry`, `CarelyData`, `CareContextType`.

**Rationale:** Product requirement — Mary's actions must be visible to John's dashboard. Single source of truth ensures consistency across roles.

**Persistence:** `localStorage` key `carely_data`. Data loads on app initialization; saves on every state change via `useEffect`. Invalid or missing data falls back to fictional demo data.

**Actions exposed:**
- `acknowledgeMedication(id)` — marks medication reminder as acknowledged
- `postponeMedication(id)` — marks medication reminder as postponed
- `completeActivity(id)` — marks routine activity as completed
- `postponeActivity(id)` — marks routine activity as postponed
- `submitWellbeing(entry)` — records a wellbeing check-in (private by default)
- `shareWellbeing(id)` / `unshareWellbeing(id)` — opt-in sharing toggle for wellbeing entries

## 4. Role-Based Layouts

**Decision:** A single `Layout` component accepts a `userRole` prop (`'older-adult'` | `'caregiver'`) and renders role-specific `Header`, `Sidebar`, and page content via `Outlet`.

**Rationale:** Keeps layout code DRY while allowing role-specific navigation links and user labels. Route groups in `App.tsx` wrap pages in the appropriate `Layout`.

## 5. Design System

**Decision:** Custom Tailwind theme with warm, calm healthcare colors (primary blue, secondary green, accent red/carely slate), large readable typography (Inter font), `borderRadius: xl/2xl`, soft shadows, and reusable `Button`/`Card` components with `cn()` utility (clsx + tailwind-merge).

**Rationale:** Product direction calls for a polished, modern, warm, professional healthcare companion UI — not a generic admin dashboard. A centralized design system ensures visual consistency across pages.

**Colors:**
- `primary` (blue): primary actions, links
- `secondary` (green): success, completed states
- `accent` (red): alerts, errors, warnings
- `carely` (slate): neutral text and backgrounds

## 6. Theme Provider

**Decision:** `ThemeProvider` context exists but currently supports only `'light'` theme with no persistence or toggle.

**Rationale:** Simplicity for v1 foundation. Dark mode can be added later by extending the context value and storing preference in `localStorage`.

## 7. Responsive Layout

**Decision:** Desktop shows a fixed left sidebar (`w-64`) with main content offset by `ml-64`. Mobile (`<768px`) hides the sidebar; main content takes full width.

**Known gap:** No mobile drawer/hamburger menu replaces the hidden sidebar — navigation is unreachable on small screens. This is a known issue to fix.

## 8. GitHub Pages Deployment

**Decision:** Two independent public versions (demo and beta) are built from the same source code and hosted under one GitHub Pages origin on different paths. Each Vite build mode sets its own `base` and `outDir`:

| Mode | `base` | `outDir` | localStorage key | Seed |
|------|--------|----------|------------------|------|
| demo | `/carely/demo/` | `dist/demo` | `carely_data_demo` | Synthetic Persian demo dataset (first visit) |
| beta | `/carely/beta/` | `dist/beta` | `carely_data_beta` | Empty; user-supplied data only |

`import.meta.env.MODE` (Vite `--mode`) determines the mode at compile time. HashRouter is kept so page refreshes and direct links work on GitHub Pages subpaths without server-side redirects.

`npm run build` builds both variants into `dist/demo` and `dist/beta` without one overwriting the other. A static root landing page (`landing.html`) is copied to `dist/index.html` and links to `./demo/` and `./beta/`.

Both variants are included in a single `dist` directory deployed via GitHub Actions (`actions/upload-pages-artifact` + `actions/deploy-pages`) so neither overwrites the other.

**Implementation:** `vite.config.ts` reads `mode` from `defineConfig(({ mode }) => ...)` and sets `base`/`outDir` accordingly. `src/types/carely.ts` derives `APP_MODE` from `import.meta.env.MODE` and selects the storage key and seed data.

**Reversible:** The subpath prefix (`/carely/`) follows the GitHub repository name; rename the repo and update the prefix if the repository is renamed.

## 9. Wellbeing Privacy Model

**Decision:** Wellbeing check-ins are private by default. Mary must explicitly opt-in to share each check-in with John via a checkbox. John's dashboard only displays shared check-ins.

**Rationale:** Product requirement — wellbeing information must be private by default. Opt-in mechanism respects Mary's autonomy and privacy.

**Implementation:** `WellbeingEntry.shared` boolean defaults to `false`. Caregiver Overview filters `data.wellbeing` by `shared === true`. Share/Unshare buttons on each entry toggle the flag.

## 10. Product Boundaries (What We Will NOT Build in v1)

- No backend or authentication
- No real patient information (fictional demo data only)
- No AI medical advice or diagnosis
- No real medication notifications
- No claim that medication acknowledgment proves ingestion
- No test framework yet (quality via TypeScript strict mode + manual review)

## Reversible Decisions

- `base: '/'` → change to `base: '/carely/'` before GitHub Pages deploy
- ThemeProvider light-only → extendable to dark mode later
- Sidebar-only mobile layout → add drawer component later
- localStorage (planned) → could be replaced with a real backend later

## 11. Localization: Persian + RTL

**Decision:** Support English (default) and Persian (fa-IR) with full RTL layout. Persist language preference in `localStorage`.

**Implementation:** `src/context/LanguageContext.tsx` provides `LanguageProvider` and `useLang` hook. Translation dictionary is centralized in the context file with typed keys. Placeholder support via `{var}` substitution.

**Persian terminology (contemporary Iranian Persian):**
- Older Adult: سالمند
- Caregiver: مراقب
- Wellbeing: حال عمومی
- Wellbeing Check-in: ثبت وضعیت
- Mood: حال روحی
- Energy: میزان انرژی
- Daily Routine: برنامه روزانه
- Acknowledge: تأیید دریافت یادآور
- Reminder acknowledged: دریافت یادآور تایید شد
- Reminder postponed: یادآور به تعویق افتاد
- Awaiting response: در انتظار پاسخ
- Completed: انجام‌شده
- Postponed: به تعویق افتاده
- Caregiver Overview: نمای کلی مراقب
- Pending Actions: اقدامات در انتظار
- Missed Tasks: کارهای انجام‌نشده
- Shared: به‌اشتراک‌گذاشته‌شده
- Private: خصوصی

**RTL implementation:** Sets `document.documentElement.lang` and `dir` attributes dynamically. CSS overrides in `src/index.css` for margins, text alignment, flex direction, border radius using `[dir="rtl"]` selectors. Persian font (Vazirmatn) loaded from Google Fonts.

**Default language:** Persian (fa). The `t()` function falls back to English key if Persian translation is missing, then to the raw key.

**Medical wording accuracy:** Carely only records reminder acknowledgment, not ingestion. Translation avoids claiming medication was taken: "Mary acknowledged {count} reminders" instead of "Mary took X medications". Removed "Please confirm ingestion" and "Not yet taken" phrasing.

## 12. Medication Management Architecture

**Decision:** Medications support multiple reminder times, recurrence patterns (daily/weekly/once), start/end dates, and pause/reactivate. Separate `MedicationReminderInstance` records track each scheduled occurrence with individual acknowledgment/postponement status.

**Implementation:** `src/types/carely.ts` defines `MedicationReminder` (schedule definition) and `MedicationReminderInstance` (individual occurrence with status). `CareContext` auto-generates instances for the next 30 days when medications change.

**Rationale:** Older adults often take multiple medications at different times. Supporting recurrence patterns and multiple times per day makes the system genuinely useful. Instance-level tracking preserves history without duplicating medication definitions.

## 13. Wellbeing Tracking Architecture

**Decision:** Wellbeing entries include mood, optional energy, optional note, timestamp, and shared flag. Private by default with opt-in sharing per entry.

**Implementation:** `WellbeingEntry` interface includes `energy?: string` and `note?: string` optional fields. History view separates private and shared entries. Share/unshare buttons toggle visibility to caregiver.

**Rationale:** Mood tracking should be simple and non-intrusive. Optional notes allow Mary to add context without requiring it. Privacy is paramount — entries are private by default and Mary explicitly chooses what John can see.

## 14. Component Reuse Decisions

**Decision:** No new npm dependencies installed for medication/wellbeing features.

**Evaluated and rejected:**
- **date-fns / react-datepicker:** Native HTML5 `<input type="date">` and `<input type="time">` are sufficient and dependency-free
- **recharts:** Timeline list view is more appropriate than charts for wellbeing history
- **radix-ui / headless-ui:** Inline forms with existing Card/Button components are sufficient

**Rationale:** Keep dependency count low, maintain the existing design system, and avoid introducing UI frameworks for single components.

## Reversible Decisions

- `base: '/'` → change to `base: '/carely/'` before GitHub Pages deploy
- ThemeProvider light-only → extendable to dark mode later
- Sidebar-only mobile layout → add drawer component later
- localStorage (planned) → could be replaced with a real backend later
