import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { AgTrace } from '../components/AgTrace';

export const BookingScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { matches, currentMatchId, user } = useAppStore();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<number | null>(null);

  const candidate = matches.find(m => m.id === currentMatchId) || matches[0];
  const userCity = user?.city || 'Lahore';

  const slots = [
    { id: 1, day: 'Saturday', date: 'May 23', time: '02:00 PM', type: 'Virtual Halal Meet' },
    { id: 2, day: 'Sunday', date: 'May 24', time: '04:00 PM', type: 'In-Person Family Cafe Meet' },
  ];

  // Places API Mock venues by city
  const venueData: Record<string, { id: number; name: string; desc: string; address: string; image: string }[]> = {
    'Lahore': [
      { id: 1, name: "Butler's Chocolate Cafe", desc: "Cozy, quiet family layout. Wali Approved.", address: "Block Z, DHA Phase 5, Lahore", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=150&q=80" },
      { id: 2, name: "Gloria Jean's Coffees", desc: "Open-plan, respectful meeting spot.", address: "Kasuri Road, Gulberg III, Lahore", image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=150&q=80" }
    ],
    'Karachi': [
      { id: 1, name: "Lal's Patisserie", desc: "Upscale, family-friendly sitting areas.", address: "Shahbaz Commercial Area, Phase 6, DHA, Karachi", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=150&q=80" },
      { id: 2, name: "Koel Cafe", desc: "Artistic, extremely quiet and respectful garden cafe.", address: "Off Khayaban-e-Hafiz, Phase 8, DHA, Karachi", image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=150&q=80" }
    ],
    'Islamabad': [
      { id: 1, name: "Tuscany Courtyard", desc: "Scenic outdoor terrace, family seating.", address: "Kohsar Market, F-6, Islamabad", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=150&q=80" },
      { id: 2, name: "Street 1 Cafe", desc: "Prestigious, well-spaced tables for privacy.", address: "Diplomatic Enclave, G-5, Islamabad", image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=150&q=80" }
    ]
  };

  const venues = venueData[userCity] || venueData['Lahore'];

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-slate-50">
      <AgTrace msg="BOOKING_AGENT: CALLING PLACES API FOR FAMILY-APPROVED VENUES..." />
      
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        
        <View className="mb-6 mt-4 border-b border-slate-100 pb-5">
          <Text className="text-amber-600 font-bold text-xs uppercase tracking-[0.2em] mb-1">Mutual Consent Secured</Text>
          <Text className="text-3.5xl font-serif font-bold text-slate-900 leading-tight">Schedule Meeting</Text>
          <Text className="text-slate-400 text-xs mt-1">Connecting families respectfully in secure settings.</Text>
        </View>

        {/* Wali Approval Status banner */}
        <View className="bg-emerald-950 p-5 rounded-[24px] mb-6 shadow-md border border-emerald-900">
          <Text className="text-amber-500 font-bold text-[9px] uppercase tracking-widest mb-1.5 font-mono">Wali Approval Secured</Text>
          <View className="flex-row items-start">
            <Text className="text-lg mr-2.5">✅</Text>
            <Text className="text-emerald-50 font-serif text-[12.5px] leading-relaxed flex-1">
              "Both your Wali and {candidate.name.split(' ')[0]}'s Wali have read the compatibility report and consented to slot booking."
            </Text>
          </View>
        </View>

        {/* Proposed Slots section */}
        <Text className="text-slate-800 font-serif text-lg font-bold mb-4">1. Select a Time Slot</Text>
        
        {slots.map(slot => (
          <TouchableOpacity 
            key={slot.id}
            onPress={() => setSelectedSlot(slot.id)}
            className={`p-5 rounded-[22px] mb-4 border-2 ${selectedSlot === slot.id ? 'bg-emerald-800/5 border-emerald-800' : 'bg-white border-slate-100 shadow-sm'}`}
          >
            <View className="flex-row justify-between items-center mb-1">
              <Text className={`font-bold text-[15px] ${selectedSlot === slot.id ? 'text-emerald-800' : 'text-slate-800'}`}>
                {slot.day}, {slot.date}
              </Text>
              <Text className={`font-mono font-bold text-xs ${selectedSlot === slot.id ? 'text-amber-600' : 'text-emerald-700'}`}>
                {slot.time}
              </Text>
            </View>
            <Text className={`text-[12px] mt-1 ${selectedSlot === slot.id ? 'text-emerald-950 font-medium' : 'text-slate-500'}`}>
              {slot.type}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Proposed Venues section */}
        <View className="mt-4 mb-2 flex-row justify-between items-center">
          <Text className="text-slate-800 font-serif text-lg font-bold">2. Select a Wali-Approved Venue</Text>
          <Text className="text-emerald-700 font-mono text-[9px] uppercase tracking-widest font-bold">Maps API Fallback</Text>
        </View>

        {venues.map(venue => (
          <TouchableOpacity 
            key={venue.id}
            onPress={() => setSelectedVenue(venue.id)}
            className={`p-4 rounded-[22px] mb-4 border-2 flex-row items-center ${selectedVenue === venue.id ? 'bg-emerald-800/5 border-emerald-800' : 'bg-white border-slate-100 shadow-sm'}`}
          >
            <View className="w-14 h-14 rounded-xl overflow-hidden mr-4 bg-slate-100">
              <Image source={{ uri: venue.image }} className="w-full h-full" />
            </View>
            <View className="flex-1 pr-2">
              <Text className={`font-bold text-[14px] ${selectedVenue === venue.id ? 'text-emerald-800' : 'text-slate-800'}`}>
                {venue.name}
              </Text>
              <Text className="text-slate-400 text-[10px] mt-0.5">{venue.address}</Text>
              <Text className={`text-[10px] font-serif font-bold italic mt-1 ${selectedVenue === venue.id ? 'text-emerald-950' : 'text-amber-600'}`}>
                {venue.desc}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          disabled={!selectedSlot || !selectedVenue}
          onPress={() => navigation.navigate('VideoMeeting')}
          className={`py-5 rounded-2xl items-center mt-6 mb-12 shadow-xl ${selectedSlot && selectedVenue ? 'bg-amber-500 shadow-amber-500/10' : 'bg-slate-200'}`}
        >
          <Text className={`font-bold text-sm tracking-widest uppercase ${selectedSlot && selectedVenue ? 'text-emerald-950' : 'text-slate-400'}`}>
            Confirm Booking & Launch Call ➔
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};
