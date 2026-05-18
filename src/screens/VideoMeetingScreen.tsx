import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';

export const VideoMeetingScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { matches, currentMatchId } = useAppStore();

  const candidate = matches.find(m => m.id === currentMatchId) || matches[0];

  // Live countdown timer (Halal meeting time limit)
  const [secondsLeft, setSecondsLeft] = useState(900); // 15 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" />
      
      {/* Top Bar Status */}
      <View className="absolute top-12 left-0 right-0 z-10 px-6 flex-row justify-between items-center">
        <View className="bg-red-600/90 px-3.5 py-1.5 rounded-full flex-row items-center shadow-lg">
          <View className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
          <Text className="text-white text-[10px] font-bold tracking-widest uppercase">{formatTime(secondsLeft)}</Text>
        </View>
        
        <View className="bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-800/40">
          <Text className="text-emerald-400 text-[8px] font-mono tracking-[0.2em] uppercase">Halal Call Shield Active</Text>
        </View>
      </View>

      {/* Main Video View (Candidate Camera View - Blurred avatar representation) */}
      <View className="flex-1 bg-[#0f172a] justify-center items-center">
        <View className="w-32 h-32 rounded-full bg-slate-800 border-2 border-amber-500/30 items-center justify-center mb-6">
          <Text className="text-5xl">👱‍♀️</Text>
        </View>
        <Text className="text-white font-serif text-2xl font-bold">{candidate.name}</Text>
        <Text className="text-emerald-400 font-mono text-[9px] uppercase tracking-widest mt-1.5">Incoming Video Stream</Text>
      </View>

      {/* Floating Viewports on the Right (User stream & Wali review stream) */}
      <View className="absolute bottom-32 right-6 gap-4">
        {/* User Viewport */}
        <View className="w-24 h-36 bg-slate-900 rounded-2xl border-2 border-emerald-500/50 overflow-hidden justify-center items-center shadow-lg">
          <Text className="text-3xl">👨</Text>
          <View className="absolute bottom-1 left-0 right-0 items-center bg-black/60 py-1">
            <Text className="text-white text-[8px] font-bold tracking-wide uppercase">You (Live)</Text>
          </View>
        </View>
        
        {/* Wali Viewport */}
        <View className="w-24 h-36 bg-slate-900 rounded-2xl border border-amber-500/50 overflow-hidden justify-center items-center shadow-lg">
          <Text className="text-3xl">🧔‍♂️</Text>
          <View className="absolute bottom-1 left-0 right-0 items-center bg-amber-950/80 py-1">
            <Text className="text-amber-400 text-[8px] font-bold tracking-widest uppercase">Wali Monitor</Text>
          </View>
        </View>
      </View>

      {/* Controls Overlay Bar */}
      <View className="absolute bottom-0 left-0 right-0 h-28 bg-slate-950/90 flex-row justify-center items-center gap-6 pb-6 border-t border-white/5">
        <TouchableOpacity className="w-12 h-12 rounded-full bg-white/10 items-center justify-center border border-white/10">
          <Text className="text-white text-base">🎙️</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('FeedbackSurvey')}
          className="w-16 h-16 rounded-full bg-rose-600 items-center justify-center shadow-lg shadow-rose-600/30"
        >
          <Text className="text-white text-2xl">☎️</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="w-12 h-12 rounded-full bg-white/10 items-center justify-center border border-white/10">
          <Text className="text-white text-base">📷</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};
