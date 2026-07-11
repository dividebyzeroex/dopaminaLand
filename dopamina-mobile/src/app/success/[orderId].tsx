import React, { useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSheet } from '@/contexts/SheetContext';

export default function SuccessScreen() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();
  const { setTabBarVisible } = useSheet();

  // Hide floating tab bar when focused on this screen, restore on blur
  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      return () => setTabBarVisible(true);
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-background justify-center">
      <View className="flex-1 items-center justify-center px-6">
        
        <View className="relative w-64 h-64 mb-8">
          <View className="absolute inset-0 bg-neon/20 rounded-full blur-3xl animate-pulse" />
          <Image 
            source={{ uri: 'https://raw.githubusercontent.com/dividebyzeroex/dopaminaLand/main/dopamina-brasil/public/cleiton_nobg2.png' }} 
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>

        <Text className="text-4xl font-black text-white text-center mb-2">Pedido Falso Confirmado!</Text>
        <Text className="text-muted text-center mb-8">O Cleiton já está aquecendo a moto. Sua dopamina chegará em breve (ou não).</Text>

        <View className="bg-surface border border-border p-4 rounded-xl w-full mb-8">
          <Text className="text-muted text-xs uppercase font-bold mb-1">CÓDIGO DE RASTREIO</Text>
          <Text className="text-neon font-mono text-xl">{orderId}</Text>
        </View>

        <TouchableOpacity 
          className="w-full bg-neon py-4 rounded-2xl items-center shadow-[0_0_15px_rgba(204,255,0,0.4)] mb-4"
          onPress={() => router.push(`/tracking/${orderId}`)}
        >
          <Text className="font-black text-background text-lg">RASTREAR CLEITON AO VIVO 📍</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="w-full border border-neon py-4 rounded-2xl items-center"
          onPress={() => router.push('/')}
        >
          <Text className="font-black text-neon text-lg">VOLTAR AO INÍCIO</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
