import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useCart, CartItem } from '@/contexts/CartContext';

export default function HomeScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addItem, items } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*');
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const totalItems = items.reduce((acc, i) => acc + (i.quantity || 1), 0);

  const renderItem = ({ item }: { item: any }) => (
    <View className="flex-1 m-2 rounded-3xl border border-border bg-card overflow-hidden">
      <View className="w-full aspect-square relative bg-surface p-4 items-center justify-center">
        {item.local_image ? (
          <Image source={{ uri: `https://raw.githubusercontent.com/dividebyzeroex/dopaminaLand/main/dopamina-brasil/public${item.local_image}` }} className="w-full h-full" resizeMode="contain" />
        ) : (
          <Text className="text-6xl">{item.image}</Text>
        )}
        {item.discount > 0 && (
          <View className="absolute top-2 right-2 bg-pop px-2 py-1 rounded-full">
            <Text className="text-white font-black text-xs">-{item.discount}%</Text>
          </View>
        )}
      </View>
      <View className="p-4">
        <Text className="text-foreground font-black text-lg line-clamp-1" numberOfLines={1}>{item.short_name || item.name}</Text>
        <Text className="text-neon font-black text-xl mt-1">R$ {item.sale_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
        
        <TouchableOpacity 
          className="mt-4 bg-neon py-3 rounded-xl items-center"
          onPress={() => addItem({
            id: item.id,
            slug: item.slug,
            name: item.name,
            shortName: item.short_name,
            image: item.image,
            localImage: item.local_image,
            originalPrice: item.price,
            salePrice: item.sale_price,
          })}
        >
          <Text className="font-black text-background">COMPRAR ⚡</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-border">
        <Text className="text-white font-black text-2xl">Dopamina<Text className="text-neon">.</Text></Text>
        <TouchableOpacity onPress={() => router.push('/cart')} className="relative">
          <Text className="text-2xl">🛒</Text>
          {totalItems > 0 && (
            <View className="absolute -top-2 -right-2 bg-pop rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-[10px] font-bold">{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <View className="m-4 bg-purple rounded-3xl p-6 items-center justify-center">
        <Text className="text-white font-black text-xl text-center">DELÍRIO DE OFERTAS 🔥</Text>
        <Text className="text-white/80 text-center text-sm mt-2">Preços derretidos na sua tela</Text>
      </View>

      {/* Product List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ccff00" />
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
