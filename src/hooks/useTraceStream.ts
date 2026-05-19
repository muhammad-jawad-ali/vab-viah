// useTraceStream — React hook that subscribes to /stream/:flowId and
// maintains an aggregated view of the workplan for the debate UI.
//
// Why this lives in a hook (and not in the screen):
//   - The screen wants a *bucketed* view: a phase label, a per-dimension
//     radar, a list of "decision bubbles" the user can read.
//   - The raw TraceEvent stream is a firehose; reducing it once here means
//     every consumer gets the same view.
//
// Phases are derived from task.started / task.finished events emitted by
// find-matches.workplan.ts: load_user_twin → prescreen_candidates →
// parallel_debates → rank_reports → persist_reports.

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Dimension, TraceEvent } from '../api/types';
import { subscribe, type SseStatus, type StreamErrorPayload } from '../api/sse';

export type DebatePhase =
  | 'connecting'
  | 'reading_profiles'     // load_user_twin / prescreen_candidates
  | 'debating'             // parallel_debates
  | 'ranking'              // rank_reports / persist_reports
  | 'finished'
  | 'error';

const PHASE_FROM_TASK: Record<string, DebatePhase> = {
  load_user_twin: 'reading_profiles',
  prescreen_candidates: 'reading_profiles',
  parallel_debates: 'debating',
  rank_reports: 'ranking',
  persist_reports: 'ranking',
};

export type DecisionBubble = {
  id: string;
  agent: string;
  decision: string;
  rationale: string;
  ts: number;
};

export type DimensionScoreEntry = {
  dimension: Dimension;
  score: number;     // -1..1 raw signed score from backend
  evidence: string;
  ts: number;
};

export type TraceStreamState = {
  status: SseStatus;
  phase: DebatePhase;
  events: TraceEvent[];
  decisions: DecisionBubble[];
  observations: { id: string; agent: string; observation: string; ts: number }[];
  dimensionScores: Partial<Record<Dimension, DimensionScoreEntry>>;
  recoveries: { id: string; reason: string; action: string; ts: number }[];
  toolCalls: { id: string; tool: string; args: unknown; ts: number }[];
  /** outcome payload from workplan.finished, if any */
  outcome: unknown;
  error: string | null;
};

const INITIAL: TraceStreamState = {
  status: 'connecting',
  phase: 'connecting',
  events: [],
  decisions: [],
  observations: [],
  dimensionScores: {},
  recoveries: [],
  toolCalls: [],
  outcome: null,
  error: null,
};

export function useTraceStream(flowId: string | null | undefined): TraceStreamState {
  const [state, setState] = useState<TraceStreamState>(INITIAL);
  const subscribedFlow = useRef<string | null>(null);
  const counterRef = useRef(0);

  useEffect(() => {
    if (!flowId) {
      // flowId cleared by caller (e.g. MatchPool retry). Reset so the next
      // subscription doesn't inherit the old run's `finished` status.
      if (subscribedFlow.current !== null) {
        subscribedFlow.current = null;
        setState(INITIAL);
      }
      return;
    }
    // Guard against React 19 StrictMode double-fire.
    if (subscribedFlow.current === flowId) return;
    subscribedFlow.current = flowId;

    setState(INITIAL);

    const nextId = () => {
      counterRef.current += 1;
      return `e_${counterRef.current}`;
    };

    const unsubscribe = subscribe(flowId, {
      onOpen: () => {
        setState((s) => ({ ...s, status: 'streaming' }));
      },
      onEvent: (ev) => {
        setState((s) => applyEvent(s, ev, nextId));
      },
      onFinished: (outcome) => {
        setState((s) => ({ ...s, status: 'finished', phase: 'finished', outcome }));
      },
      onError: (err) => {
        setState((s) =>
          s.status === 'finished'
            ? s
            : { ...s, status: 'error', phase: 'error', error: err.message }
        );
      },
      onStreamError: (err) => {
        setState((s) => ({ ...s, status: 'error', phase: 'error', error: err.message }));
      },
    });

    return () => {
      unsubscribe();
      subscribedFlow.current = null;
    };
  }, [flowId]);

  return state;
}

function applyEvent(
  s: TraceStreamState,
  ev: TraceEvent,
  nextId: () => string
): TraceStreamState {
  const next: TraceStreamState = { ...s, events: [...s.events, ev] };

  switch (ev.type) {
    case 'workplan.started':
      next.phase = 'reading_profiles';
      return next;
    case 'task.started': {
      const phase = PHASE_FROM_TASK[ev.task];
      if (phase) next.phase = phase;
      return next;
    }
    case 'task.finished':
      // No phase change here — task.started of the next task drives it.
      return next;
    case 'agent.observation':
      next.observations = [
        ...s.observations,
        { id: nextId(), agent: ev.agent, observation: ev.observation, ts: ev.ts },
      ];
      return next;
    case 'agent.decision':
      next.decisions = [
        ...s.decisions,
        {
          id: nextId(),
          agent: ev.agent,
          decision: ev.decision,
          rationale: ev.rationale,
          ts: ev.ts,
        },
      ];
      return next;
    case 'dimension.scored':
      next.dimensionScores = {
        ...s.dimensionScores,
        [ev.dimension]: {
          dimension: ev.dimension,
          score: ev.score,
          evidence: ev.evidence,
          ts: ev.ts,
        },
      };
      return next;
    case 'tool.call':
      next.toolCalls = [
        ...s.toolCalls,
        { id: nextId(), tool: ev.tool, args: ev.args, ts: ev.ts },
      ];
      return next;
    case 'tool.result':
      // Don't bloat state with results; trace timeline keeps the raw event.
      return next;
    case 'recovery':
      next.recoveries = [
        ...s.recoveries,
        { id: nextId(), reason: ev.reason, action: ev.action, ts: ev.ts },
      ];
      return next;
    case 'workplan.finished':
      next.phase = 'finished';
      next.status = 'finished';
      next.outcome = ev.outcome;
      return next;
    case 'agent.message':
      return next;
    default: {
      // Exhaustiveness check — surfaces a compile error if TraceEvent grows.
      const _exhaust: never = ev;
      void _exhaust;
      return next;
    }
  }
}

/** Convenience: useTraceStream consumers often want a sorted dim array. */
export function dimensionScoreList(
  scores: TraceStreamState['dimensionScores']
): DimensionScoreEntry[] {
  return Object.values(scores).filter((v): v is DimensionScoreEntry => !!v);
}

// Phase label for the UI. Keep these short — the debate header is tight.
export const PHASE_LABEL: Record<DebatePhase, string> = {
  connecting: 'Connecting…',
  reading_profiles: 'Reading profiles',
  debating: 'Debating dimensions',
  ranking: 'Reaching verdict',
  finished: 'Verdict reached',
  error: 'Stream interrupted',
};

export const PHASE_INDEX: Record<DebatePhase, number> = {
  connecting: 0,
  reading_profiles: 1,
  debating: 2,
  ranking: 3,
  finished: 4,
  error: 4,
};

export const PHASE_TOTAL = 4;
