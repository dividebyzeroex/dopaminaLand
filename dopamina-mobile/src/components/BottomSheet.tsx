import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = 120;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy, dx }) =>
        dy > 10 && Math.abs(dy) > Math.abs(dx),
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) translateY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > DISMISS_THRESHOLD || vy > 1.5) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    })
  ).current;

  if (!visible && translateY.__getValue() >= SCREEN_HEIGHT) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }} pointerEvents={visible ? 'box-none' : 'none'}>
      {/* Backdrop */}
      <Animated.View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', opacity: overlayOpacity }}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: SCREEN_HEIGHT * 0.92,
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          overflow: 'hidden',
          transform: [{ translateY }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 24,
        }}
      >
        {/* Drag handle with glass effect */}
        <View {...panResponder.panHandlers} style={{ overflow: 'hidden', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <BlurView intensity={60} tint="light" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <View style={{ backgroundColor: 'rgba(255,255,255,0.5)', paddingTop: 12, paddingBottom: 10, alignItems: 'center' }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.2)' }} />
          </View>
        </View>

        {/* Screen content */}
        <View style={{ flex: 1 }}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}
