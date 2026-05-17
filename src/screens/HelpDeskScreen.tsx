import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

const FAQItem = ({ q, a }: { q: string, a: string }) => (
  <View className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-4">
    <Text className="text-slate-900 font-bold mb-2 text-lg">{q}</Text>
    <Text className="text-slate-500 leading-relaxed">{a}</Text>
  </View>
);

export const HelpDeskScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-background">
      <ScrollView className="p-6">
        
        <View className="mb-8 mt-4 border-b border-primary/10 pb-6">
          <Text className="text-secondary font-bold text-xs uppercase tracking-[0.2em] mb-2">Support</Text>
          <Text className="text-4xl font-serif font-bold text-slate-900 leading-tight">Help Desk</Text>
        </View>

        <TouchableOpacity className="bg-primary py-5 rounded-2xl items-center shadow-lg shadow-primary/20 mb-8 flex-row justify-center">
          <Text className="text-xl mr-3">💬</Text>
          <Text className="text-surface font-bold text-sm tracking-widest uppercase">Chat with Human Agent</Text>
        </TouchableOpacity>

        <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1">Frequently Asked Questions</Text>
        
        <FAQItem 
          q="How does the AI Twin work?" 
          a="Your AI Twin is trained during the onboarding flow. It negotiates preliminary values (like career goals and family boundaries) with potential matches before you even see them, saving you from repetitive conversations." 
        />
        <FAQItem 
          q="Is Wali Mode mandatory?" 
          a="No, but it is highly recommended. Wali Mode allows your designated guardian to view match briefs and approve meetings, aligning with traditional Islamic protocols while leveraging modern tech." 
        />
        <FAQItem 
          q="What happens when I block someone?" 
          a="Blocking is permanent. The other party will not be notified, but their profile will disappear from your Match Pool, and your Twin will instantly terminate any ongoing background negotiations with them." 
        />

      </ScrollView>
    </View>
  );
};
