// FeedbackSurveyScreen — POST /feedback/post-meeting with 4 ratings (each
// 1..5) + optional narrative. Backend forges a new Twin v=prev+1 and returns
// the diff. On success we:
//   - Show the "Twin v2 forged" panel with the weights that shifted.
//   - Re-fetch /twin/me so useAppStore.twinSpec reflects the new version.
//   - Mark the meeting as `done` locally.

import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MeetingStackParamList } from '../navigation/types';
import * as Haptics from 'expo-haptics';
import { api } from '../api/client';
import {
  ApiError,
  DIMENSION_LABELS,
  type Dimension,
  type FeedbackResponse,
} from '../api/types';
import { useAppStore } from '../store/useAppStore';

const lightHaptic = () => {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

type Props = {
  navigation: NativeStackNavigationProp<MeetingStackParamList, 'FeedbackSurvey'>;
  route: RouteProp<MeetingStackParamList, 'FeedbackSurvey'>;
};

const RatingRow = ({
  label,
  caption,
  value,
  onChange,
}: {
  label: string;
  caption?: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <View className="mb-5">
    <Text className="text-slate-800 font-semibold text-sm">{label}</Text>
    {caption ? <Text className="text-slate-500 text-[11px] mb-2">{caption}</Text> : null}
    <View className="flex-row gap-3 mt-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => {
            lightHaptic();
            onChange(star);
          }}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`Rate ${label} ${star} of 5`}
          accessibilityState={{ selected: star <= value }}
        >
          <Text style={{ fontSize: 28, opacity: star <= value ? 1 : 0.22 }}>⭐</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export const FeedbackSurveyScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const { meetingId } = route.params;

  const [truthfulness, setTruthfulness] = useState(0);
  const [chemistry, setChemistry] = useState(0);
  const [familyAlignment, setFamilyAlignment] = useState(0);
  const [wouldMeetAgain, setWouldMeetAgain] = useState(0);
  const [narrative, setNarrative] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FeedbackResponse | null>(null);

  const meetingsList = useAppStore((s) => s.meetingsList);
  const completeMeeting = useAppStore((s) => s.completeMeeting);
  const setMeetingStatus = useAppStore((s) => s.setMeetingStatus);
  const setTwinSpec = useAppStore((s) => s.setTwinSpec);

  const currentMeeting = meetingsList.find((m) => m.id === meetingId);
  const matchName = currentMeeting?.matchName || 'Your Match';

  const canSubmit =
    truthfulness > 0 && chemistry > 0 && familyAlignment > 0 && wouldMeetAgain > 0 && !submitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await api.feedback.postMeeting({
        meetingId,
        truthfulness,
        chemistry,
        family_alignment: familyAlignment,
        would_meet_again: wouldMeetAgain,
        ...(narrative.trim().length > 0 ? { narrative: narrative.trim().slice(0, 2000) } : {}),
      });
      setResult(res);
      completeMeeting(meetingId);
      // Re-fetch /twin/me so the rest of the app sees the new version.
      try {
        const me = await api.twin.me();
        setTwinSpec(me.spec);
      } catch {
        // Non-fatal — Twin v2 row exists; we just won't update local mirror.
      }
    } catch (err) {
      const msg = err instanceof ApiError ? `${err.code}: ${err.message}` : 'Could not submit feedback.';
      Alert.alert('Submit failed', msg);
    } finally {
      setSubmitting(false);
    }
  }, [
    canSubmit,
    meetingId,
    truthfulness,
    chemistry,
    familyAlignment,
    wouldMeetAgain,
    narrative,
    completeMeeting,
    setTwinSpec,
  ]);

  const handleRateLater = () => {
    setMeetingStatus(meetingId, 'pending_feedback');
    Alert.alert(
      'Postponed',
      `You can rate the meeting with ${matchName} anytime from the Meetings Log.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background">
      <View className="bg-emerald-950/5 border-b border-emerald-900/10 px-4 py-2 flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-emerald-600 mr-2" />
        <Text
          className="text-emerald-800 font-mono text-[9px] uppercase tracking-widest flex-1"
          numberOfLines={1}
        >
          AG-TRACE // TWIN FORGE · POST-MEETING WITH {matchName.toUpperCase()}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-2 mb-8">
            <Text className="text-primary font-bold text-[10px] uppercase tracking-[0.25em] mb-1">
              After meeting {matchName}
            </Text>
            <Text className="text-slate-900 font-serif text-3xl font-bold">
              {result ? 'Twin v' + result.version + ' forged' : 'Rate the meeting'}
            </Text>
            <Text className="text-slate-500 text-sm mt-1">
              {result
                ? 'Your AI Twin has been recalibrated from your feedback.'
                : 'Your honest feedback retrains your AI Twin for better future matches.'}
            </Text>
          </View>

          {result ? (
            <ResultView result={result} />
          ) : (
            <>
              <View className="bg-surface border border-slate-200 shadow-sm rounded-3xl p-5 mb-5">
                <RatingRow
                  label="Truthfulness"
                  caption="Were they as described in the profile + report?"
                  value={truthfulness}
                  onChange={setTruthfulness}
                />
                <RatingRow
                  label="Chemistry"
                  caption="Did the conversation flow naturally?"
                  value={chemistry}
                  onChange={setChemistry}
                />
                <RatingRow
                  label="Family alignment"
                  caption="How did the family / wali vibe feel?"
                  value={familyAlignment}
                  onChange={setFamilyAlignment}
                />
                <RatingRow
                  label="Would meet again"
                  caption="Open to a second meeting?"
                  value={wouldMeetAgain}
                  onChange={setWouldMeetAgain}
                />
              </View>

              <View className="bg-surface border border-slate-200 shadow-sm rounded-2xl p-4 mb-6">
                <Text className="text-slate-700 font-bold text-sm mb-3">
                  Private notes (optional)
                </Text>
                <TextInput
                  value={narrative}
                  onChangeText={setNarrative}
                  placeholder="What stood out? What would you tell your future Twin to look for?"
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={2000}
                  className="text-slate-800 text-sm leading-relaxed"
                  style={{ minHeight: 100 }}
                />
              </View>

              <TouchableOpacity
                disabled={!canSubmit}
                onPress={() => {
                  lightHaptic();
                  void handleSubmit();
                }}
                accessibilityRole="button"
                accessibilityLabel="Submit ratings and forge a new Twin"
                accessibilityState={{ disabled: !canSubmit }}
                className={`py-5 rounded-2xl items-center shadow-md ${
                  canSubmit ? 'bg-primary shadow-primary/10' : 'bg-slate-200'
                }`}
              >
                {submitting ? (
                  <ActivityIndicator color="#fdfbf7" />
                ) : (
                  <Text
                    className={`font-bold text-xs tracking-widest uppercase ${
                      canSubmit ? 'text-surface' : 'text-slate-400'
                    }`}
                  >
                    Submit & forge Twin v2
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRateLater}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel="Skip and rate later"
                className="mt-4 py-4 rounded-2xl items-center border border-slate-300 bg-transparent"
              >
                <Text className="text-slate-600 font-bold text-xs tracking-widest uppercase">
                  Skip — rate later
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const ResultView = ({ result }: { result: FeedbackResponse }) => {
  const changedEntries = Object.entries(result.weightsChanged) as [
    Dimension,
    { from: number; to: number },
  ][];
  return (
    <>
      <View className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 mb-5">
        <Text className="text-emerald-800 font-bold text-[10px] uppercase tracking-widest mb-2">
          ✓ Twin v{result.version} forged
        </Text>
        <Text className="text-slate-700 text-sm leading-relaxed mb-1">
          Previous Twin: <Text className="font-mono text-xs">{result.previousTwinId.slice(0, 8)}…</Text>
        </Text>
        <Text className="text-slate-700 text-sm leading-relaxed">
          New Twin: <Text className="font-mono text-xs">{result.newTwinId.slice(0, 8)}…</Text>
        </Text>
        <Text className="text-slate-500 text-xs mt-3">
          System prompt {result.systemPromptRefreshed ? 'refreshed' : 'unchanged'} ·{' '}
          {changedEntries.length} weight{changedEntries.length === 1 ? '' : 's'} shifted
        </Text>
      </View>

      {changedEntries.length > 0 ? (
        <View className="bg-surface border border-slate-200 shadow-sm rounded-2xl p-5 mb-5">
          <Text className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-3">
            Dimension weight diff
          </Text>
          {changedEntries.map(([dim, diff]) => {
            const delta = diff.to - diff.from;
            return (
              <View key={dim} className="flex-row items-center mb-3 last:mb-0">
                <Text className="text-slate-700 font-bold text-xs uppercase tracking-wider w-24">
                  {DIMENSION_LABELS[dim]}
                </Text>
                <View className="flex-1 flex-row items-center gap-2">
                  <Text className="text-slate-400 font-mono text-xs">{diff.from.toFixed(2)}</Text>
                  <Text className="text-slate-300 text-base">→</Text>
                  <Text className="text-slate-700 font-mono font-bold text-xs">{diff.to.toFixed(2)}</Text>
                </View>
                <Text
                  style={{ color: delta > 0 ? '#059669' : '#dc2626' }}
                  className="font-mono font-bold text-xs"
                >
                  {delta > 0 ? '+' : ''}
                  {delta.toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View className="bg-surface border border-slate-200 shadow-sm rounded-2xl p-5 mb-5">
          <Text className="text-slate-500 text-xs leading-relaxed">
            Your ratings reinforced the current Twin — no dimension weights shifted
            beyond the 0.005 threshold. The system prompt was still refreshed with
            a note about this meeting.
          </Text>
        </View>
      )}
    </>
  );
};
