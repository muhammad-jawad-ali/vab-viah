import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { AgTrace } from '../components/AgTrace';

export const MatchPoolScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { matches, setCurrentMatchId } = useAppStore();

  const activeMatchesCount = matches.filter(m => m.status !== 'revealed').length;

  const handleSelectCandidate = (candidateId: string) => {
    setCurrentMatchId(candidateId);
    navigation.navigate('TwinDebate');
  };

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-slate-50">
      <AgTrace msg="MATCHMAKER_AGENT: DISCOVERING COMPATIBLE AI TWINS..." />
      
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        
        <View className="flex-row justify-between items-center mt-4 mb-6">
          <View>
            <Text className="text-amber-600 font-bold text-xs uppercase tracking-[0.2em] mb-1">Halal Matchmaker</Text>
            <Text className="text-3.5xl font-serif font-bold text-slate-900 leading-tight">Match Pool</Text>
            <Text className="text-slate-400 text-xs mt-1">Surfaced from Deep Agentic Debates</Text>
          </View>
          <View className="bg-emerald-100 px-4 py-2 rounded-full border border-emerald-200">
            <Text className="text-emerald-800 font-bold text-[10px] tracking-wider uppercase">{activeMatchesCount} ACTIVE</Text>
          </View>
        </View>

        {matches.map(match => (
          <TouchableOpacity 
            key={match.id}
            onPress={() => handleSelectCandidate(match.id)}
            className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100 mb-5 flex-row items-center"
          >
            {/* Blurred Avatar to conform to Halal standards before mutual consent */}
            <View className="w-18 h-18 rounded-2xl overflow-hidden mr-4 border-2 border-slate-100 bg-slate-50 items-center justify-center">
              <Image 
                source={{ uri: match.blurAvatar }} 
                className="w-full h-full opacity-60" 
                blurRadius={12} 
              />
              <View className="absolute inset-0 bg-emerald-900/10 items-center justify-center">
                <Text className="text-xs text-white opacity-85">🔒</Text>
              </View>
            </View>
            
            <View className="flex-1">
              <View className="flex-row justify-between items-start mb-1">
                <View>
                  <Text className="text-lg font-bold text-slate-900">{match.name}</Text>
                  <Text className="text-slate-400 text-[11px] font-medium mt-0.5">
                    {match.age} yrs • {match.city} • {match.profession}
                  </Text>
                </View>
                
                <View className="items-end">
                  <Text className="text-emerald-800 font-serif font-bold text-lg">{match.compatibility}%</Text>
                  <Text className="text-slate-400 text-[8px] tracking-wider uppercase font-bold mt-0.5">MATCH</Text>
                </View>
              </View>
              
              <View className="flex-row flex-wrap gap-1.5 mt-2.5">
                {match.tags.map(tag => (
                  <View key={tag} className="bg-slate-50 border border-slate-200/60 px-2 py-1 rounded-lg">
                    <Text className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">{tag}</Text>
                  </View>
                ))}
              </View>

              {/* Status bar */}
              <View className="mt-3 pt-3 border-t border-slate-50 flex-row justify-between items-center">
                <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {match.status === 'new' ? '⚡ Click to begin AI debate' : match.status === 'negotiating' ? '💬 Debate in progress' : '✓ Verdict Unlocked'}
                </Text>
                <View className={`w-2.5 h-2.5 rounded-full ${match.status === 'new' ? 'bg-amber-400' : match.status === 'negotiating' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-3xl mt-2 mb-10">
          <Text className="text-amber-800 font-serif font-bold text-sm mb-1">🔒 Halal Reveal Privacy Protocol</Text>
          <Text className="text-slate-500 text-xs leading-relaxed">
            In compliance with Islamic family values, full identity profiles are only unlocked once both Wali representatives review and approve the dynamic compatibility report.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};
