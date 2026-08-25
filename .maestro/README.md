# Maestro E2E flows

These are real, runnable [Maestro](https://maestro.mobile.dev) flows covering the app's critical paths, identified in the platform audit (§10). They were authored directly against this app's current screen copy and navigation — they were **not executed in this environment** (no Android/iOS device or emulator is reachable from here), so run them once locally before trusting them as a regression gate.

## Setup

1. Install the Maestro CLI (macOS/Linux/WSL): `curl -Ls "https://get.maestro.mobile.dev" | bash`. On Windows without WSL, see https://maestro.mobile.dev/getting-started/installing-maestro for the current Windows install path.
2. These flows target the app's real bundle identifier (`com.oceanoasisdominica.app`, now set in `app.json`), which means they need a **development or production build**, not Expo Go — Expo Go always runs as its own app (`host.exp.exponent`) and Maestro can't reliably deep-link into a specific project inside it. Build one with `eas build --profile development` (needs an Expo/EAS account) or a local build via `npx expo run:android` / `npx expo run:ios`.
3. Create test accounts and pass them in as env vars rather than hardcoding real credentials into the flows:
   ```
   maestro test .maestro/guest-sign-in.yaml \
     -e GUEST_EMAIL=you-a-real-test-guest@example.com \
     -e GUEST_PASSWORD=your-test-password
   ```
   Do the same for `STAFF_EMAIL` / `STAFF_PASSWORD` on the staff flow and `MANAGEMENT_EMAIL` / `MANAGEMENT_PASSWORD` on the management flow. Never commit real credentials into these files or into a `.env` picked up by Maestro.
4. Run everything: `maestro test .maestro/`

## Coverage

| Flow | What it checks |
|---|---|
| `guest-sign-in.yaml` | Onboarding → guest sign-in → lands on Home |
| `book-activity.yaml` | Sign in → book "Champagne Reef Snorkeling" (assumes seed data) → confirmation |
| `submit-service-request.yaml` | Sign in → submit a Housekeeping request → confirmation |
| `digital-check-in.yaml` | Sign in → complete the Digital Check-In step flow (needs a "confirmed", not-yet-checked-in test reservation) |
| `book-room-reservation.yaml` | Sign in → search room availability → confirm a new reservation (Phase 1 booking engine) |
| `staff-assign-request.yaml` | Staff sign-in → open a Housekeeping request → update its status (run `submit-service-request.yaml` first to guarantee one exists) |
| `emergency-broadcast.yaml` | Management sign-in → send a real emergency broadcast — **only run against a test/staging project**, never production |

`_helpers/` holds shared sign-in sub-flows (`guest_sign_in.yaml`, `staff_sign_in.yaml`, `management_sign_in.yaml`), included via `runFlow` — not meant to run standalone.

## A known limitation

These flows match on-screen **text**, not stable element IDs — the simplest approach for a first testing investment, but it means they're written against the English locale and will need the test device/simulator's language set to English to pass. If this becomes a maintenance burden, the next step is adding `testID` props to key interactive elements and switching selectors to `id:` — a good Phase 3 follow-up once these flows have proven their value.
