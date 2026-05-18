import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { DiscoverStackParamList } from '../navigation/types';
import { DEBATE_MAP, REPORT_MAP, DebateMessage } from '../api/mockData';

type Props = {
  navigation: NativeStackNavigationProp<DiscoverStackParamList, 'TwinDebate'>;
  route: RouteProp<DiscoverStackParamList, 'TwinDebate'>;
};

const DIMENSIONS = ['Deen', 'Family', 'Career', 'Finances', 'Kids', 'Conflict', 'Geography', 'Boundaries'];

// Animated 3-dot typing indicator
const TypingIndicator = () => {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    dots.forEach((dot, i) => {
      Animated.loop(Animated.sequence([
        Animated.delay(i * 160),
        Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0.2, duration: 300, useNativeDriver: true }),
        Animated.delay(500),
      ])).start();
    });
  }, []);
  return (
    <View className="flex-row items-center gap-1.5 bg-surface border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm self-start mb-4 shadow-sm">
      {dots.map((dot, i) => (
        <Animated.View key={i} style={{ opacity: dot, width: 7, height: 7, borderRadius: 4, backgroundColor: '#059669' }} />
      ))}
    </View>
  );
};

// Single debate bubble
const Bubble = ({ msg, visible }: { msg: DebateMessage; visible: boolean }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(8)).current;
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 380, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);
  if (!visible) return null;

  const isUser = msg.speaker === 'YourTwin';
  const isMod = msg.speaker === 'Moderator';

  if (isMod) {
    return (
      <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }} className="self-center w-full max-w-[88%] mb-4">
        <View className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl items-center shadow-sm">
          <Text className="text-emerald-800 font-mono text-[9px] uppercase tracking-widest mb-1">⚖️ Moderator</Text>
          <Text className="text-emerald-900 text-xs text-center leading-relaxed italic">{msg.text}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }} className={`mb-4 max-w-[80%] ${isUser ? 'self-end' : 'self-start'}`}>
      <Text className={`text-[9px] font-bold uppercase tracking-widest mb-1.5 ${isUser ? 'text-primary text-right' : 'text-slate-500 text-left'}`}>
        {isUser ? 'Your Twin' : msg.speaker}
      </Text>
      <View className={`p-4 rounded-2xl shadow-sm ${isUser ? 'bg-primary border border-primary rounded-tr-sm' : 'bg-surface border border-slate-200 rounded-tl-sm'}`}>
        <Text className={`text-sm leading-relaxed ${isUser ? 'text-surface' : 'text-slate-800'}`}>"{msg.text}"</Text>
      </View>
    </Animated.View>
  );
};

export const TwinDebateScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const { matchId, matchName } = route.params;
  const messages: DebateMessage[] = DEBATE_MAP[matchId] ?? DEBATE_MAP['match_001'];
  const report = REPORT_MAP[matchId] ?? REPORT_MAP['match_001'];

  const [visibleCount, setVisibleCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [dimIndex, setDimIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    let cancelled = false;
    const reveal = async (i: number) => {
      if (i >= messages.length || cancelled) return;
      setIsTyping(true);
      await new Promise((r) => setTimeout(r, 850 + Math.random() * 700));
      if (cancelled) return;
      setIsTyping(false);
      setVisibleCount(i + 1);
      const msg = messages[i];
      if (msg.dimension) {
        const di = DIMENSIONS.findIndex((d) => d.toLowerCase() === msg.dimension);
        if (di >= 0) setDimIndex(di);
      }
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
      await new Promise((r) => setTimeout(r, 550));
      reveal(i + 1);
    };
    reveal(0);
    return () => { cancelled = true; };
  }, [matchId]);

  const isDone = visibleCount >= messages.length;
  const liveScore = Math.round((visibleCount / messages.length) * report.overallScore);
  const rec = report.recommendation;

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background">
      {/* AG-Trace */}
      <View className="bg-emerald-950/5 border-b border-emerald-900/10 px-4 py-2 flex-row items-center">
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#059669', marginRight: 8 }} />
        <Text className="text-emerald-800 font-mono text-[9px] uppercase tracking-widest flex-1" numberOfLines={1}>
          AG-TRACE // MODERATOR: DIM {dimIndex + 1}/8 — {DIMENSIONS[dimIndex].toUpperCase()} · LIVE DEBATE ACTIVE
        </Text>
      </View>

      {/* Header bar */}
      <View className="px-5 py-3 border-b border-slate-200/80 bg-background">
        <View className="flex-row items-center justify-between mb-2.5">
          <View>
            <Text className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Twin Negotiation</Text>
            <Text className="text-slate-900 font-serif font-bold text-lg">{matchName}</Text>
          </View>
          <View className="items-end">
            <Text className="text-slate-400 text-[9px] uppercase tracking-widest font-bold">Live Compat.</Text>
            <Text className="text-primary font-bold text-2xl font-mono">{liveScore}%</Text>
          </View>
        </View>
        {/* Dimension pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {DIMENSIONS.map((dim, i) => (
              <View key={dim} className={`px-2.5 py-1 rounded-full border ${i === dimIndex ? 'bg-primary border-primary shadow-sm' : i < dimIndex ? 'bg-primary/5 border-primary/20' : 'border-slate-200 bg-surface'}`}>
                <Text className={`text-[9px] font-bold uppercase tracking-wider ${i === dimIndex ? 'text-surface' : i < dimIndex ? 'text-primary' : 'text-slate-400'}`}>{dim}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Messages */}
      <ScrollView ref={scrollRef} className="flex-1 px-4" contentContainerStyle={{ paddingVertical: 16 }} showsVerticalScrollIndicator={false}>
        {messages.map((msg, i) => <Bubble key={i} msg={msg} visible={i < visibleCount} />)}
        {isTyping && <TypingIndicator />}
      </ScrollView>

      {/* Done CTA */}
      {isDone && (
        <View className="px-5 pb-6 pt-3 border-t border-slate-200/80 bg-background">
          <View className={`p-3 rounded-xl mb-3 border ${rec === 'strong_match' ? 'bg-emerald-50 border-emerald-100' : rec === 'conditional_match' ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-100'}`}>
            <Text className={`font-bold text-[10px] uppercase tracking-widest text-center ${rec === 'strong_match' ? 'text-emerald-800' : rec === 'conditional_match' ? 'text-amber-800' : 'text-rose-800'}`}>
              {rec === 'strong_match' ? '✅ Strong Match — Proceed to Reveal' : rec === 'conditional_match' ? '⚠️ Conditional Match — Review Report' : '❌ Dealbreaker Found — Not Recommended'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('CompatibilityReport', { matchId, matchName, overallScore: report.overallScore })}
            className="bg-primary py-4 rounded-2xl items-center shadow-lg shadow-primary/20"
          >
            <Text className="text-surface font-bold text-xs tracking-widest uppercase">View Full Compatibility Report</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
