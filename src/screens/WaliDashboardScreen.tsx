import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { AgTrace } from '../components/AgTrace';

export const WaliDashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const { matches, user } = useAppStore();
  const [approvedList, setApprovedList] = useState<Record<string, boolean>>({});

  const candidate = matches[0]; // Primary Bilal match

  const handleApprove = (candidateId: string, name: string) => {
    setApprovedList(prev => ({ ...prev, [candidateId]: true }));
    Alert.alert(
      'Wali Approval Logged',
      `Alhamdulillah. You have approved the match brief for ${name}. Both families are now cleared to initiate scheduling.`,
      [{ text: 'JazakAllah' }]
    );
  };

  const handleReviewBrief = (name: string) => {
    Alert.alert(
      'Bilingual Matrimonial Brief',
      `📚 English Brief:\n"Assalam-o-Alaikum. The candidate is a Software Engineer from Karachi. Strictly practicing Sunni values. Respectable family background. Family values are centered on support, accommodating the partner's career practice."\n\n📖 Urdu Brief:\n"السلام علیکم۔ لڑکا بلال کراچی کا رہائشی اور سافٹ ویئر انجینئر ہے۔ دین دار اور پرہیزگار فیملی سے ہے۔ فیملی نے لڑکی کی ملازمت جاری رکھنے کی مکمل حمایت کی ہے۔"`,
      [{ text: 'Close' }]
    );
  };

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-slate-50">
      <AgTrace msg="WALI_AGENT: SYNTHESIZING BILINGUAL BRIEF IN ENGLISH & URDU..." />
      
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-6 mt-4">
          <View>
            <Text className="text-amber-600 font-bold text-xs uppercase tracking-[0.2em] mb-1">Guardian Mode</Text>
            <Text className="text-3.5xl font-serif font-bold text-slate-900 leading-tight">Wali Dashboard</Text>
            <Text className="text-slate-400 text-xs mt-1">Authorized Family Guardian Account</Text>
          </View>
          <View className="w-12 h-12 bg-emerald-100 rounded-full border border-emerald-200 items-center justify-center">
            <Text className="text-xl">🛡️</Text>
          </View>
        </View>

        {/* Dashboard Card */}
        <View className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm mb-6">
          <Text className="text-slate-900 font-serif text-lg font-bold mb-4">Pending Halal Reviews</Text>
          
          {!approvedList[candidate.id] ? (
            <View className="border-l-4 border-amber-500 pl-4 mb-2">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="font-bold text-slate-800 text-[14px]">Meeting Consent: {candidate.name}</Text>
                <Text className="text-[9px] text-slate-400 font-bold uppercase">2h ago</Text>
              </View>
              
              <Text className="text-slate-500 text-[12.5px] leading-relaxed mb-4">
                Both AI Twins reached 94% compatibility. The user has requested to reveal contact details and book an introductory family meeting.
              </Text>
              
              <View className="flex-row gap-3">
                <TouchableOpacity 
                  onPress={() => handleApprove(candidate.id, candidate.name)}
                  className="bg-emerald-800 px-4 py-2.5 rounded-xl shadow-sm"
                >
                  <Text className="text-white font-bold text-xs">APPROVE MEETING</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleReviewBrief(candidate.name)}
                  className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200"
                >
                  <Text className="text-slate-600 font-bold text-xs">READ BRIEF (اردو)</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="border-l-4 border-emerald-600 pl-4 py-1">
              <Text className="font-bold text-emerald-800 text-[14px]">✓ Approved: {candidate.name}</Text>
              <Text className="text-slate-500 text-[12px] mt-1">Wali consent has been locked. Both families have been notified via mock SMS alerts.</Text>
            </View>
          )}
        </View>

        {/* Bilingual Agentic Brief Card */}
        <View className="bg-emerald-950 p-6 rounded-[28px] shadow-lg border border-emerald-900 mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-amber-500 font-bold text-[9px] uppercase tracking-[0.2em] font-mono">Bilingual Wali Briefing</Text>
            <View className="bg-emerald-900 px-2 py-0.5 rounded-full"><Text className="text-emerald-400 font-bold text-[8px] uppercase">Urdu / Eng</Text></View>
          </View>
          
          <Text className="text-emerald-100 font-serif text-[13.5px] leading-relaxed italic mb-4">
            "نیک تمناؤں کے ساتھ۔ لڑکا بلال فیملی کا بڑا بیٹا ہے، کراچی کا رہائشی اور سافٹ ویئر انجینئر ہے۔ دین دار فیملی ہے۔ لڑکے کی فیملی لڑکی کے کیریئر کی مکمل تائید کرتی ہے۔"
          </Text>
          
          <Text className="text-emerald-300 font-serif text-[12.5px] leading-relaxed italic">
            "Candidate Bilal Siddiqui (Karachi) belongs to a respected, religious background. His Twin has negotiated full support for your daughter Ayesha's continued clinical psychology practice."
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};
