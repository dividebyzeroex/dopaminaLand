import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { View, Text, Animated } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';

interface CartToastContextType {
  showCartToast: () => void;
}

const CartToastContext = createContext<CartToastContextType>({ showCartToast: () => {} });

export function useCartToast() {
  return useContext(CartToastContext);
}

export function CartToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showCartToast = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setVisible(true);

    Animated.parallel([
      Animated.spring(opacity, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
    ]).start();

    timer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.85, duration: 300, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }, 2200);
  }, []);

  return (
    <CartToastContext.Provider value={{ showCartToast }}>
      {children}
      {visible && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
        }}>
          <Animated.View style={{
            opacity,
            transform: [{ scale }],
            borderRadius: 28,
            overflow: 'hidden',
            shadowColor: '#7c3aed',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 24,
            elevation: 16,
            minWidth: 220,
          }}>
            {/* Glass background */}
            <BlurView intensity={80} tint="light" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
            <View style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(255,255,255,0.6)',
              borderRadius: 28,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.8)',
            }} />
            {/* Content */}
            <View style={{ paddingVertical: 32, paddingHorizontal: 40, alignItems: 'center' }}>
              <Image
                source={require('@/assets/images/cleiton_nobg.png')}
                style={{ width: 100, height: 100, marginBottom: 12 }}
                contentFit="contain"
              />
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#09090b', letterSpacing: -0.5 }}>
                Produto Adicionado!
              </Text>
              <Text style={{ fontSize: 13, color: '#7c3aed', fontWeight: '700', marginTop: 4 }}>
                ⚡ Cleiton está a caminho
              </Text>
            </View>
          </Animated.View>
        </View>
      )}
    </CartToastContext.Provider>
  );
}
