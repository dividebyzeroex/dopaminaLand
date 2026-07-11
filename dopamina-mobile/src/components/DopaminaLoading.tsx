import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

export default function DopaminaLoading({ size = 'large' }: { size?: 'small' | 'large' }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.4, duration: 300, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true })
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.4, duration: 500, useNativeDriver: true })
        ])
      ])
    ).start();
  }, []);

  const fontSize = size === 'small' ? 24 : 48;

  return (
    <View className="flex-1 justify-center items-center p-4">
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <Text style={{ fontSize, textShadowColor: '#f59e0b', textShadowRadius: 10 }}>⚡</Text>
      </Animated.View>
      {size === 'large' && (
        <Text className="text-neon font-black text-xs mt-6 tracking-widest uppercase">
          carregando dopamina...
        </Text>
      )}
    </View>
  );
}
