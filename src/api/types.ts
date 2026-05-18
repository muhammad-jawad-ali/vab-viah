// Backend type mirror + adapters.
//
// Source of truth for these types is the backend repo:
//   - backend/src/agents/_shared/types.ts  (ApiResponse, TraceEvent, Dimension)
//   - backend/src/domain/twin.ts           (TwinSpec)
//
// Mirrored here verbatim so the frontend doesn't need a build-time monorepo
// link. If the backend ever changes a shape, update this file too.

// ---------------------------------------------------------------------------
// 8 compatibility dimensions — same order as backend DIMENSIONS array.
// ---------------------------------------------------------------------------
export const DIMENSIONS = [
  'deen',
  'family',
  'career',
  'finances',
  'kids',
  'conflict',
  'geography',
  'dealbreakers',
] as const;
export type Dimension = (typeof DIMENSIONS)[number];

// The frontend's existing radar UI calls the 8th dimension "boundaries".
// We surface the backend term ("dealbreakers") at the API boundary and let
// callers rename it for the radar if they want.
export const DIMENSION_LABELS: Record<Dimension, string> = {
  deen: 'Deen',
  family: 'Family',
  career: 'Career',
  finances: 'Finances',
  kids: 'Kids',
  conflict: 'Conflict',
  geography: 'Geography',
  dealbreakers: 'Boundaries',
};

// ---------------------------------------------------------------------------
// API envelope. Every route returns this shape. apiFetch unwraps `data` so
// callers never see the envelope itself.
// ---------------------------------------------------------------------------
export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = {
  ok: false;
  error: { code: string; message: string; details?: unknown };
};
export type ApiResponse<T> = ApiOk<T> | ApiErr;

// ---------------------------------------------------------------------------
// Auth — POST /auth/otp/start, POST /auth/otp/verify.
// ---------------------------------------------------------------------------
export type OtpStartRequest = { phone: string };
export type OtpStartResponse = { sent: true; dev?: boolean };

export type OtpVerifyRequest = { phone: string; otp: string };
export type OtpVerifyResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: number | null;
  user_id: string | null;
};

// ---------------------------------------------------------------------------
// Twin spec — backend/src/domain/twin.ts.
// ---------------------------------------------------------------------------
export type Gender = 'male' | 'female';
export type DeenLevel = 'strict' | 'practicing' | 'moderate' | 'cultural' | 'secular';
export type FamilySetup = 'joint' | 'nuclear' | 'single_parent';
export type FinancialStatus = 'student' | 'starting' | 'stable' | 'affluent';
export type LifestylePref = 'simple' | 'comfortable' | 'aspirational';
export type KidsTimeline = 'asap' | '2-3_yrs' | '5_plus' | 'none';
export type ConflictStyle = 'avoidant' | 'direct' | 'consensus' | 'elder_mediated';
export type LanguagePref = 'ur' | 'ro_ur' | 'en';

export type TwinSpec = {
  identity: { name: string; age: number; gender: Gender; city: string };
  deen_level: DeenLevel;
  family_setup: FamilySetup;
  family_loyalty_score: number;
  career: { current: string; five_yr_goal: string; ambition: number };
  finances: { current_status: FinancialStatus; lifestyle_pref: LifestylePref };
  kids_timeline: KidsTimeline;
  conflict_style: ConflictStyle;
  geography: { current_city: string; ten_yr_pref: string; flexible: boolean };
  dealbreakers: string[];
  dimension_weights: Record<Dimension, number>;
  system_prompt: string;
  wali_override?: Record<string, unknown>;
  language_pref: LanguagePref;
  version: number;
};

export type TwinMeResponse = { twin: TwinSpec; twinId: string; version: number };

// ---------------------------------------------------------------------------
// Onboarding — POST /onboarding/{layer1,layer2,layer3,wali,finalize}.
// Shapes below are inferred from backend SESSION_CONTEXT + routes; confirm
// against the actual route handlers before wiring each in Session 2.
// ---------------------------------------------------------------------------
export type Layer1Request = {
  sessionId?: string;
  message: string;
  language_pref?: LanguagePref;
};
export type Layer1Response = {
  sessionId: string;
  next_prompt: string;
  confidence: number;
  chips?: string[];
  done: boolean;
};

export type Layer2Request = { sessionId: string; cardId: string; choiceIndex: number };
export type Layer2Response = {
  sessionId: string;
  cardIndex: number;
  totalCards: number;
  radar: Record<Dimension, number>;
  done: boolean;
};

export type Layer3GenerateRequest = { sessionId: string; mode: 'generate' };
export type Layer3CorrectRequest = {
  sessionId: string;
  mode: 'correct';
  corrections: { index: number; revised: string }[];
};
export type Layer3Request = Layer3GenerateRequest | Layer3CorrectRequest;
export type Layer3Response = { statements?: string[]; twinPreview?: Partial<TwinSpec> };

export type WaliRequest = {
  sessionId: string;
  wali_contact?: string;
  overrides?: Partial<TwinSpec>;
};
export type WaliResponse = { sessionId: string; applied: boolean };

export type FinalizeRequest = { sessionId: string };
export type FinalizeResponse = { twinId: string; twin: TwinSpec };

// ---------------------------------------------------------------------------
// Compatibility report — backend/src/domain/scoring.ts.
// Confirm field names against scoring.ts before wiring in Session 3.
// ---------------------------------------------------------------------------
export type FrictionLevel = 'none' | 'low' | 'medium' | 'high' | 'dealbreaker';
export type Recommendation = 'strong_match' | 'conditional_match' | 'not_recommended';

export type DimensionScore = {
  score: number; // 0..1
  weight: number;
  evidence: string;
  friction_level: FrictionLevel;
};

export type CompatibilityReport = {
  id: string;
  user_twin_id: string;
  candidate_twin_id: string;
  overall_score: number; // 0..1
  dimension_scores: Record<Dimension, DimensionScore>;
  top_strengths: string[];
  top_friction_points: string[];
  dealbreakers_hit: string[];
  recommendation: Recommendation;
  reasoning_trace: unknown;
  generated_at: string;
  flow_id?: string;
  candidate?: {
    twinId: string;
    name: string;
    age: number;
    city: string;
    profession?: string;
  };
};

export type MatchRequestResponse = { flowId: string; streamUrl: string };
export type MatchResultsResponse = { reports: CompatibilityReport[] };
export type BaselineMatchResponse = {
  ranking: { candidateTwinId: string; score: number; name?: string }[];
};

// ---------------------------------------------------------------------------
// TraceEvent — SSE stream. ts is a millisecond timestamp.
// ---------------------------------------------------------------------------
export type WorkplanName =
  | 'onboarding_flow'
  | 'find_matches'
  | 'book_meeting'
  | 'handle_dispute';

export type TraceEvent =
  | { type: 'workplan.started'; workplan: WorkplanName; flowId: string; ts: number }
  | { type: 'task.started'; task: string; ts: number }
  | { type: 'agent.observation'; agent: string; observation: string; ts: number }
  | { type: 'agent.decision'; agent: string; decision: string; rationale: string; ts: number }
  | { type: 'tool.call'; tool: string; args: unknown; ts: number }
  | { type: 'tool.result'; tool: string; result: unknown; latency_ms: number; ts: number }
  | { type: 'agent.message'; agent: string; content: string; ts: number }
  | { type: 'dimension.scored'; dimension: Dimension; score: number; evidence: string; ts: number }
  | { type: 'recovery'; reason: string; action: string; ts: number }
  | { type: 'task.finished'; task: string; outcome: unknown; ts: number }
  | { type: 'workplan.finished'; outcome: unknown; ts: number };
export type TraceEventType = TraceEvent['type'];

// ---------------------------------------------------------------------------
// Booking — POST /book/initiate, /book/confirm.
// Confirm shapes against backend/src/routes/booking.routes.ts in Session 4.
// ---------------------------------------------------------------------------
export type WaliBrief = {
  language: 'en' | 'ur' | 'ro_ur';
  body: string;
  audio_dataUri?: string;
  sms_preview?: string;
};

export type ProposedSlot = {
  slotId: string;
  slotIso: string;
  confidence: number;
  displayDay: string;
  displayTime: string;
};

export type ProposedVenue = {
  venueId: string;
  name: string;
  address: string;
  city: string;
  fallback?: boolean;
};

export type BookInitiateRequest = { candidateTwinId: string };
export type BookInitiateResponse = {
  flowId: string;
  meetingId: string;
  briefs: WaliBrief[];
  slots: ProposedSlot[];
  venues: ProposedVenue[];
};

export type BookConfirmRequest = {
  meetingId: string;
  slotIso: string;
  venueId: string;
};

export type Meeting = {
  id: string;
  user_id: string;
  candidate_id: string;
  slot_iso: string;
  venue: unknown;
  wali_contacts: unknown;
  meeting_card_url: string | null;
  status: 'proposed' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  reminders: unknown;
};

export type BookConfirmResponse = { meeting: Meeting };

// ---------------------------------------------------------------------------
// Dispute — POST /dispute/file.
// ---------------------------------------------------------------------------
export type DisputeType =
  | 'no_show'
  | 'misrepresentation'
  | 'ghosting'
  | 'family_rejection'
  | 'other';

export type DisputeAction =
  | 'no_action'
  | 'warning'
  | 'shadowban'
  | 'flag_for_human_review'
  | 'mutual_close';

export type DisputeResolution = {
  type: DisputeType;
  severity: number;
  action: DisputeAction;
  rationale: string;
  escalated: boolean;
  reputation_impact: { partyId: string; delta: number }[];
};

export type DisputeFileRequest = {
  meetingId: string;
  type: DisputeType;
  narrative: string;
};

export type DisputeFileResponse = { resolution: DisputeResolution };

// ---------------------------------------------------------------------------
// Feedback — POST /feedback/post-meeting.
// ---------------------------------------------------------------------------
export type FeedbackRatings = {
  truthfulness: number;
  chemistry: number;
  family_alignment: number;
  would_meet_again: number;
};

export type FeedbackRequest = {
  meetingId: string;
  ratings: FeedbackRatings;
  narrative?: string;
};

export type FeedbackResponse = {
  newTwinId: string;
  systemPromptRefreshed: boolean;
};

// ---------------------------------------------------------------------------
// ApiError — thrown by apiFetch on { ok: false } or HTTP error.
// ---------------------------------------------------------------------------
export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(args: { code: string; message: string; status: number; details?: unknown }) {
    super(args.message);
    this.name = 'ApiError';
    this.code = args.code;
    this.status = args.status;
    this.details = args.details;
  }
}

// ---------------------------------------------------------------------------
// Frontend-facing view models. Adapter functions translate at the API
// boundary so screens keep their existing prop shapes.
// ---------------------------------------------------------------------------
export type FrontendMatch = {
  matchId: string;
  displayName: string;
  blurAvatarUrl: string;
  compatibilityScore: number; // 0..100, scaled from overall_score * 100
  tags: string[];
  city: string;
  profession: string;
  age: number;
  status: 'new' | 'negotiating' | 'revealed';
  recommendation: Recommendation;
};

export function toFrontendMatch(report: CompatibilityReport): FrontendMatch {
  const c = report.candidate;
  const name = c?.name ?? 'Candidate';
  const tags: string[] = [];
  if (c?.profession) tags.push(c.profession);
  if (c?.city) tags.push(c.city);
  if (report.dealbreakers_hit.length > 0) tags.push('Dealbreaker');

  return {
    matchId: report.candidate_twin_id,
    displayName: name,
    blurAvatarUrl: `https://i.pravatar.cc/300?u=${encodeURIComponent(report.candidate_twin_id)}`,
    compatibilityScore: Math.round(report.overall_score * 100),
    tags,
    city: c?.city ?? '',
    profession: c?.profession ?? '',
    age: c?.age ?? 0,
    status: report.recommendation === 'not_recommended' ? 'new' : 'negotiating',
    recommendation: report.recommendation,
  };
}
