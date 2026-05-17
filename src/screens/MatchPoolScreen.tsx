import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useAppStore } from '../store/useAppStore';

export const MatchPoolScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { matches } = useAppStore();

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-background">
      <ScrollView className="p-6">
        
        <View className="flex-row justify-between items-center mt-4 mb-8">
          <View>
            <Text className="text-secondary font-bold text-xs uppercase tracking-[0.2em] mb-1">Discovery</Text>
            <Text className="text-3xl font-serif font-bold text-slate-900">Match Pool</Text>
          </View>
          <View className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <Text className="text-primary font-bold text-xs">2 ACTIVE</Text>
          </View>
        </View>

        {matches.map(match => (
          <TouchableOpacity 
            key={match.id}
            onPress={() => navigation.navigate('TwinDebate')}
            className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 mb-6 flex-row"
          >
            <View className="w-20 h-20 rounded-2xl overflow-hidden mr-4 border-2 border-surface shadow-md">
              <Image source={{ uri: match.blurAvatar }} className="w-full h-full opacity-80" blurRadius={10} />
            </View>
            
            <View className="flex-1 justify-center">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xl font-bold text-slate-900">{match.name}</Text>
                <Text className="text-secondary font-bold text-lg">{match.compatibility}%</Text>
              </View>
              
              <View className="flex-row flex-wrap gap-2">
                {match.tags.map(tag => (
                  <View key={tag} className="bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                    <Text className="text-[10px] text-slate-500 font-bold uppercase">{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );
};
