import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../api/client';
import { saveAuth } from '../api/auth';
import { ApiError } from '../api/types';
import { useAppStore } from '../store/useAppStore';
import { loadOnboardingState } from '../api/onboardingState';

const COUNTRY_CODES = [
  { code: '+92', country: 'Pakistan' },
  { code: '+971', country: 'UAE' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+44', country: 'UK' },
  { code: '+1', country: 'USA/Canada' },
  { code: '+61', country: 'Australia' },
];

export const SignupScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const setPhoneNumberInStore = useAppStore((s) => s.setPhoneNumber);

  const [localPhone, setLocalPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+92');
  const [showPicker, setShowPicker] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // E.164 — digits only after the leading `+`.
  const e164 = `${countryCode}${localPhone.replace(/\D/g, '')}`;

  const sendCode = async () => {
    if (localPhone.replace(/\D/g, '').length < 7) {
      Alert.alert('Phone number required', 'Please enter a valid phone number to continue.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.auth.otpStart({ phone: e164 });
      setPhoneNumberInStore(e164);
      setOtpSent(true);
      if (__DEV__ && res.dev) {
        // Dev bypass active server-side. UI hint surfaces the expected code.
        Alert.alert('Dev bypass active', `Use code ${process.env.EXPO_PUBLIC_DEV_OTP_CODE ?? '0000'} to verify.`);
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not send code. Please try again.';
      Alert.alert('Send failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const verify = async () => {
    if (otp.length < 4) {
      Alert.alert('Code required', 'Enter the 4-digit code we sent you.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.auth.otpVerify({ phone: e164, otp });
      await saveAuth(res.access_token, res.user_id);

      // Rehydrate any in-flight onboarding state so a returning user lands on
      // the right layer if they'd previously paused mid-flow.
      await loadOnboardingState();

      // Decide post-verify destination: if /twin/me returns a spec we send the
      // user straight to Main; otherwise into the onboarding sub-stack (which
      // resumes at the last completed layer via OnboardingStack.initialRoute).
      try {
        const me = await api.twin.me();
        useAppStore.getState().setTwinSpec(me.spec);
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } catch (twinErr) {
        if (twinErr instanceof ApiError && twinErr.code === 'NOT_FOUND') {
          useAppStore.getState().setHasTwin(false);
        }
        navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Verification failed. Please try again.';
      Alert.alert('Verify failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        className="flex-1 bg-primary"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 p-8 justify-between"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
          <View className="mt-8 flex-row justify-between items-start w-full">
            <View className="flex-1 pr-4">
              <Text className="text-secondary font-serif italic text-lg mb-2">Bismillah</Text>
              <Text className="text-surface font-serif text-5xl mb-4 font-bold tracking-tight">
                Lab Viah.
              </Text>
              <Text className="text-primary-light text-sm font-bold tracking-widest uppercase">
                Halal • Agentic • Automated
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Main')}
              className="bg-emerald-900/50 border border-emerald-500/20 px-4 py-2 rounded-full mt-2"
            >
              <Text className="text-secondary text-[11px] font-bold tracking-wider uppercase">
                Skip ➔
              </Text>
            </TouchableOpacity>
          </View>

          <View className="w-full pb-10">
            {!otpSent ? (
              <View className="mb-8">
                <Text className="text-primary-light font-bold text-xs uppercase mb-2 ml-1">
                  Secure Phone Verification
                </Text>
                <View className="bg-primary-dark border border-primary-light/30 rounded-2xl flex-row items-center shadow-2xl">
                  <TouchableOpacity
                    onPress={() => setShowPicker(true)}
                    className="pl-5 pr-3 py-4 border-r border-primary-light/30 flex-row items-center justify-center"
                  >
                    <Text className="text-surface font-bold text-xl mr-2">{countryCode}</Text>
                    <Text className="text-surface opacity-50 text-[10px] mt-1">▼</Text>
                  </TouchableOpacity>
                  <TextInput
                    className="flex-1 text-surface text-xl px-4 py-4"
                    placeholder="300 1234567"
                    placeholderTextColor="#059669"
                    keyboardType="phone-pad"
                    value={localPhone}
                    onChangeText={setLocalPhone}
                    autoFocus
                    editable={!submitting}
                  />
                </View>
                {__DEV__ ? (
                  <Text className="text-primary-light/70 text-[11px] mt-2 ml-1">
                    Dev tip: use +923001234567 with code 0000
                  </Text>
                ) : null}
              </View>
            ) : (
              <View className="mb-8">
                <Text className="text-primary-light font-bold text-xs uppercase mb-2 ml-1">
                  Enter OTP Sent to {countryCode} {localPhone}
                </Text>
                <View className="bg-primary-dark border border-secondary rounded-2xl shadow-2xl shadow-secondary/20">
                  <TextInput
                    className="text-surface text-center text-3xl tracking-[0.8em] font-bold py-5"
                    placeholder="••••"
                    placeholderTextColor="#059669"
                    keyboardType="number-pad"
                    maxLength={4}
                    value={otp}
                    onChangeText={setOtp}
                    autoFocus
                    editable={!submitting}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setOtpSent(false);
                    setOtp('');
                  }}
                  className="mt-3 self-center"
                  disabled={submitting}
                >
                  <Text className="text-primary-light text-xs underline">Wrong number? Edit</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={otpSent ? verify : sendCode}
              disabled={submitting}
              className="bg-secondary rounded-2xl py-5 items-center shadow-lg shadow-secondary/30 mt-2"
              style={{ opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? (
                <ActivityIndicator color="#064e3b" />
              ) : (
                <Text className="text-primary-dark font-bold text-sm tracking-widest uppercase">
                  {otpSent ? 'Verify Identity' : 'Send Code'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <Modal visible={showPicker} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/60">
            <View className="bg-white rounded-t-[32px] p-6 max-h-[60%]">
              <View className="flex-row justify-between items-center mb-6 mt-2">
                <Text className="text-slate-900 font-serif text-2xl font-bold">Select Region</Text>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text className="text-slate-400 font-bold uppercase text-xs tracking-widest bg-slate-100 px-4 py-2 rounded-full">
                    ✕ Close
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {COUNTRY_CODES.map((item) => (
                  <TouchableOpacity
                    key={item.code}
                    onPress={() => {
                      setCountryCode(item.code);
                      setShowPicker(false);
                    }}
                    className={`flex-row justify-between items-center py-5 border-b border-slate-100 ${
                      countryCode === item.code ? 'bg-primary/5 rounded-2xl px-4 border-0' : ''
                    }`}
                  >
                    <Text
                      className={`text-xl ${
                        countryCode === item.code ? 'text-primary font-bold' : 'text-slate-700'
                      }`}
                    >
                      {item.country}
                    </Text>
                    <Text
                      className={`text-xl ${
                        countryCode === item.code
                          ? 'text-primary font-bold'
                          : 'text-slate-500 font-mono'
                      }`}
                    >
                      {item.code}
                    </Text>
                  </TouchableOpacity>
                ))}
                <View className="h-10" />
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};
