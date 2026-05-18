import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useAppStore } from '../store/useAppStore';

const SettingRow = ({ label, value, onPress, isDanger }: { label: string, value?: string, onPress?: () => void, isDanger?: boolean }) => (
  <TouchableOpacity onPress={onPress} disabled={!onPress} className="flex-row justify-between items-center py-4 border-b border-slate-100">
    <Text className={`font-bold ${isDanger ? 'text-danger' : 'text-slate-700'}`}>{label}</Text>
    {value && <Text className="text-slate-400">{value}</Text>}
  </TouchableOpacity>
);

export const SettingsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user, isPremium, setPremium, toggleWaliMode, logout } = useAppStore();
  const [baselineMode, setBaselineMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); navigation.reset({ index: 0, routes: [{ name: 'Signup' }] }); } },
    ]);
  };

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-background">
      <ScrollView className="p-6">
        
        <View className="mb-8 mt-4">
          <Text className="text-secondary font-bold text-xs uppercase tracking-[0.2em] mb-2">Account</Text>
          <Text className="text-4xl font-serif font-bold text-slate-900 leading-tight">Settings</Text>
        </View>

        <View className="bg-primary-dark p-6 rounded-t-[32px] border-b border-white/10 flex-row items-center">
          <View className="w-16 h-16 bg-surface/10 rounded-full border border-surface/20 items-center justify-center mr-4">
            <Text className="text-3xl">👤</Text>
          </View>
          <View className="flex-1">
            <Text className="text-secondary font-bold text-[10px] uppercase tracking-widest mb-1">Active Profile</Text>
            <Text className="text-surface font-serif text-2xl font-bold">{user?.name || 'User'}</Text>
            <Text className="text-primary-light text-xs font-bold mt-1">Synthesized from onboarding</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() =>
            navigation.getParent()?.navigate('Onboarding', { screen: 'OnboardingLayer1' })
          }
          className="bg-primary-dark/90 p-5 rounded-b-[32px] shadow-xl mb-8 flex-row items-center justify-between"
        >
          <View>
            <Text className="text-surface font-bold text-sm">Retrain AI Twin</Text>
            <Text className="text-slate-400 text-xs">Restart the 5-step onboarding</Text>
          </View>
          <Text className="text-xl">🔄</Text>
        </TouchableOpacity>

        <View className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-6">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">App Preferences</Text>
          <View className="flex-row justify-between items-center py-4 border-b border-slate-100">
            <Text className="font-bold text-slate-700">Push Notifications</Text>
            <Switch trackColor={{ true: '#059669', false: '#e2e8f0' }} value={notifications} onValueChange={setNotifications} />
          </View>
          <View className="flex-row justify-between items-center py-4 border-b border-slate-100">
            <Text className="font-bold text-slate-700">Wali Mode</Text>
            <Switch trackColor={{ true: '#059669', false: '#e2e8f0' }} value={user?.isWaliMode ?? false} onValueChange={toggleWaliMode} />
          </View>
          <View className="flex-row justify-between items-center py-4 border-b border-slate-100">
            <Text className="font-bold text-slate-700">Premium Status</Text>
            <Switch trackColor={{ true: '#d4af37', false: '#e2e8f0' }} value={isPremium} onValueChange={setPremium} />
          </View>
          <View className="flex-row justify-between items-center py-4">
            <View className="flex-1 mr-4">
              <Text className="font-bold text-slate-700">🔬 Baseline Mode</Text>
              <Text className="text-slate-400 text-xs">Demo: compare agentic vs heuristic matching</Text>
            </View>
            <Switch trackColor={{ true: '#f59e0b', false: '#e2e8f0' }} value={baselineMode} onValueChange={setBaselineMode} />
          </View>
        </View>

        <View className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-12">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Support & Legal</Text>
          <SettingRow label="Help Desk / FAQ" onPress={() => navigation.navigate('HelpDesk')} />
          <SettingRow label="Privacy Policy" />
          <SettingRow label="Terms of Service" />
          <SettingRow label="Sign Out" isDanger onPress={handleSignOut} />
          <SettingRow label="Delete Account" isDanger />
        </View>

      </ScrollView>
    </View>
  );
};
