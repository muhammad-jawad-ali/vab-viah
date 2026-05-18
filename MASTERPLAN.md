# RishtaAI Frontend — Masterplan

> **This file is the single source of truth for wiring the Vab-Viah Expo frontend to the RishtaAI Fastify backend.** Every session begins by reading this file plus `SESSION_CONTEXT.md`. Update `SESSION_CONTEXT.md` (not this file) at the end of each session.

---

## 0. Context

The user shipped 5 backend sessions per `D:/Projects/rishtaai/backend/MASTERPLAN.md`. A teammate built this Expo frontend (`frontend/vab-viah/`) independently against a *speculative* API spec in `docs/specifications/api_documentation.md` that does NOT match what shipped. Result: 16 screens with rich UI but **zero real network calls** — everything reads from `src/api/mockData.ts` or the Zustand store.

**Submission: 20 May 2026 (~2 days from kickoff).**

**Backend audit verdict — PASS.** All 15 MASTERPLAN §7 endpoints exist with correct `{ok, data?, error?}` shape, JWT-gated. All 8 agents, 4 workplans, 6 DB tables, SSE `TraceEvent` union, CORS open, Railway-ready. No corrections needed before integration.

---

## 1. Non-negotiables

1. **Backend is locked** per backend MASTERPLAN §11 (Day 5 feature freeze already passed). Do NOT change backend except for true blockers — escalate first.
2. **Frontend repo is separate** — `frontend/vab-viah/.git` is its own remote (`muhammad-jawad-ali/vab-viah`). All commits land there, not in the outer `D:/Projects/rishtaai` repo.
3. **Honor the data contract.** Backend returns snake_case + `0–1` scores + `{ok,data?,error?}` envelope. Frontend normalizes in ONE place: `src/api/types.ts` adapter functions.
4. **No mocks left behind.** Every consumer of `mockData.ts` must move to a React Query hook before that file is deleted.
5. **SSE is the demo wow-factor.** Real `react-native-sse` on `TwinDebateScreen` — judges see live Antigravity traces.
6. **Wali decoupled.** Users are never blocked by wali. Standalone Wali tab is removed; wali brief surfaces as an optional view inside booking. Onboarding Layer 4 (wali) is explicitly skippable.
7. **TypeScript strict everywhere.** No `any`, no untyped responses.

---

## 2. Architecture (one screen)

```
┌──────────────────────────────────────────────────────────────┐
│  Expo App (React Native 0.81, Expo SDK 54, NativeWind 4)      │
│  Screens · React Query · Zustand · react-native-sse           │
└────────────────────────┬─────────────────────────────────────┘
                         │ src/api/client.ts  (typed wrappers)
                         │ src/api/sse.ts     (real-time stream)
                         │ src/api/types.ts   (snake_case ↔ camelCase)
                         │
                         │ HTTPS REST + SSE  (Bearer JWT from SecureStore)
                         │
┌────────────────────────▼─────────────────────────────────────┐
│  Fastify Backend (already shipped)                            │
│  /auth /onboarding /twin /match /stream /book /dispute        │
│  /feedback /baseline                                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Tech stack (locked)

| Concern | Choice | Reason |
|---|---|---|
| Framework | Expo SDK 54 + RN 0.81 | Already in place |
| Navigation | `@react-navigation/native` v7 (native-stack + bottom-tabs) | Already in place |
| Styling | NativeWind 4 (Tailwind for RN) | Already in place |
| State | Zustand v5 | Already in place |
| Data fetching | TanStack React Query v5 | Already provisioned (`QueryProvider`) |
| HTTP client | `fetch` wrapped in `src/api/client.ts` | Zero new deps |
| SSE | `react-native-sse` (NEW) | RN has no native `EventSource` |
| Secure storage | `expo-secure-store` (NEW) | JWT persistence |
| Audio | `expo-av` (confirm in deps) | Plays `data:audio/mp3` wali TTS |

**Forbidden:** axios (`fetch` is enough), Redux, AsyncStorage for the JWT (use SecureStore), `any`.

---

## 4. Backend endpoint reference (cheatsheet)

All endpoints return `{ ok: boolean, data?, error? }`. Auth via `Authorization: Bearer <supabase-jwt>` for everything except `/auth/*`.

| Method | Path | Purpose | Frontend screen |
|---|---|---|---|
| POST | `/auth/otp/start` | Send OTP to phone | SignupScreen |
| POST | `/auth/otp/verify` | Verify OTP → JWT | SignupScreen |
| POST | `/onboarding/layer1` | Voice/text chat turn → next_prompt + confidence | OnboardingLayer1Screen |
| POST | `/onboarding/layer2` | Scenario card response → radar update | OnboardingLayer2Screen |
| POST | `/onboarding/layer3` | Generate or apply Twin Interview corrections | OnboardingLayer3Screen |
| POST | `/onboarding/wali` | Optional Wali Mode input | OnboardingWaliScreen |
| POST | `/onboarding/finalize` | Lock Twin v1.0 | OnboardingFinalizeScreen |
| GET | `/twin/me` | Current user's Twin spec | App boot, TwinViewer |
| POST | `/match/request` | Kick off find_matches → flowId | MatchPoolScreen |
| GET | `/stream/:flowId` | SSE TraceEvent stream | TwinDebateScreen |
| GET | `/match/results/:flowId` | Top-3 CompatibilityReports | MatchPoolScreen, CompatibilityReportScreen |
| GET | `/baseline/match` | Non-agentic ranking comparison | Baseline sheet |
| POST | `/book/initiate` | Start halal reveal + booking | BookingScreen |
| POST | `/book/confirm` | Confirm chosen slot | BookingScreen |
| POST | `/dispute/file` | File a dispute | DisputeFormScreen |
| POST | `/feedback/post-meeting` | 4-dimension rating → Twin v2 | FeedbackSurveyScreen |

**SSE TraceEvent shape:**
```ts
type TraceEvent =
  | { type: 'workplan.started'; workplan: string; flowId: string }
  | { type: 'task.started'; task: string }
  | { type: 'agent.observation'; agent: string; observation: string }
  | { type: 'agent.decision'; agent: string; decision: string; rationale: string }
  | { type: 'tool.call'; tool: string; args: any }
  | { type: 'tool.result'; tool: string; result: any; latency_ms: number }
  | { type: 'agent.message'; agent: string; content: string }
  | { type: 'dimension.scored'; dimension: string; score: number; evidence: string }
  | { type: 'recovery'; reason: string; action: string }
  | { type: 'task.finished'; task: string; outcome: any }
  | { type: 'workplan.finished'; outcome: any };
```

**Before each Phase, read the relevant backend route file in `D:/Projects/rishtaai/backend/src/routes/` to confirm exact request/response shapes — DO NOT GUESS.**

---

## 5. Gap inventory (frontend assumed → backend ships)

| Concern | Frontend assumes | Backend ships |
|---|---|---|
| Paths | `/api/v1/twin/forge`, `/matches`, `/debate/start`, `/wali/pending` | See §4 above |
| Onboarding | One screen with 3 scenarios | 4-layer flow (chat → 12 cards → interview → optional wali → finalize) |
| Match score | `compatibilityScore: 0–100` (number) | `overall_score: 0–1` (numeric) |
| Dimensions | `deen, family, career, finances, kids, conflict, geography, **boundaries**` | `deen, family, career, finances, kids, conflict, geography, **dealbreakers**` |
| Debate stream | Fake — `Animated` API replays static `DEBATE_MAP` | Real SSE at `GET /stream/:flowId` |
| Wali | Standalone tab with approve/reject UI | Internal-only to `book_meeting`; brief + TTS + SMS preview |
| Auth persistence | None | Real Supabase JWT returned |

---

## 6. Repository layout (target end state)

```
frontend/vab-viah/
├── App.tsx                          # Boot: loadAuth() → NavigationContainer
├── app.json                         # Expo config + EXPO_PUBLIC_API_URL
├── package.json
├── tailwind.config.js               # Design tokens
├── MASTERPLAN.md                    # This file
├── SESSION_CONTEXT.md               # Updated end of each session
├── .env / .env.example              # EXPO_PUBLIC_API_URL
├── src/
│   ├── api/
│   │   ├── client.ts                # Typed apiFetch + endpoint wrappers (NEW)
│   │   ├── types.ts                 # Backend type mirror + adapters (NEW)
│   │   ├── auth.ts                  # saveAuth / loadAuth / clearAuth (NEW)
│   │   ├── sse.ts                   # react-native-sse wrapper (NEW)
│   │   ├── QueryProvider.tsx        # (existing)
│   │   └── hooks/
│   │       ├── useTwinMe.ts
│   │       ├── useMatches.ts
│   │       ├── useTwinDebate.ts     # SSE-driven
│   │       ├── useBooking.ts
│   │       ├── useDispute.ts
│   │       └── useFeedback.ts
│   ├── components/                  # Existing + polish in Phase 5
│   ├── navigation/
│   │   ├── AppNavigator.tsx         # Onboarding stack + boot routing
│   │   └── types.ts
│   ├── screens/
│   │   ├── SignupScreen.tsx
│   │   ├── onboarding/
│   │   │   ├── OnboardingLayer1Screen.tsx
│   │   │   ├── OnboardingLayer2Screen.tsx
│   │   │   ├── OnboardingLayer3Screen.tsx
│   │   │   ├── OnboardingWaliScreen.tsx
│   │   │   └── OnboardingFinalizeScreen.tsx
│   │   ├── MatchPoolScreen.tsx
│   │   ├── TwinDebateScreen.tsx
│   │   ├── CompatibilityReportScreen.tsx
│   │   ├── BookingScreen.tsx        # Embedded wali brief panel
│   │   ├── FeedbackSurveyScreen.tsx
│   │   ├── DisputeFormScreen.tsx
│   │   ├── VideoMeetingScreen.tsx   # Placeholder (out of scope)
│   │   ├── PaywallScreen.tsx        # Placeholder
│   │   ├── SettingsScreen.tsx       # Placeholder
│   │   ├── HelpDeskScreen.tsx       # Placeholder
│   │   └── BlockModalScreen.tsx
│   └── store/
│       └── useAppStore.ts           # Onboarding session, twin, meetings
```

**Deleted by end:** `src/api/mockData.ts`, `src/screens/WaliDashboardScreen.tsx`, `src/screens/TwinOnboardingScreen.tsx`, `src/screens/ProfileSetupScreen.tsx`, `src/screens/BasicProfileSetup.tsx` (last two pending Phase 2 read-through).

---

## 7. The 5 sessions (engineering view)

Sessions mirror the 5 phases. Each is scoped tight enough that a lighter model (Sonnet 4.6 / Haiku 4.5) can execute it solo by reading MASTERPLAN.md + SESSION_CONTEXT.md.

### Session 1 — Foundation (API client + auth + env) — ~3 hrs
**Goal:** SignupScreen authenticates against real backend; JWT persists across app restart; API client + types + auth scaffolding ready.

**Deliverables:**
- `.env` + `.env.example` with `EXPO_PUBLIC_API_URL`
- Install: `react-native-sse`, `expo-secure-store`, confirm `expo-av`
- `src/api/client.ts` — `apiFetch<T>` + typed `api.*` wrappers for all 16 endpoints (stubs OK for endpoints used in later sessions)
- `src/api/types.ts` — TwinSpec / CompatibilityReport / TraceEvent / Meeting / DisputeResolution mirrored from backend + `toFrontendMatch` adapter
- `src/api/auth.ts` — `saveAuth`, `loadAuth`, `clearAuth`
- `App.tsx` calls `loadAuth()` on boot
- `SignupScreen.tsx` — real OTP flow with dev-bypass hint
- `useAppStore.ts` — add JWT/userId fields if missing

**Exit check:**
- Cold-start app → SignupScreen → `+923001234567` / `0000` → JWT in SecureStore
- Kill + relaunch → user stays logged in
- Bad JWT → `clearAuth()` + back to SignupScreen
- `npx tsc --noEmit` clean

### Session 2 — Onboarding restructure (4-layer flow) — ~4 hrs
**Goal:** User completes the full 4-layer onboarding flow against real backend; Twin spec lands in Supabase.

**Reads first:** `backend/src/routes/onboarding.routes.ts`, `backend/src/workplans/onboarding.workplan.ts`, `backend/src/content/scenario-cards.ts`.

**Deliverables:**
- `src/screens/onboarding/OnboardingLayer1Screen.tsx` — chat UI, text input only (voice deferred), chip fallback on low confidence
- `OnboardingLayer2Screen.tsx` — 12 scenario cards walked sequentially, progress bar
- `OnboardingLayer3Screen.tsx` — show 3 generated statements, editable, POST corrections
- `OnboardingWaliScreen.tsx` — skippable, with prominent "Skip" CTA
- `OnboardingFinalizeScreen.tsx` — review + finalize → navigate to MainTabs
- `useAppStore.ts` — `onboardingSessionId` (sessionId === flowId for SSE)
- `AppNavigator.tsx` — `OnboardingStack` + boot routing (no JWT → Signup; JWT + no Twin → Onboarding; JWT + Twin → MainTabs)
- Decide fate of `ProfileSetupScreen` + `BasicProfileSetup` (fold or delete)

**Exit check:**
- Full layer1 (≥3 turns) → 12 cards → 3 corrections → skip wali → finalize → twins row `version=1` in Supabase
- `GET /twin/me` returns it
- Resume: kill app mid-Layer 2 → relaunch → land on Layer 2 at the right card

### Session 3 — Match flow + SSE Twin debate — ~5 hrs
**Goal:** Top-3 cards from real backend; live SSE debate stream renders in TwinDebateScreen; CompatibilityReport with real data + reasoning trace.

**Reads first:** `backend/src/routes/match.routes.ts`, `backend/src/routes/stream.routes.ts`, `backend/src/workplans/find-matches.workplan.ts`, `backend/src/domain/scoring.ts`, `backend/src/agents/_shared/types.ts`.

**Deliverables:**
- `src/api/sse.ts` — `react-native-sse` wrapper, auth header support
- `useMatches.ts` — POST `/match/request`, poll `/match/results/:flowId` until 200 with data
- `useTwinDebate.ts` — opens SSE, reducer for `agent.message` / `dimension.scored` / `recovery` / `workplan.finished` / `task.started`
- `MatchPoolScreen.tsx` — uses `useMatches`, skeleton loading, pull-to-refresh
- `TwinDebateScreen.tsx` — SSE-driven bubbles + dimension bars + recovery chips; fallback to `reasoning_trace` replay
- `CompatibilityReportScreen.tsx` — real data + expandable reasoning trace
- Baseline comparison sheet — `GET /baseline/match` side-by-side rank diff

**Exit check:**
- Match → ~30s of skeleton → 3 real cards with `overall_score` * 100
- Tap card → SSE bubbles appear live; 8 dimension bars fill; final synthesis
- Report screen renders strengths/frictions/dealbreakers + recommendation badge
- Baseline sheet shows agentic vs baseline rank diff
- SSE drop → graceful fallback to trace replay with "(replay)" badge

### Session 4 — Booking + Dispute + Feedback + Wali decouple — ~4 hrs
**Goal:** Full happy-path complete: match → debate → report → book (with wali brief panel) → confirm → feedback → twin v2. Dispute flow works.

**Reads first:** `backend/src/routes/booking.routes.ts`, `backend/src/routes/dispute.routes.ts`, `backend/src/routes/feedback.routes.ts`, `backend/src/workplans/book-meeting.workplan.ts`.

**Deliverables:**
- `useBooking.ts` — `/book/initiate` + `/book/confirm`
- `BookingScreen.tsx` — 3 real slots, 3 real venues, expandable **Wali Brief panel** (EN/RO_UR tabs, `expo-av` audio player, SMS preview) below the slot picker
- Remove Wali tab from `AppNavigator.tsx`; delete `WaliDashboardScreen.tsx`
- Remove `MOCK_WALI_PENDING` from `mockData.ts`
- `useFeedback.ts` — POST `/feedback/post-meeting`
- `FeedbackSurveyScreen.tsx` — 4 ratings (truthfulness, chemistry, family_alignment, would_meet_again), narrative, submit
- `useDispute.ts` — POST `/dispute/file`
- `DisputeFormScreen.tsx` — category enum mapped to backend types, narrative, submit, render mediation response

**Exit check:**
- Open booking on a matched candidate → 3 slots + venues render → expand wali brief → TTS audio plays
- Confirm → meeting row `status='confirmed'` in Supabase
- Submit feedback (chemistry=2) → new twins row `version=2` in Supabase
- File dispute → severity + action returned, surfaced in UI
- Wali tab gone from bottom nav; no broken imports

### Session 5 — Premium UI polish (time-boxed) — ~3 hrs
**Goal:** Demo-ready aesthetic. Loading / empty / error states. Design tokens. Micro-animations.

**Deliverables:**
- `tailwind.config.js` — color tokens (warm-cream + deep-teal + saffron palette), typography scale
- Heading font (`@expo-google-fonts/playfair-display`) + body (Inter); Nastaliq fallback for Urdu copy
- Skeletons for every `useQuery` site
- Empty-state illustrations + retry-on-error cards
- SSE polish: per-dimension progress bar; recovery chips; final-synthesis fade-in
- Match-card reveal animation; compatibility radar chart (`react-native-svg`); haptics on primary CTAs
- Accessibility: `accessibilityLabel` on all buttons
- Delete `src/api/mockData.ts` (all consumers migrated)
- Delete obsolete screens; tidy up

**Exit check:**
- Demo-day walk-through (see §9 verification) feels polished
- No mockData imports anywhere (`grep -r "from.*mockData" src/`)
- `npx tsc --noEmit` clean

---

## 8. Definition of done (per session)

A session is "done" when:
1. TypeScript compiles with no errors, no `any`.
2. Session exit-check passes on a real device against the dev backend.
3. `SESSION_CONTEXT.md` updated: move "in progress" to "done", note blockers, fill "handoff for next session".
4. Commit landed in `frontend/vab-viah` git repo with message `session N: <summary>`.
5. No regressions in earlier-session flows.

---

## 9. End-to-end verification (after Session 5)

```
1. cd backend && npm run dev   # (or hit Railway URL)
2. cd frontend/vab-viah && npx expo start --tunnel
3. Open Expo Go on phone, scan QR
4. Signup: +923001234567 / 0000 (dev bypass) → JWT lands in SecureStore
5. Onboarding: Layer 1 (3 turns) → 12 cards → 3 corrections → skip wali → finalize
6. MatchPool: ~30s skeleton → 3 real cards
7. Tap card → live SSE debate, dimension bars fill, recovery chips if any
8. Compatibility report with reasoning trace expandable
9. Baseline sheet → agentic vs baseline rank diff
10. Booking: 3 slots + 3 venues + Wali Brief panel (TTS plays, SMS preview)
11. Confirm → meeting status='confirmed' in Supabase
12. Mark complete → Feedback (4 ratings) → twins row version=2 in Supabase
13. File dispute → severity + action returned
```

---

## 10. Out of scope (explicitly NOT doing)

- Backend changes (locked per backend MASTERPLAN §11)
- Real Twilio / SMS / payment integration
- Voice input in onboarding Layer 1 (text-only MVP)
- `VideoMeetingScreen` real wiring (placeholder)
- `PaywallScreen`, `SettingsScreen`, `HelpDeskScreen` real wiring
- i18n full pass — only Urdu/Roman Urdu copy already present in backend prompts gets surfaced

---

## 11. Risks + mitigations

| Risk | Mitigation |
|---|---|
| `react-native-sse` auth headers issue in Expo Go | Use `headers` config; fallback to querystring JWT (demo only) |
| Onboarding 15-min session timeout | Backend allows resume via `sessionId`; surface "session expired" toast |
| Backend response shape drift | Read route file before each Phase; adapter handles it |
| 2-day deadline overrun | Sessions 1–4 are MUST; Session 5 is time-boxed polish |
| Demo-day backend unreachable | Cache last `find_matches` result in AsyncStorage; offline banner |
| Frontend repo is separate git | Confirm push access (user is a contributor); don't commit to outer rishtaai repo |

---

## 12. Session protocol

You will work in 5 focused sessions. Each session:

1. **Open `MASTERPLAN.md` and `SESSION_CONTEXT.md`.**
2. Confirm with the user which session number you are about to run.
3. Read the "Session N goals" block in §7 above.
4. Read the relevant backend route file(s) listed in that session's "Reads first".
5. At the end of the session, update `SESSION_CONTEXT.md` (done, in-progress, blockers, handoff).
6. Commit in `frontend/vab-viah` with message `session N: <summary>`.

Anything more than 5 sessions means we are off track — escalate to the user.
