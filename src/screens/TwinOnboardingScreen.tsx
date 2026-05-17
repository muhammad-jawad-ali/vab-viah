import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, TextInput, ScrollView, Animated, Alert } from 'react-native';
import { AgTrace } from '../components/AgTrace';
import { SafeScreen } from '../components/SafeScreen';
import { useAppStore } from '../store/useAppStore';

export const TwinOnboardingScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [pulseAnim] = useState(new Animated.Value(1));
  
  const { user, toggleWaliMode } = useAppStore();

  const SCENARIOS = [
    {
      title: "Career vs. Family",
      text: "Your partner is offered a life-changing role abroad, but your parents rely on your physical presence at home. What do you do?",
      optionA: "CAREER FOCUS",
      optionB: "FAMILY LOYALTY",
    },
    {
      title: "Financial Outlook",
      text: "Your partner wants to combine all finances into a joint account, but you prefer to keep your savings separate. How do you respond?",
      optionA: "JOINT ACCOUNT",
      optionB: "SEPARATE SAVINGS",
    },
    {
      title: "Conflict Style",
      text: "After a heated argument, your partner prefers to be left alone for hours, but you want to resolve it immediately. What is your approach?",
      optionA: "GIVE SPACE",
      optionB: "RESOLVE NOW",
    }
  ];

  // Voice recording pulse animation
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (isRecording) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => {
      if (animation) animation.stop();
    };
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate speech recognition
      setVoiceText(
        `I am a ${user?.profession || 'professional'} living in ${user?.city || 'Lahore'}. I believe marriage requires absolute commitment, mutual support, and sharing family obligations respectably.`
      );
    } else {
      setIsRecording(true);
      setVoiceText('');
    }
  };

  const getTwinSummary = () => {
    const p1 = choices[0] === 'CAREER FOCUS'
      ? 'I advocate for career ambitions and professional parity, even if overseas travel is required.'
      : 'I prioritize family ties and local roots, keeping close to parent elders.';
      
    const p2 = choices[1] === 'JOINT ACCOUNT'
      ? 'I prefer shared financial transparency and joint management of household resources.'
      : 'I believe in maintaining individual savings alongside joint household contribution.';

    const p3 = choices[2] === 'GIVE SPACE'
      ? 'My conflict style is reflective, preferring quiet space before structured resolution.'
      : 'I seek to talk through misunderstandings immediately to prevent emotional distance.';

    return `I represent ${user?.name || 'Ayesha Khan'}. ${p1} ${p2} ${p3} I highly value a ${user?.deenLevel?.toLowerCase() || 'practicing'} life setup.`;
  };

  return (
    <SafeScreen className="bg-emerald-950">
      <AgTrace 
        msg={
          step === 1 
            ? "ONBOARDING_AGENT: EXTRACTING VOICE VALUES..." 
            : step === 2 
            ? `MODERATOR: CALIBRATING DILEMMA CARD #${scenarioIndex + 1}...` 
            : "TWIN_FORGE: SYNTHESIZING SYSTEM PROMPT V1.0..."
        } 
      />
      
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 px-6 justify-between py-4">
        
        <View className="mt-4">
          {/* Top Progress bar */}
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-amber-500 font-bold text-[10px] tracking-[0.2em] uppercase">Phase {step} of 3</Text>
            <View className="flex-row gap-2">
              <View className={`h-[3px] w-12 rounded-full ${step >= 1 ? 'bg-amber-500' : 'bg-emerald-900'}`} />
              <View className={`h-[3px] w-12 rounded-full ${step >= 2 ? 'bg-amber-500' : 'bg-emerald-900'}`} />
              <View className={`h-[3px] w-12 rounded-full ${step >= 3 ? 'bg-amber-500' : 'bg-emerald-900'}`} />
            </View>
          </View>

          {/* Phase 1 — Hybrid voice/text setup */}
          {step === 1 && (
            <View>
              <Text className="text-white font-serif text-3xl mb-4 leading-tight">Introduce yourself naturally.</Text>
              <Text className="text-emerald-400 text-xs uppercase tracking-wider mb-6 font-bold">Layer 1: Vocal Values Extraction</Text>
              
              <View className="bg-emerald-900/50 border border-emerald-800/40 p-6 rounded-[28px] mb-6">
                <Text className="text-emerald-300 font-serif italic text-base mb-6">
                  "I'm listening. Tell me about yourself, your career ambitions, and what truly matters to you in a family partner."
                </Text>
                
                <View className="flex-row items-center gap-5 mt-4">
                  <TouchableOpacity 
                    onPress={toggleRecording}
                    className={`w-16 h-16 rounded-full ${isRecording ? 'bg-red-500' : 'bg-amber-500'} items-center justify-center shadow-lg shadow-amber-500/10`}
                  >
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                      <Text className="text-2xl">{isRecording ? '⏹️' : '🎙️'}</Text>
                    </Animated.View>
                  </TouchableOpacity>
                  
                  <View className="flex-1">
                    <Text className="text-white font-bold text-xs uppercase mb-1">
                      {isRecording ? 'Listening to voice...' : 'Tap Mic to Speak'}
                    </Text>
                    <Text className="text-emerald-400/60 font-mono text-[10px]">
                      {isRecording ? 'Recording active waveform...' : 'Urdu, English, Roman Urdu accepted'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Hybrid text fallback input */}
              <View className="mb-6">
                <Text className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 ml-1">Or edit typed response:</Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  className="bg-emerald-900/30 border border-emerald-800/50 text-white rounded-2xl p-4 text-sm"
                  placeholder="Introduce yourself here in your own words..."
                  placeholderTextColor="#065f46"
                  value={voiceText}
                  onChangeText={setVoiceText}
                />
              </View>

              {/* Wali Toggle */}
              <View className="bg-emerald-900/40 rounded-2xl p-5 flex-row justify-between items-center border border-emerald-800/30 mb-8">
                <View className="flex-1 pr-4">
                  <Text className="text-amber-500 font-bold text-xs tracking-wider uppercase mb-1">Guardian (Wali) Review</Text>
                  <Text className="text-white/60 text-[11px]">Automatically share match reports and briefs with your family elder</Text>
                </View>
                <Switch 
                  value={user?.isWaliMode || false} 
                  onValueChange={toggleWaliMode} 
                  trackColor={{ false: '#064e3b', true: '#d97706' }}
                  thumbColor={user?.isWaliMode ? '#ffffff' : '#047857'}
                />
              </View>
            </View>
          )}

          {/* Phase 2 — Interactive Scenario Cards */}
          {step === 2 && (
            <View>
              <Text className="text-white font-serif text-3xl mb-1 leading-tight">Moral Dimensions</Text>
              <Text className="text-emerald-400 text-xs uppercase tracking-wider mb-6 font-bold">Layer 2: Ethical Choice Scenarios</Text>

              <View className="bg-white rounded-[32px] p-6 shadow-2xl shadow-black/20">
                <View className="bg-amber-100 rounded-full px-4 py-1.5 self-center mb-6">
                  <Text className="text-amber-800 font-bold text-[10px] uppercase tracking-widest">{SCENARIOS[scenarioIndex].title}</Text>
                </View>

                <Text className="text-slate-800 font-serif text-lg leading-relaxed text-center mb-8">
                  "{SCENARIOS[scenarioIndex].text}"
                </Text>

                <View className="gap-3">
                  <TouchableOpacity 
                    onPress={() => setSelectedOption('optionA')}
                    className={`py-4 rounded-xl items-center border-2 ${selectedOption === 'optionA' ? 'bg-emerald-50 border-emerald-800' : 'bg-slate-50 border-slate-100'}`}
                  >
                    <Text className={`font-bold text-xs tracking-widest ${selectedOption === 'optionA' ? 'text-emerald-800' : 'text-slate-500'}`}>
                      {SCENARIOS[scenarioIndex].optionA}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => setSelectedOption('optionB')}
                    className={`py-4 rounded-xl items-center border-2 ${selectedOption === 'optionB' ? 'bg-emerald-50 border-emerald-800' : 'bg-slate-50 border-slate-100'}`}
                  >
                    <Text className={`font-bold text-xs tracking-widest ${selectedOption === 'optionB' ? 'text-emerald-800' : 'text-slate-500'}`}>
                      {SCENARIOS[scenarioIndex].optionB}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mt-8 flex-row justify-center gap-2">
                {SCENARIOS.map((_, i) => (
                  <View key={i} className={`h-1.5 w-1.5 rounded-full ${i === scenarioIndex ? 'bg-amber-500' : 'bg-emerald-800'}`} />
                ))}
              </View>
            </View>
          )}

          {/* Phase 3 — Twin Summary spec preview */}
          {step === 3 && (
            <View>
              <Text className="text-white font-serif text-3xl mb-1 leading-tight">Your AI Twin is ready.</Text>
              <Text className="text-emerald-400 text-xs uppercase tracking-wider mb-6 font-bold">Layer 3: Stored Persona Spec V1.0</Text>

              <View className="border border-amber-500/20 bg-amber-500/5 p-6 rounded-3xl mb-6">
                <Text className="text-amber-500 font-bold text-[10px] tracking-widest uppercase mb-4">FORGED SPECIFICATION</Text>
                
                <Text className="text-white font-serif text-base leading-relaxed mb-6 italic">
                  "{getTwinSummary()}"
                </Text>
                
                <View className="flex-row gap-3">
                  <View className="bg-emerald-900/40 px-3 py-1.5 rounded-full"><Text className="text-emerald-400 font-bold text-[10px] uppercase">Gender: {user?.gender}</Text></View>
                  <View className="bg-emerald-900/40 px-3 py-1.5 rounded-full"><Text className="text-emerald-400 font-bold text-[10px] uppercase">Sect: {user?.sect}</Text></View>
                  <View className="bg-emerald-900/40 px-3 py-1.5 rounded-full"><Text className="text-emerald-400 font-bold text-[10px] uppercase">Deen: {user?.deenLevel}</Text></View>
                </View>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity 
          onPress={() => {
            if (step === 1) {
              setStep(2);
            } else if (step === 2) {
              if (!selectedOption) {
                Alert.alert('Required Selection', 'Please choose one of the scenario outcomes to forge your twin.');
                return;
              }
              const choiceText = selectedOption === 'optionA' 
                ? SCENARIOS[scenarioIndex].optionA 
                : SCENARIOS[scenarioIndex].optionB;
              
              const updatedChoices = [...choices, choiceText];
              setChoices(updatedChoices);
              setSelectedOption(null);

              if (scenarioIndex < SCENARIOS.length - 1) {
                setScenarioIndex(scenarioIndex + 1);
              } else {
                setStep(3);
              }
            } else {
              navigation.navigate('Main');
            }
          }}
          className="bg-amber-500 rounded-2xl py-5 items-center shadow-lg shadow-amber-500/10 mt-6"
        >
          <Text className="text-emerald-950 font-bold text-sm tracking-widest uppercase">
            {step === 2 && scenarioIndex < SCENARIOS.length - 1 
              ? 'Save & Next Scenario' 
              : step < 3 
              ? 'Continue' 
              : 'Forge AI Twin & Find Matches ➔'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeScreen>
  );
};
