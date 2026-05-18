import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, TextInput, Alert, ScrollView, Animated, Easing } from 'react-native';
import { AgTrace } from '../components/AgTrace';
import { SafeScreen } from '../components/SafeScreen';
import { useAppStore } from '../store/useAppStore';

const SCENARIOS = [
  {
    id: 'family_living',
    title: 'Joint Family Living',
    text: 'After marriage, your parents expect you to live in a joint family setup, but you have an opportunity to move to an independent home nearby. What do you do?',
    options: ['STAY IN JOINT FAMILY', 'MOVE INDEPENDENTLY', 'COMPROMISE (NEARBY)', 'NOT SURE / SKIP'],
  },
  {
    id: 'finances',
    title: 'Financial Independence',
    text: 'Your spouse earns well but expects you to hand over your savings for collective family investments (like buying a plot). Your stance?',
    options: ['SHARE ALL SAVINGS', 'KEEP SEPARATE ACCOUNTS', 'PARTIAL CONTRIBUTION', 'NOT SURE / SKIP'],
  },
  {
    id: 'conflict',
    title: 'Conflict Resolution',
    text: 'During a major disagreement, your spouse suggests involving the elders (parents/uncles) to mediate. You prefer to:',
    options: ['WELCOME ELDER ADVICE', 'KEEP IT PRIVATE', 'ONLY IF UNAVOIDABLE', 'NOT SURE / SKIP'],
  },
  {
    id: 'deen_practice',
    title: 'Deen & Milad',
    text: 'Your family regularly attends Milad or cultural religious gatherings, but your spouse considers them bid\'ah (innovation). You:',
    options: ['STOP ATTENDING', 'ATTEND ALONE', 'DISCUSS SCHOLARLY VIEWS', 'NOT SURE / SKIP'],
  },
  {
    id: 'kids_timeline',
    title: 'Family Expectations',
    text: 'Right after the Nikah, the extended family starts asking "Khushkhabri kab hai?" (When is the good news?). You and your spouse:',
    options: ['START A FAMILY ASAP', 'WAIT 1-2 YEARS', 'FOCUS ON CAREER FIRST', 'NOT SURE / SKIP'],
  },
  {
    id: 'geography',
    title: 'Relocation & Visa',
    text: 'Your spouse gets a work visa for the Middle East, but your aging parents in Pakistan need your support. You choose to:',
    options: ['STAY IN PAKISTAN', 'MOVE TOGETHER', 'SPONSOR PARENTS LATER', 'NOT SURE / SKIP'],
  },
  {
    id: 'boundaries',
    title: 'Social Boundaries',
    text: 'Your spouse maintains close, casual friendships with colleagues of the opposite gender (going for lunches, etc). You feel:',
    options: ['COMPLETELY FINE', 'PREFER STRICT HIJAB/BOUNDARIES', 'FINE IF PROFESSIONAL', 'NOT SURE / SKIP'],
  },
  {
    id: 'career_ambition',
    title: 'Career Post-Marriage',
    text: 'Your spouse expects you to prioritize household duties over demanding work hours or business trips. You:',
    options: ['WILLING TO STEP BACK', 'CAREER IS NON-NEGOTIABLE', 'FIND A MIDDLE GROUND', 'NOT SURE / SKIP'],
  },
  {
    id: 'in_laws',
    title: 'In-Laws Expectations',
    text: 'Your mother-in-law expects you to cook traditional meals every day, despite both of you working full-time. You:',
    options: ['AGREE TO HER WISHES', 'HIRE HELP / ORDER IN', 'SHARE COOKING DUTIES', 'NOT SURE / SKIP'],
  },
  {
    id: 'education',
    title: 'Kids & Culture',
    text: 'When raising kids, what kind of schooling environment is most important to you?',
    options: ['STRICT ISLAMIC SCHOOL', 'ELITE ENGLISH MEDIUM', 'BALANCED/HIFZ TRACK', 'NOT SURE / SKIP'],
  },
  {
    id: 'events',
    title: 'Wedding Extravagance',
    text: 'Your family wants a grand, multi-day Shaadi with a huge guest list, but your spouse wants a simple Sunnah Walima. You lean towards:',
    options: ['GRAND SHAADI', 'SIMPLE WALIMA ONLY', 'MODERATE / ONE EVENT', 'NOT SURE / SKIP'],
  },
  {
    id: 'dealbreakers',
    title: 'Core Values',
    text: 'If you had to pick the absolute biggest red flag in a rishta, it would be:',
    options: ['DISRESPECT TO PARENTS', 'LACK OF NAMAZ', 'CONTROLLING NATURE', 'NOT SURE / SKIP'],
  }
];

const DIMENSIONS = ['Deen', 'Family', 'Career', 'Finances', 'Kids', 'Conflict', 'Geography', 'Boundaries'];

const LiveRadar = ({ scenarioIndex }: { scenarioIndex: number }) => {
  const animations = useRef(DIMENSIONS.map(() => new Animated.Value(0.1))).current;

  useEffect(() => {
    // Animate dimensions up gradually based on scenario progression
    const toVals = DIMENSIONS.map((_, i) => {
      const noise = Math.random() * 0.2;
      const baseProgression = Math.min(1, (scenarioIndex + 1) / SCENARIOS.length);
      return Math.min(1, baseProgression * 0.7 + noise);
    });

    Animated.parallel(
      animations.map((anim, i) =>
        Animated.timing(anim, {
          toValue: toVals[i],
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        })
      )
    ).start();
  }, [scenarioIndex]);

  return (
    <View className="bg-slate-900 border border-emerald-500/50 rounded-[32px] p-5 mb-6 shadow-xl shadow-emerald-900/20">
      <View className="flex-row items-center mb-5">
        <Text className="text-[10px] uppercase font-bold text-slate-300 tracking-widest flex-1">
          Live Personality Radar
        </Text>
        <View className="bg-emerald-500/20 px-2 py-1 rounded-md">
          <Text className="text-[10px] text-emerald-400 font-mono font-bold uppercase">Updating...</Text>
        </View>
      </View>
      <View className="flex-row flex-wrap justify-between">
        {DIMENSIONS.map((dim, i) => (
          <View key={dim} className="w-[48%] mb-4">
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-[10px] uppercase font-extrabold text-white tracking-wider">{dim}</Text>
            </View>
            <View className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <Animated.View
                className="h-full bg-emerald-400 rounded-full"
                style={{
                  width: animations[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export const TwinOnboardingScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [editingStatement, setEditingStatement] = useState(false);
  const [correctionText, setCorrectionText] = useState('');
  const [twinConfirmed, setTwinConfirmed] = useState(false);

  const { user, toggleWaliMode, addScenarioAnswer } = useAppStore();

  const currentScenario = SCENARIOS[scenarioIndex];
  const isLastScenario = scenarioIndex === SCENARIOS.length - 1;

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    addScenarioAnswer({ scenarioId: currentScenario.id, choice: option });
  };

  const handleNextScenario = () => {
    if (!selectedOption) {
      Alert.alert('Please select an option', 'Tap one of the choices before continuing.');
      return;
    }
    setSelectedOption(null);
    if (!isLastScenario) {
      setScenarioIndex(scenarioIndex + 1);
    } else {
      setStep(3);
    }
  };

  const handleConfirmTwin = () => {
    setTwinConfirmed(true);
  };

  const handleEditTwin = () => {
    setEditingStatement(true);
  };

  const handleSaveEdit = () => {
    if (correctionText.trim().length < 5) {
      Alert.alert('Please add more detail', 'Write at least a short correction for your Twin.');
      return;
    }
    setEditingStatement(false);
    setTwinConfirmed(true);
    Alert.alert('✅ Twin Updated', 'Your correction has been noted. Your Twin has been updated.');
  };

  const getMainButtonLabel = () => {
    if (step === 1) return 'Continue to Scenarios';
    if (step === 2) return isLastScenario ? 'Build My Twin' : 'Next Scenario';
    if (step === 3) return twinConfirmed ? 'Enter Match Pool' : 'Confirm to Continue';
    return 'Continue';
  };

  const handleMainButton = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      handleNextScenario();
    } else if (step === 3) {
      if (!twinConfirmed) {
        Alert.alert('Confirm your Twin', 'Tap "✓ CONFIRM" or edit before entering the Match Pool.');
        return;
      }
      navigation.navigate('Main');
    }
  };

  return (
    <SafeScreen className="bg-primary-dark">
      <AgTrace msg={step === 1 ? 'INITIALIZING VOCAL EXTRACTION...' : step === 2 ? `CALIBRATING MORAL DIMENSIONS... ${scenarioIndex + 1}/${SCENARIOS.length}` : twinConfirmed ? 'TWIN v1.0 LOCKED — READY FOR POOL' : 'FINALIZING TWIN WEIGHTS'} />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* Progress + Skip */}
        <View className="flex-row justify-between items-center mt-4 mb-10">
          <View>
            <Text className="text-amber-500 font-bold text-[10px] tracking-[0.2em] uppercase font-mono">Phase {step} of 3</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Main')}
              className="mt-1"
            >
              <Text className="text-emerald-400 text-[10px] font-bold tracking-wider uppercase underline">Skip Onboarding ➔</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center gap-4">
            <View className="flex-row gap-2">
              {[1, 2, 3].map((s) => (
                <View key={s} className={`h-1 w-8 rounded-full ${step >= s ? 'bg-secondary' : 'bg-primary'}`} />
              ))}
            </View>
          </View>
        </View>

        {/* ── STEP 1: Voice Intro ── */}
        {step === 1 && (
          <View>
            <Text className="text-surface font-serif text-4xl mb-6 leading-tight">Introduce yourself naturally.</Text>
            <View className="bg-primary/50 border border-primary p-6 rounded-3xl mb-6">
              <Text className="text-primary-light font-serif italic text-lg mb-6">
                "I'm listening. Tell me about what truly matters to you in a partner."
              </Text>
              <View className="flex-row items-center gap-4">
                <View className="w-16 h-16 rounded-full bg-secondary items-center justify-center shadow-lg shadow-secondary/20">
                  <Text className="text-2xl">🎙️</Text>
                </View>
                <Text className="text-surface opacity-50 font-mono text-xs">Tap to record voice (demo mode)</Text>
              </View>
            </View>

            {/* Wali Mode toggle */}
            <View className="bg-surface/10 rounded-2xl p-4 flex-row justify-between items-center border border-surface/20">
              <View>
                <Text className="text-surface font-bold text-sm tracking-widest uppercase mb-1">Guardian Mode</Text>
                <Text className="text-surface/70 text-xs">Require Wali approval for matches</Text>
              </View>
              <Switch
                value={user?.isWaliMode || false}
                onValueChange={toggleWaliMode}
                trackColor={{ false: '#334155', true: '#d4af37' }}
                thumbColor={user?.isWaliMode ? '#ffffff' : '#94a3b8'}
              />
            </View>
          </View>
        )}

        {/* ── STEP 2: Scenario Cards ── */}
        {step === 2 && (
          <View>
            <Text className="text-surface font-serif text-2xl mb-2 leading-tight">Scenario {scenarioIndex + 1}/{SCENARIOS.length}</Text>
            <Text className="text-secondary font-bold text-xs tracking-widest uppercase mb-4">{currentScenario.title}</Text>
            
            <LiveRadar scenarioIndex={scenarioIndex} />

            <View className="bg-surface rounded-[40px] p-8 shadow-2xl mb-6">
              <Text className="text-primary-dark font-serif text-xl leading-relaxed text-center mb-10">
                "{currentScenario.text}"
              </Text>
              <View>
                {currentScenario.options.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => handleOptionSelect(opt)}
                    className={`mb-3 py-4 rounded-2xl items-center border ${
                      selectedOption === opt
                        ? 'bg-primary border-primary'
                        : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    <Text className={`font-bold text-xs tracking-widest ${selectedOption === opt ? 'text-surface' : 'text-slate-700'}`}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {/* Dot progress */}
            <View className="flex-row justify-center gap-2">
              {SCENARIOS.map((_, i) => (
                <View key={i} className={`h-2 w-2 rounded-full ${i === scenarioIndex ? 'bg-secondary' : i < scenarioIndex ? 'bg-secondary/40' : 'bg-surface/30'}`} />
              ))}
            </View>
          </View>
        )}

        {/* ── STEP 3: Twin Interview ── */}
        {step === 3 && (
          <View>
            <Text className="text-surface font-serif text-3xl mb-2 leading-tight">Your AI Twin is ready.</Text>
            <Text className="text-surface/50 text-sm mb-8">Review these statements — is this really you?</Text>

            <View className="border border-secondary/30 bg-secondary/5 p-6 rounded-3xl mb-6">
              <Text className="text-secondary font-bold text-xs tracking-widest mb-4">
                {twinConfirmed ? '✅ TWIN v1.0 CONFIRMED' : 'TWIN SUMMARY v1.0'}
              </Text>
              <Text className="text-surface/80 font-serif text-lg leading-relaxed mb-6">
                "I value family proximity over career relocation, but I maintain high ambition in my local sphere. Religious alignment is non-negotiable."
              </Text>

              {!twinConfirmed && !editingStatement && (
                <View className="flex-row gap-4">
                  <TouchableOpacity
                    onPress={handleConfirmTwin}
                    className="flex-1 bg-surface py-3 rounded-xl items-center"
                  >
                    <Text className="text-primary-dark font-bold text-xs tracking-widest">✓ CONFIRM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleEditTwin}
                    className="flex-1 border border-surface/20 py-3 rounded-xl items-center"
                  >
                    <Text className="text-surface font-bold text-xs tracking-widest">✎ EDIT</Text>
                  </TouchableOpacity>
                </View>
              )}

              {editingStatement && (
                <View>
                  <Text className="text-surface/70 text-xs mb-2">What's different? Correct the Twin:</Text>
                  <TextInput
                    value={correctionText}
                    onChangeText={setCorrectionText}
                    placeholder="e.g. I am actually open to relocation for the right partner..."
                    placeholderTextColor="#64748b"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    className="bg-surface/10 border border-surface/20 rounded-xl p-3 text-surface text-sm"
                    style={{ minHeight: 80 }}
                  />
                  <TouchableOpacity onPress={handleSaveEdit} className="bg-secondary mt-3 py-3 rounded-xl items-center">
                    <Text className="text-primary-dark font-bold text-xs tracking-widest">SAVE CORRECTION</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

      </ScrollView>

      {/* Fixed bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-primary-dark border-t border-white/5">
        <TouchableOpacity
          onPress={handleMainButton}
          className="bg-secondary rounded-full py-5 items-center shadow-lg shadow-secondary/20"
        >
          <Text className="text-primary-dark font-bold text-sm tracking-widest uppercase">
            {getMainButtonLabel()}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
};
