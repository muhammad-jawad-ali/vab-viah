// ReplayDebateScreen — chat-style replay of one candidate's Twin debate.
//
// Inputs (route params): flowId, candidateTwinId, displayName.
//
// Data source: useAppStore.messagesByFlow[flowId] — populated by MatchPool's
// live SSE subscription (the find_matches workplan emits agent.message events
// for every dim turn). The bus is gone after workplan.finished so we can't
// re-stream; this is a pure cache read.
//
// Filter strategy: messages are interleaved across all 5 parallel debates.
// We pick the user's Twin name from useAppStore.twinSpec and combine it with
// the displayName route param to pull just THIS candidate's transcript.
// Group by dimension; render right-aligned bubbles for user_twin and
// left-aligned for candidate_twin. Moderator messages (rare in current
// backend output but supported) render centered.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { DiscoverStackParamList } from '../navigation/types';
import {
  DIMENSION_LABELS,
  type DebateMessage,
  type Dimension,
} from '../api/types';
import { useAppStore } from '../store/useAppStore';

type Props = {
  navigation: NativeStackNavigationProp<DiscoverStackParamList, 'ReplayDebate'>;
  route: RouteProp<DiscoverStackParamList, 'ReplayDebate'>;
};

export const ReplayDebateScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const { flowId, candidateTwinId, displayName } = route.params;
  const messages = useAppStore((s) => s.messagesByFlow[flowId]);
  const userName = useAppStore((s) => s.twinSpec?.identity.name ?? null);

  const grouped = useMemo(
    () => filterAndGroup(messages ?? [], userName, displayName, candidateTwinId),
    [messages, userName, displayName, candidateTwinId]
  );

  const totalBubbles = grouped.reduce((acc, g) => acc + g.messages.length, 0);

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background">
      <View className="bg-emerald-950/5 border-b border-emerald-900/10 px-4 py-2 flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-emerald-600 mr-2" />
        <Text
          className="text-emerald-800 font-mono text-[9px] uppercase tracking-widest flex-1"
          numberOfLines={1}
        >
          AG-TRACE // REPLAY · {grouped.length} DIM · {totalBubbles} TURNS
        </Text>
      </View>

      <View className="px-5 py-3 border-b border-slate-200/80">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back to compatibility report"
            className="px-3 py-1.5 -ml-3"
          >
            <Text className="text-primary font-bold text-xs">← Back</Text>
          </Pressable>
          <Text className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
            Debate Replay
          </Text>
        </View>
        <Text
          className="text-slate-900 font-serif font-bold text-lg mt-1"
          numberOfLines={1}
        >
          {userName ?? 'You'} × {displayName}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {grouped.length === 0 ? (
          <EmptyState
            displayName={displayName}
            hasUserName={userName !== null}
            totalKnownMessages={messages?.length ?? 0}
          />
        ) : (
          grouped.map((group, gi) => (
            <DimensionBlock
              key={`${group.dimension ?? 'misc'}-${gi}`}
              dimension={group.dimension}
              messages={group.messages}
              userName={userName}
              baseDelay={gi * 220}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Filter + group helpers
// ---------------------------------------------------------------------------

type GroupedBlock = { dimension: Dimension | null; messages: DebateMessage[] };

function filterAndGroup(
  all: DebateMessage[],
  userName: string | null,
  candidateName: string,
  candidateId: string
): GroupedBlock[] {
  // Primary filter: candidateId tag (backend stamps every debate message with
  // the candidate it belongs to). This is the only correct filter under the 5
  // parallel debates / 1 user pattern — without it, user_twin appears 5× per
  // dim because the user is user_twin in every debate.
  //
  // Fallback (when candidateId tag is missing — e.g. older trace bundle from a
  // pre-Session-7 backend, or moderator messages with no debate attribution):
  // accept user-side messages by speakerName and accept candidate-side by name
  // too. This preserves the original behavior on legacy data without breaking
  // the new accurate path.
  const userMatch = userName?.toLowerCase() ?? null;
  const candMatch = candidateName.toLowerCase();
  const tagged = all.filter((m) => m.candidateId !== undefined);
  const hasAnyTaggedForCandidate = tagged.some((m) => m.candidateId === candidateId);

  const relevant = all.filter((m) => {
    if (m.candidateId !== undefined) {
      // Accept only messages tagged for THIS candidate.
      return m.candidateId === candidateId;
    }
    // Untagged path (legacy + moderator).
    if (m.side === 'moderator') return true;
    if (hasAnyTaggedForCandidate) {
      // We have candidate-tagged data for this debate; untagged twin messages
      // are stale/ambiguous — drop them to avoid the duplicate-bubble bug.
      return false;
    }
    const speaker = m.speakerName.toLowerCase();
    if (userMatch && speaker === userMatch) return true;
    if (speaker === candMatch) return true;
    return false;
  });

  // Group by dimension in arrival order. Each new dimension starts a new
  // block; consecutive messages of the same dimension stay together. This
  // preserves the per-dim "round" structure the user expects (8 rounds total).
  const blocks: GroupedBlock[] = [];
  for (const m of relevant) {
    const last = blocks[blocks.length - 1];
    if (last && last.dimension === m.dimension) {
      last.messages.push(m);
    } else {
      blocks.push({ dimension: m.dimension, messages: [m] });
    }
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// Dimension block — chip header + a stack of typewriter-revealed bubbles.
// ---------------------------------------------------------------------------

const DimensionBlock = ({
  dimension,
  messages,
  userName,
  baseDelay,
}: {
  dimension: Dimension | null;
  messages: DebateMessage[];
  userName: string | null;
  baseDelay: number;
}) => {
  return (
    <View className="mb-5">
      {dimension ? (
        <View className="items-center mb-3">
          <View className="bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
            <Text className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
              {DIMENSION_LABELS[dimension]}
            </Text>
          </View>
        </View>
      ) : null}
      {messages.map((m, i) => (
        <ChatBubble
          key={m.id}
          message={m}
          userName={userName}
          delay={baseDelay + i * 180}
        />
      ))}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Chat bubble — user on the right, candidate on the left, moderator centered.
// Typewriter reveal mirrors the live-debate DecisionCard pattern.
// ---------------------------------------------------------------------------

const TYPE_INTERVAL_MS = 14; // a touch faster than DecisionCard so a full
                             // 8-round replay reads quickly

const ChatBubble = ({
  message,
  userName,
  delay,
}: {
  message: DebateMessage;
  userName: string | null;
  delay: number;
}) => {
  const fade = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(8)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [typed, setTyped] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  const isUser =
    message.side === 'user_twin' ||
    (userName !== null && message.speakerName.toLowerCase() === userName.toLowerCase());
  const isModerator = message.side === 'moderator';

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setHasStarted(true);
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(translate, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      let i = 0;
      intervalRef.current = setInterval(() => {
        i += 1;
        setTyped(message.statement.slice(0, i));
        if (i >= message.statement.length && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, TYPE_INTERVAL_MS);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [delay, message.statement]);

  if (isModerator) {
    return (
      <Animated.View
        style={{
          opacity: fade,
          transform: [{ translateY: translate }],
        }}
        className="items-center mb-3"
      >
        <View className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-2 max-w-[88%]">
          <Text className="text-emerald-800 text-[10px] font-bold uppercase tracking-widest mb-0.5 text-center">
            ⚖ Moderator
          </Text>
          <Text className="text-emerald-900 text-xs leading-relaxed text-center">
            {hasStarted ? typed : ' '}
          </Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={{
        opacity: fade,
        transform: [{ translateY: translate }],
      }}
      className={`flex-row mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <View
        className={`${
          isUser
            ? 'bg-primary rounded-2xl rounded-tr-md'
            : 'bg-surface border border-slate-200 rounded-2xl rounded-tl-md'
        } px-3.5 py-2.5 max-w-[78%] shadow-sm`}
      >
        <Text
          className={`${
            isUser ? 'text-emerald-50/80' : 'text-slate-500'
          } text-[10px] font-bold uppercase tracking-widest mb-1`}
        >
          {isUser ? 'Your Twin' : `${message.speakerName || 'Their Twin'}`}
        </Text>
        <Text
          className={`${isUser ? 'text-surface' : 'text-slate-800'} text-[13px] leading-relaxed`}
        >
          {hasStarted ? typed : ' '}
        </Text>
      </View>
    </Animated.View>
  );
};

// ---------------------------------------------------------------------------
// Empty state — surfaces when the user reached the replay screen without ever
// running a live debate (e.g. they navigated from a deep link). In practice
// the only path here is CompatibilityReport → Replay, which inherits the same
// flowId the live workplan emitted under, so this is the safety net.
// ---------------------------------------------------------------------------

const EmptyState = ({
  displayName,
  hasUserName,
  totalKnownMessages,
}: {
  displayName: string;
  hasUserName: boolean;
  totalKnownMessages: number;
}) => (
  <View className="bg-surface border border-slate-200 rounded-2xl p-6 items-center mt-6">
    <Text className="text-3xl mb-2">💬</Text>
    <Text className="text-slate-900 font-serif font-bold text-base mb-2 text-center">
      Replay unavailable
    </Text>
    <Text className="text-slate-500 text-xs leading-relaxed text-center">
      We didn't capture {displayName}'s debate transcript on this device.
      {totalKnownMessages > 0
        ? ' The trace has messages but none matched this candidate — try running a fresh match.'
        : !hasUserName
          ? ' Sign in and forge your Twin to enable chat replay.'
          : ' Run a new match to populate the debate timeline.'}
    </Text>
  </View>
);
