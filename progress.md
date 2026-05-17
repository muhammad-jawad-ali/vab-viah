# Lab Viah Project Progress

## Phase 1: Foundation (Day 1)
- [x] Clean up navigation — remove `LoginScreen.tsx`, merge `OnboardingUI.tsx` Wali toggle into `TwinOnboardingScreen`
- [x] Add `BasicProfileSetup` as edit-profile route from Settings
- [x] Create shared components: `AgTrace`, `SafeScreen`, `Section`, `InputField`, `Selector`
- [x] Type-safe navigation: define all param lists, remove all `any` types
- [x] Verify NativeWind + Tailwind config on iOS/Android

## Phase 2: Auth Flow (Day 1–2)
- [ ] Polish SignupScreen — keyboard handling, country picker animation
- [ ] Polish ProfileSetupScreen — form validation, error states
- [ ] Wire Zustand: persist user data on profile submit
- [ ] Test full flow: Signup → ProfileSetup → TwinOnboarding → Main

## Phase 3: Twin Onboarding (Day 2)
- [ ] Implement voice recording UI (mock waveform animation)
- [ ] Add 3–5 scenario cards with swipe/tap interactions
- [ ] Generate Twin summary text (mock Gemini response)
- [ ] Add Wali Mode toggle into TwinOnboardingScreen
- [ ] Persist Twin spec to Zustand

## Phase 4: Match Pool & Debate (Day 2–3)
- [ ] Populate MatchPoolScreen with 5+ mock candidates
- [ ] Implement streaming debate UI with typing indicators and timed message reveal
- [ ] Add debate round indicators (current dimension being debated)
- [ ] Build compatibility report with animated progress bars
- [ ] Wire Paywall gate: redirect if `!isPremium` and 3+ matches viewed

## Phase 5: Meetings & Post-Meeting (Day 3)
- [ ] Polish BookingScreen with venue suggestions (mock Maps data)
- [ ] Build VideoMeetingScreen with timer, PiP, controls
- [ ] Implement FeedbackSurvey with interactive star ratings
- [ ] Wire DisputeForm → BlockModal flow
- [ ] Add baseline comparison UI (hackathon requirement)

## Phase 6: Wali & Settings (Day 3–4)
- [ ] Expand WaliDashboard with multiple pending approvals
- [ ] Add Wali Agent rishta brief generation (mock)
- [ ] Polish Settings with working toggles
- [ ] Wire HelpDesk FAQ with expandable items

## Phase 7: Polish & Demo Prep (Day 4)
- [ ] Add micro-animations: screen transitions, card reveals, score counting
- [ ] Add empty states for all lists
- [ ] Add loading skeletons
- [ ] Test on iOS and Android
- [ ] Record 4-min demo video
- [ ] Export Antigravity traces for walkthrough video
