import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { AgTrace } from '../components/AgTrace';

const SettingRow = ({ 
  label, 
  value, 
  onPress, 
  isDanger 
}: { 
  label: string; 
  value?: string; 
  onPress?: () => void; 
  isDanger?: boolean; 
}) => (
  <TouchableOpacity 
    onPress={onPress} 
    disabled={!onPress} 
    className="flex-row justify-between items-center py-4 border-b border-slate-100"
  >
    <Text className={`font-bold text-[14px] ${isDanger ? 'text-rose-600' : 'text-slate-700'}`}>{label}</Text>
    {value && <Text className="text-slate-400 text-xs">{value}</Text>}
  </TouchableOpacity>
);

export const SettingsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user, isPremium, setPremium, toggleWaliMode } = useAppStore();

  const handleSignOut = () => {
    Alert.alert(
      'Bismillah Sign Out',
      'Are you sure you want to sign out from Lab Viah?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => navigation.navigate('Signup') }
      ]
    );
  };

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-slate-50">
      <AgTrace msg="SERVICE_ORCHESTRATOR: ACCESSING SECURE SYSTEM SETTINGS PANEL..." />
      
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        
        <View className="mb-6 mt-4">
          <Text className="text-amber-600 font-bold text-xs uppercase tracking-[0.2em] mb-1">Account & Safety</Text>
          <Text className="text-3.5xl font-serif font-bold text-slate-900 leading-tight">Settings</Text>
        </View>

        {/* Profile Card */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('BasicProfileSetup')}
          className="bg-emerald-950 p-6 rounded-[28px] shadow-xl mb-6 flex-row items-center border border-emerald-900"
        >
          <View className="w-14 h-14 bg-white/10 rounded-full border border-white/15 items-center justify-center mr-4">
            <Text className="text-2.5xl">👤</Text>
          </View>
          <View className="flex-1">
            <Text className="text-amber-500 font-bold text-[8px] uppercase tracking-widest mb-1 font-mono">Active Profile</Text>
            <Text className="text-white font-serif text-xl font-bold leading-none">{user?.name || 'Ayesha Khan'}</Text>
            <Text className="text-emerald-400 text-[10px] font-bold mt-1.5 uppercase tracking-wide">Edit Custom Specifications ➔</Text>
          </View>
        </TouchableOpacity>

        {/* App Preferences */}
        <View className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 mb-5">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">App Preferences</Text>
          
          <View className="flex-row justify-between items-center py-4 border-b border-slate-100">
            <Text className="font-bold text-slate-700 text-[14px]">Push Notifications</Text>
            <Switch trackColor={{ true: '#065f46', false: '#e2e8f0' }} value={true} />
          </View>
          
          <View className="flex-row justify-between items-center py-4 border-b border-slate-100">
            <Text className="font-bold text-slate-700 text-[14px]">Guardian (Wali) Review</Text>
            <Switch 
              trackColor={{ true: '#065f46', false: '#e2e8f0' }} 
              value={user?.isWaliMode || false} 
              onValueChange={toggleWaliMode}
            />
          </View>
          
          <View className="flex-row justify-between items-center py-4">
            <Text className="font-bold text-slate-700 text-[14px]">Premium Status</Text>
            <Switch 
              trackColor={{ true: '#d97706', false: '#e2e8f0' }} 
              value={isPremium} 
              onValueChange={setPremium} 
            />
          </View>
        </View>

        {/* Support & Legal */}
        <View className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 mb-10">
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Support & Legal</Text>
          
          <SettingRow 
            label="Help Desk / FAQ" 
            onPress={() => navigation.navigate('HelpDesk')} 
          />
          <SettingRow 
            label="Privacy Policy & Halal Terms" 
            onPress={() => Alert.alert('Privacy Policy', 'We enforce strict Islamic privacy standards. Your Wali is notified before match reveals. We never sell data.')}
          />
          <SettingRow 
            label="Terms of Service" 
            onPress={() => Alert.alert('Terms of Service', 'By using Lab Viah, you commit to respectful family-oriented communication. Swiping behaviors are blocked.')}
          />
          <SettingRow label="Sign Out" onPress={handleSignOut} isDanger />
        </View>

      </ScrollView>
    </View>
  );
};
