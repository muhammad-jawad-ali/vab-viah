// ─── Mock Data ─────────────────────────────────────────────────────────────────
// All data is fictional. Used when EXPO_PUBLIC_USE_MOCK=true.

export interface MockMatch {
  matchId: string;
  displayName: string;
  blurAvatarUrl: string;
  compatibilityScore: number;
  tags: string[];
  city: string;
  profession: string;
  age: number;
  status: 'new' | 'negotiating' | 'revealed';
}

export const MOCK_MATCHES: MockMatch[] = [
  {
    matchId: 'match_001',
    displayName: 'Ahmed M.',
    blurAvatarUrl: 'https://i.pravatar.cc/150?u=101',
    compatibilityScore: 94,
    tags: ['Software Engineer', 'Family-oriented', 'Islamabad'],
    city: 'Islamabad',
    profession: 'Software Engineer',
    age: 29,
    status: 'new',
  },
  {
    matchId: 'match_002',
    displayName: 'Bilal R.',
    blurAvatarUrl: 'https://i.pravatar.cc/150?u=102',
    compatibilityScore: 89,
    tags: ['Doctor', 'Deen Aligned', 'Lahore'],
    city: 'Lahore',
    profession: 'Medical Doctor',
    age: 32,
    status: 'new',
  },
  {
    matchId: 'match_003',
    displayName: 'Omar S.',
    blurAvatarUrl: 'https://i.pravatar.cc/150?u=103',
    compatibilityScore: 82,
    tags: ['Entrepreneur', 'Career-driven', 'Karachi'],
    city: 'Karachi',
    profession: 'Startup Founder',
    age: 30,
    status: 'new',
  },
  { matchId: 'match_004', displayName: 'Zainab F.', blurAvatarUrl: 'https://i.pravatar.cc/150?u=104', compatibilityScore: 78, tags: ['Teacher', 'Family-oriented'], city: 'Lahore', profession: 'Teacher', age: 26, status: 'new' },
  { matchId: 'match_005', displayName: 'Hassan K.', blurAvatarUrl: 'https://i.pravatar.cc/150?u=105', compatibilityScore: 60, tags: ['Banker', 'Extrovert'], city: 'Karachi', profession: 'Banker', age: 31, status: 'new' },
  { matchId: 'match_006', displayName: 'Fatima A.', blurAvatarUrl: 'https://i.pravatar.cc/150?u=106', compatibilityScore: 71, tags: ['Architect', 'Creative'], city: 'Islamabad', profession: 'Architect', age: 28, status: 'new' },
  { matchId: 'match_007', displayName: 'Usman R.', blurAvatarUrl: 'https://i.pravatar.cc/150?u=107', compatibilityScore: 85, tags: ['Engineer', 'Introvert'], city: 'Lahore', profession: 'Engineer', age: 33, status: 'new' },
  { matchId: 'match_008', displayName: 'Ayesha S.', blurAvatarUrl: 'https://i.pravatar.cc/150?u=108', compatibilityScore: 68, tags: ['Doctor', 'Ambitious'], city: 'Karachi', profession: 'Doctor', age: 27, status: 'new' },
  { matchId: 'match_009', displayName: 'Tariq M.', blurAvatarUrl: 'https://i.pravatar.cc/150?u=109', compatibilityScore: 55, tags: ['Sales', 'Frequent Traveler'], city: 'Dubai', profession: 'Sales Manager', age: 34, status: 'new' },
  { matchId: 'match_010', displayName: 'Zahra B.', blurAvatarUrl: 'https://i.pravatar.cc/150?u=110', compatibilityScore: 92, tags: ['Writer', 'Homebody'], city: 'Islamabad', profession: 'Writer', age: 25, status: 'new' },
  { matchId: 'match_011', displayName: 'Ali W.', blurAvatarUrl: 'https://i.pravatar.cc/150?u=111', compatibilityScore: 75, tags: ['Chef', 'Foodie'], city: 'Lahore', profession: 'Chef', age: 30, status: 'new' },
  { matchId: 'match_012', displayName: 'Sana H.', blurAvatarUrl: 'https://i.pravatar.cc/150?u=112', compatibilityScore: 81, tags: ['Lawyer', 'Activist'], city: 'Karachi', profession: 'Lawyer', age: 29, status: 'new' }
];

export interface DebateMessage {
  speaker: 'Moderator' | 'YourTwin' | string;
  text: string;
  dimension?: string;
}

// Scenario A — Career Mismatch (used for match_001 "Ahmed M.")
export const DEBATE_SCENARIO_A: DebateMessage[] = [
  { speaker: 'Moderator', text: 'Initiating dimension 1 of 8: Deen & Religious Practice.', dimension: 'deen' },
  { speaker: 'YourTwin', text: 'Faith is foundational for me — I pray five times a day and expect a shared commitment to Islamic values in the home.' },
  { speaker: "Ahmed's Twin", text: 'Ahmed is a practicing Muslim. He prays regularly and sees the home as a space of peace and Sunnah-inspired habits.' },
  { speaker: 'Moderator', text: 'Score: 95/100. Strong alignment on deen practice. Moving to dimension 2: Family & Living Arrangement.' },
  { speaker: 'YourTwin', text: 'My widowed mother will live with us. This is non-negotiable — it is my responsibility and my honour.' },
  { speaker: "Ahmed's Twin", text: 'Ahmed deeply respects family obligation. He is open to extended family arrangements if approached with clear boundaries and mutual respect.' },
  { speaker: 'Moderator', text: 'Score: 88/100. Conditional alignment — Ahmed will need a direct conversation about boundaries. Moving to dimension 7: Geography.' },
  { speaker: 'YourTwin', text: 'Karachi is home. My mother\'s support network, my career, and my roots are here. Relocation abroad is not something I am willing to accept.' },
  { speaker: "Ahmed's Twin", text: 'Ahmed has a concrete plan to relocate to UAE within 2 years for a higher-impact engineering role. This is a priority for him.' },
  { speaker: 'Moderator', text: 'Friction detected: Geography. This is the primary tension point. Score: 62/100. Overall compatibility: 87%. Recommendation: Conditional Match — geography requires direct resolution in the first meeting.' },
];

// Scenario B — Strong Match (used for match_002 "Bilal R.")
export const DEBATE_SCENARIO_B: DebateMessage[] = [
  { speaker: 'Moderator', text: 'Initiating dimension 1 of 8: Deen & Religious Practice.', dimension: 'deen' },
  { speaker: 'YourTwin', text: 'Faith is the foundation. I pray and expect a home grounded in Islamic values.' },
  { speaker: "Bilal's Twin", text: 'Bilal prays five times, leads Jumu\'ah at his local masjid, and sees raising children with strong deen as his life\'s primary responsibility.' },
  { speaker: 'Moderator', text: 'Score: 98/100. Exceptional deen alignment. Moving to dimension 2: Family.' },
  { speaker: 'YourTwin', text: 'My widowed mother lives with me. Any partner must understand and honour this fully.' },
  { speaker: "Bilal's Twin", text: 'Bilal comes from a family that cared for his grandmother at home. He sees this as an act of barakah, not a burden.' },
  { speaker: 'Moderator', text: 'Score: 100/100. Perfect alignment on family values. Moving to dimension 7: Geography.' },
  { speaker: 'YourTwin', text: 'Karachi is home. I am not open to relocation.' },
  { speaker: "Bilal's Twin", text: 'Bilal is rooted in Karachi. His medical practice, family, and community are here. He has no plans to leave.' },
  { speaker: 'Moderator', text: 'Score: 100/100. Geographic match confirmed. Overall compatibility: 94%. Recommendation: STRONG MATCH — proceed with halal reveal.' },
];

// Scenario C — Hidden Dealbreaker (used for match_003 "Omar S.")
export const DEBATE_SCENARIO_C: DebateMessage[] = [
  { speaker: 'Moderator', text: 'Initiating dimension 1 of 8: Deen & Religious Practice.', dimension: 'deen' },
  { speaker: 'YourTwin', text: 'Faith is non-negotiable for me.' },
  { speaker: "Omar's Twin", text: 'Omar considers himself culturally Muslim — Eid, family gatherings, but not a daily prayer practice.' },
  { speaker: 'Moderator', text: 'Score: 58/100. Moderate misalignment on deen. Moving to dimension 3: Career & Ambition.' },
  { speaker: "Omar's Twin", text: 'Omar expects his partner to step back from her career after children are born. He believes the home is the wife\'s primary domain.' },
  { speaker: 'YourTwin', text: 'My career is part of who I am. I will not reduce my professional life after marriage or children.' },
  { speaker: 'Moderator', text: 'DEALBREAKER DETECTED: Career autonomy. Omar\'s stance directly conflicts with a stated dealbreaker. Score: 20/100. Overall compatibility: 64%. Recommendation: NOT RECOMMENDED — dealbreaker on career autonomy cannot be resolved through negotiation.' },
];

export const DEBATE_MAP: Record<string, DebateMessage[]> = {
  match_001: DEBATE_SCENARIO_A,
  match_002: DEBATE_SCENARIO_B,
  match_003: DEBATE_SCENARIO_C,
};

export interface MockCompatibilityReport {
  overallScore: number;
  dimensions: Record<string, number>;
  frictionPoint: string;
  topStrengths: string[];
  recommendation: 'strong_match' | 'conditional_match' | 'not_recommended';
}

export const REPORT_MAP: Record<string, MockCompatibilityReport> = {
  match_001: {
    overallScore: 87,
    dimensions: { deen: 95, family: 88, career: 80, finances: 76, kids: 90, conflict: 84, geography: 62, boundaries: 91 },
    frictionPoint: 'Ahmed plans to relocate to UAE within 2 years. You are rooted in Karachi due to your mother. This requires direct conversation in the first meeting.',
    topStrengths: ['Shared deen practice', 'Family-first values', 'Financial discipline'],
    recommendation: 'conditional_match',
  },
  match_002: {
    overallScore: 94,
    dimensions: { deen: 98, family: 100, career: 88, finances: 90, kids: 95, conflict: 89, geography: 100, boundaries: 92 },
    frictionPoint: 'Minor difference in communication style during conflict — Bilal prefers 30-minute cool-down before discussing, you prefer immediate resolution.',
    topStrengths: ['Exceptional deen alignment', 'Identical family values (widowed parent care)', 'Both committed to Karachi long-term'],
    recommendation: 'strong_match',
  },
  match_003: {
    overallScore: 64,
    dimensions: { deen: 58, family: 72, career: 20, finances: 65, kids: 55, conflict: 70, geography: 82, boundaries: 60 },
    frictionPoint: 'DEALBREAKER: Omar expects career withdrawal post-children. This directly conflicts with your stated dealbreaker on professional autonomy.',
    topStrengths: ['Geographic compatibility', 'Similar social circles', 'Family background alignment'],
    recommendation: 'not_recommended',
  },
};

export const MOCK_SLOTS = [
  { slotId: 'slot_1', date: '2026-06-01T11:00:00Z', type: 'Virtual' as const, displayDay: 'Sunday, Jun 1', displayTime: '11:00 AM' },
  { slotId: 'slot_2', date: '2026-06-01T16:00:00Z', type: 'In-Person' as const, location: 'Gloria Jean\'s, F-11 Islamabad', displayDay: 'Sunday, Jun 1', displayTime: '4:00 PM' },
  { slotId: 'slot_3', date: '2026-06-07T10:00:00Z', type: 'Virtual' as const, displayDay: 'Saturday, Jun 7', displayTime: '10:00 AM' },
];

export const MOCK_WALI_PENDING = [
  {
    matchId: 'match_001',
    applicantName: 'Ahmed M.',
    compatibilityScore: 87,
    agentBrief: 'Ahmed comes from a respectable Islamabad family. He holds a BS in Computer Engineering from NUST and works as a senior developer. The Twin negotiation confirmed strong deen alignment and family values. Primary discussion point: his planned UAE relocation requires family discussion.',
    timeAgo: '2 hours ago',
  },
  {
    matchId: 'match_002',
    applicantName: 'Bilal R.',
    compatibilityScore: 94,
    agentBrief: 'Bilal is a practicing doctor from a Karachi family with military background. Both Twins reached 94% compatibility with no dealbreakers. He is deeply committed to Karachi and family-first values. Strongly recommended for first meeting.',
    timeAgo: '5 hours ago',
  },
];
