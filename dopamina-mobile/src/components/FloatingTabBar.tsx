import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSheet } from '@/contexts/SheetContext';

const TABS = [
  { name: 'index',   icon: '🏠', label: 'Início',   sheet: null               },
  { name: 'ofertas', icon: '🔥', label: 'Ofertas',  sheet: 'ofertas' as const },
  { name: 'perfil',  icon: '👤', label: 'Perfil',   sheet: 'perfil'  as const },
  { name: 'cart',    icon: '🛒', label: 'Carrinho', sheet: 'cart'    as const },
];

export default function FloatingTabBar({ state, navigation }: { state: any; navigation: any }) {
  const insets = useSafeAreaInsets();
  const { openSheet, closeSheet, activeSheet, tabBarVisible } = useSheet();
  const slideY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideY, {
      toValue: tabBarVisible ? 0 : 120,
      useNativeDriver: true,
      tension: 70,
      friction: 12,
    }).start();
  }, [tabBarVisible]);

  const handlePress = (tab: (typeof TABS)[number], index: number) => {
    if (tab.sheet) {
      if (activeSheet === tab.sheet) {
        closeSheet();
      } else {
        openSheet(tab.sheet);
      }
    } else {
      closeSheet();
      const event = navigation.emit({ type: 'tabPress', target: state.routes[index].key, canPreventDefault: true });
      if (!event.defaultPrevented) {
        navigation.navigate(state.routes[index].name);
      }
    }
  };

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: insets.bottom + 12,
        left: 24,
        right: 24,
        height: 64,
        zIndex: 999,
        borderRadius: 40,
        overflow: 'hidden',
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 20,
        transform: [{ translateY: slideY }],
      }}
    >
      {/* Glass blur layer */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 60}
        tint="light"
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
        }}
      />

      {/* Frosted overlay */}
      <View
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.55)',
          borderRadius: 40,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.75)',
        }}
      />

      {/* Tab items */}
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
        {TABS.map((tab, index) => {
          const isActive = tab.sheet
            ? activeSheet === tab.sheet
            : state.index === index && !activeSheet;

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => handlePress(tab, index)}
              activeOpacity={0.7}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              {isActive && (
                <View
                  style={{
                    position: 'absolute',
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#7c3aed',
                    opacity: 0.12,
                  }}
                />
              )}
              <Text style={{ fontSize: 20, marginBottom: 2 }}>{tab.icon}</Text>
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: '800',
                  letterSpacing: 0.3,
                  color: isActive ? '#7c3aed' : '#71717a',
                }}
              >
                {tab.label.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}
