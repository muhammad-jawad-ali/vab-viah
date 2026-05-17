import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export const WaliDashboardScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-background">
      <ScrollView className="p-6">
        <View className="flex-row justify-between items-end mb-8 mt-4">
          <View>
            <Text className="text-secondary font-bold text-xs uppercase tracking-[0.2em] mb-1">Guardian Mode</Text>
            <Text className="text-3xl font-serif font-bold text-slate-900">Wali Dashboard</Text>
          </View>
          <View className="w-12 h-12 bg-primary/10 rounded-full border border-primary/20 items-center justify-center">
            <Text className="text-xl">🛡️</Text>
          </View>
        </View>

        <View className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
          <Text className="text-slate-800 font-bold text-lg mb-4">Pending Approvals</Text>
          
          <View className="border-l-4 border-secondary pl-4 mb-4">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="font-bold text-slate-900">Meeting Request: Ayesha K.</Text>
              <Text className="text-[10px] text-slate-400 font-bold">2h ago</Text>
            </View>
            <Text className="text-slate-500 text-sm leading-relaxed mb-3">Both AI Twins reached 94% compatibility. The user has initiated a Halal Reveal request.</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity className="bg-primary px-4 py-2 rounded-xl"><Text className="text-surface font-bold text-xs">APPROVE</Text></TouchableOpacity>
              <TouchableOpacity className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200"><Text className="text-slate-600 font-bold text-xs">REVIEW BRIEF</Text></TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="bg-primary-dark p-6 rounded-3xl shadow-xl">
          <Text className="text-secondary font-bold text-xs uppercase tracking-[0.2em] mb-2">Agentic Briefing</Text>
          <Text className="text-surface/90 font-serif text-lg leading-relaxed italic">
            "Candidate family belongs to the same sect. Father is retired military. The twin negotiation confirmed strict adherence to Islamic boundaries regarding post-marriage employment."
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};
