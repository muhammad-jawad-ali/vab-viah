# RishtaAI — Demo Walkthrough Script

> **Goal:** reproduce a "judge-friendly" end-to-end demo against the real
> backend on Railway. Following this script produces a HIGH compatibility
> result against a seeded candidate (Ayesha Khan), exercises the live SSE
> trace, books a meeting, and forges Twin v2 via post-meeting feedback.

**Backend:** https://lab-viah-production.up.railway.app (auto-deploys from
`backend/main`).
**Frontend:** `npx expo start --lan --clear` from `frontend/vab-viah/`.
**Dev OTP bypass:** `+923001234567` / `0000` (works on Railway).
**Today's date:** 2026-05-19. **Submission:** 2026-05-20.

---

## F1 — Target candidate

We are crafting a **male** user Twin that should produce a STRONG-MATCH
verdict against the female candidate **Ayesha Khan**.

| Field | Value |
|---|---|
| `id` | `11111111-1111-4111-8111-111111111111` |
| `identity.name` | Ayesha Khan |
| `identity.age` | 26 |
| `identity.gender` | female |
| `identity.city` | Karachi |
| `deen_level` | practicing |
| `family_setup` | joint |
| `family_loyalty_score` | 0.85 |
| `kids_timeline` | asap |
| `conflict_style` | direct |
| `geography.current_city` | Karachi |
| `geography.ten_yr_pref` | Karachi |
| `geography.flexible` | false |
| `dealbreakers` | must be practicing · no smoking · **no prior public relationship** |
| top dimension weights | deen 0.22, family 0.18, kids 0.16, dealbreakers 0.14 |

**Why this candidate is the right demo target.** Her three dealbreakers
are all easy for a non-smoking, never-publicly-dated, practicing user to
miss-on. Her structured fields (Karachi, joint family, asap kids,
practicing) are all things a complementary male profile can mirror. Result
should be `recommendation: 'strong_match'` with `overall_score ≥ 0.80`.

---

## F2 — User onboarding answers

### Identity (Layer 1)

The demo user we're voicing is:

- Phone: **+923001234567**
- OTP: **0000** (dev bypass)
- Name: **Ahmad Siddiqui**
- Age: **28**
- Gender: **male**
- City: **Karachi** (matches Ayesha's current + 10yr — bumps `geography` to 1.0)

### Layer 1 chat answers (ordered)

The Layer-1 agent (Layla) walks several topics: identity → deen → family
→ career → kids → conflict → geography → dealbreakers. Each user message
should be 1–3 sentences. **Auto-advances to Layer 2 when Layla emits
`next_topic: 'done'`.**

If a turn surfaces low-confidence **chip-fallback chips**, tap the chip
that best matches the answer below — don't free-text it.

> **Turn 1 (identity):** "My name is Ahmad Siddiqui. I'm 28, born and
> raised in Karachi. I work as a senior software engineer at a fintech
> here."
>
> **Turn 2 (deen):** "I'm practicing — I pray five times most days, fast
> Ramadan completely, and don't drink. Not strict in the sense of
> demanding hijab from day one, but deen is the foundation of how I want
> our home to run."
>
> **Turn 3 (family):** "I come from a joint family — my parents and my
> younger brother all live in the same house. After marriage I expect
> us to live in the same household, and my future spouse needs to be
> comfortable with that. I'm very close to my mother."
>
> **Turn 4 (career):** "Software engineering. I lead a team of six. I
> care about my career but I'm not climbing for its own sake — I want
> stability and time at home. I'd support a partner who works too,
> especially before kids arrive."
>
> **Turn 5 (kids):** "I want kids early — ideally within the first year
> of marriage. I'm 28 and my parents have been waiting on grandchildren
> for a while."
>
> **Turn 6 (conflict):** "I prefer to talk things out the same night.
> I don't like letting things simmer. Direct, kind, no third parties
> involved unless it gets bigger than us."
>
> **Turn 7 (geography):** "Karachi is home. My mother is here, my
> father's business is here, my career is here. I'm not open to
> relocating abroad — maybe a short stint in Dubai for work, but home
> base stays Karachi."
>
> **Turn 8 (dealbreakers / past relationships):** "She must be
> practicing — same as me, not strict but consistent. No smoking. And
> no prior public relationship history — I've never been in one and I
> want the same starting point. Beyond that I'm flexible."
>
> *(Continue answering turns until Layla emits `next_topic: 'done'`.
> If she asks follow-ups about lifestyle or in-laws, lean joint-family
> + Karachi-rooted + comfortable lifestyle.)*

### Layer 2 scenario card picks (12 cards)

The Layer-2 screen walks 12 cards sequentially. For each, pick the
option below — they're chosen to push the personality vector toward
Ayesha's profile.

| # | Card ID | Pick | Option label | Why |
|---|---|---|---|---|
| 1 | `card_salah` | **a** | "Salah comes first — meetings can be rescheduled" | +deen 0.9 → matches Ayesha's `practicing` |
| 2 | `card_inlaws` | **a** | "Joint family home — that is the norm" | +family 0.9 → matches Ayesha's `joint` |
| 3 | `card_spouse_working` | **b** | "Part-time / flexible until kids start school" | +career 0.4 / +family 0.2 → matches Ayesha's 0.7 ambition (still working) |
| 4 | `card_lifestyle` | **b** | "Comfortable — own a home, annual umrah, kids in good school" | +finances 0.2 → matches Ayesha's `comfortable` |
| 5 | `card_kids_timing` | **a** | "Within the first year" | +kids 0.9 → matches Ayesha's `asap` |
| 6 | `card_conflict` | **a** | "Talk it out same night" | +conflict 0.7 → matches Ayesha's `direct` |
| 7 | `card_geography` | **a** | "Same city — roots matter" | +geography 0.8 → matches Ayesha's Karachi-rooted, non-flexible |
| 8 | `card_appearance` | **b** | "Practicing but flexible — let it grow" | +deen 0.3 → matches Ayesha's practicing-but-not-strict |
| 9 | `card_parents_care` | **a** | "They move in with us" | +family 0.8 → matches Ayesha's loyalty score 0.85 |
| 10 | `card_ambition` | **b** | "Stable career, predictable life" | +career 0.2 → matches Ayesha's 0.7 ambition |
| 11 | `card_finances_split` | **b** | "Husband handles primary, wife has discretion" | +family 0.3 → traditional fit for Ayesha's profile |
| 12 | `card_past` | **c** | "Prefer no prior relationships" | +dealbreakers 0.5 → critical: matches Ayesha's `no prior public relationship` |

> Card 12 option **c** is the demo-critical pick. Picking **a** or **b**
> here would soften the "no prior" stance and dilute alignment with
> Ayesha's hidden-dealbreaker pattern. **c** keeps the user's
> `dealbreakers` vector positive and ensures the Twin debate scores
> dealbreakers high.

### Layer 3 — Twin statement confirmations

Layer 3 generates 3 statements summarizing the user's Twin voice. **For
the demo, confirm all 3 with "Yes — sounds right"** (no corrections).
This keeps the Twin's voice canonical and avoids re-prompting Gemini
Pro.

> If you want to verify Gemini is authoring (not the deterministic
> fallback), the statements should reference specific identity/values
> from Layer 1 — e.g. they should mention Karachi, joint family, kids
> early. If they're bland and dimension-shaped, that's the fallback —
> check Railway logs for `twin_forge: statements failed schema`.

### Layer 4 — Wali (skip)

Tap **"Skip — I'll add later"** at the bottom of the Wali screen. This
exercises the wali-decoupled flow per non-negotiable #6 (users are
never blocked by the wali).

---

## F3 — Booking wali info (per /book/initiate)

When the user taps "Initiate Halal Reveal" on Ayesha's compatibility
report → BookingScreen wali form. Enter exactly:

| Field | Value |
|---|---|
| Your wali — name | Asad Khan |
| Your wali — relation | father |
| Your wali — phone | +923001112222 |
| Candidate's wali — name | Tariq Aslam |
| Candidate's wali — phone | +923004445555 |
| Meeting area (optional) | DHA Phase 6 |

Tap **"Build my booking →"**. The /book/initiate call returns
`{flowId, meetingId, streamUrl}` and the screen transitions to the
initiating-state skeleton with a live workplan phase indicator.

---

## F4 — Manual end-to-end walkthrough (19 steps)

### Pre-demo reset (READ BEFORE STARTING)

The dev user `+923001234567` already has a Twin in Supabase from
Sessions 2-4 testing (verified 2026-05-19 against Railway: `twinId =
49d5d6a3-cac1-422b-8633-fa0a7e53de49`, version=2). On signup, the app
probes `/twin/me` and routes the user directly to Main, **skipping the
onboarding flow entirely** (F1-F4 steps 2-6).

To exercise onboarding in the demo, choose ONE:

- **Option A (recommended for demo) — show onboarding by Supabase reset.**
  Before the demo, run this in Supabase SQL editor:
  ```sql
  DELETE FROM twins WHERE user_id = '02f7e612-798c-4b9e-88c7-45919cb4bc4e';
  ```
  Then on next signup the app routes to Layer 1.
- **Option B — skip onboarding in the live demo.** Use the existing
  Twin v2 and demo the match flow → debate → report → book →
  feedback → dispute end of pipeline. Mention onboarding via a recorded
  clip or screenshots, not live. This avoids 5+ minutes of typing on
  stage.
- **Option C — set up a second dev bypass phone.** Backend only
  supports ONE `DEV_OTP_PHONE` env var, so this requires a Railway env
  change + redeploy. Not recommended same-day.

### Run the walkthrough

Run this checklist on a real device after `npx expo start --lan` from
`frontend/vab-viah/`. Backend should be on Railway (frontend `.env`
already points there). For a brand-new user, the OTP bypass
(`+923001234567` / `0000`) returns a real Supabase JWT.

- [ ] **1. Cold start app.** Lands on Signup. Send code, enter 0000.
      Verify: if no Twin → lands in OnboardingLayer1; if Twin exists →
      lands in MainTabs.
- [ ] **2. Layer 1 chat.** Walk the 8 turns above. Verify: chip-fallback
      chips render on any turn where Layla's `confidence < 0.7`
      (typically rare). Auto-advances when `turn.next_topic === 'done'`.
- [ ] **3. Layer 2 cards.** Walk all 12 cards per the table above.
      Verify: signed radar at the top updates after each pick (positive
      bars = alignment, negative = friction). Auto-advances when
      `cardsRemaining === 0`.
- [ ] **4. Layer 3 statements.** Three statements render. Confirm all
      three. Verify: statements reference identity/values (Karachi,
      joint family, kids early) — NOT generic dimension prose. If you
      see the latter, check backend logs for
      `twin_forge: statements failed schema` warning (deterministic
      fallback engaged).
- [ ] **5. Layer 4 wali → skip.** Tap "Skip — I'll add later" → routes
      to Finalize.
- [ ] **6. Finalize → "Forge My Twin".** Verify: a `twins` row lands in
      Supabase with `version=1`, `user_id` = the demo user's UUID, and
      `system_prompt` reads in the user's voice.
- [ ] **7. MainTabs → Discover → MatchPool.** POST `/match/request`
      fires once. Loading state shows the skeleton deck + live
      "Running Twin debates" phase counter + decision/dim tickers.
      Workplan completes in ~30–45s.
- [ ] **8. Swipe deck renders.** Verify: top card should be Ayesha Khan
      (or close — high-score female practicing Karachi candidate).
      **Swipe RIGHT on the first card.** TwinDebate opens live.
- [ ] **9. TwinDebate live.** Phase rail advances Reading → Debating →
      Verdict. 8-cell dim scoreboard fills with per-dim scores (each
      cell fades + slides in). Decision bubbles typewrite. Recovery
      chips appear as a horizontal scroll row if any retry happened.
      Verdict CTA fades in on workplan finish.
- [ ] **10. CompatibilityReport with radar.** Tap "View Compatibility
      Report →". Verify: NEW radar chart renders at top showing the 8
      dimensions with score dots. Then per-dim bars + evidence quotes.
      Overall score should be **≥ 75%** (target: ≥ 80% for
      strong_match recommendation).
- [ ] **11. Replay-unavailable variant.** Back to MatchPool. **Swipe
      RIGHT on the SECOND card.** TwinDebate should render the
      "Debate complete — live replay unavailable" banner + 8-cell
      scoreboard from cached `dimension_scores` (Session 4 bug A2).
      Verdict CTA visible immediately, no hang.
- [ ] **12. BookingScreen wali form.** Back to Ayesha's report. Tap
      "Initiate Halal Reveal". Wali form renders. Enter the 6 fields
      per F3 above. Tap "Build my booking →".
- [ ] **13. Initiating phase.** Live label cycles through `load_context`
      → `wali_brief` → `propose_slots` → `persist_proposal`. Slot-list
      skeleton + brief-panel skeleton visible (Session 5 polish).
      Completes in ~6–10s.
- [ ] **14. Slot picker + wali brief.** Three (slot, venue) cards
      render. Wali brief panel below is collapsed. **Expand panel.**
      Switch language tabs (English ↔ Roman Urdu / Urdu — depends on
      candidate's `language_pref`). Tap "Play wali brief" → audio
      plays via expo-av (data URI). Tap "Share" on the SMS preview →
      native share sheet opens.
- [ ] **15. Pick a slot → Confirm Booking.** Light haptic fires on
      slot tap. Confirm CTA becomes primary. Tap Confirm → /book/confirm
      → Receipt view renders with locked slot/venue/address + reminder
      schedule + 2× confirmation SMS bodies. Tap "View Meetings Log →"
      → MeetingsTab shows the meeting under **Scheduled**.
- [ ] **16. Feedback → Twin v2.** On the scheduled meeting tap "Rate
      after meeting" → FeedbackSurvey. Tap 5 stars on each of the 4
      ratings (haptic fires on each tap). Submit → "Twin v2 forged"
      panel renders with `previousTwinId` / `newTwinId` / weights diff.
      Verify: backend `twins` table now has a `version=2` row for this
      user.
- [ ] **17. Meeting moves to Concluded.** Back to Meetings Log. The
      meeting moved from Scheduled → Concluded section.
- [ ] **18. Run New Match.** Discover → MatchPool. Once deck is empty
      (or via the empty-state CTA after swiping all 10 left), tap
      "Run New Match". Verify: workplan re-fires (not stuck on the
      stale `finished` state — Session 4 bug A3).
- [ ] **19. Dispute flow.** From a CompatibilityReport tap "Report
      Issue" → DisputeForm. Pick a category, type ≥10 chars, submit.
      Verify: DisputeResolution renders with severity 1..5 + action
      label + agent rationale + per-party reputation deltas. Backend
      logs should NOT show `moderator: final synthesis failed`.

---

## Known issues during demo run

> Populate this section after running F4 end-to-end on a real device.
> Any deviation gets a one-line note here so we can decide what to
> patch before submission vs. accept as a known limitation.

### Static verification (Session 5, 2026-05-19)

The full F4 device walkthrough is the user's job (Claude can't run an
Expo device test). The following was validated statically during
Session 5:

- ✅ `npm run typecheck` clean on `integration/session-1-foundation`
  HEAD after every phase commit.
- ✅ Railway `/health` returns
  `{ok:true,data:{service:"rishtaai-backend",env:"production"}}`.
- ✅ Railway `/auth/otp/start` with `+923001234567` returns
  `{sent:true,dev:true}` (DEV_OTP_BYPASS active).
- ✅ Railway `/auth/otp/verify` with `+923001234567` / `0000` returns a
  real Supabase JWT (`user_id 02f7e612-798c-4b9e-88c7-45919cb4bc4e`).
- ✅ Railway `/twin/me` with that JWT returns a Twin v2 spec — so the
  forge + feedback paths have produced real rows in the past.
- ⚠️ **Dev user has a pre-existing Twin** — see "Pre-demo reset" above.
  Either run the SQL delete before the demo OR skip onboarding in the
  live demo.
- ⚠️ Onboarding Layer 3 statement quality + moderator final synthesis
  quality depend on Gemini Pro at runtime. Static validation can't
  prove these are Gemini-authored vs. deterministic fallback —
  watch Railway logs for `twin_forge: statements failed schema` or
  `moderator: final synthesis failed` warnings during step 4 and step
  9. Session 4's jsonRepair fallback should catch most truncation.

### Live device walkthrough — to be filled in

*(populate as you run F4 on a real device)*

---

## Quick recovery cheatsheet

| Symptom | Likely cause | Quick fix |
|---|---|---|
| Signup hangs on "Send Code" | Phone format / network | Confirm phone is E.164, check Railway `/health` |
| Onboarding lands on Layer 2 immediately | A prior session's `onboardingLastLayer` is cached | App settings → Logout to clear, then re-OTP |
| MatchPool "Connecting…" forever | SSE drop | Check Railway `/stream/...` log, verify JWT in SecureStore |
| TwinDebate stuck on phase rail | Workplan still running | Wait up to 60s; Gemini Pro is variable. Verify `task.started` events arrive |
| `top_strengths` is bland (dim labels) | Pro JSON truncation | Railway logs would show `final synthesis failed` — Session 4 jsonRepair should catch it |
| BookingScreen 422 | E.164 phone format off | Both wali phones must be `+\d{7,15}` |
| FeedbackSurvey "Twin v2 forged" no diff | Ratings reinforced existing weights | Ratings below 3 or above 4 should shift; mid-range can no-op |
| DisputeForm "narrative too short" | < 10 chars | Min 10, max 2000 |

---

## Submission-day checklist

- [ ] Phase A-E commits pushed (HEAD on
      `integration/session-1-foundation`).
- [ ] Railway HEAD matches `backend/main` HEAD `e33b73b`.
- [ ] DEMO_SCRIPT.md committed.
- [ ] SESSION_CONTEXT.md updated to mark Session 5 done.
- [ ] `npm run typecheck` clean.
- [ ] Final smoke test against Railway green end-to-end.
