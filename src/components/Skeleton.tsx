// Pulse-animated rounded rectangle for loading placeholders.
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, type DimensionValue } from 'react-native';

type Props = {
  width?: DimensionValue;
  height?: number;
  className?: string;
  rounded?: number;
};

export const Skeleton = ({
  width = '100%',
  height = 14,
  className,
  rounded = 8,
}: Props) => {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius: rounded,
        backgroundColor: '#e2e8f0',
        opacity,
      }}
      className={className}
    >
      <View />
    </Animated.View>
  );
};
