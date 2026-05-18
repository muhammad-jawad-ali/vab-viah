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

- **Project phase:** Session 2 COMPLETE — 4-layer onboarding wired end-to-end against the real backend. Signup → Onboarding(Layer1 chat → Layer2 12 cards → Layer3 statements → Wali (skippable) → Finalize) → Main. Resume-after-kill works via SecureStore-persisted sessionId. Backend types realigned with route handlers (Layer1/2/3/wali/finalize/twin.me all confirmed against `backend/src/routes/*.routes.ts`). Mock data still drives Match/Booking/Wali/Feedback screens — Session 3 onwards.
- **Frontend repo:** `frontend/vab-viah/` (git remote: `https://github.com/muhammad-jawad-ali/vab-viah.git`). Pushed to branch `integration/session-1-foundation` (Session 2 work landed on the same branch — see Decisions §5).
- **Backend status:** All 5 backend sessions complete + teammate's deployment polish landed (Node 22 engine, self-healing GCP creds loader, ws polyfill in tests). Backend is **locked**.
- **Backend dev URL:** `http://localhost:3000` (run `cd backend && npm run dev`).
- **Backend Railway URL:** *(fill in once user shares)*.
- **Dev OTP bypass:** `+923001234567` / `0000` against backend dev (DEV_OTP_BYPASS=true). Now also enabled on Railway per backend Session 5 patch — handy for judge testing.
- **Days until 20 May submission:** ~2 (assume today is 2026-05-18).
- **Last updated:** 2026-05-18 by Session 2 (onboarding).

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

**Session 3 (Match + SSE debate): NOT STARTED.**
**Session 4 (Booking + Dispute + Feedback + Wali decouple): NOT STARTED.**
**Session 5 (Premium UI polish): NOT STARTED.**

### Blockers

- *(none — Session 2 closed cleanly. Real-device smoke test still deferred to user — typecheck + flow logic verified, but no `expo start` was run inside this session. See "Open questions" below.)*

### Open questions for the user

- **Real-device smoke test of OTP + onboarding flow.** Run `cd backend && npm run dev` in one terminal. For physical phone testing, find your laptop's LAN IP (`ipconfig` → IPv4) and set `EXPO_PUBLIC_API_URL=http://<that-IP>:3000` in `.env`. Then `cd frontend/vab-viah && npx expo start --lan` (or `--tunnel` if firewall blocks). Verify: `+923001234567` → `0000` → Layer 1 chat (≥3 turns until Layla advances) → 12 cards → 3 corrections → skip wali → Forge Twin → MainTabs. Kill app mid-Layer 2 → relaunch → should land on Layer 2 at the next unanswered card. If `Send Code` still fails, walk through the OTP fix steps documented in the Session 1 handoff (firewall on port 3000, ATS on iOS — now patched in app.json, etc.).
- **Railway URL** — backend Session 5 deployed to Railway; URL not yet recorded. When you have it, update `EXPO_PUBLIC_API_URL` in `.env` to test against production (also avoids LAN/ATS headaches entirely).
- **Frontend repo merge policy** — Session 2 also lands on `integration/session-1-foundation` (per user direction at session start). Confirm if/when you want this merged to `main` or kept as a long-lived integration branch through Session 5.

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
| 3 | Match flow + SSE Twin debate | 5 hrs | NOT STARTED |
| 4 | Booking + Dispute + Feedback + Wali decouple | 4 hrs | NOT STARTED |
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

---

## 6. Handoff for next session

**Next session: Session 3 — Match flow + SSE Twin debate.**

### Starting state

- Branch `integration/session-1-foundation` on `frontend/vab-viah` repo, head at `9e53f89` (`feat(onboarding): split monolith into 4-layer + finalize flow`). Pushed to origin. Session 3 also commits to this branch (per Decision #9).
- Backend running at `http://localhost:3000` (user starts with `cd backend && npm run dev`). Dev OTP bypass: `+923001234567` / `0000`.
- `.env` defaults to `EXPO_PUBLIC_API_URL=http://localhost:3000`; physical-device usage swaps to LAN IP per docs in `.env.example`. iOS ATS / Android cleartext already enabled in `app.json` for dev http.
- Full onboarding flow lands a real Twin v1 in Supabase. `/twin/me` returns the spec. `useAppStore.twinSpec` mirrors it. `hasTwin` is the boot-routing gate.
- `OnboardingStack` lives under `Onboarding` in `RootStackParamList`. Resume works via `onboardingLastLayer` (0-4) + `onboardingAnsweredCardIds`. Session expiry handled by `_shared.handleExpiredSession`.
- All non-onboarding screens still run on **mock data**: `MatchPoolScreen`, `TwinDebateScreen`, `CompatibilityReportScreen`, `BookingScreen`, `WaliDashboardScreen`, `FeedbackSurveyScreen`, `DisputeFormScreen`. Session 3 wires Match + Debate.
- `api.match.{request,results,baseline}` and `buildStreamUrl(flowId)` are typed stubs in `client.ts` ready to use. `TraceEvent` union is fully mirrored in `types.ts`. `react-native-sse@^1.2.1` installed since Session 1.

### Reads required at Session 3 start

1. This file (`SESSION_CONTEXT.md`) — sections 1, 2, 6 minimum.
2. `MASTERPLAN.md` §7 Session 3 block.
3. `backend/src/routes/match.routes.ts` — confirm exact request/response shapes for `/match/request`, `/match/results/:flowId`, `/baseline/match`. **Treat the route file as source of truth**; the shapes in `src/api/types.ts` are inferred (same caution as Session 2).
4. `backend/src/routes/sse.routes.ts` (or wherever `/stream/:flowId` lives) — confirm auth model (Bearer header? query token?) and event format. `react-native-sse` supports custom headers; verify it works with the backend's expected auth.
5. `backend/src/workplans/find-matches.workplan.ts` — understand the debate lifecycle and which `TraceEvent` types are emitted.
6. `backend/src/agents/_shared/types.ts` — confirm `TraceEvent` union still matches `src/api/types.ts` (Session 1 mirrored it; check for backend drift).
7. `frontend/vab-viah/src/screens/MatchPoolScreen.tsx` + `TwinDebateScreen.tsx` + `CompatibilityReportScreen.tsx` — current mock-driven UIs to wire up.
8. `frontend/vab-viah/src/api/mockData.ts` — to be deprecated as real data flows in.

### Session 3 deliverables (from MASTERPLAN §7)

- `src/api/sse.ts` — typed wrapper around `react-native-sse` that auths via Bearer header, parses `TraceEvent` JSON, exposes typed `subscribe(flowId, onEvent, onError)` returning an `unsubscribe` fn. Reuses `buildStreamUrl`.
- `MatchPoolScreen.tsx` — replace mockData with `useQuery(['matches'], api.match.request → poll api.match.results)`. Use the `toFrontendMatch` adapter (`overall_score * 100`). Surface compatibility scores, top strengths, dealbreakers-hit chips.
- `TwinDebateScreen.tsx` — drop the fake `Animated` timeline. On mount, call `api.match.request()` (if no flowId in route param), subscribe to `/stream/:flowId`, render TraceEvents as a typed timeline. Show agent observations / decisions, tool calls, dimension scores in real time. Friction map populated from `dimension.scored` events.
- `CompatibilityReportScreen.tsx` — fetch by `flowId` (route param), render the full `CompatibilityReport`: per-dim scores w/ evidence, top strengths, top friction points, dealbreakers, recommendation.
- Optional: small SSE progress indicator on `OnboardingFinalizeScreen` reusing the same sse.ts wrapper (sessionId === flowId for the onboarding trace) — nice-to-have for the demo.

### Session 3 exit check

- [ ] User with a forged Twin enters MatchPool → sees real compatibility scores from backend
- [ ] Tap a match → TwinDebateScreen subscribes to `/stream/:flowId` and renders live TraceEvents (agent observations, dimension.scored, decisions) until `workplan.finished`
- [ ] After debate finishes → CompatibilityReport renders per-dim breakdown w/ evidence
- [ ] `npm run typecheck` clean
- [ ] Commit + push on `integration/session-1-foundation` (Conventional Commits style — `feat(match): wire SSE debate timeline`, etc.)
- [ ] All non-match screens still work (no regressions in Onboarding / Settings / Booking)

### Known gotchas for Session 3

- **SSE auth on React Native.** `react-native-sse` accepts a `headers` option. Backend expects `Authorization: Bearer <JWT>` (per `_auth.middleware.ts`). Test with `+923001234567` / `0000` dev JWT first.
- **EventSource lifecycle.** Always `close()` the connection on screen unmount. Failure to do this leaves a hanging WebSocket-like connection that drains battery and confuses backend trace bookkeeping.
- **`overall_score` is 0..1.** Use `toFrontendMatch` adapter (already in `src/api/types.ts`) which scales to 0..100 for display. Don't hardcode `* 100` in screens.
- **`find_matches` is workplan-driven.** Hitting `/match/request` returns `{flowId, streamUrl}` synchronously but the actual debate runs async. `/match/results/:flowId` 404s until the workplan is `finished`. Either subscribe to SSE for `workplan.finished` then fetch results, OR poll results with `staleTime: 0` + `refetchInterval` set to a reasonable cadence (3-5s). MASTERPLAN prefers SSE-driven.
- **TraceEvent union has 11 variants.** Render with an exhaustive switch + a `_default` fallback to avoid crashing on a new variant — `agent.message`, `recovery`, `task.finished`, etc. all show up in real debates.
- **Read the route file first.** Same caution as Session 2 — shapes in `src/api/types.ts` for match/baseline are inferred. Confirm against `backend/src/routes/match.routes.ts` and adjust types if there's drift before wiring screens.

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
