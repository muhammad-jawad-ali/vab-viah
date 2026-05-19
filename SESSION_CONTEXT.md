# Session Context — RishtaAI Frontend (Vab-Viah)

> **Read this file at the start of EVERY session, before doing anything else.**
> **Update this file at the END of EVERY session, before committing.**
> This is the working memory across all sessions. Do not skip the update step.

---

## How to use this file

1. **At session start:**
   - Read sections 1, 2, 3 in order.
   - Confirm with the user which session number you are about to run.
   - Read the relevant "Session N" block in `MASTERPLAN.md` §7.
   - Read the backend route file(s) listed under that session's "Reads first".
   - State your plan back to the user before writing any code.

2. **During the session:**
   - Update "In Progress" in section 2 whenever you switch tasks.
   - Append to "Blockers" in section 2 when anything blocks.
   - Append to "Decisions Made" in section 5 for every architectural choice.

3. **At session end:**
   - Move items from "In Progress" to "Done in this session" with a one-line description.
   - Fill "Handoff for next session" in section 6.
   - Update "Last updated" with timestamp + session number.
   - Commit with message `session N: <summary>` from inside `frontend/vab-viah/`.

---

## 1. Current status snapshot

- **Project phase:** Session 4 COMPLETE — booking + dispute + feedback now wired end-to-end against the real backend. Match flow regressions from Session 3's device test all swept. BookingScreen collects user+candidate wali, POSTs /book/initiate, subscribes to /stream/:flowId, renders proposed (slot, venue) pairs + an expandable wali-brief panel (per-language tabs, lazy-loaded expo-av audio player, native Share for SMS preview), POSTs /book/confirm with the chosen slotIndex, and renders a receipt with the locked venue + reminder schedule + confirmation SMS. DisputeFormScreen wires /dispute/file and renders the typed DisputeResolution (severity 1..5 + action label + agent rationale + per-party reputation deltas + blocklist updates + escalated badge). FeedbackSurveyScreen wires /feedback/post-meeting with the four required ratings, displays the Twin v2 weights diff, and re-fetches /twin/me. WaliTab gone from MainTabs (non-negotiable #6 enforced). Session 5 next = premium UI polish + remaining time-boxed cleanup.
- **Frontend repo:** `frontend/vab-viah/` (git remote: `https://github.com/muhammad-jawad-ali/Lab-Viah-Frontend.git`). Pushed to branch `integration/session-1-foundation`.
- **Backend status:** Backend touched in Session 4 for two demo-critical JSON-truncation fixes (twin_forge Layer-3 statements + moderator final synthesis). Bump tokens 2048→4096 / 1024→2048, plus a hand-rolled `repairTruncatedJson` utility that closes unterminated strings/brackets/colons before falling back to deterministic output. Backend repo: `ZakiNabeel/Lab-Viah` branch `backend/main`, pushed → Railway auto-deploy.
- **Backend Railway URL:** `https://lab-viah-production.up.railway.app` — frontend `.env` points here.
- **Backend dev URL:** `http://localhost:3000` (rarely needed now — Railway is the device-test target).
- **Dev OTP bypass:** `+923001234567` / `0000` works on both dev and Railway.
- **Days until 20 May submission:** 1 (today is 2026-05-19).
- **Last updated:** 2026-05-19 by Session 4 (booking + dispute + feedback + wali decouple + JSON repair).

---

## 2. Live working state

### In progress

*(What is being worked on RIGHT NOW. Empty at session boundaries.)*

- *(none — Session 1 ended cleanly)*

### Done (cumulative, across all sessions)

**Pre-Session 1 setup (2026-05-18):**

- [x] Backend audit completed against `backend/MASTERPLAN.md` — all 15 endpoints, 8 agents, 4 workplans, 6 DB tables, SSE shape verified.
- [x] Frontend audit completed — 16 screens enumerated; zero real network calls confirmed; mock data sources mapped.
- [x] Gap inventory documented (see MASTERPLAN §5) — frontend was built against a different API spec.
- [x] User decisions captured: real SSE, wali decoupled (no standalone tab, brief lives in BookingScreen), moderate frontend scope + premium aesthetic.
- [x] `frontend/vab-viah/MASTERPLAN.md` written — 5 sessions scoped with deliverables, exit checks, "reads first" hints.
- [x] `frontend/vab-viah/SESSION_CONTEXT.md` written (this file).

**Session 1 (Foundation — 2026-05-18):**

- [x] **Pulled remote state.** Backend pulled teammate's deployment commits (`5be7299` Session 6 doc update + `8018b6b` Node 22 engine + self-healing GCP creds + ws polyfill). Frontend already up to date. Local cosmetic whitespace on `backend/SESSION_CONTEXT.md` stashed then dropped.
- [x] **Verified pre-existing teammate work.** `talhashafi-04` did attempt frontend integration (commit `7516496` "Completed high-premium Auth, Onboarding, Match Pool, Live Debate, Compatibility Reports, Wali") but frontend repo owner `Muhammad Jawad Ali` rolled it back (`6861a2d` "rollback frontend screens and store to stable state"). Our audit was on the rolled-back stable state — no duplication of work.
- [x] **`.env` + `.env.example`** with `EXPO_PUBLIC_API_URL=http://localhost:3000` and documentation for device/tunnel/Railway scenarios. `.gitignore` updated: `.env` ignored, `.env.example` tracked.
- [x] **Installed deps:** `npx expo install react-native-sse expo-secure-store expo-av`. Resulting versions: `react-native-sse@^1.2.1`, `expo-secure-store@~15.0.8`, `expo-av@~16.0.8`. `app.json` automatically updated to include `plugins: ["expo-secure-store"]`.
- [x] **`src/api/types.ts`** — mirrors backend types verbatim: `ApiResponse`, `TraceEvent` (full 11-variant union with `ts`), `Dimension` (8 dims including `dealbreakers`), `TwinSpec`, `CompatibilityReport`, `Meeting`, `DisputeResolution`, all onboarding/match/book/feedback request+response pairs. Includes `ApiError` class (typed: `code`, `message`, `status`, `details`). Adapter `toFrontendMatch(report)` scales `overall_score * 100` → `compatibilityScore`. `DIMENSION_LABELS` maps `dealbreakers` → "Boundaries" for UI display.
- [x] **`src/api/auth.ts`** — `saveAuth(token, userId)`, `loadAuth()`, `clearAuth()`, `getAuthTokenSync()`. Backed by `expo-secure-store` (with in-memory web fallback for harness compat). Mirrors into Zustand `setAuth` so React components can read synchronously.
- [x] **`src/api/client.ts`** — `apiFetch<T>(path, opts)` with envelope unwrap, `ApiError` throw, auto `Authorization: Bearer` header, 401 auto-clearAuth. Typed `api.*` wrappers for ALL 16 endpoints (full impl for /auth/* and /twin/me; later sessions adjust shapes as routes are read). Also `buildStreamUrl(flowId)` for the SSE wrapper landing in Session 3. Reads `EXPO_PUBLIC_API_URL` (defaults to `http://localhost:3000` with a dev-only console.warn).
- [x] **`App.tsx`** — awaits `loadAuth()` before mounting NavigationContainer. Shows a brief `ActivityIndicator` on the primary background during boot to avoid initial-route flash.
- [x] **`src/navigation/AppNavigator.tsx`** — `initialRouteName` now reads `useAppStore.token`: if a token exists, boots into `Main`; otherwise `Signup`. Existing stack screens preserved unchanged (Session 2 will introduce the `OnboardingStack`).
- [x] **`src/screens/SignupScreen.tsx`** — real OTP flow. "Send Code" → `api.auth.otpStart({phone})` with E.164 normalization (`countryCode + digits`). "Verify Identity" → `api.auth.otpVerify({phone, otp})` → `saveAuth(access_token, user_id)` → `navigation.reset` to `ProfileSetup` (Session 2 will change this destination). Dev hint surfaced in `__DEV__` only ("Use +923001234567 with code 0000"). Backend `dev: true` flag on otpStart surfaces a small Alert. Loading state on submit button. "Wrong number? Edit" link goes back to phone entry.
- [x] **`useAppStore.ts`** — no changes required. Existing `setAuth(token, userId, {isProfileComplete, hasTwin})` and `logout()` actions are compatible with `auth.ts`. Session 2 will add `onboardingSessionId`.
- [x] **`package.json`** — added `"typecheck": "tsc --noEmit"` script.
- [x] **Typecheck clean** — `npm run typecheck` returns 0 with `strict: true` (per `tsconfig.json`).
- [x] **Session 1 git commit** in `frontend/vab-viah` on branch `integration/session-1-foundation`, pushed to GitHub.

**Session 2 (Onboarding restructure — 2026-05-18):**

- [x] **Pre-flight.** `git -C frontend/vab-viah fetch + pull --ff-only origin integration/session-1-foundation` was up-to-date. No local divergences. Branch policy confirmed: stay on `integration/session-1-foundation` per user instruction; Session 2 commits land here, not a new branch.
- [x] **OTP network fix.** Diagnosis (Session 1 device test failure on `/auth/otp/start`): two issues identified. (a) iOS App Transport Security rejects plain `http://` by default → `app.json` now sets `ios.infoPlist.NSAppTransportSecurity.NSAllowsArbitraryLoads = true` and `android.usesCleartextTraffic = true`. (b) `.env` / `.env.example` lacked guidance on swapping localhost → laptop LAN IP for physical devices; expanded with explicit ipconfig / firewall / tunnel / Railway hints. Backend already binds `0.0.0.0` (server.ts line 82), so no backend change. **Real-device verification still pending — user runs the smoke test.**
- [x] **`src/api/types.ts` realigned with backend.** Source of truth is now `backend/src/routes/onboarding.routes.ts` (read end-to-end). Drift fixed: Layer1 body uses `text`/`audioBase64`/`language` (not `message`/`language_pref`); Layer1 response carries `turn: OnboardingTurnResult` + `turnNumber` + `payload` (not flat next_prompt/done). Layer2 body uses `optionId` (not `choiceIndex`); response is `radar: RadarState` ({vector, cardsAnswered, cardsRemaining}). Layer3 dispatch is by PRESENCE of `corrections`, no `mode` field; both modes return `statements: TwinStatement[]`. Wali requires `override` object (inner all optional) + E.164 `wali_phone` + optional `notes`; response carries `conflicts: ConflictFlag[]`. Finalize returns `{twinId, spec, traceEventCount}` (not `{twinId, twin}`). `/twin/me` returns `{twinId, spec, version, createdAt, updatedAt}`. Added mirrors: `OnboardingTurnResult`, `OnboardingPayload`, `OnboardingNextTopic`, `RadarState`, `RadarVector`, `TwinStatement`, `WaliOverride`, `ConflictFlag`, `Layer3Correction`.
- [x] **`src/api/onboardingState.ts`** — SecureStore-backed persistence module mirroring auth.ts pattern. Stores `{sessionId, lastLayer (0-4), answeredCardIds[]}` as JSON under one key. Mirrors into Zustand so React components read synchronously. `saveOnboardingState`/`loadOnboardingState`/`clearOnboardingState`. Also wired into `auth.clearAuth()` so logout/401 wipes the resume pointer (sessions are bound to user_id server-side).
- [x] **`src/data/scenarioCards.ts`** — local mirror of the 12 backend scenario cards (English-only labels for MVP; full localization is Session 5 polish). Card IDs match `backend/src/content/scenario-cards.ts` exactly — backend computes dimension contributions server-side from `{cardId, optionId}` so we never send labels.
- [x] **5 new onboarding screens** under `src/screens/onboarding/`:
  - `OnboardingLayer1Screen.tsx` — Layla chat UI with optimistic user bubbles + agent typing indicator. Text input only (no voice in this session). Chip-fallback chips rendered when backend returns `chip_options` (low-confidence STT/extraction signal). Auto-advances to Layer 2 when `turn.next_topic === 'done'`. Persists sessionId on first successful turn.
  - `OnboardingLayer2Screen.tsx` — walks 12 cards from `nextUnansweredCard(answeredIds)`. POSTs per option pick; live signed radar (8 dims, centered bars showing positive/negative deltas) updates from backend's running personalityVector. Auto-advances when `cardsRemaining.length === 0`.
  - `OnboardingLayer3Screen.tsx` — on mount POSTs layer3 with no corrections → renders statements. User toggles Yes / Not-quite per dimension and (if Not-quite) writes a correction (max 500 chars). Submit POSTs 1..3 corrections (backend cap).
  - `OnboardingWaliScreen.tsx` — prominent "Skip ➔" chip in header + bottom "Skip — I'll add later" link. Form: E.164 phone, chip-row overrides (deen_level / family_setup / kids_timeline), notes (max 1000). Per MASTERPLAN non-negotiable #6, the user is never blocked here.
  - `OnboardingFinalizeScreen.tsx` — final review tile + "Forge My Twin" CTA. POSTs `/onboarding/finalize`, stashes returned `spec` into Zustand `twinSpec` (which auto-sets `hasTwin = true`), clears persisted onboarding state, resets navigation into Main.
  - `_shared.tsx` — `StepHeader` + `ProgressDots` + `handleExpiredSession` (catches `NOT_FOUND`/`CONFLICT` from any layer call, wipes local state, alerts the user, routes back to Layer 1 — handles the 15-min backend session TTL gracefully).
- [x] **`useAppStore.ts`** — added `onboardingSessionId`, `onboardingLastLayer`, `onboardingAnsweredCardIds`, `twinSpec` slices + setters. Existing `logout()` extended to clear them. `setOnboardingState`/`clearOnboardingState` mutators used by the SecureStore module. `setTwinSpec` auto-toggles `hasTwin`.
- [x] **`src/navigation/types.ts`** — added `OnboardingStackParamList` (5 routes); `RootStackParamList` now `Signup | Onboarding | Main` (dropped `ProfileSetup` + `TwinOnboarding`); removed `BasicProfileSetup` from `ProfileStackParamList`.
- [x] **`src/navigation/AppNavigator.tsx`** — new `OnboardingStack` sub-navigator with `gestureEnabled: false`; `initialRouteName` derived from Zustand `onboardingLastLayer` so a relaunch resumes at the right layer. Root routing: no token → Signup; token + hasTwin → Main; token + !hasTwin → Onboarding.
- [x] **`App.tsx`** — boot now: `loadAuth()` → `loadOnboardingState()` → (if token) probe `api.twin.me()` → on 200 `setTwinSpec(spec)`; on `NOT_FOUND` or any error, `setHasTwin(false)` (user lands in Onboarding rather than a blank Main).
- [x] **`SignupScreen.tsx`** — post-verify probes `/twin/me` and `navigation.reset()` to Main if a twin exists, else into the Onboarding sub-stack (which itself picks the right layer via `lastLayer`). Replaces Session 1's hardcoded `ProfileSetup` jump.
- [x] **Archived old screens** to `src/screens/_archive/` via `git mv`: `ProfileSetupScreen.tsx`, `BasicProfileSetup.tsx`, `TwinOnboardingScreen.tsx`. `tsconfig.json` now excludes `src/screens/_archive` from typecheck so the stale imports inside don't break the build. Files preserved (not deleted) for visual reference during Session 5 polish.
- [x] **`SettingsScreen.tsx`** — "Retrain AI Twin" now navigates into the Onboarding sub-stack (parent navigator → `Onboarding` → `OnboardingLayer1`). The broken "Active Profile" → `BasicProfileSetup` jump demoted to a read-only profile tile (no onPress).
- [x] **Typecheck clean.** `npm run typecheck` returns 0.
- [x] **Session 2 commits** (3 logical chunks) pushed to `origin/integration/session-1-foundation`:
  - `fix(dev): allow physical-device backend access over LAN` — `aaa016b`
  - `chore(types): align onboarding + twin types with backend route handlers` — `03b3b02`
  - `feat(onboarding): split monolith into 4-layer + finalize flow` — `9e53f89`

**Session 3 (Match + SSE debate — 2026-05-19):**

- [x] **Pre-flight.** `git fetch + pull --ff-only origin integration/session-1-foundation` clean. Renamed frontend remote from old `vab-viah` to `Lab-Viah-Frontend` per owner's repo rename after Session 2. No local divergences.
- [x] **Source-of-truth realignment.** Read `backend/src/routes/match.routes.ts`, `stream.routes.ts`, `find-matches.workplan.ts`, `agents/_shared/types.ts` + `trace.ts`. Drift found vs Session 1 type stubs: `/match/results/:flowId` returns `{flowId, topThree, allDebated}` of `StoredReportRow` (NOT `{reports: CompatibilityReport[]}`), reports have no `id` / `user_twin_id` / `flow_id` / `candidate` fields (candidate name lives inside `reasoning_trace.candidate_name`), `/baseline/match` returns `{userTwinId, ranking: [{candidateId, candidateName, baselineScore}]}` (NOT the flat shape). Also confirmed: **SSE route has NO `requireUserId` check today** — Bearer header attached defensively in the wrapper anyway.
- [x] **`src/api/types.ts` realigned.** Added `StoredReport` (the actual wire row shape); aliased `CompatibilityReport = StoredReport` so the legacy name keeps working. `MatchResultsResponse = {flowId, topThree, allDebated}`. `BaselineMatchResponse` uses real backend shape. `toFrontendMatch` now reads `reasoning_trace.candidate_name` (no `candidate` object on the wire), surfaces `top_strengths[0]` + `top_friction_points[0]` as card-level narrative, and adds `dealbreakersHit` + `candidateTwinId` fields for the new deck UI. `FrontendMatch.city/profession/age` retained but blank — those live on TwinSpec, not on the report.
- [x] **`src/navigation/types.ts`** — `DiscoverStackParamList.TwinDebate` + `CompatibilityReport` now carry `{flowId, candidateTwinId, displayName}` (was `{matchId, matchName, overallScore?}`). Necessary so both screens can subscribe to the right SSE stream and pick the right row from `/match/results`.
- [x] **`src/api/sse.ts`** — typed wrapper around `react-native-sse@^1.2.1`. Builds URL via `buildStreamUrl`, attaches `Authorization: Bearer <jwt>` defensively, parses each `message` event into the 11-variant `TraceEvent` union with an exhaustiveness check, surfaces three separate callbacks (`onEvent` for TraceEvents, `onStreamError` for backend `{type:'error'}` envelope, `onError` for network/parse failures). Explicit `close()` on `workplan.finished` AND on caller unsubscribe. Removed wrong `pollingInterval:0` (that means *instant* reconnect, not no reconnect — relying on `close()` to flip `status=CLOSED` which the library bails on). Drops `heartbeat` events and non-JSON gracefully — never crashes the stream.
- [x] **`src/hooks/useTraceStream.ts`** — React hook reducing the firehose into a screen-friendly view: `status` (connecting/streaming/finished/error), `phase` (connecting → reading_profiles → debating → ranking → finished), per-dimension scores keyed by `Dimension`, decision bubbles (id + agent + decision + rationale + ts), observation list, recovery list, tool-call list, `outcome` payload from `workplan.finished`. Phase derived from `task.started` events emitted by find-matches.workplan.ts (`load_user_twin`/`prescreen_candidates` → reading_profiles, `parallel_debates` → debating, `rank_reports`/`persist_reports` → ranking). React 19 strict-mode double-fire guarded with a ref keyed on flowId.
- [x] **`MatchPoolScreen.tsx` (rewrite).** POSTs `/match/request` once on mount (gate via `useRef`), subscribes to SSE via `useTraceStream`. When `trace.status === 'finished'`, fetches `/match/results/:flowId` and renders **Tinder-style swipeable deck**. Implementation uses RN core `PanResponder` + `Animated` — no extra deps (avoided pulling in `react-native-gesture-handler`/`reanimated` for a 1-day shipping deadline). Right swipe / "→" button = consider → navigates to TwinDebate with `flowId + candidateTwinId`. Left swipe / "✕" = local dismiss (backend has no skip endpoint). Cards show blurred avatar (no PII reveal until booking), score chip (color-coded by 80/60), recommendation pill, top strength tile, top friction / dealbreaker tile. CONSIDER / PASS overlays animate in via panX interpolation. Deck capped at top 10 candidates. Loading state surfaces live phase label + decision counter + dim-scored counter so the 30-45s wait feels purposeful. Error state + empty state with retry CTAs.
- [x] **`TwinDebateScreen.tsx` (rewrite).** Dropped fake `Animated` bubble timeline + `mockData` imports. Subscribes to SSE via `useTraceStream(flowId)` from route params. UI sections:
  - Phase rail (4 segments, active highlighted) driven by `task.started` boundaries.
  - 8-cell dimension scoreboard. Each `dimension.scored` event fills a signed bar (`|score|·100%`, sign flips emerald/orange). Evidence quote appears below the bar when available.
  - Decision bubbles for `agent.decision` events with typewriter reveal (~18ms/char). Tone differs for moderator / user_twin / candidate_twin / workplan. Auto-scrolls.
  - Collapsible tool-call section (chevron-toggle, default closed) — useful for judges probing the trace but not noisy for non-devs.
  - Recovery counter band when retries happened.
  - On `workplan.finished` → verdict banner + CTA "View Compatibility Report →" routes to CompatibilityReport with the same `{flowId, candidateTwinId, displayName}`.
- [x] **`CompatibilityReportScreen.tsx` (rewrite).** Fetches via `api.match.results(flowId)`, picks the row whose `candidate_twin_id` matches the route param (`allDebated` first, falls back to `topThree`, error CTA if neither). Renders the hero score (`overall_score * 100`), recommendation pill, per-dimension breakdown with `DIMENSION_LABELS` (so "dealbreakers" → "Boundaries"), evidence quote per dim, friction level badge per dim, top strengths section, top friction / dealbreakers section with hit-on chips. CTAs route into Booking and DisputeForm via the parent stack.
- [x] **`npm run typecheck` clean.**
- [x] **Session 3 commits** (3 logical chunks) pushed to `origin/integration/session-1-foundation`:
  - `chore(types): align match types with backend route handlers` — `7c9366a`
  - `feat(sse): typed EventSource wrapper + useTraceStream hook` — `f4c826b`
  - `feat(match): wire match flow end-to-end against real backend` — `3c11166`

**Session 4 (Booking + Dispute + Feedback + Wali decouple — 2026-05-19):**

- [x] **Pre-flight.** `git fetch + pull --ff-only origin` clean on both repos. No local divergences. Frontend has an uncommitted `@expo/ngrok` addition from Session 3's tunnel experiment — left alone (user rejected tunnel mode; dead weight, not session 4 scope).
- [x] **Phase A — Session 3 device-test bug sweep (all 5).**
  - **A1.** Swipe deck stale closure. `PanResponder` now reads `isTop` / `onSwipeRight` / `onSwipeLeft` from refs mirrored each render. Cards beyond the first are now swipeable. ([MatchPoolScreen.tsx](src/screens/MatchPoolScreen.tsx))
  - **A2.** SSE replay-unavailable. find_matches workplan removes the bus from ACTIVE_BUSES after `workplan.finished`; the second card considered would hang on `{type:'error', message:'Unknown flowId'}`. Now: MatchPool caches `reportsByFlow[flowId]` in Zustand; TwinDebate detects `phase:'error'` + cached row, renders a "Debate complete — live replay unavailable" banner instead of the phase rail, builds the 8-cell scoreboard from persisted `dimension_scores` (recentered 0..1 → -1..1 so signed bars work), hides the live decision feed + tool-call log, exposes the report CTA immediately. CompatibilityReport reads from the same cache so a follow-on navigation needs zero extra network. ([TwinDebateScreen.tsx](src/screens/TwinDebateScreen.tsx), [CompatibilityReportScreen.tsx](src/screens/CompatibilityReportScreen.tsx), [useAppStore.ts](src/store/useAppStore.ts))
  - **A3.** "Run New Match" retry. Extracted `kickoffMatchRequest` useCallback; retry now invokes it directly. `useTraceStream` resets to INITIAL when `flowId` transitions back to null so the next subscription doesn't inherit the prior run's `finished` status. ([MatchPoolScreen.tsx](src/screens/MatchPoolScreen.tsx), [useTraceStream.ts](src/hooks/useTraceStream.ts))
  - **A4.** Backend `twin_forge` Layer-3 truncation. Bumped `maxOutputTokens` 2048 → 4096. New `backend/src/utils/jsonRepair.ts` (≈45 lines, no new dep) one-passes the raw text closing unterminated strings, stripping trailing `:` / `,`, closing open brackets/objects. The agent tries `JSON.parse(gem.text)` first, repaired text on failure, deterministic fallback only on second failure. Emits a distinct `recover` event when repair saved the day. (`backend/src/agents/twin-forge.agent.ts`)
  - **A5.** Backend `moderator` final synthesis truncation. Same layered fix — token bump 1024 → 2048 + jsonRepair fallback. Pro is kept on synthesis (1 call per debate, narrative quality matters). (`backend/src/agents/moderator.agent.ts`)
- [x] **Phase B — Session 4 scope (B1-B5).**
  - **Types realignment.** Read `backend/src/routes/booking.routes.ts`, `dispute.routes.ts`, `feedback.routes.ts`, plus the underlying workplans and agents. Significant drift fixed in `src/api/types.ts`: `/book/initiate` body needs user+candidate wali (name/relation/phone) + optional area; response is just `{flowId, meetingId, streamUrl}` (slots/venues/wali brief arrive via SSE `workplan.finished.outcome`). `/book/confirm` uses `slotIndex: 0..9`, not `slotIso + venueId`. `DisputeResolution` has `severity: 1..2..3..4..5` literal + `reputation_impact: {party, delta, reason}[]` + `blocklist_changes` + `outreach`. `/dispute/file` requires `filedBy: 'user'|'wali'`. `/feedback/post-meeting` body is FLAT (truthfulness/chemistry/family_alignment/would_meet_again sibling to meetingId), response carries `previousTwinId` + `weightsChanged` diff. New mirror types: `BookMeetingInitiateOutcome`, `ProposeSlotsOutput`, `SlotProposal`, `ProposedSlot`, `Venue`, `WaliBriefBundle`, `WaliBriefDocument`, `WaliBriefAudio`, `SmsRenderResult`, `FinalizeMeetingOutput`, `Reminder`.
  - **B1 + B2. BookingScreen wired against /book/initiate + /book/confirm with embedded wali brief panel.** Four-phase state machine: (1) wali_form — backend requires user+candidate wali; collected here, persisted in Zustand `bookingWaliInfo` for prefill on subsequent bookings; (2) initiating — POST `/book/initiate` (strict-mode guarded), subscribe to `/stream/:flowId` via `useTraceStream`, render a live label from the most recent `task.started` (load_context / wali_brief / propose_slots / persist_proposal); (3) choosing — `workplan.finished.outcome` typed as `BookMeetingInitiateOutcome`; render slot proposals (slot.slotHuman + venue.name + venue.area + rating) as single-pick list, render expandable wali brief panel with per-language tabs (EN + native), alignment/discussion points, lazy `expo-av` audio player for the base64 data URI (Audio.Sound created on first Play, unloaded on unmount), SMS preview with native `Share.share()`. Copy: "Share with your wali — you can proceed without their reply." Never blocks Confirm CTA. (4) confirmed — receipt view with finalized slot/venue/address, reminder schedule, confirmation SMS bodies; pushes Meeting into `useAppStore.meetingsList`. List-mode (no matchId) preserved with empty-state copy.
  - **B3. WaliTab removed from MainTabs.** Dropped `WaliTab` Tab.Screen + WaliIcon. Dropped `WaliTab: undefined` from MainTabsParamList. `WaliDashboardScreen.tsx` git-mv'd to `src/screens/_archive/`.
  - **B4. DisputeFormScreen wired against /dispute/file.** Category chips map to backend DisputeType enum, 10-2000 char narrative matches backend Zod, `filedBy: 'user'`. After response, subscribe to `/stream/:flowId` via `useTraceStream` for a "Reviewing your dispute…" indicator. Resolution view renders severity 1..5 with label (Minor/Low/Moderate/Serious/Severe), action label, agent rationale quote, per-party reputation deltas (filer named "You", counterparty named contextually), blocklist updates, escalated badge.
  - **B5. FeedbackSurveyScreen wired against /feedback/post-meeting.** Four 1..5 ratings (truthfulness, chemistry, family_alignment, would_meet_again) + optional narrative. Body is FLAT per backend. On success: render "Twin v{N} forged" panel with `previousTwinId` / `newTwinId` / `weightsChanged` diff (per-dim from→to with signed delta), re-fetch `/twin/me` and update `useAppStore.twinSpec`, `completeMeeting(meetingId)`. Skip-and-rate-later still works.
- [x] **`npm run typecheck` clean** on both repos.
- [x] **Session 4 commits** pushed:
  - Frontend (on `integration/session-1-foundation`): `fix(match): swipe deck stale closure + retry kickoff + report cache` · `fix(debate): handle SSE replay-unavailable after workplan finished` · `chore(types): align booking/dispute/feedback types with backend handlers` · `refactor(nav): drop WaliTab from MainTabs` · `feat(book): wire booking against /book/initiate + /book/confirm` · `feat(dispute): wire /dispute/file with live trace indicator` · `feat(feedback): wire /feedback/post-meeting + refresh /twin/me`.
  - Backend (on `backend/main`): `fix(agents): jsonrepair fallback + bumped Pro tokens for truncation` — pushed → Railway auto-deploy.

**Session 5 (Premium UI polish): NOT STARTED.**

### Blockers

- *(none — Session 4 closed cleanly. All 5 Session 3 device-test bugs swept. Booking + Dispute + Feedback wired against real backend. Pending: real-device smoke test of the full happy path against Railway — see §6 handoff for the exact walkthrough.)*

### Known bugs from Session 3 device test — ALL FIXED IN SESSION 4

1. **Swipe deck only works for the first card.** [src/screens/MatchPoolScreen.tsx:117-152](src/screens/MatchPoolScreen.tsx). Classic stale-closure bug: the `PanResponder` is created via `useRef(PanResponder.create({...})).current` — the `isTop` prop is captured in the closure once and never updates. When a card transitions from non-top to top (after the previous swipes away), its responder still sees `isTop === false` and bails out of `onMoveShouldSetPanResponder`. Fix options: (a) keep `isTop`/`onSwipeRight`/`onSwipeLeft` in refs and read them from inside the responder callbacks, OR (b) re-create the PanResponder when `isTop` changes (`useMemo` keyed on isTop). (a) is cleaner since the responder identity stays stable.

2. **"Consider" a non-first card → TwinDebate stream error.** find_matches workplan emits ONE trace covering all 5 candidate debates; after `workplan.finished`, the bus is removed from `ACTIVE_BUSES` (per [backend/src/agents/_shared/trace.ts](../../backend/src/agents/_shared/trace.ts)). When the user considers a SECOND card, TwinDebate subscribes to the same finished flowId → `/stream/:flowId` returns `{type:'error', message: 'Unknown flowId ...'}` → `useTraceStream` flips to `phase:'error'`. The screen never advances past Connecting. Fix options: (a) detect `trace.status === 'finished'` on mount when the report row already exists in `reports` and skip the SSE step (just render the dimension scoreboard from the stored `dimension_scores` + a "Verdict reached" banner + jump to report); OR (b) for non-first considerations route directly to CompatibilityReport, skipping TwinDebate; OR (c) backend keeps closed bus in registry for a grace window. (a) is most demo-friendly — judge can still see the per-dim scoreboard from the stored report.

3. **MatchPool "Run New Match" button gets stuck.** [src/screens/MatchPoolScreen.tsx](src/screens/MatchPoolScreen.tsx) `handleRetry` resets `flowId`, `reports`, `requestErr`, `resultsErr`, `dismissedIds`, and `requestFired.current = false`. But the `useEffect(() => {...}, [])` that POSTs `/match/request` has empty deps so it never re-fires. Result: user sees the LoadingState forever (and also `trace.status === 'finished'` from the prior run because `useTraceStream` doesn't reset until a new flowId is set). Fix: invoke the POST directly inside `handleRetry` (not via the mount effect), OR make the effect deps include a `nonce` state that `handleRetry` bumps.

4. **Backend: `twin_forge: statements failed schema`** — Gemini Pro returns truncated JSON during Layer-3 statement generation. Raw output: `{ "statements": [ { "dimension": "` — cut off mid-string at position 46. [backend/src/agents/twin-forge.agent.ts:46-77](../../backend/src/agents/twin-forge.agent.ts) currently has `maxOutputTokens: 2048` (already bumped from 768 in Session 2). Recovery path falls back to `fallbackStatements(session)` so the user still gets statements — but the AI synthesis is lost. Two likely causes: (a) Pro's invisible "thinking" budget is eating output room when the prompt is long; (b) malformed escape inside a string. Fix options: (i) bump maxOutputTokens to 4096; (ii) add a JSON-repair attempt before falling back (e.g. close unterminated strings + arrays); (iii) retry on Flash before falling back. Same pattern appears in moderator (#5).

5. **Backend: `moderator: final synthesis failed; using deterministic highlights`** — Same JSON truncation pattern. `Unterminated string in JSON at position 125 (line 4 column 34)`. Recovery already in place (deterministic highlights); user-facing reports look fine but the moderator's narrative synthesis is lost from `top_strengths` / `top_friction_points`. Same fix shape as #4.

### Open questions for the user

- **Real-device smoke test of the match flow.** With backend running and a forged Twin already in Supabase (e.g. `+923001234567` / `0000` → existing twin `281742cf-...` from Session 2 demo): launch app → MainTabs → Discover tab → MatchPool should POST `/match/request`, show "Running Twin debates" with live phase + decision counter, then 30-45s later render the swipeable deck. Right-swipe → TwinDebate should show phase rail advancing, dim cells filling in real time, decision bubbles typing in. On verdict → "View Compatibility Report →" → per-dim breakdown with evidence. If SSE doesn't connect (most likely culprit on a fresh device: the laptop firewall blocks port 3000 from the LAN, or Android cleartext denied) the screen will hang on "Connecting…" — check `EXPO_PUBLIC_API_URL` and that backend logs show the GET `/stream/...` arriving.
- **Railway URL** still pending — same as Session 2's open question. Useful for judges who don't share a LAN with the user.
- **Polling fallback** intentionally NOT implemented. SSE is the documented path; if it turns out to be flaky on the device under load, a simple `useQuery` polling `/match/results` with `refetchInterval: 4000` until non-404 is the fallback. Wire only if needed — adds latency to the demo's wow-factor.
- **Frontend repo merge policy** — Session 3 also lands on `integration/session-1-foundation`. Same decision still deferred.

---

## 3. Quick reference — files & key paths

### Backend (read-only reference)

- Backend root: `D:/Projects/rishtaai/backend/`
- Authoritative spec: `D:/Projects/rishtaai/backend/MASTERPLAN.md`
- Backend session log: `D:/Projects/rishtaai/backend/SESSION_CONTEXT.md`
- Route handlers: `D:/Projects/rishtaai/backend/src/routes/*.routes.ts`
- TraceEvent shape: `D:/Projects/rishtaai/backend/src/agents/_shared/types.ts`
- TwinSpec shape: `D:/Projects/rishtaai/backend/src/domain/twin.ts`
- Scoring shape: `D:/Projects/rishtaai/backend/src/domain/scoring.ts`
- Workplans: `D:/Projects/rishtaai/backend/src/workplans/*.workplan.ts`

### Frontend (working tree)

- Frontend root: `D:/Projects/rishtaai/frontend/vab-viah/`
- This plan: `D:/Projects/rishtaai/frontend/vab-viah/MASTERPLAN.md`
- This session log: `D:/Projects/rishtaai/frontend/vab-viah/SESSION_CONTEXT.md`
- App entry: `App.tsx`
- Navigator: `src/navigation/AppNavigator.tsx`
- Screens: `src/screens/`
- Mock data (to be deleted by end of Session 5): `src/api/mockData.ts`
- Zustand store: `src/store/useAppStore.ts`
- Existing QueryProvider: `src/api/QueryProvider.tsx`
- Tailwind config: `tailwind.config.js`

### Backend endpoint cheatsheet

| Method | Path | Body | Returns (`data.*`) |
|---|---|---|---|
| POST | `/auth/otp/start` | `{phone}` | `{sent: true, dev?: boolean}` |
| POST | `/auth/otp/verify` | `{phone, otp}` | `{jwt, userId, user}` |
| POST | `/onboarding/layer1` | `{sessionId?, message, language_pref?}` | `{sessionId, next_prompt, confidence, chips?, done}` |
| POST | `/onboarding/layer2` | `{sessionId, cardId, choiceIndex}` | `{sessionId, cardIndex, totalCards, radar}` |
| POST | `/onboarding/layer3` | `{sessionId, mode: 'generate'\|'correct', corrections?}` | `{statements?, twinPreview?}` |
| POST | `/onboarding/wali` | `{sessionId, ...waliOverrides}` | `{sessionId, applied}` |
| POST | `/onboarding/finalize` | `{sessionId}` | `{twinId, twin: TwinSpec}` |
| GET | `/twin/me` | — | `{twin: TwinSpec, version}` |
| POST | `/match/request` | — | `{flowId, streamUrl}` |
| GET | `/stream/:flowId` | — (SSE) | TraceEvent stream |
| GET | `/match/results/:flowId` | — | `{reports: CompatibilityReport[]}` (404 if pending) |
| GET | `/baseline/match` | — | `{ranking: BaselineRow[]}` |
| POST | `/book/initiate` | `{candidateTwinId}` | `{flowId, meetingId, brief, slots, venues, audio_dataUri}` |
| POST | `/book/confirm` | `{meetingId, slotIso, venueId}` | `{meeting: Meeting}` |
| POST | `/dispute/file` | `{meetingId, type, narrative}` | `{resolution: DisputeResolution}` |
| POST | `/feedback/post-meeting` | `{meetingId, ratings: {...}, narrative?}` | `{newTwinId, systemPromptRefreshed}` |

> **NOTE:** Response field names above are inferred from `backend/SESSION_CONTEXT.md`. **Confirm exact shape by reading the route file before wiring each endpoint.** The `apiFetch` envelope unwrapping should happen in `src/api/client.ts` so callers only see `data`.

### Smoke-check commands

```bash
# Backend (separate terminal)
cd D:/Projects/rishtaai/backend
npm run dev
# Test: curl http://localhost:3000/health
# Test: curl http://localhost:3000/stream/demo_session1   # 30s heartbeats

# Frontend
cd D:/Projects/rishtaai/frontend/vab-viah
npm install     # if new deps added
npx expo start --tunnel    # for real device on dev
# OR
npx expo start --lan       # if phone is on same wifi
npx tsc --noEmit           # typecheck (add to package.json scripts in Session 1)
```

---

## 4. Session-by-session plan (high-level — full detail in MASTERPLAN §7)

| Session | Phase | ETA | Status |
|---|---|---|---|
| 1 | Foundation: API client + auth + env | 3 hrs | ✅ DONE |
| 2 | Onboarding restructure (4-layer flow) | 4 hrs | ✅ DONE |
| 3 | Match flow + SSE Twin debate | 5 hrs | ✅ DONE |
| 4 | Booking + Dispute + Feedback + Wali decouple | 4 hrs | ✅ DONE |
| 5 | Premium UI polish (time-boxed) | 3 hrs | NOT STARTED |

Each session is independently scoped — a lighter model can pick up Session N by reading MASTERPLAN.md §7 (the "Session N" block) plus this file's §6 handoff.

---

## 5. Decisions made

### Pre-Session 1 (2026-05-18, with user)

1. **SSE for debate.** Add `react-native-sse` and wire `TwinDebateScreen` to real `GET /stream/:flowId`. Live Antigravity traces are the demo wow-factor.
2. **Wali decoupled.** Users are never blocked by a wali. Remove the standalone Wali Dashboard tab. Surface the auto-generated wali brief (EN + RO_UR text + TTS audio + SMS preview) as an optional expandable panel inside `BookingScreen` with copy "Share this with your wali — you can proceed without their reply." Onboarding Layer 4 (wali) is explicitly skippable.
3. **Moderate frontend scope.** Treat frontend as a starting point. Preserve existing component library + visual language. Restructure onboarding into 4 sequential screens to match backend layers. Add polish in Session 5 for premium feel.
4. **Backend locked.** No backend changes unless a true integration blocker surfaces. Escalate to the user before touching backend code.
5. **Adapter pattern for shape mismatches.** Backend snake_case + `0–1` scores stay in `src/api/types.ts`. Adapter functions (`toFrontendMatch`, etc.) translate at the API boundary. UI keeps its current shapes where possible.
6. **JWT storage.** `expo-secure-store`, NOT AsyncStorage. SecureStore is encrypted at rest.
7. **Voice input deferred.** Layer 1 onboarding is text-input only for MVP. Backend `/onboarding/layer1` already accepts text. Voice via `expo-av` is a Session 5 stretch.
8. **No video meeting.** `VideoMeetingScreen.tsx` stays a placeholder; out of MASTERPLAN scope.

### Session 2 (2026-05-18, with user)

9. **Branch policy.** Stay on `integration/session-1-foundation` for Session 2 onwards (NOT a new `session-2-onboarding` branch). All sessions accumulate on the same integration branch through the demo; merge to `main` decision deferred.
10. **Commit messages.** Conventional Commits style (`feat(scope): …`, `fix(scope): …`, `chore(types): …`) — descriptive, not session-numbered. Commit messages outlive sessions.
11. **Profile screens fate — archive, not delete.** `ProfileSetupScreen.tsx` + `BasicProfileSetup.tsx` + `TwinOnboardingScreen.tsx` moved to `src/screens/_archive/` via `git mv`, preserved for visual reference during Session 5 polish. `tsconfig` excludes the folder so stale imports don't break the build. Layer 1 conversational flow captures the identity fields ProfileSetup used to ask for.
12. **OTP dev fix — LAN-first, tunnel-fallback, documented.** Primary dev loop: physical phone over LAN (laptop IP + port 3000 + `usesCleartextTraffic` / `NSAllowsArbitraryLoads`). Fallback: `expo start --tunnel` + Railway URL. Both paths documented in `.env.example` with explicit ipconfig / firewall / Railway hints.
13. **Onboarding session persistence: SecureStore, not Zustand-persist middleware.** SecureStore-backed `src/api/onboardingState.ts` mirrors the auth.ts pattern. Only persisted slices are `{sessionId, lastLayer, answeredCardIds}` — small enough to fit the 2KB SecureStore value limit. Avoided pulling in AsyncStorage (not installed) or Zustand persist middleware (extra plumbing for a 5-screen flow).
14. **Backend session expiry → restart at Layer 1.** Backend in-memory sessions TTL at 15 min. Frontend `_shared.handleExpiredSession` catches `NOT_FOUND`/`CONFLICT` from any layer call, clears local state, alerts the user, and routes back to `OnboardingLayer1`. No partial resume after expiry — simpler than trying to re-mint mid-flow.
15. **Backend dispatch shape for Layer 3.** Reading `backend/src/routes/onboarding.routes.ts` confirmed the route distinguishes generate vs correct by **presence of `corrections`**, not by a `mode` field. `Layer3Request` typed as a discriminated union on `corrections` (no `mode`). Both modes return the same `statements: TwinStatement[]` response.

### Session 4 (2026-05-19, with user)

21. **Booking takes wali info every time — not from onboarding.** The Onboarding Layer-4 wali screen captures `wali_phone` + override fields, but only the override is persisted on the TwinSpec. The full booking flow needs user-wali NAME + RELATION + PHONE plus the CANDIDATE-WALI NAME + PHONE (backend Zod requires all five). Frontend now collects them in BookingScreen on first entry and persists in `useAppStore.bookingWaliInfo` for prefill on subsequent bookings. Considered fetching from a hypothetical `/wali/me` — rejected; backend has no such route and time is tight.
22. **Stream the workplan outcome, not the route response, to render proposals.** `/book/initiate` returns `{flowId, meetingId, streamUrl}` only — the proposal + wali brief are emitted inside `workplan.finished.outcome`. BookingScreen reads `trace.outcome` (typed as `BookMeetingInitiateOutcome`) once `trace.status === 'finished'`. This keeps the live "Building your booking…" indicator authoritative for ~6-10s, then the slot picker + wali panel render together when the workplan completes. Alternative considered: poll `meetings/:id` endpoint — rejected; backend doesn't have one and the SSE outcome carries everything.
23. **TwinDebate replay-unavailable preferred over a backend ACTIVE_BUSES grace window.** Session 3 device bug #2 had three fix shapes. Chose (a) frontend-only: cache `reportsByFlow` in Zustand, render scoreboard from persisted `dimension_scores` on second consider. Rejected (b) reroute non-first considers directly to CompatibilityReport (loses the visible "we ran a debate for this candidate" moment) and (c) backend grace window (touches backend, risks longer-lived bus leaks under load).
24. **JSON-repair hand-rolled, not vendored.** A4/A5 needed a JSON-repair pass before deterministic fallback. Considered `jsonrepair@^3` (npm, well-tested) and a hand-rolled ~45-line one-pass. Picked hand-rolled (`backend/src/utils/jsonRepair.ts`): a) one new npm dep means another build round on Railway; b) our truncation pattern is narrow (unterminated string mid-key or mid-array), and a focused 4-pass cleanup (close strings, strip trailing colon, strip trailing comma, close brackets) covers it without pulling JSON5 / liquid JSON tolerance.
25. **`@expo/ngrok` dev-dep stays uncommitted.** A Session 3 tunnel experiment added the dep but user rejected tunnel mode (too slow). Left the diff alone in Session 4 (unrelated to scope, won't bloat the bundle since dev-only). Session 5 should revert.

### Session 3 (2026-05-19, with user)

16. **Swipe deck via RN core, not a 3rd-party library.** Tinder-style deck on `MatchPoolScreen` built on `PanResponder` + `Animated` (both shipped with RN). Considered `react-native-deck-swiper` and `react-native-gesture-handler` + `reanimated`, rejected both: extra deps mean another `npx expo install` round trip + autolinking risk on a 1-day shipping deadline, and a basic 3-card deck doesn't need the perf headroom Reanimated buys.
17. **SSE for match flow, no polling fallback.** Match flow drives off `/stream/:flowId` exclusively — we subscribe, watch for `workplan.finished`, then fetch `/match/results`. No polling fallback added. Rationale: MASTERPLAN §4 explicitly prefers SSE, and the workplan emits `task.started`/`task.finished`/`dimension.scored` events that make the loading state meaningful (live phase, dim counter) rather than a spinner. Backend SSE route has no auth check today, so even network-flakey clients should reach it; if it does turn out to be flaky on physical devices, the fallback is a 5-line `useQuery` polling `/match/results` every 4s.
18. **Real wire shape ≠ Session 1 inference.** `/match/results/:flowId` returns `{flowId, topThree, allDebated}` of `StoredReportRow` — not `{reports: CompatibilityReport[]}`. Rows have no `id`/`user_twin_id`/`flow_id`/`candidate` fields; the candidate's display name lives inside `reasoning_trace.candidate_name`. Updated `types.ts` accordingly. `CompatibilityReport` retained as an alias for `StoredReport` to avoid a ripple rename through the codebase.
19. **Match cards show narrative, not demographics.** Real backend reports DON'T carry candidate city / profession / age — those live only on the TwinSpec which isn't exposed to the API today. So the swipe card prioritizes the narrative payoff instead: blurred avatar + score chip + recommendation pill + top strength snippet + top friction (or dealbreaker) snippet. This actually plays better in demo than demographic data would have.
20. **SSE wrapper: keep heartbeat / `{type:'error'}` out of the timeline.** Backend emits `{type:'heartbeat'}` for `demo_*` flowIds and `{type:'error', message}` for unknown flowIds. The `subscribe()` wrapper routes these to separate callbacks (`onStreamError` for backend error envelope, drop heartbeat entirely) instead of forwarding them to `onEvent` as TraceEvents — so the timeline UI never sees a non-TraceEvent. Parse failures get a `__DEV__` console.warn but never crash the stream.

---

## 6. Handoff for next session

**Next session: Session 5 — Premium UI polish (time-boxed) + remaining cleanup.**

### Starting state

- Branch `integration/session-1-foundation` on `frontend/vab-viah` repo, head at `146d913` (`feat(feedback): wire /feedback/post-meeting + refresh /twin/me`). Pushed.
- Backend branch `backend/main` (in the outer `D:/Projects/rishtaai` repo), head at `e33b73b` (`fix(agents): jsonrepair fallback + bumped Pro tokens for truncation`). Pushed → Railway auto-redeploy in flight at session end.
- **Full happy path now goes through real backend on Railway:** Signup → Onboarding (4 layers + finalize) → MainTabs → Discover/MatchPool (real `/match/request` + SSE + swipeable deck) → TwinDebate (live phased visualization OR replay-unavailable variant on follow-on cards) → CompatibilityReport (per-dim breakdown) → "Initiate Halal Reveal" → Booking (wali form → real `/book/initiate` → live workplan indicator → slots + wali brief panel with audio + SMS → `/book/confirm` → receipt) → MeetingsTab (log of confirmed meetings) → FeedbackSurvey (real `/feedback/post-meeting` → Twin v2 forged + weights diff) OR DisputeForm (real `/dispute/file` → DisputeResolution rendering).
- `src/api/sse.ts` + `src/hooks/useTraceStream.ts` work unchanged for all three workplans (find_matches / book_meeting / handle_dispute).
- **Mock data status:** `src/api/mockData.ts` still exists but is unreferenced by any active screen (only the archived `_archive/WaliDashboardScreen.tsx` imports it). Safe to delete in Session 5 alongside the archive folder. `useAppStore.meetingsList` still has a `meet_past_1` seed for the empty-state demo — replace or delete in Session 5.
- **`package.json` has an uncommitted `@expo/ngrok` dev-dep addition** left over from Session 3's tunnel experiment. Unused (user rejected tunnel mode as too slow); safe to revert during Session 5 cleanup. Run `git checkout -- package.json package-lock.json` from `frontend/vab-viah/` to clean.

### What to smoke-test on a real device first (BEFORE Session 5 polish work)

The full pipeline is wired but has NOT been device-tested end-to-end after the Session 4 changes. Suggested walkthrough against Railway with Metro on LAN:

1. Cold start → Signup → `+923001234567` / `0000` → if a Twin already exists for this user, lands on Main; otherwise Onboarding (4 layers).
2. Discover tab → MatchPool should POST `/match/request`, show "Running Twin debates" with live phase + decision counter, then ~30-45s later render the swipeable deck. **A1 verify:** swipe the first card right → swipe the second card right (this is the regression that hung before).
3. TwinDebate live → phase rail advances → 8-cell dim scoreboard fills → decision bubbles type in → "View Compatibility Report →" CTA on `workplan.finished`.
4. From CompatibilityReport tap "Report Issue" → DisputeForm → pick category, type 10+ chars → submit → DisputeResolution renders with severity + action + rationale + reputation deltas. Go back.
5. Go back to MatchPool. **A2 verify:** consider a SECOND candidate. TwinDebate should render the "Debate complete — live replay unavailable" banner + 8-cell scoreboard from cached `dimension_scores` + immediate "View Compatibility Report →" CTA (instead of hanging on Connecting).
6. From a CompatibilityReport tap "Initiate Halal Reveal" → BookingScreen wali form. Enter user wali (any name + 'father' + `+923001112222`), candidate wali (any name + `+923004445555`), optional area "DHA Phase 6". Tap "Build my booking →".
7. Workplan runs (~6-10s, live phase label visible). Then slot picker renders with 3 (slot, venue) cards and the wali brief panel below. Expand panel → switch EN ↔ Roman Urdu/Urdu → tap "Play wali brief" → audio plays (data URI). Tap "Share" on SMS preview → native share sheet opens.
8. Pick a slot → Confirm Booking → Receipt view renders with locked slot/venue/address + reminder schedule + confirmation SMS bodies. Tap "View Meetings Log →" → MeetingsTab shows the new meeting under Scheduled.
9. On the scheduled meeting tap "Rate after meeting" → FeedbackSurvey → fill all 4 stars + submit → "Twin v2 forged" panel with weights diff. Back to Meetings Log shows the meeting in Concluded.
10. **A3 verify:** Discover → MatchPool → after the deck is exhausted (or via the empty state), tap "Run New Match" → workplan re-fires (not stuck on a stale `trace.status:'finished'`).
11. **A4/A5 verify (looser — Gemini-dependent):** during onboarding Layer 3, statements should be authored by Gemini and not the deterministic fallback (no "default statements" warn in backend logs). During match flow, top_strengths / top_friction_points should read narratively, not as bare dim labels.

If any leg of the above breaks, that's Session 5's first priority before polish.

### Session 5 scope (per MASTERPLAN §7) — time-boxed

- `tailwind.config.js` — color tokens (warm-cream + deep-teal + saffron palette), typography scale.
- Heading font (`@expo-google-fonts/playfair-display`) + body (Inter); Nastaliq fallback for Urdu copy.
- Skeletons for every loading state (MatchPool, Booking initiating, TwinDebate connecting, CompatibilityReport, FeedbackSurvey submitting).
- Empty-state illustrations + retry-on-error cards (MatchPool empty deck, Meetings Log empty, etc).
- SSE polish: per-dimension progress bar; recovery chips; final-synthesis fade-in.
- Match-card reveal animation; compatibility radar chart (`react-native-svg`); haptics on primary CTAs.
- Accessibility: `accessibilityLabel` on all buttons.
- **Cleanup pass:**
  - Delete `src/api/mockData.ts` after confirming no imports remain.
  - Delete `src/screens/_archive/` after Session 5's visual reference pass.
  - Revert the `@expo/ngrok` dev-dep from `package.json` if not used.
  - Replace `useAppStore.meetingsList`'s `meet_past_1` mock seed with `[]`.
  - Delete the unused `debateLog` + `matches` legacy mock arrays from `useAppStore.ts`.

### Polish nice-to-haves (do AFTER §5 essentials)

- Empty-state illustration for MeetingsList (replace mock-driven seed).
- Receipt screen could render `meeting_card_url` as a real image (backend returns `/meetings/:id/card`).
- Disabled-state animation on Booking → Confirm.
- "ostranenie" Urdu typography pass on the wali brief panel.

### Known gotchas carried into Session 5

- **WaliDashboardScreen** is archived under `src/screens/_archive/` — `tsconfig.json` already excludes that folder. Safe to delete but not blocking.
- **Backend Pro thinking budget.** If you touch any backend agent, mind `maxOutputTokens` — Pro burns invisible thinking tokens against the same budget. Session 4 hand-rolled `repairTruncatedJson` is in `backend/src/utils/`; reuse it for any new Pro JSON-mode call.
- **Strict-mode double-fire.** Every expensive POST in the new screens is gated with `useRef`. If you add a new screen with a kickoff POST, mirror the pattern (see `BookingScreen.tsx` `initiateFired.current`).
- **React 19 useNavigation referential instability.** Same as prior sessions — NEVER include `navigation` in useEffect deps. NEVER call `navigation.reset/push` during render.
- **Audio.Sound lifecycle.** Wali brief audio lazily creates `Audio.Sound` and unloads on unmount. If you refactor the panel, preserve the unload — leaked sounds can crash Expo Go on hot reload.
- **The booking workplan continues running AFTER /book/initiate returns.** The route awaits `meetingIdPromise` (resolves after persist_proposal), but `endTrace` is deferred via `setImmediate`. SSE subscribers see the full trace if they connect promptly. Our useTraceStream subscribes on the next render after `flowId` is set, which is well within that window.
- **`/book/confirm` slotIndex bounds.** Backend Zod is `int().min(0).max(9)`. We currently render 3 proposals so this is never tight, but if the proposal count ever grows past 10 the UI must clamp.
- **`/dispute/file` narrative min length** is 10 chars. UI shows live `details.trim().length/10 min` counter.
- **Backend session expiry** is now only a concern for Onboarding (15-min TTL). Match / book / dispute / feedback don't have session TTL — they're per-user JWT-authed.

---

## 7. Glossary (for lighter models)

- **Twin** — A persistent AI personality spec for one user, generated from onboarding. Shape in `backend/src/domain/twin.ts`.
- **Workplan** — An Antigravity execution graph that orchestrates multiple agents (onboarding_flow, find_matches, book_meeting, handle_dispute).
- **flowId** — Unique ID for a workplan execution. Returned by `/match/request`, `/book/initiate`. Used to subscribe to SSE at `/stream/:flowId` and fetch results at `/match/results/:flowId`.
- **TraceEvent** — One SSE message describing an agent decision, tool call, or workplan step. Full union in MASTERPLAN §4.
- **CompatibilityReport** — Result of one user-twin × candidate-twin debate. Includes `overall_score` (0–1), per-dim scores, evidence, strengths, frictions, dealbreakers, recommendation, reasoning_trace.
- **Wali** — A user's family guardian (parent / elder sibling). In our app: NOT a gating role. The wali brief is generated automatically inside `book_meeting` as a courtesy artifact for the user to share.
- **Dimensions** — 8 compatibility axes: `deen, family, career, finances, kids, conflict, geography, dealbreakers`. (Frontend used to call the last one `boundaries` — rename or alias.)
- **Layer 1/2/3/4** — Onboarding steps. L1 = chat interview, L2 = 12 scenario cards, L3 = Twin Interview corrections, L4 = optional Wali Mode.
- **Dev bypass** — Backend `DEV_OTP_BYPASS=true` accepts `+923001234567` / `0000` and returns a real Supabase JWT. Use for all dev testing.
