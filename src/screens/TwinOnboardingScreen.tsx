import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { AgTrace } from '../components/AgTrace';
import { SafeScreen } from '../components/SafeScreen';
import { useAppStore } from '../store/useAppStore';

export const TwinOnboardingScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const { user, toggleWaliMode } = useAppStore();

  const SCENARIOS = [
    {
      title: "Career vs. Family",
      text: "Your partner is offered a life-changing role abroad, but your parents rely on your physical presence at home. What do you do?",
      optionA: "CAREER",
      optionB: "FAMILY",
    },
    {
      title: "Financial Independence",
      text: "Your partner wants to combine all finances into a joint account, but you prefer to keep your savings separate. How do you respond?",
      optionA: "JOINT",
      optionB: "SEPARATE",
    },
    {
      title: "Conflict Resolution",
      text: "After a heated argument, your partner prefers to be left alone for hours, but you want to resolve it immediately. What is your approach?",
      optionA: "GIVE SPACE",
      optionB: "RESOLVE NOW",
    }
  ];

  return (
    <SafeScreen className="bg-primary-dark">
      <AgTrace msg={step === 1 ? "INITIALIZING VOCAL EXTRACTION..." : step === 2 ? "CALIBRATING MORAL DIMENSIONS..." : "FINALIZING TWIN WEIGHTS"} />
      
      <View className="flex-1 p-6 justify-between">
        
        <View className="mt-8">
          <View className="flex-row justify-between items-center mb-12">
            <Text className="text-secondary font-bold text-[10px] tracking-[0.2em] uppercase">Phase {step} of 3</Text>
            <View className="flex-row gap-2">
              <View className={`h-1 w-8 rounded-full ${step >= 1 ? 'bg-secondary' : 'bg-primary'}`} />
              <View className={`h-1 w-8 rounded-full ${step >= 2 ? 'bg-secondary' : 'bg-primary'}`} />
              <View className={`h-1 w-8 rounded-full ${step >= 3 ? 'bg-secondary' : 'bg-primary'}`} />
            </View>
          </View>

          {step === 1 && (
            <View>
              <Text className="text-surface font-serif text-4xl mb-6 leading-tight">Introduce yourself naturally.</Text>
              <View className="bg-primary/50 border border-primary p-6 rounded-3xl mb-8">
                <Text className="text-primary-light font-serif italic text-lg mb-4">"I'm listening. Tell me about what truly matters to you in a partner."</Text>
                <View className="flex-row items-center gap-4 mt-6">
                  <View className="w-16 h-16 rounded-full bg-secondary items-center justify-center shadow-lg shadow-secondary/20">
                    <Text className="text-2xl">🎙️</Text>
                  </View>
                  <Text className="text-surface opacity-50 font-mono text-xs">Waiting for voice input...</Text>
                </View>
              </View>

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

          {step === 2 && (
            <View>
              <Text className="text-surface font-serif text-3xl mb-8 leading-tight">Scenario: {SCENARIOS[scenarioIndex].title}</Text>
              <View className="bg-surface rounded-[40px] p-8 shadow-2xl">
                <Text className="text-primary-dark font-serif text-xl leading-relaxed text-center mb-12">
                  "{SCENARIOS[scenarioIndex].text}"
                </Text>
                <View className="flex-row justify-between gap-4">
                  <TouchableOpacity className="flex-1 bg-slate-100 py-4 rounded-2xl items-center border border-slate-200"><Text className="font-bold text-slate-800 text-xs tracking-widest">{SCENARIOS[scenarioIndex].optionA}</Text></TouchableOpacity>
                  <TouchableOpacity className="flex-1 bg-primary py-4 rounded-2xl items-center shadow-lg shadow-primary/30"><Text className="font-bold text-surface text-xs tracking-widest">{SCENARIOS[scenarioIndex].optionB}</Text></TouchableOpacity>
                </View>
              </View>
              <View className="mt-8 flex-row justify-center gap-2">
                {SCENARIOS.map((_, i) => (
                  <View key={i} className={`h-2 w-2 rounded-full ${i === scenarioIndex ? 'bg-secondary' : 'bg-surface/30'}`} />
                ))}
              </View>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text className="text-surface font-serif text-3xl mb-8 leading-tight">Your AI Twin is ready.</Text>
              <View className="border border-secondary/30 bg-secondary/5 p-6 rounded-3xl">
                <Text className="text-secondary font-bold text-xs tracking-widest mb-4">TWIN SUMMARY v1.0</Text>
                <Text className="text-surface/80 font-serif text-lg leading-relaxed mb-6">
                  "I value family proximity over career relocation, but I maintain high ambition in my local sphere. Religious alignment is non-negotiable."
                </Text>
                <View className="flex-row gap-4">
                  <TouchableOpacity className="flex-1 bg-surface py-3 rounded-xl items-center"><Text className="text-primary-dark font-bold text-xs tracking-widest">✓ CONFIRM</Text></TouchableOpacity>
                  <TouchableOpacity className="flex-1 border border-surface/20 py-3 rounded-xl items-center"><Text className="text-surface opacity-50 font-bold text-xs tracking-widest">✎ EDIT</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          )}

        </View>

        <TouchableOpacity 
          onPress={() => {
            if (step === 2) {
              if (scenarioIndex < SCENARIOS.length - 1) {
                setScenarioIndex(scenarioIndex + 1);
              } else {
                setStep(3);
              }
            } else if (step < 3) {
              setStep(step + 1);
            } else {
              navigation.navigate('Main');
            }
          }}
          className="bg-secondary rounded-full py-5 items-center shadow-lg shadow-secondary/20"
        >
          <Text className="text-primary-dark font-bold text-sm tracking-widest uppercase">
            {step === 2 && scenarioIndex < SCENARIOS.length - 1 ? 'Next Scenario' : step < 3 ? 'Continue' : 'Enter Match Pool'}
          </Text>
        </TouchableOpacity>

      </View>
    </SafeScreen>
  );
};
