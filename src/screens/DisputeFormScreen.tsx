import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MeetingStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<MeetingStackParamList, 'DisputeForm'>;
  route: RouteProp<MeetingStackParamList, 'DisputeForm'>;
};

const CATEGORIES = ['No-Show', 'Misrepresentation', 'Ghosting', 'Family Rejection', 'Other'] as const;
type Category = (typeof CATEGORIES)[number];

export const DisputeFormScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const { matchId, matchName } = route.params;
  const [category, setCategory] = useState<Category | null>(null);
  const [details, setDetails] = useState('');

  const canSubmit = !!category && details.length > 10;

  const handleSubmit = () => {
    Alert.alert(
      '🛡️ Dispute Filed',
      `Your report regarding ${matchName} has been submitted. The Dispute Agent will review this within 24 hours. The user has been temporarily blocked.`,
      [{
        text: 'OK',
        onPress: () =>
          (navigation as any).getParent()?.navigate('ProfileTab', {
            screen: 'BlockModal',
            params: { matchId, matchName },
          }),
      }]
    );
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background">
      <View className="bg-rose-50 border-b border-rose-100 px-4 py-2 flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-rose-500 mr-2" />
        <Text className="text-rose-800 font-mono text-[9px] uppercase tracking-widest flex-1">
          AG-TRACE // DISPUTE AGENT: COLLECTING REPORT · REPUTATION IMPACT PENDING
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-2 mb-6">
          <Text className="text-rose-600 font-bold text-[10px] uppercase tracking-[0.25em] mb-1">Safety Report</Text>
          <Text className="text-slate-900 font-serif text-3xl font-bold">File Dispute</Text>
          <Text className="text-slate-500 text-sm mt-1">Regarding: {matchName}</Text>
        </View>

        <View className="bg-rose-50 border border-rose-100 rounded-2xl p-4 mb-6 flex-row items-start shadow-sm">
          <Text className="text-lg mr-2">⚠️</Text>
          <Text className="text-rose-800 text-xs leading-relaxed flex-1">
            Filing a dispute will temporarily block this match and notify our Dispute Agent. Repeated false reports affect your own reputation score.
          </Text>
        </View>

        <Text className="text-slate-700 font-bold text-sm mb-3">Issue Category</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full border ${
                category === cat
                  ? 'bg-rose-50 border-rose-600'
                  : 'bg-surface border-slate-200'
              }`}
            >
              <Text className={`font-bold text-xs ${category === cat ? 'text-rose-700' : 'text-slate-500'}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="bg-surface border border-slate-200 shadow-sm rounded-2xl p-4 mb-6">
          <Text className="text-slate-700 font-bold text-sm mb-3">Details</Text>
          <TextInput
            value={details}
            onChangeText={setDetails}
            placeholder="Describe the issue in detail. What happened?"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            className="text-slate-800 text-sm leading-relaxed"
            style={{ minHeight: 120 }}
          />
        </View>

        <TouchableOpacity
          disabled={!canSubmit}
          onPress={handleSubmit}
          className={`py-5 rounded-2xl items-center shadow-md ${canSubmit ? 'bg-rose-600 shadow-rose-600/10' : 'bg-slate-200'}`}
        >
          <Text className={`font-bold text-xs tracking-widest uppercase ${canSubmit ? 'text-surface' : 'text-slate-400'}`}>
            Submit Dispute
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
