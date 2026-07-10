import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function OfertasScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(48 * 60 * 60 * 1000); // 48h static timer for demo
  const router = useRouter();

  useEffect(() => {
    async function fetchOffers() {
      const { data, error } = await supabase.from('products').select('*').gt('discount', 0).order('discount', { ascending: false });
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchOffers();

    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1000 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      className="flex-1 m-2 rounded-3xl border border-border bg-card overflow-hidden"
      onPress={() => router.push(`/produto/${item.id}`)}
      activeOpacity={0.9}
    >
      <View className="w-full aspect-square relative bg-surface p-4 items-center justify-center">
        {item.local_image ? (
          <Image source={{ uri: `https://raw.githubusercontent.com/dividebyzeroex/dopaminaLand/main/dopamina-brasil/public${item.local_image}` }} className="w-full h-full" resizeMode="contain" />
        ) : (
          <Text className="text-6xl">{item.image}</Text>
        )}
        <View className="absolute top-2 right-2 bg-pop px-2 py-1 rounded-full animate-bounce">
          <Text className="text-white font-black text-xs">-{item.discount}%</Text>
        </View>
      </View>
      <View className="p-4 items-center">
        <Text className="text-foreground font-black text-center mb-2" numberOfLines={2}>{item.name}</Text>
        <Text className="text-muted line-through text-xs">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
        <Text className="text-neon font-black text-xl">R$ {item.sale_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
      </View>
    </TouchableOpacity>
  );

  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-foreground text-2xl font-bold">←</Text>
        </TouchableOpacity>
        <Text className="text-pop font-black text-2xl ml-4">🔥 DELÍRIO</Text>
      </View>

      <View className="p-6 items-center">
        <Text className="text-white font-bold text-lg mb-4 text-center">Esses preços vão desaparecer em:</Text>
        <View className="flex-row gap-2">
          <View className="bg-surface border border-pop/30 p-4 rounded-xl items-center w-20">
            <Text className="text-pop font-black text-2xl">{String(hours).padStart(2, '0')}</Text>
            <Text className="text-muted text-[10px] font-bold mt-1 uppercase">Horas</Text>
          </View>
          <View className="bg-surface border border-pop/30 p-4 rounded-xl items-center w-20">
            <Text className="text-pop font-black text-2xl">{String(minutes).padStart(2, '0')}</Text>
            <Text className="text-muted text-[10px] font-bold mt-1 uppercase">Min</Text>
          </View>
          <View className="bg-surface border border-pop/30 p-4 rounded-xl items-center w-20">
            <Text className="text-pop font-black text-2xl">{String(seconds).padStart(2, '0')}</Text>
            <Text className="text-muted text-[10px] font-bold mt-1 uppercase">Seg</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#ff3366" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 8, paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}
