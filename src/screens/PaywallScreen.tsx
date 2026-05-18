import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAppStore } from '../store/useAppStore';

export const PaywallScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { setPremium } = useAppStore();

  const handleSubscribe = () => {
    setPremium(true);
    navigation.navigate('Main');
  };

  const handleSkip = () => {
    navigation.goBack();
  };
  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-primary-dark">
      <ScrollView className="p-6">

        {/* Skip button */}
        <TouchableOpacity onPress={handleSkip} className="self-end mt-2 mb-2 px-3 py-2">
          <Text className="text-surface/40 font-bold text-xs uppercase tracking-widest">Maybe Later ✕</Text>
        </TouchableOpacity>

        <View className="items-center mt-4 mb-12">
          <Text className="text-secondary font-serif text-5xl mb-4">Lab Viah</Text>
          <Text className="text-primary-light font-bold text-xs uppercase tracking-widest text-center">
            Unlock the ultimate Halal matchmaking engine.
          </Text>
        </View>

        <View className="bg-gradient-to-b from-secondary/20 to-transparent border border-secondary/40 p-8 rounded-[40px] mb-6 shadow-2xl shadow-secondary/10 relative overflow-hidden">
          <View className="absolute top-0 right-0 bg-secondary px-4 py-1 rounded-bl-2xl rounded-tr-[40px]">
            <Text className="text-primary-dark font-bold text-[10px] uppercase">Most Popular</Text>
          </View>
          
          <Text className="text-surface font-serif text-3xl font-bold mb-2">Premium</Text>
          <Text className="text-secondary font-serif text-4xl font-bold mb-6">₨ 2,500<Text className="text-sm font-sans text-surface/50">/mo</Text></Text>
          
          <View className="gap-4 mb-8">
            <Text className="text-surface text-sm">✓ Unlimited Agentic Matches</Text>
            <Text className="text-surface text-sm">✓ Priority Debate Scheduling</Text>
            <Text className="text-surface text-sm">✓ Full Wali Mode Access</Text>
            <Text className="text-surface text-sm">✓ Advanced Compatibility Reports</Text>
          </View>

          <TouchableOpacity 
            onPress={handleSubscribe}
            className="bg-secondary py-4 rounded-2xl items-center shadow-lg shadow-secondary/30"
          >
            <Text className="text-primary-dark font-bold text-sm tracking-widest uppercase">Subscribe Now</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-surface/30 text-[10px] uppercase tracking-widest">
          A success fee of ₨ 50,000 applies upon successful Nikah.
        </Text>

      </ScrollView>
    </View>
  );
};
