import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MeetingStackParamList } from '../navigation/types';
import { MOCK_SLOTS } from '../api/mockData';
import { useAppStore } from '../store/useAppStore';

type Props = {
  navigation: NativeStackNavigationProp<MeetingStackParamList, 'Booking'>;
  route: RouteProp<MeetingStackParamList, 'Booking'>;
};

export const BookingScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const { matchId, matchName } = route.params || {};
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const { addMeeting, meetingsList } = useAppStore();

  const handleConfirm = () => {
    if (!selectedSlot || !matchId) return;
    setConfirmed(true);
    const slot = MOCK_SLOTS.find((s) => s.slotId === selectedSlot);
    
    // Add meeting to our Zustand store!
    addMeeting({
      id: `meet_${matchId}`,
      matchName: matchName || '',
      slotDay: slot?.displayDay || '',
      slotTime: slot?.displayTime || '',
      type: slot?.type || 'Virtual',
      location: slot?.location,
      status: 'scheduled',
    });

    Alert.alert(
      '📅 Meeting Confirmed',
      `Your meeting with ${matchName} has been scheduled for ${slot?.displayDay} at ${slot?.displayTime}. Both Walis have been notified via SMS.`,
      [{
        text: 'View Meetings Log',
        onPress: () => {
          navigation.navigate('Booking', { matchId: undefined, matchName: undefined } as any);
        },
      }]
    );
  };

  if (!matchId) {
    const scheduledMeetings = meetingsList.filter((m) => m.status === 'scheduled');
    const pendingMeetings = meetingsList.filter((m) => m.status === 'pending_feedback');
    const pastMeetings = meetingsList.filter((m) => m.status === 'done');

    return (
      <View style={{ paddingTop: insets.top }} className="flex-1 bg-background">
        {/* AG-Trace */}
        <View className="bg-emerald-950/5 border-b border-emerald-900/10 px-4 py-2 flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-emerald-600 mr-2" />
          <Text className="text-emerald-800 font-mono text-[9px] uppercase tracking-widest flex-1">
            AG-TRACE // LOG AGENT: RETRIEVED MATRIMONIAL MEETING HISTORIES AND SCHEDULES
          </Text>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <View className="mt-6 mb-8">
            <Text className="text-primary font-bold text-[10px] uppercase tracking-[0.25em] mb-1">Rishta Matrimonials</Text>
            <Text className="text-slate-900 font-serif text-3xl font-bold">Meetings Log</Text>
            <Text className="text-slate-500 text-sm mt-1">Track your moderator-guided video calls and chaperone schedules.</Text>
          </View>

          {/* Section 1: Scheduled Meetings */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Text className="text-slate-800 font-serif text-xl font-bold flex-1">🕒 Scheduled Meetings</Text>
              <View className="bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                <Text className="text-amber-800 font-bold text-[9px] uppercase tracking-wider">{scheduledMeetings.length} Pending</Text>
              </View>
            </View>

            {scheduledMeetings.length === 0 ? (
              <View className="bg-surface border border-slate-100 rounded-3xl p-6 items-center shadow-sm">
                <Text className="text-4xl mb-3">📅</Text>
                <Text className="text-slate-700 font-serif font-bold text-sm text-center mb-1">No upcoming meetings</Text>
                <Text className="text-slate-400 text-xs text-center leading-relaxed">
                  Unlock premium matches or initiate a Halal Reveal to schedule your first chaperoned discussion.
                </Text>
              </View>
            ) : (
              scheduledMeetings.map((meeting) => (
                <View key={meeting.id} className="bg-surface border border-slate-200 rounded-3xl p-5 mb-4 shadow-sm">
                  <View className="flex-row justify-between items-start mb-2">
                    <View>
                      <Text className="text-slate-900 font-bold text-base">{meeting.matchName}</Text>
                      <Text className="text-slate-500 text-xs mt-0.5 font-mono">{meeting.slotDay} @ {meeting.slotTime}</Text>
                    </View>
                    <View className="bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md">
                      <Text className="text-blue-600 text-[9px] font-bold uppercase">Scheduled</Text>
                    </View>
                  </View>
                  {meeting.location && (
                    <Text className="text-slate-400 text-xs mb-4">📍 {meeting.location}</Text>
                  )}
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('VideoMeeting', {
                        meetingId: meeting.id,
                        meetingUrl: `https://labviah.app/meet/${meeting.id}`,
                        matchName: meeting.matchName,
                      })
                    }
                    className="bg-emerald-800/10 border border-emerald-800/20 py-3 rounded-2xl items-center flex-row justify-center mt-2"
                  >
                    <Text className="text-emerald-800 text-xs font-extrabold uppercase tracking-widest mr-1">Join Video Call</Text>
                    <Text className="text-xs">📞</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* Section 2: Feedback Pending */}
          {pendingMeetings.length > 0 && (
            <View className="mb-8">
              <View className="flex-row items-center mb-4">
                <Text className="text-slate-800 font-serif text-xl font-bold flex-1">⚠️ Action Needed</Text>
                <View className="bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                  <Text className="text-amber-800 font-bold text-[9px] uppercase tracking-wider">{pendingMeetings.length} Pending Feedback</Text>
                </View>
              </View>

              {pendingMeetings.map((meeting) => (
                <View key={meeting.id} className="bg-amber-50/50 border border-amber-200 rounded-3xl p-5 mb-4 shadow-sm">
                  <View className="flex-row justify-between items-start mb-2">
                    <View>
                      <Text className="text-slate-900 font-bold text-base">{meeting.matchName}</Text>
                      <Text className="text-slate-500 text-xs mt-0.5 font-mono">{meeting.slotDay} @ {meeting.slotTime}</Text>
                    </View>
                    <View className="bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-md">
                      <Text className="text-amber-800 text-[9px] font-bold uppercase">Rate Later</Text>
                    </View>
                  </View>
                  <Text className="text-slate-600 text-xs mb-4">
                    Your chaperoned call with {meeting.matchName} ended. Rate the experience to calibrate your AI Twin.
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('FeedbackSurvey', {
                        meetingId: meeting.id,
                      })
                    }
                    className="bg-amber-600 py-3 rounded-2xl items-center flex-row justify-center mt-2 shadow-sm shadow-amber-900/10"
                  >
                    <Text className="text-white text-xs font-extrabold uppercase tracking-widest mr-1">Rate & Calibrate Twin Now</Text>
                    <Text className="text-xs">⭐</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Section 3: Completed Meetings */}
          <View className="mb-12">
            <View className="flex-row items-center mb-4">
              <Text className="text-slate-800 font-serif text-xl font-bold flex-1">✅ Concluded Matches</Text>
              <View className="bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                <Text className="text-emerald-800 font-bold text-[9px] uppercase tracking-wider">{pastMeetings.length} Done</Text>
              </View>
            </View>

            {pastMeetings.map((meeting) => (
              <View key={meeting.id} className="bg-slate-50 border border-slate-200 rounded-3xl p-5 mb-4 opacity-85">
                <View className="flex-row justify-between items-center mb-3">
                  <View>
                    <Text className="text-slate-800 font-bold text-base line-through">{meeting.matchName}</Text>
                    <Text className="text-slate-400 text-xs mt-0.5 font-mono">{meeting.slotDay} @ {meeting.slotTime}</Text>
                  </View>
                  <View className="bg-emerald-800/10 px-2.5 py-1 rounded-full flex-row items-center">
                    <Text className="text-emerald-800 font-extrabold text-[9px] uppercase tracking-wider">Completed ⭐</Text>
                  </View>
                </View>
                <Text className="text-slate-500 text-xs italic">
                  Chaperoned video call concluded. Twin preferences updated based on feedback.
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Explore matches sticky footer */}
        <View className="p-6 bg-background border-t border-slate-100">
          <TouchableOpacity
            onPress={() => navigation.navigate('DiscoverTab' as any)}
            className="bg-primary py-5 rounded-full items-center shadow-lg shadow-primary/10"
          >
            <Text className="text-surface font-bold text-sm tracking-widest uppercase">Explore More Matches ➔</Text>
          </TouchableOpacity>
        </View>
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
