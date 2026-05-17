import React from 'react';
import { View, Text } from 'react-native';

export const AgTrace = ({ msg }: { msg: string }) => (
  <View className="bg-slate-900 border-b border-primary/20 px-4 py-1.5">
    <Text className="text-primary-light font-mono text-[9px] uppercase tracking-widest">
      AG-TRACE // {msg}
    </Text>
  </View>
);
