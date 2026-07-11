import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { useIntentTracker } from '@/hooks/useIntentTracker';
import { useCartToast } from '@/contexts/CartToastContext';
import { useSheet } from '@/contexts/SheetContext';
import DopaminaLoading from '@/components/DopaminaLoading';

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
  const insets = useSafeAreaInsets();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { trackAddToCart } = useIntentTracker(product?.id, product?.sale_price);
  const { showCartToast } = useCartToast();
  const { setTabBarVisible } = useSheet();

  // Hide floating tab bar when focused on this screen, restore on blur
  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(false);
      return () => setTabBarVisible(true);
    }, [])
  );

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

  if (loading) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <DopaminaLoading />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 bg-background justify-center items-center" style={{ paddingTop: insets.top }}>
        <Text className="text-foreground">Produto não encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4"><Text className="text-neon">Voltar</Text></TouchableOpacity>
      </View>
    );
  }

  const numRating = Number(product.rating) || 5;
  const stars = '★'.repeat(Math.floor(numRating)) + (numRating % 1 >= 0.5 ? '★' : '');

  // Parallax title animations
  const nameInImageOpacity = scrollY.interpolate({
    inputRange: [0, 40, 100],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });
  const nameInImageTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [24, 0],
    extrapolate: 'clamp',
  });
  const nameBelowOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const nameBelowTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -16],
    extrapolate: 'clamp',
  });

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Floating glass back button over parallax */}
      <View style={{
        position: 'absolute',
        top: insets.top + 12,
        left: 16,
        zIndex: 10,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          style={{ borderRadius: 20, overflow: 'hidden' }}
        >
          <BlurView intensity={70} tint="light" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.55)',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.7)',
            paddingVertical: 8,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#09090b' }}>←</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView 
        className="flex-1"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View 
          className="relative w-full aspect-square bg-surface border-b border-border items-center justify-center overflow-hidden"
          style={{
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [-200, 0, 300],
                  outputRange: [-100, 0, 150],
                  extrapolate: 'clamp'
                })
              },
              {
                scale: scrollY.interpolate({
                  inputRange: [-200, 0],
                  outputRange: [2, 1],
                  extrapolateLeft: 'extend',
                  extrapolateRight: 'clamp'
                })
              }
            ]
          }}
        >
          <View className="absolute inset-0 bg-neon/10 rounded-full blur-3xl scale-75 pointer-events-none" />
          
          {!imageLoaded && product.image_url && (
            <View className="absolute inset-0 bg-muted/20 animate-pulse" />
          )}

          {product.image_url ? (
            <Image 
              source={{ uri: product.image_url }} 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
              contentFit="cover"
              transition={500}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <Text className="text-[160px] drop-shadow-2xl">{product.image}</Text>
          )}
          {product.discount > 0 && (
            <View className="absolute right-4 top-4 bg-pop px-3 py-1 rounded-full shadow-lg">
              <Text className="text-white font-black">-{product.discount}%</Text>
            </View>
          )}
          {/* Bottom vignette fade -> surface color */}
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 160,
            flexDirection: 'column',
          }}>
            {[0, 0.04, 0.1, 0.18, 0.3, 0.48, 0.68, 0.85, 0.94, 1].map((opacity, i) => (
              <View key={i} style={{ flex: 1, backgroundColor: `rgba(244,244,245,${opacity})` }} />
            ))}
          </View>

          {/* Product name overlaid on gradient - animates IN as user scrolls */}
          <Animated.View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingBottom: 16,
            opacity: nameInImageOpacity,
            transform: [{ translateY: nameInImageTranslateY }],
          }}>
            <Text style={{ color: '#09090b', fontWeight: '900', fontSize: 22, lineHeight: 26 }} numberOfLines={2}>{product.name}</Text>
          </Animated.View>
        </Animated.View>

        <View className="p-6">
          {/* stars + name below image - animates OUT together as user scrolls up */}
          <Animated.View style={{ opacity: nameBelowOpacity, transform: [{ translateY: nameBelowTranslateY }] }}>
            <View className="flex-row items-center gap-2 mb-3">
              <Text className="text-amber-400 font-bold">{stars}</Text>
              <Text className="text-neon font-black">{product.rating}</Text>
              <Text className="text-muted text-xs">({product.reviews} avaliações)</Text>
            </View>
            <Text className="text-foreground font-black text-3xl mb-4">{product.name}</Text>
          </Animated.View>

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
                  <Text className="text-foreground font-bold">{r.name}</Text>
                  <Text className="text-muted text-xs">{r.date}</Text>
                </View>
                <Text className="text-amber-400 text-xs mb-2">{'★'.repeat(r.rating)}</Text>
                <Text className="text-muted text-sm">{r.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: insets.bottom + 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.08)', flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity 
          className="flex-1 bg-neon py-4 rounded-2xl items-center shadow-[0_0_15px_rgba(124,58,237,0.4)]"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            addItem({
              id: product.id,
              slug: product.slug,
              name: product.name,
              shortName: product.short_name,
              image: product.image,
              localImage: product.image_url,
              originalPrice: product.price,
              salePrice: product.sale_price,
            });
            trackAddToCart();
            router.push('/checkout');
          }}
        >
          <Text className="font-black text-background text-lg">COMPRAR AGORA ⚡</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-surface border-2 border-neon w-16 h-16 rounded-2xl items-center justify-center"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            addItem({
              id: product.id,
              slug: product.slug,
              name: product.name,
              shortName: product.short_name,
              image: product.image,
              localImage: product.image_url,
              originalPrice: product.price,
              salePrice: product.sale_price,
            });
            trackAddToCart();
            showCartToast();
          }}
        >
          <Text className="text-2xl">🛒</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
