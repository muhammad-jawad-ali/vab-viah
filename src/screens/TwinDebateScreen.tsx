// TwinDebateScreen — live phased visualization of a find_matches workplan.
//
// Inputs (route params): flowId, candidateTwinId, displayName.
//
// What the user sees:
//   1. Phase rail at the top: Reading profiles → Debating dimensions →
//      Reaching verdict → Final report. Active phase highlights as
//      task.started events flow in.
//   2. Live dimension grid: 8 cells (one per dimension). Each cell fills with
//      a signed score bar (-1..1) when its `dimension.scored` event arrives.
//      Only scores for the user's specific debate (this candidate) matter for
//      display, but the workplan emits 5 parallel debates; we filter by
//      observation messages containing the displayName as a heuristic and
//      otherwise show *latest* per dim.
//   3. Decision bubbles: typewriter-reveal text rendered in batches as
//      agent.decision events arrive. Anchored to the bottom so the most
//      recent decision is always visible.
//   4. Verdict CTA: when workplan.finished arrives, a celebratory button
//      pushes the user to CompatibilityReport.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { DiscoverStackParamList } from '../navigation/types';
import {
  DIMENSIONS,
  DIMENSION_LABELS,
  type Dimension,
  type StoredReport,
} from '../api/types';
import {
  useTraceStream,
  PHASE_LABEL,
  PHASE_INDEX,
  PHASE_TOTAL,
  type DecisionBubble,
  type DebatePhase,
} from '../hooks/useTraceStream';
import { useAppStore } from '../store/useAppStore';

type Props = {
  navigation: NativeStackNavigationProp<DiscoverStackParamList, 'TwinDebate'>;
  route: RouteProp<DiscoverStackParamList, 'TwinDebate'>;
};

const PHASES: DebatePhase[] = [
  'reading_profiles',
  'debating',
  'ranking',
  'finished',
];

export const TwinDebateScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const { flowId, candidateTwinId, displayName } = route.params;
  const trace = useTraceStream(flowId);
  const scrollRef = useRef<ScrollView>(null);

  // find_matches workplan emits ONE trace covering all 5 debates. After
  // workplan.finished the SSE bus is closed and re-subscribing returns
  // {type:'error', message:'Unknown flowId'} — so the SECOND time a user
  // considers a candidate we render a replay-unavailable variant from the
  // cached report rather than hanging on "Connecting".
  const cachedReport: StoredReport | undefined = useAppStore(
    (s) => s.reportsByFlow[flowId]?.find((r) => r.candidate_twin_id === candidateTwinId)
  );
  const replayUnavailable =
    trace.status === 'error' && cachedReport !== undefined;

  // Auto-scroll the decision feed on each new bubble.
  useEffect(() => {
    if (trace.decisions.length === 0) return;
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [trace.decisions.length]);

  // Convert cached per-dim scores (0..1, no sign) into the live scoreboard's
  // signed shape so the DimensionGrid renders the same way.
  const scoresForGrid: Partial<Record<Dimension, { score: number; evidence: string }>> = replayUnavailable
    ? Object.fromEntries(
        DIMENSIONS.map((d) => {
          const row = cachedReport.dimension_scores[d];
          if (!row) return [d, undefined];
          // Backend's persisted dimension_scores are 0..1 (positive). Recenter
          // around 0 so DimensionCell's signed bar shows a meaningful tilt:
          // score>=0.5 reads as positive, score<0.5 as negative.
          const signed = (row.score - 0.5) * 2;
          return [d, { score: signed, evidence: row.evidence }];
        }).filter((e): e is [Dimension, { score: number; evidence: string }] => e[1] !== undefined)
      )
    : trace.dimensionScores;

  const headerStatusLabel =
    replayUnavailable
      ? 'Verdict reached'
      : trace.status === 'connecting'
        ? 'Connecting'
        : trace.status === 'streaming'
          ? 'Live'
          : trace.status === 'finished'
            ? 'Verdict reached'
            : 'Stream errored';

  const showVerdictCta = trace.status === 'finished' || replayUnavailable;

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background">
      {/* AG-Trace */}
      <View className="bg-emerald-950/5 border-b border-emerald-900/10 px-4 py-2 flex-row items-center">
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor:
              trace.status === 'finished'
                ? '#059669'
                : trace.status === 'error'
                  ? '#dc2626'
                  : '#f59e0b',
            marginRight: 8,
          }}
        />
        <Text
          className="text-emerald-800 font-mono text-[9px] uppercase tracking-widest flex-1"
          numberOfLines={1}
        >
          AG-TRACE // FLOW {flowId.slice(0, 18)}… · {trace.events.length} EVENTS
        </Text>
      </View>

      {/* Header */}
      <View className="px-5 py-3 border-b border-slate-200/80">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1 mr-3">
            <Text className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
              Twin Debate
            </Text>
            <Text
              className="text-slate-900 font-serif font-bold text-lg"
              numberOfLines={1}
            >
              {displayName}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-slate-400 text-[9px] uppercase tracking-widest font-bold">
              Status
            </Text>
            <Text
              className={`font-bold text-xs ${
                replayUnavailable || trace.status === 'finished'
                  ? 'text-emerald-700'
                  : trace.status === 'error'
                    ? 'text-rose-600'
                    : 'text-amber-600'
              }`}
            >
              {headerStatusLabel}
            </Text>
          </View>
        </View>

        {replayUnavailable ? (
          <View className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
            <Text className="text-emerald-800 font-bold text-[10px] uppercase tracking-widest mb-0.5">
              ✓ Debate complete — live replay unavailable
            </Text>
            <Text className="text-emerald-800/80 text-[11px] leading-relaxed">
              The Twin debate for this candidate already concluded. The
              dimension scoreboard below is from the persisted report.
            </Text>
          </View>
        ) : (
          <PhaseRail phase={trace.phase} />
        )}
      </View>

      {/* Body */}
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {trace.status === 'error' && !replayUnavailable ? (
          <ErrorBlock error={trace.error ?? 'Stream errored'} />
        ) : null}

        <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.25em] mb-3">
          Dimension Scoreboard
        </Text>
        <DimensionGrid scores={scoresForGrid} />

        {replayUnavailable ? null : (
          <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.25em] mt-7 mb-3">
            AI Reasoning Stream
          </Text>
        )}
        {replayUnavailable ? null : trace.decisions.length === 0 && trace.observations.length === 0 ? (
          <View className="bg-surface border border-slate-200 rounded-2xl p-5 items-center">
            <Text className="text-slate-500 text-xs text-center">
              Waiting for the workplan to emit its first decision…
            </Text>
          </View>
        ) : (
          <>
            {trace.decisions.map((d, i) => (
              <DecisionCard key={d.id} bubble={d} index={i} />
            ))}
            {trace.recoveries.length > 0 ? (
              <View className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 mt-2">
                <Text className="text-amber-800 text-[10px] font-bold uppercase tracking-widest mb-1">
                  ⚠ {trace.recoveries.length} recovery
                  {trace.recoveries.length === 1 ? '' : 'ies'}
                </Text>
                {trace.recoveries.slice(-2).map((r) => (
                  <Text key={r.id} className="text-amber-800/80 text-[11px] leading-relaxed">
                    {r.action}
                  </Text>
                ))}
              </View>
            ) : null}
          </>
        )}

        {/* Collapsible tool-call log */}
        {replayUnavailable ? null : <ToolCallSection toolCalls={trace.toolCalls} />}
      </ScrollView>

      {/* Verdict CTA */}
      {showVerdictCta ? (
        <View
          className="px-5 pt-3 border-t border-slate-200/80 bg-background"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-3">
            <Text className="text-emerald-800 font-bold text-[10px] uppercase tracking-widest text-center">
              {replayUnavailable
                ? '✓ Verdict reached (replay unavailable)'
                : `✓ Verdict reached — ${trace.events.length} trace events`}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('CompatibilityReport', {
                flowId,
                candidateTwinId,
                displayName,
              })
            }
            className="bg-primary py-4 rounded-2xl items-center shadow-lg shadow-primary/20"
          >
            <Text className="text-surface font-bold text-xs tracking-widest uppercase">
              View Compatibility Report →
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Phase rail — 4 segments with the active one filled.
// ---------------------------------------------------------------------------

const PhaseRail = ({ phase }: { phase: DebatePhase }) => {
  const activeIdx = PHASE_INDEX[phase];
  return (
    <View>
      <View className="flex-row gap-1.5">
        {PHASES.map((p, i) => {
          const active = i <= activeIdx - 1;
          const current = i === activeIdx - 1;
          return (
            <View
              key={p}
              className={`flex-1 h-1.5 rounded-full ${
                active
                  ? current
                    ? 'bg-primary'
                    : 'bg-primary/80'
                  : 'bg-slate-200'
              }`}
            />
          );
        })}
      </View>
      <View className="flex-row justify-between mt-2">
        <Text
          className={`text-[10px] font-bold uppercase tracking-widest ${
            phase === 'error' ? 'text-rose-600' : 'text-primary'
          }`}
        >
          {PHASE_LABEL[phase]}
        </Text>
        <Text className="text-slate-400 text-[10px] uppercase tracking-widest">
          Step {Math.max(1, Math.min(PHASE_TOTAL, activeIdx))}/{PHASE_TOTAL}
        </Text>
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Dimension grid — 8 cells, score fills in as events arrive.
// ---------------------------------------------------------------------------

const DimensionGrid = ({
  scores,
}: {
  scores: Partial<Record<Dimension, { score: number; evidence: string }>>;
}) => {
  return (
    <View className="bg-surface border border-slate-200 rounded-2xl p-4">
      <View className="flex-row flex-wrap -m-1">
        {DIMENSIONS.map((dim) => {
          const entry = scores[dim];
          return (
            <View key={dim} className="w-1/2 p-1">
              <DimensionCell dim={dim} score={entry?.score} evidence={entry?.evidence} />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const DimensionCell = ({
  dim,
  score,
  evidence,
}: {
  dim: Dimension;
  score: number | undefined;
  evidence: string | undefined;
}) => {
  // Backend dimension.scored emits score in [-1, 1]. Map to a 0-100% fill for
  // the bar but keep the sign for tone.
  const width = useRef(new Animated.Value(0)).current;
  const targetPct = score === undefined ? 0 : Math.round(Math.abs(score) * 100);
  const positive = (score ?? 0) >= 0;

  useEffect(() => {
    if (score === undefined) return;
    Animated.timing(width, {
      toValue: targetPct,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [score, targetPct]);

  const fillColor =
    score === undefined
      ? '#e2e8f0'
      : positive
        ? '#10b981'
        : '#f97316';
  const labelColor = score === undefined ? '#94a3b8' : '#0f172a';

  return (
    <View className="bg-slate-50/60 border border-slate-200/80 rounded-xl px-3 py-2.5">
      <View className="flex-row justify-between items-center mb-1.5">
        <Text
          style={{ color: labelColor }}
          className="text-[10px] font-bold uppercase tracking-wider"
        >
          {DIMENSION_LABELS[dim]}
        </Text>
        <Text
          style={{ color: fillColor }}
          className="font-mono text-[11px] font-bold"
        >
          {score === undefined ? '—' : `${positive ? '+' : '−'}${targetPct}`}
        </Text>
      </View>
      <View className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <Animated.View
          style={{
            width: width.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            backgroundColor: fillColor,
          }}
          className="h-full rounded-full"
        />
      </View>
      {evidence ? (
        <Text className="text-slate-500 text-[10px] mt-1.5 leading-tight" numberOfLines={2}>
          {evidence}
        </Text>
      ) : null}
    </View>
  );
};

// ---------------------------------------------------------------------------
// DecisionCard — typewriter-reveal bubble for agent.decision events.
// ---------------------------------------------------------------------------

const DecisionCard = ({
  bubble,
  index,
}: {
  bubble: DecisionBubble;
  index: number;
}) => {
  const fade = useRef(new Animated.Value(0)).current;
  const [typed, setTyped] = useState('');
  const text = bubble.rationale || bubble.decision;
  const TYPE_INTERVAL = 18; // ms per character — fast but readable

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, TYPE_INTERVAL);
    return () => clearInterval(id);
  }, [text]);

  const tone =
    bubble.agent === 'moderator'
      ? 'bg-emerald-50 border-emerald-100'
      : bubble.agent === 'user_twin'
        ? 'bg-primary/10 border-primary/20'
        : bubble.agent === 'candidate_twin'
          ? 'bg-amber-50 border-amber-200'
          : 'bg-surface border-slate-200';

  return (
    <Animated.View style={{ opacity: fade }} className={`${tone} border rounded-2xl p-4 mb-3`}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          {labelForAgent(bubble.agent)}
        </Text>
        <Text className="text-slate-400 text-[9px] font-mono">#{index + 1}</Text>
      </View>
      <Text className="text-slate-800 font-bold text-sm mb-1.5 leading-snug">
        {bubble.decision}
      </Text>
      <Text className="text-slate-600 text-xs leading-relaxed">{typed}</Text>
    </Animated.View>
  );
};

function labelForAgent(agent: string): string {
  switch (agent) {
    case 'moderator':
      return '⚖ Moderator';
    case 'user_twin':
      return '👤 Your Twin';
    case 'candidate_twin':
      return '👥 Their Twin';
    case 'workplan':
      return '🧠 Workplan';
    case 'onboarding':
      return '✨ Onboarding';
    default:
      return agent;
  }
}

// ---------------------------------------------------------------------------
// Tool call section — collapsed by default to keep the timeline non-noisy.
// ---------------------------------------------------------------------------

const ToolCallSection = ({
  toolCalls,
}: {
  toolCalls: { id: string; tool: string; args: unknown; ts: number }[];
}) => {
  const [open, setOpen] = useState(false);
  if (toolCalls.length === 0) return null;
  return (
    <View className="mt-6">
      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="flex-row items-center justify-between bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-2.5"
      >
        <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          🔧 {toolCalls.length} tool call{toolCalls.length === 1 ? '' : 's'}
        </Text>
        <Text className="text-slate-500 text-xs">{open ? '▾' : '▸'}</Text>
      </Pressable>
      {open ? (
        <View className="bg-slate-50 border border-t-0 border-slate-200 rounded-b-xl p-3 -mt-1.5">
          {toolCalls.map((t) => (
            <View key={t.id} className="mb-2 last:mb-0">
              <Text className="text-slate-700 text-[11px] font-mono font-bold">
                {t.tool}
              </Text>
              <Text className="text-slate-500 text-[10px] font-mono mt-0.5" numberOfLines={2}>
                {summarizeArgs(t.args)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

function summarizeArgs(args: unknown): string {
  try {
    return typeof args === 'string' ? args : JSON.stringify(args).slice(0, 120);
  } catch {
    return '<unserializable>';
  }
}

const ErrorBlock = ({ error }: { error: string }) => (
  <View className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-4">
    <Text className="text-rose-700 font-bold text-[10px] uppercase tracking-widest mb-1">
      Stream interrupted
    </Text>
    <Text className="text-rose-700/80 text-xs leading-relaxed">{error}</Text>
  </View>
);
