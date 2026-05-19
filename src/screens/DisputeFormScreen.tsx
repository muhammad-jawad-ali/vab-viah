// DisputeFormScreen — POST /dispute/file with {meetingId, filedBy, type,
// narrative} → render the returned DisputeResolution (severity + action +
// rationale + reputation_impact). handle_dispute workplan also emits trace
// events; we subscribe via useTraceStream for a live "Reviewing your
// dispute…" indicator while the call is in flight.
//
// Route param naming note: MeetingStackParamList.DisputeForm carries
// `matchId` for legacy reasons — we treat it as the meetingId for /dispute/file.

import React, { useCallback, useEffect, useState } from 'react';
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
import { api } from '../api/client';
import {
  ApiError,
  type DisputeResolution,
  type DisputeType,
} from '../api/types';
import { useTraceStream } from '../hooks/useTraceStream';

type Props = {
  navigation: NativeStackNavigationProp<MeetingStackParamList, 'DisputeForm'>;
  route: RouteProp<MeetingStackParamList, 'DisputeForm'>;
};

type CategoryOption = {
  value: DisputeType;
  label: string;
};

const CATEGORIES: CategoryOption[] = [
  { value: 'no_show', label: 'No-show' },
  { value: 'misrepresentation', label: 'Misrepresentation' },
  { value: 'ghosting', label: 'Ghosting' },
  { value: 'family_rejection', label: 'Family rejection' },
  { value: 'other', label: 'Other' },
];

const ACTION_LABEL: Record<DisputeResolution['action'], string> = {
  no_action: 'No action',
  warning: 'Warning issued',
  shadowban: 'Account restricted',
  flag_for_human_review: 'Escalated to review',
  mutual_close: 'Mutual close',
};

const SEVERITY_LABEL: Record<DisputeResolution['severity'], string> = {
  1: 'Minor',
  2: 'Low',
  3: 'Moderate',
  4: 'Serious',
  5: 'Severe',
};

export const DisputeFormScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const { matchId: meetingId, matchName } = route.params;

  const [category, setCategory] = useState<DisputeType | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resolution, setResolution] = useState<DisputeResolution | null>(null);
  const [flowId, setFlowId] = useState<string | null>(null);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  const canSubmit = category !== null && details.trim().length >= 10 && !submitting;

  // Subscribe to /stream/:flowId while the dispute is being mediated. Backend
  // closes the trace within ~2s of the request returning so this is mostly a
  // visible "things are happening" signal.
  const trace = useTraceStream(flowId);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || category === null) return;
    setSubmitting(true);
    setSubmitErr(null);
    try {
      const res = await api.dispute.file({
        meetingId,
        filedBy: 'user',
        type: category,
        narrative: details.trim().slice(0, 2000),
      });
      setFlowId(res.flowId);
      setResolution(res.resolution);
    } catch (err) {
      const msg = err instanceof ApiError ? `${err.code}: ${err.message}` : 'Could not file dispute.';
      setSubmitErr(msg);
      Alert.alert('File failed', msg);
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, category, details, meetingId]);

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background">
      <View className="bg-rose-50 border-b border-rose-100 px-4 py-2 flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-rose-500 mr-2" />
        <Text className="text-rose-800 font-mono text-[9px] uppercase tracking-widest flex-1" numberOfLines={1}>
          AG-TRACE // DISPUTE AGENT
          {flowId ? ` · FLOW ${flowId.slice(0, 18)}… · ${trace.events.length} EVENTS` : ' · STANDBY'}
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-2 mb-6">
            <Text className="text-rose-600 font-bold text-[10px] uppercase tracking-[0.25em] mb-1">
              Safety Report
            </Text>
            <Text className="text-slate-900 font-serif text-3xl font-bold">File Dispute</Text>
            <Text className="text-slate-500 text-sm mt-1">Regarding: {matchName}</Text>
          </View>

          {resolution ? (
            <ResolutionView resolution={resolution} matchName={matchName} onBack={() => navigation.goBack()} />
          ) : (
            <>
              <View className="bg-rose-50 border border-rose-100 rounded-2xl p-4 mb-6 flex-row items-start shadow-sm">
                <Text className="text-lg mr-2">⚠️</Text>
                <Text className="text-rose-800 text-xs leading-relaxed flex-1">
                  Filing a dispute opens a moderation case. Our Dispute agent reviews
                  both narratives and issues a ruling — repeated false reports reduce
                  your own reputation score.
                </Text>
              </View>

              <Text className="text-slate-700 font-bold text-sm mb-3">Issue category</Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    onPress={() => setCategory(cat.value)}
                    className={`px-4 py-2 rounded-full border ${
                      category === cat.value
                        ? 'bg-rose-50 border-rose-600'
                        : 'bg-surface border-slate-200'
                    }`}
                  >
                    <Text
                      className={`font-bold text-xs ${
                        category === cat.value ? 'text-rose-700' : 'text-slate-500'
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="bg-surface border border-slate-200 shadow-sm rounded-2xl p-4 mb-3">
                <Text className="text-slate-700 font-bold text-sm mb-3">
                  What happened? <Text className="text-slate-400 font-normal">({details.trim().length}/10 min)</Text>
                </Text>
                <TextInput
                  value={details}
                  onChangeText={setDetails}
                  placeholder="Describe the issue clearly. At least 10 characters — up to 2000."
                  placeholderTextColor="#94a3b8"
                  multiline
                  maxLength={2000}
                  textAlignVertical="top"
                  className="text-slate-800 text-sm leading-relaxed"
                  style={{ minHeight: 120 }}
                />
              </View>

              {submitErr ? (
                <View className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-3">
                  <Text className="text-rose-700 text-xs">{submitErr}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                disabled={!canSubmit}
                onPress={handleSubmit}
                className={`py-5 rounded-2xl items-center shadow-md ${
                  canSubmit ? 'bg-rose-600 shadow-rose-600/10' : 'bg-slate-200'
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
                    Submit Dispute
                  </Text>
                )}
              </TouchableOpacity>

              {submitting || (flowId && !resolution) ? (
                <View className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  <Text className="text-emerald-800 font-mono text-[10px] uppercase tracking-widest text-center">
                    Reviewing your dispute…
                  </Text>
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// =========================================================================
// ResolutionView — what the dispute agent ruled.
// =========================================================================

const ResolutionView = ({
  resolution,
  matchName,
  onBack,
}: {
  resolution: DisputeResolution;
  matchName: string;
  onBack: () => void;
}) => {
  const severityColor =
    resolution.severity >= 4
      ? '#dc2626'
      : resolution.severity >= 3
        ? '#f59e0b'
        : '#059669';
  return (
    <>
      <View className="bg-surface border border-slate-200 shadow-sm rounded-3xl p-6 mb-5">
        <View className="flex-row items-center mb-3">
          <View
            style={{ backgroundColor: severityColor + '22', borderColor: severityColor + '60' }}
            className="px-3 py-1 rounded-full border mr-2"
          >
            <Text style={{ color: severityColor }} className="font-mono font-bold text-[10px] uppercase tracking-widest">
              Severity {resolution.severity} · {SEVERITY_LABEL[resolution.severity]}
            </Text>
          </View>
          {resolution.escalated ? (
            <View className="bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
              <Text className="text-amber-700 font-bold text-[10px] uppercase tracking-widest">
                Escalated
              </Text>
            </View>
          ) : null}
        </View>
        <Text className="text-slate-900 font-serif text-xl font-bold mb-1">
          {ACTION_LABEL[resolution.action]}
        </Text>
        <Text className="text-slate-500 text-xs mb-4">Action chosen by the Dispute agent</Text>

        <View className="border-l-2 border-rose-300 pl-3 mb-4">
          <Text className="text-slate-700 text-sm leading-relaxed italic">
            "{resolution.rationale}"
          </Text>
        </View>

        {resolution.reputation_impact.length > 0 ? (
          <View className="mb-3">
            <Text className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-2">
              Reputation deltas
            </Text>
            {resolution.reputation_impact.map((r, i) => (
              <View key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-1.5">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-slate-700 text-[11px] font-bold uppercase tracking-widest">
                    {r.party === 'filer' ? 'You' : matchName}
                  </Text>
                  <Text
                    style={{ color: r.delta < 0 ? '#dc2626' : '#059669' }}
                    className="font-mono font-bold text-xs"
                  >
                    {r.delta.toFixed(2)}
                  </Text>
                </View>
                <Text className="text-slate-500 text-xs leading-relaxed">{r.reason}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {resolution.blocklist_changes.length > 0 ? (
          <View>
            <Text className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1.5">
              Blocklist updates
            </Text>
            {resolution.blocklist_changes.map((b, i) => (
              <Text key={i} className="text-slate-700 text-xs">
                {b.party === 'filer' ? 'You' : matchName} blocked twin {b.blockedTwinId.slice(0, 8)}…
              </Text>
            ))}
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={onBack}
        className="bg-primary py-5 rounded-2xl items-center shadow-md shadow-primary/10"
      >
        <Text className="text-surface font-bold text-xs tracking-widest uppercase">Back to Meetings</Text>
      </TouchableOpacity>
    </>
  );
};
