import React, { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Animated, Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { DiscoverStackParamList } from '../navigation/types';
import { REPORT_MAP } from '../api/mockData';

type Props = {
  navigation: NativeStackNavigationProp<DiscoverStackParamList, 'CompatibilityReport'>;
  route: RouteProp<DiscoverStackParamList, 'CompatibilityReport'>;
};

const DimensionBar = ({ label, score, delay }: { label: string; score: number; delay: number }) => {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: score,
      duration: 800,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <View className="mb-5">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-slate-300 font-bold text-xs uppercase tracking-wider">{label}</Text>
        <Text style={{ color }} className="font-mono font-bold text-sm">{score}%</Text>
      </View>
      <View className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <Animated.View
          style={{ width: width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }), backgroundColor: color }}
          className="h-full rounded-full"
        />
      </View>
    </View>
  );
};

export const CompatibilityReportScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const { matchId, matchName, overallScore } = route.params;
  const report = REPORT_MAP[matchId] ?? REPORT_MAP['match_002'];

  const scoreAnim = useRef(new Animated.Value(0)).current;
  const displayScore = useRef(0);
  scoreAnim.addListener(({ value }) => { displayScore.current = Math.round(value); });

  useEffect(() => {
    Animated.timing(scoreAnim, {
      toValue: report.overallScore,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  const rec = report.recommendation;
  const recColor = rec === 'strong_match' ? '#10b981' : rec === 'conditional_match' ? '#f59e0b' : '#ef4444';
  const recLabel = rec === 'strong_match' ? '✅ Strong Match' : rec === 'conditional_match' ? '⚠️ Conditional Match' : '❌ Not Recommended';

  const DIMS: Array<keyof typeof report.dimensions> = ['deen','family','career','finances','kids','conflict','geography','boundaries'];
  const DIM_LABELS: Record<string, string> = { deen:'Deen', family:'Family', career:'Career', finances:'Finances', kids:'Kids', conflict:'Conflict', geography:'Geography', boundaries:'Boundaries' };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background">
      {/* AG-Trace */}
      <View className="bg-emerald-950/5 border-b border-emerald-900/10 px-4 py-2 flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-emerald-600 mr-2" />
        <Text className="text-emerald-800 font-mono text-[9px] uppercase tracking-widest flex-1" numberOfLines={1}>
          AG-TRACE // MODERATOR: REPORT GENERATED · 8-DIM ANALYSIS COMPLETE · REASONING LOGGED
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall score hero */}
        <View className="items-center my-6">
          <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Compatibility Report</Text>
          <Text className="text-slate-900 font-serif text-2xl font-bold mb-4">{matchName}</Text>
          <View className="w-32 h-32 rounded-full bg-emerald-50 border-4 border-emerald-600/30 items-center justify-center mb-4">
            <Animated.Text className="text-emerald-800 font-bold text-4xl">
              {report.overallScore}%
            </Animated.Text>
          </View>
          <View style={{ backgroundColor: recColor + '20', borderColor: recColor + '60' }} className="px-4 py-1.5 rounded-full border">
            <Text style={{ color: recColor }} className="font-bold text-xs">{recLabel}</Text>
          </View>
        </View>

        {/* 8-Dimension Breakdown */}
        <View className="bg-surface border border-slate-200 shadow-sm rounded-3xl p-5 mb-5">
          <Text className="text-slate-800 font-serif text-base font-bold mb-5">8-Dimension Breakdown</Text>
          {DIMS.map((dim, i) => (
            <DimensionBar key={dim} label={DIM_LABELS[dim]} score={report.dimensions[dim]} delay={i * 80} />
          ))}
        </View>

        {/* Top Strengths */}
        <View className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-4 shadow-sm">
          <Text className="text-emerald-800 font-bold text-xs uppercase tracking-widest mb-3">Top Strengths</Text>
          {report.topStrengths.map((s, i) => (
            <View key={i} className="flex-row items-start mb-2">
              <Text className="text-emerald-700 mr-2 text-sm">✓</Text>
              <Text className="text-emerald-800/80 text-sm flex-1">{s}</Text>
            </View>
          ))}
        </View>

        {/* Friction Point */}
        <View className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 shadow-sm">
          <Text className="text-amber-800 font-bold text-xs uppercase tracking-widest mb-2">
            {rec === 'not_recommended' ? '🚫 Dealbreaker' : '⚠️ Friction Point'}
          </Text>
          <Text className="text-amber-800/80 text-sm leading-relaxed italic">
            "{report.frictionPoint}"
          </Text>
        </View>

        {/* CTAs */}
        {rec !== 'not_recommended' && (
          <TouchableOpacity
            onPress={() => navigation.getParent()?.navigate('MeetingsTab', { screen: 'Booking', params: { matchId, matchName } })}
            className="bg-primary py-5 rounded-2xl items-center mb-3 shadow-lg shadow-primary/20"
          >
            <Text className="text-surface font-bold text-xs tracking-widest uppercase">Initiate Halal Reveal</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => navigation.getParent()?.navigate('MeetingsTab', { screen: 'DisputeForm', params: { matchId, matchName } })}
          className="border border-rose-200 bg-rose-50/50 py-4 rounded-2xl items-center"
        >
          <Text className="text-rose-700 font-bold text-xs tracking-widest uppercase">Report Issue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
