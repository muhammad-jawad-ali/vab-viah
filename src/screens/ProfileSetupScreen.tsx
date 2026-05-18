import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';

// Controlled input — value + onChangeText are required
const Input = ({
  label,
  placeholder,
  optional,
  value,
  onChangeText,
  keyboardType = 'default',
}: {
  label: string;
  placeholder: string;
  optional?: boolean;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
}) => (
  <View className="mb-5">
    <View className="flex-row justify-between items-end mb-2 ml-1">
      <Text className="text-[10px] font-bold text-primary uppercase tracking-widest">{label}</Text>
      {optional && <Text className="text-[10px] text-slate-400">Optional</Text>}
    </View>
    <TextInput
      className="bg-surface border border-slate-200 rounded-xl p-4 text-slate-800 shadow-sm"
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
    />
  </View>
);

const Selector = ({
  label,
  options,
  current,
  setter,
}: {
  label: string;
  options: string[];
  current: string;
  setter: (v: string) => void;
}) => (
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

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <View className="mb-6 mt-8">
    <Text className="text-text-main font-serif text-2xl font-bold tracking-tight">{title}</Text>
    {subtitle && <Text className="text-text-muted text-sm mt-1">{subtitle}</Text>}
  </View>
);

export const ProfileSetupScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  // Identity
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Female');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');

  // Background
  const [city, setCity] = useState('');
  const [profession, setProfession] = useState('');
  const [education, setEducation] = useState('');

  // Preferences (optional)
  const [prefAgeRange, setPrefAgeRange] = useState('');
  const [prefHeight, setPrefHeight] = useState('');
  const [prefPhysique, setPrefPhysique] = useState('');
  const [prefLocation, setPrefLocation] = useState('');

  const handleContinue = () => {
    if (!fullName.trim()) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }
    if (!age.trim() || isNaN(Number(age))) {
      Alert.alert('Age required', 'Please enter a valid age.');
      return;
    }
    if (!city.trim()) {
      Alert.alert('City required', 'Please enter your city of residence.');
      return;
    }
    if (!profession.trim()) {
      Alert.alert('Profession required', 'Please enter your profession.');
      return;
    }
    navigation.navigate('TwinOnboarding');
  };

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-background">
      <ScrollView className="px-6" keyboardShouldPersistTaps="handled">

        <View className="mt-8 mb-4 border-b border-secondary/20 pb-6 flex-row justify-between items-end">
          <View>
            <Text className="text-secondary font-bold text-xs uppercase tracking-[0.2em] mb-2">Step 1 of 2</Text>
            <Text className="text-4xl font-serif font-bold text-slate-900 leading-tight">Your Details</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('TwinOnboarding')} className="pb-1">
            <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest">Skip ›</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="Identity" subtitle="How should we refer to you?" />
        <Input label="Full Name" placeholder="e.g., Ayesha Khan" value={fullName} onChangeText={setFullName} />
        <Selector label="Gender" options={['Female', 'Male']} current={gender} setter={setGender} />
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Input label="Age" placeholder="25" value={age} onChangeText={setAge} keyboardType="numeric" />
          </View>
          <View className="flex-1">
            <Input label="Height" placeholder="5'6&quot;" value={height} onChangeText={setHeight} />
          </View>
        </View>

        <SectionHeader title="Background" subtitle="Your foundational roots." />
        <Input label="City of Residence" placeholder="Islamabad" value={city} onChangeText={setCity} />
        <Input label="Profession" placeholder="Software Engineer" value={profession} onChangeText={setProfession} />
        <Input label="Education" placeholder="MSc Computer Science" value={education} onChangeText={setEducation} />

        <SectionHeader title="Partner Preferences" subtitle="What are you looking for? (Skip any that don't matter)" />
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Input label="Age Range" placeholder="e.g., 26-30" optional value={prefAgeRange} onChangeText={setPrefAgeRange} />
          </View>
          <View className="flex-1">
            <Input label="Height" placeholder="e.g., 5'10&quot;+" optional value={prefHeight} onChangeText={setPrefHeight} />
          </View>
        </View>
        <Input label="Physique" placeholder="e.g., Athletic, Average" optional value={prefPhysique} onChangeText={setPrefPhysique} />
        <Input label="Location" placeholder="e.g., Islamabad or Abroad" optional value={prefLocation} onChangeText={setPrefLocation} />

        <TouchableOpacity
          onPress={handleContinue}
          className="bg-primary py-5 rounded-2xl items-center shadow-xl shadow-primary/20 mt-8 mb-12"
        >
          <Text className="text-surface font-bold text-sm tracking-widest uppercase">Begin AI Setup ➔</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};
