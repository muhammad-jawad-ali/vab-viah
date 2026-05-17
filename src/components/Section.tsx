import React, { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

interface SectionProps extends ViewProps {
  children: ReactNode;
}

export const Section = ({ children, className, ...props }: SectionProps) => (
  <View className={`bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-6 ${className || ''}`} {...props}>
    {children}
  </View>
);
