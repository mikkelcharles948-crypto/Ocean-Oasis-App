# Ocean Oasis — UI/UX Audit

Prepared as Phase 1 of the luxury-hospitality redesign brief. This document is a factual inventory of what exists today, not a proposal — recommendations are called out explicitly where they appear. Per the brief, no UI code has been changed as part of this audit.

---

## 1. Current Navigation

Three separate root navigators, chosen at runtime by `RootNavigator.js` based on which "experience" (`guest` / `staff` / `management`) the signed-in profile resolves to. All three share the same `AppContext` data layer.

- **`MainTabs.js`** (guest) — `@react-navigation/bottom-tabs`, 5 tabs: Home, Explore, My Stay, Requests, Profile. Each tab wraps its own `@react-navigation/native-stack` navigator so the ~35 shared detail screens (`sharedScreens.js`) are reachable from any tab.
- **`StaffTabs.js`** — 5 tabs: Dashboard, Requests, Rooms, Activities, More (More is itself a stack holding 7 secondary screens).
- **`ManagementTabs.js`** — similar shape, 5 tabs with a More stack.
- **`RootNavigator.js`** gates: Onboarding → biometric lock (if enabled) → Experience Select → per-surface sign-in → the matching tab navigator.

**Tab bar chrome** (all three): a custom `GlassSurface` (frosted `expo-blur` panel) background, 144px tall, with a 66px Ocean Oasis wave-mark logo band above a standard icon+label row. This was built earlier in this project specifically to make the logo prominent — it is the newest navigation element and the one most likely to need rethinking for a more editorial, less "app chrome" feel.

**Screen headers**: a shared `ScreenHeader` component (in `src/components/UI.js`) used by nearly every non-tab-root screen — a frosted glass bar with a small centered logo band, a back chevron, a centered title, and an optional right-side action. This is the single most reused piece of chrome in the app (~40+ call sites) — redesigning it once has outsized leverage.

**No custom transitions**: every push/pop between screens uses `@react-navigation/native-stack`'s default platform transition (slide on iOS, fade/slide on Android). There is no shared-element transition, no image-expansion effect, no custom animated header collapse anywhere in the codebase today.

## 2. Current Screen Hierarchy

74 screen files total.

| Area | Screens | Notes |
|---|---|---|
| Onboarding/Auth | 8 | Welcome, Sign In, Create Account, Forgot Password, Magic Link, Reservation Access, Biometric Lock, Onboarding carousel |
| Experience | 2 | Experience Select, Ops (staff/mgmt) Login |
| Home | 1 | Single dashboard-style screen |
| Explore | 5 | List, Destination Detail, Map, Local Guide, Trail Maps |
| Activities | 3 | List, Detail, Book |
| Dining | 3 | List, Venue Detail, Menu |
| Events | 2 | List, Detail |
| Promotions | 1 | List (no detail screen — promotions link straight to the list) |
| My Stay | 5 | Overview, Digital Check-In (9-step flow), Room Preferences, New Reservation, Book Room |
| Requests | 3 | List, New Request, Request Detail |
| Feedback | 1 | Single screen, star ratings + free text |
| Profile | 10 | Root, Details, Preferences, Past Stays, Language, Accessibility, Terms, Privacy Policy, Privacy Settings, Loyalty |
| Itinerary / Notifications / Concierge / Contact | 4 | One screen each |
| Billing / Hotel Info | 2 | Folio, Hotel Amenities |
| Staff | 12 | Dashboard, Requests, Rooms, New Booking, Activities, Guests, Maintenance, Events, Feedback, Notifications, Profile, More |
| Management | 12 | Overview, Guest Experience, Operations, Promotions, Revenue, Activity Analytics, Content, Staff Performance, Audit Log, Settings, Emergency Broadcast, More |

**Guest-facing total: ~50 screens.** The brief's "core journey" list (Home, Explore, Activity Detail/Booking, My Stay, Service Request, Events, Promotions, Feedback, Profile) covers roughly 14 of these — a sensible Phase-1 slice, leaving ~36 guest screens plus all 24 staff/management screens to receive the design system in later passes rather than a full redesign.

## 3. Existing Design System

`src/theme/theme.js` — small, already-typed-token style, not a formal system:

- **Colors**: `deepOcean #0B3B45`, `deepOcean2 #092E37`, `turquoise #2FB8B0` / `turquoiseDark #1E938C`, `forest #2E5E45`, `sand #E9DCC3` / `sandLight #F4ECDC`, `ivory #FBF8F2`, `gold #C6A25D` / `goldSoft #DCC48E`, `charcoal #22302F`, `slate #5C6B6A`, plus `error`/`success`/`border`/`overlay`. This palette is already close to the brief's requested direction (deep ocean, ivory, sand, gold accent) — it does not need to be invented from scratch, but it has been applied inconsistently (see §9).
- **Spacing**: a 6-step scale (`xs:4` → `xxl:48`).
- **Radius**: `sm:8` → `xl:30`, plus `pill:999`.
- **Type**: exactly two font families — `display: Georgia/serif` and `body: System/sans-serif` — no defined type scale (font sizes are set ad hoc per-screen, typically 11–26px, no named steps like "Heading" or "Caption").
- **Shadow**: two presets (`soft`, `card`) plus a third, `float`, added during an earlier visual pass for "elevated" photo cards.
- **Gradients**: a `gradients` token object (`ocean`, `deep`, `forestTurquoise`, `gold`, `success`, `scrim`) added during the same earlier pass, used inconsistently — many screens still construct inline `LinearGradient` color arrays rather than referencing these tokens.

**Assessment**: the palette and spacing scale are usable foundations. There is no real typographic system (no named scale, only one serif + one sans, no defined weight/tracking rules), no component-level design tokens (buttons/cards define their own colors inline rather than referencing shared "primary action" / "surface" concepts), and no motion tokens at all.

## 4. Existing Reusable Components

`src/components/`:

- **`UI.js`** — the de facto component library: `Card`, `SectionHeader`, `Badge`, `StarRating`, `ScreenHeader`, `EmptyState`, `ErrorState`, `OfflineBanner`, `IconTile`, `Field`, `Pill`, `KpiCard`, `ProgressBar`, `timeAgo()`. All plain `View`/`Text`/`TouchableOpacity` with `StyleSheet.create` — no animation, no variants system, single default look each.
- **`Button.js`** — one component, 4 visual variants (`primary`/`secondary`/`outline`/`ghost`), no loading-skeleton state beyond a spinner swap, no icon-leading pattern beyond a raw `icon` prop.
- **`GlassSurface.js`** — the app's "Liquid Glass" building block, wraps `expo-blur`'s `BlurView` with Ocean-Oasis-tinted overlay/border colors. Used for tab bars, `ScreenHeader`, and several staff modal sheets. This is a genuinely reusable, on-brand primitive — likely worth keeping and extending rather than replacing.
- **`Logo.js`** — recently rebuilt to use two processed transparent PNGs (full lockup + mark-only crop) instead of the original opaque-background source art. Supports a `variant` (`full`/`mark`) and `light` (frosted-panel wrapper for dark backgrounds) prop.
- **`ImagePlaceholder.js`** — the only image-handling component in the app: renders a real photo via a `uri` prop with `resizeMode="cover"`, falling back to a flat gradient + icon when no photo exists or the URL fails to load. No aspect-ratio presets, no crop-focus control, no blur-up/skeleton loading state, no video support.

**No component exists today** for: hero media (image or video), editorial section layout, image carousel/gallery, animated status pill/progress indicator, bottom sheet, skeleton loading state, or shared-element-style image transition. All would be new builds, not modifications.

## 5. Existing Animations

There is effectively no custom animation in the app today:

- Zero usages of React Native's `Animated` API anywhere in `src/` (confirmed by search).
- No `react-native-reanimated` dependency installed.
- No shared-element/transition library installed.
- "Motion" today is limited to: `TouchableOpacity`'s built-in `activeOpacity` press-fade, React Navigation's default stack push/pop transition, and `RefreshControl`'s native pull-to-refresh spinner (used on a handful of list screens).
- No entrance animations, no parallax, no scroll-driven effects, no skeleton shimmer, no reduced-motion handling anywhere.

**This is the single largest capability gap relative to the brief.** Sections 8, 9, 16, 27, and 38 of the brief (scroll motion, screen transitions, micro-interactions, home entrance sequence, animation rules) all assume infrastructure that does not exist yet. Recommendation: adopt `react-native-reanimated` (the standard, native-thread-driven choice for this class of work in the current Expo/RN architecture) as a Phase 2 dependency before attempting any of the motion-heavy sections — trying to build parallax/shared-element effects on the bare `Animated` API or CSS-only transitions would be materially harder and less performant.

## 6. Existing Image/Video Support

- **Images**: real photography already exists throughout the app — destinations, activities, dining, events, and promotions all carry a verified real Wikimedia Commons `imageUrl` (sourced deliberately this project, not stock filler), rendered via plain RN `Image` inside `ImagePlaceholder`. There is no image caching/prefetching library (`expo-image` is not installed; plain `Image` has weaker cache control and no blur-up placeholder support).
- **Video**: no video capability exists at all. Neither `expo-av` nor `expo-video` is installed. A cinematic hero video background (brief §4) is a net-new capability, not an extension of something present.
- **Asset organization**: `assets/` currently holds only app icons and the two processed logo files — there is no `assets/images/{hero,activities,rooms,events,promotions,dining,nature}/` structure. All real photography is remote (hotlinked Wikimedia URLs), not bundled locally; there are no local photos of the hotel property itself, since none exist publicly (confirmed earlier this project) — only real Dominica destination/landscape photography. Any hero imagery depicting the hotel building/rooms specifically will need real photography supplied by the hotel, not sourced imagery, or must honestly depict the island rather than claim to depict the property.

## 7. Screens That Should Be Redesigned First

Matches the brief's own core-journey list, mapped to what exists today:

1. Onboarding/Welcome (`OnboardingScreen`, `WelcomeAuthScreen`) — first impression, currently a standard slide carousel with flat gradient backgrounds.
2. Home (`HomeScreen`) — currently a vertically-stacked dashboard: hero photo band, My Stay card, an 8-tile icon grid ("Quick Actions"), then horizontally-scrolling card rails for events/recommended/promotion. This is the screen furthest from the brief's "editorial, one-or-two-CTA hero" vision and the highest-leverage rebuild.
3. Explore (`ExploreScreen`, `DestinationDetailScreen`) — currently a filterable list of photo+text rows; the brief wants full-bleed editorial cards.
4. Activity Detail/Booking (`ActivityDetailScreen`, `BookActivityScreen`) — currently fairly close in spirit (large hero photo already exists) but ends in a conventional form-style booking flow.
5. My Stay (`MyStayScreen`) — currently a dense stack of cards (check-in banner, stay details grid, timeline, amenities, room upgrades) — needs the hierarchy pass described in brief §13.
6. Service Request (`NewRequestScreen`) — currently a category-tile grid + text field, structurally already close to brief §14's flow but visually generic.
7. Events (`EventsScreen`, `EventDetailScreen`) and Promotions (`PromotionsScreen`) — currently plain list/card screens, no "editorial calendar" or "curated, not salesy" treatment yet.
8. Feedback (`FeedbackScreen`) — currently a flat list of 6 category star-rows; brief wants a single-moment, conversational feel.
9. Profile (`ProfileScreen`) — currently a standard settings-list screen; lowest priority for cinematic treatment but should still inherit the type/spacing system.

## 8. Components That Can Be Reused

- `GlassSurface` — on-brand, performant, already used across guest/staff/management; keep and extend (e.g. for a new bottom-sheet or floating nav).
- `theme.js`'s color palette and spacing scale — a reasonable foundation to formalize into a real token system rather than replace.
- `Logo.js` — just rebuilt with proper transparent assets; reuse as-is.
- The Supabase service layer (`src/services/supabaseData.js`, `supabaseStaffData.js`) and `AppContext.js` — brief explicitly requires preserving these; no UI redesign should need to touch them except where a screen's data shape genuinely needs to change (none identified so far).
- `i18n` system (i18next, 1092 keys × 4 languages, plus the per-record content-translation layer in `src/i18n/content/`) — must be preserved and extended, not replaced, as new copy is written.

## 9. Components That Should Be Replaced or Rebuilt

- **`ImagePlaceholder`** — needs to become a real `HeroMedia`/`EditorialImageCard` family with aspect-ratio presets, crop-focus, a proper loading/skeleton state, and (new) video support with image fallback — this is an extension point, not a scrap-and-restart.
- **`ScreenHeader`** — currently a fairly heavy, literal "app chrome" bar (glass panel + logo band + back button + centered title) on nearly every screen. The brief wants navigation that can go translucent/overlaid/dynamically-tinted depending on what's behind it, which this component doesn't support today (it always renders its own opaque-ish glass background). Worth a dedicated redesign given its ~40-screen reach.
- **Home's 8-tile "Quick Actions" icon grid** — the most "generic app template" element in the current UI per the brief's own anti-goals list; the editorial section flow in brief §5–6 effectively replaces this pattern.
- **Ad hoc inline `LinearGradient` calls** scattered across screens instead of the `gradients` theme tokens — should be consolidated once a real token system exists, both for consistency and so a future palette change doesn't require hunting through every screen file.

## 10. Performance Risks

- **No image caching/prefetch layer.** Plain RN `Image` re-fetches from Wikimedia on every mount in some flows; `expo-image` would materially improve this and is a near-prerequisite for a photo-forward redesign.
- **Video, once added, is the single biggest new performance risk** the brief itself calls out (§4, §20) — no video infrastructure exists yet to audit, but autoplay-looping background video on a Home screen is exactly the kind of feature that can tank frame rate / battery / data usage on mid-range Android hardware if not sized and encoded carefully, with a hard fallback to static image.
- **`react-native-reanimated` is not installed.** Any scroll-driven parallax/opacity work done on the plain JS-thread `Animated` API (rather than Reanimated's UI-thread execution) risks visible jank during scroll, which is precisely the "does it remain fast" bar the brief holds the redesign to.
- **`GlassSurface`/`BlurView` is already used fairly heavily** (3 tab bars + ~40 screen headers + several modals); blur is one of the more GPU-expensive RN effects, worth profiling before adding still more of it as part of a "floating/translucent nav" treatment.
- Lists (Explore, Activities, Requests, etc.) currently use `FlatList` already — reasonable; no screen was found rendering a large collection with a bare `.map()` inside a `ScrollView`, which is the more common perf trap.

## 11. Accessibility Risks

- Several icon-only `TouchableOpacity` buttons across the app lack an `accessibilityLabel` (e.g. header back chevrons, several tab-bar-adjacent icon buttons) — a pre-existing gap, not introduced by this brief, but worth fixing in the same pass as any header/nav redesign since that's exactly the component being touched.
- No reduced-motion handling exists anywhere today — trivially true, since no motion exists to gate. This needs to be designed in from the start of Phase 2 (e.g. a small `useReducedMotion()` hook wrapping `AccessibilityInfo.isReduceMotionEnabled()`) rather than retrofitted once dozens of screens have their own ad hoc animation code.
- Text-on-photo contrast is currently handled per-screen via hand-tuned gradient scrims (e.g. Home's hero band) rather than a shared, tested pattern — worth formalizing into one `HeroMedia` overlay treatment (brief §26) so contrast is solved once, correctly, rather than re-derived per screen.
- Full i18n coverage (4 languages) is already in place, which is itself a real accessibility/inclusion strength worth preserving carefully through the redesign — long-running French/German-style translations are more prone to clipping in tightly-sized UI, so any new component (pills, tab labels, CTAs) needs to be built to accommodate text longer than its English source string from day one.

## 12. Recommended Ocean Oasis Visual Direction

The existing palette (`deepOcean`, `ivory`, `sand`, `gold`, `forest`, `turquoise`) already substantially matches what the brief asks for — deep ocean near-black, warm ivory, sand, a natural green, ocean blue, a warm metallic accent. The recommendation is to **formalize and discipline this existing palette** rather than invent a new one:

- Promote `deepOcean`/`ivory`/`sand`/`gold` to the primary editorial palette (backgrounds, headlines, primary CTAs); keep `turquoise`/`forest` as secondary/semantic accents rather than default UI color, which is closer to how they're already used in the strongest parts of the current app (e.g. the Loyalty screen's gold gradient) and furthest from the weakest (Home's 8-color icon grid, one color per tile — the most "generic app template" visual in the codebase today).
- Introduce a real named type scale (Display/Hero/Heading/Subheading/Body/Caption/Label) on top of the existing Georgia + System pairing — the brief doesn't require a new typeface, and the existing serif display font is already editorial in character; the gap is a missing *scale and discipline*, not the fonts themselves.
- Treat `GlassSurface` as the app's one "translucent chrome" primitive and extend it (rather than adding a second competing translucency system) for any new floating nav or bottom-sheet work.

## 13. Recommended Implementation Order

Matches the brief's own Phase 3–13 sequence, with two additions based on what this audit found:

1. **Phase 2 (design system)** should include, before any screen work begins: installing `react-native-reanimated` and (recommended) `expo-image`; building the type-scale and motion-token layer; building `HeroMedia`/`HeroVideo` with graceful video→image fallback; building one `useReducedMotion()` hook.
2. Home (Phase 3) is correctly the highest-priority single screen — it's both the first impression and the screen structurally furthest from the target.
3. Explore/Activities (Phases 4–5) next, since they already have the most real photography in place and the least distance to travel visually.
4. My Stay and Service Requests (Phases 6–7) are functionally the "heart of the app" per the brief and should keep every existing data path (bookings, requests, check-in, folio, housekeeping preference, room upgrades) working exactly as today — these phases are almost entirely visual/hierarchy work, not new features.
5. Events/Promotions/Feedback (Phases 8–9) are the smallest screens by scope and a good place to prove out the editorial-card and single-moment-feedback patterns before Phase 10 spreads them everywhere else.
6. Phase 10 (remaining ~36 guest screens + 24 staff/management screens) is the largest phase by screen count; staff/management screens are lower priority for the "luxury guest" feel specifically (the brief's audience is the guest, not internal staff tooling) and could reasonably receive a lighter version of the same design system rather than the full cinematic treatment.
7. Phases 11–13 (performance, accessibility, consistency audit) should not be saved entirely for the end given the risks in §10–11 — recommend a lightweight pass after Home and after My Stay specifically (the two heaviest screens), not only once at the very end.

---

**Per the brief: no implementation has begun.** This document is Phase 1 only. Awaiting direction to proceed into Phase 2 (design system).
