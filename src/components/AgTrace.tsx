import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';

interface TraceEntry {
  label: string;
  value?: string;
}

interface AgTraceProps {
  /** Simple single-line message (legacy API) */
  msg?: string;
  /** Multi-entry structured trace */
  entries?: TraceEntry[];
  /** Show red/warning colour instead of green */
  warning?: boolean;
}

export const AgTrace = ({ msg, entries, warning = false }: AgTraceProps) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const dotColor = warning ? '#ef4444' : '#10b981';
  const textColor = warning ? 'text-red-400' : 'text-emerald-500';
  const borderColor = warning ? 'border-red-900/40' : 'border-emerald-900/40';

  // Simple message mode
  if (msg && !entries) {
    return (
      <View className={`bg-[#020617] border-b ${borderColor} px-4 py-2 flex-row items-center`}>
        <Animated.View style={{ backgroundColor: dotColor, opacity: pulse, width: 8, height: 8, borderRadius: 4, marginRight: 8 }} />
        <Text className={`${textColor} font-mono text-[9px] uppercase tracking-widest flex-1`} numberOfLines={1}>
          AG-TRACE // {msg}
        </Text>
      </View>
    );
  }

  // Multi-entry horizontal scroll mode
  const allEntries = entries ?? [];
  return (
    <View className={`bg-[#020617] border-b ${borderColor} py-2`}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 8, flexDirection: 'row', alignItems: 'center' }}>
        <Animated.View style={{ opacity: pulse, width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor, marginRight: 6 }} />
        <Text className={`${textColor} font-mono text-[9px] uppercase tracking-widest mr-3`}>AG-TRACE</Text>
        {allEntries.map((entry, i) => (
          <View key={i} className="bg-white/5 border border-white/10 rounded-md px-2.5 py-1 flex-row items-center">
            <Text className="text-slate-400 font-mono text-[9px] uppercase mr-1.5">{entry.label}:</Text>
            {entry.value && (
              <Text className={`font-mono font-bold text-[9px] ${textColor}`}>{entry.value}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
