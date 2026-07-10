import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';

const fakeReviews = [
  { name: 'Maria S.', rating: 5, text: 'Melhor compra que já fiz! Não paguei nada e recebi nada. 10/10 recomendo! ⚡', date: '3 dias atrás' },
  { name: 'João P.', rating: 5, text: 'Chegou em perfeito estado de inexistência. Produto fictício de altíssima qualidade.', date: '1 semana atrás' },
  { name: 'Carlos M.', rating: 5, text: 'Faz 3 dias que estou tentando parar de comprar. Não consigo. Socorro.', date: '1 mês atrás' },
  { name: 'Fernanda R.', rating: 5, text: 'Comprei 47 unidades. Meu psicólogo está preocupado.', date: '2 meses atrás' },
];

export default function ProductPage() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      // Find product by slug or ID
      const { data, error } = await supabase.from('products').select('*').eq('id', slug).single();
      if (!error && data) {
        setProduct(data);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    
    // Telemetry: view_item
    const sessionId = 'mobile-session-' + Date.now();
    supabase.from('intent_events').insert([{
      session_id: sessionId,
      event_type: 'view_item',
      product_id: product.id,
      price: product.sale_price,
      metadata: { source: 'mobile_product_page', slug: product.slug }
    }]).then(() => {});

    // Telemetry: dwell_time_exceeded (15s)
    const timer = setTimeout(() => {
      supabase.from('intent_events').insert([{
        session_id: sessionId,
        event_type: 'dwell_time_exceeded',
        product_id: product.id,
        price: product.sale_price,
        metadata: { source: 'mobile_product_page', slug: product.slug, time_spent: 15 }
      }]).then(() => {});
    }, 15000);

    return () => clearTimeout(timer);
  }, [product]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator color="#ccff00" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-white">Produto não encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4"><Text className="text-neon">Voltar</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  const numRating = Number(product.rating) || 5;
  const stars = '★'.repeat(Math.floor(numRating)) + (numRating % 1 >= 0.5 ? '★' : '');

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-6 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-foreground text-2xl font-bold">←</Text>
        </TouchableOpacity>
        <Text className="text-muted ml-4 truncate font-bold text-sm" numberOfLines={1}>{product.short_name || product.name}</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="relative w-full aspect-square bg-surface border-b border-border items-center justify-center p-8">
          <View className="absolute inset-0 bg-neon/10 rounded-full blur-3xl scale-75 pointer-events-none" />
          {product.local_image ? (
            <Image source={{ uri: `https://raw.githubusercontent.com/dividebyzeroex/dopaminaLand/main/dopamina-brasil/public${product.local_image}` }} className="w-full h-full drop-shadow-2xl" resizeMode="contain" />
          ) : (
            <Text className="text-[160px] drop-shadow-2xl">{product.image}</Text>
          )}
          {product.discount > 0 && (
            <View className="absolute right-4 top-4 bg-pop px-3 py-1 rounded-full shadow-lg">
              <Text className="text-white font-black">-{product.discount}%</Text>
            </View>
          )}
        </View>

        <View className="p-6">
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-amber-400 font-bold">{stars}</Text>
            <Text className="text-neon font-black">{product.rating}</Text>
            <Text className="text-muted text-xs">({product.reviews} avaliações)</Text>
          </View>

          <Text className="text-foreground font-black text-3xl mb-4">{product.name}</Text>

          <View className="bg-surface-light p-6 rounded-2xl border border-border mb-6">
            <Text className="text-muted line-through">De R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
            <Text className="text-neon font-black text-4xl my-1">R$ {product.sale_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
            <Text className="text-muted text-xs mb-4">em até 4x sem juros no cartão imaginário 💳</Text>
            
            <View className="bg-neon-green/10 border border-neon-green/20 rounded-xl p-3 flex-row items-center">
              <Text className="text-neon-green font-bold text-lg mr-2">✓</Text>
              <Text className="text-neon-green font-bold text-xs flex-1">Preço final no checkout: R$ 0,00 (como tudo aqui)</Text>
            </View>
          </View>

          <Text className="text-muted text-sm leading-6 mb-8">{product.description}</Text>

          <Text className="text-foreground font-black text-xl mb-4">Avaliações de Clientes (100% Falsas)</Text>
          <View className="space-y-4 gap-4 mb-10">
            {fakeReviews.map((r, i) => (
              <View key={i} className="bg-surface p-4 rounded-xl border border-border">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-white font-bold">{r.name}</Text>
                  <Text className="text-muted text-xs">{r.date}</Text>
                </View>
                <Text className="text-amber-400 text-xs mb-2">{'★'.repeat(r.rating)}</Text>
                <Text className="text-muted text-sm">{r.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View className="p-6 bg-card border-t border-border flex-row gap-4">
        <TouchableOpacity 
          className="flex-1 bg-neon py-4 rounded-2xl items-center shadow-[0_0_15px_rgba(204,255,0,0.4)]"
          onPress={() => {
            addItem({
              id: product.id,
              slug: product.slug,
              name: product.name,
              shortName: product.short_name,
              image: product.image,
              localImage: product.local_image,
              originalPrice: product.price,
              salePrice: product.sale_price,
            });
            supabase.from('intent_events').insert([{
              session_id: 'mobile-session-' + Date.now(),
              event_type: 'add_to_cart',
              product_id: product.id,
              price: product.sale_price,
              metadata: { source: 'mobile_product_page_buy' }
            }]).then(() => {});
            router.push('/checkout');
          }}
        >
          <Text className="font-black text-background text-lg">COMPRAR AGORA ⚡</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-surface border-2 border-neon w-16 h-16 rounded-2xl items-center justify-center"
          onPress={() => {
            addItem({
              id: product.id,
              slug: product.slug,
              name: product.name,
              shortName: product.short_name,
              image: product.image,
              localImage: product.local_image,
              originalPrice: product.price,
              salePrice: product.sale_price,
            });
            supabase.from('intent_events').insert([{
              session_id: 'mobile-session-' + Date.now(),
              event_type: 'add_to_cart',
              product_id: product.id,
              price: product.sale_price,
              metadata: { source: 'mobile_product_page_add' }
            }]).then(() => {});
            alert('Adicionado ao carrinho!');
          }}
        >
          <Text className="text-2xl">🛒</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
