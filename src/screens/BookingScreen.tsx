import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MeetingStackParamList } from '../navigation/types';
import { MOCK_SLOTS } from '../api/mockData';

type Props = {
  navigation: NativeStackNavigationProp<MeetingStackParamList, 'Booking'>;
  route: RouteProp<MeetingStackParamList, 'Booking'>;
};

export const BookingScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const { matchId, matchName } = route.params || {};
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (!selectedSlot || !matchId) return;
    setConfirmed(true);
    const slot = MOCK_SLOTS.find((s) => s.slotId === selectedSlot);
    Alert.alert(
      '📅 Meeting Confirmed',
      `Your meeting with ${matchName} has been scheduled for ${slot?.displayDay} at ${slot?.displayTime}. Both Walis have been notified via SMS.`,
      [{
        text: 'View Meeting',
        onPress: () =>
          navigation.navigate('VideoMeeting', {
            meetingId: `meet_${matchId}`,
            meetingUrl: `https://labviah.app/meet/${matchId}`,
            matchName: matchName || '',
          }),
      }]
    );
  };

  if (!matchId) {
    return (
      <View style={{ paddingTop: insets.top }} className="flex-1 bg-background justify-center items-center px-8">
        <View className="w-20 h-20 bg-primary/5 rounded-full items-center justify-center mb-6 border border-primary/10">
          <Text className="text-4xl text-primary">📅</Text>
        </View>
        <Text className="text-2xl font-serif font-bold text-slate-900 text-center mb-2">No Active Booking</Text>
        <Text className="text-slate-500 text-sm text-center mb-8 leading-relaxed">
          Select a profile from your Match Pool, initiate a Halal Reveal, and schedule your moderator-guided conversation.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('DiscoverTab' as any)}
          className="bg-primary px-8 py-4 rounded-xl shadow-lg shadow-primary/20"
        >
          <Text className="text-surface font-bold text-xs tracking-widest uppercase">Explore Matches ➔</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background">
      {/* AG-Trace */}
      <View className="bg-emerald-950/5 border-b border-emerald-900/10 px-4 py-2 flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-emerald-600 mr-2" />
        <Text className="text-emerald-800 font-mono text-[9px] uppercase tracking-widest flex-1">
          AG-TRACE // BOOKING AGENT: HALAL VENUES IDENTIFIED · WALIS NOTIFIED · SLOTS GENERATED
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-2 mb-6">
          <Text className="text-primary font-bold text-[10px] uppercase tracking-[0.25em] mb-1">Halal Reveal Confirmed</Text>
          <Text className="text-slate-900 font-serif text-3xl font-bold">Schedule Meeting</Text>
          <Text className="text-slate-500 text-sm mt-1">with {matchName}</Text>
        </View>

        {/* Wali status */}
        <View className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6 flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-emerald-500 mr-3" />
          <Text className="text-emerald-800 font-semibold text-sm flex-1">
            Both Walis have reviewed the rishta brief and approved contact.
          </Text>
        </View>

        {/* Slots */}
        <Text className="text-slate-800 font-serif text-lg font-bold mb-3">Proposed Slots</Text>
        {MOCK_SLOTS.map((slot) => {
          const isSelected = selectedSlot === slot.slotId;
          return (
            <TouchableOpacity
              key={slot.slotId}
              onPress={() => setSelectedSlot(slot.slotId)}
              className={`rounded-2xl p-5 mb-4 border ${
                isSelected
                  ? 'bg-primary/5 border-primary shadow-sm'
                  : 'bg-surface border-slate-200 shadow-sm'
              }`}
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className={`font-bold text-base ${isSelected ? 'text-primary' : 'text-slate-800'}`}>
                  {slot.displayDay}
                </Text>
                <Text className={`font-mono font-bold text-sm ${isSelected ? 'text-primary-light' : 'text-slate-500'}`}>
                  {slot.displayTime}
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className={`px-2 py-0.5 rounded-md mr-2 ${slot.type === 'Virtual' ? 'bg-blue-50 border border-blue-100' : 'bg-purple-50 border border-purple-100'}`}>
                  <Text className={`text-[9px] font-bold uppercase ${slot.type === 'Virtual' ? 'text-blue-600' : 'text-purple-600'}`}>
                    {slot.type}
                  </Text>
                </View>
                {slot.location && (
                  <Text className="text-slate-500 text-xs">📍 {slot.location}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Mock SMS Preview */}
        <View className="bg-surface border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2">📱 SMS Preview (Mock)</Text>
          <Text className="text-slate-600 text-xs italic leading-relaxed">
            "Assalamu Alaykum, your rishta meeting with {matchName} has been confirmed. Venue: {selectedSlot ? MOCK_SLOTS.find(s => s.slotId === selectedSlot)?.location ?? 'Virtual' : 'TBD'}. Please confirm attendance — Lab Viah"
          </Text>
        </View>

        <TouchableOpacity
          disabled={!selectedSlot}
          onPress={handleConfirm}
          className={`py-5 rounded-2xl items-center shadow-md ${selectedSlot ? 'bg-primary shadow-primary/10' : 'bg-slate-200'}`}
        >
          <Text className={`font-bold text-xs tracking-widest uppercase ${selectedSlot ? 'text-surface' : 'text-slate-400'}`}>
            Confirm Booking
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
