import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <View className="mb-4 mt-6">
    <Text className="text-slate-800 font-serif text-2xl font-bold tracking-tight">{title}</Text>
    {subtitle && <Text className="text-slate-400 text-[13px] mt-1">{subtitle}</Text>}
  </View>
);

const Input = ({
  label,
  placeholder,
  optional,
  value,
  onChangeText,
  error
}: {
  label: string;
  placeholder: string;
  optional?: boolean;
  value: string;
  onChangeText: (t: string) => void;
  error?: boolean;
}) => (
  <View className="mb-4">
    <View className="flex-row justify-between items-end mb-2 ml-1">
      <Text className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">{label}</Text>
      {optional && <Text className="text-[10px] text-slate-400">Optional</Text>}
    </View>
    <TextInput
      className={`bg-white border ${error ? 'border-red-400 bg-red-50/10' : 'border-slate-200'} rounded-2xl p-4 text-slate-800 shadow-sm`}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      value={value}
      onChangeText={onChangeText}
    />
  </View>
);

const Selector = ({
  label,
  options,
  current,
  setter
}: {
  label: string;
  options: string[];
  current: string;
  setter: (v: string) => void;
}) => (
  <View className="mb-4">
    <Text className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-2 ml-1">{label}</Text>
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          onPress={() => setter(opt)}
          className={`px-4 py-3 rounded-2xl border ${current === opt ? 'bg-emerald-800 border-emerald-800' : 'bg-white border-slate-200'}`}
        >
          <Text className={`text-[12px] font-bold tracking-wide ${current === opt ? 'text-white' : 'text-slate-500'}`}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export const ProfileSetupScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const setUserProfile = useAppStore((state) => state.setUserProfile);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Female');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [city, setCity] = useState('');
  const [profession, setProfession] = useState('');
  const [education, setEducation] = useState('');
  const [sect, setSect] = useState('Sunni');
  const [deenLevel, setDeenLevel] = useState('Practicing');

  // Error Indicators
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleNext = () => {
    const nextErrors: Record<string, boolean> = {};
    if (!fullName.trim()) nextErrors.fullName = true;
    if (!age.trim() || isNaN(Number(age))) nextErrors.age = true;
    if (!height.trim()) nextErrors.height = true;
    if (!city.trim()) nextErrors.city = true;
    if (!profession.trim()) nextErrors.profession = true;
    if (!education.trim()) nextErrors.education = true;

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      Alert.alert(
        'Required Fields',
        'Please correct the highlighted fields before initiating your AI Twin setup.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Persist details to Zustand
    setUserProfile({
      name: fullName.trim(),
      gender,
      age: age.trim(),
      height: height.trim(),
      city: city.trim(),
      profession: profession.trim(),
      education: education.trim(),
      sect,
      deenLevel,
    });

    navigation.navigate('TwinOnboarding');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-50"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        
        <View className="mt-8 mb-4 border-b border-slate-100 pb-6">
          <Text className="text-amber-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">Step 1 of 2</Text>
          <Text className="text-4xl font-serif font-bold text-slate-900 leading-tight">Your Profile Details</Text>
          <Text className="text-slate-400 text-xs mt-2 font-serif italic">This will form the foundational core values of your AI Twin.</Text>
        </View>

        <SectionHeader title="1. Identity" subtitle="How should we refer to you?" />
        <Input 
          label="Full Name" 
          placeholder="e.g., Ayesha Khan" 
          value={fullName}
          onChangeText={(t) => {
            setFullName(t);
            if (errors.fullName) setErrors({ ...errors, fullName: false });
          }}
          error={errors.fullName}
        />
        <Selector label="Gender" options={['Female', 'Male']} current={gender} setter={setGender} />
        
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Input 
              label="Age" 
              placeholder="e.g. 24" 
              value={age}
              onChangeText={(t) => {
                setAge(t);
                if (errors.age) setErrors({ ...errors, age: false });
              }}
              error={errors.age}
            />
          </View>
          <View className="flex-1">
            <Input 
              label="Height" 
              placeholder="e.g. 5ft 4in" 
              value={height}
              onChangeText={(t) => {
                setHeight(t);
                if (errors.height) setErrors({ ...errors, height: false });
              }}
              error={errors.height}
            />
          </View>
        </View>

        <SectionHeader title="2. Background & Roots" subtitle="Your education and career context." />
        <Input 
          label="City of Residence" 
          placeholder="e.g., Lahore" 
          value={city}
          onChangeText={(t) => {
            setCity(t);
            if (errors.city) setErrors({ ...errors, city: false });
          }}
          error={errors.city}
        />
        <Input 
          label="Profession / Current Role" 
          placeholder="e.g., Clinical Psychologist" 
          value={profession}
          onChangeText={(t) => {
            setProfession(t);
            if (errors.profession) setErrors({ ...errors, profession: false });
          }}
          error={errors.profession}
        />
        <Input 
          label="Highest Education" 
          placeholder="e.g., MSc Clinical Psychology" 
          value={education}
          onChangeText={(t) => {
            setEducation(t);
            if (errors.education) setErrors({ ...errors, education: false });
          }}
          error={errors.education}
        />

        <SectionHeader title="3. Faith & Values" subtitle="Religious commitments and background." />
        <Selector label="Sect Mua'shirat" options={['Sunni', 'Shia', 'Wahabi', 'Ahl-e-Hadith', 'Other']} current={sect} setter={setSect} />
        <Selector label="Religious Commitments" options={['Strictly Practicing', 'Practicing', 'Flexible']} current={deenLevel} setter={setDeenLevel} />

        <TouchableOpacity 
          onPress={handleNext}
          className="bg-emerald-800 py-5 rounded-2xl items-center shadow-xl shadow-emerald-800/20 mt-8 mb-12"
        >
          <Text className="text-white font-bold text-sm tracking-widest uppercase">Begin AI Setup ➔</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};
