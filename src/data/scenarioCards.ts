// 12 scenario cards — mirror of backend/src/content/scenario-cards.ts.
// Frontend only needs id + English text for display. Card IDs MUST match the
// backend; the backend computes dimension contributions from the optionId
// server-side, so we never send anything but {cardId, optionId}.
//
// Source of truth: backend/src/content/scenario-cards.ts. Update both if the
// card set changes.

export type ScenarioOption = {
  id: string;
  label: string;
};

export type ScenarioCard = {
  id: string;
  title: string;
  prompt: string;
  options: ScenarioOption[];
};

export const SCENARIO_CARDS: ScenarioCard[] = [
  {
    id: 'card_salah',
    title: 'Salah on a busy workday',
    prompt:
      'Your spouse has back-to-back meetings and misses Asr. How should the household handle it?',
    options: [
      { id: 'a', label: 'Salah comes first — meetings can be rescheduled' },
      { id: 'b', label: 'Combine Asr with Maghrib when work demands it' },
      { id: 'c', label: 'No judgement either way — qadha later' },
    ],
  },
  {
    id: 'card_inlaws',
    title: 'Living with in-laws',
    prompt: 'After marriage, where should the couple live?',
    options: [
      { id: 'a', label: 'Joint family home — that is the norm' },
      { id: 'b', label: 'Same building, separate floor' },
      { id: 'c', label: 'Separate house, visit often' },
      { id: 'd', label: 'Wherever our careers take us' },
    ],
  },
  {
    id: 'card_spouse_working',
    title: 'Working after kids',
    prompt: 'After the first child, do you expect your spouse to continue working?',
    options: [
      { id: 'a', label: 'Of course — career is non-negotiable' },
      { id: 'b', label: 'Part-time / flexible until kids start school' },
      { id: 'c', label: 'Prefer they focus on home' },
    ],
  },
  {
    id: 'card_lifestyle',
    title: 'Lifestyle aspirations',
    prompt: 'Pick the household lifestyle that matches your ideal:',
    options: [
      { id: 'a', label: 'Simple — save aggressively, invest in family' },
      { id: 'b', label: 'Comfortable — own a home, annual umrah, kids in good school' },
      { id: 'c', label: 'Aspirational — DHA/Bahria, international travel, premium brands' },
    ],
  },
  {
    id: 'card_kids_timing',
    title: 'When to have kids',
    prompt: 'When do you envision your first child?',
    options: [
      { id: 'a', label: 'Within the first year' },
      { id: 'b', label: '2–3 years in' },
      { id: 'c', label: '5+ years, after we are financially set' },
      { id: 'd', label: 'Open to no kids' },
    ],
  },
  {
    id: 'card_conflict',
    title: 'When you disagree',
    prompt: 'A serious disagreement about money. What is your default move?',
    options: [
      { id: 'a', label: 'Talk it out same night' },
      { id: 'b', label: 'Cool off, then revisit' },
      { id: 'c', label: 'Ask elders to mediate' },
      { id: 'd', label: 'Avoid the topic for a while' },
    ],
  },
  {
    id: 'card_geography',
    title: 'Where you see life in 10 years',
    prompt: 'In 10 years, where do you see the family living?',
    options: [
      { id: 'a', label: 'Same city — roots matter' },
      { id: 'b', label: 'Different Pakistani city for opportunity' },
      { id: 'c', label: 'Gulf / Middle East' },
      { id: 'd', label: 'UK / North America' },
    ],
  },
  {
    id: 'card_appearance',
    title: 'Deen and appearance',
    prompt: 'For your spouse, what would you expect in terms of hijab / beard?',
    options: [
      { id: 'a', label: 'Full observance from day one' },
      { id: 'b', label: 'Practicing but flexible — let it grow' },
      { id: 'c', label: 'Up to them — I do not impose' },
      { id: 'd', label: 'Prefer modern dress, no expectations' },
    ],
  },
  {
    id: 'card_parents_care',
    title: 'Aging parents',
    prompt: 'A parent needs daily care. What does your household do?',
    options: [
      { id: 'a', label: 'They move in with us' },
      { id: 'b', label: 'We move closer to them' },
      { id: 'c', label: 'Hired help + frequent visits' },
      { id: 'd', label: 'Siblings share the load' },
    ],
  },
  {
    id: 'card_ambition',
    title: 'Spouse ambition',
    prompt: 'Which describes the spouse you want?',
    options: [
      { id: 'a', label: 'High-achiever — top of their field' },
      { id: 'b', label: 'Stable career, predictable life' },
      { id: 'c', label: 'Family-focused, career secondary' },
    ],
  },
  {
    id: 'card_finances_split',
    title: 'Money in the household',
    prompt: 'How should household money be structured?',
    options: [
      { id: 'a', label: 'One joint account, full transparency' },
      { id: 'b', label: 'Husband handles primary, wife has discretion' },
      { id: 'c', label: 'Both contribute proportional to income' },
      { id: 'd', label: 'Separate finances, agreed shared bills' },
    ],
  },
  {
    id: 'card_past',
    title: 'Past relationships',
    prompt:
      'A match has a public past relationship that ended cleanly. How does this land?',
    options: [
      { id: 'a', label: 'Not a problem if they are honest' },
      { id: 'b', label: 'I would want to understand context first' },
      { id: 'c', label: 'Prefer no prior relationships' },
      { id: 'd', label: 'Absolute dealbreaker' },
    ],
  },
];

export const TOTAL_CARDS = SCENARIO_CARDS.length;

export function getCard(cardId: string): ScenarioCard | undefined {
  return SCENARIO_CARDS.find((c) => c.id === cardId);
}

export function nextUnansweredCard(answeredIds: string[]): ScenarioCard | null {
  const card = SCENARIO_CARDS.find((c) => !answeredIds.includes(c.id));
  return card ?? null;
}
