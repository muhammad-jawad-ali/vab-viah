import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { AgTrace } from '../components/AgTrace';

export const DisputeFormScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { matches, currentMatchId } = useAppStore();
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  const candidate = matches.find(m => m.id === currentMatchId) || matches[0];

  const issues = [
    'No-Show at Venue',
    'Invalid Wali Contact',
    'Misrepresented Profile',
    'Inappropriate Behavior',
    'Other'
  ];

  const handleSubmit = () => {
    if (!selectedIssue) {
      Alert.alert('Selection Required', 'Please select a category that matches the incident.');
      return;
    }
    if (!details.trim()) {
      Alert.alert('Details Required', 'Please explain exactly what occurred during the meeting.');
      return;
    }

    // Go to Block Modal
    navigation.navigate('BlockModal');
  };

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-slate-50">
      <AgTrace msg="DISPUTE_AGENT: CONTEXT INGESTION FOR REPUTATION SCORE PENALIZATION..." />
      
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        
        <View className="mb-6 mt-4 border-b border-rose-100 pb-5">
          <Text className="text-rose-600 font-bold text-xs uppercase tracking-[0.2em] mb-1">Safety & Accountability</Text>
          <Text className="text-3.5xl font-serif font-bold text-slate-900 leading-tight">File a Dispute</Text>
          <Text className="text-slate-400 text-xs mt-1">Our Dispute Agent reviews conflicting perspectives within 2 hours.</Text>
        </View>

        <Text className="text-rose-950 font-serif font-bold text-base mb-1.5">Reporting Candidate: {candidate.name}</Text>
        <Text className="text-slate-500 text-xs mb-6 leading-relaxed">
          Matches are built on absolute respect. If a candidate violates Islamic etiquette, falsifies records, or fails to attend, report them below immediately.
        </Text>

        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Category of Issue</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {issues.map(issue => (
            <TouchableOpacity 
              key={issue}
              onPress={() => setSelectedIssue(issue)}
              className={`px-4 py-3 rounded-2xl border-2 ${selectedIssue === issue ? 'bg-rose-50 border-rose-600' : 'bg-white border-slate-100 shadow-sm'}`}
            >
              <Text className={`font-bold text-[12px] ${selectedIssue === issue ? 'text-rose-600' : 'text-slate-600'}`}>{issue}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mb-6">
          <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Incident Details</Text>
          <TextInput 
            className="bg-white border border-slate-200 rounded-2.5xl p-4 h-36 text-slate-800 shadow-sm"
            placeholder="Describe the exact timeline, what happened, and any witnesses. Clear details speed up the mediation verdict."
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
            value={details}
            onChangeText={setDetails}
          />
        </View>

        <View className="bg-rose-50 p-4 rounded-2.5xl border border-rose-100 mb-8 flex-row items-start">
          <Text className="text-rose-600 mr-2.5">⚠️</Text>
          <Text className="flex-1 text-rose-800 text-[11.5px] leading-relaxed font-bold">
            Filing a false report violates our halal trust terms. If proven intentional, the file-creator will receive an immediate permanent ban.
          </Text>
        </View>

        <TouchableOpacity 
          onPress={handleSubmit}
          className="bg-rose-600 py-5 rounded-2xl items-center shadow-xl shadow-rose-600/10 mb-10"
        >
          <Text className="text-white font-bold text-sm tracking-widest uppercase">Submit Dispute & Block Candidate ➔</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};
