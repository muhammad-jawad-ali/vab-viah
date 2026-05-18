**PRODUCT REQUIREMENTS DOCUMENT**

**RishtaAI**

*Where Your AI Twin Finds Your Match*

**Google Antigravity Hackathon 2026**

AI Seekho — \#VibeKaregaPakistan

**Challenge 2: AI Service Orchestrator for Informal Economy**

Version 1.0  |  Internal Team Document

Build Window: 15 May – 20 May 2026 (5 days)

Team Size: 5  |  Prize Pool: PKR 2.5M

# **Table of Contents**

**1\.**  Executive Summary

**2\.**  Strategic Positioning & Risk Assessment

**3\.**  Challenge 2 Compliance Matrix

**4\.**  Product Vision & Core Concept

**5\.**  User Personas & Journey

**6\.**  System Architecture

**7\.**  The Agent Roster (Antigravity Orchestration)

**8\.**  Onboarding: The 3-Layer Hybrid \+ Wali Mode

**9\.**  Tech Stack & Tooling

**10\.**  Data Models & Schemas

**11\.**  Feature Specification (MVP Scope)

**12\.**  Demo Script & Hero Scenarios

**13\.**  5-Day Sprint Plan

**14\.**  Team Roles & Ownership

**15\.**  Evaluation Rubric Alignment

**16\.**  Risks, Mitigations & Cut Scope

**17\.**  Deliverables Checklist

# **1\. Executive Summary**

RishtaAI is an agentic AI matchmaking system targeting the largest informal service economy in Pakistan: rishta (matchmaking) services. Rather than swiping on profiles in the style of generic dating apps, each user trains a persistent AI Twin during an 8-minute multimodal onboarding. These Twins negotiate compatibility with candidate Twins across eight dimensions of married life, surfacing only the top three matches that survive a structured agentic debate.

This PRD treats RishtaAI as a regulated informal-economy service. Every Challenge 2 system requirement — multilingual parsing with confidence scoring, multi-factor matching, dynamic pricing, booking simulation, dispute handling, fallback workflows — is mapped to a concrete feature in this document. Google Antigravity orchestrates eight specialized agents whose reasoning traces are visible in the demo.

### **Why this wins the hackathon**

* Antigravity is built for multi-agent orchestration. Two AI Twins negotiating compatibility is the most Antigravity-shaped concept any team could submit.

* The demo is unforgettable. Split-screen of two Twins debating in real-time while a compatibility meter ticks live is a memorable judge moment.

* Every judge has lived the rishta problem. Emotional resonance plus technical depth equals high recall during deliberations.

* The frame is honest. Pakistan's matchmaking market is run by aunties, baajis, and marriage bureaus via WhatsApp and phone calls — textbook informal-economy service discovery.

* Wali Mode is uniquely Pakistani. No global product has ever shipped family-co-onboarded AI matching. This is the moat.

### **The four pillars**

**1\.  AI Twin Personality Engine —** Per-user persistent agent built from a 3-layer hybrid onboarding (voice chat, scenario cards, Twin interview) plus optional Wali Mode family input.

**2\.  Twin-to-Twin Negotiation —** Moderator Agent orchestrates structured debate across 8 dimensions, producing transparent compatibility reports with reasoning visible to user and judges.

**3\.  Service Orchestration Layer —** Booking, scheduling, pricing, confirmations, follow-ups, dispute resolution — all simulated end-to-end to satisfy Challenge 2 requirements.

**4\.  Halal Reveal & Wali Dashboard —** Top 3 matches unlocked with wali contact first, then humans connect under Islamic adab.

### **Non-negotiables**

* Frame as halal matchmaking and the rishta economy. Never use the word "dating."

* Antigravity workflow traces must be visible in the mobile demo (judges score 20% on this).

* Hit every Challenge 2 system requirement, not just the matching engine.

* Submit on May 20, not May 19 or 21\. All four artifacts: mobile build, demo video, README, Antigravity logs.

# **2\. Strategic Positioning & Risk Assessment**

## **2.1 The framing decision**

The shortlisting pitch was RishtaAI. FAQ Q10 explicitly says: "You will build your solution based on the explicit requirements of the selected challenge." Reusing the pitch as-is is not permitted; building to Challenge 2's requirements is mandatory.

Challenge 2 targets "the informal service economy — plumbers, electricians, tutors, beauticians, drivers, mechanics, AC technicians, home service providers, and small local professionals." The defining characteristic: services that operate through WhatsApp, phone calls, referrals, and informal networks.

Pakistan's rishta market matches this profile exactly. It is run by:

* Rishta aunties operating WhatsApp groups with hundreds of profiles

* Marriage bureaus charging PKR 50,000 to 500,000 per successful nikah

* Family referral networks operating across phone calls and informal meetings

* Online matrimonial platforms (Shaadi.com, Muzz) that still rely on manual filtering and family verification offline

RishtaAI is therefore a legitimate informal-economy service automation play. The framing in the README must be explicit: "Rishta matchmaking is Pakistan's largest informal service economy, valued at an estimated PKR 50+ billion annually, operated through WhatsApp networks and family referrals."

## **2.2 Risk register**

| Risk | Description | Mitigation |
| :---- | :---- | :---- |
| **Framing rejection** | Judges view RishtaAI as off-brief vs Challenge 2's stated examples (plumbers, electricians). | Front-load README and demo intro with explicit informal-economy framing. Show the 8-agent service orchestration layer prominently, not just the Twin debate. |
| **Antigravity superficiality** | Antigravity used only as a thin wrapper around Gemini calls; judges spot it (worth 20%). | Build genuine multi-agent workflows in Antigravity: 8 agents with distinct roles, visible traces, error recovery, tool calls. |
| **Mobile build slip** | 5-day window is tight for a polished cross-platform mobile app. | Expo \+ EAS Build, ship via QR code (Expo Go), defer App Store submission. Use shadcn-style RN component libraries. |
| **Demo flakiness** | Live LLM calls during demo could time out or hallucinate. | Pre-record best Twin debate, have it as fallback. Cache top match results. Have local fallback responses scripted. |
| **Cultural backlash** | Judges or audience may flag AI-mediated matchmaking as un-Islamic. | Explicitly frame as halal matchmaking, not dating. Include wali approval gate. Cite traditional matchmaker function being modernized, not replaced. |
| **Scope creep** | 5 days, 5 people, 8 agents, 1 mobile app, 1 demo video, 1 README, traces. Easy to overbuild. | Section 11 locks MVP scope. Section 16 lists explicit cut-scope items. Daily standup enforces. |
| **Privacy red flag** | Real personal data in demo violates challenge guidelines. | All 12 candidate profiles are fictional. Use synthetic names and photos (generated). README includes explicit privacy note. |

## **2.3 Competitive landscape**

Existing players and why none of them solve the problem:

* **Shaadi.com / Muslim Matrimony —** Profile databases with manual filtering. No AI personality matching. High noise, low signal.

* **Muzz / Minder —** Tinder-style swipe apps with hijab filters. Optimized for chat volume, not compatibility. Heavy ghosting and mismatched intentions.

* **Traditional aunties / bureaus —** Personal but biased, expensive, slow, and limited to social network reach. Charge 50K–500K PKR per success.

* **RishtaAI's wedge —** Deep compatibility before emotional investment, transparent agentic reasoning, halal protocol enforced by Wali agent, scale via AI Twins.

# **3\. Challenge 2 Compliance Matrix**

Every system requirement listed in the Challenge 2 document is mapped below to a concrete RishtaAI feature. The build will not ship until every row is green.

### **3.1 System Requirements Mapping**

| Challenge 2 Requirement | RishtaAI Implementation | Owner / Agent |
| :---- | :---- | :---- |
| Multilingual \+ noisy input (Urdu, Roman Urdu, English, code-switching) with confidence score \+ confirmation questions | Voice \+ chat onboarding in all 3 languages. STT via Google Cloud Speech. Confidence threshold gates re-prompts. Code-switch tokenizer normalizes mixed input. | **Onboarding Agent** |
| 6+ factor matching: distance, availability, rating, reliability, specialization, price, capacity, cancellation rate, preference, risk | 8-dimension compatibility scoring: deen, family, career, finances, kids, conflict style, geography, dealbreakers. Each dimension weighted by user-stated importance. | **Moderator Agent** |
| Skill / job complexity classification (basic, intermediate, complex) | Match-complexity classifier: "Standard" (most dimensions align), "Nuanced" (deep debate needed), "High-Stakes" (involves dealbreakers requiring family input). | **Moderator Agent** |
| Scheduling intelligence (no double-booking, travel buffers, alternates, waitlist, auto-reschedule) | Meeting Scheduler with wali calendar integration, mosque/venue suggestions, buffer for chaperone coordination, alternate slot generation on conflict. | **Booking Agent** |
| Dynamic pricing with breakdown and fairness | Tiered subscription pricing: PKR 0 (Lite), 2,500/mo (Plus), 15,000 (Family Plus). Success fee on nikah: 50,000 (vs. 500K rishta bureaus). Pricing engine shows fee breakdown. | **Pricing Agent** |
| Booking simulation (confirmation, calendar update, SMS, receipt, DB write) | First-meeting booking workflow: confirms slot, updates both family calendars, sends SMS templates (mock), generates digital meeting card with wali contact, writes to Supabase. | **Booking Agent** |
| Service-quality loop (status, completion, feedback, rating, future-match impact) | Post-meeting feedback: each side rates the encounter on 4 dimensions. Twin updates its model based on what the user actually liked/disliked. Affects future ranking. | **Twin Forge \+ Moderator** |
| Dispute and escalation (no-show, cancellation, complaint, refund, blacklist, human escalation) | Dispute workflow: handles ghosting (no-show), misrepresentation complaints (wali verification flag), refund triggers, blocklist propagation across user network. | **Dispute Agent** |
| Provider-side optimization (workload, fair earning, demand forecasting) | Candidate-side fairness: each Twin gets exposed to at least 5 matching debates per cycle. Demand-balanced surfacing prevents "hot profile" monopoly. | **Moderator Agent** |
| Robustness and fallback (no provider, low-confidence parse, API failure, payment failure, conflicts) | Fallback flows: (a) STT confidence \< 0.6 → re-prompt with chips, (b) no top-3 candidates → expand criteria, (c) Gemini timeout → cached response, (d) wali conflict → escalate to human review queue. | **All agents (Antigravity recovery)** |

### **3.2 Stress-test scenarios from the challenge brief**

The challenge document lists six recommended stress tests. RishtaAI handles each:

* **No suitable provider available —** Moderator returns expanded-criteria search; user opts in or waits in queue with notification.

* **Provider cancels after confirmation —** Booking Agent auto-reschedules with \#2 ranked match, notifies both walis.

* **Misspelled / mixed-language input —** Onboarding Agent shows confidence score and asks clarifying chip-based questions.

* **Overlapping requests for same candidate —** Fairness queue: candidate Twin debates run sequentially; both users notified of expected timeline.

* **Post-service dispute —** Dispute Agent collects both perspectives, flags misrepresentation if wali verification fails, processes blocklist.

* **High rating but recent negative reviews —** Time-weighted reputation scoring; recent flags downrank candidate visibility.

# **4\. Product Vision & Core Concept**

## **4.1 The insight**

Traditional rishta culture in Pakistan is broken in three specific ways:

1. Aunties shortlist based on family politics, surface attributes, and class — not values or compatibility.

2. Families invest emotional and social capital before discovering real incompatibility, often 6+ months in.

3. Existing apps (Muzz, Minder, Shaadi) are profile databases. They optimize for chat volume, not marriage outcomes.

RishtaAI's thesis: deep compatibility analysis should happen BEFORE emotional investment, conducted by AI representatives that know each user's values, dealbreakers, and life trajectory.

## **4.2 The core mechanic**

| AI Twins Negotiate. Humans Decide. Each user trains an AI Twin during onboarding. The Twin holds the user's values, family context, deen practice, career goals, and dealbreakers. When a candidate enters the pool, the two Twins enter a structured debate across 8 dimensions of married life. Only the top 3 surviving matches are revealed — wali contact first, then humans connect. |
| :---- |

## **4.3 What makes it agentic**

RishtaAI satisfies the Antigravity "agentic" bar through eight distinct properties:

* **Autonomy —** Twins debate without per-step user supervision.

* **Multi-agent —** Eight specialized agents with distinct roles and reasoning styles.

* **Tool use —** Agents call STT, calendar APIs, SMS templates, Supabase, and each other.

* **Memory —** Twin personality persists across sessions; updates from post-meeting feedback.

* **Planning —** Moderator plans debate order, escalates dimensions on disagreement, terminates when threshold met.

* **Reasoning transparency —** Every decision logged with rationale; users see why a match scored 0.87, not just the number.

* **Error recovery —** Fallback paths for STT failure, Gemini timeout, conflict resolution, dispute escalation.

* **Goal-directedness —** System optimizes for marriage outcomes (nikah occurred \+ reported satisfaction at month 6), not engagement metrics.

## **4.4 The product promise**

If a user spends 8 minutes onboarding their Twin and connects with a top-3 match, they will:

* Have transparent insight into the top 5 friction points in the proposed match BEFORE meeting

* Receive an Islamic-protocol-compliant meeting flow (wali first, public venue, time-bound)

* Spend 50K PKR instead of 500K to a bureau, and only on success

* Get post-meeting Twin learning that improves future matches

# **5\. User Personas & Journey**

## **5.1 Primary personas**

### **Persona 1: Sara, 27, Karachi**

* **Role:** Marketing manager at a Karachi FMCG, lives with parents in DHA.

* **Pain:** Two failed rishta engagements. Family pushing 'log kya kahenge.' Aunties send mismatched profiles.

* **Goal:** Find a partner who respects her career, shares Islamic values, accepts her widowed mother living with them.

* **Tech:** iPhone user, fluent in WhatsApp and Instagram, comfortable with English UIs.

### **Persona 2: Ahmed, 31, Lahore**

* **Role:** Software engineer at a Lahore startup, planning to relocate to UAE in 2 years.

* **Pain:** Family wants traditional, he wants someone career-oriented. Tired of rishta aunties suggesting his cousins.

* **Goal:** Find a wife willing to relocate, who has her own ambitions, with practicing-but-not-rigid deen.

* **Tech:** Android Pixel, comfortable in English/Urdu mix, uses voice notes daily.

### **Persona 3: Mrs. Ayesha (Sara's mother), 56, Karachi — Wali Persona**

* **Role:** Widowed mother and primary wali for Sara.

* **Pain:** Doesn't trust apps. Wants to vet matches herself. Doesn't speak English fluently.

* **Goal:** See verified matches, contact the boy's family directly, ensure Sara's deen and family security.

* **Tech:** Basic smartphone user, WhatsApp \+ YouTube. Needs Urdu UI and simple flows.

## **5.2 End-to-end user journey**

| Step | User Action | System Behavior | Agent(s) Involved |
| :---- | :---- | :---- | :---- |
| **1\. Install \+ Sign-up** | Downloads RishtaAI, signs up with phone OTP | Account created, language preference detected | — |
| **2\. Onboarding L1 (Voice Chat)** | 3 min WhatsApp-style chat with Onboarding Agent | Voice \+ text input parsed, confidence scored, follow-ups asked | Onboarding Agent |
| **3\. Onboarding L2 (Scenario Cards)** | Swipes through 12 dilemma cards (4 min) | Personality radar chart updates live, dimensions weighted | Twin Forge Agent |
| **4\. Onboarding L3 (Twin Interview)** | Reviews 3 Twin-generated statements, corrects (1 min) | Twin v1.0 locked, stored in Supabase | Twin Forge Agent |
| **4b. Wali Mode (Optional)** | Hands phone to wali for 3-min input | Wali perspective merged with user Twin (weighted) | Wali Agent |
| **5\. Twin Negotiation** | Sees "Your Twin is meeting candidates" screen | Pre-screen filters pool to 5 candidates, Moderator runs 8-dimension debate on each | User Twin \+ Candidate Twins \+ Moderator Agent |
| **6\. Top 3 Reveal** | Opens app, sees 3 ranked matches with compatibility report | Detailed scorecard \+ reasoning trace \+ friction-point preview | Moderator Agent |
| **7\. Wali Contact** | Taps "Initiate Halal Reveal" on top match | Wali Agent generates rishta brief, sends to both walis | Wali Agent \+ Booking Agent |
| **8\. First Meeting** | Wali confirms slot, meeting card issued | Slot booked, SMS confirmation, calendar update, meeting card generated | Booking Agent |
| **9\. Post-Meeting Feedback** | Rates meeting on 4 dimensions | Twin learns from feedback, ranking model updates | Twin Forge \+ Moderator |
| **10\. Dispute / Continue** | Reports issue OR proceeds to nikah talks | Dispute Agent handles complaints OR success-fee triggered on nikah | Dispute Agent \+ Pricing Agent |

# **6\. System Architecture**

## **6.1 High-level architecture**

RishtaAI is structured in four layers:

┌─────────────────────────────────────────────────────────┐

│  LAYER 1: MOBILE CLIENT (Expo \+ React Native \+ TS)      │

│  Onboarding UI · Chat UI · Match cards · Live debate UI │

│  Wali dashboard · Settings · Notifications              │

└────────────────────────┬────────────────────────────────┘

                         │ HTTPS \+ SSE for live traces

┌────────────────────────▼────────────────────────────────┐

│  LAYER 2: API GATEWAY (Node.js \+ Fastify)                │

│  Auth · Request routing · SSE streams · Rate limiting    │

└────────────────────────┬────────────────────────────────┘

                         │

┌────────────────────────▼────────────────────────────────┐

│  LAYER 3: ANTIGRAVITY ORCHESTRATION                      │

│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │

│  │ Onboarding   │ │ Twin Forge   │ │ User Twin    │    │

│  └──────────────┘ └──────────────┘ └──────────────┘    │

│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │

│  │ Candidate    │ │ Moderator    │ │ Wali Agent   │    │

│  │ Twins        │ │ (Negotiator) │ │              │    │

│  └──────────────┘ └──────────────┘ └──────────────┘    │

│  ┌──────────────┐ ┌──────────────┐                     │

│  │ Booking      │ │ Dispute      │                     │

│  └──────────────┘ └──────────────┘                     │

│                                                          │

│  Tools: Gemini 2.0 Flash · Cloud STT/TTS · Supabase API │

│         SMS template · Calendar API · Maps API           │

└────────────────────────┬────────────────────────────────┘

                         │

┌────────────────────────▼────────────────────────────────┐

│  LAYER 4: DATA & SERVICES (Supabase \+ Google Cloud)      │

│  Postgres · Auth · Storage · Realtime · Edge Functions   │

└──────────────────────────────────────────────────────────┘

## **6.2 Request flow: a typical match**

1. Mobile app emits POST /api/match/request with userId.

2. API Gateway authenticates, opens SSE stream back to client for live traces.

3. Antigravity workplan loaded: "Find top 3 matches for User\_123."

4. Moderator Agent reads user Twin from Supabase.

5. Pre-screen agent reduces 12-candidate pool to top 5 via vector similarity on values \+ dealbreakers.

6. For each of 5 candidates: Moderator spawns parallel debate task between User Twin and Candidate Twin.

7. Each debate: 8 dimensions, structured turn-taking, Moderator scores each dimension.

8. Moderator aggregates scores, applies user-stated dimension weights, ranks candidates.

9. Top 3 written to Supabase, push notification sent.

10. Antigravity reasoning trace returned via SSE; client renders live debate as it streams.

## **6.3 Antigravity-specific orchestration**

Antigravity is the central nervous system. Specifically, it handles:

* **Workplan management —** Each major user flow (onboarding, match request, booking, dispute) is an Antigravity workplan with explicit sub-tasks.

* **Task delegation —** Workplans delegate to specific agents; agents can spawn child tasks (e.g., Moderator spawns 5 parallel debates).

* **Tool calling —** Agents call external tools (Gemini, STT, Supabase, SMS templates) through Antigravity's tool registry.

* **Decision logging —** Every agent decision ("chose dimension order: deen → family → career", "rejected candidate due to dealbreaker on relocation") is logged with rationale.

* **Error recovery —** Antigravity retry policies handle Gemini timeouts, STT failures, missing data; logged as recovery events.

* **Trace export —** Workplan \+ task plan \+ agent observations \+ decisions \+ tool calls \+ outcomes exported as the required hackathon deliverable.

# **7\. The Agent Roster (Antigravity Orchestration)**

RishtaAI orchestrates eight specialized agents. Each has a defined role, inputs, outputs, tools, and failure modes. Together they satisfy every Challenge 2 requirement.

### **Agent 1: Onboarding Agent**

**Role:** Conducts the Layer 1 multilingual voice/chat interview. Extracts core identity, family setup, deen practice, career, dealbreakers. Adapts follow-up questions based on responses. Handles Urdu, Roman Urdu, English, and code-switching.

**Inputs:** User audio (Whisper-class STT output) or text input. Language detection signal. Conversation history.

**Outputs:** Structured onboarding payload: { name, age, location, family\_setup, deen\_level, career, dealbreakers\[\], language\_pref, confidence\_scores\[\] }.

**Tools:** Google Cloud Speech-to-Text, Gemini 2.0 Flash (instruction-tuned), Antigravity conversation memory.

**Failure modes & recovery:** STT confidence \< 0.6 → re-prompt with quick-reply chips. Empty answer detected → polite probe. User exits early → save partial state, resume later.

### **Agent 2: Twin Forge Agent**

**Role:** Synthesizes onboarding outputs (Layer 1 \+ 2 \+ 3 \+ optional Wali) into a persistent AI Twin personality. Generates the system prompt that defines the Twin's voice, values, and reasoning style. Locks Twin v1.0 in Supabase.

**Inputs:** Onboarding payload, scenario card responses, Twin Interview corrections, optional Wali Mode input.

**Outputs:** Twin JSON spec (see Section 10): values, weights\[8\], deen\_level, family\_context, career\_trajectory, dealbreakers\[\], dimension\_weights{}, system\_prompt\_template, version.

**Tools:** Gemini 2.0 Flash, Supabase write, Antigravity state management.

**Failure modes & recovery:** Conflicting Wali input vs user input → flagged for user reconciliation. Sparse data on a dimension → marks dimension as low-confidence, Moderator down-weights it.

### **Agent 3: User AI Twin (per user)**

**Role:** Represents the user in compatibility negotiations. Argues from the user's stated values and dealbreakers. Defends the user's interests in the debate. NOT designed to be agreeable; designed to be honest.

**Inputs:** Twin v1.0 spec, Moderator's debate prompt, Candidate Twin's statements, current dimension under discussion.

**Outputs:** Debate statements (per turn), dimension-specific opinions, willingness-to-compromise scores, dealbreaker flags.

**Tools:** Gemini 2.0 Flash with Twin system prompt injected, conversation memory.

**Failure modes & recovery:** Hallucination drift → Moderator detects off-spec statements and re-anchors. Inconsistency between turns → re-loaded from spec.

### **Agent 4: Candidate AI Twin (per candidate)**

**Role:** Same architecture as User Twin but represents a candidate match. For the MVP demo: 12 hand-crafted Twins with rich, believable backstories spanning deen levels, family setups, career trajectories, and cities.

**Inputs:** Candidate Twin spec, debate prompt, User Twin's statements.

**Outputs:** Same as User Twin (debate statements, opinions, flags).

**Tools:** Same as User Twin.

**Failure modes & recovery:** Same as User Twin. Additionally: if Candidate Twin's spec has incomplete fields, dimension is marked low-confidence.

### **Agent 5: Moderator Agent (the Negotiator)**

**Role:** Orchestrates the Twin-to-Twin debate. Selects dimension order, prompts each Twin, scores each dimension on a 0–1 scale, detects dealbreakers, escalates contested dimensions, terminates when a verdict threshold is reached. Produces the final compatibility report with reasoning trace.

**Inputs:** User Twin spec, Candidate Twin spec, user-stated dimension weights, debate history.

**Outputs:** Compatibility Report JSON: { overall\_score, dimension\_scores{}, dealbreakers\_hit\[\], top\_friction\_points\[\], top\_strengths\[\], reasoning\_trace\[\], recommendation }.

**Tools:** Gemini 2.0 Flash (orchestrator-tuned), Antigravity sub-task spawning, Supabase write.

**Failure modes & recovery:** Twin contradicts itself → Moderator surfaces inconsistency, asks Twin to re-anchor. Debate exceeds time budget → Moderator forces early termination with low-confidence flag. Tie scores → expand debate by 2 turns.

### **Agent 6: Wali Agent**

**Role:** Generates the family-facing rishta brief once a top-3 match is revealed. Handles Layer 4 (Wali Mode) input during onboarding. Manages the halal reveal protocol: contacts wali first, never user directly. Generates Urdu-language brief if wali's language preference is Urdu.

**Inputs:** Top-3 match data, user's wali contact info, language pref, optional Wali Mode input.

**Outputs:** Rishta brief (text \+ structured fields): family background, deen practice, career, photo, references, top compatibility highlights, suggested meeting protocol.

**Tools:** Gemini 2.0 Flash (Urdu-capable prompt), SMS template generation, calendar API.

**Failure modes & recovery:** Wali contact missing → fallback to user as wali (Islamic edge case: independent adults). Wali doesn't respond in 48h → reminder \+ suggest alternate wali option.

### **Agent 7: Booking Agent**

**Role:** Simulates the first-meeting workflow once both walis approve. Manages slot proposal, calendar updates, SMS confirmations, public venue suggestions (Maps API), digital meeting card generation, and reminder notifications.

**Inputs:** Approved match, both walis' calendar availability, location data, language prefs.

**Outputs:** Meeting confirmation record: { slot\_iso, venue, attendees\[\], wali\_contacts\[\], meeting\_card\_url, reminders\_scheduled\[\] }, mock SMS sent, calendar updated.

**Tools:** Google Maps Places API (for halal-friendly venues), Supabase write, mock SMS template engine, calendar mock API.

**Failure modes & recovery:** Slot conflict → propose 3 alternates. Venue unavailable → propose 3 alternates. SMS API failure → fall back to in-app notification only.

### **Agent 8: Dispute Agent**

**Role:** Handles post-meeting issues: no-show, misrepresentation complaint, ghosting, family rejection. Collects both perspectives, applies reputation impact, processes blocklist propagation, escalates to human review when needed. Feeds learnings back to Twin Forge for future ranking.

**Inputs:** Dispute filing (from user or wali), match history, prior reputation scores, both Twins' specs.

**Outputs:** Resolution record: { type, severity, action\_taken, reputation\_impact\[\], blocklist\_changes\[\], escalated\_to\_human }, notifications sent to both parties.

**Tools:** Gemini 2.0 Flash (mediation-tuned prompt), Supabase write, notification service.

**Failure modes & recovery:** Contradictory accounts → flag for human review (out of scope for MVP, but visible in trace). Repeat offender detected → auto-shadowban with explanation.

# **8\. Onboarding: The 3-Layer Hybrid \+ Wali Mode**

Total time: 8 minutes for user, 3 minutes optional for wali. Designed to minimize drop-off while maximizing Twin signal density.

## **8.1 Layer 1 — Voice \+ Chat Intro (3 min)**

WhatsApp-style chat interface. Onboarding Agent introduces itself, asks 5 core questions. User can respond by voice (preferred) or text. Quick-reply chips offered for sensitive or chip-friendly questions.

### **Question script (adapted per user)**

1. "As-salamu alaykum\! Apna naam aur thori si baat batayein." — open voice/text.

2. "Family setup kya hai? Joint, nuclear, ya kuch aur?" — chips: \[Joint\] \[Nuclear\] \[Other\].

3. "Deen practice ka level batayein." — chips: \[5-time namazi\] \[Occasional\] \[Cultural\] \+ voice for nuance.

4. "Career aur 5-year goal kya hai?" — open voice/text.

5. "Dealbreakers — kya cheezein bilkul accept nahi karenge?" — open voice/text.

### **Antigravity trace visible to user**

Below the chat, a slim trace strip shows in real-time:

*"Confidence on language parse: 87%. Detected language: Roman Urdu \+ English. Family weight inferred: HIGH (mentioned mother twice). Dealbreaker captured: relocation outside Pakistan."*

## **8.2 Layer 2 — Scenario Decision Cards (4 min)**

User swipes through 12 morally-textured dilemma cards. Each card presents a realistic rishta scenario with 3–4 choices. Choices map to weighted contributions across 8 personality dimensions. A radar chart at the top of the screen updates in real-time as the user swipes — they literally see their Twin forming.

### **Sample cards (full set: 12\)**

* **Card 1 (Family loyalty):** "Your spouse's brother loses his job and asks to live with you for 6 months. You: (A) welcome without question (B) negotiate timeline (C) suggest financial help instead (D) decline."

* **Card 3 (Career-family balance):** "Your spouse gets a 2-year posting in Dubai right after nikah. You: (A) go together immediately (B) ask them to delay (C) do long-distance (D) decline the match if this came up before nikah."

* **Card 7 (Deen practice):** "Your spouse prays 5 times but you struggle with fajr. They: (A) gently remind (B) wake you up (C) don't comment (D) feel disappointed."

* **Card 11 (Conflict style):** "You and spouse disagree on kids' school choice. You: (A) defer to their judgment (B) insist on yours (C) bring elders in (D) keep debating until consensus."

### **Why this fulfills Challenge 2**

Each swipe is a clean structured signal — far higher quality than open-ended voice responses. The radar chart updates form the visible "agentic" moment: judges literally see the Twin being assembled from user inputs. This is the demo-friendliest part of onboarding.

## **8.3 Layer 3 — The Twin Interview (1 min)**

After Layers 1 and 2, the Twin Forge Agent generates a draft Twin and presents 3 self-statements:

*Twin: "Salaam. Mein aapka AI Twin hoon. Mujhe lagta hai aap aisey hain — confirm karein?"*

Statement 1: "You value your career deeply but would compromise on relocation for the right partner."

Statement 2: "You want a practicing Muslim partner but flexible on appearance (e.g., hijab choice)."

Statement 3: "You expect to live separately from in-laws after marriage."

Each statement has \[✓ Yes\] \[✗ Not me\] buttons. "Not me" opens a voice/text correction. Twin updates in real-time. Final Twin v1.0 locked.

### **Why this is unforgettable**

No matchmaking app has ever shown the user their AI representation and asked "is this you?" It is genuinely novel, demo-friendly, and serves as the validation step that makes Twin quality defensible to judges.

## **8.4 Layer 4 — Wali Mode (Optional, 3 min)**

After Layer 3, user is offered: "Want your wali to add their perspective? It strengthens the match quality and is fully optional." Toggle \[Yes\] \[Skip\].

If yes, app shifts to Wali UI (Urdu-default, simpler typography, larger buttons). Wali Agent asks:

1. "Apnay \[bachay\] ka briefly description batein."

2. "Kya values aapke liye sab se important hain partner mein?"

3. "Koi cheez jo bilkul acceptable nahi?"

Twin Forge Agent reconciles wali input with user input. Where they agree, weight is reinforced. Where they conflict, the conflict is surfaced to the user as: "Your wali emphasized X strongly; you didn't mention it. Want to add it?"

### **Why this is the moat**

Rishtas in Pakistan are family decisions, not individual decisions. Building this into the product authentically — rather than treating family input as friction to overcome — is what separates RishtaAI from every global matchmaking app. Demonstrate this in the demo for a memorable judge moment.

# **9\. Tech Stack & Tooling**

Stack selected for: (1) 5-day build feasibility, (2) iOS \+ Android coverage, (3) AI-assisted development speed, (4) judge demoability via QR code.

| Layer | Choice | Why |
| :---- | :---- | :---- |
| **Mobile framework** | Expo (React Native) \+ TypeScript | Single codebase for iOS \+ Android. Expo Go QR demo. Strong AI-coding support. |
| **UI components** | Tamagui or NativeWind \+ custom design system | Production-quality components in days. Tailwind-style classes familiar to JS devs. |
| **State management** | Zustand \+ React Query | Lightweight, no boilerplate. React Query handles server state and SSE. |
| **Backend API** | Node.js 20 \+ Fastify \+ TypeScript | Same language as frontend. Fastify SSE support for live agent traces. |
| **Agent orchestration** | Google Antigravity (MANDATORY) | Hackathon requirement. Multi-agent workplans, task plans, traces. |
| **Primary LLM** | Gemini 2.0 Flash | Fast, cheap, multilingual (handles Urdu/Roman Urdu well), supports tool calls. |
| **Fallback LLM** | Gemini 2.0 Pro (for Moderator) | Higher reasoning quality for critical compatibility verdicts. |
| **Speech-to-Text** | Google Cloud Speech-to-Text | Urdu \+ English support, confidence scores, code-switch handling. |
| **Text-to-Speech** | Google Cloud TTS (Urdu voice) | Onboarding Agent and Wali brief speakable. Demo polish. |
| **Database \+ Auth** | Supabase (Postgres \+ Auth \+ Realtime) | Generous free tier, OTP auth built-in, realtime subscriptions for live UI updates. |
| **Maps / venues** | Google Maps Places API | Suggest halal-friendly meeting venues (restaurants, cafes near mosque). |
| **Push notifications** | Expo Notifications | Single API for iOS \+ Android. Works in Expo Go for demo. |
| **Mock SMS** | Internal template engine | No real SMS sending — generate templates, render on-screen. |
| **Build / deploy** | EAS Build (Expo) for mobile, Railway for API | EAS produces .apk/.ipa. Railway gives free Node hosting in minutes. |
| **Dev tooling** | Cursor \+ Claude Code \+ Antigravity IDE | AI-assisted coding compresses 5-day timeline significantly. |

## **9.1 Cost analysis**

Required deliverable: cost-per-operation estimate. Below are demo-scale figures.

* **Gemini 2.0 Flash:** \~$0.075/M input tokens, $0.30/M output. Per match (8 dimensions, 2 Twins × 3 turns each \+ Moderator): \~12K tokens → $0.004 per match.

* **Cloud STT:** $0.024 per 15-second chunk → \~$0.10 per onboarding session.

* **Cloud TTS:** $0.016 per 1K characters → \~$0.05 per Twin Interview.

* **Total per user from onboarding to top-3 match:** \~$0.25 (under PKR 75). Scales to PKR 7,500 for 100 users, PKR 75K for 1,000 users. Profitable at PKR 2,500/month subscription tier.

## **9.2 Scalability note**

Required: 10x and 100x scaling discussion.

* **10x (1,000 users):** No architecture change needed. Supabase free tier supports. Gemini scales linearly.

* **100x (10,000 users):** Move to Supabase Pro ($25/mo). Add Redis cache for Twin specs. Batch the Twin pre-screen in background workers.

* **1000x (100,000 users):** Vector DB (Pinecone or pgvector) for pre-screen. Dedicated GPU inference for Twin debates. Multi-region Supabase replicas.

* **Bottleneck identified:** Moderator debate latency (\~12s end-to-end at MVP). Mitigated at scale by background pre-computation overnight, on-demand only for fresh matches.

# **10\. Data Models & Schemas**

## **10.1 Core entity schemas**

### **user**

*Stored in Supabase Postgres. Auth tied to OTP-verified phone.*

{ id: uuid, phone: string, name: string, age: int, gender: enum, city: string, language\_pref: enum(ur|ro\_ur|en), wali\_contact: string?, created\_at: ts, last\_active: ts }

### **twin**

*The persistent Twin personality. One per user, versioned.*

{

  id: uuid,

  user\_id: uuid (fk),

  version: int,

  deen\_level: enum(strict|practicing|moderate|cultural|secular),

  family\_setup: enum(joint|nuclear|single\_parent),

  family\_loyalty\_score: float(0..1),

  career\_trajectory: { current: string, 5yr\_goal: string, ambition: float },

  finances: { current\_status: enum, lifestyle\_pref: enum },

  kids\_timeline: enum(asap|2\_3yrs|5plus|none),

  conflict\_style: enum(avoidant|direct|consensus|elder\_mediated),

  geography: { current: city, 10yr\_pref: city, flexible: bool },

  dealbreakers: string\[\],

  dimension\_weights: { deen, family, career, finances, kids, conflict, geography, dealbreakers: float },

  system\_prompt: text,  // the prompt that defines this Twin's voice

  wali\_override: jsonb?,  // present if Wali Mode used

  created\_at: ts, updated\_at: ts

}

### **compatibility\_report**

*Generated by Moderator Agent per matching attempt. One per (user\_id, candidate\_id) pair.*

{

  id: uuid,

  user\_twin\_id: uuid (fk),

  candidate\_twin\_id: uuid (fk),

  overall\_score: float(0..1),

  dimension\_scores: {

    deen: { score, weight, evidence, friction\_level },

    family: { ... }, career: { ... }, finances: { ... },

    kids: { ... }, conflict: { ... }, geography: { ... }, dealbreakers: { ... }

  },

  top\_strengths: string\[3\],

  top\_friction\_points: string\[3\],

  dealbreakers\_hit: string\[\],

  recommendation: enum(strong\_match|conditional\_match|not\_recommended),

  reasoning\_trace: jsonb,  // full debate transcript \+ Antigravity log

  generated\_at: ts

}

### **meeting**

*Booking record from Booking Agent.*

{ id, user\_id, candidate\_id, slot\_iso, venue, both\_wali\_contacts\[\], meeting\_card\_url, status: enum(proposed|confirmed|completed|cancelled|no\_show), reminders\[\] }

### **dispute**

*From Dispute Agent.*

{ id, meeting\_id, filed\_by: enum(user|wali), type: enum(no\_show|misrep|ghosting|family\_reject|other), severity: 1-5, status, resolution, reputation\_impact: jsonb }

## **10.2 Antigravity workplan schema (illustrative)**

Workplans are stored as Antigravity-native artifacts. Below is the conceptual shape for the demo trace export.

**workplan\_001\_find\_top\_matches:**

  goal: "Find top 3 matches for user U\_42"

  constraints: { time\_budget: 30s, candidate\_pool: 12 }

  tasks:

    1\. load\_user\_twin → output: twin\_spec

    2\. prescreen\_candidates → output: top\_5\_candidate\_ids

    3\. for each candidate:

         spawn\_debate(user\_twin, candidate\_twin) → compatibility\_report

    4\. rank\_reports → output: top\_3

    5\. notify\_user(top\_3)

  observations: \[ … \]   // live state during execution

  decisions: \[ … \]      // why dimension order, dealbreaker flags, etc.

  tool\_calls: \[ … \]     // Gemini, Supabase, etc.

  recoveries: \[ … \]     // retries on Gemini timeout, STT fail

  outcome: { top\_3, runtime\_ms, cost\_usd }

# **11\. Feature Specification (MVP Scope)**

Locked scope for the 5-day build. Anything not in this list is out of scope for the May 20 submission.

## **11.1 IN SCOPE (MVP)**

### **Onboarding**

* Phone OTP signup (Supabase Auth)

* Layer 1: Voice \+ chat WhatsApp-style intro (3 min)

* Layer 2: 12 scenario decision cards with live radar (4 min)

* Layer 3: Twin Interview with 3 self-statements \+ corrections (1 min)

* Layer 4: Optional Wali Mode (3 min, Urdu UI)

* Twin v1.0 persisted in Supabase

### **Matching**

* 12 hand-crafted candidate Twins in the pool

* Pre-screen: vector similarity on values \+ dealbreakers (reduces 12 → 5\)

* Live Twin-to-Twin debate UI with split-screen and streaming text

* Live Antigravity trace strip showing reasoning steps

* Compatibility Report screen with 8-dimension breakdown, friction points, strengths

* Top 3 ranked match cards

### **Halal reveal & booking**

* Wali Agent generates rishta brief (Urdu/English)

* Wali notification (mock SMS visible on-screen)

* Booking Agent: meeting slot proposal, venue suggestion via Maps

* Meeting card with both wali contacts

* Calendar mock update \+ reminder schedule

### **Post-meeting**

* 4-dimension feedback collection

* Twin Forge learns and updates dimension weights

* Dispute filing flow (no-show, misrep, ghosting) with Dispute Agent resolution

### **Visible Antigravity**

* Live trace strip on key screens

* Full Antigravity log exported as a deliverable

* Failure recovery shown on at least one screen (e.g., low STT confidence → chip fallback)

## **11.2 OUT OF SCOPE (cut for MVP)**

Explicitly NOT building these. If a team member starts on any of these without lead approval, that work gets thrown away.

* Real SMS/email sending (mock templates only)

* Real payment processing (pricing tier display only)

* Profile photo upload by user (use synthetic avatars for candidates)

* NADRA / employer verification (mock badges only)

* Chat between humans (not part of the agentic story)

* Detailed wali dashboard with separate login (toggle within main app instead)

* Reinforcement learning, Reddit scraping, or any external training data pipeline

* Web app (mobile-only per Challenge 2; web deferred to post-hackathon)

* Onboarding \> 8 minutes — hard cap

* More than 12 candidate Twins for the demo pool

## **11.3 BASELINE COMPARISON (required deliverable)**

Required: "Show how agentic system performs better than simple heuristic or non-agentic implementation."

RishtaAI will ship a Baseline Mode toggle in settings for the demo: when enabled, matching uses a simple weighted-distance formula over the same Twin features, no debate, no reasoning. The demo compares:

* **Baseline output:** "Top match: Candidate 7, score 0.81" — no reasoning, no friction points.

* **Agentic output:** "Top match: Candidate 3 (Baseline ranked 7th). Reasoning: Baseline overweighted geographic proximity. Twin debate revealed Candidate 3 shares your stance on joint family, while Candidate 7 had a hidden dealbreaker on relocation we caught in dimension 7."

This single comparison demonstrates the agentic value-add and satisfies the deliverable.

# **12\. Demo Script & Hero Scenarios**

Demo video target: 4 minutes (Challenge 2 says 3-5). Plus 2-3 min separate Antigravity screen-recording. Below is the shot-by-shot script.

## **12.1 Demo video script (4 min)**

| Time | Scene | Script \+ Visual |
| :---- | :---- | :---- |
| **0:00–0:20** | Hook | Voiceover: "In Pakistan, rishta is a 50-billion-rupee informal economy run on WhatsApp groups and auntie networks. We built RishtaAI — where your AI Twin negotiates with candidate Twins before any human conversation happens."  Visual: WhatsApp screenshots of rishta groups dissolving into RishtaAI app icon. |
| **0:20–1:10** | Onboarding (Sara) | Sara (persona 1\) signs up. Show Layer 1 voice chat (5s on confidence score appearing). Show Layer 2 swipe through 3 cards with radar chart updating (10s). Show Layer 3 Twin Interview — Twin says "You value career, would compromise on relocation" — Sara taps "Not me" and corrects via voice. Show Wali Mode invitation: Sara taps yes, hands phone to mother. Mother adds input in Urdu. Twin Forge reconciles. Total: 50 seconds compressed. |
| **1:10–1:30** | Twin saved | Splash: "Your Twin is ready. Meeting 12 candidates overnight..." Show Antigravity workplan loading. Show 12 candidate avatars. Pre-screen visibly reduces to 5\. |
| **1:30–2:30** | HERO MOMENT: Twin Debate | Split-screen mobile view. Left: Sara's Twin. Right: Ahmed's Twin (candidate). Moderator prompts: "Discuss family loyalty." Twins exchange 2 turns each. Live compatibility meter ticks. Antigravity trace strip below shows: "Decision: Sara's Twin flagged in-law co-living. Ahmed's Twin accepts. Score: 0.86." Then Moderator: "Discuss geography." Friction — Ahmed wants UAE, Sara wants Karachi for her mother. Compatibility meter dips. Antigravity logs the friction. After 30 seconds compressed, debate concludes. Verdict screen. |
| **2:30–3:00** | Top 3 reveal | Three match cards. Top match scored 0.83, with \#1 strength (deen alignment) and \#1 friction (relocation). Sara taps "View compatibility report" — full 8-dimension breakdown shown. |
| **3:00–3:30** | Halal reveal \+ booking | Sara taps "Initiate Halal Reveal." Wali Agent generates Urdu rishta brief — shown on screen. Mock SMS to wali. Booking Agent proposes 3 venue options (halal cafes via Maps). Meeting card generated. Calendar mock update visible. |
| **3:30–3:50** | Baseline comparison | Voiceover: "Without our agentic system, a baseline ranker would have surfaced Candidate 7 — but it has a hidden dealbreaker our Twins caught." Show Baseline Mode toggle, show different top-3, highlight the missed friction. Cut back to agentic mode. |
| **3:50–4:00** | Close | Voiceover: "Eight agents. Antigravity-orchestrated. Halal-protocol-enforced. RishtaAI — where your AI Twin finds your match." Logo \+ \#VibeKaregaPakistan. |

## **12.2 Antigravity walkthrough video (2-3 min, separate)**

Per FAQ requirement: "2–3-minute video which shows a screen recording on how your team made use of Antigravity solutions."

1. Open Antigravity IDE. Show the workplan file for "find\_top\_matches".

2. Walk through the 5 tasks visually.

3. Run the workplan live. Show task plan executing, observations updating, decisions being logged.

4. Demonstrate tool calls: Gemini call expanding, Supabase read/write, mock SMS template.

5. Trigger a failure (e.g., simulate Gemini timeout). Show the retry/recovery flow.

6. Open the trace export — show the structured log that will be submitted as the hackathon deliverable.

7. Close: "Antigravity is not a wrapper — it is the operating system for our 8 agents."

## **12.3 Hero scenarios to script and rehearse**

Three scenarios, all pre-tested and cached against demo flakiness:

* **Scenario A — The Career Mismatch:** Sara (Karachi, career-driven, mother lives with her) vs. Ahmed (Lahore, planning UAE move). Twins debate, find moderate compatibility (0.71), friction \= relocation. Sara opts out of top spot.

* **Scenario B — The Halal Match:** Sara vs. Bilal (similar deen, same city, willing to support widowed mother). Strong match (0.89), Wali brief generated, meeting booked.

* **Scenario C — The Hidden Dealbreaker:** Baseline ranks Faisal \#1 (geographic match). Agentic Twin debate uncovers Faisal's stance on women working post-marriage conflicts with Sara's career commitment. Demotes to \#6. This is the killer baseline-comparison moment.

# **13\. 5-Day Sprint Plan**

Build window: Friday May 15 evening → Tuesday May 20 evening. Five working days. Roles defined in Section 14\.

## **Day 1 — Friday May 15 (½ day) \+ Saturday May 16**

*THEME: Foundation. Lock the architecture. Stub everything end-to-end.*

### **Day 1 (Fri eve \+ Sat full day)**

* **Lead:** Submit Challenge 2 selection on Google form. Set up project Notion \+ Slack \+ GitHub repo. Lock this PRD. Run kickoff meeting with team.

* **Mobile (2 devs):** Init Expo project with TS. Set up Tamagui/NativeWind. Build 5 placeholder screens (Onboarding, Match Pool, Compatibility Report, Booking, Settings). Set up navigation.

* **Backend (1 dev):** Init Node \+ Fastify \+ TS. Set up Supabase project. Create schemas for user, twin, compatibility\_report, meeting, dispute. Set up auth (phone OTP).

* **Antigravity (1 dev):** Set up Antigravity workspace. Create skeleton workplans for 4 flows: onboarding, find\_matches, book\_meeting, handle\_dispute. Configure Gemini API access. Configure tool registry stubs.

* **Content (1 person):** Write 12 candidate Twin specs (rich backstories, 8-dimension profiles). Write 12 scenario decision cards. Write 20 stress-test cases for Moderator.

* **End of Day 1 standup checkpoint:** Every team member has working dev environment. End-to-end placeholder app runs on simulator.

## **Day 2 — Sunday May 17**

*THEME: Onboarding flow \+ Twin Forge. Get Layer 1 \+ Layer 2 working end-to-end.*

* **Mobile (2 devs):** Build Layer 1 WhatsApp-style chat UI with voice recorder. Build Layer 2 scenario card swipe UI with live radar chart. Connect to backend stubs.

* **Backend (1 dev):** Wire Cloud STT for Urdu/English. Build /onboarding endpoints. Integrate with Antigravity Onboarding Agent.

* **Antigravity (1 dev):** Implement Onboarding Agent (Gemini-backed). Implement Twin Forge Agent. Test with scripted inputs in all 3 languages. Generate Twin v1.0 JSON.

* **Content (1 person):** Finalize 12 candidate Twins. Pre-compute candidate vector embeddings for pre-screen. Generate synthetic avatars. Write demo voiceover script v1.

* **End of Day 2 checkpoint:** A test user can complete Layer 1 \+ Layer 2 onboarding and a Twin spec is generated and stored.

## **Day 3 — Monday May 18**

*THEME: The Twin debate. The hero moment.*

* **Mobile (2 devs):** Build Layer 3 Twin Interview screen. Build Layer 4 Wali Mode UI (Urdu-default). Build the split-screen Twin debate UI with live streaming.

* **Backend (1 dev):** Build SSE streaming endpoint for live debate. Wire to Antigravity Moderator output. Build top-3 ranking endpoint.

* **Antigravity (1 dev):** Implement User Twin and Candidate Twin agents (Gemini with Twin system prompts). Implement Moderator Agent with 8-dimension debate logic. Test with 3 scenario pairs. Tune for \~12s end-to-end debate latency.

* **Content (1 person):** Generate Antigravity trace exports for 3 hero scenarios. Cache them. Start recording B-roll for demo video (onboarding flow on real device).

* **End of Day 3 checkpoint:** A full Twin debate runs end-to-end on the mobile app with visible reasoning trace.

## **Day 4 — Tuesday May 19**

*THEME: Service orchestration layer. Wali, booking, dispute, post-meeting.*

* **Mobile (2 devs):** Build Compatibility Report screen with 8-dimension breakdown. Build Halal Reveal flow. Build Booking flow with venue suggestions. Build post-meeting feedback. Build Dispute filing.

* **Backend (1 dev):** Integrate Google Maps Places API. Build mock SMS template renderer. Wire Booking Agent and Dispute Agent endpoints.

* **Antigravity (1 dev):** Implement Wali Agent (Urdu rishta brief generation). Implement Booking Agent. Implement Dispute Agent. Add error recovery flows for all agents.

* **Content (1 person):** Record demo video B-roll for all flows. Finalize Baseline Mode comparison screen. Write README v1.

* **End of Day 4 checkpoint:** End-to-end demo flow runs without intervention. All 8 agents traced. README drafted.

## **Day 5 — Wednesday May 20 (submission day)**

*THEME: Polish, record, submit. NO new features after 11am.*

* **9am–11am:** Final QA. All 5 team members run through demo on real devices. Fix critical bugs only.

* **11am:** FEATURE FREEZE. No new code. Only bug fixes and content polish.

* **11am–2pm:** Record final 4-min demo video. Record 2-3 min Antigravity walkthrough video. Edit.

* **2pm–4pm:** Finalize README, architecture diagram, agent traces export. Validate every deliverable on the FAQ checklist.

* **4pm–6pm:** Build .apk via EAS for Android. Generate Expo Go QR for iOS. Test on 3 separate devices.

* **6pm–8pm:** Submit. Buffer for upload failures. Confirm receipt.

* **End of Day 5 checkpoint:** Submission confirmed. Celebrate. Then prepare for regional pitching round on May 25-26.

## **Daily standup format**

Every day at 10am and 6pm. 15 minutes max. Format:

1. What I shipped since last standup

2. What I'm shipping by next standup

3. Blockers (named, with owner who can help)

4. Risk flags (anything that could miss the May 20 deadline)

# **14\. Team Roles & Ownership**

Five team members, five clear lanes. Each lane has a primary owner and a backup. No lane is unowned, and no two people own the same lane (eliminates ambiguity).

| Member | Primary Lane | Owns | Daily Output |
| :---- | :---- | :---- | :---- |
| **Member 1 (TL)** | Tech Lead \+ Antigravity | Architecture, Antigravity orchestration, all 8 agent specs, decision authority on cuts | Agent code, traces, ARCH map, deadline calls |
| **Member 2** | Mobile Lead (Frontend) | Expo app, all screens, UI polish, push notifications, EAS build | Working screens shipped daily |
| **Member 3** | Mobile UX \+ Live Debate UI | Onboarding UX, scenario cards radar chart, Twin debate split-screen, design system | Polished hero screens |
| **Member 4** | Backend \+ Integrations | Fastify API, Supabase, Cloud STT/TTS, Maps API, SSE streaming, EAS deployment | Working endpoints \+ integrations |
| **Member 5** | Content \+ Demo \+ README | 12 candidate Twins, 12 scenario cards, demo video script, voiceover, README, agent traces export | Content drafts \+ video edits |

## **14.1 Cross-cutting responsibilities**

* **Demo rehearsal:** All 5, evening of Day 4 and Day 5\. Rehearse together at least 3 times.

* **PR/issue triage:** TL handles cross-team PRs. No PR sits more than 2 hours.

* **Communication:** Slack channels: \#general, \#mobile, \#backend, \#antigravity, \#content. Twice-daily standups.

* **Decision authority:** TL decides scope cuts. Mobile Lead decides UI patterns. Backend Lead decides API contracts. Content Lead decides demo narrative. All escalate to TL on disputes.

# **15\. Evaluation Rubric Alignment**

How RishtaAI earns each percentage point in the official rubric. This is the scorecard the team optimizes against.

| Rubric Line | Weight | How RishtaAI Earns It |
| :---- | ----- | :---- |
| **Antigravity Integration** | **20%** | 8 distinct agents orchestrated. Workplan \+ task plan visible. Tool registry used. Error recovery demonstrated. Trace exports submitted. Antigravity walkthrough video shows 2-3 min of pure IDE/orchestration usage. |
| **Matching & Decision Quality** | **25%** | 8 weighted dimensions (challenge requires 6+). Live Twin debate IS the reasoning. Baseline comparison shows agentic value-add. Friction-point analysis is unique to RishtaAI. Single largest rubric line. |
| **Multilingual Robustness** | **15%** | Onboarding handles Urdu / Roman Urdu / English / code-switching. STT confidence scoring with chip fallback. Wali Mode in Urdu by default. Demo shows all three languages. |
| **Scheduling, Pricing, Workflow** | **15%** | Booking Agent handles slot conflicts, venue suggestions, calendar updates. Pricing Agent shows tiered breakdown. Full service lifecycle from request → booking → feedback → dispute. |
| **Dispute, Reliability, Scalability** | **15%** | Dispute Agent handles no-show / misrep / ghosting. Reputation impact propagated. Cost analysis at 10x/100x/1000x. Fallback flows on every failure mode demonstrated. |
| **Innovation & UX** | **10%** | Twin Interview ("is this you?") is unprecedented. Wali Mode is uniquely Pakistani. Split-screen Twin debate is the visual signature. Halal reveal protocol shows cultural depth. |

## **15.1 Strategic emphasis: where to push hardest**

The 25% line (Matching & Decision Quality) is the largest single weight. Every team-week-hour spent improving Twin debate quality, friction-point clarity, and baseline comparison directly buys score. If the team has 2 extra hours on Day 4, this is where they go — not into more screens, more polish, or more agents.

# **16\. Risks, Mitigations & Cut Scope**

## **16.1 Top 5 risks with mitigation**

1. LLM latency makes demo feel slow → Mitigation: cache hero scenario debates, run cached version during demo recording, show live version separately to judges who ask.

2. Antigravity learning curve eats too much Day 1-2 → Mitigation: TL spends Day 0 (before Day 1\) on Antigravity docs and tutorials. Stub workplans first, fill in agents incrementally.

3. Cross-platform Expo bugs (iOS-specific or Android-specific) → Mitigation: test both platforms daily from Day 1\. Use Expo's QR code on real devices, not just emulators.

4. Twin debates produce inconsistent / hallucinated responses → Mitigation: strict system prompts, Moderator re-anchoring on inconsistency, low-temperature decoding for Twins (0.3-0.5).

5. Demo video runs long or short → Mitigation: storyboard locked Day 4\. Two rough cuts (3 min, 5 min). Pick the better one Day 5 morning.

## **16.2 Cut scope if behind schedule**

In rough priority order — first items cut first if Day 4 standup shows we are behind:

4. Push notifications (replace with in-app banner)

5. Real Maps API (use 3 hardcoded venue suggestions per city)

6. Wali Mode (Layer 4\) — keep stub but skip in main demo; mention as roadmap

7. Dispute filing UI (keep agent \+ trace, skip mobile UI; mention as roadmap)

8. Post-meeting feedback UI (keep agent \+ Twin update, skip mobile UI)

9. Reduce candidate pool from 12 → 6 (keep diversity but smaller pre-screen)

Items 1-3 are safe to cut and barely impact score. Items 4-6 hurt the workflow-completeness score but are still better than missing submission.

## **16.3 What we never cut**

These features are the spine. Cutting any of them means the submission fails:

* 3-layer onboarding (Layers 1, 2, 3\)

* Twin Forge Agent \+ persistent Twin storage

* Split-screen Twin debate with live trace

* Top-3 reveal with compatibility report

* Baseline comparison (required deliverable)

* Antigravity workplan \+ task plan \+ trace export

* Mobile app running on real iOS and Android device

* 4-min demo video \+ 2-3 min Antigravity walkthrough video

* README with all required sections

# **17\. Deliverables Checklist**

Submit at end-of-day May 20\. Every item below must be checked off before submission.

## **17.1 The four artifacts**

### **☐ 1\. Working Mobile App**

* Expo project compiled and tested on both iOS and Android

* EAS Build .apk available for Android download

* Expo Go QR code provided for iOS instant demo

* All MVP-in-scope features (Section 11.1) functional

* Web app NOT submitted (out of scope per FAQ)

### **☐ 2\. Demo Video (4 min) \+ Antigravity Walkthrough (2-3 min)**

* Main demo: shows input → intent extraction → matching → pricing → booking → feedback → dispute

* Antigravity walkthrough: shows workplan, task plan, agent decisions, tool calls, recovery

* Both videos uploaded to YouTube or Drive with public link

* Captions/subtitles in English

### **☐ 3\. Antigravity Agent Trace / Logs**

* Workplan files exported for all 4 major flows

* Task plans visible

* Agent observations, reasoning, decisions logged

* Tool calls recorded

* Action execution logs

* At least one failure / recovery scenario in the trace

* Final outcomes documented

### **☐ 4\. README / Documentation**

* Architecture overview with diagram

* Data schemas for all 5 core entities

* Tools and APIs used (full list)

* Antigravity role explicitly described

* Setup steps for evaluators to run the app

* Assumptions documented

* Privacy note (no real personal data used)

* Cost per operation \+ latency estimates

* Scalability discussion (10x, 100x, 1000x)

* Baseline comparison: agentic vs non-agentic

* Limitations explicitly listed

## **17.2 Pre-flight final check (Day 5 4pm)**

1. Demo video plays in full screen without buffering

2. Antigravity walkthrough video plays without buffering

3. Mobile app installs on at least 2 fresh iOS devices via Expo Go

4. Mobile app installs on at least 2 fresh Android devices via .apk

5. README renders correctly on GitHub

6. Trace files open without errors

7. All team members named, dates correct, contact info present

8. Submission form filled in completely

9. Confirmation email received from organizers

**END OF DOCUMENT**

*RishtaAI · Google Antigravity Hackathon 2026 · Internal PRD v1.0*