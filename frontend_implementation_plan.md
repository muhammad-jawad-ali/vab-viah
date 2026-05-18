# RishtaAI Frontend — Implementation Plan
> Cross-referenced: `RishtaAI_PRD_v1.0.md` × `API_DOCS.md`  
> Current date: 2026-05-18 (Day 3 of 5-day sprint)

---

## 1. Current Codebase Status

### ✅ Already Done (Phase 1)
| Item | File | Status |
|---|---|---|
| Navigation scaffold | `AppNavigator.tsx` | ✅ Complete |
| Nav type definitions | `navigation/types.ts` | ✅ Complete |
| All 16 screen stubs | `src/screens/*.tsx` | ✅ Stubbed |
| Shared components | `AgTrace`, `SafeScreen`, `Section`, `InputField`, `Selector` | ✅ Complete |
| Zustand store foundation | `useAppStore.ts` | ✅ Basic |
| React Query provider | `api/QueryProvider.tsx` | ✅ Complete |
| BasicProfileSetup form | `BasicProfileSetup.tsx` | ✅ Complete |
| SignupScreen | `SignupScreen.tsx` | ✅ Polished |
| TwinOnboardingScreen | `TwinOnboardingScreen.tsx` | ✅ Base done |

### ❌ Not Yet Done (Phases 2–7)
- API client layer (`src/api/client.ts` + per-domain hooks)
- Zustand store: auth token, twin spec, meeting, wali state
- All functional screens (stubs exist, need real logic + UI)
- Voice recording UI mock
- Scenario cards with radar chart
- Twin Debate split-screen with streaming
- Compatibility Report 8-dimension breakdown
- Booking flow with venue cards
- Wali Dashboard with approval flow
- Feedback survey + dispute form
- AgTrace component wired to real data

---

## 2. Architecture Map

```
src/
├── api/
│   ├── QueryProvider.tsx        ✅ exists
│   ├── client.ts                ❌ create — base axios/fetch client
│   ├── auth.api.ts              ❌ OTP send/verify hooks
│   ├── profile.api.ts           ❌ profile save/get hooks
│   ├── twin.api.ts              ❌ forge twin hook
│   ├── matches.api.ts           ❌ match pool + debate + report hooks
│   ├── booking.api.ts           ❌ slots + confirm hooks
│   ├── feedback.api.ts          ❌ feedback + dispute hooks
│   └── wali.api.ts              ❌ pending + action hooks
├── components/
│   ├── AgTrace.tsx              ✅ exists (needs data wire-up)
│   ├── InputField.tsx           ✅ exists
│   ├── SafeScreen.tsx           ✅ exists
│   ├── Section.tsx              ✅ exists
│   ├── Selector.tsx             ✅ exists
│   ├── RadarChart.tsx           ❌ create — scenario card radar
│   ├── MatchCard.tsx            ❌ create — blurred match card
│   ├── DebateMessage.tsx        ❌ create — chat bubble for debate
│   ├── DimensionBar.tsx         ❌ create — compatibility bar
│   ├── VenueCard.tsx            ❌ create — meeting venue suggestion
│   └── ScenarioCard.tsx         ❌ create — swipeable dilemma card
├── navigation/
│   ├── AppNavigator.tsx         ✅ exists
│   └── types.ts                 ✅ exists (needs param updates)
├── screens/                     (all 16 exist, most are stubs)
└── store/
    └── useAppStore.ts           ✅ exists (needs major extension)
```

---

## 3. API Client Layer

### 3.1 `src/api/client.ts` — Create this file
```ts
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function apiGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

### 3.2 API Hooks per Domain

#### `src/api/auth.api.ts`
```ts
// POST /api/v1/auth/send-otp  → { status, message }
// POST /api/v1/auth/verify-otp → { status, token, user: { id, isProfileComplete, hasTwin } }
import { useMutation } from '@tanstack/react-query';
import { apiPost } from './client';

export const useSendOtp = () =>
  useMutation({ mutationFn: (phoneNumber: string) =>
    apiPost('/api/v1/auth/send-otp', { phoneNumber }) });

export const useVerifyOtp = () =>
  useMutation({ mutationFn: (data: { phoneNumber: string; otp: string }) =>
    apiPost<{ token: string; user: { id: string; isProfileComplete: boolean; hasTwin: boolean } }>(
      '/api/v1/auth/verify-otp', data) });
```

#### `src/api/profile.api.ts`
```ts
// POST /api/v1/profile  → { status, message, profileId }
export const useSaveProfile = (token: string) =>
  useMutation({ mutationFn: (body: ProfilePayload) =>
    apiPost('/api/v1/profile', body, token) });
```

#### `src/api/twin.api.ts`
```ts
// POST /api/v1/twin/forge → { status, twin: { twinId, summary, weights } }
export interface ForgePayload {
  voiceIntroductionTranscript: string;
  isWaliModeEnabled: boolean;
  scenarios: { scenarioId: string; choice: string }[];
}
export const useForgeTwin = (token: string) =>
  useMutation({ mutationFn: (body: ForgePayload) =>
    apiPost('/api/v1/twin/forge', body, token) });
```

#### `src/api/matches.api.ts`
```ts
// GET /api/v1/matches → { matches: [...] }
// POST /api/v1/debate/start → { debateId, messages: [...] }
// GET /api/v1/report/:matchId → { overallScore, dimensions, frictionPoint }
export const useMatches = (token: string) =>
  useQuery({ queryKey: ['matches'], queryFn: () => apiGet('/api/v1/matches', token) });

export const useStartDebate = (token: string) =>
  useMutation({ mutationFn: (targetMatchId: string) =>
    apiPost('/api/v1/debate/start', { targetMatchId }, token) });

export const useCompatibilityReport = (matchId: string, token: string) =>
  useQuery({ queryKey: ['report', matchId], queryFn: () =>
    apiGet(`/api/v1/report/${matchId}`, token) });
```

#### `src/api/booking.api.ts`
```ts
// GET /api/v1/booking/slots → { slots: [...] }
// POST /api/v1/booking → { meetingId, meetingUrl, message }
export const useSlots = (token: string) =>
  useQuery({ queryKey: ['slots'], queryFn: () => apiGet('/api/v1/booking/slots', token) });

export const useConfirmBooking = (token: string) =>
  useMutation({ mutationFn: (body: { matchId: string; slotId: string }) =>
    apiPost('/api/v1/booking', body, token) });
```

#### `src/api/feedback.api.ts`
```ts
// POST /api/v1/feedback
// POST /api/v1/dispute
export const useSubmitFeedback = (token: string) =>
  useMutation({ mutationFn: (body: FeedbackPayload) => apiPost('/api/v1/feedback', body, token) });

export const useFileDispute = (token: string) =>
  useMutation({ mutationFn: (body: DisputePayload) => apiPost('/api/v1/dispute', body, token) });
```

#### `src/api/wali.api.ts`
```ts
// GET /api/v1/wali/pending
// POST /api/v1/wali/action → { action: 'APPROVE' | 'REJECT' }
export const useWaliPending = (token: string) =>
  useQuery({ queryKey: ['wali-pending'], queryFn: () => apiGet('/api/v1/wali/pending', token) });

export const useWaliAction = (token: string) =>
  useMutation({ mutationFn: (body: { matchId: string; action: 'APPROVE' | 'REJECT' }) =>
    apiPost('/api/v1/wali/action', body, token) });
```

---

## 4. Zustand Store — Extended Shape

Extend `src/store/useAppStore.ts` to:

```ts
interface AuthState {
  token: string | null;
  userId: string | null;
  phoneNumber: string | null;
  isProfileComplete: boolean;
  hasTwin: boolean;
}

interface TwinState {
  twinId: string | null;
  summary: string | null;
  weights: Record<string, number> | null;
  voiceTranscript: string;
  scenarioAnswers: { scenarioId: string; choice: string }[];
  isWaliModeEnabled: boolean;
}

interface MeetingState {
  activeMeetingId: string | null;
  activeMeetingUrl: string | null;
}

interface AppState extends AuthState, TwinState, MeetingState {
  // existing
  user: { name: string; isWaliMode: boolean } | null;
  matches: Match[];
  isPremium: boolean;
  debateLog: DebateMessage[];
  activeMatchId: string | null;
  // actions
  setAuth: (token: string, userId: string, meta: { isProfileComplete: boolean; hasTwin: boolean }) => void;
  setPhoneNumber: (p: string) => void;
  setTwin: (twin: { twinId: string; summary: string; weights: Record<string, number> }) => void;
  setVoiceTranscript: (t: string) => void;
  addScenarioAnswer: (ans: { scenarioId: string; choice: string }) => void;
  setWaliMode: (v: boolean) => void;
  setActiveMatch: (id: string) => void;
  setMeeting: (meetingId: string, meetingUrl: string) => void;
  logout: () => void;
}
```

---

## 5. Navigation — Route Param Updates

Update `src/navigation/types.ts`:

```ts
export type DiscoverStackParamList = {
  MatchPool: undefined;
  TwinDebate: { matchId: string };        // ← add matchId
  CompatibilityReport: { matchId: string }; // ← add matchId
  Paywall: undefined;
};

export type MeetingStackParamList = {
  Booking: { matchId: string };           // ← add matchId
  VideoMeeting: { meetingUrl: string; meetingId: string }; // ← add params
  FeedbackSurvey: { meetingId: string };  // ← add meetingId
  DisputeForm: { matchId: string };       // ← add matchId
};
```

---

## 6. Screen-by-Screen Implementation Tasks

### 🔐 AUTH FLOW

#### `SignupScreen.tsx` — Needs wiring
- [x] UI exists and is polished
- [ ] Wire `useSendOtp` mutation on "Send OTP" press
- [ ] Wire `useVerifyOtp` mutation on OTP submit
- [ ] On success: call `store.setAuth(token, userId, { isProfileComplete, hasTwin })`
- [ ] Navigate: if `!isProfileComplete` → `ProfileSetup`; if `!hasTwin` → `TwinOnboarding`; else → `Main`
- [ ] Store `phoneNumber` in Zustand before calling send-otp
- [ ] Show loading spinner on mutation pending
- [ ] Show error toast on mutation error

#### `ProfileSetupScreen.tsx` — Needs wiring
- [ ] Wire `useSaveProfile` mutation on submit
- [ ] Pass `store.token` as auth header
- [ ] On success: set `store.isProfileComplete = true`, navigate to `TwinOnboarding`
- [ ] Full form validation (name, age, city, profession required)
- [ ] Show inline field errors

#### `BasicProfileSetup.tsx` — Needs wiring (edit mode from Settings)
- [x] Form UI is complete (largest screen, 17KB)
- [ ] Pre-populate fields from Zustand `user` state
- [ ] Wire `useSaveProfile` on submit
- [ ] Show success toast on save

---

### 🧬 TWIN ONBOARDING

#### `TwinOnboardingScreen.tsx` — Needs major expansion
This is the most complex screen. Implement as a multi-step wizard:

**Step 1 — Layer 1: Voice Chat (mock)**
- [ ] Show WhatsApp-style chat bubble UI
- [ ] Onboarding Agent Q&A: 5 pre-scripted questions as chat messages
- [ ] "Record Voice" button → mock waveform animation (no real STT needed for MVP)
- [ ] Text input fallback for each question
- [ ] On each answer: append to `voiceTranscript` in store
- [ ] Show `AgTrace` strip below: "Confidence: 87% | Language: Roman Urdu"

**Step 2 — Layer 2: Scenario Cards**
- [ ] Create `ScenarioCard` component: card title + 4 choice buttons (A/B/C/D)
- [ ] 12 scenario cards (hardcode content from PRD §8.2)
- [ ] On each choice: call `store.addScenarioAnswer({ scenarioId, choice })`
- [ ] `RadarChart` component updates live (8 dimensions, SVG-based)
- [ ] Show dimension labels: deen, family, career, finances, kids, conflict, geography, dealbreakers

**Step 3 — Layer 3: Twin Interview**
- [ ] Call `useForgeTwin` with transcript + scenario answers + isWaliMode
- [ ] Display 3 generated self-statements from API response `twin.summary`
- [ ] `[✓ Yes]` `[✗ Not me]` buttons per statement
- [ ] "Not me" → open text correction input
- [ ] "Lock Twin" CTA → store `twinId`, `summary`, `weights` in Zustand
- [ ] Navigate to `Main`

**Step 4 — Wali Mode toggle (already in screen)**
- [ ] When enabled: show simplified Urdu-styled input section
- [ ] Set `isWaliModeEnabled: true` in store before calling forge

---

### 🎯 DISCOVER / MATCH FLOW

#### `MatchPoolScreen.tsx` — Needs full build
- [ ] Call `useMatches(token)` on mount
- [ ] Render `MatchCard` list (compatibility score, blurred avatar, tags)
- [ ] "View Details" → navigate to `TwinDebate` with `matchId`
- [ ] Paywall gate: if `!isPremium` and viewed 3+ matches → navigate to `Paywall`
- [ ] Loading skeleton while fetching
- [ ] Empty state: "Your Twin is searching..."
- [ ] `AgTrace` strip: "Pre-screening 12 candidates → 5 shortlisted"

#### `TwinDebateScreen.tsx` — Needs full build (hero moment)
- [ ] Receive `matchId` from nav params
- [ ] Call `useStartDebate(token)` with `matchId` on mount
- [ ] Render split-screen: left = "Your Twin" | right = "Candidate Twin"
- [ ] Render `DebateMessage` bubbles with typing indicator animation
- [ ] Moderator messages appear centered in a distinct style
- [ ] Live compatibility meter (animated `Animated.Value` 0→score)
- [ ] Dimension label strip showing current dimension under debate
- [ ] `AgTrace` strip: live reasoning steps from `messages[].speaker === 'Moderator'`
- [ ] "View Report" CTA after last message → navigate to `CompatibilityReport`

#### `CompatibilityReportScreen.tsx` — Needs full build
- [ ] Receive `matchId` from nav params
- [ ] Call `useCompatibilityReport(matchId, token)`
- [ ] Overall score: large animated number counter
- [ ] 8x `DimensionBar` components: deen, family, career, finances, kids, conflict, geography, boundaries
- [ ] Friction point callout card (highlighted in amber)
- [ ] Top strengths list (green checkmarks)
- [ ] "Initiate Halal Reveal" CTA → navigate to `Booking`
- [ ] "Report Issue" link → navigate to `DisputeForm`

#### `PaywallScreen.tsx` — Needs polish
- [ ] Show 3 pricing tiers: Lite (free), Plus (PKR 2,500/mo), Family Plus (PKR 15,000)
- [ ] "Upgrade" → mock payment flow → `store.setPremium(true)` → navigate back
- [ ] Tier feature comparison table

---

### 📅 MEETINGS FLOW

#### `BookingScreen.tsx` — Needs full build
- [ ] Receive `matchId` from nav params
- [ ] Call `useSlots(token)` for available time slots
- [ ] Render slot list: date, time, type (Virtual / In-Person), location
- [ ] Select slot → highlight selection
- [ ] "Confirm Meeting" → call `useConfirmBooking({ matchId, slotId })`
- [ ] On success: store `meetingId` + `meetingUrl`, show Meeting Card modal
- [ ] Meeting Card: venue name, wali contacts, date/time, mock calendar icon
- [ ] Mock SMS preview: "Your meeting has been confirmed..."

#### `VideoMeetingScreen.tsx` — Needs polish
- [ ] Receive `meetingUrl`, `meetingId` from nav params
- [ ] Show video call UI mock: timer, PiP placeholder, mute/camera/end controls
- [ ] "End Meeting" → navigate to `FeedbackSurvey` with `meetingId`

#### `FeedbackSurveyScreen.tsx` — Needs full build
- [ ] Receive `meetingId` from nav params
- [ ] 3 rating dimensions: chemistry (1–5 stars), values (1–5 stars), twinAccuracy (1–5 stars)
- [ ] Private notes text area
- [ ] Call `useSubmitFeedback` on submit
- [ ] On success: show "Twin Recalibrated" confirmation → navigate to `MatchPool`

#### `DisputeFormScreen.tsx` — Needs full build
- [ ] Receive `matchId` from nav params
- [ ] Category selector: "Misrepresentation" | "No-Show" | "Ghosting" | "Other"
- [ ] Details text area
- [ ] Call `useFileDispute` on submit
- [ ] On success: navigate to `BlockModalScreen`

#### `BlockModalScreen.tsx` — Needs polish
- [ ] "User blocked and flagged for review" confirmation
- [ ] CTA: "Return to Matches"

---

### 👨‍👩‍👧 WALI DASHBOARD

#### `WaliDashboardScreen.tsx` — Needs full build
- [ ] Call `useWaliPending(token)` on mount
- [ ] Render list of pending matches: applicant name, score, agent brief
- [ ] "Approve" → call `useWaliAction({ matchId, action: 'APPROVE' })`
- [ ] "Reject" → call `useWaliAction({ matchId, action: 'REJECT' })`
- [ ] Show optimistic update with toast on action
- [ ] Empty state: "No pending approvals"

---

### ⚙️ SETTINGS & SUPPORT

#### `SettingsScreen.tsx` — Needs wiring
- [ ] Profile section: show user name + phone from store
- [ ] "Edit Profile" → navigate to `BasicProfileSetup`
- [ ] Wali Mode toggle → `store.setWaliMode()`
- [ ] Notifications toggle (local preference, no API needed)
- [ ] "Help & Support" → navigate to `HelpDesk`
- [ ] "Sign Out" → `store.logout()`, navigate to `Signup`
- [ ] Baseline Mode toggle (hackathon demo requirement)

#### `HelpDeskScreen.tsx` — Needs polish
- [ ] FAQ accordion: 6–8 expandable items
- [ ] "Contact Support" CTA (mock email link)

---

## 7. Component Build Tasks

### `RadarChart.tsx` — New Component
```tsx
// 8-axis SVG radar chart using react-native-svg
// Props: dimensions: Record<string, number>, animated?: boolean
// Axes: deen, family, career, finances, kids, conflict, geography, dealbreakers
// Updates in real-time as user answers scenario cards
```

### `MatchCard.tsx` — New Component
```tsx
// Props: match: { matchId, displayName, blurAvatarUrl, compatibilityScore, tags }
// Blurred avatar (blur radius 8) until revealed
// Compatibility score badge (emerald gradient)
// Tag pills row
// "View Details" CTA button
```

### `DebateMessage.tsx` — New Component
```tsx
// Props: speaker: 'Moderator' | 'YourTwin' | "Candidate's Twin", text: string, animateIn?: boolean
// Moderator: centered, gray italic
// YourTwin: right-aligned, emerald background
// CandidateTwin: left-aligned, slate background
// Typing indicator: 3-dot animation before text appears
```

### `DimensionBar.tsx` — New Component
```tsx
// Props: label: string, score: number (0–100), weight: number
// Animated width fill on mount
// Color: green ≥80, amber 60–79, red <60
// Shows score number on right
```

### `ScenarioCard.tsx` — New Component
```tsx
// Props: title: string, choices: string[], onChoice: (choice: string) => void
// 4 choice buttons A/B/C/D
// Card slides out on choice (translateX animation)
```

### `VenueCard.tsx` — New Component
```tsx
// Props: venue: { name, type, location, slotId, date }
// Selectable card with radio-style indicator
// Virtual badge vs In-Person badge
```

### `AgTrace.tsx` — Enhance existing
```tsx
// Add props: entries: { label: string; value: string }[]
// Render as horizontal scrollable pill strip
// Auto-scroll to latest entry
// Green pulse indicator when active
```

---

## 8. Day-by-Day Priority (Today = Day 3)

### 🔴 Day 3 — TODAY (May 18): Twin Debate (Hero Moment)
| Priority | Task | File |
|---|---|---|
| P0 | Build `DebateMessage` component | `components/DebateMessage.tsx` |
| P0 | Build `TwinDebateScreen` split-screen + streaming mock | `screens/TwinDebateScreen.tsx` |
| P0 | Build `CompatibilityReportScreen` with `DimensionBar` | `screens/CompatibilityReportScreen.tsx` |
| P0 | Wire `DiscoverStack` nav params (matchId) | `navigation/types.ts` |
| P1 | Build `MatchPoolScreen` with `MatchCard` | `screens/MatchPoolScreen.tsx` |
| P1 | Extend Zustand store (auth + twin + meeting) | `store/useAppStore.ts` |
| P2 | Layer 3 Twin Interview in `TwinOnboardingScreen` | `screens/TwinOnboardingScreen.tsx` |

### 🟡 Day 4 (May 19): Service Orchestration
| Priority | Task | File |
|---|---|---|
| P0 | Build all API hooks | `api/*.ts` |
| P0 | Wire `SignupScreen` to auth API | `screens/SignupScreen.tsx` |
| P0 | Wire `TwinOnboardingScreen` to forge API | `screens/TwinOnboardingScreen.tsx` |
| P0 | Build `BookingScreen` with slot selection | `screens/BookingScreen.tsx` |
| P0 | Build `WaliDashboardScreen` with approve/reject | `screens/WaliDashboardScreen.tsx` |
| P1 | Build `FeedbackSurveyScreen` | `screens/FeedbackSurveyScreen.tsx` |
| P1 | Build `DisputeFormScreen` | `screens/DisputeFormScreen.tsx` |
| P1 | Wire `SettingsScreen` | `screens/SettingsScreen.tsx` |
| P2 | Baseline Mode toggle in Settings | `screens/SettingsScreen.tsx` |

### 🟢 Day 5 (May 20): Polish + Demo Prep
| Priority | Task |
|---|---|
| P0 | Micro-animations on all CTAs |
| P0 | Loading skeletons on all list screens |
| P0 | Empty states on all list screens |
| P0 | Error toast component (global) |
| P0 | Full iOS + Android test on real devices |
| P1 | AgTrace live data wired on Debate + Onboarding screens |
| P1 | Wali Mode Urdu-styled UI pass |
| P2 | PaywallScreen tier comparison table |

---

## 9. Non-Negotiables Checklist (vs PRD §16.3)

| Requirement | Status |
|---|---|
| 3-layer onboarding (L1 voice, L2 cards, L3 interview) | ⚠️ L1 + L2 partial in stub |
| Twin Forge → persistent storage | ❌ API hook not wired |
| Split-screen Twin debate + live trace | ❌ Screen is stub |
| Top-3 reveal + compatibility report | ❌ Screen is stub |
| Baseline comparison (Settings toggle) | ❌ Not built |
| Antigravity trace strip on key screens | ⚠️ AgTrace component exists, not wired |
| Mobile running on iOS + Android | ✅ Expo setup done |

---

## 10. Mock Data Fallbacks (for demo resilience)

Create `src/api/mockData.ts` with:
- 12 candidate objects (name, blurAvatar, compatibility, tags)
- 12 scenario cards (title + 4 choices + dimension mappings)
- 3 pre-built debate transcripts (Scenario A, B, C from PRD §12.3)
- 1 compatibility report (94% overall, all 8 dimensions)
- 2 booking slots (1 virtual, 1 in-person)
- 2 wali pending approvals

All API hooks should fall back to mock data when `EXPO_PUBLIC_USE_MOCK=true`.

---

## 11. Environment Variables

Create `.env` in project root:
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_USE_MOCK=true   # flip to false when backend is live
```

Access in code: `process.env.EXPO_PUBLIC_API_URL`

---

## 12. Key Design System Rules (for all screens)

- Background: `#0f1117` (near-black)
- Primary accent: `#10b981` (emerald-500)
- Secondary accent: `#064e3b` (emerald-900)
- Text primary: `#f8fafc`
- Text muted: `#94a3b8`
- Card background: `#1e293b`
- Border: `#334155`
- Error: `#ef4444`
- Warning/friction: `#f59e0b`
- Font: System default (SF Pro on iOS, Roboto on Android via NativeWind)
- Border radius: 12px cards, 8px inputs, 999px pills
- All screens use `SafeScreen` wrapper

---

*Plan generated: 2026-05-18 | Deadline: 2026-05-20 | Priority: Twin Debate screen first*
