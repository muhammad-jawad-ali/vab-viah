import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { AgTrace } from '../components/AgTrace';

export const PaywallScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const setPremium = useAppStore((state) => state.setPremium);

  const handleSubscribe = (tier: string) => {
    setPremium(true);
    Alert.alert(
      'Premium Access Unlocked!',
      `Alhamdulillah. You are now subscribed to the ${tier} Matrimonial Tier. You have full access to deep compatibility reports and unlimited twin debates.`,
      [
        {
          text: 'Proceed to Matches',
          onPress: () => navigation.navigate('DiscoverTab', { screen: 'MatchPool' })
        }
      ]
    );
  };

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-emerald-950">
      <AgTrace msg="SERVICE_ORCHESTRATOR: PARSING DYNAMIC PKR SUBSCRIPTION TIERS..." />
      
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        
        <View className="items-center mt-8 mb-10">
          <Text className="text-amber-500 font-bold text-[10px] uppercase tracking-[0.3em] mb-2">RishtaAI Tiers</Text>
          <Text className="text-white font-serif text-4.5xl font-bold tracking-tight">Premium Membership</Text>
          <Text className="text-emerald-400 text-xs mt-1 text-center font-serif italic">
            "Facilitating family unions through deep AI compatibility audits."
          </Text>
        </View>

        {/* Tier 1: Premium */}
        <View className="bg-emerald-900 border border-emerald-800 p-6 rounded-[28px] mb-5 shadow-lg relative overflow-hidden">
          <View className="absolute top-0 right-0 bg-amber-500 px-4 py-1.5 rounded-bl-xl">
            <Text className="text-emerald-950 font-bold text-[8px] uppercase tracking-wider">Most Popular</Text>
          </View>
          
          <Text className="text-white font-serif text-2xl font-bold mb-1">Rishta Premium</Text>
          <Text className="text-amber-500 font-serif text-3xl font-bold mb-4">
            PKR 2,500<Text className="text-xs font-sans text-emerald-300">/month</Text>
          </Text>
          
          <View className="gap-2.5 mb-6">
            <Text className="text-emerald-100 text-xs">✓ Unlimited twin-to-twin matching debates</Text>
            <Text className="text-emerald-100 text-xs">✓ Complete 8-dimension compatibility reports</Text>
            <Text className="text-emerald-100 text-xs">✓ Bilingual Wali brief generation (Urdu/Eng)</Text>
            <Text className="text-emerald-100 text-xs">✓ Propose slots & venues (Google Places API)</Text>
          </View>

          <TouchableOpacity 
            onPress={() => handleSubscribe('Premium')}
            className="bg-amber-500 py-4 rounded-xl items-center shadow-md shadow-amber-500/10"
          >
            <Text className="text-emerald-950 font-bold text-xs tracking-widest uppercase">Subscribe Premium</Text>
          </TouchableOpacity>
        </View>

        {/* Tier 2: Elite */}
        <View className="bg-emerald-900/40 border border-emerald-900/60 p-6 rounded-[28px] mb-6 shadow-sm">
          <Text className="text-emerald-300 font-serif text-xl font-bold mb-1">Rishta Elite (VIP)</Text>
          <Text className="text-emerald-400 font-serif text-2.5xl font-bold mb-4">
            PKR 15,000<Text className="text-xs font-sans text-emerald-500">/month</Text>
          </Text>
          
          <View className="gap-2.5 mb-6">
            <Text className="text-emerald-300 text-xs">✓ Priority matching debates by Moderator Agent</Text>
            <Text className="text-emerald-300 text-xs">✓ Custom Wali-mediated introductions</Text>
            <Text className="text-emerald-300 text-xs">✓ 24/7 dedicated human match support & mediation</Text>
            <Text className="text-emerald-300 text-xs">✓ Accelerated dispute resolution</Text>
          </View>

          <TouchableOpacity 
            onPress={() => handleSubscribe('Elite VIP')}
            className="border border-emerald-700 py-4 rounded-xl items-center"
          >
            <Text className="text-emerald-300 font-bold text-xs tracking-widest uppercase">Go Elite VIP</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-emerald-400/30 text-[9px] uppercase tracking-widest leading-relaxed mb-10">
          In keeping with pakistani marriage bureau customs, a success fee of PKR 50,000 applies upon successful Nikah.
        </Text>

      </ScrollView>
    </View>
  );
};
