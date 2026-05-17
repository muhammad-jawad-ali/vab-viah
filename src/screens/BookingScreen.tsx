import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export const BookingScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const slots = [
    { id: 1, day: 'Sunday', date: 'May 24', time: '11:00 AM', type: 'Virtual Video Meet' },
    { id: 2, day: 'Sunday', date: 'May 24', time: '04:00 PM', type: 'In-person (Cafe)' },
  ];

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-background">
      <ScrollView className="p-6">
        
        <View className="mb-8 mt-4 border-b border-primary/10 pb-6">
          <Text className="text-secondary font-bold text-xs uppercase tracking-[0.2em] mb-2">Mutual Reveal Confirmed</Text>
          <Text className="text-4xl font-serif font-bold text-slate-900 leading-tight">Schedule Meeting</Text>
        </View>

        <View className="bg-primary-dark p-6 rounded-[32px] mb-8 shadow-xl">
          <Text className="text-secondary font-bold text-[10px] uppercase tracking-widest mb-2">Wali Status</Text>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-primary-light mr-2 shadow-sm shadow-primary-light" />
            <Text className="text-surface font-serif text-sm">Both Walis have been notified and approved the brief.</Text>
          </View>
        </View>

        <Text className="text-text-main font-serif text-xl font-bold mb-4">Proposed Slots</Text>
        
        {slots.map(slot => (
          <TouchableOpacity 
            key={slot.id}
            onPress={() => setSelectedSlot(slot.id)}
            className={`p-6 rounded-[32px] mb-4 border ${selectedSlot === slot.id ? 'bg-primary border-primary' : 'bg-white border-slate-200 shadow-sm'}`}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className={`font-bold text-lg ${selectedSlot === slot.id ? 'text-surface' : 'text-slate-900'}`}>{slot.day}, {slot.date}</Text>
              <Text className={`font-mono font-bold ${selectedSlot === slot.id ? 'text-secondary-light' : 'text-primary'}`}>{slot.time}</Text>
            </View>
            <Text className={`${selectedSlot === slot.id ? 'text-surface/80' : 'text-slate-500'}`}>{slot.type}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          disabled={!selectedSlot}
          onPress={() => navigation.navigate('VideoMeeting')}
          className={`py-5 rounded-2xl items-center mt-6 mb-12 shadow-lg ${selectedSlot ? 'bg-secondary shadow-secondary/30' : 'bg-slate-200'}`}
        >
          <Text className={`font-bold text-sm tracking-widest uppercase ${selectedSlot ? 'text-primary-dark' : 'text-slate-400'}`}>Confirm Booking</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};
