import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';

const Rating = ({ label }: { label: string }) => (
  <View className="mb-6">
    <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">{label}</Text>
    <View className="flex-row justify-between">
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity key={star} className="w-12 h-12 bg-white rounded-xl border border-slate-200 items-center justify-center shadow-sm">
          <Text className="text-lg opacity-50">⭐</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export const FeedbackSurveyScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-background">
      <ScrollView className="p-6">
        
        <View className="items-center mb-10 mt-6">
          <View className="w-16 h-16 bg-primary-light/10 rounded-full items-center justify-center mb-4">
            <Text className="text-2xl">📝</Text>
          </View>
          <Text className="text-secondary font-bold text-[10px] uppercase tracking-[0.3em] mb-2">Twin calibration</Text>
          <Text className="text-3xl font-serif font-bold text-slate-900 text-center leading-tight">Post-Meeting Assessment</Text>
        </View>

        <View className="bg-primary/5 p-4 rounded-2xl border border-primary/10 mb-8">
          <Text className="text-primary-dark font-serif text-sm italic text-center">
            "Your feedback directly trains your AI Twin for future negotiations."
          </Text>
        </View>

        <Rating label="Overall Chemistry" />
        <Rating label="Values Alignment" />
        <Rating label="Twin Accuracy" />

        <View className="mb-8 mt-4">
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Private Notes</Text>
          <TextInput 
            className="bg-white border border-slate-200 rounded-2xl p-4 h-32 text-slate-800 shadow-sm"
            placeholder="Share detailed thoughts with your Twin..."
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Main')}
          className="bg-primary py-5 rounded-2xl items-center shadow-xl shadow-primary/20 mb-4"
        >
          <Text className="text-surface font-bold text-sm tracking-widest uppercase">Submit Calibration</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('DisputeForm')} className="py-4 items-center">
          <Text className="text-danger font-bold text-xs tracking-widest uppercase">Report an Issue</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};
