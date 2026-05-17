import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';

export const BlockModalScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { matches, currentMatchId } = useAppStore();

  const candidate = matches.find(m => m.id === currentMatchId) || matches[0];

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-emerald-950/95 justify-center p-6">
      <View className="bg-white rounded-[40px] p-8 items-center shadow-2xl">
        <View className="w-20 h-20 bg-rose-50 rounded-full items-center justify-center mb-6 border-8 border-slate-50 shadow-sm">
          <Text className="text-4xl">🛑</Text>
        </View>
        
        <Text className="text-3xl font-serif font-bold text-slate-900 mb-2 text-center">Candidate Blocked</Text>
        <Text className="text-slate-500 text-center mb-8 leading-relaxed text-sm">
          <Text className="font-bold text-slate-800">{candidate.name}</Text> has been permanently blocked. Your dispute report has been ingested, and the Dispute Agent is applying appropriate reputation adjustments. You will no longer see this candidate.
        </Text>

        <TouchableOpacity 
          onPress={() => navigation.navigate('DiscoverTab', { screen: 'MatchPool' })}
          className="w-full bg-emerald-800 py-5 rounded-2xl items-center shadow-lg shadow-emerald-800/10 mb-4"
        >
          <Text className="text-white font-bold text-sm tracking-widest uppercase">Return to Match Pool</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('ProfileTab', { screen: 'HelpDesk' })} 
          className="py-2"
        >
          <Text className="text-slate-400 font-bold text-xs tracking-widest uppercase">Contact Help Desk</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
