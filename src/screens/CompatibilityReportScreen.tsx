import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { AgTrace } from '../components/AgTrace';

const Dim = ({ label, score }: { label: string; score: number }) => (
  <View className="w-[48%] mb-5">
    <View className="flex-row justify-between items-end mb-1.5">
      <Text className="font-bold text-slate-600 text-[10px] uppercase tracking-wider">{label}</Text>
      <Text className="font-mono text-emerald-800 font-bold text-[11px]">{score}%</Text>
    </View>
    <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <View style={{ width: `${score}%` }} className="h-full bg-emerald-800" />
    </View>
  </View>
);

export const CompatibilityReportScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { matches, currentMatchId } = useAppStore();

  const candidate = matches.find(m => m.id === currentMatchId) || matches[0];

  // Dynamic values based on selected candidate
  const reportData: Record<string, {
    dimensions: Record<string, number>;
    friction: string;
    baselineScore: number;
    baselineExplanation: string;
  }> = {
    '1': {
      dimensions: { Deen: 98, Family: 90, Career: 95, Finances: 92, Kids: 88, Conflict: 95, Geography: 85, Boundaries: 94 },
      friction: "Geography & Local Roots. Bilal resides in Karachi while you are in Lahore. In a flat matching system, this is flagged as a direct relocation conflict. However, during Twin debate, Bilal's twin agreed to a 2-year timeline of Lahore-based hybrid working to fully support your clinical practice.",
      baselineScore: 71,
      baselineExplanation: "Static distance algorithms penalized their differing cities and career ambitions as mismatched, missing the cooperative 2-year relocation compromise negotiated by the AI Twins."
    },
    '2': {
      dimensions: { Deen: 88, Family: 82, Career: 90, Finances: 86, Kids: 85, Conflict: 80, Geography: 94, Boundaries: 88 },
      friction: "Joint Family Living. Zainab prefers staying close to her parents in Lahore. Our Twin debate negotiated a comfortable middle ground where Zainab's family allocates a fully private upper portion of the house with a separate entrance to secure your independent living preference.",
      baselineScore: 65,
      baselineExplanation: "Standard heuristics flagged joint family preference as a dealbreaker, failing to negotiate the physical boundaries and separate upper-portion compromise established in the debate."
    },
    '3': {
      dimensions: { Deen: 82, Family: 80, Career: 85, Finances: 88, Kids: 82, Conflict: 78, Geography: 90, Boundaries: 80 },
      friction: "Conflict Styles & Resolution. Hamza's twin indicated a high preference for cool-off periods (2-3 hours) during friction, whereas you seek immediate resolution. The Twins agreed to a structured '1-hour pause' guideline to prevent emotional distance.",
      baselineScore: 84,
      baselineExplanation: "Artificially high score. Static heuristics matched them heavily based on high financial and local city parity, completely blind to the significant emotional and conflict style divergence highlighted during Twin negotiations."
    }
  };

  const currentReport = reportData[candidate.id] || reportData['1'];

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-slate-50">
      <AgTrace msg="MODERATOR_AGENT: FORGING COMPATIBILITY VERDICT REPORT V1.0..." />
      
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        
        {/* Header Block */}
        <View className="items-center mb-8 mt-4">
          <Text className="text-amber-600 font-bold text-[10px] uppercase tracking-[0.3em] mb-1">Moderator Verdict</Text>
          <Text className="text-3.5xl font-serif font-bold text-slate-900 mb-3">{candidate.name}</Text>
          
          <View className="bg-emerald-800 px-6 py-2.5 rounded-2xl shadow-md shadow-emerald-800/10">
            <Text className="text-white font-bold text-sm tracking-widest uppercase">{candidate.compatibility}% Compatible</Text>
          </View>
        </View>

        {/* 8-Dimension breakdown */}
        <View className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 mb-5">
          <Text className="text-slate-900 font-serif text-lg font-bold mb-5">8-Dimension Value Audit</Text>
          <View className="flex-row flex-wrap justify-between">
            {Object.entries(currentReport.dimensions).map(([label, score]) => (
              <Dim key={label} label={label} score={score} />
            ))}
          </View>
        </View>

        {/* Dynamic Negotiated Friction Point */}
        <View className="bg-emerald-950 p-5 rounded-[28px] shadow-md mb-5 border border-emerald-900">
          <Text className="text-amber-500 font-bold text-[9px] uppercase tracking-[0.2em] mb-2">Negotiated Agreement</Text>
          <Text className="text-emerald-50 font-serif text-sm leading-relaxed italic">
            "{currentReport.friction}"
          </Text>
        </View>

        {/* Baseline Comparison Card (Core Hackathon Requirement) */}
        <View className="bg-white p-5 rounded-[28px] shadow-sm border-2 border-amber-500/20 mb-8 bg-amber-500/5">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-amber-800 font-bold text-[10px] uppercase tracking-[0.15em]">📊 Heuristic Baseline Comparison</Text>
            <View className="bg-amber-100 px-2.5 py-0.5 rounded-full"><Text className="text-amber-800 font-bold text-[9px]">COMPARED</Text></View>
          </View>
          
          <View className="flex-row justify-between items-center mb-4">
            <View className="items-center bg-slate-100 p-3 rounded-xl flex-1 mr-3 border border-slate-200">
              <Text className="text-slate-400 font-mono text-[9px] uppercase font-bold tracking-wider">Static Baseline</Text>
              <Text className="text-slate-600 font-serif text-2xl font-bold mt-1">{currentReport.baselineScore}%</Text>
            </View>
            <View className="items-center bg-emerald-900 p-3 rounded-xl flex-1 border border-emerald-800">
              <Text className="text-emerald-400 font-mono text-[9px] uppercase font-bold tracking-wider">RishtaAI (Agentic)</Text>
              <Text className="text-white font-serif text-2xl font-bold mt-1">{candidate.compatibility}%</Text>
            </View>
          </View>
          
          <Text className="text-slate-600 text-xs leading-relaxed">
            <Text className="font-bold text-slate-800">Why Agentic wins: </Text>
            {currentReport.baselineExplanation}
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('MeetingsTab', { screen: 'Booking' })}
          className="bg-amber-500 py-5 rounded-2xl items-center shadow-xl shadow-amber-500/10 mb-10"
        >
          <Text className="text-emerald-950 font-bold text-sm tracking-widest uppercase">Initiate Wali-to-Wali Reveal ➔</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};
