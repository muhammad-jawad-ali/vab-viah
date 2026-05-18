import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { AgTrace } from '../components/AgTrace';

export const FeedbackSurveyScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { matches, currentMatchId } = useAppStore();

  const candidate = matches.find(m => m.id === currentMatchId) || matches[0];

  // Ratings State
  const [chemistry, setChemistry] = useState(0);
  const [alignment, setAlignment] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [notes, setNotes] = useState('');

  const InteractiveStars = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: number; 
    onChange: (v: number) => void 
  }) => (
    <View className="mb-6">
      <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">{label}</Text>
      <View className="flex-row justify-between">
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity 
            key={star} 
            onPress={() => onChange(star)}
            className={`w-12 h-12 rounded-xl border items-center justify-center shadow-sm ${value >= star ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'}`}
          >
            <Text className={`text-xl ${value >= star ? 'opacity-100' : 'opacity-30'}`}>⭐</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const handleSubmit = () => {
    if (chemistry === 0 || alignment === 0 || accuracy === 0) {
      Alert.alert('Incomplete Survey', 'Please calibrate all three values before submitting your assessment.');
      return;
    }

    Alert.alert(
      'Twin Calibrated Successfully!',
      `Bismillah. Your feedback has been analyzed by the Twin Forge Agent. A new version of your AI Twin prompt (V2.0) has been generated in Supabase incorporating these learnings.`,
      [
        {
          text: 'Alhamdulillah',
          onPress: () => navigation.navigate('DiscoverTab', { screen: 'MatchPool' })
        }
      ]
    );
  };

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-slate-50">
      <AgTrace msg="TWIN_FORGE: INITIATING FEEDBACK LOOP CALIBRATION V2.0..." />
      
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        
        <View className="items-center mb-8 mt-4">
          <View className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-full items-center justify-center mb-3">
            <Text className="text-xl">📝</Text>
          </View>
          <Text className="text-amber-600 font-bold text-[10px] uppercase tracking-[0.3em] mb-1">Self-Learning Loop</Text>
          <Text className="text-3.5xl font-serif font-bold text-slate-900 text-center leading-tight">Post-Meeting Assessment</Text>
          <Text className="text-slate-400 text-xs mt-1 text-center">Calibrating values against {candidate.name.split(' ')[0]}</Text>
        </View>

        <View className="bg-emerald-950 p-4 rounded-2xl border border-emerald-900 mb-6 shadow-sm">
          <Text className="text-emerald-300 font-serif text-[12px] italic text-center">
            "Your inputs update your Twin's prompt weighting dynamically in real-time, optimizing future matches."
          </Text>
        </View>

        <InteractiveStars label="Overall Chemistry & Vibe" value={chemistry} onChange={setChemistry} />
        <InteractiveStars label="Deep Values & Deen Alignment" value={alignment} onChange={setAlignment} />
        <InteractiveStars label="AI Twin Representation Accuracy" value={accuracy} onChange={setAccuracy} />

        <View className="mb-6 mt-2">
          <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Private Notes (Self-Learning Input)</Text>
          <TextInput 
            className="bg-white border border-slate-200 rounded-2.5xl p-4 h-28 text-slate-800 shadow-sm"
            placeholder="Share private feedback with your AI Twin regarding this candidate's dealbreakers or habits..."
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <TouchableOpacity 
          onPress={handleSubmit}
          className="bg-emerald-800 py-5 rounded-2xl items-center shadow-xl shadow-emerald-800/10 mb-4"
        >
          <Text className="text-white font-bold text-sm tracking-widest uppercase">Submit Calibration V2.0 ➔</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('DisputeForm')} 
          className="py-4 items-center"
        >
          <Text className="text-rose-600 font-bold text-xs tracking-widest uppercase">Report a Wali/Meeting Issue</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};
