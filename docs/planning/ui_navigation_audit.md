# Lab Viah — Complete UI Audit Plan
> Status: **Post-fix** | TypeScript: ✅ 0 errors | Date: 2026-05-18

---

## Bugs Fixed in This Audit Pass

| # | Screen | Bug | Fix Applied |
|---|---|---|---|
| 1 | `VideoMeetingScreen` | "End Call" crashed — missing required `meetingId` param to FeedbackSurvey | Pass `{ meetingId }` from `route.params` |
| 2 | `BlockModalScreen` | `navigate('DiscoverTab')` from ProfileStack → crash (wrong navigator) | `navigation.getParent()?.navigate('DiscoverTab')` |
| 3 | `FeedbackSurveyScreen` | Alert "Back to Matches" navigated to itself → infinite loop | Changed to `getParent()?.navigate('DiscoverTab')` |
| 4 | `CompatibilityReportScreen` | "Initiate Halal Reveal" crashed — cross-stack navigate from DiscoverStack | `getParent()?.navigate('MeetingsTab', { screen: 'Booking', params })` |
| 5 | `CompatibilityReportScreen` | "Report Issue" crashed — same cross-stack issue | `getParent()?.navigate('MeetingsTab', { screen: 'DisputeForm', params })` |
| 6 | `DisputeFormScreen` | Alert OK crashed — `navigate('BlockModal')` from MeetingStack | `getParent()?.navigate('ProfileTab', { screen: 'BlockModal', params })` |
| 7 | `HelpDeskScreen` | "Chat with Human Agent" had no `onPress` — silent tap | Added `Alert.alert()` with contact info |
| 8 | `VideoMeetingScreen` | Match name hardcoded "Ayesha K." — ignored route params | Now reads `matchName` from `route.params` |

---

## Screen 1: SignupScreen

| # | Element | Expected Result |
|---|---|---|
| 1.1 | Country code button | Opens picker sheet |
| 1.2 | Country in picker | Updates code, closes picker |
| 1.3 | Picker dismiss | Closes |
| 1.4 | Phone field | Numeric keyboard opens |
| 1.5 | "Send OTP" (valid number) | Switches to OTP input view |
| 1.6 | "Send OTP" (empty) | Validation error or disabled |
| 1.7 | OTP 6-digit entry | Fills left-to-right |
| 1.8 | "Verify OTP" | Navigates → `ProfileSetup` |
| 1.9 | Background tap | Keyboard dismisses |

---

## Screen 2: ProfileSetupScreen

| # | Element | Expected Result |
|---|---|---|
| 2.1 | Gender chips | Highlights selected |
| 2.2 | Marital status chips | Highlights selected |
| 2.3 | Text fields | Keyboard opens |
| 2.4 | "Continue" (filled) | Navigates → `TwinOnboarding` |
| 2.5 | "Continue" (empty) | Disabled or shows error |

---

## Screen 3: TwinOnboardingScreen

| # | Element | Step | Expected Result |
|---|---|---|---|
| 3.1 | Mic button | 1 | Visual feedback |
| 3.2 | Wali Mode toggle | 1 | Switch toggles + store updates |
| 3.3 | "Continue" | 1 | → Step 2 |
| 3.4 | Option A/B buttons | 2 | Highlights choice |
| 3.5 | "Next Scenario" | 2 (not last) | Next card |
| 3.6 | "Continue" | 2 (last scenario) | → Step 3 |
| 3.7 | "✓ CONFIRM" | 3 | Twin locked |
| 3.8 | "✎ EDIT" | 3 | ⚠️ No onPress — silent (known gap) |
| 3.9 | "Enter Match Pool" | 3 | Navigates → `Main` |
| 3.10 | AG-Trace strip | all | Correct message per step |

---

## Screen 4: MatchPoolScreen

| # | Element | Expected Result |
|---|---|---|
| 4.1 | Ahmed M. card | → `TwinDebate` `{ matchId:'match_001', matchName:'Ahmed M.' }` |
| 4.2 | Bilal R. card | → `TwinDebate` `{ matchId:'match_002' }` |
| 4.3 | Omar S. card | → `TwinDebate` `{ matchId:'match_003' }` |
| 4.4 | 4th tap (non-premium) | → `Paywall` |
| 4.5 | Card press-in | Scale-down spring animation |
| 4.6 | Card release | Scale springs back |
| 4.7 | Baseline banner | Visible at bottom when scrolled |

---

## Screen 5: TwinDebateScreen

| # | Element | Expected Result |
|---|---|---|
| 5.1 | Screen load | Messages stream one-by-one with typing indicator |
| 5.2 | Typing indicator | 3-dot animation before each message |
| 5.3 | Moderator messages | Centered, emerald border |
| 5.4 | YourTwin messages | Right-aligned, emerald bg |
| 5.5 | CandidateTwin messages | Left-aligned, slate bg |
| 5.6 | Dimension strip | Active pill updates per dimension |
| 5.7 | Live score | Increments from 0 to final value |
| 5.8 | Auto-scroll | Follows latest message |
| 5.9 | Verdict banner (match_001) | Amber — "Conditional Match" |
| 5.10 | Verdict banner (match_002) | Green — "Strong Match" |
| 5.11 | Verdict banner (match_003) | Red — "Dealbreaker Found" |
| 5.12 | "View Full Report" CTA | → `CompatibilityReport` with params |

---

## Screen 6: CompatibilityReportScreen

| # | Element | Expected Result |
|---|---|---|
| 6.1 | Score circle | Animated count to overall score |
| 6.2 | 8 dimension bars | Staggered animation from 0% |
| 6.3 | Bar colours | Green ≥80 / Amber 60-79 / Red <60 |
| 6.4 | Top Strengths | 3 items with ✓ |
| 6.5 | Friction point card | Amber card italic text |
| 6.6 | Rec badge colour | Matches recommendation |
| 6.7 | "Initiate Halal Reveal" (strong/conditional) | → `MeetingsTab/Booking` with params |
| 6.8 | "Initiate Halal Reveal" (not_recommended) | Button does NOT appear |
| 6.9 | "Report Issue" | → `MeetingsTab/DisputeForm` with params |

---

## Screen 7: PaywallScreen

| # | Element | Expected Result |
|---|---|---|
| 7.1 | "Subscribe Now" | → `Main` (mock success) |
| 7.2 | Pricing text | ₨ 2,500/mo + ₨ 50,000 success fee visible |

> ⚠️ Gap: No back button — user trapped. Add "Maybe Later" for polish.

---

## Screen 8: BookingScreen

| # | Element | Expected Result |
|---|---|---|
| 8.1 | Screen load | `matchName` in subtitle, wali status banner |
| 8.2 | Slot card tap | Card highlights emerald |
| 8.3 | Different slot tap | Previous deselects |
| 8.4 | "Confirm Booking" (no slot) | Disabled — greyed |
| 8.5 | "Confirm Booking" (slot selected) | Alert with meeting + venue |
| 8.6 | Alert "View Meeting" | → `VideoMeeting { meetingId, meetingUrl, matchName }` |
| 8.7 | Mock SMS preview | Shows selected venue in template |

---

## Screen 9: VideoMeetingScreen

| # | Element | Expected Result |
|---|---|---|
| 9.1 | Screen load | `matchName` in video placeholder |
| 9.2 | Mic button | No crash (no onPress — ok for demo) |
| 9.3 | Camera button | No crash |
| 9.4 | End call (red button) | → `FeedbackSurvey { meetingId }` |
| 9.5 | PiP viewports | Both "You" and "Wali" visible |

---

## Screen 10: FeedbackSurveyScreen

| # | Element | Expected Result |
|---|---|---|
| 10.1 | Star tap (e.g. 4) | Stars 1-4 full opacity |
| 10.2 | Re-tap lower star | Rating changes |
| 10.3 | Notes field | Keyboard + typing works |
| 10.4 | "Submit" (no ratings) | Disabled |
| 10.5 | "Submit" (all rated) | Alert "Twin Recalibrated" |
| 10.6 | Alert "Back to Matches" | → `DiscoverTab` (cross-stack) |

---

## Screen 11: DisputeFormScreen

| # | Element | Expected Result |
|---|---|---|
| 11.1 | Category chips | Selects/deselects on tap |
| 11.2 | Details field | Text input works |
| 11.3 | "Submit" (invalid) | Disabled |
| 11.4 | "Submit" (valid) | Alert confirms dispute |
| 11.5 | Alert "OK" | → `ProfileTab/BlockModal` (cross-stack) |
| 11.6 | `matchName` in title | Correct candidate from params |

---

## Screen 12: BlockModalScreen

| # | Element | Expected Result |
|---|---|---|
| 12.1 | "Return to Match Pool" | → `DiscoverTab` (cross-stack via getParent) |
| 12.2 | "Contact Support" | → `HelpDesk` |
| 12.3 | Body text | ⚠️ Still hardcoded "Ayesha K." — known gap |

---

## Screen 13: WaliDashboardScreen

| # | Element | Expected Result |
|---|---|---|
| 13.1 | Screen load | 2 pending items from mockData |
| 13.2 | "Approve" | Alert + item moves to Resolved |
| 13.3 | "Decline" | Alert + item moves to Resolved |
| 13.4 | All resolved | Empty state 🌙 shows |
| 13.5 | Resolved list | ✅/❌ icons + status text |

---

## Screen 14: SettingsScreen

| # | Element | Expected Result |
|---|---|---|
| 14.1 | Edit Profile card | → `BasicProfileSetup` |
| 14.2 | Notifications toggle | Local state toggles |
| 14.3 | Wali Mode toggle | Store `toggleWaliMode()` called |
| 14.4 | Premium toggle | Store `setPremium()` called |
| 14.5 | 🔬 Baseline Mode toggle | Local state toggles |
| 14.6 | "Help Desk / FAQ" | → `HelpDesk` |
| 14.7 | "Privacy Policy" / "ToS" | No crash (disabled rows) |
| 14.8 | "Sign Out" | Alert with confirm/cancel |
| 14.9 | Alert "Sign Out" confirm | Clears store → `Signup` (stack reset) |
| 14.10 | Alert "Cancel" | Stays on Settings |

---

## Screen 15: BasicProfileSetupScreen

| # | Element | Expected Result |
|---|---|---|
| 15.1 | Back arrow "←" | `navigation.goBack()` |
| 15.2 | Selector chips | Highlights on tap |
| 15.3 | Text fields | Keyboard + input works |
| 15.4 | "Add Education" | New entry row appears |
| 15.5 | "Add Property" | New entry row appears |
| 15.6 | "Save Profile" | Saves + navigates back |

---

## Screen 16: HelpDeskScreen

| # | Element | Expected Result |
|---|---|---|
| 16.1 | "Chat with Human Agent" | Alert with contact info |
| 16.2 | FAQ items | Static text visible |

---

## Navigation Graph

```
Signup → ProfileSetup → TwinOnboarding → Main (Tabs)
                                            │
              ┌─────────────────────────────┤
              │                             │
         DiscoverTab                   MeetingsTab
         MatchPool                     Booking { matchId }
           └▶ TwinDebate { matchId }     └▶ VideoMeeting { meetingId }
                └▶ CompatibilityReport        └▶ FeedbackSurvey { meetingId }
                     ├▶[×] MeetingsTab/Booking      └▶[×] DiscoverTab
                     └▶[×] MeetingsTab/DisputeForm
                                        DisputeForm { matchId }
                                          └▶[×] ProfileTab/BlockModal
              │
         WaliTab                        ProfileTab
         WaliDashboard                  Settings
                                          ├▶ BasicProfileSetup
                                          ├▶ HelpDesk
                                          ├▶ BlockModal
                                          │    ├▶[×] DiscoverTab
                                          │    └▶ HelpDesk
                                          └▶[reset] Signup

[×] = cross-stack via navigation.getParent()
```

---

## Known Gaps (Not Bugs — Day 4/5 Work)

| # | Screen | Gap |
|---|---|---|
| G1 | TwinOnboarding | "✎ EDIT" has no onPress |
| G2 | Paywall | No back/skip button |
| G3 | BlockModal | Body text hardcoded "Ayesha K." |
| G4 | BasicProfileSetup | Doesn't pre-populate from store |
| G5 | ProfileSetup | No form validation |
| G6 | MatchPool | Paywall counter resets on re-render (useRef) |
| G7 | VideoMeeting | Mic/camera buttons silent |
| G8 | HelpDesk | FAQ not expandable |

---

## Pre-Demo Device Checklist

```
iOS + Android — run both:

Auth Flow:
  [ ] Signup OTP flow completes without crash
  [ ] Navigates ProfileSetup → TwinOnboarding → Main tabs

Core Demo Flow:
  [ ] MatchPool: 3 cards visible, press animation works
  [ ] Ahmed M. → Debate streams → Report animates → Initiate Reveal
  [ ] Booking: slot selection → Confirm → VideoMeeting loads
  [ ] End call → FeedbackSurvey → Stars → Submit → Back to Matches
  [ ] Wali tab: Approve + Decline both work

Safety Flow:
  [ ] CompatibilityReport "Report Issue" → DisputeForm → Submit → BlockModal
  [ ] BlockModal "Return to Matches" → DiscoverTab

Settings:
  [ ] Baseline Mode toggle visible and functional
  [ ] Sign Out → returns to Signup

Visual:
  [ ] No red-screen crashes
  [ ] All AG-Trace strips visible and pulsing
  [ ] All dimension bars animate
  [ ] All debate messages animate in
  [ ] Safe area: no content under status bar or home indicator
```

---

*Audit: 2026-05-18 | 16 screens | 8 bugs fixed | 0 TS errors*
