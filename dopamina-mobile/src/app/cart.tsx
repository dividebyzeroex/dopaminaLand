import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Animated, PanResponder, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCart } from '@/contexts/CartContext';
import { useSheet } from '@/contexts/SheetContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

const SwipeableCartItem = ({ item, onRemove }: { item: any; onRemove: () => void }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteOpacity = useRef(new Animated.Value(0)).current;
  const imageUrl = item.localImage;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy),
      onPanResponderMove: (_, { dx }) => {
        if (dx < 0) {
          translateX.setValue(dx);
          deleteOpacity.setValue(Math.min(1, Math.abs(dx) / SWIPE_THRESHOLD));
        }
      },
      onPanResponderRelease: (_, { dx }) => {
        if (dx < -SWIPE_THRESHOLD) {
          // Swipe confirmed – slide out then remove
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 250,
            useNativeDriver: true,
          }).start(() => onRemove());
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          Animated.timing(deleteOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View className="mb-4 relative overflow-hidden rounded-2xl">
      {/* Red delete background */}
      <Animated.View
        className="absolute inset-0 bg-red-500 rounded-2xl items-center justify-end flex-row pr-6"
        style={{ opacity: deleteOpacity }}
      >
        <Text className="text-white text-2xl">🗑️</Text>
        <Text className="text-white font-black ml-2 text-sm">REMOVER</Text>
      </Animated.View>

      {/* Card (swipeable) */}
      <Animated.View
        className="flex-row items-center bg-card border border-border rounded-2xl p-4"
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        <View className="w-20 h-20 bg-surface rounded-xl items-center justify-center mr-4 overflow-hidden">
          {imageUrl ? (
            <>
              {!imageLoaded && (
                <View className="absolute inset-0 bg-muted/20 animate-pulse" />
              )}
              <Image
                source={{ uri: imageUrl }}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 12, opacity: imageLoaded ? 1 : 0 }}
                contentFit="cover"
                transition={300}
                onLoad={() => setImageLoaded(true)}
              />
            </>
          ) : (
            <Text className="text-4xl">{item.image}</Text>
          )}
        </View>
        <View className="flex-1 ml-4">
          <Text className="text-foreground font-bold text-base" numberOfLines={1}>{item.shortName || item.name}</Text>
          <Text className="text-neon font-black text-sm mt-1">R$ {item.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
          <Text className="text-muted text-xs mt-1">Qtd: {item.quantity}</Text>
        </View>
        <TouchableOpacity
          className="w-10 h-10 bg-surface items-center justify-center rounded-full ml-2 border border-border"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRemove();
          }}
        >
          <Text className="text-muted font-bold text-lg">✕</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default function CartScreen() {
  const { items, removeItem, cartTotal, clearCart } = useCart();
  const { closeSheet } = useSheet();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-foreground text-2xl font-bold">←</Text>
        </TouchableOpacity>
        <Text className="text-foreground font-black text-2xl flex-1">Seu Carrinho</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            clearCart();
          }}>
            <Text className="text-pop font-bold text-sm">Limpar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Swipe hint */}
      {items.length > 0 && (
        <View className="px-6 pt-2 pb-1">
          <Text className="text-muted text-xs text-center">← Deslize o item para remover</Text>
        </View>
      )}

      {/* Cart Items */}
      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Image
            source={require('@/assets/images/cleiton_nobg.png')}
            style={{ width: 150, height: 150, marginBottom: 16 }}
            contentFit="contain"
            transition={300}
          />
          <Text className="text-foreground font-black text-2xl text-center">O Cleiton está triste.</Text>
          <Text className="text-muted text-center mt-2">Sua sacola está vazia.</Text>
          <TouchableOpacity
            className="mt-8 bg-neon px-8 py-4 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.4)]"
            onPress={() => router.back()}
          >
            <Text className="font-black text-background">VOLTAR ÀS COMPRAS</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SwipeableCartItem
                item={item}
                onRemove={() => removeItem(item.id)}
              />
            )}
            contentContainerStyle={{ padding: 16 }}
          />

          {/* Checkout Footer */}
          <View className="p-6 bg-card border-t border-border border-b-0 pb-10">
            <View className="flex-row justify-between mb-2">
              <Text className="text-muted font-bold">Subtotal</Text>
              <Text className="text-foreground font-bold">R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-neon-green font-bold">Frete Falso (Cleiton)</Text>
              <Text className="text-neon-green font-bold">Grátis</Text>
            </View>
            <View className="flex-row justify-between mb-6">
              <Text className="text-foreground font-black text-xl">Total</Text>
              <Text className="text-neon font-black text-xl">R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
            </View>

            <TouchableOpacity
              className="bg-neon py-4 rounded-2xl items-center shadow-[0_0_15px_rgba(124,58,237,0.4)]"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                closeSheet();
                router.push('/checkout');
              }}
            >
              <Text className="font-black text-background text-lg">FINALIZAR COMPRA ⚡</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
