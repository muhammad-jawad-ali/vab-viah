# Lab Viah (RishtaAI) — Frontend Build Instructions

> **Purpose:** Step-by-step guide to build the complete production-grade Expo mobile frontend end-to-end.
> **Stack:** Expo SDK 54 · React Native 0.81 · NativeWind 4 (Tailwind 3) · Zustand 5 · React Query 5 · React Navigation 7

---

## Table of Contents

1. [App Overview & Core Flow](#1-app-overview--core-flow)
2. [Navigation Architecture](#2-navigation-architecture)
3. [Screen Inventory & Specifications](#3-screen-inventory--specifications)
4. [Design System & Tokens](#4-design-system--tokens)
5. [State Management (Zustand)](#5-state-management-zustand)
6. [API & Data Layer](#6-api--data-layer)
7. [Antigravity Trace Requirements](#7-antigravity-trace-requirements)
8. [Phased Build Plan](#8-phased-build-plan)
9. [Critical Rules & Constraints](#9-critical-rules--constraints)

---

## 1. App Overview & Core Flow

Lab Viah is a **halal matchmaking** app powered by AI Twins. The word "dating" must **never** appear anywhere in the UI. The user journey follows this linear pipeline:

```
Auth → Profile → Twin Onboarding → Main App (Matches / Meetings / Wali / Settings)
```

### High-Level User Journey

```
SignupScreen ──OTP Verified──► ProfileSetupScreen ──Details Saved──► TwinOnboardingScreen ──Twin Created──► MainTabs
                                                                                                              │
                               ┌──────────────────────────────────────────────────────────────────────────────┘
                               │
                        ┌──────┼──────────┬──────────────┬──────────────┐
                        ▼      ▼          ▼              ▼              ▼
                   DiscoverTab    MeetingsTab       WaliTab       ProfileTab
                        │            │                │               │
                   MatchPool     Booking         WaliDashboard    Settings
                        │            │                               │
                   TwinDebate    VideoMeeting                   HelpDesk
                        │            │                           BlockModal
                   CompatReport  FeedbackSurvey
                        │            │
                   (Paywall)     DisputeForm
                                     │
                                 BlockModal
```

### Core Mechanic: Four Pillars
1. **AI Twin Personality Engine** — 8-minute, 3-layer onboarding (voice, scenario cards, twin interview) + Wali Mode
2. **Twin-to-Twin Negotiation** — Moderator Agent orchestrates debate, scores 8 dimensions
3. **Halal Reveal & Wali Dashboard** — Only top 3 matches unlocked, Wali contacted first
4. **Service Orchestration** — Pricing, scheduling, disputes, follow-ups

---

## 2. Navigation Architecture

### File: `src/navigation/AppNavigator.tsx`

The navigator is a **Root Stack** containing auth/onboarding screens plus a **Bottom Tab Navigator** for the main app.

```
RootStack (Native Stack, headerShown: false)
├── Signup              → SignupScreen
├── ProfileSetup        → ProfileSetupScreen
├── TwinOnboarding      → TwinOnboardingScreen
└── Main                → MainTabs (Bottom Tabs)
    ├── DiscoverTab     → DiscoverStack
    │   ├── MatchPool           → MatchPoolScreen
    │   ├── TwinDebate          → TwinDebateScreen
    │   ├── CompatibilityReport → CompatibilityReportScreen
    │   └── Paywall             → PaywallScreen
    ├── MeetingsTab     → MeetingStack
    │   ├── Booking             → BookingScreen
    │   ├── VideoMeeting        → VideoMeetingScreen
    │   ├── FeedbackSurvey      → FeedbackSurveyScreen
    │   └── DisputeForm         → DisputeFormScreen
    ├── WaliTab         → WaliDashboardScreen (standalone)
    └── ProfileTab      → ProfileStack
        ├── Settings            → SettingsScreen
        ├── HelpDesk            → HelpDeskScreen
        └── BlockModal          → BlockModalScreen
```

### Navigation Rules

- All stacks use `headerShown: false` — every screen manages its own header/safe-area.
- Bottom tabs: 4 tabs — **Matches**, **Meetings**, **Wali**, **Profile**.
- Tab bar style: white bg, emerald active tint (`#064e3b`), slate inactive (`#94a3b8`), height 60.
- Auth screens (`Signup → ProfileSetup → TwinOnboarding`) are **linear** — no back navigation once completed.
- After `TwinOnboarding` completes, navigate to `Main` and the auth screens should be unreachable.

### Type Safety

Define a `RootStackParamList` and per-stack param lists for all navigators. Use `NativeStackNavigationProp` typed hooks instead of `any`.

---

## 3. Screen Inventory & Specifications

### Phase A: Auth & Onboarding (3 screens)

---

#### A1. `SignupScreen.tsx` — Phone OTP Authentication

| Aspect | Detail |
|--------|--------|
| **Purpose** | Collect phone number, send mock OTP, verify identity |
| **Layout** | Full-screen emerald (`bg-primary`) background, top branding block, bottom input + CTA |
| **State** | `phoneNumber`, `otpSent`, `countryCode`, `showPicker` |
| **Components** | Country code picker (Modal), phone TextInput, OTP TextInput (tracking-spaced), CTA button |
| **Interactions** | Tap "Send Code" → show OTP field. Tap "Verify Identity" → navigate to `ProfileSetup`. Country code modal slides up. |
| **Keyboard** | `KeyboardAvoidingView` with `behavior="padding"` on iOS, `keyboardVerticalOffset: 20` |
| **Safe Area** | Uses `useSafeAreaInsets()` for top/bottom padding |
| **Design** | "Bismillah" italic subtitle, "Lab Viah." serif 5xl heading, gold secondary CTA button |

---

#### A2. `ProfileSetupScreen.tsx` — Basic User Details

| Aspect | Detail |
|--------|--------|
| **Purpose** | Collect name, age, height, city, profession, education |
| **Layout** | ScrollView with section headers, input fields |
| **Step indicator** | "Step 1 of 2" in gold |
| **Fields** | Full Name, Age, Height, City, Profession, Education |
| **CTA** | "Begin AI Setup ➔" → navigates to `TwinOnboarding` |

> **Note:** `BasicProfileSetup.tsx` has 7 exhaustive sections (personal, education, occupation, religion, property, family, address). Use it as the "Edit Profile" from Settings for returning users. For onboarding, use the simpler `ProfileSetupScreen` for demo speed.

---

#### A3. `TwinOnboardingScreen.tsx` — 3-Phase AI Twin Creation

| Aspect | Detail |
|--------|--------|
| **Purpose** | The core differentiator. Trains the user's AI Twin via 3 layers. |
| **Phase 1 — Voice/Chat** | Prompt: "Introduce yourself naturally." Mic button + waiting indicator. |
| **Phase 2 — Scenario Cards** | Ethical dilemma: "Career vs. Family" with two choice buttons. |
| **Phase 3 — Twin Summary** | Displays generated Twin personality text with CONFIRM / EDIT actions. |
| **AG-TRACE strip** | Top bar showing Antigravity trace messages per phase |
| **Progress** | 3-dot progress bar with gold fill |
| **State** | `step` (1–3). Continue button advances; phase 3 CTA → `Main` |
| **Wali Mode** | Merge the toggle from `OnboardingUI.tsx` into this screen |

---

### Phase B: Discovery & Matching (4 screens)

---

#### B1. `MatchPoolScreen.tsx` — Candidate List

| Aspect | Detail |
|--------|--------|
| **Purpose** | Display AI-curated match candidates |
| **Data source** | `useAppStore().matches` |
| **Card design** | Rounded-32 white card, blurred avatar (blurRadius=10), name, compatibility %, tag pills |
| **Interaction** | Tap card → navigate to `TwinDebate` |
| **Header** | "Discovery" gold label + "Match Pool" serif heading + "2 ACTIVE" badge |

---

#### B2. `TwinDebateScreen.tsx` — Live AI Negotiation (HERO SCREEN)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Show real-time Twin-to-Twin debate |
| **Layout** | Dark mode (`bg-[#020617]`), split-chat UI |
| **Live score** | Animated compatibility % that increments (0→94) via `setInterval` |
| **Chat bubbles** | User twin: emerald bg, right-aligned. Candidate: slate bg, left-aligned. Moderator: gold-bordered centered. |
| **AG-TRACE** | "MODERATOR: INITIATING DEEP VALUE NEGOTIATION..." |
| **CTA** | "Analyze Full Report" → `CompatibilityReport` |
| **Data** | `useAppStore().debateLog` — array of `{ speaker, text }` |

---

#### B3. `CompatibilityReportScreen.tsx` — 8-Dimension Analysis

| Aspect | Detail |
|--------|--------|
| **Purpose** | Present the Moderator Agent's verdict |
| **Overall score** | Large "94% Match" badge in emerald pill |
| **Dimensions** | 8 horizontal progress bars: Deen, Family, Career, Finances, Kids, Conflict, Geography, Boundaries |
| **Friction point** | Dark card with italic serif quote explaining the main concern |
| **CTA** | "Initiate Mutual Reveal" gold button → navigates to `Booking` |

---

#### B4. `PaywallScreen.tsx` — Subscription Tiers

| Aspect | Detail |
|--------|--------|
| **Purpose** | Display pricing tiers (no real payment processing) |
| **Layout** | Dark mode, centered "Lab Viah" gold logo, Premium tier card |
| **Price** | ₨ 2,500/mo with feature list (checkmarks) |
| **Badge** | "Most Popular" gold corner badge |
| **Footer** | "A success fee of ₨ 50,000 applies upon successful Nikah." |

---

### Phase C: Meetings & Post-Meeting (4 screens)

---

#### C1. `BookingScreen.tsx` — Schedule First Meeting

| Aspect | Detail |
|--------|--------|
| **Purpose** | Wali-approved meeting slot selection |
| **Wali status** | Dark card confirming both Walis notified and approved |
| **Slots** | 2 mock time slots (Virtual / In-person), selectable with highlight |
| **CTA** | "Confirm Booking" (disabled until slot selected) → `VideoMeeting` |

---

#### C2. `VideoMeetingScreen.tsx` — Video Call Interface

| Aspect | Detail |
|--------|--------|
| **Purpose** | Simulated chaperoned video meeting |
| **Layout** | Full-screen black, main video area (match), floating PiP viewports (user + Wali stream) |
| **Timer** | Red "LIVE" badge with elapsed time |
| **E2E badge** | "E2E Encrypted" mono label |
| **Controls** | Bottom bar: mic, end-call (red → FeedbackSurvey), camera |

---

#### C3. `FeedbackSurveyScreen.tsx` — Post-Meeting Assessment

| Aspect | Detail |
|--------|--------|
| **Purpose** | Rate the meeting to calibrate the user's AI Twin |
| **Ratings** | 3 star-rating rows: Overall Chemistry, Values Alignment, Twin Accuracy |
| **Notes** | Multi-line TextInput for private notes |
| **CTAs** | "Submit Calibration" → `Main`. "Report an Issue" → `DisputeForm` |

---

#### C4. `DisputeFormScreen.tsx` — Safety & Trust

| Aspect | Detail |
|--------|--------|
| **Purpose** | File a dispute after a bad meeting |
| **Categories** | Selectable pills: No-show, Misrepresentation, Inappropriate Behavior, Ghosting, Other |
| **Warning** | Red alert: false disputes = ban |
| **CTA** | "Submit & Block User" → `BlockModal` |

---

### Phase D: Wali & Profile (4 screens)

---

#### D1. `WaliDashboardScreen.tsx` — Guardian Mode

| Aspect | Detail |
|--------|--------|
| **Pending approval** | Card with gold left-border: match name, compatibility, APPROVE / REVIEW BRIEF buttons |
| **Agentic briefing** | Dark card with Wali Agent's generated rishta brief |

---

#### D2. `SettingsScreen.tsx` — Account Management

| Aspect | Detail |
|--------|--------|
| **Profile card** | Dark card with avatar, name, "Tap to edit details" → `ProfileSetup` |
| **Toggles** | Push Notifications, Wali Mode, Premium Status |
| **Links** | Help Desk, Privacy Policy, Terms, Sign Out, Delete Account |

---

#### D3. `HelpDeskScreen.tsx` — FAQ & Support

| Aspect | Detail |
|--------|--------|
| **CTA** | "Chat with Human Agent" button |
| **FAQ** | 3 items: AI Twin, Wali Mode, Blocking behavior |

---

#### D4. `BlockModalScreen.tsx` — Block Confirmation

| Aspect | Detail |
|--------|--------|
| **Layout** | Dark overlay, centered white card with 🛑 icon |
| **CTAs** | "Return to Match Pool" → `DiscoverTab`. "Contact Support" → `HelpDesk` |

---

### Unused Screens — Cleanup Needed

| File | Status | Action |
|------|--------|--------|
| `LoginScreen.tsx` | Duplicate of SignupScreen | **Remove** — SignupScreen is canonical |
| `OnboardingUI.tsx` | Alternate onboarding with Wali Mode toggle | **Merge** Wali toggle into TwinOnboardingScreen, then remove |
| `BasicProfileSetup.tsx` | Exhaustive 7-section form | **Keep** as Edit Profile from Settings |

---

## 4. Design System & Tokens

### Color Palette (from `tailwind.config.js`)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#064e3b` | Deep Emerald — primary actions, headers |
| `primary-light` | `#059669` | Emerald tint — secondary text, active states |
| `primary-dark` | `#022c22` | Near-black emerald — dark mode backgrounds |
| `secondary` | `#d4af37` | Metallic Gold — accent, badges, CTAs |
| `secondary-light` | `#fef08a` | Light gold — highlights |
| `background` | `#fdfbf7` | Warm alabaster — main content bg |
| `surface` | `#ffffff` | Cards, inputs |
| `danger` | `#9f1239` | Deep rose — errors, disputes, destructive |

### Typography

- **Headings:** `font-serif` (Georgia) — all major titles
- **Body:** System default sans-serif
- **Mono:** System mono — traces, scores, technical labels
- **Label pattern:** `text-[10px] font-bold uppercase tracking-widest`

### Reusable Component Patterns

**AG-TRACE Strip** — extract as `src/components/AgTrace.tsx`:
```tsx
export const AgTrace = ({ msg }: { msg: string }) => (
  <View className="bg-slate-900 border-b border-primary/20 px-4 py-1.5">
    <Text className="text-primary-light font-mono text-[9px] uppercase tracking-widest">
      AG-TRACE // {msg}
    </Text>
  </View>
);
```

**Section Card:**
```tsx
<View className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-6">
```

**Primary CTA (Gold):**
```tsx
<TouchableOpacity className="bg-secondary py-5 rounded-2xl items-center shadow-lg shadow-secondary/30">
  <Text className="text-primary-dark font-bold text-sm tracking-widest uppercase">Label</Text>
</TouchableOpacity>
```

**Safe Area Wrapper (every screen):**
```tsx
const insets = useSafeAreaInsets();
<View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-background">
```

---

## 5. State Management (Zustand)

### Current Store: `src/store/useAppStore.ts`

Existing state:
- `user` — `{ name, isWaliMode }` or null
- `matches` — array of match objects (2 hardcoded)
- `isPremium` — boolean
- `debateLog` — array of debate messages (3 hardcoded)
- `toggleWaliMode()`, `setPremium()`

### State Slices to Add

```typescript
interface AppState {
  // === EXISTING ===
  user: { name: string; isWaliMode: boolean } | null;
  matches: Match[];
  isPremium: boolean;
  debateLog: DebateMessage[];

  // === ADD THESE ===
  isAuthenticated: boolean;
  profileData: ProfileData | null;      // Full profile form data
  twinSpec: TwinSpec | null;            // Generated AI Twin JSON
  selectedMatchId: string | null;       // Currently viewed match
  bookingSlot: BookingSlot | null;      // Selected meeting slot
  disputeData: DisputeData | null;      // Dispute form state
  feedbackRatings: FeedbackRatings | null;

  // === ADD THESE ACTIONS ===
  setUser: (user: AppState['user']) => void;
  setAuthenticated: (val: boolean) => void;
  setProfileData: (data: ProfileData) => void;
  setTwinSpec: (spec: TwinSpec) => void;
  selectMatch: (id: string) => void;
  setBookingSlot: (slot: BookingSlot) => void;
}
```

---

## 6. API & Data Layer

### Provider: `src/api/QueryProvider.tsx`
Already configured — React Query with 5-min stale time, 2 retries.

### API Hooks to Create (in `src/api/hooks/`)

| Hook | Method | Purpose |
|------|--------|---------|
| `useVerifyOTP` | `POST /auth/verify` | Mock OTP verification |
| `useSaveProfile` | `POST /profile` | Persist profile to Supabase |
| `useTwinForge` | `POST /twin/forge` | Send onboarding data → receive Twin JSON |
| `useMatchPool` | `GET /matches` | Fetch AI-curated candidates |
| `useDebate` | `POST /debate/start` | Initiate Twin debate (SSE stream) |
| `useCompatReport` | `GET /report/:id` | Fetch compatibility report |
| `useBookSlot` | `POST /booking` | Confirm meeting slot |
| `useSubmitFeedback` | `POST /feedback` | Post-meeting calibration |
| `useFileDispute` | `POST /dispute` | Submit to Dispute Agent |

### For MVP Demo

All hooks return **mock data** via `queryFn` with hardcoded JSON. The debate screen uses `setInterval` to simulate streaming text.

---

## 7. Antigravity Trace Requirements

> **20% of the hackathon score** depends on visible Antigravity workflow traces.

### Where to Show Traces

| Screen | Trace Message |
|--------|---------------|
| TwinOnboarding Phase 1 | `INITIALIZING VOCAL EXTRACTION...` |
| TwinOnboarding Phase 2 | `CALIBRATING MORAL DIMENSIONS...` |
| TwinOnboarding Phase 3 | `FINALIZING TWIN WEIGHTS` |
| TwinDebate | `MODERATOR: INITIATING DEEP VALUE NEGOTIATION...` |
| CompatibilityReport | `MODERATOR: VERDICT RENDERED — 94% COMPATIBLE` |
| Booking | `BOOKING AGENT: PROPOSING SLOTS VIA MAPS API` |
| WaliDashboard | `WALI AGENT: GENERATING RISHTA BRIEF [URDU/EN]` |
| FeedbackSurvey | `TWIN FORGE: RECALIBRATING TWIN v1.1 FROM FEEDBACK` |

---

## 8. Phased Build Plan

### Phase 1: Foundation (Day 1)
- [ ] Clean up navigation — remove `LoginScreen.tsx`, merge `OnboardingUI.tsx` Wali toggle into `TwinOnboardingScreen`
- [ ] Add `BasicProfileSetup` as edit-profile route from Settings
- [ ] Create shared components: `AgTrace`, `SafeScreen`, `Section`, `InputField`, `Selector`
- [ ] Type-safe navigation: define all param lists, remove all `any` types
- [ ] Verify NativeWind + Tailwind config on iOS/Android

### Phase 2: Auth Flow (Day 1–2)
- [ ] Polish SignupScreen — keyboard handling, country picker animation
- [ ] Polish ProfileSetupScreen — form validation, error states
- [ ] Wire Zustand: persist user data on profile submit
- [ ] Test full flow: Signup → ProfileSetup → TwinOnboarding → Main

### Phase 3: Twin Onboarding (Day 2)
- [ ] Implement voice recording UI (mock waveform animation)
- [ ] Add 3–5 scenario cards with swipe/tap interactions
- [ ] Generate Twin summary text (mock Gemini response)
- [ ] Add Wali Mode toggle into TwinOnboardingScreen
- [ ] Persist Twin spec to Zustand

### Phase 4: Match Pool & Debate (Day 2–3)
- [ ] Populate MatchPoolScreen with 5+ mock candidates
- [ ] Implement streaming debate UI with typing indicators and timed message reveal
- [ ] Add debate round indicators (current dimension being debated)
- [ ] Build compatibility report with animated progress bars
- [ ] Wire Paywall gate: redirect if `!isPremium` and 3+ matches viewed

### Phase 5: Meetings & Post-Meeting (Day 3)
- [ ] Polish BookingScreen with venue suggestions (mock Maps data)
- [ ] Build VideoMeetingScreen with timer, PiP, controls
- [ ] Implement FeedbackSurvey with interactive star ratings
- [ ] Wire DisputeForm → BlockModal flow
- [ ] Add baseline comparison UI (hackathon requirement)

### Phase 6: Wali & Settings (Day 3–4)
- [ ] Expand WaliDashboard with multiple pending approvals
- [ ] Add Wali Agent rishta brief generation (mock)
- [ ] Polish Settings with working toggles
- [ ] Wire HelpDesk FAQ with expandable items

### Phase 7: Polish & Demo Prep (Day 4)
- [ ] Add micro-animations: screen transitions, card reveals, score counting
- [ ] Add empty states for all lists
- [ ] Add loading skeletons
- [ ] Test on iOS and Android
- [ ] Record 4-min demo video
- [ ] Export Antigravity traces for walkthrough video

---

## 9. Critical Rules & Constraints

### Non-Negotiables
1. **Never use the word "dating"** — always "halal matchmaking" or "rishta"
2. **AG-TRACE strips must be visible** on all agentic screens (20% score weight)
3. **Baseline comparison** must be shown somewhere in the demo
4. **Framing** — rishta economy, family-oriented, Islamic values
5. **Onboarding ≤ 8 minutes** total user time

### What NOT to Build
- ❌ Real SMS/email sending (mock templates only)
- ❌ Real payment processing (display tiers only)
- ❌ Human-to-human chat
- ❌ Separate Wali login/dashboard
- ❌ External data pipelines

### Platform Gotchas
- **iOS Keyboard:** Always use `KeyboardAvoidingView` with `behavior="padding"`
- **Safe Areas:** Every screen must use `useSafeAreaInsets()` — never hardcode
- **NativeWind:** Gradients and colored shadows don't work in RN — use `style` prop fallbacks
- **Navigation v7:** Add tab bar icons via `@react-navigation/elements` or custom render

### Target File Organization

```
src/
├── api/
│   ├── QueryProvider.tsx
│   └── hooks/           # React Query hooks per agent endpoint
├── components/
│   ├── AgTrace.tsx       # Antigravity trace strip
│   ├── SafeScreen.tsx    # Safe area wrapper
│   ├── Section.tsx       # Card section
│   ├── InputField.tsx    # Styled text input
│   ├── Selector.tsx      # Pill selector
│   └── StarRating.tsx    # Interactive star rating
├── navigation/
│   ├── AppNavigator.tsx
│   └── types.ts          # Navigation param lists
├── screens/              # All 16 screens (see inventory above)
├── store/
│   └── useAppStore.ts
└── utils/
    ├── mockData.ts       # All mock candidates, debate logs, etc.
    └── constants.ts      # Country codes, scenario cards, FAQ data
```
