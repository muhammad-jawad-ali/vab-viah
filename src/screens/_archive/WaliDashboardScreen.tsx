import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_WALI_PENDING } from '../api/mockData';

type PendingItem = (typeof MOCK_WALI_PENDING)[number] & { approved?: boolean; rejected?: boolean };

export const WaliDashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<PendingItem[]>(MOCK_WALI_PENDING);

  const handleAction = (matchId: string, action: 'APPROVE' | 'REJECT') => {
    setItems((prev) =>
      prev.map((item) =>
        item.matchId === matchId
          ? { ...item, approved: action === 'APPROVE', rejected: action === 'REJECT' }
          : item
      )
    );
    Alert.alert(
      action === 'APPROVE' ? '✅ Approved' : '❌ Rejected',
      action === 'APPROVE'
        ? 'The match can now proceed to schedule a first meeting.'
        : 'This match has been declined. The candidate will not be notified.',
      [{ text: 'OK' }]
    );
  };

  const pending = items.filter((i) => !i.approved && !i.rejected);
  const resolved = items.filter((i) => i.approved || i.rejected);

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background">
      {/* AG-Trace */}
      <View className="bg-emerald-950/5 border-b border-emerald-900/10 px-4 py-2 flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-emerald-600 mr-2" />
        <Text className="text-emerald-800 font-mono text-[9px] uppercase tracking-widest flex-1">
          AG-TRACE // WALI AGENT: RISHTA BRIEFS GENERATED · FAMILY REVIEW MODE ACTIVE
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mt-2 mb-6">
          <View>
            <Text className="text-primary font-bold text-[10px] uppercase tracking-[0.25em] mb-1">Guardian Mode</Text>
            <Text className="text-slate-900 font-serif text-3xl font-bold">Wali Dashboard</Text>
          </View>
          <View className="w-12 h-12 bg-primary/5 rounded-full border border-primary/20 items-center justify-center">
            <Text className="text-xl">🛡️</Text>
          </View>
        </View>

        {/* Protocol reminder */}
        <View className="bg-primary-dark border border-primary/20 rounded-[32px] p-5 mb-6 flex-row items-start shadow-xl">
          <Text className="text-lg mr-3">☪️</Text>
          <View className="flex-1">
            <Text className="text-secondary font-bold text-sm mb-1">Halal Reveal Protocol</Text>
            <Text className="text-emerald-100/80 text-xs leading-relaxed">
              All matches are revealed to the Wali first. Your approval is required before any contact is made between families.
            </Text>
          </View>
        </View>

        {/* Pending approvals */}
        {pending.length > 0 && (
          <>
            <Text className="text-slate-800 font-serif text-lg font-bold mb-3">
              Pending Approvals ({pending.length})
            </Text>
            {pending.map((item) => (
              <View key={item.matchId} className="bg-surface border border-slate-200 shadow-sm rounded-[32px] p-6 mb-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 mr-3">
                    <Text className="text-slate-900 font-serif text-xl font-bold">{item.applicantName}</Text>
                    <Text className="text-slate-400 text-xs mt-0.5">{item.timeAgo}</Text>
                  </View>
                  <View className="bg-secondary/10 border border-secondary/30 px-3 py-1 rounded-full">
                    <Text className="text-secondary-dark font-bold text-xs">{item.compatibilityScore}% match</Text>
                  </View>
                </View>

                <View className="border-l-4 border-primary pl-4 mb-4">
                  <Text className="text-slate-600 text-sm leading-relaxed">{item.agentBrief}</Text>
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => handleAction(item.matchId, 'APPROVE')}
                    className="flex-1 bg-primary py-3 rounded-xl items-center shadow-md shadow-primary/10"
                  >
                    <Text className="text-surface font-bold text-xs tracking-widest uppercase">Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleAction(item.matchId, 'REJECT')}
                    className="flex-1 border border-rose-200 bg-rose-50/50 py-3 rounded-xl items-center"
                  >
                    <Text className="text-rose-700 font-bold text-xs tracking-widest uppercase">Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Empty pending state */}
        {pending.length === 0 && (
          <View className="items-center py-12">
            <Text className="text-4xl mb-3">🌙</Text>
            <Text className="text-slate-800 font-bold text-base mb-1">No pending approvals</Text>
            <Text className="text-slate-500 text-sm text-center">You will be notified when a new rishta brief is ready for review.</Text>
          </View>
        )}

        {/* Resolved */}
        {resolved.length > 0 && (
          <>
            <Text className="text-primary font-bold text-xs uppercase tracking-widest mt-6 mb-3">Resolved</Text>
            {resolved.map((item) => (
              <View key={item.matchId} className="bg-surface border border-slate-200 rounded-2xl p-4 mb-3 flex-row items-center shadow-sm">
                <Text className="text-lg mr-3">{item.approved ? '✅' : '❌'}</Text>
                <View className="flex-1">
                  <Text className="text-slate-800 font-bold">{item.applicantName}</Text>
                  <Text className="text-slate-500 text-xs">{item.approved ? 'Approved — awaiting meeting schedule' : 'Declined'}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};
