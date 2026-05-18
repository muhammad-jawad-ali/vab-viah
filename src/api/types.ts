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

export type TwinMeResponse = {
  twinId: string;
  spec: TwinSpec;
  version: number;
  createdAt: string;
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// Onboarding — POST /onboarding/{layer1,layer2,layer3,wali,finalize}.
// Mirrors backend/src/routes/onboarding.routes.ts +
// backend/src/workplans/onboarding.workplan.ts. Source of truth: those files.
// ---------------------------------------------------------------------------

// What backend extracts from the chat turn. Mirrors ExtractedSchema in
// backend/src/agents/onboarding.agent.ts. All fields optional / partial.
export type OnboardingExtracted = Partial<{
  identity: Partial<{ name: string; age: number; gender: Gender; city: string }>;
  deen_level: DeenLevel;
  family_setup: FamilySetup;
  career: Partial<{ current: string; five_yr_goal: string }>;
  kids_timeline: KidsTimeline;
  geography: Partial<{ current_city: string; ten_yr_pref: string; flexible: boolean }>;
  dealbreakers: string[];
}>;

export type OnboardingPayload = OnboardingExtracted & {
  per_field_confidence?: Record<string, number>;
};

export type OnboardingNextTopic =
  | 'identity'
  | 'deen'
  | 'family'
  | 'career'
  | 'kids'
  | 'geography'
  | 'dealbreakers'
  | 'done';

export type OnboardingTurnResult = {
  reply: string;
  extracted: OnboardingExtracted;
  confidence: number;
  next_topic: OnboardingNextTopic;
  chip_options?: string[];
  sttConfidence?: number;
  sttStub?: boolean;
};

// Layer 1 — chat interview. Backend takes exactly one of `text` or
// `audioBase64`; sessionId is omitted on the first call and round-tripped after.
export type Layer1Request = {
  sessionId?: string;
  language?: LanguagePref;
  text?: string;
  audioBase64?: string;
};
export type Layer1Response = {
  sessionId: string;
  flowId: string;
  turn: OnboardingTurnResult;
  turnNumber: number;
  payload: OnboardingPayload;
};

// Layer 2 — scenario cards. Vector values clamped to [-1, 1] per dimension.
export type RadarVector = Partial<Record<Dimension, number>>;
export type RadarState = {
  vector: RadarVector;
  cardsAnswered: number;
  cardsRemaining: string[];
};
export type Layer2Request = { sessionId: string; cardId: string; optionId: string };
export type Layer2Response = {
  sessionId: string;
  flowId: string;
  radar: RadarState;
};

// Layer 3 — Twin statements + corrections.
// Backend dispatches on presence of `corrections`, NOT on a `mode` field.
export type TwinStatement = {
  dimension: Dimension;
  statement: string;
  agree: boolean | null;
  correction?: string;
};
export type Layer3Correction = {
  dimension: Dimension;
  agree: boolean;
  correction?: string;
};
export type Layer3GenerateRequest = { sessionId: string };
export type Layer3CorrectRequest = {
  sessionId: string;
  corrections: Layer3Correction[]; // 1..3 items
};
export type Layer3Request = Layer3GenerateRequest | Layer3CorrectRequest;
export type Layer3Response = {
  sessionId: string;
  flowId: string;
  statements: TwinStatement[];
};

// Layer 4 — wali. wali_phone required (E.164); override object required but
// inner fields all optional, so `override: {}` is valid.
export type WaliOverride = Partial<{
  deen_level: DeenLevel;
  family_setup: FamilySetup;
  kids_timeline: KidsTimeline;
  dealbreakers: string[];
}>;
export type ConflictFlag = {
  field: string;
  user_value: unknown;
  wali_value: unknown;
};
export type WaliRequest = {
  sessionId: string;
  wali_phone: string;
  override: WaliOverride;
  notes?: string;
};
export type WaliResponse = {
  sessionId: string;
  flowId: string;
  conflicts: ConflictFlag[];
};

// Finalize — forges the Twin, persists to Supabase, closes the trace bus.
export type FinalizeRequest = { sessionId: string };
export type FinalizeResponse = {
  twinId: string;
  spec: TwinSpec;
  traceEventCount: number;
};

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

// Real shape persisted by find-matches.workplan.ts and returned by
// GET /match/results/:flowId. Note: there is NO `id`, `user_twin_id`,
// `flow_id`, or `candidate` field — `candidate_name` lives inside
// `reasoning_trace`. The frontend's "displayName" comes from there.
export type StoredReport = {
  candidate_twin_id: string;
  overall_score: number; // 0..1
  dimension_scores: Record<Dimension, DimensionScore>;
  top_strengths: string[];
  top_friction_points: string[];
  dealbreakers_hit: string[];
  recommendation: Recommendation;
  reasoning_trace: {
    candidate_name?: string;
    prescreen_similarity?: number | null;
    prescreen_penalty?: number | null;
    duration_ms?: number;
    budget_exceeded?: boolean;
    dimensions_scored?: number;
    [k: string]: unknown;
  };
  generated_at: string;
};

// Legacy alias used internally; same row shape as StoredReport.
export type CompatibilityReport = StoredReport;

export type MatchRequestResponse = { flowId: string; streamUrl: string };
export type MatchResultsResponse = {
  flowId: string;
  topThree: StoredReport[];
  allDebated: StoredReport[];
};

export type BaselineMatchResponse = {
  userTwinId: string;
  ranking: { candidateId: string; candidateName: string; baselineScore: number }[];
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
  topStrength?: string;
  topFriction?: string;
  dealbreakersHit: string[];
  candidateTwinId: string;
};

// Real backend reports don't carry city/profession/age — those live only on
// the candidate's TwinSpec which isn't sent back to the client today. Surface
// the strongest narrative bits we DO get: top strength + top friction.
export function toFrontendMatch(report: CompatibilityReport): FrontendMatch {
  const name = report.reasoning_trace?.candidate_name ?? 'Candidate';
  const tags: string[] = [];
  if (report.dealbreakers_hit.length > 0) tags.push('Dealbreaker');
  if (report.recommendation === 'strong_match') tags.push('Strong Match');
  else if (report.recommendation === 'conditional_match') tags.push('Conditional');

  return {
    matchId: report.candidate_twin_id,
    candidateTwinId: report.candidate_twin_id,
    displayName: name,
    blurAvatarUrl: `https://i.pravatar.cc/300?u=${encodeURIComponent(report.candidate_twin_id)}`,
    compatibilityScore: Math.round(report.overall_score * 100),
    tags,
    city: '',
    profession: '',
    age: 0,
    status: report.recommendation === 'not_recommended' ? 'new' : 'negotiating',
    recommendation: report.recommendation,
    topStrength: report.top_strengths?.[0],
    topFriction: report.top_friction_points?.[0],
    dealbreakersHit: report.dealbreakers_hit,
  };
}
