import React, { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeScreenProps extends ViewProps {
  children: ReactNode;
}

export const SafeScreen = ({ children, style, className, ...props }: SafeScreenProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View 
      style={[{ paddingTop: insets.top, paddingBottom: insets.bottom }, style]} 
      className={`flex-1 bg-background ${className || ''}`}
      {...props}
    >
      {children}
    </View>
  );
};
