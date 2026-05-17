import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

const Dim = ({ label, score }: { label: string, score: number }) => (
  <View className="w-[48%] mb-6">
    <View className="flex-row justify-between items-end mb-2">
      <Text className="font-bold text-slate-700 text-xs uppercase">{label}</Text>
      <Text className="font-mono text-primary font-bold text-xs">{score}%</Text>
    </View>
    <View className="h-1 bg-slate-200 rounded-full overflow-hidden">
      <View style={{ width: `${score}%` }} className="h-full bg-primary" />
    </View>
  </View>
);

export const CompatibilityReportScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-background">
      <ScrollView className="p-6">
        
        <View className="items-center mb-10 mt-6">
          <Text className="text-secondary font-bold text-[10px] uppercase tracking-[0.3em] mb-2">Analytical Report</Text>
          <Text className="text-4xl font-serif font-bold text-slate-900 mb-2">Ayesha K.</Text>
          <View className="bg-primary px-6 py-2 rounded-full">
            <Text className="text-surface font-bold text-lg">94% Match</Text>
          </View>
        </View>

        <View className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-6">
          <Text className="text-slate-900 font-serif text-xl font-bold mb-6">8-Dimension Breakdown</Text>
          <View className="flex-row flex-wrap justify-between">
            <Dim label="Deen" score={98} />
            <Dim label="Family" score={90} />
            <Dim label="Career" score={85} />
            <Dim label="Finances" score={92} />
            <Dim label="Kids" score={88} />
            <Dim label="Conflict" score={95} />
            <Dim label="Geography" score={75} />
            <Dim label="Boundaries" score={100} />
          </View>
        </View>

        <View className="bg-primary-dark p-6 rounded-[32px] shadow-lg mb-8">
          <Text className="text-secondary font-bold text-xs uppercase tracking-widest mb-4">Top Friction Point</Text>
          <Text className="text-surface font-serif text-sm leading-relaxed italic">
            "Candidate prefers staying in Islamabad long-term, while you indicated a 60% probability of moving to Dubai. The moderator agent noted this requires careful alignment during the first meeting."
          </Text>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Booking')}
          className="bg-secondary py-5 rounded-2xl items-center shadow-lg shadow-secondary/20 mb-12"
        >
          <Text className="text-primary-dark font-bold text-sm tracking-widest uppercase">Initiate Mutual Reveal</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};
