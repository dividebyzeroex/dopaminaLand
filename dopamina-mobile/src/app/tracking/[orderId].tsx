import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
// We can just define some basic events directly here for mobile
const trackingEventsData = [
  { title: "Pedido Confirmado", description: "O cartão imaginário foi aprovado." },
  { title: "Em Separação", description: "Cleiton está buscando os itens na caixa do nada." },
  { title: "Na Estrada", description: "O Cleiton empinou a moto." },
  { title: "Quase lá", description: "O cachorro do vizinho tentou morder o pneu." },
  { title: "Entregue", description: "O pacote imaginário foi arremessado no seu quintal." }
];

export default function TrackingScreen() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();
  
  const [progress, setProgress] = useState(0); // 0 to 1
  const [timeLeft, setTimeLeft] = useState(48 * 60 * 60 * 1000); // 48h in ms
  const [loading, setLoading] = useState(true);

  const destination = { lat: -23.5505, lng: -46.6333 }; // SP
  const origin = { lat: -3.1190, lng: -60.0217 }; // Manaus
  const TOTAL_DURATION = 48 * 60 * 60 * 1000;

  useEffect(() => {
    let timer: NodeJS.Timeout;

    async function initTracking() {
      try {
        const storageKey = `dopamina_order_time_${orderId}`;
        let startTimeStr = await AsyncStorage.getItem(storageKey);
        let startTime = parseInt(startTimeStr || '0', 10);
        
        if (!startTime) {
          startTime = Date.now();
          await AsyncStorage.setItem(storageKey, startTime.toString());
        }

        timer = setInterval(() => {
          const now = Date.now();
          const elapsed = now - startTime;
          let currentProgress = elapsed / TOTAL_DURATION;
          
          if (currentProgress > 1) currentProgress = 1;

          setProgress(currentProgress);
          setTimeLeft(Math.max(0, TOTAL_DURATION - elapsed));
        }, 1000);

        setLoading(false);
      } catch (e) {
        console.error("Failed to load tracking data", e);
        setLoading(false);
      }
    }

    initTracking();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [orderId]);

  const currentEventIndex = Math.min(
    Math.floor(progress * trackingEventsData.length),
    trackingEventsData.length - 1
  );

  const eventProgress = currentEventIndex / (trackingEventsData.length - 1);
  const currentMapPosition = {
    lat: origin.lat + (destination.lat - origin.lat) * eventProgress,
    lng: origin.lng + (destination.lng - origin.lng) * eventProgress,
  };

  const currentEvent = trackingEventsData[currentEventIndex];

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator color="#ccff00" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-border justify-between">
        <TouchableOpacity onPress={() => router.push('/')}>
          <Text className="text-foreground text-sm font-bold bg-surface px-4 py-2 rounded-full">← Home</Text>
        </TouchableOpacity>
        <Text className="text-muted font-mono font-bold">{orderId}</Text>
      </View>

      <View className="flex-1 px-4 py-6">
        {/* Countdown */}
        <View className="items-center bg-surface border border-border rounded-3xl p-6 mb-6">
          <Text className="text-neon font-bold text-xs uppercase tracking-widest mb-4">
            {progress >= 1 ? '🎉 ENCOMENDA ENTREGUE!' : 'CLEITON CHEGA EM:'}
          </Text>
          <View className="flex-row items-center justify-center gap-2">
            <View className="items-center">
              <View className="bg-card w-14 h-14 rounded-xl items-center justify-center border border-border">
                <Text className="text-white font-black text-2xl">{String(days).padStart(2, '0')}</Text>
              </View>
              <Text className="text-muted text-[10px] font-bold mt-1 uppercase">Dias</Text>
            </View>
            <Text className="text-muted text-xl font-bold pb-4">:</Text>
            <View className="items-center">
              <View className="bg-card w-14 h-14 rounded-xl items-center justify-center border border-border">
                <Text className="text-white font-black text-2xl">{String(hours).padStart(2, '0')}</Text>
              </View>
              <Text className="text-muted text-[10px] font-bold mt-1 uppercase">Hrs</Text>
            </View>
            <Text className="text-muted text-xl font-bold pb-4">:</Text>
            <View className="items-center">
              <View className="bg-card w-14 h-14 rounded-xl items-center justify-center border border-border">
                <Text className="text-white font-black text-2xl">{String(minutes).padStart(2, '0')}</Text>
              </View>
              <Text className="text-muted text-[10px] font-bold mt-1 uppercase">Min</Text>
            </View>
            <Text className="text-muted text-xl font-bold pb-4">:</Text>
            <View className="items-center">
              <View className="bg-card w-14 h-14 rounded-xl items-center justify-center border border-border">
                <Text className="text-neon font-black text-2xl">{String(seconds).padStart(2, '0')}</Text>
              </View>
              <Text className="text-neon text-[10px] font-bold mt-1 uppercase">Seg</Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="h-2 bg-surface rounded-full overflow-hidden mb-2">
          <View className="h-full bg-neon" style={{ width: `${progress * 100}%` }} />
        </View>
        <Text className="text-right text-xs text-muted font-bold mb-6">{Math.round(progress * 100)}% concluído</Text>

        {/* Status Text */}
        <View className="bg-surface border border-neon/30 p-4 rounded-xl mb-6">
          <Text className="text-neon font-bold text-xs uppercase mb-1">Status Atual</Text>
          <Text className="text-white font-black text-lg">{currentEvent.title}</Text>
          <Text className="text-muted text-sm mt-1">{currentEvent.description}</Text>
        </View>

        {/* Map */}
        <View className="flex-1 rounded-2xl overflow-hidden border border-border relative bg-card min-h-[300px]">
          <WebView
            source={{ uri: `https://www.openstreetmap.org/export/embed.html?bbox=${currentMapPosition.lng - 0.2}%2C${currentMapPosition.lat - 0.2}%2C${currentMapPosition.lng + 0.2}%2C${currentMapPosition.lat + 0.2}&layer=mapnik` }}
            className="flex-1 opacity-50"
            scrollEnabled={false}
          />
          {/* Centered Cleiton */}
          <View className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center pointer-events-none">
            <Text className="text-4xl">🏍️</Text>
          </View>

          {/* Coordinate Overlay */}
          <View className="absolute bottom-4 left-4 bg-background/90 p-2 rounded-lg border border-border">
            <Text className="text-[10px] text-neon font-bold uppercase">Sinal GPS</Text>
            <Text className="text-white text-xs font-bold">{currentMapPosition.lat.toFixed(4)}°, {currentMapPosition.lng.toFixed(4)}°</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
