import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';

const SectionHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <View className="mb-6 mt-8">
    <Text className="text-text-main font-serif text-2xl font-bold tracking-tight">{title}</Text>
    {subtitle && <Text className="text-text-muted text-sm mt-1">{subtitle}</Text>}
  </View>
);

const Input = ({ label, placeholder, optional }: { label: string, placeholder: string, optional?: boolean }) => (
  <View className="mb-5">
    <View className="flex-row justify-between items-end mb-2 ml-1">
      <Text className="text-[10px] font-bold text-primary uppercase tracking-widest">{label}</Text>
      {optional && <Text className="text-[10px] text-slate-400">Optional</Text>}
    </View>
    <TextInput
      className="bg-surface border border-slate-200 rounded-xl p-4 text-slate-800 shadow-sm"
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
    />
  </View>
);

const Selector = ({ label, options, current, setter }: { label: string; options: string[]; current: string; setter: (v: string) => void }) => (
  <View className="mb-5">
    <Text className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 ml-1">{label}</Text>
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          onPress={() => setter(opt)}
          className={`px-4 py-3 rounded-xl border ${current === opt ? 'bg-primary border-primary' : 'bg-surface border-slate-200'}`}
        >
          <Text className={`text-[12px] font-bold tracking-wide ${current === opt ? 'text-surface' : 'text-slate-500'}`}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export const ProfileSetupScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [gender, setGender] = useState('Female');
  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-background">
      <ScrollView className="px-6">
        
        <View className="mt-8 mb-4 border-b border-secondary/20 pb-6">
          <Text className="text-secondary font-bold text-xs uppercase tracking-[0.2em] mb-2">Step 1 of 2</Text>
          <Text className="text-4xl font-serif font-bold text-slate-900 leading-tight">Your Details</Text>
        </View>

        <SectionHeader title="Identity" subtitle="How should we refer to you?" />
        <Input label="Full Name" placeholder="e.g., Ayesha Khan" />
        <Selector label="Gender" options={['Female', 'Male']} current={gender} setter={setGender} />
        <View className="flex-row gap-4">
          <View className="flex-1"><Input label="Age" placeholder="25" /></View>
          <View className="flex-1"><Input label="Height" placeholder="5'6&quot;" /></View>
        </View>

        <SectionHeader title="Background" subtitle="Your foundational roots." />
        <Input label="City of Residence" placeholder="Islamabad" />
        <Input label="Profession" placeholder="Software Engineer" />
        <Input label="Education" placeholder="MSc Computer Science" />

        <SectionHeader title="Partner Preferences" subtitle="What are you looking for? (Skip any that don't matter)" />
        <View className="flex-row gap-4">
          <View className="flex-1"><Input label="Age Range" placeholder="e.g., 26-30" optional /></View>
          <View className="flex-1"><Input label="Height" placeholder="e.g., 5'10&quot;+" optional /></View>
        </View>
        <Input label="Physique" placeholder="e.g., Athletic, Average" optional />
        <Input label="Location" placeholder="e.g., Islamabad or Abroad" optional />

        <TouchableOpacity 
          onPress={() => navigation.navigate('TwinOnboarding')}
          className="bg-primary py-5 rounded-2xl items-center shadow-xl shadow-primary/20 mt-8 mb-12"
        >
          <Text className="text-surface font-bold text-sm tracking-widest uppercase">Begin AI Setup ➔</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};
