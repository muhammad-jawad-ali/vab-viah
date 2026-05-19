// CompatibilityReportScreen — fetch persisted reports by flowId and render
// the row matching the candidateTwinId carried from TwinDebate.
//
// Backend shape: GET /match/results/:flowId returns { flowId, topThree,
// allDebated }. We look in allDebated first (covers all 5), fall back to
// topThree if the row was filtered out for some reason. If neither has it,
// the user gets a friendly error + a back CTA — this should not happen in
// practice because the debate just finished and the rows were persisted.

import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { api } from '../api/client';
import {
  ApiError,
  DIMENSIONS,
  DIMENSION_LABELS,
  type StoredReport,
  type Dimension,
} from '../api/types';
import { useAppStore } from '../store/useAppStore';

type Props = {
  navigation: NativeStackNavigationProp<DiscoverStackParamList, 'CompatibilityReport'>;
  route: RouteProp<DiscoverStackParamList, 'CompatibilityReport'>;
};

export const CompatibilityReportScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const { flowId, candidateTwinId, displayName } = route.params;

  // Read from Zustand first — MatchPool already cached the full set when
  // /match/results landed, so most navigations to this screen need zero
  // network IO.
  const cached = useAppStore((s) => s.reportsByFlow[flowId]);
  const setReportsForFlow = useAppStore((s) => s.setReportsForFlow);
  const cachedReport = cached?.find((r) => r.candidate_twin_id === candidateTwinId);

  const [report, setReport] = useState<StoredReport | null>(cachedReport ?? null);
  const [err, setErr] = useState<string | null>(null);
  const fired = useRef<string | null>(null);

  useEffect(() => {
    if (cachedReport) return;
    if (fired.current === flowId) return;
    fired.current = flowId;

    let cancelled = false;
    (async () => {
      try {
        const res = await api.match.results(flowId);
        if (cancelled) return;
        const all = res.allDebated ?? [];
        setReportsForFlow(flowId, all);
        const found =
          all.find((r) => r.candidate_twin_id === candidateTwinId) ??
          res.topThree.find((r) => r.candidate_twin_id === candidateTwinId);
        if (!found) {
          setErr('No report row for this candidate.');
          return;
        }
        setReport(found);
      } catch (e) {
        if (cancelled) return;
        setErr(e instanceof ApiError ? e.message : 'Could not load report.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [flowId, candidateTwinId, cachedReport, setReportsForFlow]);

  if (err) {
    return (
      <ErrorView err={err} insets={insets} onBack={() => navigation.goBack()} />
    );
  }
  if (!report) {
    return <LoadingView insets={insets} />;
  }

  const overall = Math.round(report.overall_score * 100);
  const rec = report.recommendation;
  const recColor =
    rec === 'strong_match' ? '#10b981' : rec === 'conditional_match' ? '#f59e0b' : '#ef4444';
  const recLabel =
    rec === 'strong_match'
      ? '✅ Strong Match'
      : rec === 'conditional_match'
        ? '⚠️ Conditional Match'
        : '❌ Not Recommended';
  const dealbreaker = report.dealbreakers_hit.length > 0;

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background">
      {/* AG-Trace */}
      <View className="bg-emerald-950/5 border-b border-emerald-900/10 px-4 py-2 flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-emerald-600 mr-2" />
        <Text
          className="text-emerald-800 font-mono text-[9px] uppercase tracking-widest flex-1"
          numberOfLines={1}
        >
          AG-TRACE // REPORT · {Object.keys(report.dimension_scores).length}-DIM
          ANALYSIS · GENERATED {new Date(report.generated_at).toLocaleTimeString()}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero score */}
        <View className="items-center my-6">
          <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">
            Compatibility Report
          </Text>
          <Text className="text-slate-900 font-serif text-2xl font-bold mb-4">
            {displayName}
          </Text>
          <View className="w-32 h-32 rounded-full bg-emerald-50 border-4 border-emerald-600/30 items-center justify-center mb-4">
            <Text className="text-emerald-800 font-bold text-4xl">{overall}%</Text>
          </View>
          <View
            style={{ backgroundColor: recColor + '20', borderColor: recColor + '60' }}
            className="px-4 py-1.5 rounded-full border"
          >
            <Text style={{ color: recColor }} className="font-bold text-xs">
              {recLabel}
            </Text>
          </View>
        </View>

        {/* 8-dim breakdown */}
        <View className="bg-surface border border-slate-200 shadow-sm rounded-3xl p-5 mb-5">
          <Text className="text-slate-800 font-serif text-base font-bold mb-5">
            8-Dimension Breakdown
          </Text>
          {DIMENSIONS.map((dim, i) => (
            <DimensionRow
              key={dim}
              dim={dim}
              row={report.dimension_scores[dim]}
              delay={i * 70}
            />
          ))}
        </View>

        {/* Top strengths */}
        {report.top_strengths.length > 0 ? (
          <View className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-4 shadow-sm">
            <Text className="text-emerald-800 font-bold text-xs uppercase tracking-widest mb-3">
              Top Strengths
            </Text>
            {report.top_strengths.map((s, i) => (
              <View key={i} className="flex-row items-start mb-2 last:mb-0">
                <Text className="text-emerald-700 mr-2 text-sm">✓</Text>
                <Text className="text-emerald-800/80 text-sm flex-1 leading-relaxed">{s}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Friction / dealbreakers */}
        {report.top_friction_points.length > 0 ? (
          <View
            className={`${dealbreaker ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'} border rounded-2xl p-5 mb-4 shadow-sm`}
          >
            <Text
              className={`${dealbreaker ? 'text-rose-800' : 'text-amber-800'} font-bold text-xs uppercase tracking-widest mb-3`}
            >
              {dealbreaker ? '🚫 Friction & Dealbreakers' : '⚠️ Friction Points'}
            </Text>
            {report.top_friction_points.map((p, i) => (
              <View key={i} className="flex-row items-start mb-2 last:mb-0">
                <Text
                  className={`${dealbreaker ? 'text-rose-700' : 'text-amber-700'} mr-2 text-sm`}
                >
                  •
                </Text>
                <Text
                  className={`${dealbreaker ? 'text-rose-800/80' : 'text-amber-800/80'} text-sm flex-1 leading-relaxed`}
                >
                  {p}
                </Text>
              </View>
            ))}
            {dealbreaker ? (
              <View className="mt-3 pt-3 border-t border-rose-200/60">
                <Text className="text-rose-700 text-[10px] font-bold uppercase tracking-widest mb-1">
                  Hit on:
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {report.dealbreakers_hit.map((d) => (
                    <View
                      key={d}
                      className="bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-md"
                    >
                      <Text className="text-rose-800 text-[10px] font-bold">{d}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* CTAs */}
        {rec !== 'not_recommended' ? (
          <TouchableOpacity
            onPress={() => {
              navigation.popToTop();
              navigation
                .getParent()
                ?.navigate('MeetingsTab', {
                  screen: 'Booking',
                  params: { matchId: candidateTwinId, matchName: displayName },
                });
            }}
            className="bg-primary py-5 rounded-2xl items-center mb-3 shadow-lg shadow-primary/20"
          >
            <Text className="text-surface font-bold text-xs tracking-widest uppercase">
              Initiate Halal Reveal
            </Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          onPress={() =>
            navigation
              .getParent()
              ?.navigate('MeetingsTab', {
                screen: 'DisputeForm',
                params: { matchId: candidateTwinId, matchName: displayName },
              })
          }
          className="border border-rose-200 bg-rose-50/50 py-4 rounded-2xl items-center"
        >
          <Text className="text-rose-700 font-bold text-xs tracking-widest uppercase">
            Report Issue
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Per-dimension row — animated 0..100% fill from the backend's 0..1 score.
// ---------------------------------------------------------------------------

type RowProps = {
  dim: Dimension;
  row: StoredReport['dimension_scores'][Dimension] | undefined;
  delay: number;
};

const DimensionRow = ({ dim, row, delay }: RowProps) => {
  const width = useRef(new Animated.Value(0)).current;
  const score = row ? Math.round(row.score * 100) : 0;
  const color = score >= 75 ? '#10b981' : score >= 55 ? '#f59e0b' : '#ef4444';

  useEffect(() => {
    Animated.timing(width, {
      toValue: score,
      duration: 800,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [score, delay]);

  return (
    <View className="mb-5 last:mb-0">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-slate-700 font-bold text-xs uppercase tracking-wider">
          {DIMENSION_LABELS[dim]}
        </Text>
        <View className="flex-row items-center gap-2">
          {row?.friction_level && row.friction_level !== 'none' ? (
            <Text className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">
              {row.friction_level}
            </Text>
          ) : null}
          <Text style={{ color }} className="font-mono font-bold text-sm">
            {score}%
          </Text>
        </View>
      </View>
      <View className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <Animated.View
          style={{
            width: width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
            backgroundColor: color,
          }}
          className="h-full rounded-full"
        />
      </View>
      {row?.evidence ? (
        <Text className="text-slate-500 text-[11px] mt-2 leading-relaxed italic">
          "{row.evidence}"
        </Text>
      ) : null}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Loading / error views
// ---------------------------------------------------------------------------

const LoadingView = ({ insets }: { insets: { top: number } }) => (
  <View
    style={{ paddingTop: insets.top }}
    className="flex-1 bg-background items-center justify-center"
  >
    <ActivityIndicator size="large" color="#059669" />
    <Text className="text-slate-500 text-sm mt-4">Loading report…</Text>
  </View>
);

const ErrorView = ({
  err,
  insets,
  onBack,
}: {
  err: string;
  insets: { top: number };
  onBack: () => void;
}) => (
  <View
    style={{ paddingTop: insets.top }}
    className="flex-1 bg-background items-center justify-center px-8"
  >
    <Text className="text-rose-700 font-serif text-xl mb-2 text-center">
      Report unavailable
    </Text>
    <Text className="text-slate-500 text-sm text-center mb-6">{err}</Text>
    <Pressable
      onPress={onBack}
      className="bg-primary px-6 py-3 rounded-full active:opacity-80"
    >
      <Text className="text-surface font-bold text-xs uppercase tracking-widest">
        Back
      </Text>
    </Pressable>
  </View>
);
