import React, { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StatusBar, Alert, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MeetingStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';

type Props = {
  navigation: NativeStackNavigationProp<MeetingStackParamList, 'VideoMeeting'>;
  route: RouteProp<MeetingStackParamList, 'VideoMeeting'>;
};

export const VideoMeetingScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const { meetingId, matchName } = route.params || {};
  
  const { meetingsList, setMeetingStatus } = useAppStore();
  const currentMeeting = meetingsList.find((m) => m.id === meetingId);
  const isCallEnded = currentMeeting?.status === 'pending_feedback' || currentMeeting?.status === 'done';
  const resolvedMatchName = matchName || currentMeeting?.matchName || 'Your Match';

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (!isCallEnded) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
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
      if (animation) {
        animation.stop();
      }
    };
  }, [isCallEnded]);

  const handleEndCall = () => {
    Alert.alert(
      '☎️ Conclude Matrimonial Meeting',
      `Choose how you would like to end your moderator-guided conversation with ${resolvedMatchName}:`,
      [
        {
          text: 'Rate & Calibrate Twin Now',
          onPress: () => {
            navigation.navigate('FeedbackSurvey', { meetingId });
          },
        },
        {
          text: 'Rate Later & Stay on Page',
          onPress: () => {
            if (meetingId) {
              setMeetingStatus(meetingId, 'pending_feedback');
            }
          },
        },
        {
          text: 'Cancel Call Concluding',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      {/* Top Bar */}
      <View className="absolute top-12 left-0 right-0 z-10 px-6 flex-row justify-between items-center">
        <View className={`px-3 py-1 rounded-full flex-row items-center ${isCallEnded ? 'bg-amber-600/80' : 'bg-danger/80'}`}>
          {isCallEnded ? (
            <View className="w-2 h-2 rounded-full bg-slate-900 mr-2" />
          ) : (
            <Animated.View 
              style={{ opacity: pulseAnim }}
              className="w-2 h-2 rounded-full bg-white mr-2" 
            />
          )}
          <Text className="text-white text-[10px] font-bold tracking-widest uppercase">
            {isCallEnded ? 'Concluded' : '04:23'}
          </Text>
        </View>
        <Text className="text-white/50 text-[10px] font-mono tracking-[0.2em] uppercase">
          {isCallEnded ? 'Review Mode' : 'E2E Encrypted'}
        </Text>
      </View>

      {/* Main Video View (Match) */}
      <View className="flex-1 bg-slate-900 justify-center items-center px-8">
        <Text className="text-white/20 text-4xl">👱‍♀️</Text>
        <Text className="text-white/30 font-serif mt-4">{resolvedMatchName}</Text>
      </View>

      {/* Floating Viewports */}
      <View className="absolute bottom-32 right-6 gap-4">
        {/* User Viewport */}
        <View className={`w-24 h-36 bg-slate-800 rounded-2xl border-2 border-primary-light/50 overflow-hidden justify-center items-center ${isCallEnded ? 'opacity-40' : ''}`}>
          <Text className="text-white/30 text-2xl">👨</Text>
          <View className="absolute bottom-1 left-0 right-0 items-center">
            <Text className="text-white/70 text-[8px] font-bold bg-black/50 px-2 rounded-full">
              {isCallEnded ? 'Offline' : 'You'}
            </Text>
          </View>
        </View>
        {/* Wali Viewport */}
        <View className={`w-24 h-36 bg-slate-800 rounded-2xl border border-secondary/50 overflow-hidden justify-center items-center shadow-lg shadow-secondary/20 ${isCallEnded ? 'opacity-40' : ''}`}>
          <Text className="text-white/30 text-2xl">🧔‍♂️</Text>
          <View className="absolute bottom-1 left-0 right-0 items-center">
            <Text className="text-secondary text-[8px] font-bold bg-black/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {isCallEnded ? 'Offline' : 'Wali Stream'}
            </Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black to-transparent flex-row justify-center items-center gap-6 pb-6">
        {!isCallEnded ? (
          <>
            <TouchableOpacity className="w-12 h-12 rounded-full bg-white/10 items-center justify-center">
              <Text className="text-white">🎙️</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleEndCall}
              className="w-16 h-16 rounded-full bg-danger items-center justify-center shadow-lg shadow-danger/50"
            >
              <Text className="text-white text-2xl">☎️</Text>
            </TouchableOpacity>
            <TouchableOpacity className="w-12 h-12 rounded-full bg-white/10 items-center justify-center">
              <Text className="text-white">📷</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            onPress={() => navigation.getParent()?.navigate('MeetingsTab')}
            className="bg-slate-800 border border-slate-700 px-8 py-3.5 rounded-2xl items-center shadow-lg shadow-black/30"
          >
            <Text className="text-white font-bold text-xs uppercase tracking-widest">Exit Meeting Room</Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
};
