import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';

export const DisputeFormScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  const issues = ['No-show', 'Misrepresentation', 'Inappropriate Behavior', 'Ghosting', 'Other'];

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-background">
      <ScrollView className="p-6">
        
        <View className="mb-8 mt-4 border-b border-danger/20 pb-6">
          <Text className="text-danger font-bold text-xs uppercase tracking-[0.2em] mb-2">Safety & Trust</Text>
          <Text className="text-4xl font-serif font-bold text-slate-900 leading-tight">File a Dispute</Text>
          <Text className="text-slate-500 mt-2">Our human moderation team reviews all disputes within 2 hours.</Text>
        </View>

        <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1">Category of Issue</Text>
        <View className="flex-row flex-wrap gap-3 mb-8">
          {issues.map(issue => (
            <TouchableOpacity 
              key={issue}
              onPress={() => setSelectedIssue(issue)}
              className={`px-4 py-3 rounded-xl border ${selectedIssue === issue ? 'bg-danger border-danger' : 'bg-white border-slate-200 shadow-sm'}`}
            >
              <Text className={`font-bold text-sm ${selectedIssue === issue ? 'text-white' : 'text-slate-600'}`}>{issue}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mb-8">
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Incident Details</Text>
          <TextInput 
            className="bg-white border border-slate-200 rounded-2xl p-4 h-40 text-slate-800 shadow-sm"
            placeholder="Please provide specific details..."
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
          />
        </View>

        <View className="bg-danger/5 p-4 rounded-2xl border border-danger/10 mb-8 flex-row items-start">
          <Text className="text-danger mr-3 mt-0.5">⚠️</Text>
          <Text className="flex-1 text-danger text-xs leading-relaxed font-semibold">
            Filing a false dispute violates our Terms of Service. If proven true, the offending party will face an immediate ban.
          </Text>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('BlockModal')}
          className="bg-danger py-5 rounded-2xl items-center shadow-lg shadow-danger/20 mb-12"
        >
          <Text className="text-white font-bold text-sm tracking-widest uppercase">Submit & Block User</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};
