import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '@/contexts/CartContext';

export default function CartScreen() {
  const { items, removeItem, cartTotal, clearCart } = useCart();
  const router = useRouter();

  const renderItem = ({ item }: { item: any }) => (
    <View className="flex-row items-center bg-card border border-border rounded-2xl p-4 mb-4">
      <View className="w-16 h-16 bg-surface rounded-xl items-center justify-center relative overflow-hidden">
        {item.localImage ? (
          <Image source={{ uri: `https://raw.githubusercontent.com/dividebyzeroex/dopaminaLand/main/dopamina-brasil/public${item.localImage}` }} className="w-full h-full" resizeMode="contain" />
        ) : (
          <Text className="text-3xl">{item.image}</Text>
        )}
      </View>
      <View className="flex-1 ml-4">
        <Text className="text-foreground font-bold text-base" numberOfLines={1}>{item.shortName || item.name}</Text>
        <Text className="text-neon font-black text-sm mt-1">R$ {item.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
        <Text className="text-muted text-xs mt-1">Qtd: {item.quantity}</Text>
      </View>
      <TouchableOpacity 
        className="w-10 h-10 bg-surface items-center justify-center rounded-full ml-2 border border-border"
        onPress={() => removeItem(item.id)}
      >
        <Text className="text-muted font-bold text-lg">X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-foreground text-2xl font-bold">←</Text>
        </TouchableOpacity>
        <Text className="text-white font-black text-2xl flex-1">Seu Carrinho</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={clearCart}>
            <Text className="text-pop font-bold text-sm">Limpar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Cart Items */}
      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">🥺</Text>
          <Text className="text-foreground font-black text-2xl text-center">O Cleiton está triste.</Text>
          <Text className="text-muted text-center mt-2">Sua sacola está vazia.</Text>
          <TouchableOpacity 
            className="mt-8 bg-neon px-8 py-4 rounded-full"
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
            renderItem={renderItem}
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
              className="bg-neon py-4 rounded-2xl items-center shadow-[0_0_15px_rgba(204,255,0,0.4)]"
              onPress={() => {
                clearCart();
                alert('A simulação de checkout será implementada na Fase 3!');
              }}
            >
              <Text className="font-black text-background text-lg">FINALIZAR COMPRA ⚡</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
