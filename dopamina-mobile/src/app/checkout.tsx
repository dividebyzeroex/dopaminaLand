import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCart } from '@/contexts/CartContext';
import { useIntentTracker, trackIntent } from '@/hooks/useIntentTracker';
import { useSheet } from '@/contexts/SheetContext';
import { supabase } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';
import { v4 as uuidv4 } from 'uuid'; // need to install uuid or just use a random string.
// Let's use a simple math random for orderId in mobile to avoid extra dependencies, or just a simple mock UUID generator

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartTotal, items, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { trackCheckout } = useIntentTracker();
  const { setTabBarVisible } = useSheet();

  // Hide floating tab bar when focused on this screen, restore on blur
  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      return () => setTabBarVisible(true);
    }, [])
  );

  // Log begin_checkout telemetry on mount for each item in the cart
  useEffect(() => {
    items.forEach((item) => {
      trackIntent({
        eventType: 'begin_checkout',
        productId: Number(item.id),
        priceDisplayed: item.salePrice,
        metadata: { source: 'mobile_checkout_mount' }
      });
    });
  }, []);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      // Log telemetry for each item using the correct session ID and column names
      for (const item of items) {
        await trackIntent({
          eventType: 'fake_checkout',
          productId: Number(item.id),
          priceDisplayed: item.salePrice,
          metadata: { source: 'mobile_checkout' }
        });
      }

      // Generate Order ID
      const orderId = generateUUID().split('-')[0].toUpperCase();
      
      // Clear cart
      clearCart();
      trackCheckout(cartTotal);

      // Navigate to success
      router.replace(`/success/${orderId}`);

    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-6">
          <View className="py-4 flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-foreground text-2xl font-bold">← Voltar</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-3xl font-black text-foreground mt-4">Checkout 1-Clique</Text>
          <Text className="text-muted mt-2 mb-8">Nenhum dado é real, mas a dopamina sim.</Text>

          {/* Fake Form */}
          <View className="space-y-4 gap-4">
            <View>
              <Text className="text-foreground font-bold mb-2">Cartão Imaginário</Text>
              <TextInput 
                className="bg-surface border border-border rounded-xl p-4 text-foreground font-mono"
                placeholder="0000 0000 0000 0000"
                placeholderTextColor="#8b8496"
                editable={false}
                value="4532 •••• •••• 9876"
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-foreground font-bold mb-2">Validade</Text>
                <TextInput 
                  className="bg-surface border border-border rounded-xl p-4 text-foreground font-mono"
                  placeholder="MM/AA"
                  placeholderTextColor="#8b8496"
                  editable={false}
                  value="12/99"
                />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-bold mb-2">CVV</Text>
                <TextInput 
                  className="bg-surface border border-border rounded-xl p-4 text-foreground font-mono"
                  placeholder="123"
                  placeholderTextColor="#8b8496"
                  editable={false}
                  value="000"
                />
              </View>
            </View>

            <View>
              <Text className="text-foreground font-bold mb-2">Endereço de Entrega (Cleiton)</Text>
              <TextInput 
                className="bg-surface border border-border rounded-xl p-4 text-foreground"
                placeholder="Seu endereço falso"
                placeholderTextColor="#8b8496"
                editable={false}
                value="Rua dos Bobos, nº 0"
              />
            </View>
          </View>

          {/* Total */}
          <View className="mt-8 bg-card border border-border rounded-2xl p-6">
            <View className="flex-row justify-between">
              <Text className="text-foreground font-bold text-lg">Total Falso:</Text>
              <Text className="text-neon font-black text-2xl">R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-foreground font-bold text-lg">Você Paga:</Text>
              <Text className="text-neon-green font-black text-2xl">R$ 0,00</Text>
            </View>
          </View>

          <TouchableOpacity 
            className="mt-8 bg-neon py-4 rounded-2xl items-center shadow-[0_0_15px_rgba(124,58,237,0.4)] mb-10"
            onPress={handleCheckout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="font-black text-background text-lg">PAGAR E RECEBER DOPAMINA</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
