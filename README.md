# Ocean Oasis Platform — Guest, Staff & Management

One React Native / Expo app containing **three interconnected experiences** for Ocean Oasis Hotel, Dominica — Guest, Staff Operations, and Management & Analytics — sharing a single live data store. Built to run instantly in **Expo Go** via **Expo Snack** or locally.

## Why one app instead of three

Staff and Management were originally built as a separate web dashboard project, but that couldn't run inside Expo Go on a phone — which is what you need for a live sales demo. So they've been rebuilt as real screens *inside this same Expo app*, sharing the exact same in-memory data (`src/context/AppContext.js`) as the Guest experience. Because it's one JS runtime with one Context, this is genuinely interconnected, not simulated:

- A guest submits a request → it appears instantly in the Staff Requests queue with the correct department/priority.
- Staff assigns/updates a request's status → the guest's Requests screen reflects it (shared array, single source of truth).
- Staff or Management creates an activity, publishes an event, or publishes a promotion → it appears immediately in the Guest App's Explore/Events/Promotions screens (guest screens read live from Context, not a static file).
- A guest books an activity → capacity is enforced (overbooking is rejected) and the booking is instantly visible to staff and rolled into Management's utilization/revenue analytics.
- A guest leaves a low rating → a staff notification + a Management "needs attention" alert appear immediately.

Every important mutation is also written to a shared audit log, visible in the Management Dashboard.

## How to open each experience

Launch the app -> complete onboarding -> you land on **"Which view would you like to open?"** with three options:

- **Guest Experience** -> the existing reservation/email sign-in flow -> the 5-tab Guest App.
- **Staff Operations** -> pick a demo team member (e.g. James Douglas, Front Desk) -> 5-tab Staff Dashboard.
- **Management & Analytics** -> pick a demo manager (e.g. Marcus Bellamy, General Manager) -> 5-tab Management Dashboard.

From inside Staff or Management, **Profile/Settings -> Switch Experience** returns you to that picker without losing any data — the shared Context keeps everything (guests, requests, activities, etc.) intact across switches, which is exactly what you want mid-demo.

Demo sign-in is a name/role picker, not real credentials — clearly labeled as such in-app. `ROLE_SURFACES` in `src/data/mockData.js` gates who can open which surface (e.g. Housekeeping -> Staff only; Hotel Owner -> Management only; General Manager -> both, with the Switch Experience link).

## What's inside

**Guest** (5 tabs): Home, Explore, My Stay, Requests, Profile — onboarding, auth, digital check-in, activities/events/dining, itinerary, promotions, notifications, feedback, concierge FAQ. Several screens (Activities, Events, Promotions, Home) now read live from the shared Context instead of static mock data, so Staff/Management publishing flows directly.

**Staff Operations** (5 tabs: Dashboard, Requests, Rooms, Activities, More): command-center home with priority queue and urgent alerts; full request lifecycle (acknowledge -> assign -> in progress -> complete, with internal notes); 37-room housekeeping status board; activities management with live booking/capacity tracking; maintenance work orders; guest directory with full profile drill-down; events publishing; feedback with low-rating service-recovery flow; notifications; profile.

**Management & Analytics** (5 tabs: Overview, Experience, Operations, Promotions, More): KPI overview (occupancy, satisfaction, open requests, platform revenue); guest experience analytics (satisfaction by category, open alerts); operations analytics (department performance, response/resolution times — calculation shown, not hard-coded); revenue analytics (explicitly separating **platform-attributed revenue** from **total hotel revenue**, since only activity/promotion transactions are actually tracked here); activity utilization analytics; promotions CMS with publish/archive + funnel metrics; content CMS (draft/scheduled/published/archived); staff performance; audit log; property settings.

Polished loading, empty, and error states throughout; a reusable component library (`src/components`); a single mock data layer (`src/data/mockData.js`) structured so every screen can point at a real API later without rewriting UI.

## Real Ocean Oasis details

Pulled from oceanoasisdominica.com and used throughout the app: 37 rooms, flagship restaurant "Tide & Table," Castle Comfort/Roseau address, real phone (+1 (767) 255-8500) and email (see `PROPERTY_INFO` in `mockData.js`, used in Contact Reception and Management Settings). The logo (`assets/logo.png`) is the real Ocean Oasis wordmark, wired into `src/components/Logo.js`.

## Run it in Expo Go (via Expo Snack)

1. Go to **snack.expo.dev**.
2. Unzip this project locally, then drag the *contents* of the folder (not the zip itself) into Snack's file panel — or use Import Repository if you push it to GitHub first.
3. Snack should auto-detect dependencies from the `import` statements; if anything's flagged missing, add it by name from `package.json`.
4. Scan the QR code with Expo Go on your phone.

## Run it locally instead (more reliable for a project this size)

```
npm install
npx expo start
```
Then scan the QR code with Expo Go. If it doesn't connect (restrictive Wi-Fi/VPN), use `npx expo start --tunnel`.

## Supabase setup

The app is configured for Supabase Auth, Realtime, and the initial database schema.

1. Copy `.env.example` to `.env.local` and set the Supabase URL and publishable key.
2. Install the Supabase CLI, then authenticate with `supabase login`.
3. Link the project and apply the migration:

```
npx supabase link --project-ref zmwsyhzelweigdgaerhs
npx supabase db push
```

The schema and Row-Level Security policies are in `supabase/migrations/`. The mobile client is in `src/lib/supabase.js`. Supabase Auth session persistence, guest data loading, persisted profile/request/booking operations, and scoped service-request Realtime updates are wired into `src/context/AppContext.js`.

For local development only, run `npx supabase start` followed by `npx supabase db reset` to apply migrations and the repeatable seed in `supabase/seed.sql`. Never run `db reset` against the linked production project. Staff roles must be assigned by an administrator in Supabase; new Auth users are created as guests and cannot self-promote.

## Architecture notes (for connecting a real backend later)

- All state — guest, staff, and management — lives in one `src/context/AppContext.js`. Every mutation (submit a request, assign staff, update room status, publish a promotion, book an activity with capacity enforcement) is a named function already called by name from screens, not inline setState. Swapping the internals for real API calls (Supabase is a natural fit given the shape of this data) means editing this one file — no screen changes.
- `src/data/mockData.js` is the seed/schema layer: guest, reservation, room, activity, event, promotion, service request, maintenance issue, staff directory, audit log, content item.
- Navigation: three top-level experiences (`MainTabs.js` for Guest, `StaffTabs.js`, `ManagementTabs.js`), each a 5-tab bottom navigator with its own nested stack, all mounted from one `RootNavigator.js` that branches based on Context state (`experience`, `isAuthenticated`, `opsSession`).
- What a real backend migration adds beyond this: persistence across app restarts/devices, real authentication, actual cross-device sync (right now "interconnected" means one shared JS Context within a single running app instance — it does not sync between two different phones running the app separately), and enforcement of role-based access at the server layer rather than just in the client UI.
