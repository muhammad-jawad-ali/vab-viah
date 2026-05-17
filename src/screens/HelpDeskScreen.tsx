import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, LayoutAnimation } from 'react-native';
import { AgTrace } from '../components/AgTrace';

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity 
      onPress={toggleExpand}
      activeOpacity={0.8}
      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-4"
    >
      <View className="flex-row justify-between items-center">
        <Text className="text-slate-800 font-bold text-[14.5px] flex-1 pr-4">{q}</Text>
        <Text className="text-emerald-800 font-bold text-base">{expanded ? '−' : '+'}</Text>
      </View>
      {expanded && (
        <Text className="text-slate-500 text-xs leading-relaxed mt-3 pt-3 border-t border-slate-50">
          {a}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export const HelpDeskScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-slate-50">
      <AgTrace msg="SUPPORT_ORCHESTRATOR: RETRIEVING INTERACTIVE FAQ DATABASE..." />
      
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        
        <View className="mb-6 mt-4 border-b border-slate-100 pb-5">
          <Text className="text-amber-600 font-bold text-xs uppercase tracking-[0.2em] mb-1">Support Desk</Text>
          <Text className="text-3.5xl font-serif font-bold text-slate-900 leading-tight">Help Desk</Text>
          <Text className="text-slate-400 text-xs mt-1">Instant assistance for families and guardians.</Text>
        </View>

        <TouchableOpacity className="bg-emerald-800 py-5 rounded-2xl items-center shadow-lg shadow-emerald-800/10 mb-6 flex-row justify-center">
          <Text className="text-xl mr-3">💬</Text>
          <Text className="text-white font-bold text-sm tracking-widest uppercase">Chat with Support Wali</Text>
        </TouchableOpacity>

        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1">Frequently Asked Questions</Text>
        
        <FAQItem 
          q="How does the AI Twin negotiation work?" 
          a="Your AI Twin is initialized with your background, values, and deen level. When matching, your Twin joins a secure sandbox with potential matches' Twins. They exchange career visions, living boundaries, and financial outlooks. Only highly compatible candidates who meet Islamic limits are presented to your dashboard." 
        />
        <FAQItem 
          q="Is Wali (Guardian) Mode mandatory?" 
          a="Wali Mode is highly recommended for families wanting traditional involvement. A Wali gets a private dashboard with bilingual match briefs (English/Urdu) and must approve meeting invites before contact details are exchanged." 
        />
        <FAQItem 
          q="What happens when I file a dispute?" 
          a="Your report is ingested by our Dispute Agent. We analyze logs from the meeting. Offending parties face permanent bans, and reputation scores are corrected in real-time." 
        />
        <FAQItem 
          q="How does baseline matching compare?" 
          a="Simple swiping apps match you on basic profile proximity, leading to repetitive discussions on core dealbreakers. RishtaAI uses multi-agent negotiations to find deep compromises (like career vs relocation timelines) before families meet." 
        />

        <View className="h-6" />
      </ScrollView>
    </View>
  );
};
