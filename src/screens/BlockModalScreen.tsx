import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { ProfileStackParamList } from '../navigation/types';

type Props = {
  navigation: any;
  route: RouteProp<ProfileStackParamList, 'BlockModal'>;
};

export const BlockModalScreen = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const matchName = route.params?.matchName ?? 'this candidate';

  // BlockModal lives in ProfileStack → navigate up to root tabs for cross-stack routing
  const goToMatches = () => navigation.getParent()?.navigate('DiscoverTab');
  const goToHelp = () => navigation.navigate('HelpDesk');

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-primary-dark/95 justify-center p-6">
      <View className="bg-white rounded-[40px] p-8 items-center shadow-2xl">
        <View className="w-20 h-20 bg-danger/10 rounded-full items-center justify-center mb-6 border-8 border-white shadow-sm">
          <Text className="text-4xl">🛑</Text>
        </View>

        <Text className="text-3xl font-serif font-bold text-slate-900 mb-2 text-center">User Blocked</Text>
        <Text className="text-slate-500 text-center mb-8 leading-relaxed">
          {matchName} has been permanently blocked and reported. Our moderation team is reviewing your dispute. You will not see this candidate again.
        </Text>

        <TouchableOpacity
          onPress={goToMatches}
          className="w-full bg-primary py-5 rounded-2xl items-center shadow-lg shadow-primary/20 mb-4"
        >
          <Text className="text-surface font-bold text-sm tracking-widest uppercase">Return to Match Pool</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToHelp} className="py-2">
          <Text className="text-slate-400 font-bold text-xs tracking-widest uppercase">Contact Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
