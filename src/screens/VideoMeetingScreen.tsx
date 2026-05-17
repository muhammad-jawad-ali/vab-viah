import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { View, Text, TouchableOpacity, StatusBar } from 'react-native';

export const VideoMeetingScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      {/* Top Bar */}
      <View className="absolute top-12 left-0 right-0 z-10 px-6 flex-row justify-between items-center">
        <View className="bg-danger/80 px-3 py-1 rounded-full flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
          <Text className="text-white text-[10px] font-bold tracking-widest uppercase">04:23</Text>
        </View>
        <Text className="text-white/50 text-[10px] font-mono tracking-[0.2em] uppercase">E2E Encrypted</Text>
      </View>

      {/* Main Video View (Match) */}
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <Text className="text-white/20 text-4xl">👱‍♀️</Text>
        <Text className="text-white/30 font-serif mt-4">Ayesha K.</Text>
      </View>

      {/* Floating Viewports */}
      <View className="absolute bottom-32 right-6 gap-4">
        {/* User Viewport */}
        <View className="w-24 h-36 bg-slate-800 rounded-2xl border-2 border-primary-light/50 overflow-hidden justify-center items-center">
          <Text className="text-white/30 text-2xl">👨</Text>
          <View className="absolute bottom-1 left-0 right-0 items-center">
            <Text className="text-white/70 text-[8px] font-bold bg-black/50 px-2 rounded-full">You</Text>
          </View>
        </View>
        {/* Wali Viewport */}
        <View className="w-24 h-36 bg-slate-800 rounded-2xl border border-secondary/50 overflow-hidden justify-center items-center shadow-lg shadow-secondary/20">
          <Text className="text-white/30 text-2xl">🧔‍♂️</Text>
          <View className="absolute bottom-1 left-0 right-0 items-center">
            <Text className="text-secondary text-[8px] font-bold bg-black/80 px-2 py-0.5 rounded-full uppercase tracking-wider">Wali Stream</Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black to-transparent flex-row justify-center items-center gap-6 pb-6">
        <TouchableOpacity className="w-12 h-12 rounded-full bg-white/10 items-center justify-center">
          <Text className="text-white">🎙️</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('FeedbackSurvey')}
          className="w-16 h-16 rounded-full bg-danger items-center justify-center shadow-lg shadow-danger/50"
        >
          <Text className="text-white text-2xl">☎️</Text>
        </TouchableOpacity>
        <TouchableOpacity className="w-12 h-12 rounded-full bg-white/10 items-center justify-center">
          <Text className="text-white">📷</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};
