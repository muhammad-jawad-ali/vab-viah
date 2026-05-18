import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MeetingStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';

type Props = {
  navigation: NativeStackNavigationProp<MeetingStackParamList, 'FeedbackSurvey'>;
  route: RouteProp<MeetingStackParamList, 'FeedbackSurvey'>;
};

const StarRating = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <View className="mb-6">
    <Text className="text-slate-700 font-semibold text-sm mb-3">{label}</Text>
    <View className="flex-row gap-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onChange(star)}>
          <Text style={{ fontSize: 28, opacity: star <= value ? 1 : 0.25 }}>⭐</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export const FeedbackSurveyScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const { meetingId } = route.params;
  const [chemistry, setChemistry] = useState(0);
  const [values, setValues] = useState(0);
  const [twinAccuracy, setTwinAccuracy] = useState(0);
  const [notes, setNotes] = useState('');
  
  const { meetingsList, completeMeeting, setMeetingStatus } = useAppStore();
  const currentMeeting = meetingsList.find((m) => m.id === meetingId);
  const matchName = currentMeeting?.matchName || 'Your Match';

  const canSubmit = chemistry > 0 && values > 0 && twinAccuracy > 0;

  const handleSubmit = () => {
    completeMeeting(meetingId);
    navigation.goBack();
  };

  const handleRateLater = () => {
    if (meetingId) {
      setMeetingStatus(meetingId, 'pending_feedback');
    }
    Alert.alert(
      '⚠️ Postponed Calibration',
      `You have opted to rate your meeting with ${matchName} later. You can access it anytime under the Meetings Log.`,
      [{ text: 'Okay', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background">
      <View className="bg-emerald-950/5 border-b border-emerald-900/10 px-4 py-2 flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-emerald-600 mr-2" />
        <Text className="text-emerald-800 font-mono text-[9px] uppercase tracking-widest flex-1">
          AG-TRACE // TWIN FORGE: RECALIBRATING WEIGHTS FROM FEEDBACK · MEETING WITH {matchName.toUpperCase()}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-2 mb-8">
          <Text className="text-primary font-bold text-[10px] uppercase tracking-[0.25em] mb-1">Post-Meeting with {matchName}</Text>
          <Text className="text-slate-900 font-serif text-3xl font-bold">Rate Your Experience</Text>
          <Text className="text-slate-500 text-sm mt-1">Your feedback trains your AI Twin for better future matches with {matchName}.</Text>
        </View>

        <View className="bg-surface border border-slate-200 shadow-sm rounded-3xl p-5 mb-6">
          <StarRating label="Chemistry & Connection" value={chemistry} onChange={setChemistry} />
          <StarRating label="Shared Values Alignment" value={values} onChange={setValues} />
          <StarRating label="Twin Accuracy (did it represent you well?)" value={twinAccuracy} onChange={setTwinAccuracy} />
        </View>

        <View className="bg-surface border border-slate-200 shadow-sm rounded-2xl p-4 mb-6">
          <Text className="text-slate-700 font-bold text-sm mb-3">Private Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="How did the meeting go? These notes are private and help improve your Twin..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="text-slate-800 text-sm leading-relaxed"
            style={{ minHeight: 100 }}
          />
        </View>

        <TouchableOpacity
          disabled={!canSubmit}
          onPress={handleSubmit}
          className={`py-5 rounded-2xl items-center shadow-md ${canSubmit ? 'bg-primary shadow-primary/10' : 'bg-slate-200'}`}
        >
          <Text className={`font-bold text-xs tracking-widest uppercase ${canSubmit ? 'text-surface' : 'text-slate-400'}`}>
            Submit Feedback
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRateLater}
          className="mt-4 py-4 rounded-2xl items-center border border-slate-300 bg-transparent"
        >
          <Text className="text-slate-600 font-bold text-xs tracking-widest uppercase">
            Skip & Rate Later
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
