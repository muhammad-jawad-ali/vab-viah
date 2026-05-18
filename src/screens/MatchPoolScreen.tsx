import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DiscoverStackParamList } from '../navigation/types';
import { MOCK_MATCHES, MockMatch } from '../api/mockData';
import { useAppStore } from '../store/useAppStore';

type Props = {
  navigation: NativeStackNavigationProp<DiscoverStackParamList, 'MatchPool'>;
};

const ScoreBadge = ({ score }: { score: number }) => {
  const color =
    score >= 90 ? '#10b981' : score >= 75 ? '#f59e0b' : '#ef4444';
  return (
    <View
      style={{ backgroundColor: color + '20', borderColor: color + '60' }}
      className="px-3 py-1 rounded-full border"
    >
      <Text style={{ color }} className="font-mono font-bold text-sm">
        {score}%
      </Text>
    </View>
  );
};

const MatchCard = ({
  match,
  onPress,
}: {
  match: MockMatch;
  onPress: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const { meetingsList } = useAppStore();

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  // Check if a reveal is unlocked (i.e. a meeting is scheduled, pending, or completed)
  const isRevealed = meetingsList.some(
    (m) =>
      m.id === `meet_${match.matchId}` &&
      (m.status === 'scheduled' || m.status === 'done' || m.status === 'pending_feedback')
  );

  return (
    <Animated.View style={{ transform: [{ scale }] }} className="mb-5">
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        className="bg-surface rounded-[28px] p-5 border border-slate-200 shadow-sm flex-row items-center"
      >
        {/* Blurred Avatar */}
        <View className="w-20 h-20 rounded-2xl overflow-hidden mr-4 border border-slate-200/80">
          <Image
            source={{ uri: match.blurAvatarUrl }}
            className="w-full h-full"
            blurRadius={isRevealed ? 0 : 12}
          />
          {!isRevealed ? (
            <View className="absolute inset-0 bg-black/5 items-center justify-center">
              <Text className="text-xl">🔒</Text>
            </View>
          ) : (
            <View className="absolute bottom-0 left-0 right-0 bg-emerald-600/90 py-0.5 items-center">
              <Text className="text-[7px] font-bold text-white uppercase tracking-wider">Revealed</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-slate-900 font-serif font-bold text-lg">{match.displayName}</Text>
            <ScoreBadge score={match.compatibilityScore} />
          </View>

          <Text className="text-slate-500 text-xs mb-3">
            {match.profession} · {match.city} · Age {match.age}
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {match.tags.map((tag) => (
              <View
                key={tag}
                className="bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md"
              >
                <Text className="text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const MatchPoolScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const { isPremium } = useAppStore();
  const viewedCount = useRef(0);

  const handleViewMatch = (match: MockMatch) => {
    viewedCount.current += 1;
    if (!isPremium && viewedCount.current > 3) {
      navigation.navigate('Paywall');
      return;
    }
    navigation.navigate('TwinDebate', {
      matchId: match.matchId,
      matchName: match.displayName,
    });
  };

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-background"
    >
      {/* AG-Trace strip */}
      <View className="bg-emerald-950/5 border-b border-emerald-900/10 px-4 py-2 flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-emerald-600 mr-2" />
        <Text className="text-emerald-800 font-mono text-[9px] uppercase tracking-widest flex-1">
          AG-TRACE // PRE-SCREEN: 12 CANDIDATES → 3 SHORTLISTED · VECTOR SIMILARITY 0.83
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mt-2 mb-6">
          <View>
            <Text className="text-primary font-bold text-[10px] uppercase tracking-[0.25em] mb-1">
              Discovery
            </Text>
            <Text className="text-slate-900 font-serif text-3xl font-bold">Match Pool</Text>
          </View>
          <View className="bg-primary/5 px-4 py-2 rounded-full border border-primary/20">
            <Text className="text-primary font-bold text-xs">
              {MOCK_MATCHES.length} CURATED
            </Text>
          </View>
        </View>

        {/* Info banner */}
        <View className="bg-surface border border-slate-200 rounded-2xl p-4 mb-6 flex-row items-start shadow-sm">
          <Text className="text-xl mr-3">🤖</Text>
          <View className="flex-1">
            <Text className="text-slate-900 font-bold text-sm mb-1">
              Your Twin has been matched
            </Text>
            <Text className="text-slate-500 text-xs leading-relaxed">
              Our Moderator Agent ran deep compatibility negotiations across 8
              dimensions. Tap any match to view the live debate.
            </Text>
          </View>
        </View>

        {/* Match list */}
        {MOCK_MATCHES.slice(0, 3).map((match) => (
          <MatchCard
            key={match.matchId}
            match={match}
            onPress={() => handleViewMatch(match)}
          />
        ))}

        {/* Baseline comparison note */}
        <View className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 mt-2 shadow-sm">
          <Text className="text-amber-800 font-bold text-[10px] uppercase tracking-wider mb-1">
            🔬 Baseline Comparison
          </Text>
          <Text className="text-amber-700/90 text-xs leading-relaxed">
            Without agentic debate, a heuristic ranker would surface Omar S. as
            #1 (geographic match). Our Twin debate uncovered a dealbreaker —
            demoting him to #3.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};
