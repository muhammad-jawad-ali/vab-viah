# RishtaAI Project Context (Google Antigravity Hackathon 2026)

This file serves as the definitive reference for all LLM agents and developers working on **RishtaAI**, an agentic AI matchmaking system targeting Pakistan's largest informal service economy: *rishta* (matchmaking) services.

The core goal is to enable deep, transparent compatibility analysis using AI representatives to minimize emotional and social investment in mismatched partners.

## 1. Product Vision and Core Mechanic

RishtaAI is explicitly framed as **halal matchmaking** and service automation for the *rishta* economy; the word "dating" must never be used.

The system is built on **Four Pillars**:

*   **AI Twin Personality Engine**: Each user trains a persistent AI Twin via an 8-minute, 3-layer hybrid onboarding process (voice chat, scenario cards, Twin interview). This includes the unique **Wali Mode** for optional family input, reinforcing the family-oriented nature of the service.
*   **Twin-to-Twin Negotiation**: The trained AI Twins engage in a structured debate orchestrated by a **Moderator Agent**. Compatibility is scored across **eight dimensions** of married life (e.g., deen, family, career, finances, conflict style, geography, dealbreakers).
*   **Halal Reveal & Wali Dashboard**: Only the top three matches that survive the agentic debate are unlocked. A specialized **Wali Agent** contacts the user's *wali* (guardian/family contact) first, before the humans connect.
*   **Service Orchestration Layer**: The system handles end-to-end service functions required by Challenge 2, including dynamic pricing (tiered subscriptions: PKR 0 to 15,000/mo), scheduling simulation, confirmations, follow-ups, and dispute resolution.

## 2. Technical Architecture & Agent Roster

The entire system is orchestrated by **Google Antigravity**, which is a mandatory hackathon requirement for all agent communications, workplans, and reasoning logs.

### Agent Roster (8 Specialized Agents)

| Agent Name | Primary Function | Key Tools/Inputs |
| :--- | :--- | :--- |
| **Onboarding Agent** | Conducts multilingual voice/chat interview (Urdu, Roman Urdu, English, code-switching) with confidence scoring and fallback prompts. | Google Cloud Speech-to-Text (STT), Gemini 2.0 Flash. |
| **Twin Forge Agent** | Synthesizes all onboarding data (user, scenario cards, optional Wali Mode) into the persistent AI Twin JSON specification and system prompt. | Gemini 2.0 Flash, Supabase write. |
| **User AI Twin** | Represents the user in the debate, arguing based on their stored values, dealbreakers, and family context. | Gemini 2.0 Flash (strict system prompt). |
| **Candidate AI Twin** | Represents a potential match during the debate. (For MVP demo: 12 hand-crafted candidate Twins). | Gemini 2.0 Flash (strict system prompt). |
| **Moderator Agent** | **The Negotiator.** Orchestrates the Twin debate, scores compatibility (0–1 scale), applies user-stated weights, detects dealbreakers, and produces the final Compatibility Report with reasoning trace. | Gemini 2.0 Pro (for critical verdicts), Supabase write. |
| **Wali Agent** | Manages the Halal Reveal protocol, generates family-facing rishta briefs (Urdu/English), and handles Wali Mode input during onboarding. | Gemini 2.0 Flash (Urdu-capable), SMS template, Calendar API. |
| **Booking Agent** | Simulates first-meeting scheduling, calendar updates, and venue suggestions (via Maps API) once both walis approve. | Google Maps Places API, mock SMS template, Supabase write. |
| **Dispute Agent** | Handles post-meeting issues (no-show, misrepresentation), collects both perspectives, applies reputation impact, and feeds learnings back to the Twin Forge. | Gemini 2.0 Flash (mediation-tuned), Supabase write. |

## 3. Mandatory Constraints and MVP Scope

### Non-Negotiables

*   **Framing:** Must be framed as *halal matchmaking* and the *rishta economy*, never "dating".
*   **Agentic Proof:** **Antigravity workflow traces must be visible** in the mobile demo (20% score weight).
*   **Challenge Compliance:** Must satisfy all Challenge 2 requirements (multilingual, 6+ factor matching, dynamic pricing, scheduling, dispute, robustness).
*   **Baseline Comparison:** The demo must show a comparison where the agentic, debate-driven result is demonstrably superior to a simple weighted-distance heuristic baseline.

### Locked MVP Scope (What to Build)

*   **Onboarding:** Complete 3-Layer Hybrid + optional Wali Mode, persisting the Twin v1.0 JSON.
*   **Matching:** Live Twin-to-Twin debate UI (split-screen with streaming text) and the final Compatibility Report screen.
*   **Service Workflow:** Wali Agent generating the rishta brief, Booking Agent proposing a slot/venue, and the Dispute filing flow.
*   **Deliverables:** Mobile app (Expo), 4-min demo video, 2-3 min Antigravity walkthrough video, and Antigravity traces export.

### Explicit Cut Scope (What NOT to Build)

*   Real SMS/email sending (use mock templates).
*   Real payment processing (display pricing tiers only).
*   Chat between humans.
*   Detailed Wali dashboard with separate login.
*   Any external training data pipeline (e.g., Reddit scraping).
*   Onboarding time greater than 8 minutes.

## 4. Data Models (Key Entities)

The system relies on five primary Supabase tables:

| Entity | Description | Key Fields |
| :--- | :--- | :--- |
| **user** | User identity, phone, name, city, language preference, wali contact. | `id`, `phone`, `language_pref`, `wali_contact` |
| **twin** | The persistent, versioned AI personality. | `user_id`, `version`, `deen_level`, `family_setup`, `dealbreakers[]`, `dimension_weights{}`, `system_prompt` |
| **compatibility_report** | Generated by Moderator after debate. | `overall_score`, `dimension_scores{}`, `top_friction_points[]`, `reasoning_trace` (Antigravity log) |
| **meeting** | Booking record managed by Booking Agent. | `slot_iso`, `venue`, `both_wali_contacts[]`, `status` |
| **dispute** | Record of post-meeting issues. | `filed_by`, `type`, `resolution`, `reputation_impact` |
