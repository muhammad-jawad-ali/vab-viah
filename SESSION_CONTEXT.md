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

- **Project phase:** Session 1 COMPLETE — Foundation layer landed. Real OTP auth wired against backend; JWT persists in expo-secure-store; navigator boots into Main if a token exists. Mock data still drives all other screens — Session 2 onwards.
- **Frontend repo:** `frontend/vab-viah/` (git remote: `https://github.com/muhammad-jawad-ali/vab-viah.git`). Pushed to branch `integration/session-1-foundation`.
- **Backend status:** All 5 backend sessions complete + teammate's deployment polish landed (Node 22 engine, self-healing GCP creds loader, ws polyfill in tests). Backend is **locked**.
- **Backend dev URL:** `http://localhost:3000` (run `cd backend && npm run dev`).
- **Backend Railway URL:** *(fill in once user shares)*.
- **Dev OTP bypass:** `+923001234567` / `0000` against backend dev (DEV_OTP_BYPASS=true). Now also enabled on Railway per backend Session 5 patch — handy for judge testing.
- **Days until 20 May submission:** ~2 (assume today is 2026-05-18).
- **Last updated:** 2026-05-18 by Session 1 (foundation).

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

**Session 2 (Onboarding restructure): NOT STARTED.**
**Session 3 (Match + SSE debate): NOT STARTED.**
**Session 4 (Booking + Dispute + Feedback + Wali decouple): NOT STARTED.**
**Session 5 (Premium UI polish): NOT STARTED.**

### Blockers

- *(none — Session 1 closed cleanly. Real-device smoke test deferred to user — typecheck + flow logic verified, but no `expo start` was run inside this session.)*

### Open questions for the user

- **Real-device smoke test of OTP flow.** Run `cd backend && npm run dev` in one terminal, then `cd frontend/vab-viah && npx expo start --tunnel` (or `--lan` if same wifi) in another, and verify: enter `+923001234567` → "Send Code" → enter `0000` → "Verify Identity" lands you in MainTabs with the JWT in SecureStore. Kill+relaunch should skip the Signup screen.
- **Railway URL** — backend Session 5 deployed to Railway; URL not yet recorded. When you have it, update `EXPO_PUBLIC_API_URL` in `.env` to test against production.
- **Frontend repo merge policy** — Session 1 pushed to a feature branch (`integration/session-1-foundation`) rather than `main`. Confirm if you want PRs reviewed before merge or direct push to `main` for subsequent sessions.
- **Profile screens fate** — `ProfileSetupScreen.tsx` + `BasicProfileSetup.tsx` collect demographic data. Decide in Session 2: fold into Layer 1 (preferred) or delete. SignupScreen currently routes to `ProfileSetup` post-verify; Session 2 will swap this to `OnboardingLayer1`.

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
| 2 | Onboarding restructure (4-layer flow) | 4 hrs | NOT STARTED |
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

---

## 6. Handoff for next session

**Next session: Session 2 — Onboarding restructure (4-layer flow).**

### Starting state

- Branch `integration/session-1-foundation` merged or in-flight on `frontend/vab-viah` repo. If working in a fresh checkout, start by `git pull` + `git checkout integration/session-1-foundation` (or whichever branch is current).
- Backend running at `http://localhost:3000` (user starts with `cd backend && npm run dev`).
- Dev OTP bypass active: `+923001234567` / `0000`.
- `.env` exists with `EXPO_PUBLIC_API_URL=http://localhost:3000` (or override per device).
- `src/api/{client,types,auth}.ts` all in place. `api.onboarding.{layer1,layer2,layer3,wali,finalize}` are typed stubs ready to use — confirm shapes against actual route handlers before relying on them.
- `SignupScreen` lands the user in `ProfileSetup` post-verify. Session 2 will swap this destination to `OnboardingLayer1Screen` (new).
- `AppNavigator` initial route is `Main` if a JWT exists, else `Signup`. Session 2 will refine: JWT + `/twin/me` 404 → OnboardingStack; JWT + 200 → MainTabs.
- Existing screens `ProfileSetupScreen.tsx`, `BasicProfileSetup.tsx`, `TwinOnboardingScreen.tsx` still in the stack — decide their fate in Session 2.

### Reads required at Session 2 start

1. This file (`SESSION_CONTEXT.md`) — sections 1, 2, 6 minimum.
2. `MASTERPLAN.md` §7 Session 2 block.
3. `backend/src/routes/onboarding.routes.ts` — confirm exact request/response shapes for all 5 onboarding endpoints. The shapes documented in `src/api/types.ts` are inferred; treat the route file as the source of truth.
4. `backend/src/workplans/onboarding.workplan.ts` — understand sessionId lifecycle (what creates it, what TTL it has, how to resume).
5. `backend/src/content/scenario-cards.ts` — the 12 cards content + structure.
6. `frontend/vab-viah/src/screens/TwinOnboardingScreen.tsx` — the existing single-screen flow to be split.
7. `frontend/vab-viah/src/screens/ProfileSetupScreen.tsx` + `BasicProfileSetup.tsx` — decide fate.
8. `frontend/vab-viah/src/store/useAppStore.ts` — add `onboardingSessionId` slice; possibly `lastCompletedLayer` for resume routing.

### Session 2 deliverables (from MASTERPLAN §7)

- `src/screens/onboarding/OnboardingLayer1Screen.tsx` — chat UI; text input only; chip fallback when `confidence < 0.6` from backend.
- `OnboardingLayer2Screen.tsx` — walk 12 scenario cards sequentially with progress indicator.
- `OnboardingLayer3Screen.tsx` — render 3 generated statements from backend's `mode:'generate'` call; editable; POST `mode:'correct'` with corrections.
- `OnboardingWaliScreen.tsx` — prominent "Skip — I'll add later" CTA; optional wali contact + override fields.
- `OnboardingFinalizeScreen.tsx` — review summary + POST `/onboarding/finalize` → land in MainTabs with twin persisted.
- `useAppStore.ts` — add `onboardingSessionId: string | null` + setter; reset on logout.
- `AppNavigator.tsx` — introduce `OnboardingStack`; boot routing reads `/twin/me` after JWT load to choose between OnboardingStack and MainTabs.
- `App.tsx` — extend boot: after `loadAuth()`, if a token exists, call `api.twin.me()` and stash `hasTwin` in Zustand.
- `SignupScreen.tsx` — change post-verify navigation from `ProfileSetup` to `OnboardingLayer1` (or `Main` if Twin already exists).
- Delete or archive `TwinOnboardingScreen.tsx` once the new flow lands. Decide `ProfileSetupScreen` + `BasicProfileSetup` fate.

### Session 2 exit check

- [ ] Full layer1 (≥3 turns) → 12 cards → 3 corrections → skip wali → finalize → twins row `version=1` in Supabase
- [ ] `GET /twin/me` returns the new twin spec
- [ ] Resume: kill app mid-Layer 2 → relaunch → AppNavigator boots into OnboardingLayer2 at the right card index (via stored sessionId)
- [ ] `npm run typecheck` clean
- [ ] Commit + push branch `integration/session-2-onboarding`

### Known gotchas for Session 2

- **Onboarding session TTL is 15 minutes** in the backend's in-memory store (per backend SESSION_CONTEXT Session 2 notes). If the user pauses for >15 min, `sessionId` is stale and the next call 404s. Surface a "session expired — let's restart this step" toast and call layer1 again to mint a new sessionId.
- **sessionId === flowId for SSE.** Onboarding has its own trace at `/stream/:sessionId` if you want to show progress dots. Optional for Session 2.
- **Layer 3 has two modes** in a single endpoint. Body shape differs: `{sessionId, mode:'generate'}` returns `{statements: string[]}`; `{sessionId, mode:'correct', corrections:[...]}` returns `{twinPreview}`. Adjust `src/api/types.ts` Layer3Request union if the route handler differs.
- **Backend dev bypass user gets a synthetic email** (`dev-<digits>@rishtaai-dev.local`) — onboarding writes are tied to the JWT user_id, not phone. Verify writes land under the right user before finalizing.
- **Read the route file first.** The endpoint shapes in `src/api/types.ts` (`Layer1Response`, `Layer2Response`, etc.) are inferred from the SESSION_CONTEXT. The actual handler may name fields differently. Read `backend/src/routes/onboarding.routes.ts` before wiring each endpoint and update `types.ts` if there's drift.

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
