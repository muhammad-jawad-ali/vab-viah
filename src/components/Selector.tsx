import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

interface SelectorProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  label?: string;
}

export const Selector = ({ options, selected, onSelect, label }: SelectorProps) => (
  <View className="mb-4">
    {label && <Text className="text-primary-dark font-bold text-xs mb-2 uppercase tracking-widest">{label}</Text>}
    <View className="flex-row flex-wrap gap-2">
      {options.map(opt => (
        <TouchableOpacity 
          key={opt}
          onPress={() => onSelect(opt)}
          className={`px-4 py-2 rounded-full border ${selected === opt ? 'bg-primary border-primary' : 'bg-surface border-slate-200'}`}
        >
          <Text className={`font-bold text-xs tracking-wide ${selected === opt ? 'text-surface' : 'text-primary-dark'}`}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);
