import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const InputField = ({ label, error, className, ...props }: InputFieldProps) => (
  <View className="mb-4">
    {label && <Text className="text-primary-dark font-bold text-xs mb-2 uppercase tracking-widest">{label}</Text>}
    <TextInput 
      className={`bg-surface border border-slate-200 rounded-xl px-4 py-3 text-primary-dark ${className || ''}`}
      placeholderTextColor="#94a3b8"
      {...props} 
    />
    {error && <Text className="text-danger text-xs mt-1">{error}</Text>}
  </View>
);
