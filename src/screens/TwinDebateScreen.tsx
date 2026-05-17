import React, { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/useAppStore';

const Trace = ({ msg }: { msg: string }) => (
  <View className="bg-primary-dark border-b border-primary/20 px-4 py-1.5 flex-row items-center">
    <View className="w-2 h-2 bg-secondary rounded-full mr-2" />
    <Text className="text-secondary-light font-mono text-[9px] uppercase tracking-widest flex-1">AG-TRACE // {msg}</Text>
  </View>
);

export const TwinDebateScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { debateLog } = useAppStore();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setProgress(p => Math.min(p + 5, 94)), 500);
    return () => clearInterval(i);
  }, []);

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-[#020617]">
      <Trace msg="MODERATOR: INITIATING DEEP VALUE NEGOTIATION..." />
      
      <View className="p-6 items-center border-b border-white/5">
        <Text className="text-white/40 font-bold text-[10px] uppercase tracking-[0.3em] mb-2">Live Compatibility</Text>
        <Text className="text-secondary font-serif text-5xl font-bold">{progress}%</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        {debateLog.map((log, index) => (
          <View key={index} className={`mb-6 max-w-[85%] ${log.speaker === 'userTwin' ? 'self-end' : log.speaker === 'moderator' ? 'self-center w-full' : 'self-start'}`}>
            {log.speaker === 'moderator' ? (
              <View className="bg-secondary/10 border border-secondary/30 p-3 rounded-lg items-center">
                <Text className="text-secondary-light font-mono text-[10px] uppercase text-center">{log.text}</Text>
              </View>
            ) : (
              <View>
                <Text className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${log.speaker === 'userTwin' ? 'text-primary-light text-right' : 'text-accent text-left'}`}>
                  {log.speaker === 'userTwin' ? 'Your Twin' : 'Candidate Twin'}
                </Text>
                <View className={`p-4 rounded-2xl ${log.speaker === 'userTwin' ? 'bg-primary-dark border border-primary/50 rounded-tr-sm' : 'bg-slate-800 border border-slate-700 rounded-tl-sm'}`}>
                  <Text className="text-white font-serif text-sm leading-relaxed">"{log.text}"</Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View className="p-6 bg-slate-900 border-t border-white/5">
        <TouchableOpacity 
          onPress={() => navigation.navigate('CompatibilityReport')}
          className="bg-primary py-4 rounded-xl items-center"
        >
          <Text className="text-surface font-bold text-xs tracking-widest uppercase">Analyze Full Report</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};
