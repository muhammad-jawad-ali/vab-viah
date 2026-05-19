// MatchPoolScreen — real /match/request → SSE → /match/results pipeline,
// rendered as a Tinder-style swipeable deck.
//
// Strategy:
//   1. On mount, POST /match/request → {flowId}. Cache the flowId in a
//      React Query mutation result so a relaunch doesn't re-trigger the
//      Gemini workplan (which is expensive — ~30-45s of debates).
//   2. Subscribe to /stream/:flowId via useTraceStream. When phase hits
//      'finished', flip a flag.
//   3. Once finished, GET /match/results/:flowId and render the deck.
//      Hard-cap to top 10 candidates for the swipe UX.
//   4. Right swipe → navigate to TwinDebate carrying flowId + candidateTwinId.
//      Left swipe → dismiss locally (backend has no skip endpoint).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { DiscoverStackParamList } from '../navigation/types';
import { api } from '../api/client';
import { ApiError } from '../api/types';
import {
  toFrontendMatch,
  type FrontendMatch,
  type StoredReport,
} from '../api/types';
import * as Haptics from 'expo-haptics';
import { useTraceStream, PHASE_LABEL } from '../hooks/useTraceStream';
import { useAppStore } from '../store/useAppStore';
import { Skeleton } from '../components/Skeleton';

const lightHaptic = () => {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

type Props = {
  navigation: NativeStackNavigationProp<DiscoverStackParamList, 'MatchPool'>;
};

const SWIPE_THRESHOLD = 110;
const ROTATION_RANGE = 8;
const DECK_CAP = 10;

const ScoreBadge = ({ score }: { score: number }) => {
  const color = score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#dc2626';
  return (
    <View
      style={{ backgroundColor: color + '22', borderColor: color + '60' }}
      className="px-3 py-1 rounded-full border"
    >
      <Text style={{ color }} className="font-mono font-bold text-sm">
        {score}%
      </Text>
    </View>
  );
};

const Pill = ({ label, tone }: { label: string; tone: 'ok' | 'warn' | 'danger' }) => {
  const cls =
    tone === 'ok'
      ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
      : tone === 'warn'
        ? 'bg-amber-50 border-amber-200 text-amber-800'
        : 'bg-rose-50 border-rose-200 text-rose-800';
  const parts = cls.split(' ');
  return (
    <View className={`${parts[0]} ${parts[1]} border px-2 py-1 rounded-md`}>
      <Text
        className={`${parts[2]} text-[10px] font-bold uppercase tracking-wider`}
      >
        {label}
      </Text>
    </View>
  );
};

// One card in the deck. Top card is interactive; cards below render static.
const DeckCard = ({
  match,
  isTop,
  zIndex,
  offset,
  onSwipeRight,
  onSwipeLeft,
  width,
}: {
  match: FrontendMatch;
  isTop: boolean;
  zIndex: number;
  offset: number;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  width: number;
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const rotate = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: [`-${ROTATION_RANGE}deg`, '0deg', `${ROTATION_RANGE}deg`],
  });
  const likeOpacity = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const passOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Refs mirror props so the long-lived PanResponder callbacks read live
  // values instead of stale ones from the responder's creation closure.
  // Without this, only the first card is interactive — once it swipes off
  // and card #2 becomes the top, its responder still sees isTop=false.
  const isTopRef = useRef(isTop);
  isTopRef.current = isTop;
  const onSwipeRightRef = useRef(onSwipeRight);
  onSwipeRightRef.current = onSwipeRight;
  const onSwipeLeftRef = useRef(onSwipeLeft);
  onSwipeLeftRef.current = onSwipeLeft;

  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        isTopRef.current && (Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6),
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_THRESHOLD) {
          lightHaptic();
          Animated.timing(pan, {
            toValue: { x: width + 80, y: g.dy },
            duration: 220,
            useNativeDriver: false,
          }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            onSwipeRightRef.current();
          });
        } else if (g.dx < -SWIPE_THRESHOLD) {
          lightHaptic();
          Animated.timing(pan, {
            toValue: { x: -width - 80, y: g.dy },
            duration: 220,
            useNativeDriver: false,
          }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            onSwipeLeftRef.current();
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            friction: 6,
          }).start();
        }
      },
    })
  ).current;

  const cardStyle = isTop
    ? {
        transform: [
          { translateX: pan.x },
          { translateY: pan.y },
          { rotate },
        ],
        zIndex,
      }
    : {
        transform: [
          { translateY: offset },
          { scale: 1 - offset / 220 },
        ],
        zIndex,
      };

  const dealbreaker = match.dealbreakersHit.length > 0;
  const recPill: { label: string; tone: 'ok' | 'warn' | 'danger' } =
    match.recommendation === 'strong_match'
      ? { label: 'Strong Match', tone: 'ok' }
      : match.recommendation === 'conditional_match'
        ? { label: 'Conditional', tone: 'warn' }
        : { label: 'Not Recommended', tone: 'danger' };

  return (
    <Animated.View
      {...(isTop ? responder.panHandlers : {})}
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
        },
        cardStyle,
      ]}
    >
      <View className="bg-surface rounded-[28px] p-5 border border-slate-200 shadow-md">
        {/* Like / Pass overlays — only meaningful on the top card */}
        {isTop && (
          <>
            <Animated.View
              pointerEvents="none"
              style={{ opacity: likeOpacity }}
              className="absolute top-6 left-6 z-10"
            >
              <View className="border-4 border-emerald-500 px-3 py-1 rounded-lg rotate-[-12deg]">
                <Text className="text-emerald-500 font-extrabold text-lg tracking-widest">
                  CONSIDER
                </Text>
              </View>
            </Animated.View>
            <Animated.View
              pointerEvents="none"
              style={{ opacity: passOpacity }}
              className="absolute top-6 right-6 z-10"
            >
              <View className="border-4 border-rose-500 px-3 py-1 rounded-lg rotate-[12deg]">
                <Text className="text-rose-500 font-extrabold text-lg tracking-widest">
                  PASS
                </Text>
              </View>
            </Animated.View>
          </>
        )}

        <View className="flex-row items-center mb-4">
          <View className="w-20 h-20 rounded-2xl overflow-hidden mr-4 border border-slate-200/80 bg-slate-100">
            <Image
              source={{ uri: match.blurAvatarUrl }}
              className="w-full h-full"
              blurRadius={14}
            />
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-xl">🔒</Text>
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-slate-900 font-serif font-bold text-xl">
              {match.displayName}
            </Text>
            <View className="flex-row items-center gap-2 mt-1.5">
              <ScoreBadge score={match.compatibilityScore} />
              <Pill label={recPill.label} tone={recPill.tone} />
            </View>
          </View>
        </View>

        {match.topStrength ? (
          <View className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 mb-2.5">
            <Text className="text-emerald-700 text-[9px] font-bold uppercase tracking-widest mb-1">
              ✓ Top Strength
            </Text>
            <Text className="text-emerald-900 text-xs leading-relaxed" numberOfLines={2}>
              {match.topStrength}
            </Text>
          </View>
        ) : null}

        {match.topFriction ? (
          <View
            className={`${dealbreaker ? 'bg-rose-50/60 border-rose-200' : 'bg-amber-50/60 border-amber-200'} border rounded-xl p-3 mb-2.5`}
          >
            <Text
              className={`${dealbreaker ? 'text-rose-700' : 'text-amber-700'} text-[9px] font-bold uppercase tracking-widest mb-1`}
            >
              {dealbreaker ? '🚫 Dealbreaker' : '⚠ Friction'}
            </Text>
            <Text
              className={`${dealbreaker ? 'text-rose-900' : 'text-amber-900'} text-xs leading-relaxed`}
              numberOfLines={2}
            >
              {match.topFriction}
            </Text>
          </View>
        ) : null}

        <Text className="text-slate-400 text-[10px] uppercase tracking-widest text-center mt-2">
          Swipe right to view live debate · left to pass
        </Text>
      </View>
    </Animated.View>
  );
};

export const MatchPoolScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { isPremium } = useAppStore();
  const viewedCount = useRef(0);

  const [flowId, setFlowId] = useState<string | null>(null);
  const [reports, setReports] = useState<StoredReport[] | null>(null);
  const [requestErr, setRequestErr] = useState<string | null>(null);
  const [resultsErr, setResultsErr] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // React 19 strict-mode gate — POST /match/request must fire exactly once.
  const requestFired = useRef(false);

  const trace = useTraceStream(flowId);
  const setReportsForFlow = useAppStore((s) => s.setReportsForFlow);

  // Kick /match/request and update flowId. Called from the initial mount
  // effect AND from "Run New Match" retry — having a stand-alone function
  // (instead of relying on the mount effect's empty-deps useEffect) is what
  // lets retry actually re-fire the workplan.
  const kickoffMatchRequest = React.useCallback(() => {
    if (requestFired.current) return;
    requestFired.current = true;

    (async () => {
      try {
        const res = await api.match.request();
        setFlowId(res.flowId);
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? `${err.code}: ${err.message}`
            : err instanceof Error
              ? err.message
              : 'Could not request matches.';
        setRequestErr(msg);
        // Reset gate so a Retry can fire again.
        requestFired.current = false;
      }
    })();
  }, []);

  // Step 1: kick the workplan on mount.
  useEffect(() => {
    kickoffMatchRequest();
  }, [kickoffMatchRequest]);

  // Step 2: when SSE finishes, fetch results.
  useEffect(() => {
    if (!flowId) return;
    if (trace.status !== 'finished') return;
    if (reports !== null) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await api.match.results(flowId);
        if (cancelled) return;
        const all = res.allDebated ?? [];
        setReports(all);
        // Cache by flowId so TwinDebate can render a replay-unavailable view
        // for subsequent considers (the workplan bus is gone after finish).
        setReportsForFlow(flowId, all);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof ApiError ? err.message : 'Could not load results.';
        setResultsErr(msg);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [flowId, trace.status, reports, setReportsForFlow]);

  // Reset viewed count when the screen regains focus (paywall flow).
  useFocusEffect(
    React.useCallback(() => {
      viewedCount.current = 0;
    }, [])
  );

  const matches: FrontendMatch[] = useMemo(() => {
    if (!reports) return [];
    return reports
      .slice(0, DECK_CAP)
      .map(toFrontendMatch)
      .filter((m) => !dismissedIds.has(m.candidateTwinId));
  }, [reports, dismissedIds]);

  const handleConsider = (match: FrontendMatch) => {
    if (!flowId) return;
    viewedCount.current += 1;
    if (!isPremium && viewedCount.current > 3) {
      navigation.navigate('Paywall');
      return;
    }
    navigation.navigate('TwinDebate', {
      flowId,
      candidateTwinId: match.candidateTwinId,
      displayName: match.displayName,
    });
  };

  const handlePass = (match: FrontendMatch) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(match.candidateTwinId);
      return next;
    });
  };

  const handleRetry = () => {
    setRequestErr(null);
    setFlowId(null);
    setReports(null);
    setResultsErr(null);
    setDismissedIds(new Set());
    requestFired.current = false;
    // Re-fire the workplan directly — the mount useEffect won't run again,
    // and useTraceStream resets itself on the flowId=null transition above.
    kickoffMatchRequest();
  };

  const phaseLabel = PHASE_LABEL[trace.phase];
  const isLoading = !reports && !requestErr && !resultsErr;
  const visibleStack = matches.slice(0, 3);

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background">
      {/* AG-Trace strip */}
      <View className="bg-emerald-950/5 border-b border-emerald-900/10 px-4 py-2 flex-row items-center">
        <View
          className={`w-2 h-2 rounded-full mr-2 ${
            trace.status === 'finished'
              ? 'bg-emerald-600'
              : trace.status === 'error'
                ? 'bg-rose-500'
                : 'bg-amber-500'
          }`}
        />
        <Text
          className="text-emerald-800 font-mono text-[9px] uppercase tracking-widest flex-1"
          numberOfLines={1}
        >
          AG-TRACE // {phaseLabel.toUpperCase()}
          {trace.dimensionScores
            ? ` · ${Object.keys(trace.dimensionScores).length}/8 DIMS`
            : ''}
        </Text>
      </View>

      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-primary font-bold text-[10px] uppercase tracking-[0.25em] mb-1">
              Discovery
            </Text>
            <Text className="text-slate-900 font-serif text-3xl font-bold">
              Match Pool
            </Text>
          </View>
          {reports ? (
            <View className="bg-primary/5 px-4 py-2 rounded-full border border-primary/20">
              <Text className="text-primary font-bold text-xs">
                {matches.length} CARDS
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Body */}
      {isLoading ? (
        <LoadingState
          phase={phaseLabel}
          decisions={trace.decisions.length}
          dimsScored={Object.keys(trace.dimensionScores).length}
        />
      ) : requestErr || resultsErr ? (
        <ErrorState
          message={requestErr ?? resultsErr ?? 'Unknown error'}
          onRetry={handleRetry}
        />
      ) : matches.length === 0 ? (
        <EmptyState onRetry={handleRetry} />
      ) : (
        <View className="flex-1 px-5 pt-2">
          <View
            style={{ height: 380 }}
            className="relative"
          >
            {visibleStack
              .map((match, idx) => (
                <DeckCard
                  key={match.candidateTwinId}
                  match={match}
                  isTop={idx === 0}
                  zIndex={visibleStack.length - idx}
                  offset={idx * 8}
                  width={screenWidth - 40}
                  onSwipeRight={() => handleConsider(match)}
                  onSwipeLeft={() => handlePass(match)}
                />
              ))
              // Stacked cards render bottom-first so the top is on top.
              .reverse()}
          </View>

          {/* Manual action buttons (accessibility + non-gesture fallback) */}
          {matches[0] ? (
            <View className="flex-row justify-center items-center gap-6 mt-6">
              <TouchableOpacity
                onPress={() => {
                  lightHaptic();
                  handlePass(matches[0]!);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Pass on ${matches[0]!.displayName}`}
                className="bg-surface border border-rose-200 w-16 h-16 rounded-full items-center justify-center shadow-sm"
              >
                <Text className="text-rose-600 text-2xl">✕</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  lightHaptic();
                  handleConsider(matches[0]!);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Consider ${matches[0]!.displayName} — view live Twin debate`}
                className="bg-primary w-20 h-20 rounded-full items-center justify-center shadow-lg shadow-primary/30"
              >
                <Text className="text-surface text-2xl font-bold">→</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Footer baseline note */}
          <View className="bg-amber-50 border border-amber-200/60 rounded-2xl p-3 mt-6 mb-4">
            <Text className="text-amber-800 font-bold text-[10px] uppercase tracking-wider mb-1">
              🔬 Agentic vs Baseline
            </Text>
            <Text className="text-amber-700/90 text-[11px] leading-relaxed">
              Without Twin debate, a heuristic ranker would surface candidates
              purely on vector similarity. The agentic flow uncovered{' '}
              {reports?.filter((r) => r.dealbreakers_hit.length).length ?? 0}{' '}
              dealbreaker conflict
              {(reports?.filter((r) => r.dealbreakers_hit.length).length ?? 0) === 1
                ? ''
                : 's'}{' '}
              hidden inside surface compatibility.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

// ---------------------------------------------------------------------------
// State helpers
// ---------------------------------------------------------------------------

const LoadingState = ({
  phase,
  decisions,
  dimsScored,
}: {
  phase: string;
  decisions: number;
  dimsScored: number;
}) => (
  <View className="flex-1 px-5 pt-2">
    {/* Deck-shaped skeleton — 3 stacked rounded rects */}
    <View style={{ height: 380 }} className="relative">
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: i * 8,
            transform: [{ scale: 1 - i * 0.04 }],
            opacity: 1 - i * 0.25,
            zIndex: 3 - i,
          }}
        >
          <View className="bg-surface rounded-[28px] p-5 border border-slate-200">
            <View className="flex-row items-center mb-4">
              <Skeleton width={80} height={80} rounded={16} />
              <View className="flex-1 ml-4">
                <Skeleton width="70%" height={18} />
                <View style={{ height: 8 }} />
                <View className="flex-row">
                  <Skeleton width={60} height={20} rounded={999} />
                  <View style={{ width: 8 }} />
                  <Skeleton width={90} height={20} rounded={999} />
                </View>
              </View>
            </View>
            <Skeleton height={56} rounded={12} />
            <View style={{ height: 10 }} />
            <Skeleton height={56} rounded={12} />
          </View>
        </View>
      ))}
    </View>

    {/* Live phase + decision/dim counter */}
    <View className="bg-surface border border-slate-200 rounded-2xl px-5 py-4 mt-6 mx-2">
      <View className="flex-row items-center justify-center mb-2">
        <ActivityIndicator size="small" color="#059669" />
        <Text className="text-slate-900 font-serif text-base ml-3">
          Running Twin debates
        </Text>
      </View>
      <Text className="text-primary font-mono text-[10px] uppercase tracking-widest text-center mt-1">
        {phase}
      </Text>
      <Text className="text-slate-500 text-[11px] mt-1.5 text-center">
        {decisions} decisions · {dimsScored}/8 dimensions scored
      </Text>
    </View>
  </View>
);

const ErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <View className="flex-1 items-center justify-center px-8">
    <View className="w-20 h-20 rounded-full bg-rose-50 border border-rose-200 items-center justify-center mb-5">
      <Text className="text-4xl">⚠️</Text>
    </View>
    <Text className="text-rose-700 font-serif text-h2 mb-2 text-center">
      Couldn't load matches
    </Text>
    <View className="bg-rose-50/60 border border-rose-200 rounded-2xl px-4 py-3 mb-6 w-full">
      <Text className="text-rose-700 text-[11px] text-center leading-relaxed">
        {message}
      </Text>
    </View>
    <Pressable
      onPress={onRetry}
      accessibilityRole="button"
      accessibilityLabel="Retry loading matches"
      className="bg-primary px-6 py-3 rounded-full active:opacity-80"
    >
      <Text className="text-surface font-bold text-xs uppercase tracking-widest">
        Try Again
      </Text>
    </Pressable>
  </View>
);

const EmptyState = ({ onRetry }: { onRetry: () => void }) => (
  <View className="flex-1 items-center justify-center px-8">
    <View
      className="w-20 h-20 rounded-full bg-saffron/10 border border-saffron/30 items-center justify-center mb-5"
    >
      <Text className="text-4xl">✨</Text>
    </View>
    <Text className="text-slate-900 font-serif text-h2 mb-2 text-center">
      No more candidates
    </Text>
    <Text className="text-slate-500 text-sm text-center mb-6 leading-relaxed">
      You've reviewed everyone in this batch. Run a fresh debate to surface
      new candidates.
    </Text>
    <Pressable
      onPress={onRetry}
      accessibilityRole="button"
      accessibilityLabel="Run a new match request"
      className="bg-primary px-6 py-3 rounded-full active:opacity-80"
    >
      <Text className="text-surface font-bold text-xs uppercase tracking-widest">
        Run New Match
      </Text>
    </Pressable>
  </View>
);
