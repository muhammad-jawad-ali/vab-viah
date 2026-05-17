import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore, DebateMessage } from '../store/useAppStore';
import { AgTrace } from '../components/AgTrace';

export const TwinDebateScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { matches, currentMatchId, updateMatchStatus } = useAppStore();
  
  const candidate = matches.find(m => m.id === currentMatchId) || matches[0];
  const targetScore = candidate.compatibility;

  // Custom debate scripts for the three mock candidates
  const DEBATE_SCRIPTS: Record<string, DebateMessage[]> = {
    '1': [
      { speaker: 'moderator', text: 'INITIATING DEBATE ROUND 1: CAREER & EMIGRATION' },
      { speaker: 'userTwin', text: 'Career growth and psychology practice are foundational to my identity. Relocation is acceptable only if professional parity remains.' },
      { speaker: 'candidateTwin', text: 'I fully support and value clinical psychology practice. Family ties in Karachi are strong, but I am open to 1-2 years abroad for professional growth.' },
      { speaker: 'moderator', text: 'VERDICT ROUND 1: Strong alignment (95% compatibility). Compromise mapped for overseas timelines.' },
      
      { speaker: 'moderator', text: 'INITIATING DEBATE ROUND 2: FINANCES & ASSETS' },
      { speaker: 'userTwin', text: 'I believe in maintaining individual savings alongside joint household contribution.' },
      { speaker: 'candidateTwin', text: 'Fully agreed. Transparent joint account for expenses and separate individual reserves is the healthiest setup.' },
      { speaker: 'moderator', text: 'VERDICT ROUND 2: Flawless alignment (98% compatibility). Shared reserves model established.' },
      
      { speaker: 'moderator', text: 'INITIATING DEBATE ROUND 3: SECT & LIFE VALUES' },
      { speaker: 'userTwin', text: 'Strictly practicing Sunni values. Respectful household and deen commitments are mandatory.' },
      { speaker: 'candidateTwin', text: 'I am also Sunni practicing, regularly offering Salah, and prioritizing Islamic education for future kids.' },
      { speaker: 'moderator', text: 'DEBATE COMPLETED. Overall compatibility score calculated at 94%!' }
    ],
    '2': [
      { speaker: 'moderator', text: 'INITIATING DEBATE ROUND 1: CAREER & EDUCATION' },
      { speaker: 'userTwin', text: 'Clinical psychology practice is vital for me. I wish to maintain continuous practice.' },
      { speaker: 'candidateTwin', text: 'Education and local primary teaching is my career path. I fully support professional career choices.' },
      { speaker: 'moderator', text: 'VERDICT ROUND 1: High alignment (90% compatibility).' },
      
      { speaker: 'moderator', text: 'INITIATING DEBATE ROUND 2: FAMILY LIVING SETUP' },
      { speaker: 'userTwin', text: 'A balanced setup is essential, but I prefer independent lodging if friction arises.' },
      { speaker: 'candidateTwin', text: 'My family has a joint family setup in Lahore. I prefer staying close to parents to support them.' },
      { speaker: 'moderator', text: 'VERDICT ROUND 2: Minor friction point detected (80% compatibility). Compromise on separate portion inside home proposed.' },
      
      { speaker: 'moderator', text: 'DEBATE COMPLETED. Overall compatibility score calculated at 88%!' }
    ],
    '3': [
      { speaker: 'moderator', text: 'INITIATING DEBATE ROUND 1: CAREER & EMIGRATION' },
      { speaker: 'userTwin', text: 'Career parity is vital. Relocation abroad is acceptable.' },
      { speaker: 'candidateTwin', text: 'I am a Chartered Accountant in Islamabad. Strongly settled locally, but open to GCC regions only.' },
      { speaker: 'moderator', text: 'VERDICT ROUND 1: Moderate alignment (82% compatibility).' },
      
      { speaker: 'moderator', text: 'INITIATING DEBATE ROUND 2: CONFLICT STYLE' },
      { speaker: 'userTwin', text: 'I prefer speaking through issues immediately to prevent emotional distance.' },
      { speaker: 'candidateTwin', text: 'Under high stress, I prefer giving and receiving space for 2-3 hours before structured talking.' },
      { speaker: 'moderator', text: 'DEBATE COMPLETED. Overall compatibility score calculated at 82%!' }
    ]
  };

  const script = DEBATE_SCRIPTS[candidate.id] || DEBATE_SCRIPTS['1'];

  // State for animated streaming
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [score, setScore] = useState(50);
  const [debateFinished, setDebateFinished] = useState(false);

  // Set candidate status to negotiating
  useEffect(() => {
    updateMatchStatus(candidate.id, 'negotiating');
  }, [candidate.id]);

  // Simulate turn-by-turn debate
  useEffect(() => {
    if (currentIdx >= script.length) {
      setDebateFinished(true);
      updateMatchStatus(candidate.id, 'revealed');
      return;
    }

    const nextMessage = script[currentIdx];
    const isMod = nextMessage.speaker === 'moderator';

    // Set active speaker for indicator
    setCurrentSpeaker(
      nextMessage.speaker === 'userTwin' 
        ? 'Your Twin' 
        : nextMessage.speaker === 'candidateTwin' 
        ? `${candidate.name.split(' ')[0]}'s Twin` 
        : 'Moderator'
    );

    setIsTyping(true);

    const delay = isMod ? 1000 : 3000;
    const timer = setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, nextMessage]);
      
      // Animate score upwards
      const newScore = 50 + Math.round(((targetScore - 50) / script.length) * (currentIdx + 1));
      setScore(Math.min(newScore, targetScore));
      
      setCurrentIdx(currentIdx + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIdx, script]);

  // Scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-[#020617]">
      <AgTrace 
        msg={
          debateFinished 
            ? "MODERATOR: VALUE CONVERGENCE SECURED. REPORT FORGED." 
            : isTyping 
            ? `${nextTracePrefix(script[currentIdx]?.speaker)}: GENERATING COMPATIBILITY HYPOTHESIS...` 
            : "MODERATOR: COMPILING MULTI-STAGE DEBATE LOGS..."
        } 
      />
      
      {/* Live Header Info */}
      <View className="px-6 py-5 flex-row justify-between items-center border-b border-white/5 bg-[#090d23]">
        <View>
          <Text className="text-amber-500 font-bold text-[8px] uppercase tracking-[0.25em] mb-1">Deep Twin Negotiation</Text>
          <Text className="text-white font-serif text-xl font-bold">{candidate.name.split(' ')[0]} vs. You</Text>
        </View>
        <View className="items-end bg-emerald-950 px-4 py-2.5 rounded-2xl border border-emerald-900/60 shadow-lg shadow-emerald-950/40">
          <Text className="text-emerald-400 font-serif font-bold text-2.5xl">{score}%</Text>
          <Text className="text-emerald-500 font-mono text-[7px] uppercase tracking-widest font-bold mt-0.5">COMPATIBILITY</Text>
        </View>
      </View>

      {/* Debate Chat Area */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-6 py-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="py-2">
          <View className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-6 items-center">
            <Text className="text-amber-500 text-[10px] font-mono uppercase tracking-[0.15em] mb-1">System Notice</Text>
            <Text className="text-slate-400 text-xs text-center leading-relaxed font-serif italic">
              "Bismillah. Both AI Twins have loaded their values, career outlooks, and deen preferences. The Moderator Agent is starting value negotiation."
            </Text>
          </View>

          {messages.map((log, index) => {
            const isMod = log.speaker === 'moderator';
            const isUser = log.speaker === 'userTwin';
            const name = isUser ? 'Your Twin' : `${candidate.name.split(' ')[0]}'s Twin`;

            return (
              <View 
                key={index} 
                className={`mb-5 max-w-[85%] ${isUser ? 'self-end' : isMod ? 'self-center w-full max-w-full' : 'self-start'}`}
              >
                {isMod ? (
                  <View className="bg-amber-500/5 border border-amber-500/20 px-5 py-3 rounded-2xl items-center my-2">
                    <Text className="text-amber-400 font-mono text-[9px] uppercase tracking-[0.1em] font-bold text-center">
                      🛡️ {log.text}
                    </Text>
                  </View>
                ) : (
                  <View>
                    <Text className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${isUser ? 'text-emerald-400 text-right mr-1' : 'text-slate-400 text-left ml-1'}`}>
                      {name}
                    </Text>
                    <View className={`p-4 rounded-2.5xl shadow-sm ${isUser ? 'bg-emerald-900/90 border border-emerald-800/40 rounded-tr-xs' : 'bg-slate-900 border border-slate-800 rounded-tl-xs'}`}>
                      <Text className="text-white font-serif text-[13.5px] leading-relaxed">
                        "{log.text}"
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && currentSpeaker && (
            <View className={`mb-5 max-w-[85%] ${currentIdx < script.length && script[currentIdx].speaker === 'userTwin' ? 'self-end' : script[currentIdx].speaker === 'moderator' ? 'self-center' : 'self-start'}`}>
              <View className="flex-row items-center gap-2 px-4 py-3 bg-slate-900/50 rounded-2xl border border-slate-800/40">
                <ActivityIndicator size="small" color="#d97706" />
                <Text className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                  {currentSpeaker} is responding...
                </Text>
              </View>
            </View>
          )}
        </View>
        <View className="h-6" />
      </ScrollView>

      {/* Bottom CTA Action */}
      <View className="p-5 bg-[#090d23] border-t border-white/5">
        <TouchableOpacity 
          disabled={!debateFinished}
          onPress={() => navigation.navigate('CompatibilityReport')}
          className={`py-4.5 rounded-2xl items-center shadow-lg ${debateFinished ? 'bg-amber-500 shadow-amber-500/10' : 'bg-slate-800 opacity-60'}`}
        >
          <Text className={`font-bold text-xs tracking-widest uppercase ${debateFinished ? 'text-emerald-950' : 'text-slate-500'}`}>
            {debateFinished ? 'Analyze Full Verdict Report ➔' : 'AI Debate in Progress...'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Helper function to extract trace prefix matching our backend
function nextTracePrefix(speaker: string | undefined): string {
  if (!speaker) return "MODERATOR";
  if (speaker === 'userTwin') return "USER_TWIN";
  if (speaker === 'candidateTwin') return "CANDIDATE_TWIN";
  return "MODERATOR";
}
